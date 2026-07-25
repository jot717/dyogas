/**
 * C-04 — Execute Research Agent via Host tests.
 */

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { clear, createTenantId, createTenancyContext, propagate } from "@dyogas/kernel";
import { HostError, type CreateRunRequest, type HostRun } from "@dyogas/execution-host";
import {
  RESEARCH_REPORT_ARTIFACT_TYPE,
  assertHostResearchReport,
  executeResearchViaHost,
} from "../src/bridge/execute-research.js";
import { PersonalBrainError } from "../src/workspace.js";
import type { ResearchRequest } from "../src/bridge/research-request.js";

const baseRequest: ResearchRequest = {
  intent: "Research AI Agent market",
  workspace_id: "ws-1",
  owner_id: "owner-1",
  tenant_id: "tenant-a",
  correlation_id: "corr-c04",
};

beforeEach(() => clear());

test("C-04-T1: Host execution succeeds with ResearchReport lineage ref", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const result = await executeResearchViaHost(baseRequest);
  assert.equal(result.researchReport.artifact_type, RESEARCH_REPORT_ARTIFACT_TYPE);
  assert.ok(result.researchReport.research_report_ref.length > 0);
  assert.equal(result.researchReport.production_mode, "host_mvp_lineage_seal");
  assert.ok(
    ["waiting_human", "running", "succeeded"].includes(result.bridge.hostRun.status) ||
      result.bridge.hostRun.status === "failed",
  );
  // Success path for this Host MVP: report ref present (not terminal failed without report)
  assert.notEqual(result.bridge.hostRun.status, "failed");
});

test("C-04-T2: artifact type is ResearchReport (Host lineage slot)", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const result = await executeResearchViaHost(baseRequest);
  assert.equal(result.researchReport.artifact_type, "ResearchReport");
});

test("C-04-T3: lineage references Brief and Run", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const result = await executeResearchViaHost(baseRequest);
  assert.ok(result.researchReport.research_brief_ref);
  assert.equal(result.researchReport.run_id, result.bridge.hostRun.run_id);
  assert.equal(result.researchReport.correlation_id, "corr-c04");
  assert.equal(result.researchReport.run_id, result.bridge.bootstrap.run_id);
  assert.equal(result.path.research_report_ref, result.researchReport.research_report_ref);
});

test("C-04-T4: Host failures propagate fail-closed", async () => {
  const mockHost = {
    async createRun(_req: CreateRunRequest): Promise<HostRun> {
      throw new HostError("PIPELINE_UNKNOWN", "refused");
    },
  };
  await assert.rejects(
    () => executeResearchViaHost(baseRequest, { host: mockHost }),
    (err: unknown) => err instanceof PersonalBrainError,
  );
});

test("C-04-T5: fail closed if Host returns run without ResearchReport ref", () => {
  const hostRun: HostRun = {
    run_id: "run-1",
    pin: { pipeline_id: "knowledge-ingestion", pipeline_version: "2.0.0" },
    status: "failed",
    lineage: {
      correlation_id: "c",
      research_brief_ref: "brief-only",
    },
  };
  assert.throws(
    () => assertHostResearchReport(hostRun),
    (err: unknown) => err instanceof PersonalBrainError,
  );
});

test("C-04-T6: execute-research does not import Runtime, SDK, or research-engine runner", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const src = fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../src/bridge/execute-research.ts",
    ),
    "utf8",
  );
  assert.equal(/@dyogas\/runtime/.test(src), false);
  assert.equal(/@dyogas\/agent-sdk/.test(src), false);
  assert.equal(/@dyogas\/research-engine/.test(src), false);
  assert.equal(/runResearchMvp/.test(src), false);
  assert.equal(/evidence_items/.test(src), false); // no fabricated report body
});

test("C-04-T7: PB does not hardcode ResearchReport payload", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const result = await executeResearchViaHost(baseRequest);
  // Result exposes Host refs only — no evidence_items fabricated by PB
  assert.equal(
    Object.prototype.hasOwnProperty.call(result.researchReport, "evidence_items"),
    false,
  );
  assert.match(result.researchReport.research_report_ref, /./);
});
