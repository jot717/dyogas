/**
 * SPRINT-EXECUTION-HOST-001 — Group H human approval / token tests.
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
  HostAuditType,
  createExecutionHost,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
} from "../src/index.js";

beforeEach(() => clear());

function withTenant(): void {
  propagate(createTenancyContext(createTenantId("tenant-a")));
}

async function pausedRun() {
  withTenant();
  const sink = createMemoryAuditSink();
  const host = createExecutionHost({ auditSink: sink });
  const run = await host.createRun({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    bootstrap: { question: "q", id: "brief-x" },
    tenant_id: "tenant-a",
    caller_id: "owner-1",
    correlation_id: "h-corr",
    audit_sink: sink,
  });
  assert.equal(run.status, "waiting_human");
  return { host, run, sink };
}

test("approval: agent cannot approve", async () => {
  const { host, run } = await pausedRun();
  await assert.rejects(
    () =>
      host.resumeHuman(
        run.run_id,
        { outcome: "approved", actor_id: "agent-bot" },
        "agent",
      ),
    (e: unknown) => e instanceof HostError && e.code === "HUMAN_ACTOR_REQUIRED",
  );
});

test("approval: resume approved mints token; reject has no apply", async () => {
  const { host, run, sink } = await pausedRun();
  const approved = await host.resumeHuman(run.run_id, {
    outcome: "approved",
    actor_id: "human-owner",
  });
  assert.equal(approved.status, "applying");
  assert.ok(approved.lineage.human_decision_ref);
  assert.ok(approved.lineage.proposal_ref);

  const types = sink.list().map((e) => e.type);
  assert.ok(types.includes(HostAuditType.HUMAN_DECISION));
  assert.ok(types.includes(HostAuditType.RESUME));

  const kn = await host.applyKnowledgeAuthorized(run.run_id);
  assert.ok(kn.lineage.knowledge_ref);

  await assert.rejects(
    () => host.applyKnowledgeAuthorized(run.run_id),
    (e: unknown) => e instanceof HostError && e.code === "APPLY_TOKEN_REUSED",
  );

  const gu = await host.applyGraphAuthorized(run.run_id);
  assert.ok(gu.lineage.graph_update_ref);
  assert.equal(gu.status, "succeeded");
});

test("approval: token single-use; second graph fails closed", async () => {
  const { host, run } = await pausedRun();
  await host.resumeHuman(run.run_id, {
    outcome: "approved",
    actor_id: "human-owner",
  });
  await host.applyKnowledgeAuthorized(run.run_id);
  await host.applyGraphAuthorized(run.run_id);
  await assert.rejects(
    () => host.applyGraphAuthorized(run.run_id),
    (e: unknown) => e instanceof HostError && e.code === "LINEAGE_ORDER_VIOLATION",
  );
});

test("approval: consumed token id presented to graph is rejected", async () => {
  withTenant();
  const sink = createMemoryAuditSink();
  const {
    createRuntimeAdapter,
    createSdkAdapter,
    createResearchEngineAdapter,
    createSealedArtifactStore,
    loadPipeline,
    runStageExecutor,
    resumeHumanGate,
    createHostAudit,
    authorizeKnowledgeApply,
    authorizeGraphApply,
    MVP_PIPELINE_ID: pid,
    MVP_PIPELINE_VERSION: pver,
  } = await import("../src/index.js");

  const rt = createRuntimeAdapter();
  const sdk = createSdkAdapter();
  const research = createResearchEngineAdapter();
  const artifacts = createSealedArtifactStore();
  const { definition, pin } = loadPipeline({
    pipeline_id: pid,
    pipeline_version: pver,
  });
  let run = rt.admitRun({
    pipelineId: pin.pipeline_id,
    contractPin: "research-agent@2.0.0",
    audit: sink,
  });
  run = rt.startRun(run);
  const exec = await runStageExecutor(run, {
    runtime: rt,
    sdk,
    definition,
    pin,
    correlation_id: "tok-corr",
    tenant_id: "tenant-a",
    auditSink: sink,
    bootstrap: { question: "token reuse", id: "brief-tok" },
    research,
    artifacts,
  });
  assert.equal(exec.status, "waiting_human");
  if (exec.status !== "waiting_human") return;
  const audit = createHostAudit(sink);
  resumeHumanGate(
    exec.humanGate,
    { outcome: "approved", actor_id: "human-owner" },
    "human",
    audit,
  );
  const token = authorizeKnowledgeApply(exec.humanGate, audit);
  assert.equal(token.consumed, true);
  assert.throws(
    () => authorizeGraphApply(exec.humanGate, audit, token.token_id),
    (e: unknown) => e instanceof HostError && e.code === "APPLY_TOKEN_REUSED",
  );
});


test("approval: reject → no knowledge apply", async () => {
  const { host, run } = await pausedRun();
  const rejected = await host.resumeHuman(run.run_id, {
    outcome: "rejected",
    actor_id: "human-owner",
  });
  assert.equal(rejected.status, "failed");
  await assert.rejects(
    () => host.applyKnowledgeAuthorized(run.run_id),
    (e: unknown) =>
      e instanceof HostError &&
      (e.code === "APPLY_TOKEN_REQUIRED" || e.code === "APPLY_TOKEN_REQUIRED"),
  );
});

test("approval: request_changes table outcome", async () => {
  const { host, run } = await pausedRun();
  const r = await host.resumeHuman(run.run_id, {
    outcome: "request_changes",
    actor_id: "human-owner",
  });
  assert.equal(r.status, "cancelled");
  await assert.rejects(() => host.applyKnowledgeAuthorized(run.run_id));
});

test("fail closed: createRun unknown pipeline", async () => {
  withTenant();
  const host = createExecutionHost();
  await assert.rejects(
    () =>
      host.createRun({
        pipeline_id: "nope",
        pipeline_version: "1.0.0",
        bootstrap: {},
        tenant_id: "tenant-a",
        caller_id: "c",
        correlation_id: "x",
      }),
    (e: unknown) => e instanceof HostError && e.code === "PIPELINE_UNKNOWN",
  );
});
