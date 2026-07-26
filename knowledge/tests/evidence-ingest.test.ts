import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  EvidenceIngestError,
  ingestResearchEvidence,
} from "../src/evidence-ingest.js";
import type { EvidenceItem } from "@dyogas/research-engine";

beforeEach(() => clear());

function evidence(n = 2): EvidenceItem[] {
  return Array.from({ length: n }, (_, i) => ({
    evidenceId: `ev-${i}`,
    excerpt: `Excerpt ${i} about local-first decision evidence.`,
    metadata: {
      sourceClass: "web" as const,
      title: `Source ${i}`,
      pointer: `mock://web/${i}`,
      retrievedAt: "2026-07-26T00:00:00.000Z",
      adapter: "mock-source-v1",
    },
  }));
}

test("DG-03: ingestResearchEvidence builds handoff without SoR write", () => {
  const pkg = ingestResearchEvidence({
    taskId: "task-dg",
    tenantId: "t1",
    researchArtifactId: "art-dg",
    evidence: evidence(2),
    question: "Should we ship Decision Graph foundation?",
  });

  assert.equal(pkg.handoff.contractVersion, "1.0.0");
  assert.equal(pkg.handoff.requiresHumanApproval, true);
  assert.equal(pkg.handoff.sorWriteAllowed, false);
  assert.deepEqual([...pkg.evidenceIds], ["ev-0", "ev-1"]);
  assert.match(pkg.content.title, /Decision Graph/);
  assert.match(pkg.content.body, /ev-0/);
  assert.equal(pkg.pendingApproval.decision, "pending");
});

test("DG-03: ingest fails closed on empty evidence", () => {
  assert.throws(
    () =>
      ingestResearchEvidence({
        taskId: "task-dg",
        tenantId: "t1",
        researchArtifactId: "art-dg",
        evidence: [],
      }),
    (err: unknown) => err instanceof EvidenceIngestError,
  );
});

test("DG-03: ingest fails closed on missing pointer", () => {
  const bad = evidence(1);
  const item = {
    ...bad[0]!,
    metadata: { ...bad[0]!.metadata, pointer: "  " },
  };
  assert.throws(
    () =>
      ingestResearchEvidence({
        taskId: "task-dg",
        tenantId: "t1",
        researchArtifactId: "art-dg",
        evidence: [item],
      }),
    (err: unknown) => err instanceof EvidenceIngestError,
  );
});
