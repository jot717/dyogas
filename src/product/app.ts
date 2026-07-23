import { generateId, getClock, clear, createTenantId, createTenancyContext, propagate } from "@dyogas/kernel";
import { createMemoryAuditSink, requireTrustIdentity } from "@dyogas/trust";
import { buildKnowledgeHandoff } from "@dyogas/research-engine";
import {
  applyApprovedKnowledge,
  createMemoryKnowledgeSoR,
} from "@dyogas/knowledge-engine";
import { runGraphEngine } from "@dyogas/graph-engine";
import { jinaReadUrl } from "../external/jina.js";
import { geminiAskGrounded, geminiExtractAndSummarize } from "../external/gemini.js";
import { supabaseUpsert } from "../external/supabase.js";
import { env } from "../env.js";
import {
  loadSnapshot,
  saveSnapshot,
  listWorkspaceIds,
  type BrainSnapshot,
  type PendingCapture,
  type StoredKnowledge,
  type AskProposal,
  type AskEvidence,
} from "../persist/file-store.js";
import { buildMarkdownArtifact } from "../knowledge/markdown-artifact.js";
import { PersonalBrainError, createWorkspace, type UserWorkspace } from "../workspace.js";
import {
  createPersonalIndex,
  cosineSimilarity,
  keywordScore,
  type PersonalIndex,
} from "../index-store.js";
import { buildLocalEmbeddingJob } from "@dyogas/graph-engine";

export interface ProductSession {
  readonly userId: string;
  readonly displayName: string;
  readonly workspace: UserWorkspace;
}

function ensureTenancy(tenantId: string): void {
  clear();
  propagate(createTenancyContext(createTenantId(tenantId)));
  requireTrustIdentity();
}

function queryVector(text: string): number[] {
  const job = buildLocalEmbeddingJob({
    sources: [
      {
        artifactId: "q",
        artifactVersion: "1",
        artifactType: "Knowledge",
        title: "q",
        body: text,
      },
    ],
  });
  return [...(job.vectors[0]?.values ?? [])];
}

/** Strip YAML frontmatter so proposals/excerpts stay human-readable. */
function stripFrontmatter(markdown: string): string {
  const m = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return (m?.[1] ?? markdown).trim();
}

function proposalExcerpt(markdown: string, max = 280): string {
  const body = stripFrontmatter(markdown).replace(/\s+/g, " ").trim();
  return body.length <= max ? body : `${body.slice(0, max)}…`;
}

export class PersonalBrainProduct {
  private snap: BrainSnapshot;
  private readonly index: PersonalIndex;
  private readonly sor = createMemoryKnowledgeSoR();

  private constructor(snap: BrainSnapshot, index: PersonalIndex) {
    this.snap = snap;
    this.index = index;
  }

  static openOrCreate(opts: {
    userId: string;
    displayName: string;
    workspaceId?: string;
  }): PersonalBrainProduct {
    ensureTenancy(opts.userId);
    let snap: BrainSnapshot | null = null;
    if (opts.workspaceId) snap = loadSnapshot(opts.workspaceId);
    if (!snap) {
      for (const id of listWorkspaceIds()) {
        const s = loadSnapshot(id);
        if (s?.ownerUserId === opts.userId) {
          snap = s;
          break;
        }
      }
    }
    if (!snap) {
      const ws = createWorkspace({
        ownerUserId: opts.userId,
        displayName: opts.displayName,
      });
      snap = {
        workspaceId: ws.workspaceId,
        ownerUserId: ws.ownerUserId,
        displayName: ws.displayName,
        tenantId: ws.tenantId,
        pending: [],
        knowledge: [],
        askProposals: [],
      };
      saveSnapshot(snap);
    }
    const index = createPersonalIndex();
    const product = new PersonalBrainProduct(snap, index);
    product.reindex();
    return product;
  }

  get workspace(): UserWorkspace {
    return {
      workspaceId: this.snap.workspaceId,
      ownerUserId: this.snap.ownerUserId,
      tenantId: this.snap.tenantId,
      displayName: this.snap.displayName,
      createdAt: this.snap.knowledge[0]?.createdAt ?? getClock().nowIso(),
    };
  }

  private persist(): void {
    saveSnapshot(this.snap);
  }

  private reindex(): void {
    for (const k of this.snap.knowledge) {
      const values = queryVector(`${k.title}\n${k.markdown}`);
      this.index.add({
        knowledgeId: k.knowledgeId,
        version: k.version,
        title: k.title,
        body: k.markdown,
        captureId: k.knowledgeId,
        source: {
          kind: k.source.startsWith("http") ? "url" : "text",
          capturedAt: k.createdAt,
          url: k.source.startsWith("http") ? k.source : undefined,
          titleHint: k.title,
        },
        vector: values,
      });
    }
  }

  overview() {
    return {
      workspaceId: this.snap.workspaceId,
      displayName: this.snap.displayName,
      knowledgeCount: this.snap.knowledge.length,
      pendingCount: this.snap.pending.filter((p) => p.status === "pending").length,
      recent: this.snap.knowledge.slice(-5).reverse(),
    };
  }

  listKnowledge(): readonly StoredKnowledge[] {
    return this.snap.knowledge;
  }

  /** Keyword search over title, markdown, tags, source (product-layer retrieval). */
  searchKnowledge(query: string): readonly StoredKnowledge[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.listKnowledge();
    const tokens = q.split(/\s+/).filter(Boolean);
    return this.snap.knowledge.filter((k) => {
      const hay = `${k.title}\n${k.markdown}\n${k.tags.join(" ")}\n${k.source}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }

  getKnowledge(id: string): StoredKnowledge | undefined {
    return this.snap.knowledge.find((k) => k.knowledgeId === id);
  }

  listPending(): readonly PendingCapture[] {
    return this.snap.pending.filter((p) => p.status === "pending");
  }

  async capture(input: {
    kind: "text" | "url" | "document";
    text?: string;
    url?: string;
    title?: string;
    filename?: string;
  }): Promise<PendingCapture> {
    ensureTenancy(this.snap.tenantId);
    const now = getClock().nowIso();
    let rawTitle = (input.title ?? "").trim();
    let rawBody = "";
    let sourceUrl: string | undefined;

    if (input.kind === "text") {
      rawBody = (input.text ?? "").trim();
      if (!rawBody) throw new PersonalBrainError("text required");
      rawTitle = rawTitle || rawBody.slice(0, 60);
    } else if (input.kind === "url") {
      sourceUrl = (input.url ?? "").trim();
      if (!sourceUrl) throw new PersonalBrainError("url required");
      if (env("JINA_API_KEY")) {
        rawBody = await jinaReadUrl(sourceUrl);
      } else {
        rawBody = `Source URL: ${sourceUrl}\n\n(JINA_API_KEY missing — metadata only)`;
      }
      rawTitle = rawTitle || sourceUrl;
    } else {
      // document placeholder — accept pasted text as document body
      rawBody = (input.text ?? "").trim();
      if (!rawBody) {
        throw new PersonalBrainError(
          "document upload placeholder: paste document text (binary upload later)",
        );
      }
      rawTitle = rawTitle || input.filename || "Uploaded document";
    }

    let processed = {
      title: rawTitle,
      summary: rawBody.slice(0, 240),
      tags: ["inbox"] as string[],
      markdownBody: `# ${rawTitle}\n\n${rawBody}`,
    };
    if (env("GEMINI_API_KEY")) {
      try {
        processed = await geminiExtractAndSummarize({
          titleHint: rawTitle,
          body: rawBody,
          sourceUrl,
        });
      } catch {
        // Keep local heuristic extract on Gemini outage (503/etc.)
      }
    }

    const pending: PendingCapture = {
      id: generateId(),
      workspaceId: this.snap.workspaceId,
      ownerUserId: this.snap.ownerUserId,
      kind: input.kind,
      sourceUrl,
      rawTitle,
      rawBody,
      title: processed.title,
      summary: processed.summary,
      tags: processed.tags,
      markdownBody: processed.markdownBody,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.snap = {
      ...this.snap,
      pending: [...this.snap.pending, pending],
    };
    this.persist();
    void supabaseUpsert("pending_captures", {
      id: pending.id,
      workspace_id: pending.workspaceId,
      title: pending.title,
      status: pending.status,
      created_at: pending.createdAt,
    });
    return pending;
  }

  async approve(pendingId: string): Promise<StoredKnowledge> {
    ensureTenancy(this.snap.tenantId);
    const pending = this.snap.pending.find((p) => p.id === pendingId);
    if (!pending || pending.status !== "pending") {
      throw new PersonalBrainError("pending capture not found");
    }

    const source = pending.sourceUrl ?? `capture:${pending.kind}`;
    const { markdown, meta } = buildMarkdownArtifact({
      title: pending.title,
      bodyMarkdown: pending.markdownBody,
      source,
      tags: pending.tags,
      links: pending.sourceUrl ? [pending.sourceUrl] : [],
    });

    const artifactId = `personal-capture:${pending.id}`;
    const handoff = buildKnowledgeHandoff({
      taskId: `pb-${pending.id}`,
      tenantId: this.snap.tenantId,
      researchArtifactId: artifactId,
      evidenceIds: [`ev-${pending.id}`],
    });

    const applied = applyApprovedKnowledge({
      handoff,
      content: { title: meta.title, body: markdown },
      approval: {
        decision: "approved",
        researchArtifactId: artifactId,
        note: `personal-brain approve ${pending.id}`,
      },
      sor: this.sor,
      audit: createMemoryAuditSink(),
    });

    const graph = await runGraphEngine({ knowledge: applied.item });
    const linkIds = graph.graphUpdate.nodes.slice(0, 5).map((n) => n.node_id);

    const stored: StoredKnowledge = {
      knowledgeId: applied.item.knowledgeId,
      workspaceId: this.snap.workspaceId,
      title: meta.title,
      markdown,
      summary: pending.summary,
      tags: meta.tags,
      source: meta.source,
      createdAt: meta.createdAt,
      links: [...meta.links, ...linkIds],
      version: applied.item.version,
    };

    const values =
      graph.embedding.vectors[0]?.values ??
      queryVector(`${stored.title}\n${stored.markdown}`);

    this.index.add({
      knowledgeId: stored.knowledgeId,
      version: stored.version,
      title: stored.title,
      body: stored.markdown,
      captureId: pending.id,
      source: {
        kind: pending.kind === "url" ? "url" : "text",
        capturedAt: stored.createdAt,
        url: pending.sourceUrl,
        titleHint: stored.title,
      },
      vector: [...values],
    });

    this.snap = {
      ...this.snap,
      pending: this.snap.pending.map((p) =>
        p.id === pendingId
          ? { ...p, status: "approved" as const, updatedAt: getClock().nowIso() }
          : p,
      ),
      knowledge: [...this.snap.knowledge, stored],
    };
    this.persist();
    void supabaseUpsert("knowledge_artifacts", {
      id: stored.knowledgeId,
      workspace_id: stored.workspaceId,
      title: stored.title,
      markdown: stored.markdown,
      source: stored.source,
      tags: stored.tags,
      created_at: stored.createdAt,
    });
    return stored;
  }

  reject(pendingId: string): void {
    const pending = this.snap.pending.find((p) => p.id === pendingId);
    if (!pending || pending.status !== "pending") {
      throw new PersonalBrainError("pending capture not found");
    }
    this.snap = {
      ...this.snap,
      pending: this.snap.pending.map((p) =>
        p.id === pendingId
          ? { ...p, status: "rejected" as const, updatedAt: getClock().nowIso() }
          : p,
      ),
    };
    this.persist();
  }

  getAskProposal(id: string): AskProposal | undefined {
    return this.snap.askProposals.find((p) => p.id === id);
  }

  /**
   * Propose an answer — never finalizes. Owner must approve/edit/reject.
   */
  async ask(question: string): Promise<AskProposal> {
    ensureTenancy(this.snap.tenantId);
    const q = question.trim();
    if (!q) throw new PersonalBrainError("question required");
    const now = getClock().nowIso();
    const qVec = queryVector(q);
    const scored = this.index.list().map((item) => {
      const score =
        cosineSimilarity(qVec, item.vector) * 0.65 + keywordScore(q, item) * 0.35;
      return { item, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const top = scored.filter((s) => s.score > 0).slice(0, 4);

    const evidence: AskEvidence[] = top.map((t) => ({
      knowledgeId: t.item.knowledgeId,
      title: t.item.title,
      excerpt: proposalExcerpt(t.item.body),
    }));

    const contexts = evidence.map((e) => ({
      id: e.knowledgeId,
      title: e.title,
      excerpt: e.excerpt,
    }));

    let proposedAnswer: string;
    if (contexts.length === 0) {
      proposedAnswer =
        "No related personal knowledge found. Capture and approve notes first, then ask again.";
    } else if (env("GEMINI_API_KEY")) {
      try {
        proposedAnswer = await geminiAskGrounded({ question: q, contexts });
      } catch {
        proposedAnswer = [
          "Proposed answer (local fallback — review before approving):",
          "",
          `From ${contexts.length} related note(s):`,
          ...contexts.map(
            (c, i) => `${i + 1}. ${c.title}: ${c.excerpt.slice(0, 160)}`,
          ),
        ].join("\n");
      }
    } else {
      proposedAnswer = [
        "Proposed answer (local extract — review before approving):",
        "",
        `From ${contexts.length} related note(s):`,
        ...contexts.map(
          (c, i) => `${i + 1}. ${c.title}: ${c.excerpt.slice(0, 160)}`,
        ),
      ].join("\n");
    }

    const proposal: AskProposal = {
      id: generateId(),
      workspaceId: this.snap.workspaceId,
      ownerUserId: this.snap.ownerUserId,
      question: q,
      proposedAnswer,
      evidence,
      status: "proposed",
      createdAt: now,
      updatedAt: now,
    };
    this.snap = {
      ...this.snap,
      askProposals: [...(this.snap.askProposals ?? []), proposal],
    };
    this.persist();
    return proposal;
  }

  async approveAsk(
    proposalId: string,
    opts: { editedAnswer?: string; learn?: boolean } = {},
  ): Promise<AskProposal> {
    ensureTenancy(this.snap.tenantId);
    const proposal = this.snap.askProposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "proposed") {
      throw new PersonalBrainError("ask proposal not found or already decided");
    }
    const edited = (opts.editedAnswer ?? "").trim();
    const finalAnswer = edited || proposal.proposedAnswer;
    const editedFlag = Boolean(edited && edited !== proposal.proposedAnswer);
    const now = getClock().nowIso();

    let learnedKnowledgeId: string | undefined;
    let learnApplied = false;
    if (opts.learn) {
      const stored = await this.storeLearnedFromAsk({
        proposalId: proposal.id,
        question: proposal.question,
        answer: finalAnswer,
        evidence: proposal.evidence,
      });
      learnedKnowledgeId = stored.knowledgeId;
      learnApplied = true;
    }

    const updated: AskProposal = {
      ...proposal,
      finalAnswer,
      status: editedFlag ? "edited" : "approved",
      learnApplied,
      learnedKnowledgeId,
      updatedAt: now,
    };
    this.snap = {
      ...this.snap,
      askProposals: this.snap.askProposals.map((p) =>
        p.id === proposalId ? updated : p,
      ),
    };
    this.persist();
    return updated;
  }

  rejectAsk(proposalId: string): AskProposal {
    const proposal = this.snap.askProposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== "proposed") {
      throw new PersonalBrainError("ask proposal not found or already decided");
    }
    const updated: AskProposal = {
      ...proposal,
      status: "rejected",
      updatedAt: getClock().nowIso(),
    };
    this.snap = {
      ...this.snap,
      askProposals: this.snap.askProposals.map((p) =>
        p.id === proposalId ? updated : p,
      ),
    };
    this.persist();
    return updated;
  }

  private async storeLearnedFromAsk(input: {
    proposalId: string;
    question: string;
    answer: string;
    evidence: readonly AskEvidence[];
  }): Promise<StoredKnowledge> {
    const title = `Ask learning: ${input.question.slice(0, 80)}`;
    const bodyMarkdown = [
      `# ${title}`,
      "",
      "## Question",
      "",
      input.question,
      "",
      "## Approved answer",
      "",
      input.answer,
      "",
      "## Evidence",
      "",
      ...input.evidence.map(
        (e) => `- ${e.title} (\`${e.knowledgeId}\`)`,
      ),
    ].join("\n");
    const source = `ask:${input.proposalId}`;
    const { markdown, meta } = buildMarkdownArtifact({
      title,
      bodyMarkdown,
      source,
      tags: ["ask", "learned"],
      links: input.evidence.map((e) => e.knowledgeId),
    });

    const artifactId = `personal-ask:${input.proposalId}`;
    const handoff = buildKnowledgeHandoff({
      taskId: `pb-ask-${input.proposalId}`,
      tenantId: this.snap.tenantId,
      researchArtifactId: artifactId,
      evidenceIds: input.evidence.map((e) => e.knowledgeId),
    });

    const applied = applyApprovedKnowledge({
      handoff,
      content: { title: meta.title, body: markdown },
      approval: {
        decision: "approved",
        researchArtifactId: artifactId,
        note: `personal-brain ask learn ${input.proposalId}`,
      },
      sor: this.sor,
      audit: createMemoryAuditSink(),
    });

    const graph = await runGraphEngine({ knowledge: applied.item });
    const linkIds = graph.graphUpdate.nodes.slice(0, 5).map((n) => n.node_id);

    const stored: StoredKnowledge = {
      knowledgeId: applied.item.knowledgeId,
      workspaceId: this.snap.workspaceId,
      title: meta.title,
      markdown,
      summary: input.answer.slice(0, 240),
      tags: meta.tags,
      source: meta.source,
      createdAt: meta.createdAt,
      links: [...meta.links, ...linkIds],
      version: applied.item.version,
    };

    const values =
      graph.embedding.vectors[0]?.values ??
      queryVector(`${stored.title}\n${stored.markdown}`);

    this.index.add({
      knowledgeId: stored.knowledgeId,
      version: stored.version,
      title: stored.title,
      body: stored.markdown,
      captureId: input.proposalId,
      source: {
        kind: "text",
        capturedAt: stored.createdAt,
        titleHint: stored.title,
      },
      vector: [...values],
    });

    this.snap = {
      ...this.snap,
      knowledge: [...this.snap.knowledge, stored],
    };
    void supabaseUpsert("knowledge_artifacts", {
      id: stored.knowledgeId,
      workspace_id: stored.workspaceId,
      title: stored.title,
      markdown: stored.markdown,
      source: stored.source,
      tags: stored.tags,
      created_at: stored.createdAt,
    });
    return stored;
  }
}
