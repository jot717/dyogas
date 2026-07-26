import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { createMemoryAuditSink } from "@dyogas/trust";
import {
  acceptHandoff,
  admitRun,
  assertLegalTransition,
  handleFailure,
  HandoffError,
  IllegalTransitionError,
  resumeAfterRetry,
  RuntimeError,
  sealArtifact,
  startRun,
  succeed,
  transition,
} from "../src/index.js";

beforeEach(() => {
  clear();
});

function withTenant(id = "tenant-a"): void {
  propagate(createTenancyContext(createTenantId(id)));
}

test("admit requires contract pin", () => {
  withTenant();
  const audit = createMemoryAuditSink();
  assert.throws(
    () => admitRun({ pipelineId: "knowledge-ingestion", audit }),
    RuntimeError,
  );
});

test("happy path with audit emissions", () => {
  withTenant();
  const audit = createMemoryAuditSink();
  let run = admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: "research-agent@1.0.0",
    audit,
  });
  assert.equal(run.state, "CREATED");
  run = startRun(run);
  assert.equal(run.state, "RUNNING");
  run = succeed(run);
  assert.equal(run.state, "SUCCEEDED");
  const types = audit.list().map((e) => e.type);
  assert.ok(types.includes("runtime.run.admitted"));
  assert.ok(types.includes("runtime.run.transition"));
});

test("illegal transitions fail closed", () => {
  assert.throws(() => assertLegalTransition("SUCCEEDED", "RUNNING"), IllegalTransitionError);
  assert.throws(() => assertLegalTransition("CREATED", "SUCCEEDED"), IllegalTransitionError);
  withTenant();
  const audit = createMemoryAuditSink();
  const run = admitRun({
    pipelineId: "p",
    contractPin: "c@1",
    audit,
  });
  assert.throws(() => transition(run, "SUCCEEDED"), IllegalTransitionError);
});

test("retryable vs non-retryable", () => {
  withTenant();
  const audit = createMemoryAuditSink();
  let run = startRun(
    admitRun({ pipelineId: "p", contractPin: "c@1", audit }),
  );
  run = handleFailure(run, "RATE_LIMIT");
  assert.equal(run.state, "WAITING_RETRY");
  run = resumeAfterRetry(run);
  run = handleFailure(run, "SCHEMA_INVALID");
  assert.equal(run.state, "FAILED");
});

test("handoff rejects unsealed and tenancy mismatch", () => {
  const sealed = sealArtifact("a1", "1", "tenant-a", true);
  assert.equal(acceptHandoff(sealed, "tenant-a").sealed, true);
  assert.throws(
    () => acceptHandoff({ ...sealed, sealed: false }, "tenant-a"),
    HandoffError,
  );
  assert.throws(() => acceptHandoff(sealed, "tenant-b"), /TENANCY/);
});
