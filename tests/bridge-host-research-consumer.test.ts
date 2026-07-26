/**
 * Host Research Integration — Personal Brain consumer read path (test-only).
 * Proves PB can resolve HostRun.lineage → Host.getSealedArtifact without
 * calling Research Engine directly. No PB production source changes.
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
} from "@dyogas/execution-host";
import { createBridgeRun } from "../src/bridge/create-run.js";
import type { ResearchRequest } from "../src/bridge/research-request.js";

beforeEach(() => clear());

test("PB consumer: createBridgeRun → Host sealed ResearchReport body readable", async () => {
  propagate(createTenancyContext(createTenantId("tenant-pb-read")));
  const host = createExecutionHost();
  const request: ResearchRequest = {
    intent: "Consumer read of sealed ResearchReport via Host",
    workspace_id: "ws-pb-read",
    owner_id: "owner-pb-read",
    tenant_id: "tenant-pb-read",
    correlation_id: "corr-pb-read",
  };

  const bridge = await createBridgeRun(request, { host });
  assert.ok(bridge.hostRun.lineage.research_report_ref);
  assert.notEqual(
    bridge.hostRun.lineage.research_report_ref,
    "knowledge-ingestion-stage-1",
  );

  const artifactId = bridge.hostRun.lineage.research_report_ref!.split("@")[0]!;
  const sealed = host.getSealedArtifact(artifactId, request.tenant_id);
  assert.ok(sealed, "PB must resolve sealed ResearchReport via Host");
  assert.equal(sealed.kind, "ResearchReport");
  assert.equal(sealed.sealed, true);
  assert.ok(sealed.payload.brief_ref);
  assert.ok(Array.isArray(sealed.payload.evidence_items));
  assert.ok((sealed.payload.evidence_items as unknown[]).length > 0);
  assert.ok(Array.isArray(sealed.payload.coverage_gaps));
  assert.ok(Array.isArray(sealed.payload.open_questions));
  assert.equal(sealed.run_id, bridge.hostRun.run_id);
});
