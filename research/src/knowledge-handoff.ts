/**
 * Knowledge handoff contract — payload for MOD-KNOWLEDGE.
 * Does not write SoR (Art. X / ADR-0005).
 */

export interface KnowledgeHandoffContract {
  readonly contractVersion: "1.0.0";
  readonly taskId: string;
  readonly tenantId: string;
  readonly researchArtifactId: string;
  readonly evidenceIds: readonly string[];
  readonly requiresHumanApproval: true;
  readonly sorWriteAllowed: false;
}

export function buildKnowledgeHandoff(input: {
  taskId: string;
  tenantId: string;
  researchArtifactId: string;
  evidenceIds: readonly string[];
}): KnowledgeHandoffContract {
  return {
    contractVersion: "1.0.0",
    taskId: input.taskId,
    tenantId: input.tenantId,
    researchArtifactId: input.researchArtifactId,
    evidenceIds: [...input.evidenceIds],
    requiresHumanApproval: true,
    sorWriteAllowed: false,
  };
}
