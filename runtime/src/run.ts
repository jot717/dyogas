import type { AuditSink } from "@dyogas/trust";
import {
  createExecutionContext,
  type ExecutionContext,
  RuntimeError,
} from "./context.js";
import { assertLegalTransition, type RunState } from "./state.js";
import {
  classifyError,
  DEFAULT_RETRY,
  shouldRetry,
  type RetryPolicy,
} from "./retry.js";

export interface AdmitRequest {
  readonly pipelineId: string;
  /** Contract version pin — required to admit agent invocation path. */
  readonly contractPin?: string;
  readonly audit: AuditSink;
}

export interface RuntimeRun {
  readonly ctx: ExecutionContext;
  state: RunState;
  attempt: number;
  readonly contractPin: string;
}

/** Admit a run — refuses without contract version pin. */
export function admitRun(req: AdmitRequest): RuntimeRun {
  if (!req.contractPin?.trim()) {
    throw new RuntimeError("CONTRACT_PIN_MISSING");
  }
  const ctx = createExecutionContext(req.pipelineId, req.audit);
  ctx.audit.append({
    type: "runtime.run.admitted",
    run_id: ctx.runId,
    pipeline_id: ctx.pipelineId,
    contract_pin: req.contractPin,
  });
  return {
    ctx,
    state: "CREATED",
    attempt: 0,
    contractPin: req.contractPin,
  };
}

export function transition(
  run: RuntimeRun,
  to: RunState,
  note?: string,
): RuntimeRun {
  assertLegalTransition(run.state, to);
  run.ctx.audit.append({
    type: "runtime.run.transition",
    run_id: run.ctx.runId,
    from: run.state,
    to,
    note,
  });
  run.state = to;
  return run;
}

/** Start run: CREATED → RUNNING. */
export function startRun(run: RuntimeRun): RuntimeRun {
  return transition(run, "RUNNING");
}

/**
 * Handle stage failure with retry policy (Harness-compatible classes).
 */
export function handleFailure(
  run: RuntimeRun,
  errorCode: string,
  policy: RetryPolicy = DEFAULT_RETRY,
): RuntimeRun {
  const cls = classifyError(errorCode);
  run.attempt += 1;
  if (shouldRetry(cls, run.attempt, policy)) {
    return transition(run, "WAITING_RETRY", errorCode);
  }
  return transition(run, "FAILED", errorCode);
}

export function resumeAfterRetry(run: RuntimeRun): RuntimeRun {
  return transition(run, "RUNNING");
}

export function succeed(run: RuntimeRun): RuntimeRun {
  return transition(run, "SUCCEEDED");
}
