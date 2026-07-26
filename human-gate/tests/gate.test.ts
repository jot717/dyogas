import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { runResearchMvp } from "@dyogas/research-engine";
import {
  decideApproval,
  enqueueApproval,
  HumanGateError,
  runHumanApprovalGate,
} from "../src/index.js";

beforeEach(() => clear());

test("enqueue and decide require tenancy + actor", () => {
  assert.throws(
    () =>
      enqueueApproval({
        proposalId: "p",
        researchArtifactId: "r",
        painStatement: "pain",
      }),
    HumanGateError,
  );
  propagate(createTenancyContext(createTenantId("t1")));
  const g = enqueueApproval({
    proposalId: "p1",
    researchArtifactId: "r1",
    painStatement: "Operators need attributable approval",
  });
  assert.equal(g.decision, "pending");
  assert.throws(() => decideApproval(g, "approved", "  "), HumanGateError);
  const decided = decideApproval(g, "approved", "founder");
  assert.equal(decided.decision, "approved");
  assert.equal(decided.actorId, "founder");
});

test("B11 notify + approve applies knowledge SoR", async () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const research = await runResearchMvp({
    brief: {
      question: "q",
      allowedSourceClasses: ["web"],
      maxItems: 1,
    },
  });
  const result = runHumanApprovalGate({
    proposalId: "prop-1",
    researchArtifactId: research.candidate.artifactId,
    painStatement: "Need human gate before SoR",
    audience: ["founder"],
    handoff: research.knowledgeHandoff,
    content: { title: "T", body: "Body from approved proposal" },
    decision: "approved",
    actorId: "founder",
  });
  assert.equal(result.receipts[0]?.status, "delivered");
  assert.equal(result.gate.decision, "approved");
  assert.equal(result.apply?.item.approvalState, "applied");
});

test("pending gate does not apply SoR", async () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const research = await runResearchMvp({
    brief: {
      question: "q",
      allowedSourceClasses: ["web"],
      maxItems: 1,
    },
  });
  const result = runHumanApprovalGate({
    proposalId: "prop-2",
    researchArtifactId: research.candidate.artifactId,
    painStatement: "pain",
    audience: ["founder"],
    handoff: research.knowledgeHandoff,
    content: { title: "T", body: "B" },
  });
  assert.equal(result.gate.decision, "pending");
  assert.equal(result.apply, undefined);
});
