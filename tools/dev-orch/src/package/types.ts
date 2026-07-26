/**
 * Execution Package types (Runbook §4.1 + P2-04 field set).
 * Generation only — no agent execution / gate / verifier.
 */

/** Canonical status transition recorded on every package. */
export const DEFAULT_STATUS_TRANSITION =
  "READY_FOR_EXECUTION → IN_PROGRESS → DONE | BLOCKED" as const;

/** Default forbidden scope when task does not authorize platform edits. */
export const DEFAULT_FORBIDDEN_SCOPE =
  "Runtime; SDK; Harness Spec; Execution Host; Product modules; MOD-DEV-ORCH; product agent execution" as const;

export const DEFAULT_EXECUTION_MODE = "Implementation Mode" as const;

/**
 * Structured Execution Package for an Implementation Agent handoff.
 */
export interface ExecutionPackage {
  taskId: string;
  title: string;
  objective: string;
  dependencies: readonly string[];
  acceptanceCriteria: string;
  testRequirements: string;
  allowedScope: string;
  forbiddenScope: string;
  expectedEvidence: string;
  executionMode: string;
  /** Runbook §4.1 */
  sprintId: string;
  ssotReferences: string;
  gapRegistry: string;
  statusTransition: string;
}

/**
 * Inputs required to emit a package from a planner-selected task.
 * Scope / SSOT / GAP / Sprint are supplied by the operator context
 * (later: Gate / CLI); they are not invented by the emitter.
 */
export interface EmitExecutionPackageInput {
  taskId: string;
  title: string;
  objective: string;
  dependencies: readonly string[];
  acceptanceCriteria: string;
  testRequirements: string;
  allowedScope: string;
  forbiddenScope?: string;
  expectedEvidence: string;
  executionMode?: string;
  sprintId: string;
  ssotReferences: string;
  gapRegistry: string;
  statusTransition?: string;
}

export type EmitOk = { ok: true; package: ExecutionPackage };
export type EmitErr = { ok: false; error: string };
export type EmitResult = EmitOk | EmitErr;
