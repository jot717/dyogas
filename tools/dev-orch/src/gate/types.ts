/**
 * Gate validator types (START_DEVELOPMENT §5.2–§5.5 / Runbook forbidden).
 * Fail closed — no automatic override.
 */

export type GateCheckId =
  | "SCOPE"
  | "AUTHORIZATION"
  | "COMPLETENESS"
  | "MODE";

export type GateViolation = {
  check: GateCheckId;
  message: string;
};

export type GatePass = {
  ok: true;
  checks: GateCheckId[];
};

export type GateFail = {
  ok: false;
  /** Always STOP — no override. */
  action: "STOP";
  violations: GateViolation[];
};

export type GateResult = GatePass | GateFail;

/**
 * Execution context supplied with an Execution Package.
 */
export interface GateContext {
  /** Current operating mode (§5.2). */
  mode: string;
  /** Sprint is approved / authorized for execution. */
  sprintAuthorized: boolean;
  /** Decision Log approved for this scope (e.g. DL-DEV-ORCH-002). */
  decisionLogApproved: boolean;
  /** Task IDs present in the Task Registry. */
  knownTaskIds: readonly string[];
  /** Paths proposed to create or edit in this cycle. */
  proposedPaths: readonly string[];
  /**
   * §5.4 — if true with modifiesCode, STOP (Planning + Implementation mix).
   */
  createsPlanningArtifacts?: boolean;
  /** Whether this cycle writes implementation/source code. */
  modifiesCode?: boolean;
}
