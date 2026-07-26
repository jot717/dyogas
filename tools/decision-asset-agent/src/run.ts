/**
 * Full Decision Asset foundation pipeline.
 */

import type { EvidenceItem } from "@dyogas/research-engine";
import { decisionAssetFromResearchEvidence } from "./from-research.js";
import { approveDecisionAsset } from "./approve.js";
import { persistApprovedDecisionAsset } from "./persist.js";
import {
  buildDecisionAssetEvidence,
  writeDecisionAssetEvidence,
  type DecisionAssetEvidence,
} from "./evidence.js";
import type { DecisionAsset } from "./types.js";
import type { PersistDecisionAssetResult } from "./persist.js";
import type { HumanGateFlowResult } from "@dyogas/human-gate";

export interface RunDecisionAssetAgentOptions {
  readonly question: string;
  readonly tenant_id: string;
  readonly task_id: string;
  readonly research_artifact_id: string;
  readonly evidence: readonly EvidenceItem[];
  readonly execution_package_task_id?: string;
  readonly painStatement?: string;
  readonly decision?: "approved" | "rejected";
  readonly actorId?: string;
  readonly evidencePath?: string;
}

export interface RunDecisionAssetAgentResult {
  readonly asset: DecisionAsset;
  readonly gate: HumanGateFlowResult;
  readonly approved: boolean;
  readonly persist?: PersistDecisionAssetResult;
  readonly evidence: DecisionAssetEvidence;
}

/**
 * Evidence → Decision Asset → Human Approval → Knowledge / Decision Graph.
 */
export function runDecisionAssetAgentFoundation(
  opts: RunDecisionAssetAgentOptions,
): RunDecisionAssetAgentResult {
  const asset = decisionAssetFromResearchEvidence({
    question: opts.question,
    tenant_id: opts.tenant_id,
    task_id: opts.task_id,
    research_artifact_id: opts.research_artifact_id,
    evidence: opts.evidence,
    execution_package_task_id: opts.execution_package_task_id,
  });

  const approval = approveDecisionAsset({
    asset,
    evidence: opts.evidence,
    painStatement:
      opts.painStatement ??
      `Approve Decision Asset for: ${opts.question}`,
    decision: opts.decision,
    actorId: opts.actorId,
  });

  let persist: PersistDecisionAssetResult | undefined;
  if (approval.approved && approval.gate.apply) {
    persist = persistApprovedDecisionAsset({
      asset: approval.asset,
      gate: approval.gate,
      mutationAuthorized: true,
    });
  }

  const evidence = buildDecisionAssetEvidence({
    asset: persist?.asset ?? approval.asset,
    persist,
    approved: approval.approved,
  });

  if (opts.evidencePath) {
    writeDecisionAssetEvidence(evidence, opts.evidencePath);
  }

  return {
    asset: persist?.asset ?? approval.asset,
    gate: approval.gate,
    approved: approval.approved,
    persist,
    evidence,
  };
}
