/**
 * Human Approval Gate for Decision Assets (DA-05).
 * Never self-approves — caller must pass decision + actorId.
 */

import {
  buildKnowledgeHandoff,
  type EvidenceItem,
} from "@dyogas/research-engine";
import {
  runHumanApprovalGate,
  type HumanGateFlowResult,
} from "@dyogas/human-gate";
import { decisionAssetToKnowledgeContent } from "./extract.js";
import { DecisionAssetError, type DecisionAsset } from "./types.js";

export interface ApproveDecisionAssetInput {
  readonly asset: DecisionAsset;
  readonly evidence: readonly EvidenceItem[];
  readonly painStatement: string;
  readonly audience?: readonly string[];
  readonly decision?: "approved" | "rejected";
  readonly actorId?: string;
}

export interface ApproveDecisionAssetResult {
  readonly asset: DecisionAsset;
  readonly gate: HumanGateFlowResult;
  readonly approved: boolean;
}

export function approveDecisionAsset(
  opts: ApproveDecisionAssetInput,
): ApproveDecisionAssetResult {
  if (!opts.asset.requires_human_approval) {
    throw new DecisionAssetError("asset must require human approval");
  }
  if (opts.evidence.length < 1) {
    throw new DecisionAssetError("evidence required for approval provenance");
  }

  const evidenceIds = opts.evidence.map((e) => e.evidenceId);
  for (const id of opts.asset.evidence_ids) {
    if (!evidenceIds.includes(id)) {
      throw new DecisionAssetError(`asset evidence_id missing from evidence: ${id}`);
    }
  }

  const handoff = buildKnowledgeHandoff({
    taskId: opts.asset.task_id,
    tenantId: opts.asset.tenant_id,
    researchArtifactId: opts.asset.research_artifact_id,
    evidenceIds: [...opts.asset.evidence_ids],
  });
  const content = decisionAssetToKnowledgeContent(opts.asset);

  const gate = runHumanApprovalGate({
    proposalId: opts.asset.asset_id,
    researchArtifactId: opts.asset.research_artifact_id,
    painStatement: opts.painStatement,
    audience: opts.audience ?? ["founder"],
    handoff,
    content,
    decision: opts.decision,
    actorId: opts.actorId,
  });

  let status: DecisionAsset["status"] = "pending_approval";
  if (opts.decision === "approved" && opts.actorId) status = "approved";
  if (opts.decision === "rejected" && opts.actorId) status = "rejected";
  if (gate.apply?.item.approvalState === "applied") status = "applied";

  return {
    asset: { ...opts.asset, status },
    gate,
    approved: status === "approved" || status === "applied",
  };
}
