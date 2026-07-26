/**
 * SPRINT-EXECUTION-HOST-001 — Group I audit tests.
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
  assertAuditOrder,
  createRuntimeAdapter,
  createSdkAdapter,
  createResearchEngineAdapter,
  createSealedArtifactStore,
  HostAuditType,
  loadPipeline,
  runStageExecutor,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
} from "../src/index.js";

beforeEach(() => clear());

test("audit: emission and ordering through executor pause", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const sink = createMemoryAuditSink();
  const rt = createRuntimeAdapter();
  const sdk = createSdkAdapter();
  const research = createResearchEngineAdapter();
  const artifacts = createSealedArtifactStore();
  const { definition, pin } = loadPipeline({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
  });
  let run = rt.admitRun({
    pipelineId: pin.pipeline_id,
    contractPin: "research-agent@2.0.0",
    audit: sink,
  });
  run = rt.startRun(run);

  await runStageExecutor(run, {
    runtime: rt,
    sdk,
    definition,
    pin,
    correlation_id: "audit-corr",
    tenant_id: "tenant-a",
    auditSink: sink,
    bootstrap: { question: "audit", id: "brief-audit" },
    research,
    artifacts,
  });

  const types = sink.list().map((e) => e.type);
  assert.ok(types.includes("runtime.run.admitted"));
  assert.ok(types.includes(HostAuditType.RUN_ADMITTED));
  assert.ok(types.includes(HostAuditType.STAGE_STARTED));
  assert.ok(types.includes(HostAuditType.HANDOFF));
  assert.ok(types.includes(HostAuditType.REVIEW_GATE));
  assert.ok(types.includes(HostAuditType.HUMAN_GATE_OPENED));

  assertAuditOrder(types, [
    HostAuditType.RUN_ADMITTED,
    HostAuditType.STAGE_STARTED,
    HostAuditType.REVIEW_GATE,
    HostAuditType.HANDOFF,
    HostAuditType.HUMAN_GATE_OPENED,
  ]);
});
