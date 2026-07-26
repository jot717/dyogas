/**
 * @dyogas/runtime — public export (SPEC-RT-002 / ADR-0003)
 * Enforces Harness semantics; does not embed Agent SDK.
 */

export {
  type ExecutionContext,
  RuntimeError,
  createExecutionContext,
} from "./context.js";

export {
  type RunState,
  IllegalTransitionError,
  assertLegalTransition,
  canTransition,
} from "./state.js";

export {
  type FailureClass,
  type RetryPolicy,
  DEFAULT_RETRY,
  RetryExhaustedError,
  classifyError,
  shouldRetry,
} from "./retry.js";

export {
  type ArtifactRef,
  HandoffError,
  sealArtifact,
  acceptHandoff,
} from "./handoff.js";

export {
  type AdmitRequest,
  type RuntimeRun,
  admitRun,
  transition,
  startRun,
  handleFailure,
  resumeAfterRetry,
  succeed,
} from "./run.js";
