import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  buildProposal,
  ProposalError,
  runValidationProposalPath,
  validateEvidence,
  ValidationError,
  createMockSourceCollector,
} from "../src/index.js";

beforeEach(() => clear());

test("validation full coverage + unknown rubric", async () => {
  const c = createMockSourceCollector();
  const evidence = await c.collect({
    question: "q",
    sourceClass: "web",
    limit: 2,
    nowIso: "2026-01-01T00:00:00.000Z",
  });
  assert.throws(
    () =>
      validateEvidence({
        tenantId: "t1",
        researchArtifactId: "r1",
        rubricId: "nope",
        evidence,
      }),
    ValidationError,
  );
  const report = validateEvidence({
    tenantId: "t1",
    researchArtifactId: "r1",
    rubricId: "default-v1",
    evidence,
  });
  assert.equal(report.results.length, evidence.length);
  assert.ok(report.results.every((r) => r.status === "accepted"));
});

test("proposal refuses empty pain and rejected citations", () => {
  const validation = validateEvidence({
    tenantId: "t1",
    researchArtifactId: "r1",
    rubricId: "default-v1",
    evidence: [
      {
        evidenceId: "e1",
        excerpt: "ok",
        metadata: {
          title: "t",
          pointer: "mock://a",
          sourceClass: "web",
          adapter: "mock-source-v1",
          retrievedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    ],
  });
  assert.throws(
    () =>
      buildProposal({
        tenantId: "t1",
        validation,
        painStatement: "  ",
      }),
    ProposalError,
  );
  const p = buildProposal({
    tenantId: "t1",
    validation,
    painStatement: "Operators cannot trust unvalidated research",
  });
  assert.equal(p.requiresHumanApproval, true);
  assert.equal(p.citations[0]?.evidenceId, "e1");
});

test("B10 path research → validation → proposal", async () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = await runValidationProposalPath({
    brief: {
      question: "Local-first evidence?",
      allowedSourceClasses: ["web"],
      maxItems: 2,
    },
    painStatement: "Need validated evidence before knowledge apply",
  });
  assert.equal(result.validationCandidate.artifactType, "validation-report");
  assert.equal(result.proposalCandidate.artifactType, "proposal");
  assert.equal(result.proposal.requiresHumanApproval, true);
  assert.ok(result.proposal.citations.length >= 1);
  assert.equal(result.validationCandidate.sealed, false);
});
