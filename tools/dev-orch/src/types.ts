/**
 * Typed models for Task Registry markdown (SPEC-DEV-ORCH-001 / Runbook §3.1).
 * Parser only — no planner / writer.
 */

/** Canonical lifecycle tokens recognized in Status cells. */
export type TaskStatusToken =
  | "READY_FOR_EXECUTION"
  | "IN_PROGRESS"
  | "DONE"
  | "BLOCKED"
  | "PENDING"
  | "UNKNOWN";

export interface RegistryTask {
  /** Task ID (e.g. P2-01). */
  id: string;
  /** Title from heading after em dash / hyphen. */
  title: string;
  /** Raw Status cell text. */
  statusRaw: string;
  /** Normalized status token. */
  status: TaskStatusToken;
  /** Declared dependency task IDs (empty if None). */
  dependencies: string[];
  /** Acceptance Criteria cell. */
  acceptanceCriteria: string;
  /** Test Requirement cell. */
  testRequirement: string;
  /** Evidence cell (may be empty string if absent on incomplete tasks — fail-closed requires field present when validating). */
  evidence: string;
  /** Objective cell when present. */
  objective?: string;
  /** Expected output cell when present. */
  expectedOutput?: string;
}

export interface TaskRegistry {
  /** Registry ID from header (e.g. TASK-REGISTRY-DEV-ORCH-002). */
  registryId: string;
  /** Path or label of source (optional). */
  sourcePath?: string;
  /** Current executable task pointer (task id or "None"). */
  currentExecutableTask: string | null;
  /** Parsed tasks in document order. */
  tasks: RegistryTask[];
}

export type ParseOk = { ok: true; registry: TaskRegistry };
export type ParseErr = { ok: false; error: string };
export type ParseResult = ParseOk | ParseErr;
