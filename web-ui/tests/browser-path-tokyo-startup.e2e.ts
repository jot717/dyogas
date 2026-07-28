/**
 * Browser-path Product E2E — Tokyo AI startup decision value.
 * Requires claim-enriched evidence + >=2 decision options; human approval.
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

const QUESTION =
  "Should I build an AI startup in Tokyo or continue employment?";
const REQUEST_ID = "BROWSER-TOKYO-STARTUP-001";

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
  memoryRoot = mkdtempSync(join(tmpdir(), "dyogas-tokyo-e2e-"));
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

test("browser-path: Tokyo startup evidence claims + options + approval path", async () => {
  server = await startDecisionProductServer({ port: 0, memoryRoot });
  const base = `http://127.0.0.1:${server.port}`;

  await fetch(`${base}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: "tokyo-founder",
      tenant_id: "validation-tokyo-2026",
    }),
  });

  const createdRes = await fetch(`${base}/decision/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      question: QUESTION,
      constraints: { location: "Tokyo", timeframe: "2026", founder: "solo" },
      desired_outcome: "Maximize long-term entrepreneurial optionality",
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
    artifact_dir?: string;
    research_summary?: {
      status: string;
      automatic_recommendation: boolean;
      key_findings: string[];
      decision_options_preview: string[];
    };
    decision_brief?: {
      evidence_quality_status?: "HIGH" | "MEDIUM" | "LOW";
      confidence_warning?: string | null;
      decision_domain: string;
      key_factors: Array<{ factor: string }>;
      strongest_evidence: Array<{
        fact: string;
        implication: string;
        decision_impact: string;
      }>;
    };
    evidence_items: Array<{
      source_url: string;
      fact?: string;
      implication?: string;
      decision_impact?: string;
      extracted_claim?: string;
      relevance_reason?: string;
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
  assert.ok(created.evidence_count >= 3, `evidence_count=${created.evidence_count}`);
  assert.ok(created.decision_brief);
  assert.equal(
    created.decision_brief!.decision_domain,
    "startup_decision",
  );
  assert.ok(created.decision_brief!.key_factors.length >= 2);
  assert.ok(created.decision_brief!.strongest_evidence.length >= 2);
  assert.ok(
    created.decision_brief!.evidence_quality_status === "HIGH" ||
      created.decision_brief!.evidence_quality_status === "MEDIUM",
    "quality gate must allow Decision Asset (HIGH or MEDIUM)",
  );
  if (created.decision_brief!.evidence_quality_status === "MEDIUM") {
    assert.ok(
      (created.decision_brief!.confidence_warning ?? "").length > 10,
      "MEDIUM must surface confidence warning for human approval",
    );
  }

  for (const row of created.evidence_items) {
    assert.ok(row.source_url, "URL required");
    assert.ok(row.fact && row.fact.length > 15, "fact required");
    assert.ok(row.implication && row.implication.length > 10, "implication required");
    assert.ok(row.decision_impact && row.decision_impact.length > 10, "impact required");
    assert.ok(row.provenance?.pointer, "provenance required");
  }

  const options = created.decision_asset.options ?? [];
  assert.ok(options.length >= 2, ">=2 decision options");
  for (const o of options) {
    assert.ok(o.supporting_evidence.length >= 1);
    assert.ok(o.risks.length >= 1);
    assert.ok(o.unknowns.length >= 1);
    assert.ok(o.advantages.length >= 1);
  }

  assertRuntimeDecisionArtifactsExist(REQUEST_ID);
  const evidenceDoc = JSON.parse(
    readFileSync(
      join(runtimeDecisionDir(REQUEST_ID), "D-research-evidence.json"),
      "utf8",
    ),
  ) as { evidence: Array<{ extractedClaim?: string }> };
  assert.ok(
    evidenceDoc.evidence.every((e) => (e.extractedClaim ?? "").length > 0),
  );

  const approveRes = await fetch(
    `${base}/decision/${encodeURIComponent(created.proposalId)}/approve`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chosen_option_id:
          created.decision_asset.options?.[0]?.option_id ??
          created.decision_brief?.decision_options?.[0]?.option_id,
        rationale: "Tokyo startup e2e human approve",
      }),
    },
  );
  const approveText = await approveRes.text();
  assert.equal(approveRes.status, 200, approveText);

  const dir = runtimeDecisionDir(REQUEST_ID);
  for (const name of [
    "G-knowledge.json",
    "H-decision-graph.json",
    "I-lineage.json",
    "J-decision-model.json",
  ]) {
    assert.ok(existsSync(join(dir, name)), `missing ${name}`);
  }
});

