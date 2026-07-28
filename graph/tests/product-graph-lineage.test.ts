import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { clear, createTenantId, createTenancyContext, propagate } from "@dyogas/kernel";
import { applyApprovedKnowledge } from "@dyogas/knowledge-engine";
import {
  DECISION_GRAPH_ONTOLOGY,
  createMemoryGraphStore,
  extractDecisionGraphDelta,
  persistApprovedKnowledgeToDecisionGraph,
  resolveOntology,
} from "../src/index.js";

beforeEach(() => clear());

test("Product graph: Question → DecisionAsset → HumanApproval → Knowledge → Evidence → Source", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const knowledge = applyApprovedKnowledge({
    handoff: {
      contractVersion: "1.0.0",
      taskId: "task-gp",
      tenantId: "t1",
      researchArtifactId: "art-gp",
      evidenceIds: ["ev-a", "ev-b"],
      requiresHumanApproval: true,
      sorWriteAllowed: false,
    },
    content: {
      title: "Japan HSP Visa Knowledge",
      body: "Human-approved knowledge with lineage.",
    },
    approval: { decision: "approved", researchArtifactId: "art-gp" },
  }).item;

  const ontology = resolveOntology(DECISION_GRAPH_ONTOLOGY.ontologyProfileId);
  const delta = extractDecisionGraphDelta({
    knowledge,
    ontology,
    lineage: {
      question: "how to apply japan highly skilled visa",
      decisionAssetId: "da-gp-001",
      humanApprovalId: "ha-gp-001",
      evidenceSources: [
        {
          evidenceId: "ev-a",
          sourceUrl: "https://example.gov/hsp",
          title: "ISA HSP",
        },
        {
          evidenceId: "ev-b",
          sourceUrl: "https://example.gov/docs",
          title: "ISA docs",
        },
      ],
    },
  });

  assert.equal(delta.issues.length, 0);
  const types = new Set(delta.nodes.flatMap((n) => n.types));
  assert.ok(types.has("Question"));
  assert.ok(types.has("DecisionAsset"));
  assert.ok(types.has("HumanApproval"));
  assert.ok(types.has("Knowledge"));
  assert.ok(types.has("Evidence"));
  assert.ok(types.has("Source"));

  const relations = new Set(delta.edges.map((e) => e.relation));
  assert.ok(relations.has("created_from"));
  assert.ok(relations.has("approved_by"));
  assert.ok(relations.has("produced"));
  assert.ok(relations.has("supported_by"));
  assert.ok(relations.has("derived_from"));

  const store = createMemoryGraphStore();
  const persisted = persistApprovedKnowledgeToDecisionGraph({
    knowledge,
    store,
    mutationAuthorized: true,
    mode: "apply",
    lineage: {
      question: "how to apply japan highly skilled visa",
      decisionAssetId: "da-gp-001",
      humanApprovalId: "ha-gp-001",
      evidenceSources: [
        {
          evidenceId: "ev-a",
          sourceUrl: "https://example.gov/hsp",
          title: "ISA HSP",
        },
      ],
    },
  });
  assert.equal(persisted.persisted, true);
  assert.ok(persisted.update.nodes.length >= 6);
});
