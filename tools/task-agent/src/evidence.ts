/**
 * Execution evidence generation (TA-06).
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { ExecutionPackage } from "@dyogas/dev-orch";
import type { PendingApproval } from "@dyogas/human-gate";
import type { TaskPlan } from "./types.js";

export interface TaskAgentEvidence {
  readonly sprintId: string;
  readonly trace: string;
  readonly generatedAt: string;
  readonly plan: {
    readonly plan_id: string;
    readonly task_id: string;
    readonly routed_agent_ids: readonly string[];
    readonly requires_human_approval: true;
  };
  readonly executionPackage: ExecutionPackage;
  readonly approval: {
    readonly gateId: string;
    readonly decision: PendingApproval["decision"];
    readonly approved: boolean;
  };
  readonly hostCompatible: {
    readonly research_brief: TaskPlan["research_brief"];
    readonly note: string;
  };
  readonly verdict: "PASS" | "BLOCKED";
}

export function buildTaskAgentEvidence(input: {
  readonly plan: TaskPlan;
  readonly executionPackage: ExecutionPackage;
  readonly gate: PendingApproval;
  readonly approved: boolean;
}): TaskAgentEvidence {
  const verdict = input.approved ? "PASS" : "BLOCKED";
  return {
    sprintId: input.plan.sprint_id,
    trace: "TRACE-TASK-AGENT-FOUNDATION-001",
    generatedAt: new Date().toISOString(),
    plan: {
      plan_id: input.plan.plan_id,
      task_id: input.plan.task_id,
      routed_agent_ids: [...input.plan.routed_agent_ids],
      requires_human_approval: true,
    },
    executionPackage: input.executionPackage,
    approval: {
      gateId: input.gate.gateId,
      decision: input.gate.decision,
      approved: input.approved,
    },
    hostCompatible: {
      research_brief: input.plan.research_brief,
      note: "ResearchBrief-shaped fields for Execution Host Stage-1 bootstrap — no Host redesign this sprint",
    },
    verdict,
  };
}

export function writeTaskAgentEvidence(
  evidence: TaskAgentEvidence,
  path: string,
): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
}
