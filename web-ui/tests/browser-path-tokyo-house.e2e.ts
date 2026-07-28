/**
 * Browser-path Product E2E — Tokyo house purchase decision.
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { clear } from "@dyogas/kernel";
import {
  clearDecisionRequestSessions,
  assertRuntimeDecisionArtifactsExist,
  runtimeDecisionDir,
} from "@dyogas/personal-brain";
import { startDecisionProductServer } from "../src/index.js";

const QUESTION = "Should I buy a house in Tokyo?";
const REQUEST_ID = "BROWSER-TOKYO-HOUSE-001";

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

let memoryRoot = "";
let server: Awaited<ReturnType<typeof startDecisionProductServer>> | null =
  null;

before(() => {
  delete process.env.DYOGAS_RESEARCH_COLLECTOR;
  process.env.DYOGAS_REPO_ROOT = repoRoot();
  clear();
  clearDecisionRequestSessions();
  memoryRoot = mkdtempSync(join(tmpdir(), "dyogas-house-e2e-"));
});

after(async () => {
  if (server) {
    await server.close();
    server = null;
  }
  try {
    rmSync(memoryRoot, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});

test("browser-path: Tokyo house decision brief + evidence intelligence", async () => {
  server = await startDecisionProductServer({ port: 0, memoryRoot });
  const base = `http://127.0.0.1:${server.port}`;

  await fetch(`${base}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: "house-buyer",
      tenant_id: "validation-tokyo-2026",
    }),
  });

  const createdRes = await fetch(`${base}/decision/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      question: QUESTION,
      constraints: { location: "Tokyo", decision_type: "real_estate" },
      desired_outcome: "Make a financially sound housing decision",
      request_id: REQUEST_ID,
    }),
  });
  const createdText = await createdRes.text();
  assert.equal(createdRes.status, 201, createdText);
  const created = JSON.parse(createdText) as {
    proposalId: string;
    status: string;
    evidence_count: number;
    decision_brief?: {
      decision_domain: string;
      key_factors: Array<{ factor: string }>;
      strongest_evidence: Array<{
        fact: string;
        implication: string;
        decision_impact: string;
      }>;
      decision_options: Array<{
        title: string;
        advantages: string[];
        risks: string[];
        unknowns: string[];
      }>;
    };
    evidence_items: Array<{
      source_url: string;
      fact?: string;
      implication?: string;
      decision_impact?: string;
    }>;
    decision_asset: { options?: Array<{ title: string }> };
  };

  assert.equal(created.status, "waiting_human");
  assert.ok(created.evidence_count >= 3);
  assert.ok(created.decision_brief);
  assert.equal(created.decision_brief!.decision_domain, "real_estate");
  assert.ok(created.decision_brief!.key_factors.length >= 2);
  assert.ok(created.decision_brief!.strongest_evidence.length >= 2);
  assert.ok(created.decision_brief!.decision_options.length >= 2);

  const allWiki = created.evidence_items.every((e) =>
    e.source_url.includes("wikipedia.org"),
  );
  assert.equal(allWiki, false, "must not be Wikipedia-only");

  for (const row of created.evidence_items) {
    assert.ok(row.fact && row.fact.length > 15);
    assert.ok(row.implication && row.implication.length > 10);
    assert.ok(row.decision_impact && row.decision_impact.length > 10);
  }

  assert.ok((created.decision_asset.options ?? []).length >= 2);

  assertRuntimeDecisionArtifactsExist(REQUEST_ID);
  const evidenceDoc = JSON.parse(
    readFileSync(join(runtimeDecisionDir(REQUEST_ID), "D-research-evidence.json"), "utf8"),
  ) as { decision_brief?: { decision_domain: string } };
  assert.equal(evidenceDoc.decision_brief?.decision_domain, "real_estate");
});
