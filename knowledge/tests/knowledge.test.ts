import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { buildKnowledgeHandoff } from "@dyogas/research-engine";
import * as kn from "../src/index.js";
import {
  applyApproval,
  applyApprovedKnowledge,
  createKnowledgeDraft,
  createMemoryKnowledgeSoR,
  KnowledgeError,
} from "../src/index.js";

beforeEach(() => clear());

function handoff() {
  return buildKnowledgeHandoff({
    taskId: "task-1",
    tenantId: "t1",
    researchArtifactId: "art-1",
    evidenceIds: ["e1", "e2"],
  });
}

test("SoR apply without approval fails closed", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const draft = createKnowledgeDraft(handoff(), {
    title: "T",
    body: "Body evidence-backed",
  });
  assert.equal(draft.approvalState, "pending_approval");
  assert.deepEqual(draft.provenance.evidenceIds, ["e1", "e2"]);
  const sor = createMemoryKnowledgeSoR();
  assert.throws(() => sor.apply(draft), KnowledgeError);
});

test("approved apply versions and emits contracts", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = applyApprovedKnowledge({
    handoff: handoff(),
    content: { title: "Local-first", body: "Knowledge body" },
    approval: {
      decision: "approved",
      researchArtifactId: "art-1",
    },
  });
  assert.equal(result.item.approvalState, "applied");
  assert.equal(result.item.version, 1);
  assert.equal(result.graphRetrieval.graphMaterialized, false);
  assert.equal(result.markdownHandoff.rendered, false);
  assert.equal(result.markdownHandoff.title, "Local-first");
});

test("rejected approval cannot apply", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  let item = createKnowledgeDraft(handoff(), { title: "T", body: "B" });
  item = applyApproval(item, {
    decision: "rejected",
    researchArtifactId: "art-1",
    decidedAt: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(item.approvalState, "rejected");
  assert.throws(() => createMemoryKnowledgeSoR().apply(item), KnowledgeError);
});

test("second apply bumps version", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const sor = createMemoryKnowledgeSoR();
  const r1 = applyApprovedKnowledge({
    handoff: handoff(),
    content: { title: "T", body: "v1" },
    approval: { decision: "approved", researchArtifactId: "art-1" },
    sor,
  });
  // re-apply same id path: create new draft with same knowledge flow — use apply on approved copy
  let item = createKnowledgeDraft(handoff(), { title: "T", body: "v2" });
  // force same knowledgeId for version chain demo
  item = {
    ...item,
    knowledgeId: r1.item.knowledgeId,
  };
  item = applyApproval(item, {
    decision: "approved",
    researchArtifactId: "art-1",
    decidedAt: "2026-01-02T00:00:00.000Z",
  });
  const r2 = sor.apply(item);
  assert.equal(r2.version, 2);
  assert.equal(sor.listVersions("t1", r1.item.knowledgeId).length, 2);
});

test("no UI exports", () => {
  assert.equal(/listen|express|createServer/i.test(Object.keys(kn).join(" ")), false);
});
