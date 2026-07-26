/**
 * Decision Graph human approval gate — wraps B11 gate with Research evidence ingest.
 * Never self-approves; caller must supply decision + actorId.
 */

import {
  ingestResearchEvidence,
  type EvidenceIngestPackage,
  type ResearchEvidenceIngestInput,
} from "@dyogas/knowledge-engine";
import { runHumanApprovalGate, type HumanGateFlowResult } from "./run.js";

export interface DecisionGraphGateInput extends ResearchEvidenceIngestInput {
  readonly proposalId: string;
  readonly painStatement: string;
  readonly audience: readonly string[];
  /** Required to progress past pending — engines never invent this. */
  readonly decision?: "approved" | "rejected";
  readonly actorId?: string;
}

export interface DecisionGraphGateResult {
  readonly ingest: EvidenceIngestPackage;
  readonly gate: HumanGateFlowResult;
}

/**
 * Ingest Research evidence → enqueue human gate → optional decide+SoR apply.
 */
export function runDecisionGraphApprovalGate(
  opts: DecisionGraphGateInput,
): DecisionGraphGateResult {
  const ingest = ingestResearchEvidence({
    taskId: opts.taskId,
    tenantId: opts.tenantId,
    researchArtifactId: opts.researchArtifactId,
    evidence: opts.evidence,
    question: opts.question,
  });

  const gate = runHumanApprovalGate({
    proposalId: opts.proposalId,
    researchArtifactId: opts.researchArtifactId,
    painStatement: opts.painStatement,
    audience: opts.audience,
    handoff: ingest.handoff,
    content: ingest.content,
    decision: opts.decision,
    actorId: opts.actorId,
  });

  return { ingest, gate };
}
