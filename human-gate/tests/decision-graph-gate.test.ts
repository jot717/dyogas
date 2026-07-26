import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import type { EvidenceItem } from "@dyogas/research-engine";
import { runDecisionGraphApprovalGate } from "../src/decision-graph-gate.js";

beforeEach(() => clear());

function evidence(): EvidenceItem[] {
  return [
    {
      evidenceId: "ev-gate-0",
      excerpt: "Gate evidence excerpt.",
      metadata: {
        sourceClass: "web",
        title: "Gate Source",
        pointer: "mock://web/gate-0",
        retrievedAt: "2026-07-26T00:00:00.000Z",
        adapter: "mock-source-v1",
      },
    },
  ];
}

test("DG-04: decision graph gate requires human actor (pending without decision)", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = runDecisionGraphApprovalGate({
    taskId: "task-1",
    tenantId: "t1",
    researchArtifactId: "art-1",
    evidence: evidence(),
    proposalId: "prop-1",
    painStatement: "Need approved knowledge before graph",
    audience: ["founder"],
    question: "Approve Decision Graph ingest?",
  });

  assert.equal(result.gate.gate.decision, "pending");
  assert.equal(result.gate.apply, undefined);
  assert.equal(result.ingest.pendingApproval.decision, "pending");
});

test("DG-04: approved gate applies Knowledge SoR", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = runDecisionGraphApprovalGate({
    taskId: "task-1",
    tenantId: "t1",
    researchArtifactId: "art-1",
    evidence: evidence(),
    proposalId: "prop-1",
    painStatement: "Need approved knowledge before graph",
    audience: ["founder"],
    question: "Approve Decision Graph ingest?",
    decision: "approved",
    actorId: "founder",
  });

  assert.equal(result.gate.gate.decision, "approved");
  assert.ok(result.gate.apply);
  assert.equal(result.gate.apply!.item.approvalState, "applied");
  assert.deepEqual(
    [...result.gate.apply!.item.provenance.evidenceIds],
    ["ev-gate-0"],
  );
});
