/**
 * Development Orchestrator Planner — select next READY task (Runbook §3.2–§3.3).
 *
 * Rules (P2-03):
 * 1. Only READY_FOR_EXECUTION
 * 2. Ignore DONE / BLOCKED / PENDING / IN_PROGRESS
 * 3. All dependencies must be DONE
 * 4. Fail closed: no READY, dependency violation, ambiguous READY
 */
import type { RegistryTask, TaskRegistry } from "../types.js";
import type { PlannerResult } from "./types.js";

function byId(registry: TaskRegistry): Map<string, RegistryTask> {
  const map = new Map<string, RegistryTask>();
  for (const t of registry.tasks) map.set(t.id, t);
  return map;
}

function dependenciesSatisfied(
  task: RegistryTask,
  index: Map<string, RegistryTask>,
): { ok: true } | { ok: false; unmet: string[] } {
  const unmet: string[] = [];
  for (const depId of task.dependencies) {
    const dep = index.get(depId);
    if (!dep || dep.status !== "DONE") {
      unmet.push(depId);
    }
  }
  return unmet.length === 0 ? { ok: true } : { ok: false, unmet };
}

/**
 * Select the next executable task from a parsed Task Registry.
 */
export function selectNextTask(registry: TaskRegistry): PlannerResult {
  const index = byId(registry);
  const ready = registry.tasks.filter((t) => t.status === "READY_FOR_EXECUTION");

  if (ready.length === 0) {
    return {
      ok: false,
      reason: "NO_READY_TASK",
      message: "STOP: no task with status READY_FOR_EXECUTION",
    };
  }

  const eligible: RegistryTask[] = [];
  const blockedByDeps: { task: RegistryTask; unmet: string[] }[] = [];

  for (const task of ready) {
    const deps = dependenciesSatisfied(task, index);
    if (deps.ok) {
      eligible.push(task);
    } else {
      blockedByDeps.push({ task, unmet: deps.unmet });
    }
  }

  if (eligible.length === 0) {
    const detail = blockedByDeps
      .map((b) => `${b.task.id} (unmet: ${b.unmet.join(", ")})`)
      .join("; ");
    return {
      ok: false,
      reason: "DEPENDENCY_VIOLATION",
      message: `STOP: READY task(s) exist but dependencies are not DONE — ${detail}`,
      candidateIds: ready.map((t) => t.id),
    };
  }

  // Prefer Process pointer when it uniquely identifies an eligible task (Runbook §3.2).
  const pointer = registry.currentExecutableTask;
  if (pointer) {
    const pointed = eligible.filter((t) => t.id === pointer);
    if (pointed.length === 1) {
      return {
        ok: true,
        task: pointed[0]!,
        rationale: `current executable pointer ${pointer}`,
      };
    }
  }

  if (eligible.length === 1) {
    return {
      ok: true,
      task: eligible[0]!,
      rationale: "single READY_FOR_EXECUTION task with dependencies DONE",
    };
  }

  return {
    ok: false,
    reason: "AMBIGUOUS_READY_TASKS",
    message: `STOP: multiple READY tasks with satisfied dependencies and no unique Process pointer — ${eligible.map((t) => t.id).join(", ")}`,
    candidateIds: eligible.map((t) => t.id),
  };
}
