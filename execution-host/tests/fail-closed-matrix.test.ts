/**
 * SPRINT-EXECUTION-HOST-001 — T-J2 formal fail-closed / boundary matrix.
 * Aggregates required fail-closed proofs (no new product features).
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
  appendLineage,
  createExecutionHost,
  createLineageContext,
  createRuntimeAdapter,
  loadPipeline,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
} from "../src/index.js";

beforeEach(() => clear());

test("fail-closed: unknown pipeline", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const host = createExecutionHost();
  await assert.rejects(
    () =>
      host.createRun({
        pipeline_id: "unknown-pipeline",
        pipeline_version: "1.0.0",
        bootstrap: {},
        tenant_id: "tenant-a",
        caller_id: "c",
        correlation_id: "fc-1",
      }),
    (e: unknown) => e instanceof HostError && e.code === "PIPELINE_UNKNOWN",
  );
});

test("fail-closed: illegal handoff (unsealed)", () => {
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
    (e: unknown) => e instanceof HostError && e.code === "RUNTIME_HANDOFF_ERROR",
  );
});

test("fail-closed: cross-tenant lineage", () => {
  const ctx = createLineageContext({
    correlation_id: "fc",
    tenant_id: "tenant-a",
    run_id: "r1",
    pipeline_id: MVP_PIPELINE_ID,
  });
  appendLineage(ctx, {
    kind: "ResearchBrief",
    artifact_id: "b1",
    version: "1.0.0",
    pipeline_id: MVP_PIPELINE_ID,
    run_id: "r1",
    stage_id: "0",
    tenant_id: "tenant-a",
    correlation_id: "fc",
  });
  assert.throws(
    () =>
      appendLineage(ctx, {
        kind: "ResearchReport",
        artifact_id: "rr",
        version: "1.0.0",
        pipeline_id: MVP_PIPELINE_ID,
        run_id: "r1",
        stage_id: "1",
        tenant_id: "tenant-b",
        correlation_id: "fc",
      }),
    (e: unknown) =>
      e instanceof HostError && e.code === "LINEAGE_TENANCY_VIOLATION",
  );
});

test("fail-closed: agent auto-approve attempt", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const sink = createMemoryAuditSink();
  const host = createExecutionHost({ auditSink: sink });
  const run = await host.createRun({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    bootstrap: {},
    tenant_id: "tenant-a",
    caller_id: "c",
    correlation_id: "fc-agent",
    audit_sink: sink,
  });
  await assert.rejects(
    () =>
      host.resumeHuman(
        run.run_id,
        { outcome: "approved", actor_id: "bot" },
        "agent",
      ),
    (e: unknown) => e instanceof HostError && e.code === "HUMAN_ACTOR_REQUIRED",
  );
});

test("fail-closed: version pin mismatch", () => {
  assert.throws(
    () =>
      loadPipeline({
        pipeline_id: MVP_PIPELINE_ID,
        pipeline_version: "0.0.1",
      }),
    (e: unknown) =>
      e instanceof HostError && e.code === "PIPELINE_VERSION_MISMATCH",
  );
});
