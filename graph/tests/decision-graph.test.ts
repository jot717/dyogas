import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { applyApprovedKnowledge } from "@dyogas/knowledge-engine";
import {
  DECISION_GRAPH_CONTRACT,
  DECISION_GRAPH_ONTOLOGY,
  createMemoryGraphStore,
  persistApprovedKnowledgeToDecisionGraph,
  resolveOntology,
} from "../src/index.js";

beforeEach(() => clear());

function applied() {
  propagate(createTenancyContext(createTenantId("t1")));
  return applyApprovedKnowledge({
    handoff: {
      contractVersion: "1.0.0",
      taskId: "task-dg",
      tenantId: "t1",
      researchArtifactId: "art-dg",
      evidenceIds: ["ev-a", "ev-b"],
      requiresHumanApproval: true,
      sorWriteAllowed: false,
    },
    content: {
      title: "Decision Graph Foundation Note",
      body: "Evidence supports shipping the foundation.\n\nHuman approval recorded.",
    },
    approval: { decision: "approved", researchArtifactId: "art-dg" },
  }).item;
}

test("DG-01/02: decision ontology resolves", () => {
  const ontology = resolveOntology(DECISION_GRAPH_CONTRACT.ontologyProfileId);
  assert.equal(ontology.ontologyProfileId, DECISION_GRAPH_ONTOLOGY.ontologyProfileId);
  assert.ok(ontology.nodeTypes.includes("Evidence"));
  assert.ok(ontology.nodeTypes.includes("Decision"));
  assert.ok(ontology.relations.includes("supports"));
});

test("DG-05: persist approved knowledge nodes with authorization", () => {
  const item = applied();
  const store = createMemoryGraphStore();
  const result = persistApprovedKnowledgeToDecisionGraph({
    knowledge: item,
    store,
    mutationAuthorized: true,
    mode: "apply",
  });

  assert.equal(result.persisted, true);
  assert.equal(result.update.mode, "apply");
  assert.equal(result.update.consistency_report.ok, true);
  assert.equal(result.foundation.meta.contractId, "decision-graph-foundation");
  assert.equal(result.foundation.knowledge.approvalState, "applied");
  assert.ok(result.foundation.decision.nodeCount >= 3);
  assert.ok(store.listNodes().some((n) => n.types.includes("Evidence")));
  assert.ok(store.listNodes().some((n) => n.types.includes("Knowledge")));
  assert.ok(store.listNodes().some((n) => n.types.includes("Decision")));
  assert.ok(store.listEdges().some((e) => e.relation === "supports"));
  assert.ok(store.listEdges().some((e) => e.relation === "decides"));
});

test("DG-05: fail-closed to propose without mutationAuthorized", () => {
  const item = applied();
  const store = createMemoryGraphStore();
  const result = persistApprovedKnowledgeToDecisionGraph({
    knowledge: item,
    store,
    mode: "apply",
  });

  assert.equal(result.persisted, false);
  assert.equal(result.update.mode, "propose");
  assert.equal(store.listNodes().length, 0);
});
