/**
 * SPRINT-EXECUTION-HOST-001 — T-J3 formal Host E2E (fakes only, no cloud/UI).
 * Brief → stages → Human approve → Knowledge authorize → GraphUpdate ref.
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
  HostAuditType,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
} from "../src/index.js";

beforeEach(() => clear());

test("e2e-host: Brief → pause → approve → Knowledge → GraphUpdate", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const sink = createMemoryAuditSink();
  const host = createExecutionHost({ auditSink: sink });

  const created = await host.createRun({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    bootstrap: { question: "e2e formal", id: "brief-e2e" },
    tenant_id: "tenant-a",
    caller_id: "owner-e2e",
    correlation_id: "e2e-corr",
    audit_sink: sink,
  });

  assert.equal(created.status, "waiting_human");
  assert.ok(created.lineage.research_brief_ref);
  assert.ok(created.lineage.research_report_ref);
  assert.ok(created.lineage.validation_report_ref);
  assert.ok(created.lineage.proposal_ref);
  assert.equal(created.lineage.knowledge_ref, undefined);

  const resumed = await host.resumeHuman(created.run_id, {
    outcome: "approved",
    actor_id: "owner-e2e",
  });
  assert.equal(resumed.status, "applying");
  assert.ok(resumed.lineage.human_decision_ref);

  const kn = await host.applyKnowledgeAuthorized(created.run_id);
  assert.ok(kn.lineage.knowledge_ref);

  const gu = await host.applyGraphAuthorized(created.run_id);
  assert.ok(gu.lineage.graph_update_ref);
  assert.equal(gu.status, "succeeded");

  const types = sink.list().map((e) => e.type);
  assert.ok(types.includes(HostAuditType.HUMAN_GATE_OPENED));
  assert.ok(types.includes(HostAuditType.HUMAN_DECISION));
  assert.ok(types.includes(HostAuditType.KNOWLEDGE_APPLIED));
  assert.ok(types.includes(HostAuditType.GRAPH_UPDATED));
  assert.ok(types.includes(HostAuditType.RUN_COMPLETED));
});
