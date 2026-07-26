/**
 * SPRINT-HOST-RESEARCH-INTEGRATION-001 — H-05 integration + fail-closed matrix.
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
  createExecutionHost,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
  validateResearchReportCandidate,
} from "../src/index.js";
import type { ResearchExecuteResult } from "@dyogas/research-engine";

beforeEach(() => clear());

function withTenant(id = "tenant-research"): void {
  propagate(createTenancyContext(createTenantId(id)));
}

test("H-05 T1–T5: Host invokes ResearchEngine; Report generated, validated, sealed, lineaged", async () => {
  withTenant();
  let engineCalls = 0;
  const { execute: realExecute } = await import("@dyogas/research-engine");
  const host = createExecutionHost({
    auditSink: createMemoryAuditSink(),
    researchExecuteFn: async (opts) => {
      engineCalls += 1;
      return realExecute(opts);
    },
  });
  const run = await host.createRun({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    bootstrap: {
      id: "brief-real-engine",
      question: "Evidence for Host Research Engine integration?",
      allowed_source_classes: ["web"],
      budget: { max_items: 2 },
      scope: "host-integration",
    },
    tenant_id: "tenant-research",
    caller_id: "owner-1",
    correlation_id: "corr-real-engine",
  });

  // Test 1 — Engine actually invoked
  assert.equal(engineCalls, 1, "ResearchEngine.execute must be invoked exactly once");

  assert.equal(run.status, "waiting_human");
  assert.ok(run.lineage.research_brief_ref?.startsWith("brief-real-engine"));

  // Test 5 — lineage contains ResearchReport reference (not synthetic)
  assert.ok(run.lineage.research_report_ref);
  assert.notEqual(
    run.lineage.research_report_ref,
    "knowledge-ingestion-stage-1",
  );
  assert.equal(
    run.lineage.research_report_ref!.includes("knowledge-ingestion-stage-1"),
    false,
  );

  const reportRef = run.lineage.research_report_ref!.split("@")[0]!;
  const sealed = host.getSealedArtifact(reportRef, "tenant-research");

  // Test 2 + Test 4 — artifact generated + seal exists
  assert.ok(sealed, "sealed ResearchReport artifact must exist");
  assert.equal(sealed.kind, "ResearchReport");
  assert.equal(sealed.sealed, true);
  assert.equal(sealed.schema_ok, true);
  assert.equal(sealed.brief_ref, "brief-real-engine");
  assert.equal(sealed.run_id, run.run_id);

  // Test 3 — schema validation
  const schema = validateResearchReportCandidate(sealed.payload);
  assert.equal(schema.ok, true);
  assert.ok(Array.isArray(sealed.payload.evidence_items));
  assert.ok((sealed.payload.evidence_items as unknown[]).length > 0);
  assert.equal(
    (sealed.payload.brief_ref as { brief_id: string }).brief_id,
    "brief-real-engine",
  );
});

test("H-05 T6: Personal Brain consumer pattern reads sealed ResearchReport via Host only", async () => {
  /**
   * Simulates PB consume: createRun through Host → resolve lineage ref →
   * getSealedArtifact. No direct Research Engine call from product.
   */
  withTenant("tenant-pb-consume");
  let engineCalls = 0;
  const { execute: realExecute } = await import("@dyogas/research-engine");
  const host = createExecutionHost({
    researchExecuteFn: async (opts) => {
      engineCalls += 1;
      return realExecute(opts);
    },
  });

  const run = await host.createRun({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    bootstrap: {
      id: "brief-pb-consume",
      question: "PB consumer must read sealed ResearchReport body",
      allowed_source_classes: ["web"],
      budget: { max_items: 2 },
      scope: "personal-brain workspace:ws-consume",
      tenancy: { tenant_id: "tenant-pb-consume", workspace_id: "ws-consume" },
    },
    tenant_id: "tenant-pb-consume",
    caller_id: "owner-pb",
    correlation_id: "corr-pb-consume",
  });

  assert.equal(engineCalls, 1);
  assert.ok(run.lineage.research_report_ref);

  const artifactId = run.lineage.research_report_ref!.split("@")[0]!;
  const report = host.getSealedArtifact(artifactId, "tenant-pb-consume");
  assert.ok(report);
  assert.equal(report.kind, "ResearchReport");
  assert.equal(report.sealed, true);
  assert.ok(
    validateResearchReportCandidate(report.payload).ok,
    "PB consumer must receive schema-valid ResearchReport payload",
  );
  assert.ok(
    (report.payload.evidence_items as unknown[]).length > 0,
    "PB consumer must see engine-produced evidence_items",
  );
});

test("H-05: mock-only / no-engine path fails closed when execute never runs", async () => {
  withTenant("tenant-no-engine");
  const host = createExecutionHost({
    researchExecuteFn: async () => {
      throw new Error("engine not executed");
    },
  });
  const run = await host.createRun({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    bootstrap: {
      id: "brief-no-engine",
      question: "must fail",
      allowed_source_classes: ["web"],
      budget: { max_items: 1 },
    },
    tenant_id: "tenant-no-engine",
    caller_id: "owner-1",
    correlation_id: "corr-no-engine",
  });
  assert.equal(run.status, "failed");
  assert.equal(run.lineage.research_report_ref, undefined);
});

test("H-05: engine failure fails closed — no ResearchReport lineage", async () => {
  withTenant("tenant-fail-engine");
  const host = createExecutionHost({
    researchExecuteFn: async () => {
      throw new Error("collector boom");
    },
  });
  const run = await host.createRun({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    bootstrap: {
      id: "brief-fail-engine",
      question: "should fail",
      allowed_source_classes: ["web"],
      budget: { max_items: 1 },
    },
    tenant_id: "tenant-fail-engine",
    caller_id: "owner-1",
    correlation_id: "corr-fail-engine",
  });
  assert.equal(run.status, "failed");
  assert.equal(run.lineage.research_report_ref, undefined);
  assert.equal(
    host.getSealedArtifact("any", "tenant-fail-engine"),
    undefined,
  );
});

test("H-05: schema validation failure fails closed — no seal", async () => {
  withTenant("tenant-fail-schema");
  const host = createExecutionHost({
    researchExecuteFn: async (): Promise<ResearchExecuteResult> =>
      ({
        task: {
          taskId: "t1",
          tenantId: "tenant-fail-schema",
          brief: {
            question: "q",
            allowedSourceClasses: ["web"],
            maxItems: 1,
          },
          createdAt: new Date().toISOString(),
          status: "ready_for_review",
        },
        evidence: [],
        candidate: {
          // missing open_questions — invalid
          brief_ref: { brief_id: "brief-bad" },
          evidence_items: [],
          coverage_gaps: [],
        } as unknown as ResearchExecuteResult["candidate"],
      }),
  });
  const run = await host.createRun({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    bootstrap: {
      id: "brief-fail-schema",
      question: "schema fail",
      allowed_source_classes: ["web"],
      budget: { max_items: 1 },
    },
    tenant_id: "tenant-fail-schema",
    caller_id: "owner-1",
    correlation_id: "corr-fail-schema",
  });
  assert.equal(run.status, "failed");
  assert.equal(run.lineage.research_report_ref, undefined);
});

test("H-05: SDK emit failure fails closed — no ResearchReport lineage", async () => {
  withTenant("tenant-fail-sdk");
  const {
    createRuntimeAdapter,
    createSdkAdapter,
    createResearchEngineAdapter,
    createSealedArtifactStore,
    loadPipeline,
    runStageExecutor,
    MVP_PIPELINE_ID,
    MVP_PIPELINE_VERSION,
    HostError,
  } = await import("../src/index.js");

  const rt = createRuntimeAdapter();
  const baseSdk = createSdkAdapter();
  const sdk = {
    ...baseSdk,
    emitCandidate: () => {
      throw new HostError("SDK_CANDIDATE_ERROR", "emit refused");
    },
  };
  const research = createResearchEngineAdapter();
  const artifacts = createSealedArtifactStore();
  const { definition, pin } = loadPipeline({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
  });
  let run = rt.admitRun({
    pipelineId: pin.pipeline_id,
    contractPin: "research-agent@2.0.0",
    audit: createMemoryAuditSink(),
  });
  run = rt.startRun(run);
  const result = await runStageExecutor(run, {
    runtime: rt,
    sdk,
    definition,
    pin,
    correlation_id: "corr-fail-sdk",
    tenant_id: "tenant-fail-sdk",
    auditSink: createMemoryAuditSink(),
    bootstrap: { question: "sdk fail", id: "brief-sdk-fail" },
    research,
    artifacts,
  });
  assert.equal(result.status, "failed");
  if (result.status === "failed") {
    assert.equal(result.code, "SDK_CANDIDATE_ERROR");
  }
  assert.equal(
    result.lineage.records.some((r) => r.kind === "ResearchReport"),
    false,
  );
});

test("validateResearchReportCandidate: accepts engine-shaped empty evidence", () => {
  const ok = validateResearchReportCandidate({
    brief_ref: { brief_id: "b1", question: "q" },
    evidence_items: [],
    coverage_gaps: ["no evidence collected"],
    open_questions: [],
  });
  assert.equal(ok.ok, true);
});
