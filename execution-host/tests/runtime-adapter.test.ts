/**
 * SPRINT-EXECUTION-HOST-001 — Group E Runtime adapter tests.
 */
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
  HostError,
  createRuntimeAdapter,
  RUNTIME_SYMBOLS_USED,
} from "../src/index.js";

beforeEach(() => {
  clear();
});

function withTenant(id = "tenant-a"): void {
  propagate(createTenancyContext(createTenantId(id)));
}

test("runtime adapter: inventory lists public symbols only", () => {
  assert.ok(RUNTIME_SYMBOLS_USED.includes("admitRun"));
  assert.ok(RUNTIME_SYMBOLS_USED.includes("sealArtifact"));
  assert.equal(RUNTIME_SYMBOLS_USED.includes("bindContract" as never), false);
});

test("runtime adapter: admit/start preserves audit context", () => {
  withTenant();
  const audit = createMemoryAuditSink();
  const rt = createRuntimeAdapter();
  let run = rt.admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: "research-agent@2.0.0",
    audit,
  });
  assert.equal(run.state, "CREATED");
  assert.equal(run.ctx.audit, audit);
  run = rt.startRun(run);
  assert.equal(run.state, "RUNNING");
  const types = audit.list().map((e) => e.type);
  assert.ok(types.includes("runtime.run.admitted"));
  assert.ok(types.includes("runtime.run.transition"));
});

test("runtime adapter: missing contract pin maps to HostError", () => {
  withTenant();
  const audit = createMemoryAuditSink();
  const rt = createRuntimeAdapter();
  assert.throws(
    () => rt.admitRun({ pipelineId: "knowledge-ingestion", audit }),
    (err: unknown) => {
      assert.ok(err instanceof HostError);
      assert.equal(err.code, "RUNTIME_ERROR");
      return true;
    },
  );
});

test("runtime adapter: illegal transition fail closed", () => {
  withTenant();
  const audit = createMemoryAuditSink();
  const rt = createRuntimeAdapter();
  const run = rt.admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: "c@1",
    audit,
  });
  assert.throws(
    () => rt.transition(run, "SUCCEEDED"),
    (err: unknown) => {
      assert.ok(err instanceof HostError);
      assert.equal(err.code, "RUNTIME_ILLEGAL_TRANSITION");
      return true;
    },
  );
});

test("runtime adapter: unsealed handoff rejected", () => {
  const rt = createRuntimeAdapter();
  assert.throws(
    () =>
      rt.acceptHandoff(
        {
          artifactId: "a",
          version: "1",
          sealed: false,
          schemaOk: true,
          tenantId: "tenant-a",
        },
        "tenant-a",
      ),
    (err: unknown) => {
      assert.ok(err instanceof HostError);
      assert.equal(err.code, "RUNTIME_HANDOFF_ERROR");
      return true;
    },
  );
});

test("runtime adapter: seal then accept handoff", () => {
  const rt = createRuntimeAdapter();
  const sealed = rt.sealArtifact("a1", "1.0.0", "tenant-a", true);
  const accepted = rt.acceptHandoff(sealed, "tenant-a");
  assert.equal(accepted.sealed, true);
});
