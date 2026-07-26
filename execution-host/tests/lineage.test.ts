/**
 * SPRINT-EXECUTION-HOST-001 — Group G lineage tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HostError,
  appendLineage,
  assertNotOrphan,
  createLineageContext,
  requireApprovalBeforeApply,
  toLineageSnapshot,
  TRUSTED_PATH_ORDER,
} from "../src/index.js";

function baseCtx() {
  return createLineageContext({
    correlation_id: "c1",
    tenant_id: "tenant-a",
    run_id: "run-1",
    pipeline_id: "knowledge-ingestion",
  });
}

function seedToProposal(ctx: ReturnType<typeof baseCtx>) {
  appendLineage(ctx, {
    kind: "ResearchBrief",
    artifact_id: "brief-1",
    version: "1.0.0",
    pipeline_id: "knowledge-ingestion",
    run_id: "run-1",
    stage_id: "0",
    tenant_id: "tenant-a",
    correlation_id: "c1",
  });
  appendLineage(ctx, {
    kind: "ResearchReport",
    artifact_id: "rr-1",
    version: "1.0.0",
    pipeline_id: "knowledge-ingestion",
    run_id: "run-1",
    stage_id: "1",
    tenant_id: "tenant-a",
    correlation_id: "c1",
  });
  appendLineage(ctx, {
    kind: "ValidationReport",
    artifact_id: "vr-1",
    version: "1.0.0",
    pipeline_id: "knowledge-ingestion",
    run_id: "run-1",
    stage_id: "2",
    tenant_id: "tenant-a",
    correlation_id: "c1",
  });
  appendLineage(ctx, {
    kind: "Proposal",
    artifact_id: "pr-1",
    version: "1.0.0",
    pipeline_id: "knowledge-ingestion",
    run_id: "run-1",
    stage_id: "3",
    tenant_id: "tenant-a",
    correlation_id: "c1",
  });
}

test("lineage: propagates Brief → Report with metadata", () => {
  const ctx = baseCtx();
  const brief = appendLineage(ctx, {
    kind: "ResearchBrief",
    artifact_id: "brief-1",
    version: "1.0.0",
    pipeline_id: "knowledge-ingestion",
    run_id: "run-1",
    stage_id: "0",
    tenant_id: "tenant-a",
    correlation_id: "c1",
  });
  assert.equal(brief.correlation_id, "c1");
  assert.ok(brief.digest.length > 10);
  assert.equal(brief.parent_ids.length, 0);

  const report = appendLineage(ctx, {
    kind: "ResearchReport",
    artifact_id: "rr-1",
    version: "1.0.0",
    pipeline_id: "knowledge-ingestion",
    run_id: "run-1",
    stage_id: "1",
    tenant_id: "tenant-a",
    correlation_id: "c1",
  });
  assert.deepEqual(report.parent_ids, ["brief-1"]);
  assert.equal(TRUSTED_PATH_ORDER[0], "ResearchBrief");
});

test("lineage: orphan rejection", () => {
  const ctx = baseCtx();
  appendLineage(ctx, {
    kind: "ResearchBrief",
    artifact_id: "brief-1",
    version: "1.0.0",
    pipeline_id: "knowledge-ingestion",
    run_id: "run-1",
    stage_id: "0",
    tenant_id: "tenant-a",
    correlation_id: "c1",
  });
  assert.throws(
    () => assertNotOrphan(ctx, "ResearchReport", ["missing-parent"]),
    (e: unknown) => e instanceof HostError && e.code === "LINEAGE_ORPHAN",
  );
  assert.throws(
    () =>
      appendLineage(ctx, {
        kind: "ResearchReport",
        artifact_id: "rr-1",
        version: "1.0.0",
        pipeline_id: "knowledge-ingestion",
        run_id: "run-1",
        stage_id: "1",
        tenant_id: "tenant-a",
        correlation_id: "c1",
        parent_ids: ["wrong"],
      }),
    (e: unknown) => e instanceof HostError && e.code === "LINEAGE_ORPHAN",
  );
});

test("lineage: cross-tenant fail closed", () => {
  const ctx = baseCtx();
  appendLineage(ctx, {
    kind: "ResearchBrief",
    artifact_id: "brief-1",
    version: "1.0.0",
    pipeline_id: "knowledge-ingestion",
    run_id: "run-1",
    stage_id: "0",
    tenant_id: "tenant-a",
    correlation_id: "c1",
  });
  assert.throws(
    () =>
      appendLineage(ctx, {
        kind: "ResearchReport",
        artifact_id: "rr-1",
        version: "1.0.0",
        pipeline_id: "knowledge-ingestion",
        run_id: "run-1",
        stage_id: "1",
        tenant_id: "tenant-b",
        correlation_id: "c1",
      }),
    (e: unknown) =>
      e instanceof HostError && e.code === "LINEAGE_TENANCY_VIOLATION",
  );
});

test("lineage: apply blocked without approval", () => {
  const ctx = baseCtx();
  seedToProposal(ctx);
  assert.throws(
    () => requireApprovalBeforeApply(ctx),
    (e: unknown) =>
      e instanceof HostError && e.code === "LINEAGE_APPROVAL_REQUIRED",
  );
  appendLineage(ctx, {
    kind: "HumanReviewDecision",
    artifact_id: "hrd-1",
    version: "1.0.0",
    pipeline_id: "knowledge-ingestion",
    run_id: "run-1",
    stage_id: "4",
    tenant_id: "tenant-a",
    correlation_id: "c1",
  });
  const snap = toLineageSnapshot(ctx);
  assert.ok(snap.proposal_ref);
  assert.ok(snap.human_decision_ref);
  requireApprovalBeforeApply(ctx);
});
