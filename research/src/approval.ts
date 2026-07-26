/**
 * Human approval handoff — data only, no UI (ADR-0005).
 * Engines never self-approve SoR writes.
 */

export type ApprovalDecision = "pending" | "approved" | "rejected";

export interface HumanApprovalHandoff {
  readonly handoffId: string;
  readonly taskId: string;
  readonly tenantId: string;
  readonly researchArtifactId: string;
  readonly decision: ApprovalDecision;
  readonly rationale?: string;
}

export function createPendingApprovalHandoff(input: {
  handoffId: string;
  taskId: string;
  tenantId: string;
  researchArtifactId: string;
}): HumanApprovalHandoff {
  return {
    ...input,
    decision: "pending",
  };
}
