import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { runValidationProposalPath } from "@dyogas/research-engine";
import { runHumanApprovalGate } from "@dyogas/human-gate";
import { renderMarkdownCandidate } from "@dyogas/markdown-engine";
import { runGraphEngine } from "@dyogas/graph-engine";

beforeEach(() => clear());

test("B15 knowledge-ingestion green (non-prod)", async () => {
  propagate(createTenancyContext(createTenantId("t1")));

  const b10 = await runValidationProposalPath({
    brief: {
      question: "Local-first knowledge evidence?",
      allowedSourceClasses: ["web"],
      maxItems: 2,
    },
    painStatement: "Operators need an attested ingestion path before production",
  });

  const gate = runHumanApprovalGate({
    proposalId: b10.proposal.proposalId,
    researchArtifactId: b10.research.candidate.artifactId,
    painStatement: b10.proposal.painStatement,
    audience: ["founder"],
    handoff: b10.research.knowledgeHandoff,
    content: {
      title: "Ingestion MVP Note",
      body: "Approved knowledge body from validated proposal path.",
    },
    decision: "approved",
    actorId: "founder",
  });

  assert.ok(gate.apply);
  const md = renderMarkdownCandidate({
    handoff: gate.apply.markdownHandoff,
    citations: b10.proposal.citations.map((c) => ({
      key: c.citationKey,
      source: c.evidenceId,
      excerpt: c.evidenceId,
    })),
  });
  const graph = await runGraphEngine({
    knowledge: gate.apply.item,
  });

  assert.equal(b10.proposal.requiresHumanApproval, true);
  assert.equal(gate.gate.decision, "approved");
  assert.equal(gate.apply.item.approvalState, "applied");
  assert.equal(md.candidate.sealed, false);
  assert.match(md.markdownBody, /Ingestion MVP Note/);
  assert.equal(graph.graphCandidate.sealed, false);
  assert.ok(graph.embedding.vectors.length >= 1);
  assert.equal(graph.run.state, "SUCCEEDED");
});
