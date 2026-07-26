/**
 * Execution Package generation from TaskPlan — reuses @dyogas/dev-orch emit.
 * Compatible with eng-agent ExecutionPackageView and Host handoff docs.
 */

import {
  emitExecutionPackage,
  type ExecutionPackage,
  type EmitResult,
} from "@dyogas/dev-orch";
import { TaskAgentError, type TaskPlan } from "./types.js";

export type PackageFromPlanResult =
  | { ok: true; package: ExecutionPackage; plan: TaskPlan }
  | { ok: false; error: string; plan: TaskPlan };

/**
 * Map TaskPlan → Execution Package (TA-04).
 */
export function generateExecutionPackageFromPlan(
  plan: TaskPlan,
): PackageFromPlanResult {
  if (!plan.requires_human_approval) {
    return {
      ok: false,
      error: "TaskPlan must require human approval",
      plan,
    };
  }
  if (plan.routed_agent_ids.length < 1) {
    return { ok: false, error: "TaskPlan has no routed agents", plan };
  }

  const pf = plan.package_fields;
  const emit: EmitResult = emitExecutionPackage({
    taskId: plan.task_id,
    title: plan.title,
    objective: plan.objective,
    dependencies: pf.dependencies ?? [],
    acceptanceCriteria: pf.acceptanceCriteria,
    testRequirements: pf.testRequirements,
    allowedScope: pf.allowedScope,
    forbiddenScope: pf.forbiddenScope,
    expectedEvidence: pf.expectedEvidence,
    executionMode: pf.executionMode,
    sprintId: plan.sprint_id,
    ssotReferences: pf.ssotReferences,
    gapRegistry: pf.gapRegistry,
  });

  if (!emit.ok) {
    return { ok: false, error: emit.error, plan };
  }

  return { ok: true, package: emit.package, plan };
}

export function requireExecutionPackage(plan: TaskPlan): ExecutionPackage {
  const result = generateExecutionPackageFromPlan(plan);
  if (!result.ok) {
    throw new TaskAgentError(result.error);
  }
  return result.package;
}
