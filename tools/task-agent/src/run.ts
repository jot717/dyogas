/**
 * Full Task Agent foundation pipeline (plan → route → package → approve → evidence).
 */

import { createTaskPlan } from "./plan.js";
import { requireExecutionPackage } from "./package.js";
import { approveTaskPlanExecution } from "./approve.js";
import {
  buildTaskAgentEvidence,
  writeTaskAgentEvidence,
  type TaskAgentEvidence,
} from "./evidence.js";
import type { TaskAgentRequest, TaskPlan } from "./types.js";
import type { ExecutionPackage } from "@dyogas/dev-orch";
import type { PendingApproval } from "@dyogas/human-gate";

export interface RunTaskAgentOptions {
  readonly request: TaskAgentRequest;
  readonly decision?: "approved" | "rejected";
  readonly actorId?: string;
  /** Optional filesystem path for evidence JSON. */
  readonly evidencePath?: string;
}

export interface RunTaskAgentResult {
  readonly plan: TaskPlan;
  readonly executionPackage: ExecutionPackage;
  readonly gate: PendingApproval;
  readonly approved: boolean;
  readonly evidence: TaskAgentEvidence;
}

/**
 * Execute Task Agent foundation flow. Does not invoke Execution Host.
 */
export function runTaskAgentFoundation(
  opts: RunTaskAgentOptions,
): RunTaskAgentResult {
  const plan = createTaskPlan(opts.request);
  const executionPackage = requireExecutionPackage(plan);
  const approval = approveTaskPlanExecution({
    plan,
    executionPackage,
    decision: opts.decision,
    actorId: opts.actorId,
  });
  const evidence = buildTaskAgentEvidence({
    plan,
    executionPackage,
    gate: approval.gate,
    approved: approval.approved,
  });

  if (opts.evidencePath) {
    writeTaskAgentEvidence(evidence, opts.evidencePath);
  }

  return {
    plan,
    executionPackage,
    gate: approval.gate,
    approved: approval.approved,
    evidence,
  };
}
