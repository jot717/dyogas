import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  applyApprovedKnowledge,
  buildGraphRetrievalContract,
  type KnowledgeItem,
} from "@dyogas/knowledge-engine";
import * as graph from "../src/index.js";
import {
  GraphError,
  LOCAL_HASH_DIMENSIONS,
  LOCAL_HASH_PROFILE_ID,
  buildLocalEmbeddingJob,
  createMemoryGraphStore,
  proposeGraphUpdate,
  runGraphEngine,
} from "../src/index.js";

beforeEach(() => clear());

function handoff(tenantId = "t1") {
  return {
    contractVersion: "1.0.0" as const,
    taskId: "task-1",
    tenantId,
    researchArtifactId: "art-1",
    evidenceIds: ["e1"],
    requiresHumanApproval: true as const,
    sorWriteAllowed: false as const,
  };
}

function appliedKnowledge(): { item: KnowledgeItem; retrieval: ReturnType<typeof buildGraphRetrievalContract> } {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = applyApprovedKnowledge({
    handoff: handoff(),
    content: {
      title: "Retry Backoff Guideline",
      body: "Use jittered exponential backoff.\n\nPrefer idempotent retries.",
    },
    approval: { decision: "approved", researchArtifactId: "art-1" },
  });
  return { item: result.item, retrieval: result.graphRetrieval };
}

test("propose GraphUpdate from applied knowledge", () => {
  const { item } = appliedKnowledge();
  const update = proposeGraphUpdate({ knowledge: item });
  assert.equal(update.mode, "propose");
  assert.equal(update.ontology_profile_id, "ontology-general-1.0.0");
  assert.ok(update.nodes.length >= 2);
  assert.ok(update.edges.length >= 1);
  assert.equal(update.knowledge_ref.artifact_id, item.knowledgeId);
  for (const e of update.edges) {
    assert.ok(e.provenance.length >= 1);
  }
});

test("draft knowledge refused", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  assert.throws(
    () =>
      proposeGraphUpdate({
        knowledge: {
          knowledgeId: "k",
          version: 0,
          title: "T",
          body: "B",
          tenantId: "t1",
          approvalState: "pending_approval",
        },
      }),
    GraphError,
  );
});

test("apply without authorization falls back to propose", () => {
  const { item } = appliedKnowledge();
  const update = proposeGraphUpdate({
    knowledge: item,
    mode: "apply",
    mutationAuthorized: false,
  });
  assert.equal(update.mode, "propose");
  assert.equal(update.consistency_report.ok, false);
  assert.ok(
    update.consistency_report.issues.some((i) =>
      i.includes("mutation-authorization"),
    ),
  );
});

test("authorized apply mutates in-memory store only", async () => {
  const { item, retrieval } = appliedKnowledge();
  const store = createMemoryGraphStore();
  const result = await runGraphEngine({
    knowledge: item,
    mode: "apply",
    mutationAuthorized: true,
    store,
  });
  assert.equal(result.graphUpdate.mode, "apply");
  assert.equal(result.graphCandidate.sealed, false);
  assert.equal(result.graphCandidate.producedBy, "knowledge-graph-agent");
  assert.equal(result.graphCandidate.artifactType, "graph-update");
  assert.ok(store.listNodes().length >= 2);
  assert.equal(retrieval.graphMaterialized, false);
});

test("retrieval contract input path", async () => {
  const { item, retrieval } = appliedKnowledge();
  const result = await runGraphEngine({
    retrieval,
    title: item.title,
    body: item.body,
    approvalState: "applied",
  });
  assert.equal(result.graphUpdate.knowledge_ref.artifact_id, item.knowledgeId);
  assert.equal(result.embeddingCandidate.producedBy, "embedding-agent");
  assert.equal(result.embeddingCandidate.sealed, false);
  assert.equal(result.embedding.job.status, "succeeded");
  assert.equal(result.embedding.job.profile_id, LOCAL_HASH_PROFILE_ID);
  assert.ok(result.embedding.vectors.every((v) => v.dimensions === LOCAL_HASH_DIMENSIONS));
});

test("local embedding is deterministic", () => {
  const a = buildLocalEmbeddingJob({
    sources: [
      {
        artifactId: "k1",
        artifactVersion: "1",
        artifactType: "Knowledge",
        title: "T",
        body: "Body",
      },
    ],
  });
  const b = buildLocalEmbeddingJob({
    sources: [
      {
        artifactId: "k1",
        artifactVersion: "1",
        artifactType: "Knowledge",
        title: "T",
        body: "Body",
      },
    ],
  });
  assert.deepEqual(a.vectors[0]!.values, b.vectors[0]!.values);
  assert.equal(a.job.chunk_map[0]!.vector_id, b.job.chunk_map[0]!.vector_id);
});

test("unknown ontology refused", () => {
  const { item } = appliedKnowledge();
  assert.throws(
    () =>
      proposeGraphUpdate({
        knowledge: item,
        ontologyProfileId: "ontology-does-not-exist",
      }),
    GraphError,
  );
});

test("no UI / cloud vendor exports", () => {
  const keys = Object.keys(graph).join(" ");
  assert.equal(/listen|express|createServer|openai|anthropic|cohere/i.test(keys), false);
});
