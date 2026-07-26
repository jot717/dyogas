/**
 * SPRINT-EXECUTION-HOST-001 — Group D stage executor lifecycle tests.
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
  createSdkAdapter,
  createResearchEngineAdapter,
  createSealedArtifactStore,
  loadPipeline,
  runStageExecutor,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
} from "../src/index.js";

beforeEach(() => {
  clear();
});

function withTenant(id = "tenant-a"): void {
  propagate(createTenancyContext(createTenantId(id)));
}

async function admitRunning() {
  withTenant();
  const audit = createMemoryAuditSink();
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
    audit,
  });
  run = rt.startRun(run);
  return { rt, sdk, definition, pin, run, audit, research, artifacts };
}

test("executor: pauses at Human Gate before later stages", async () => {
  const { rt, sdk, definition, pin, run, audit, research, artifacts } =
    await admitRunning();
  const order: string[] = [];
  const result = await runStageExecutor(run, {
    runtime: rt,
    sdk,
    definition,
    pin,
    correlation_id: "corr-1",
    tenant_id: "tenant-a",
    auditSink: audit,
    bootstrap: { question: "executor order", id: "brief-corr-1" },
    research,
    artifacts,
    hooks: {
      executeStage: async ({ stage }) => {
        order.push(stage.name);
      },
    },
  });
  assert.equal(result.status, "waiting_human");
  if (result.status === "waiting_human") {
    assert.equal(result.humanGate.stage.name, "Human Review");
    assert.equal(result.humanGate.status, "paused");
  }
  assert.deepEqual(order, ["Research", "Validation", "Proposal", "Human Review"]);
  assert.equal(result.stagesCompleted, 3);
  assert.equal(result.lineage.correlation_id, "corr-1");
  assert.ok(result.lineage.records.some((r) => r.kind === "Proposal"));
});

test("executor: review gate fail stops progression (no further stages)", async () => {
  const { rt, sdk, definition, pin, run, audit, research, artifacts } =
    await admitRunning();
  const order: string[] = [];
  const result = await runStageExecutor(run, {
    runtime: rt,
    sdk,
    definition,
    pin,
    correlation_id: "corr-2",
    tenant_id: "tenant-a",
    auditSink: audit,
    bootstrap: { question: "review gate", id: "brief-corr-2" },
    research,
    artifacts,
    hooks: {
      executeStage: async ({ stage }) => {
        order.push(stage.name);
      },
      reviewGate: ({ stage }) =>
        stage.name === "Validation"
          ? { ok: false, code: "REVIEW_GATE_FAIL" }
          : { ok: true },
    },
  });
  assert.equal(result.status, "failed");
  if (result.status === "failed") {
    assert.equal(result.code, "REVIEW_GATE_FAIL");
  }
  assert.deepEqual(order, ["Research", "Validation"]);
  assert.equal(result.runtime.state, "FAILED");
});

test("executor: unsealed handoff rejected via Runtime adapter", async () => {
  const rt = createRuntimeAdapter();
  assert.throws(
    () =>
      rt.acceptHandoff(
        {
          artifactId: "x",
          version: "1",
          sealed: false,
          schemaOk: true,
          tenantId: "tenant-a",
        },
        "tenant-a",
      ),
    (err: unknown) => err instanceof HostError && err.code === "RUNTIME_HANDOFF_ERROR",
  );
});

test("executor: stages run in loader order only (no planning)", async () => {
  const { rt, sdk, definition, pin, run, audit, research, artifacts } =
    await admitRunning();
  const indexes: number[] = [];
  await runStageExecutor(run, {
    runtime: rt,
    sdk,
    definition,
    pin,
    correlation_id: "corr-3",
    tenant_id: "tenant-a",
    auditSink: audit,
    bootstrap: { question: "indexes", id: "brief-corr-3" },
    research,
    artifacts,
    hooks: {
      executeStage: async ({ stage }) => {
        indexes.push(stage.index);
      },
    },
  });
  assert.deepEqual(indexes, [1, 2, 3, 4]);
  for (let i = 1; i < indexes.length; i++) {
    assert.ok(indexes[i]! > indexes[i - 1]!);
  }
});
