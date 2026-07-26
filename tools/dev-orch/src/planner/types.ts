/**
 * Planner selection result types (Runbook §3.2–§3.3).
 * Selection only — no Execution Package / gate / writer.
 */
import type { RegistryTask } from "../types.js";

export type PlannerStopReason =
  | "NO_READY_TASK"
  | "DEPENDENCY_VIOLATION"
  | "AMBIGUOUS_READY_TASKS";

export type PlannerSelected = {
  ok: true;
  task: RegistryTask;
  /** Why this task was chosen. */
  rationale: string;
};

export type PlannerStopped = {
  ok: false;
  reason: PlannerStopReason;
  message: string;
  /** Candidate ids considered (for diagnostics). */
  candidateIds?: string[];
};

export type PlannerResult = PlannerSelected | PlannerStopped;
