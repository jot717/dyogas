/**
 * SPRINT-EXECUTION-HOST-001 — public request surface (T-B3).
 * Conceptual types only; no new artifact schemas.
 * Bootstrap is opaque Record aligned to existing ResearchBrief semantics.
 */

export type PipelinePin = {
  readonly pipeline_id: string;
  readonly pipeline_version: string;
};

/**
 * Host-visible status. Human wait is modeled at Host layer (GAP-EH-001):
 * Runtime MVP RunState may lack WAITING_HUMAN — do not fork Runtime.
 */
export type HostRunStatus =
  | "created"
  | "running"
  | "waiting_human"
  | "applying"
  | "succeeded"
  | "failed"
  | "cancelled";

/** Harness §9 outcomes — Host enforces; agents cannot set these. */
export type HumanDecisionOutcome =
  | "approved"
  | "rejected"
  | "request_changes"
  | "expired"
  | "escalated";

export type HumanDecision = {
  readonly outcome: HumanDecisionOutcome;
  /** Attributable human / owner identity — never agent identity. */
  readonly actor_id: string;
  readonly reason?: string;
};

/**
 * Trusted-path refs (existing artifact kinds). Optional until stages seal.
 * Chain: ResearchBrief → ResearchReport → … → Knowledge → GraphUpdate
 */
export type LineageSnapshot = {
  readonly correlation_id: string;
  readonly research_brief_ref?: string;
  readonly research_report_ref?: string;
  readonly validation_report_ref?: string;
  readonly proposal_ref?: string;
  readonly human_decision_ref?: string;
  readonly knowledge_ref?: string;
  readonly graph_update_ref?: string;
};

export type CreateRunRequest = {
  readonly pipeline_id: string;
  readonly pipeline_version: string;
  /** Existing ResearchBrief-shaped bootstrap — not a new schema. */
  readonly bootstrap: Record<string, unknown>;
  readonly tenant_id: string;
  readonly caller_id: string;
  readonly correlation_id: string;
  readonly audit_sink?: unknown;
};

export type HostRun = {
  readonly run_id: string;
  readonly pin: PipelinePin;
  readonly status: HostRunStatus;
  readonly lineage: LineageSnapshot;
};
