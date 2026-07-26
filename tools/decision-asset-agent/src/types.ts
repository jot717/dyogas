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

export interface DecisionAsset {
  readonly asset_id: string;
  readonly title: string;
  readonly question: string;
  readonly summary: string;
  readonly claims: readonly DecisionAssetClaim[];
  readonly evidence_ids: readonly string[];
  readonly research_artifact_id: string;
  readonly tenant_id: string;
  readonly task_id: string;
  readonly execution_package_task_id?: string;
  readonly status: DecisionAssetStatus;
  readonly requires_human_approval: true;
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
    readonly metadata: {
      readonly title?: string;
      readonly pointer: string;
      readonly sourceClass: string;
    };
  }[];
}
