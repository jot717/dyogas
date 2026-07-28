/**
 * Decision Asset types — mirrors schemas/artifacts/decision-asset.schema.json
 */

export class DecisionAssetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecisionAssetError";
  }
}

export type DecisionAssetStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "applied";

export interface DecisionAssetClaim {
  readonly claim_id: string;
  readonly text: string;
  readonly evidence_id: string;
}

/** Human-choosable option — assist only, never auto-ranked. */
export interface DecisionAssetOption {
  readonly option_id: string;
  readonly title: string;
  readonly supporting_evidence: readonly string[];
  readonly risks: readonly string[];
  readonly advantages: readonly string[];
  readonly unknowns: readonly string[];
  /** Product bridge — human-readable option summary. */
  readonly description?: string;
  /** Alias of advantages for Human Approval UI. */
  readonly benefits?: readonly string[];
  /** Alias of supporting_evidence for approval output. */
  readonly evidence_refs?: readonly string[];
}

export interface DecisionAssetEvidenceItem {
  readonly source: string;
  readonly fact: string;
  readonly relevance: string;
  readonly supported_factor: string;
  readonly decision_impact: string;
  readonly provenance: {
    readonly pointer: string;
    readonly retrieved_at?: string;
  };
}

export interface DecisionAssetResearchPlan {
  readonly domain: string;
  readonly user_goal: string;
  readonly research_factors: readonly string[];
  readonly source_requirements: readonly string[];
  readonly excluded_patterns: readonly string[];
}

export interface DecisionAssetApprovalTarget {
  readonly knowledge_title: string;
  readonly approval_question: string;
  readonly knowledge_preview: string;
}

export interface DecisionAssetProvenance {
  readonly research_artifact_id: string;
  readonly research_brief_ref?: string;
  readonly collector_adapter_id?: string;
  readonly evidence_ids: readonly string[];
}

export interface DecisionAssetLineage {
  readonly run_id?: string;
  readonly task_id: string;
  readonly execution_package_task_id?: string;
  readonly request_id?: string;
}

export interface DecisionAsset {
  readonly asset_id: string;
  readonly title: string;
  readonly question: string;
  readonly summary: string;
  readonly claims: readonly DecisionAssetClaim[];
  readonly options?: readonly DecisionAssetOption[];
  readonly evidence_ids: readonly string[];
  readonly research_artifact_id: string;
  readonly tenant_id: string;
  readonly task_id: string;
  readonly execution_package_task_id?: string;
  readonly status: DecisionAssetStatus;
  readonly requires_human_approval: true;
  /** Product Golden Path bridge fields (populated by buildProductDecisionAsset). */
  readonly domain?: string;
  readonly user_goal?: string;
  readonly decision_context?: string;
  readonly research_plan?: DecisionAssetResearchPlan;
  readonly research_factors?: readonly string[];
  readonly evidence_items?: readonly DecisionAssetEvidenceItem[];
  readonly confidence_level?: "HIGH" | "MEDIUM" | "LOW";
  readonly evidence_gaps?: readonly string[];
  readonly unknowns?: readonly string[];
  readonly approval_target?: DecisionAssetApprovalTarget;
  readonly provenance?: DecisionAssetProvenance;
  readonly lineage?: DecisionAssetLineage;
}

export interface ExtractDecisionAssetInput {
  readonly question: string;
  readonly tenant_id: string;
  readonly task_id: string;
  readonly research_artifact_id: string;
  readonly execution_package_task_id?: string;
  readonly evidence: readonly {
    readonly evidenceId: string;
    readonly excerpt: string;
    readonly extractedClaim?: string;
    readonly relevanceReason?: string;
    readonly confidence?: number;
    readonly metadata: {
      readonly title?: string;
      readonly pointer: string;
      readonly sourceClass: string;
    };
  }[];
}
