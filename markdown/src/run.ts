import { requireTenant } from "@dyogas/kernel";
import { createMemoryAuditSink, requireTrustIdentity, type AuditSink } from "@dyogas/trust";
import { admitRun, startRun, succeed, type RuntimeRun } from "@dyogas/runtime";
import {
  bindContract,
  emitCandidate,
  type AgentContractBinding,
  type CandidateArtifact,
} from "@dyogas/agent-sdk";
import type { MarkdownHandoffContract } from "@dyogas/knowledge-engine";
import {
  normalizeHandoff,
  type Citation,
  type MarkdownHandoffInput,
  MarkdownError,
} from "./input.js";
import { buildReviewReadyMarkdown } from "./render.js";

export type MarkdownSource = MarkdownHandoffContract | MarkdownHandoffInput;

export interface MarkdownRenderResult {
  readonly handoff: MarkdownHandoffInput;
  readonly markdownBody: string;
  readonly citations: readonly Citation[];
  readonly binding: AgentContractBinding;
  readonly candidate: CandidateArtifact;
  readonly run: RuntimeRun;
  readonly audit: AuditSink;
}

export interface RenderMarkdownOptions {
  readonly handoff: MarkdownSource;
  readonly citations?: readonly Citation[];
  readonly audit?: AuditSink;
}

function toInput(source: MarkdownSource): MarkdownHandoffInput {
  return normalizeHandoff({
    title: source.title,
    body: source.body,
    knowledgeId: source.knowledgeId,
    tenantId: source.tenantId,
    version: source.version,
  });
}

/**
 * Consume Knowledge markdown handoff → review-ready body + unsealed candidate.
 * No SoR writes. No seal. Tenancy required.
 */
export function renderMarkdownCandidate(
  opts: RenderMarkdownOptions,
): MarkdownRenderResult {
  requireTenant();
  requireTrustIdentity();
  const audit = opts.audit ?? createMemoryAuditSink();
  const handoff = toInput(opts.handoff);
  const citations = Object.freeze([...(opts.citations ?? [])]);

  const ctx = requireTenant();
  if (ctx.tenantId !== handoff.tenantId) {
    throw new MarkdownError(
      `tenant mismatch: context=${ctx.tenantId} handoff=${handoff.tenantId}`,
    );
  }

  const binding = bindContract({
    agentId: "markdown-agent",
    contractVersion: "1.0.0",
    allowedSkills: ["markdown-builder", "citation-builder"],
    satisfiedPreconditions: ["tenancy_present"],
  });

  let run = admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: `${binding.agentId}@${binding.contractVersion}`,
    audit,
  });
  run = startRun(run);

  const markdownBody = buildReviewReadyMarkdown(handoff, citations);

  const candidate = emitCandidate(binding, {
    artifactType: "knowledge/markdown",
    tenantId: handoff.tenantId,
    payload: {
      knowledge_id: handoff.knowledgeId,
      version: handoff.version,
      title: handoff.title,
      body: markdownBody,
      citations: citations.map((c) => ({
        key: c.key,
        source: c.source,
        excerpt: c.excerpt,
      })),
    },
  });

  if (candidate.sealed !== false) {
    throw new MarkdownError("candidate must remain unsealed");
  }

  audit.append({
    type: "markdown.candidate.emitted",
    knowledge_id: handoff.knowledgeId,
    artifact_id: candidate.artifactId,
    artifact_type: candidate.artifactType,
  });

  run = succeed(run);

  return {
    handoff,
    markdownBody,
    citations,
    binding,
    candidate,
    run,
    audit,
  };
}
