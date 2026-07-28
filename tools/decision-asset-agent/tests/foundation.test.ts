import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { createMockSourceCollector } from "@dyogas/research-engine";
import {
  createTaskPlan,
  generateExecutionPackageFromPlan,
} from "@dyogas/task-agent";
import {
  DecisionAssetError,
  extractDecisionAsset,
  runDecisionAssetAgentFoundation,
} from "../src/index.js";

beforeEach(() => clear());

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");

test("DA-03: extractDecisionAsset builds claims from evidence", () => {
  const asset = extractDecisionAsset({
    question: "Should we ship Decision Assets?",
    tenant_id: "t1",
    task_id: "task-da",
    research_artifact_id: "art-da",
    evidence: [
      {
        evidenceId: "ev-1",
        excerpt: "Local-first evidence supports durable decision packages.",
        metadata: {
          title: "Source 1",
          pointer: "mock://web/1",
          sourceClass: "web",
        },
      },
    ],
  });
  assert.equal(asset.requires_human_approval, true);
  assert.equal(asset.status, "draft");
  assert.equal(asset.claims.length, 1);
  assert.equal(asset.claims[0]!.evidence_id, "ev-1");
  assert.ok(asset.options);
  assert.ok(asset.options!.length >= 2);
  assert.ok(asset.options![0]!.risks.length >= 1);
  assert.ok(asset.options![0]!.unknowns.length >= 1);
});

test("DA-03: fail closed on empty evidence", () => {
  assert.throws(
    () =>
      extractDecisionAsset({
        question: "Q",
        tenant_id: "t1",
        task_id: "t",
        research_artifact_id: "a",
        evidence: [],
      }),
    DecisionAssetError,
  );
});

test("DA-04/05/06/07: Research → approve → Knowledge/Graph + Task Package correlation", async () => {
  propagate(createTenancyContext(createTenantId("t1")));

  const plan = createTaskPlan({
    request: "Should we ship Decision Assets?",
    scope: "decision-asset-foundation",
    tenant_id: "t1",
    run_id: "run-da-01",
    sprint_id: "SPRINT-DECISION-ASSET-AGENT-FOUNDATION-001",
  });
  const pkgResult = generateExecutionPackageFromPlan(plan);
  assert.equal(pkgResult.ok, true);
  if (!pkgResult.ok) return;

  const collector = createMockSourceCollector();
  const evidence = await collector.collect({
    question: "Should we ship Decision Assets?",
    sourceClass: "web",
    limit: 2,
    nowIso: "2026-07-26T00:00:00.000Z",
  });

  const evidencePath = join(
    repoRoot,
    "docs/decision-asset-agent/evidence/DA-FOUNDATION-001.json",
  );

  const result = runDecisionAssetAgentFoundation({
    question: "Should we ship Decision Assets?",
    tenant_id: "t1",
    task_id: plan.task_id,
    research_artifact_id: "art-da-e2e",
    evidence,
    execution_package_task_id: pkgResult.package.taskId,
    decision: "approved",
    actorId: "founder",
    evidencePath,
  });

  assert.equal(result.approved, true);
  assert.equal(result.asset.status, "applied");
  assert.ok(result.persist);
  assert.equal(result.persist!.graph.persisted, true);
  assert.ok(result.persist!.store.listNodes().some((n) => n.types.includes("Decision")));
  assert.equal(result.evidence.verdict, "PASS");
  assert.equal(
    result.asset.execution_package_task_id,
    pkgResult.package.taskId,
  );
});

test("DA-05: pending without actor does not persist", async () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const collector = createMockSourceCollector();
  const evidence = await collector.collect({
    question: "Q",
    sourceClass: "web",
    limit: 1,
    nowIso: "2026-07-26T00:00:00.000Z",
  });
  const result = runDecisionAssetAgentFoundation({
    question: "Q",
    tenant_id: "t1",
    task_id: "task-da",
    research_artifact_id: "art-da",
    evidence,
  });
  assert.equal(result.approved, false);
  assert.equal(result.persist, undefined);
  assert.equal(result.evidence.verdict, "BLOCKED");
});
