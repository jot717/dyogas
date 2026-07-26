import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { createMockSourceCollector } from "@dyogas/research-engine";
import { runDecisionGraphApprovalGate } from "@dyogas/human-gate";
import {
  createMemoryGraphStore,
  persistApprovedKnowledgeToDecisionGraph,
  DECISION_GRAPH_CONTRACT,
} from "@dyogas/graph-engine";

beforeEach(() => clear());

test("DG-06: Evidence → Knowledge → Decision graph foundation path", async () => {
  propagate(createTenancyContext(createTenantId("t1")));

  const collector = createMockSourceCollector();
  const evidence = await collector.collect({
    question: "Decision Graph foundation evidence?",
    sourceClass: "web",
    limit: 2,
    nowIso: "2026-07-26T00:00:00.000Z",
  });

  const gate = runDecisionGraphApprovalGate({
    taskId: "task-dg-e2e",
    tenantId: "t1",
    researchArtifactId: "art-dg-e2e",
    evidence,
    proposalId: "prop-dg-e2e",
    painStatement: "Need Decision Graph foundation from Research evidence",
    audience: ["founder"],
    question: "Decision Graph foundation evidence?",
    decision: "approved",
    actorId: "founder",
  });

  assert.ok(gate.gate.apply);
  assert.equal(gate.gate.apply.item.approvalState, "applied");

  const store = createMemoryGraphStore();
  const persisted = persistApprovedKnowledgeToDecisionGraph({
    knowledge: gate.gate.apply.item,
    store,
    mutationAuthorized: true,
    mode: "apply",
  });

  assert.equal(persisted.persisted, true);
  assert.equal(
    persisted.foundation.meta.ontologyProfileId,
    DECISION_GRAPH_CONTRACT.ontologyProfileId,
  );
  assert.equal(persisted.foundation.evidence.stage, "evidence");
  assert.equal(persisted.foundation.knowledge.stage, "knowledge");
  assert.equal(persisted.foundation.decision.stage, "decision");
  assert.equal(persisted.foundation.decision.consistencyOk, true);
  assert.ok(store.listNodes().length >= 3);
  assert.ok(store.listEdges().length >= 3);
});
