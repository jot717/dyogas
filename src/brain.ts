import { createMemoryAuditSink, requireTrustIdentity, type AuditSink } from "@dyogas/trust";
import { buildKnowledgeHandoff } from "@dyogas/research-engine";
import {
  applyApprovedKnowledge,
  createMemoryKnowledgeSoR,
  type KnowledgeSoR,
} from "@dyogas/knowledge-engine";
import { runGraphEngine } from "@dyogas/graph-engine";
import {
  normalizeCapture,
  type CaptureInput,
  type NormalizedCapture,
  type SourceMetadata,
} from "./capture.js";
import {
  assertWorkspaceBoundary,
  createWorkspace,
  PersonalBrainError,
  type UserWorkspace,
} from "./workspace.js";
import { createPersonalIndex, fromKnowledge, type PersonalIndex } from "./index-store.js";
import { askMyBrain, type BrainAnswer } from "./ask.js";

export interface CaptureResult {
  readonly capture: NormalizedCapture;
  readonly knowledgeId: string;
  readonly version: number;
  readonly source: SourceMetadata;
}

export interface PersonalBrain {
  readonly workspace: UserWorkspace;
  capture(input: CaptureInput, actorUserId: string): Promise<CaptureResult>;
  ask(query: string, actorUserId: string): BrainAnswer;
  list(actorUserId: string): readonly {
    knowledgeId: string;
    title: string;
    sourceKind: string;
  }[];
}

/**
 * Personal Second Brain façade — product orchestration only.
 * SoR writes go through Knowledge Engine; graph/embed via Graph Engine.
 */
export function createPersonalBrain(opts: {
  readonly ownerUserId: string;
  readonly displayName: string;
  readonly sor?: KnowledgeSoR;
  readonly index?: PersonalIndex;
  readonly audit?: AuditSink;
}): PersonalBrain {
  requireTrustIdentity();
  const workspace = createWorkspace({
    ownerUserId: opts.ownerUserId,
    displayName: opts.displayName,
  });
  const sor = opts.sor ?? createMemoryKnowledgeSoR();
  const index = opts.index ?? createPersonalIndex();
  const audit = opts.audit ?? createMemoryAuditSink();

  return {
    workspace,

    async capture(input, actorUserId) {
      assertWorkspaceBoundary(workspace, actorUserId);
      let capture: NormalizedCapture;
      try {
        capture = normalizeCapture(input);
      } catch (err) {
        throw new PersonalBrainError(err instanceof Error ? err.message : String(err));
      }

      const artifactId = `personal-capture:${capture.captureId}`;
      const handoff = buildKnowledgeHandoff({
        taskId: `pb-${capture.captureId}`,
        tenantId: workspace.tenantId,
        researchArtifactId: artifactId,
        evidenceIds: [capture.evidenceId],
      });

      const applied = applyApprovedKnowledge({
        handoff,
        content: { title: capture.title, body: capture.body },
        approval: {
          decision: "approved",
          researchArtifactId: artifactId,
          note: `personal-brain owner capture by ${actorUserId}`,
        },
        sor,
        audit,
      });

      const graph = await runGraphEngine({
        knowledge: applied.item,
        audit,
      });

      const vec = graph.embedding.vectors[0];
      if (!vec) {
        throw new PersonalBrainError("embedding vector missing after graph path");
      }

      index.add(
        fromKnowledge(applied.item, capture.source, capture.captureId, vec),
      );

      audit.append({
        type: "personal_brain.captured",
        workspace_id: workspace.workspaceId,
        knowledge_id: applied.item.knowledgeId,
        capture_kind: capture.source.kind,
      });

      return {
        capture,
        knowledgeId: applied.item.knowledgeId,
        version: applied.item.version,
        source: capture.source,
      };
    },

    ask(query, actorUserId) {
      assertWorkspaceBoundary(workspace, actorUserId);
      const answer = askMyBrain(index, query);
      audit.append({
        type: "personal_brain.ask",
        workspace_id: workspace.workspaceId,
        hits: String(answer.hits.length),
      });
      return answer;
    },

    list(actorUserId) {
      assertWorkspaceBoundary(workspace, actorUserId);
      return index.list().map((i) => ({
        knowledgeId: i.knowledgeId,
        title: i.title,
        sourceKind: i.source.kind,
      }));
    },
  };
}
