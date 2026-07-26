import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import * as eng from "../src/index.js";
import {
  buildKnowledgeHandoff,
  createMockSourceCollector,
  createPendingApprovalHandoff,
  createResearchTask,
  ResearchError,
  runResearchMvp,
} from "../src/index.js";

beforeEach(() => clear());

test("task creation requires tenancy and question", () => {
  assert.throws(
    () =>
      createResearchTask(
        { question: "x", allowedSourceClasses: ["web"], maxItems: 1 },
        "2026-01-01T00:00:00.000Z",
      ),
    ResearchError,
  );
  propagate(createTenancyContext(createTenantId("t1")));
  const task = createResearchTask(
    {
      question: "What is DYOGAS?",
      allowedSourceClasses: ["web", "github"],
      maxItems: 3,
    },
    "2026-01-01T00:00:00.000Z",
  );
  assert.equal(task.tenantId, "t1");
  assert.equal(task.status, "created");
});

test("mock collector returns metadata + evidence", async () => {
  const c = createMockSourceCollector();
  const items = await c.collect({
    question: "q",
    sourceClass: "web",
    limit: 2,
    nowIso: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(items.length, 2);
  assert.ok(items[0]?.metadata.pointer.startsWith("mock://"));
  assert.equal(items[0]?.metadata.adapter, "mock-source-v1");
});

test("MVP run: artifact, approval pending, knowledge handoff no SoR", async () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = await runResearchMvp({
    brief: {
      question: "Evidence for local-first knowledge?",
      allowedSourceClasses: ["web"],
      maxItems: 2,
    },
  });
  assert.ok(result.evidence.length >= 1);
  assert.equal(result.candidate.sealed, false);
  assert.equal(result.candidate.artifactType, "research-report");
  assert.equal(result.approvalHandoff.decision, "pending");
  assert.equal(result.knowledgeHandoff.sorWriteAllowed, false);
  assert.equal(result.knowledgeHandoff.requiresHumanApproval, true);
  assert.equal(result.run.state, "SUCCEEDED");
  assert.equal(result.task.status, "ready_for_review");
});

test("handoff helpers", () => {
  const a = createPendingApprovalHandoff({
    handoffId: "h1",
    taskId: "t1",
    tenantId: "ten",
    researchArtifactId: "art",
  });
  assert.equal(a.decision, "pending");
  const k = buildKnowledgeHandoff({
    taskId: "t1",
    tenantId: "ten",
    researchArtifactId: "art",
    evidenceIds: ["e1"],
  });
  assert.equal(k.sorWriteAllowed, false);
});

test("no UI/server exports", () => {
  const keys = Object.keys(eng).join(" ");
  assert.equal(/listen|express|httpServer|createServer/i.test(keys), false);
});
