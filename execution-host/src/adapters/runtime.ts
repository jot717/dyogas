/**
 * SPRINT-EXECUTION-HOST-001 — Group E Runtime adapter (T-E1..E3).
 * Thin wrapper over @dyogas/runtime public exports only.
 * Does not change Runtime state machine.
 */

import {
  acceptHandoff,
  admitRun,
  handleFailure,
  HandoffError,
  IllegalTransitionError,
  resumeAfterRetry,
  RuntimeError,
  sealArtifact,
  startRun,
  succeed,
  transition,
  type ArtifactRef,
  type AdmitRequest,
  type RuntimeRun,
  type RunState,
  type RetryPolicy,
} from "@dyogas/runtime";
import { HostError } from "../errors.js";

/** Exact Runtime symbols consumed by this adapter (T-E1 inventory). */
export const RUNTIME_SYMBOLS_USED = [
  "admitRun",
  "startRun",
  "transition",
  "succeed",
  "handleFailure",
  "resumeAfterRetry",
  "sealArtifact",
  "acceptHandoff",
  "RuntimeError",
  "HandoffError",
  "IllegalTransitionError",
] as const;

function mapRuntimeError(err: unknown): never {
  if (err instanceof HostError) throw err;
  if (err instanceof RuntimeError) {
    throw new HostError("RUNTIME_ERROR", err.message);
  }
  if (err instanceof IllegalTransitionError) {
    throw new HostError(
      "RUNTIME_ILLEGAL_TRANSITION",
      `${err.from} → ${err.to}`,
    );
  }
  if (err instanceof HandoffError) {
    throw new HostError("RUNTIME_HANDOFF_ERROR", err.message);
  }
  throw new HostError(
    "RUNTIME_ERROR",
    err instanceof Error ? err.message : String(err),
  );
}

export type RuntimeAdapter = {
  readonly admitRun: (req: AdmitRequest) => RuntimeRun;
  readonly startRun: (run: RuntimeRun) => RuntimeRun;
  readonly transition: (
    run: RuntimeRun,
    to: RunState,
    note?: string,
  ) => RuntimeRun;
  readonly succeed: (run: RuntimeRun) => RuntimeRun;
  readonly handleFailure: (
    run: RuntimeRun,
    errorCode: string,
    policy?: RetryPolicy,
  ) => RuntimeRun;
  readonly resumeAfterRetry: (run: RuntimeRun) => RuntimeRun;
  readonly sealArtifact: (
    artifactId: string,
    version: string,
    tenantId: string,
    schemaOk: boolean,
  ) => ArtifactRef;
  readonly acceptHandoff: (
    artifact: ArtifactRef,
    consumerTenantId: string,
  ) => ArtifactRef;
};

/** Create thin Runtime adapter — audit sink remains on AdmitRequest / ExecutionContext. */
export function createRuntimeAdapter(): RuntimeAdapter {
  return {
    admitRun(req) {
      try {
        return admitRun(req);
      } catch (e) {
        mapRuntimeError(e);
      }
    },
    startRun(run) {
      try {
        return startRun(run);
      } catch (e) {
        mapRuntimeError(e);
      }
    },
    transition(run, to, note) {
      try {
        return transition(run, to, note);
      } catch (e) {
        mapRuntimeError(e);
      }
    },
    succeed(run) {
      try {
        return succeed(run);
      } catch (e) {
        mapRuntimeError(e);
      }
    },
    handleFailure(run, errorCode, policy) {
      try {
        return handleFailure(run, errorCode, policy);
      } catch (e) {
        mapRuntimeError(e);
      }
    },
    resumeAfterRetry(run) {
      try {
        return resumeAfterRetry(run);
      } catch (e) {
        mapRuntimeError(e);
      }
    },
    sealArtifact(artifactId, version, tenantId, schemaOk) {
      try {
        return sealArtifact(artifactId, version, tenantId, schemaOk);
      } catch (e) {
        mapRuntimeError(e);
      }
    },
    acceptHandoff(artifact, consumerTenantId) {
      try {
        return acceptHandoff(artifact, consumerTenantId);
      } catch (e) {
        mapRuntimeError(e);
      }
    },
  };
}
