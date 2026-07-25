/**
 * C-05 — persist current Host ResearchReport reference tests.
 */

import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  HostError,
  type CreateRunRequest,
  type HostRun,
} from "@dyogas/execution-host";
import {
  executeAndPersistResearchViaHost,
  persistResearchReportReference,
} from "../src/bridge/persist-research-report.js";
import { executeResearchViaHost } from "../src/bridge/execute-research.js";
import { createFileResearchReportReferenceStore } from "../src/persist/research-report-ref-store.js";
import { PersonalBrainError } from "../src/workspace.js";
import type { ResearchRequest } from "../src/bridge/research-request.js";

const request: ResearchRequest = {
  intent: "Research AI Agent market",
  workspace_id: "workspace-c05",
  owner_id: "owner-c05",
  tenant_id: "tenant-c05",
  correlation_id: "correlation-c05",
};

let dataRoot = "";

beforeEach(() => {
  clear();
  dataRoot = mkdtempSync(join(tmpdir(), "pb-c05-"));
  process.env.PERSONAL_BRAIN_DATA_DIR = dataRoot;
});

afterEach(() => {
  if (dataRoot) rmSync(dataRoot, { recursive: true, force: true });
});

test("C-05-T1: persists the Host ResearchReport reference", async () => {
  propagate(createTenancyContext(createTenantId("tenant-c05")));
  const result = await executeAndPersistResearchViaHost(request);

  assert.equal(result.persistence.disposition, "inserted");
  assert.equal(
    result.persistence.record.research_report_ref,
    result.execution.bridge.hostRun.lineage.research_report_ref,
  );
  assert.equal(result.persistence.record.artifact_type, "ResearchReport");

  const store = createFileResearchReportReferenceStore();
  assert.deepEqual(
    store.get(
      "tenant-c05",
      "workspace-c05",
      result.persistence.record.research_report_ref,
    ),
    result.persistence.record,
  );
});

test("C-05-T2: preserves lineage, run, correlation, ownership, and tenancy", async () => {
  propagate(createTenancyContext(createTenantId("tenant-c05")));
  const result = await executeAndPersistResearchViaHost(request);
  const record = result.persistence.record;

  assert.equal(
    record.research_brief_ref,
    result.execution.bridge.hostRun.lineage.research_brief_ref,
  );
  assert.equal(record.run_id, result.execution.bridge.hostRun.run_id);
  assert.equal(record.correlation_id, "correlation-c05");
  assert.equal(record.owner_id, "owner-c05");
  assert.equal(record.workspace_id, "workspace-c05");
  assert.equal(record.tenant_id, "tenant-c05");
  assert.equal(record.pipeline_id, "knowledge-ingestion");
  assert.equal(record.pipeline_version, "2.0.0");
  assert.equal(record.production_mode, "host_mvp_lineage_seal");
  assert.equal(
    Object.prototype.hasOwnProperty.call(record, "evidence_items"),
    false,
  );
});

test("C-05-T3: identical duplicate is idempotent", async () => {
  propagate(createTenancyContext(createTenantId("tenant-c05")));
  const execution = await executeResearchViaHost(request);
  const store = createFileResearchReportReferenceStore();

  const first = persistResearchReportReference(execution, store);
  const duplicate = persistResearchReportReference(execution, store);

  assert.equal(first.disposition, "inserted");
  assert.equal(duplicate.disposition, "duplicate");
  assert.deepEqual(duplicate.record, first.record);
  assert.equal(store.list("tenant-c05", "workspace-c05").length, 1);
});

test("C-05-T4: conflicting duplicate fails closed", async () => {
  propagate(createTenancyContext(createTenantId("tenant-c05")));
  const execution = await executeResearchViaHost(request);
  const store = createFileResearchReportReferenceStore();
  persistResearchReportReference(execution, store);

  const path = join(
    dataRoot,
    "bridge",
    "research-report-refs",
    "tenant-c05--workspace-c05.json",
  );
  const stored = JSON.parse(readFileSync(path, "utf8")) as Array<
    Record<string, unknown>
  >;
  stored[0]!.owner_id = "different-owner";
  writeFileSync(path, JSON.stringify(stored, null, 2), "utf8");

  assert.throws(
    () => persistResearchReportReference(execution, store),
    (err: unknown) => err instanceof PersonalBrainError,
  );
});

test("C-05-T5: Host failure propagates and nothing is persisted", async () => {
  const host = {
    async createRun(_req: CreateRunRequest): Promise<HostRun> {
      throw new HostError("PIPELINE_UNSUPPORTED", "refused");
    },
  };
  const store = createFileResearchReportReferenceStore();

  await assert.rejects(
    () => executeAndPersistResearchViaHost(request, { host, store }),
    (err: unknown) => err instanceof PersonalBrainError,
  );
  assert.deepEqual(store.list("tenant-c05", "workspace-c05"), []);
});

test("C-05-T6: persistence modules import no Runtime, SDK, or Research Engine", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src");
  for (const relative of [
    "bridge/persist-research-report.ts",
    "persist/research-report-ref-store.ts",
  ]) {
    const source = fs.readFileSync(path.join(root, relative), "utf8");
    assert.equal(/@dyogas\/runtime/.test(source), false, relative);
    assert.equal(/@dyogas\/agent-sdk/.test(source), false, relative);
    assert.equal(/@dyogas\/research-engine/.test(source), false, relative);
    assert.equal(/\badmitRun\b/.test(source), false, relative);
    assert.equal(/\bbindContract\b/.test(source), false, relative);
  }
});
