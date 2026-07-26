/**
 * Minimal Harness-compatible run states (enforce, don't fork).
 * Subset of Harness Spec run lifecycle for MVP skeleton.
 */
export type RunState =
  | "CREATED"
  | "RUNNING"
  | "WAITING_RETRY"
  | "SUCCEEDED"
  | "FAILED";

const LEGAL: Record<RunState, readonly RunState[]> = {
  CREATED: ["RUNNING", "FAILED"],
  RUNNING: ["SUCCEEDED", "FAILED", "WAITING_RETRY"],
  WAITING_RETRY: ["RUNNING", "FAILED"],
  SUCCEEDED: [],
  FAILED: [],
};

export class IllegalTransitionError extends Error {
  constructor(
    readonly from: RunState,
    readonly to: RunState,
  ) {
    super(`illegal run transition ${from} → ${to}`);
    this.name = "IllegalTransitionError";
  }
}

export function assertLegalTransition(from: RunState, to: RunState): void {
  if (!LEGAL[from].includes(to)) {
    throw new IllegalTransitionError(from, to);
  }
}

export function canTransition(from: RunState, to: RunState): boolean {
  return LEGAL[from].includes(to);
}
