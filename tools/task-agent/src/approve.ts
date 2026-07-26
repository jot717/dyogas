/**
 * Human Approval Gate integration for Task Agent plans (TA-05).
 * Consumes human-gate; never self-approves.
 */

import { decideApproval, enqueueApproval, type PendingApproval } from "@dyogas/human-gate";
import type { ExecutionPackage } from "@dyogas/dev-orch";
import { TaskAgentError, type TaskPlan } from "./types.js";

export interface TaskPlanApprovalInput {
  readonly plan: TaskPlan;
  readonly executionPackage: ExecutionPackage;
  /** Required to leave pending — engines never invent this. */
  readonly decision?: "approved" | "rejected";
  readonly actorId?: string;
}

export interface TaskPlanApprovalResult {
  readonly gate: PendingApproval;
  readonly approved: boolean;
  readonly plan: TaskPlan;
  readonly executionPackage: ExecutionPackage;
}

/**
 * Enqueue TaskPlan for human approval. Optional decide when actorId + decision provided.
 */
export function approveTaskPlanExecution(
  opts: TaskPlanApprovalInput,
): TaskPlanApprovalResult {
  if (!opts.plan.requires_human_approval) {
    throw new TaskAgentError("plan must require human approval");
  }

  let gate = enqueueApproval({
    proposalId: opts.plan.plan_id,
    researchArtifactId: opts.executionPackage.taskId,
    painStatement: opts.plan.objective,
  });

  let approved = false;
  if (opts.decision && opts.actorId) {
    gate = decideApproval(gate, opts.decision, opts.actorId);
    approved = opts.decision === "approved";
  }

  return {
    gate,
    approved,
    plan: opts.plan,
    executionPackage: opts.executionPackage,
  };
}
