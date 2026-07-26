/**
 * SPRINT-EXECUTION-HOST-001 — Phase 1/3 scaffold surface tests.
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  createExecutionHost,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
} from "../src/index.js";

beforeEach(() => clear());

test("scaffold: MVP pipeline pin constants (T-A3)", () => {
  assert.equal(MVP_PIPELINE_ID, "knowledge-ingestion");
  assert.equal(MVP_PIPELINE_VERSION, "2.0.0");
});

test("scaffold: createExecutionHost exposes public surface (T-B3/H)", () => {
  const host = createExecutionHost();
  assert.equal(typeof host.createRun, "function");
  assert.equal(typeof host.getRun, "function");
  assert.equal(typeof host.resumeHuman, "function");
  assert.equal(typeof host.applyKnowledgeAuthorized, "function");
  assert.equal(typeof host.applyGraphAuthorized, "function");
});

test("scaffold: createRun drives to waiting_human", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const host = createExecutionHost();
  const run = await host.createRun({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    bootstrap: { question: "phase3" },
    tenant_id: "tenant-a",
    caller_id: "c1",
    correlation_id: "corr-scaffold",
  });
  assert.equal(run.status, "waiting_human");
  assert.ok(run.lineage.research_brief_ref);
  assert.ok(run.lineage.proposal_ref);
});
