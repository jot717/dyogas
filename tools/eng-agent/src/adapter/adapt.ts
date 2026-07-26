/**
 * Task execution adapter — Execution Package → AdaptedTask.
 * Preserves fields; invents nothing.
 */

import type {
  AdaptResult,
  AdaptedTask,
  ExecutionPackageView,
  GateView,
} from "./types.js";

function requireNonEmpty(label: string, value: string): string | null {
  if (!value || !value.trim()) return `${label} is required`;
  return null;
}

/**
 * Adapt an Orchestrator Execution Package for the Engineering execution agent.
 * Requires Gate PASS. Copies package fields verbatim — no invented scope.
 */
export function adaptExecutionPackage(
  pkg: ExecutionPackageView,
  gate: GateView,
): AdaptResult {
  if (!gate.ok) {
    return {
      ok: false,
      error: `gate failed: ${gate.reason ?? "unauthorized"}`,
    };
  }

  const required: Array<[string, string]> = [
    ["taskId", pkg.taskId],
    ["title", pkg.title],
    ["objective", pkg.objective],
    ["acceptanceCriteria", pkg.acceptanceCriteria],
    ["testRequirements", pkg.testRequirements],
    ["allowedScope", pkg.allowedScope],
    ["forbiddenScope", pkg.forbiddenScope],
    ["expectedEvidence", pkg.expectedEvidence],
    ["executionMode", pkg.executionMode],
    ["sprintId", pkg.sprintId],
    ["ssotReferences", pkg.ssotReferences],
    ["gapRegistry", pkg.gapRegistry],
    ["statusTransition", pkg.statusTransition],
  ];

  for (const [label, value] of required) {
    const err = requireNonEmpty(label, value);
    if (err) return { ok: false, error: err };
  }

  const adapted: AdaptedTask = {
    taskId: pkg.taskId,
    sprintId: pkg.sprintId,
    objective: pkg.objective,
    acceptanceCriteria: pkg.acceptanceCriteria,
    testRequirements: pkg.testRequirements,
    allowedScope: pkg.allowedScope,
    forbiddenScope: pkg.forbiddenScope,
    expectedEvidence: pkg.expectedEvidence,
    executionMode: pkg.executionMode,
    ssotReferences: pkg.ssotReferences,
    sourcePackage: { ...pkg, dependencies: [...pkg.dependencies] },
  };

  return { ok: true, adapted };
}
