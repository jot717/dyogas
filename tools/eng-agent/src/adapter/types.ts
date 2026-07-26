/**
 * Structural view of an Orchestrator Execution Package.
 * Compatible with tools/dev-orch ExecutionPackage — no package dependency.
 */
export interface ExecutionPackageView {
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
  sprintId: string;
  ssotReferences: string;
  gapRegistry: string;
  statusTransition: string;
}

/** Gate result view from Orchestrator (pass/fail only). */
export interface GateView {
  ok: boolean;
  reason?: string;
}

export interface AdaptedTask {
  taskId: string;
  sprintId: string;
  objective: string;
  acceptanceCriteria: string;
  testRequirements: string;
  allowedScope: string;
  forbiddenScope: string;
  expectedEvidence: string;
  executionMode: string;
  ssotReferences: string;
  /** Copied verbatim — adapter invents nothing. */
  sourcePackage: ExecutionPackageView;
}

export type AdaptOk = { ok: true; adapted: AdaptedTask };
export type AdaptErr = { ok: false; error: string };
export type AdaptResult = AdaptOk | AdaptErr;
