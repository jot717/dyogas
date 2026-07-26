import { createMemoryAuditSink, requireTrustIdentity, type AuditSink } from "@dyogas/trust";
import { admitRun, startRun, succeed } from "@dyogas/runtime";
import {
  applyApprovedKnowledge,
  type KnowledgeApplyResult,
} from "@dyogas/knowledge-engine";
import type { KnowledgeHandoffContract } from "@dyogas/research-engine";
import { decideApproval, enqueueApproval, type PendingApproval } from "./gate.js";
import { createApprovalNotification, type NotificationReceipt } from "./notify.js";

export interface HumanGateFlowResult {
  readonly gate: PendingApproval;
  readonly receipts: readonly NotificationReceipt[];
  readonly apply?: KnowledgeApplyResult;
  readonly audit: AuditSink;
}

/**
 * B11 path: enqueue gate → notify → optional decide+apply via Knowledge Engine.
 * Never self-approves: caller must pass decision + actorId.
 */
export function runHumanApprovalGate(opts: {
  readonly proposalId: string;
  readonly researchArtifactId: string;
  readonly painStatement: string;
  readonly audience: readonly string[];
  readonly handoff: KnowledgeHandoffContract;
  readonly content: { title: string; body: string };
  readonly decision?: "approved" | "rejected";
  readonly actorId?: string;
  readonly audit?: AuditSink;
}): HumanGateFlowResult {
  requireTrustIdentity();
  const audit = opts.audit ?? createMemoryAuditSink();

  let run = admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: "notification-agent@1.0.0",
    audit,
  });
  run = startRun(run);

  let gate = enqueueApproval({
    proposalId: opts.proposalId,
    researchArtifactId: opts.researchArtifactId,
    painStatement: opts.painStatement,
  });

  const { receipts } = createApprovalNotification({
    runId: run.ctx.runId,
    gateId: gate.gateId,
    proposalId: opts.proposalId,
    audience: opts.audience,
  });

  let apply: KnowledgeApplyResult | undefined;
  if (opts.decision && opts.actorId) {
    gate = decideApproval(gate, opts.decision, opts.actorId);
    if (opts.decision === "approved") {
      apply = applyApprovedKnowledge({
        handoff: opts.handoff,
        content: opts.content,
        approval: {
          decision: "approved",
          researchArtifactId: opts.researchArtifactId,
          note: "human-gate",
        },
        audit,
      });
    }
  }

  audit.append({
    type: "human_gate.completed",
    gate_id: gate.gateId,
    decision: gate.decision,
  });

  succeed(run);
  return { gate, receipts, apply, audit };
}

export * from "./gate.js";
export * from "./notify.js";
