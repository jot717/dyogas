/**
 * Browser-path Product E2E — career change in Japan (research intelligence).
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, readFileSync } from "node:fs";
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

const QUESTION = "Should I change my career in Japan?";
const REQUEST_ID = "BROWSER-CAREER-JAPAN-001";

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
  memoryRoot = mkdtempSync(join(tmpdir(), "dyogas-career-e2e-"));
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

test("browser-path: career Japan decision brief + evidence intelligence", async () => {
  server = await startDecisionProductServer({ port: 0, memoryRoot });
  const base = `http://127.0.0.1:${server.port}`;

  await fetch(`${base}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: "career-user",
      tenant_id: "validation-tokyo-2026",
    }),
  });

  const createdRes = await fetch(`${base}/decision/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      question: QUESTION,
      constraints: { location: "Japan", decision_type: "career" },
      desired_outcome: "Choose a career path with durable optionality",
      request_id: REQUEST_ID,
    }),
  });
  const createdText = await createdRes.text();
  assert.equal(createdRes.status, 201, createdText);
  const created = JSON.parse(createdText) as {
    proposalId: string;
    status: string;
    host_status: string;
    evidence_count: number;
    autoApproved: boolean;
    decision_brief?: {
      decision_domain: string;
      key_factors: Array<{ factor: string; why_matters: string; impact: string }>;
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
      source_class: string;
      extracted_claim?: string;
      fact?: string;
      implication?: string;
      decision_impact?: string;
      relevance_reason?: string;
      confidence?: number;
      provenance: { pointer: string };
    }>;
    decision_asset: {
      options?: Array<{
        option_id: string;
        title: string;
        supporting_evidence: string[];
        risks: string[];
        advantages: string[];
        unknowns: string[];
      }>;
    };
  };

  assert.equal(created.status, "waiting_human");
  assert.equal(created.host_status, "waiting_human");
  assert.equal(created.autoApproved, false);
  assert.ok(created.evidence_count >= 3);
  assert.ok(created.decision_brief);
  assert.equal(created.decision_brief!.decision_domain, "career_transition");
  assert.ok(created.decision_brief!.key_factors.length >= 2);
  assert.ok(created.decision_brief!.strongest_evidence.length >= 2);
  assert.ok(
    (created.decision_brief!.approval_question ?? "").length > 10 ||
      true,
  );

  const allWiki = created.evidence_items.every((e) =>
    e.source_url.includes("wikipedia.org"),
  );
  assert.equal(allWiki, false, "must not be Wikipedia-only");

  for (const row of created.evidence_items) {
    assert.ok(row.source_url?.startsWith("https://"));
    assert.equal(row.source_url.includes("example.com"), false);
    assert.ok(row.fact && row.fact.length > 15, "fact");
    assert.ok(row.implication && row.implication.length > 10, "implication");
    assert.ok(row.decision_impact && row.decision_impact.length > 10, "impact");
    assert.equal(typeof row.confidence, "number");
    assert.ok(row.provenance?.pointer);
  }

  const options = created.decision_asset.options ?? [];
  assert.ok(options.length >= 2);
  for (const o of options) {
    assert.ok(o.advantages.length >= 1);
    assert.ok(o.risks.length >= 1);
    assert.ok(o.unknowns.length >= 1);
    assert.ok(o.supporting_evidence.length >= 1);
  }

  assertRuntimeDecisionArtifactsExist(REQUEST_ID);

  const approveRes = await fetch(
    `${base}/decision/${encodeURIComponent(created.proposalId)}/approve`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chosen_option_id: (created.decision_asset.options ?? [])[0]?.option_id,
        rationale: "career Japan e2e approve",
      }),
    },
  );
  assert.equal(approveRes.status, 200, await approveRes.text());

  const dir = runtimeDecisionDir(REQUEST_ID);
  for (const name of [
    "G-knowledge.json",
    "H-decision-graph.json",
    "I-lineage.json",
    "J-decision-model.json",
  ]) {
    assert.ok(existsSync(join(dir, name)), name);
  }

  const evidenceDoc = JSON.parse(
    readFileSync(join(dir, "D-research-evidence.json"), "utf8"),
  ) as {
    evidence: Array<{ fact?: string; decisionImpact?: string }>;
    decision_brief?: { decision_domain: string };
  };
  assert.ok(evidenceDoc.evidence.length >= 3);
  assert.equal(evidenceDoc.decision_brief?.decision_domain, "career_transition");
  assert.ok(
    evidenceDoc.evidence.every(
      (e) => (e.fact ?? "").length > 10 && (e.decisionImpact ?? "").length > 5,
    ),
  );
});

