/**
 * Evidence ingestion adapter — Research Agent evidence → Knowledge draft package.
 * Does not write SoR (ADR-0005 / Art. X). Human approval remains mandatory.
 */

import {
  buildKnowledgeHandoff,
  createPendingApprovalHandoff,
  type EvidenceItem,
  type HumanApprovalHandoff,
  type KnowledgeHandoffContract,
} from "@dyogas/research-engine";

export class EvidenceIngestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceIngestError";
  }
}

export interface ResearchEvidenceIngestInput {
  readonly taskId: string;
  readonly tenantId: string;
  readonly researchArtifactId: string;
  readonly evidence: readonly EvidenceItem[];
  /** Optional human-facing question / title seed. */
  readonly question?: string;
}

export interface EvidenceIngestPackage {
  readonly handoff: KnowledgeHandoffContract;
  readonly content: { readonly title: string; readonly body: string };
  readonly pendingApproval: HumanApprovalHandoff;
  readonly evidenceIds: readonly string[];
}

/**
 * Map verified Research evidence into a Knowledge handoff + draft content package.
 * Fail-closed if evidence list is empty or ids/pointers are missing.
 */
export function ingestResearchEvidence(
  input: ResearchEvidenceIngestInput,
): EvidenceIngestPackage {
  if (!input.taskId.trim()) {
    throw new EvidenceIngestError("taskId required");
  }
  if (!input.tenantId.trim()) {
    throw new EvidenceIngestError("tenantId required");
  }
  if (!input.researchArtifactId.trim()) {
    throw new EvidenceIngestError("researchArtifactId required");
  }
  if (input.evidence.length < 1) {
    throw new EvidenceIngestError("at least one evidence item required");
  }

  const evidenceIds: string[] = [];
  const bodyParts: string[] = [];

  for (const item of input.evidence) {
    if (!item.evidenceId.trim()) {
      throw new EvidenceIngestError("evidenceId required on every item");
    }
    if (!item.metadata.pointer.trim()) {
      throw new EvidenceIngestError(`pointer required for ${item.evidenceId}`);
    }
    if (!item.excerpt.trim()) {
      throw new EvidenceIngestError(`excerpt required for ${item.evidenceId}`);
    }
    evidenceIds.push(item.evidenceId);
    bodyParts.push(
      [
        `## ${item.metadata.title || item.evidenceId}`,
        `evidenceId: ${item.evidenceId}`,
        `pointer: ${item.metadata.pointer}`,
        `sourceClass: ${item.metadata.sourceClass}`,
        `adapter: ${item.metadata.adapter}`,
        ``,
        item.excerpt.trim(),
      ].join("\n"),
    );
  }

  const titleSeed = input.question?.trim() || "Research evidence synthesis";
  const title = titleSeed.slice(0, 120);
  const body = [
    `Synthesized from ${evidenceIds.length} Research evidence item(s).`,
    `researchArtifactId: ${input.researchArtifactId}`,
    ``,
    ...bodyParts,
  ].join("\n");

  const handoff = buildKnowledgeHandoff({
    taskId: input.taskId,
    tenantId: input.tenantId,
    researchArtifactId: input.researchArtifactId,
    evidenceIds,
  });

  if (!handoff.requiresHumanApproval || handoff.sorWriteAllowed) {
    throw new EvidenceIngestError("handoff invariants violated");
  }

  const pendingApproval = createPendingApprovalHandoff({
    handoffId: `dg-ingest-${input.researchArtifactId}`,
    taskId: input.taskId,
    tenantId: input.tenantId,
    researchArtifactId: input.researchArtifactId,
  });

  return {
    handoff,
    content: { title, body },
    pendingApproval,
    evidenceIds: Object.freeze([...evidenceIds]),
  };
}
