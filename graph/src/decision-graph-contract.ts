/**
 * Decision Graph Foundation contract — Evidence → Knowledge → Decision.
 * Composition only; does not invent a new MOD (DL-DECISION-GRAPH-FOUNDATION-001).
 */

export const DECISION_GRAPH_CONTRACT_ID = "decision-graph-foundation" as const;
export const DECISION_GRAPH_CONTRACT_VERSION = "1.0.0" as const;

export type DecisionGraphStage = "evidence" | "knowledge" | "decision";

export interface DecisionGraphContractMeta {
  readonly contractId: typeof DECISION_GRAPH_CONTRACT_ID;
  readonly contractVersion: typeof DECISION_GRAPH_CONTRACT_VERSION;
  readonly stages: readonly DecisionGraphStage[];
  readonly requiresHumanApproval: true;
  readonly researchMayWriteSoR: false;
  readonly ontologyProfileId: string;
}

/** Binding meta for Decision Graph Foundation v1. */
export const DECISION_GRAPH_CONTRACT: DecisionGraphContractMeta = Object.freeze({
  contractId: DECISION_GRAPH_CONTRACT_ID,
  contractVersion: DECISION_GRAPH_CONTRACT_VERSION,
  stages: Object.freeze(["evidence", "knowledge", "decision"] as const),
  requiresHumanApproval: true,
  researchMayWriteSoR: false,
  ontologyProfileId: "ontology-decision-graph-1.0.0",
});

export interface EvidenceStageRef {
  readonly stage: "evidence";
  readonly researchArtifactId: string;
  readonly evidenceIds: readonly string[];
  readonly taskId: string;
  readonly tenantId: string;
}

export interface KnowledgeStageRef {
  readonly stage: "knowledge";
  readonly knowledgeId: string;
  readonly version: number;
  readonly approvalState: "applied";
}

export interface DecisionStageRef {
  readonly stage: "decision";
  readonly graphUpdateMode: "propose" | "apply";
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly consistencyOk: boolean;
}

export interface DecisionGraphFoundationRecord {
  readonly meta: DecisionGraphContractMeta;
  readonly evidence: EvidenceStageRef;
  readonly knowledge: KnowledgeStageRef;
  readonly decision: DecisionStageRef;
}
