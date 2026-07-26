/**
 * SPRINT-EXECUTION-HOST-001 — Group H Human Approval overlay (T-H1..H3).
 * Host-level only — does NOT add Runtime states (GAP-EH-001).
 */

import { HostError } from "../errors.js";
import type { HumanDecision, HumanDecisionOutcome } from "../api.js";
import type { LineageContext } from "../lineage/context.js";
import { appendLineage, requireApprovalBeforeApply } from "../lineage/context.js";
import type { HostAudit } from "../audit/host-audit.js";
import { HostAuditType } from "../audit/host-audit.js";
import {
  mintApplyToken,
  consumeApplyTokenForKnowledge,
  assertTokenUnused,
  type ApplyToken,
} from "./apply-token.js";
import type { PipelineStageDef } from "../pipeline/types.js";

export type ActorKind = "human" | "agent";

export type HumanGateSession = {
  readonly run_id: string;
  readonly tenant_id: string;
  readonly pipeline_id: string;
  readonly pipeline_version: string;
  status: "paused" | "resumed" | "rejected" | "request_changes" | "expired" | "escalated" | "approved";
  stage: PipelineStageDef;
  lineage: LineageContext;
  applyToken?: ApplyToken;
  decision?: HumanDecision & { actor_kind: ActorKind };
  knowledgeApplied: boolean;
  graphApplied: boolean;
};

export type OpenHumanGateArgs = {
  run_id: string;
  tenant_id: string;
  pipeline_id: string;
  pipeline_version: string;
  stage: PipelineStageDef;
  lineage: LineageContext;
  audit: HostAudit;
};

export function openHumanGate(args: OpenHumanGateArgs): HumanGateSession {
  args.audit.emit(HostAuditType.HUMAN_GATE_OPENED, {
    run_id: args.run_id,
    tenant_id: args.tenant_id,
    pipeline_id: args.pipeline_id,
    pipeline_version: args.pipeline_version,
    stage_id: String(args.stage.index),
    stage_name: args.stage.name,
    outcome: "paused",
  });
  return {
    run_id: args.run_id,
    tenant_id: args.tenant_id,
    pipeline_id: args.pipeline_id,
    pipeline_version: args.pipeline_version,
    status: "paused",
    stage: args.stage,
    lineage: args.lineage,
    knowledgeApplied: false,
    graphApplied: false,
  };
}

function assertHumanActor(
  decision: HumanDecision,
  actor_kind: ActorKind,
): void {
  if (actor_kind === "agent") {
    throw new HostError(
      "HUMAN_ACTOR_REQUIRED",
      "agent identity cannot approve or decide Human Gate",
    );
  }
  if (!decision.actor_id?.trim()) {
    throw new HostError("HUMAN_ACTOR_REQUIRED", "actor_id required");
  }
}

const DECISION_OUTCOMES: readonly HumanDecisionOutcome[] = [
  "approved",
  "rejected",
  "request_changes",
  "expired",
  "escalated",
];

/**
 * Resume from Host pause. Mints apply token only on approved.
 * Emits decision + resume audit events.
 */
export function resumeHumanGate(
  session: HumanGateSession,
  decision: HumanDecision,
  actor_kind: ActorKind,
  audit: HostAudit,
): HumanGateSession {
  if (session.status !== "paused") {
    throw new HostError(
      "HUMAN_GATE_NOT_PAUSED",
      `cannot resume from status ${session.status}`,
    );
  }
  assertHumanActor(decision, actor_kind);
  if (!DECISION_OUTCOMES.includes(decision.outcome)) {
    throw new HostError("HUMAN_OUTCOME_INVALID", decision.outcome);
  }

  audit.emit(HostAuditType.HUMAN_DECISION, {
    run_id: session.run_id,
    tenant_id: session.tenant_id,
    pipeline_id: session.pipeline_id,
    stage_id: String(session.stage.index),
    stage_name: session.stage.name,
    outcome: decision.outcome,
    actor_id: decision.actor_id,
    actor_kind,
  });

  session.decision = { ...decision, actor_kind };

  if (decision.outcome === "approved") {
    const proposal = session.lineage.records.find((r) => r.kind === "Proposal");
    if (!proposal) {
      throw new HostError(
        "LINEAGE_ORDER_VIOLATION",
        "cannot approve without Proposal in lineage",
      );
    }
    appendLineage(session.lineage, {
      kind: "HumanReviewDecision",
      artifact_id: `hrd-${session.run_id}`,
      version: "1.0.0",
      pipeline_id: session.pipeline_id,
      run_id: session.run_id,
      stage_id: String(session.stage.index),
      tenant_id: session.tenant_id,
      correlation_id: session.lineage.correlation_id,
      payloadHint: `approved:${decision.actor_id}`,
    });
    session.applyToken = mintApplyToken({
      run_id: session.run_id,
      proposal_artifact_id: proposal.artifact_id,
      proposal_version: proposal.version,
    });
    session.status = "approved";
  } else if (decision.outcome === "rejected") {
    session.status = "rejected";
  } else if (decision.outcome === "request_changes") {
    session.status = "request_changes";
  } else if (decision.outcome === "expired") {
    session.status = "expired";
  } else {
    session.status = "escalated";
  }

  audit.emit(HostAuditType.RESUME, {
    run_id: session.run_id,
    tenant_id: session.tenant_id,
    pipeline_id: session.pipeline_id,
    outcome: decision.outcome,
    actor_id: decision.actor_id,
    actor_kind,
    note: session.status === "approved" ? "resumed" : "closed",
  });

  return session;
}

/**
 * Authorize Knowledge apply — requires approval lineage + unused token.
 * Does not call Knowledge Engine (authorization only).
 */
export function authorizeKnowledgeApply(
  session: HumanGateSession,
  audit: HostAudit,
): ApplyToken {
  if (session.status !== "approved" || !session.applyToken) {
    throw new HostError(
      "APPLY_TOKEN_REQUIRED",
      "no approval — no Knowledge apply",
    );
  }
  requireApprovalBeforeApply(session.lineage);
  assertTokenUnused(session.applyToken);
  const proposal = session.lineage.records.find((r) => r.kind === "Proposal")!;
  consumeApplyTokenForKnowledge(session.applyToken, {
    artifact_id: proposal.artifact_id,
    version: proposal.version,
    run_id: session.run_id,
  });
  appendLineage(session.lineage, {
    kind: "Knowledge",
    artifact_id: `kn-${session.run_id}`,
    version: "1.0.0",
    pipeline_id: session.pipeline_id,
    run_id: session.run_id,
    stage_id: "5",
    tenant_id: session.tenant_id,
    correlation_id: session.lineage.correlation_id,
  });
  session.knowledgeApplied = true;
  audit.emit(HostAuditType.KNOWLEDGE_APPLIED, {
    run_id: session.run_id,
    tenant_id: session.tenant_id,
    pipeline_id: session.pipeline_id,
    artifact_id: `kn-${session.run_id}`,
    outcome: "authorized",
  });
  return session.applyToken;
}

/**
 * Authorize Graph apply — requires Knowledge already applied under approval.
 * Token already consumed; reuse of token string is rejected.
 */
export function authorizeGraphApply(
  session: HumanGateSession,
  audit: HostAudit,
  presentedTokenId?: string,
): void {
  if (!session.knowledgeApplied) {
    throw new HostError(
      "KNOWLEDGE_REQUIRED",
      "Graph apply requires prior Knowledge apply",
    );
  }
  requireApprovalBeforeApply(session.lineage);
  if (presentedTokenId && session.applyToken) {
    if (presentedTokenId === session.applyToken.token_id && session.applyToken.consumed) {
      throw new HostError("APPLY_TOKEN_REUSED", "apply token already consumed");
    }
  }
  if (!session.lineage.records.some((r) => r.kind === "Knowledge")) {
    throw new HostError("LINEAGE_APPROVAL_REQUIRED", "Knowledge missing in lineage");
  }
  appendLineage(session.lineage, {
    kind: "GraphUpdate",
    artifact_id: `gu-${session.run_id}`,
    version: "1.0.0",
    pipeline_id: session.pipeline_id,
    run_id: session.run_id,
    stage_id: "6",
    tenant_id: session.tenant_id,
    correlation_id: session.lineage.correlation_id,
  });
  session.graphApplied = true;
  audit.emit(HostAuditType.GRAPH_UPDATED, {
    run_id: session.run_id,
    tenant_id: session.tenant_id,
    pipeline_id: session.pipeline_id,
    artifact_id: `gu-${session.run_id}`,
    outcome: "authorized",
  });
}
