/**
 * SPRINT-EXECUTION-HOST-001 — Group G lineage record types.
 * Metadata only — no new artifact schemas.
 */

export type TrustedArtifactKind =
  | "ResearchBrief"
  | "ResearchReport"
  | "ValidationReport"
  | "Proposal"
  | "HumanReviewDecision"
  | "Knowledge"
  | "GraphUpdate";

/** Canonical trusted-path order (approval required before Knowledge). */
export const TRUSTED_PATH_ORDER: readonly TrustedArtifactKind[] = [
  "ResearchBrief",
  "ResearchReport",
  "ValidationReport",
  "Proposal",
  "HumanReviewDecision",
  "Knowledge",
  "GraphUpdate",
] as const;

export type LineageRecord = {
  readonly artifact_id: string;
  readonly parent_ids: readonly string[];
  readonly version: string;
  readonly pipeline_id: string;
  readonly run_id: string;
  readonly stage_id: string;
  readonly digest: string;
  readonly timestamp: string;
  readonly kind: TrustedArtifactKind;
  readonly tenant_id: string;
  readonly correlation_id: string;
};

export type LineageAppendInput = {
  readonly kind: TrustedArtifactKind;
  readonly artifact_id: string;
  readonly version: string;
  readonly pipeline_id: string;
  readonly run_id: string;
  readonly stage_id: string;
  readonly tenant_id: string;
  readonly correlation_id: string;
  readonly parent_ids?: readonly string[];
  readonly payloadHint?: string;
};
