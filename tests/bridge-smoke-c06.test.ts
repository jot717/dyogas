/**
 * C-06 — End-to-end smoke: Research Request → Brief → createRun →
 * Host Stage 1 → Host MVP ResearchReport reference → Persist.
 *
 * Uses current Host public path only. Does not fabricate ResearchReport
 * payloads. Does not bypass Host. Does not close GAP-BR-019.
 */

import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { buildResearchBriefBootstrap } from "../src/bridge/research-request.js";
import { executeAndPersistResearchViaHost } from "../src/bridge/persist-research-report.js";
import { createFileResearchReportReferenceStore } from "../src/persist/research-report-ref-store.js";
import type { ResearchRequest } from "../src/bridge/research-request.js";

const SMOKE_REQUEST: ResearchRequest = {
  intent: "Smoke: Research AI Agent market for Personal Brain Bridge",
  workspace_id: "ws-smoke-c06",
  owner_id: "owner-smoke-c06",
  tenant_id: "tenant-smoke-c06",
  correlation_id: "corr-smoke-c06",
};

let dataRoot = "";

beforeEach(() => {
  clear();
  dataRoot = mkdtempSync(join(tmpdir(), "pb-c06-smoke-"));
  process.env.PERSONAL_BRAIN_DATA_DIR = dataRoot;
});

afterEach(() => {
  if (dataRoot) rmSync(dataRoot, { recursive: true, force: true });
});

test("C-06-SMOKE: Research Request → Brief → createRun → Host Report ref → Persist", async () => {
  // Ambient Kernel tenancy required before Host createRun (GAP-BR-012 workaround)
  propagate(createTenancyContext(createTenantId(SMOKE_REQUEST.tenant_id)));

  // --- Checkpoint 1: Research Request + Brief ---
  const brief = buildResearchBriefBootstrap(SMOKE_REQUEST);
  assert.equal(brief.bootstrap.question, SMOKE_REQUEST.intent);
  assert.equal(brief.bootstrap.tenancy.tenant_id, SMOKE_REQUEST.tenant_id);
  assert.equal(brief.bootstrap.tenancy.workspace_id, SMOKE_REQUEST.workspace_id);
  assert.equal(brief.identity.caller_id, SMOKE_REQUEST.owner_id);
  assert.equal(brief.identity.correlation_id, SMOKE_REQUEST.correlation_id);
  assert.equal(brief.bootstrap.run_id, undefined); // GAP-BR-005: stamped after Host

  // --- Checkpoint 2–6: createRun → Stage 1 → Report ref → Persist ---
  const { execution, persistence } =
    await executeAndPersistResearchViaHost(SMOKE_REQUEST);

  // createRun succeeds
  assert.ok(execution.bridge.hostRun.run_id);
  assert.equal(execution.bridge.hostRun.pin.pipeline_id, "knowledge-ingestion");
  assert.equal(execution.bridge.hostRun.pin.pipeline_version, "2.0.0");
  assert.notEqual(execution.bridge.hostRun.status, "failed");

  // Host returns lineage
  const lineage = execution.bridge.hostRun.lineage;
  assert.equal(lineage.correlation_id, SMOKE_REQUEST.correlation_id);
  assert.ok(lineage.research_brief_ref);
  assert.ok(lineage.research_report_ref);

  // ResearchReport reference exists (MVP lineage seal — GAP-BR-019)
  assert.equal(
    execution.researchReport.research_report_ref,
    lineage.research_report_ref,
  );
  assert.equal(execution.researchReport.artifact_type, "ResearchReport");
  assert.equal(
    execution.researchReport.production_mode,
    "host_mvp_lineage_seal",
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(
      execution.researchReport,
      "evidence_items",
    ),
    false,
    "must not fabricate ResearchReport payload body",
  );

  // Persistence succeeds
  assert.equal(persistence.disposition, "inserted");
  assert.equal(
    persistence.record.research_report_ref,
    lineage.research_report_ref,
  );

  // Lineage / ownership / tenancy / correlation preserved
  assert.equal(
    persistence.record.research_brief_ref,
    lineage.research_brief_ref,
  );
  assert.equal(persistence.record.run_id, execution.bridge.hostRun.run_id);
  assert.equal(persistence.record.correlation_id, SMOKE_REQUEST.correlation_id);
  assert.equal(persistence.record.owner_id, SMOKE_REQUEST.owner_id);
  assert.equal(persistence.record.workspace_id, SMOKE_REQUEST.workspace_id);
  assert.equal(persistence.record.tenant_id, SMOKE_REQUEST.tenant_id);
  assert.equal(
    persistence.record.run_id,
    execution.bridge.bootstrap.run_id,
  );

  // Durable store readable
  const store = createFileResearchReportReferenceStore();
  const loaded = store.get(
    SMOKE_REQUEST.tenant_id,
    SMOKE_REQUEST.workspace_id,
    persistence.record.research_report_ref,
  );
  assert.deepEqual(loaded, persistence.record);

  // FC-13: smoke module must not import Runtime/SDK as orchestrator
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const smokeSrc = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");
  assert.equal(/@dyogas\/runtime/.test(smokeSrc), false);
  assert.equal(/@dyogas\/agent-sdk/.test(smokeSrc), false);
  assert.equal(/@dyogas\/research-engine/.test(smokeSrc), false);
  assert.equal(/\badmitRun\b/.test(smokeSrc), false);
});

test("C-06-MVP-LIMITS: document Host MVP limitations without closing GAP-BR-019", async () => {
  /**
   * Explicit MVP limitations encountered on the executable path.
   * These are known OPEN GAPs — smoke must not close them.
   */
  const mvpLimitations = [
    {
      id: "GAP-BR-019",
      priority: "P0",
      limitation:
        "Host Stage 1 seals a synthetic ResearchReport lineage ref; no schema-valid ResearchReport payload via Host public API",
    },
    {
      id: "GAP-EH-003",
      priority: "P0",
      limitation:
        "Research Engine not wired into Host Stage 1 (planned SPRINT-HOST-RESEARCH-INTEGRATION-001)",
    },
    {
      id: "GAP-BR-012",
      priority: "OPEN",
      limitation:
        "Caller must set ambient Kernel tenancy before createRun; Host does not assert req.tenant_id ≡ Runtime ctx",
    },
    {
      id: "GAP-BR-005",
      priority: "OPEN",
      limitation: "bootstrap.run_id stamped only after Host returns run_id",
    },
    {
      id: "GAP-BR-002/003/004",
      priority: "OPEN",
      limitation:
        "Brief scope/sources/budget use product defaults when Request omits them",
    },
  ] as const;

  assert.equal(mvpLimitations.length >= 4, true);
  assert.ok(mvpLimitations.some((g) => g.id === "GAP-BR-019"));
  // Smoke does not close GAP-BR-019
  assert.equal(
    mvpLimitations.find((g) => g.id === "GAP-BR-019")?.priority,
    "P0",
  );
});
