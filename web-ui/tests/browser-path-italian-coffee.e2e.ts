/**
 * Browser-path Product E2E — italian coffee ResearchPlan v3 quality.
 * Must NOT produce decision-making sources for a how-to coffee question.
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { clear } from "@dyogas/kernel";
import {
  clearDecisionRequestSessions,
  assertRuntimeDecisionArtifactsExist,
  runtimeDecisionDir,
} from "@dyogas/personal-brain";
import { startDecisionProductServer } from "../src/index.js";

const QUESTION = "how to make italian coffee";
const REQUEST_ID = "BROWSER-ITALIAN-COFFEE-001";

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
  memoryRoot = mkdtempSync(join(tmpdir(), "dyogas-browser-path-"));
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

test("browser-path: italian coffee domain + no decision-making sources", async () => {
  server = await startDecisionProductServer({ port: 0, memoryRoot });
  const base = `http://127.0.0.1:${server.port}`;

  await fetch(`${base}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: "browser-e2e-user",
      tenant_id: "validation-tokyo-2026",
    }),
  });

  const createdRes = await fetch(`${base}/decision/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      question: QUESTION,
      constraints: { topic: "coffee", cuisine: "italian" },
      desired_outcome: "Learn a correct method for Italian coffee",
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
    artifact_dir?: string;
    autoApproved: boolean;
    decision_brief?: {
      domain: string;
      user_goal: string;
      approval_question: string;
      knowledge_preview: string;
      decision_options: Array<{ option_id: string; title: string }>;
    };
    evidence_items: Array<{
      source_url: string;
      title?: string;
      fact?: string;
      source_class: string;
    }>;
  };

  assert.equal(created.status, "waiting_human");
  assert.equal(created.autoApproved, false);
  assert.ok(created.decision_brief);
  assert.equal(created.decision_brief!.domain, "coffee_preparation");
  assert.equal(created.decision_brief!.user_goal, "learn_how_to");
  assert.ok(
    /You are approving creation of:.*Knowledge/i.test(created.decision_brief!.approval_question),
  );
  assert.ok(created.decision_brief!.knowledge_preview.length > 10);
  assert.ok(created.evidence_count >= 3);

  for (const row of created.evidence_items) {
    const hay = `${row.title ?? ""} ${row.source_url} ${row.fact ?? ""}`.toLowerCase();
    assert.equal(
      /decision[- ]making/.test(hay),
      false,
      `decision-making source leaked: ${row.title ?? row.source_url}`,
    );
    assert.ok(
      /coffee|espresso|cappuccino|barista|brew|italian/i.test(hay),
      `unrelated source: ${row.title ?? row.source_url}`,
    );
  }

  const proved = assertRuntimeDecisionArtifactsExist(REQUEST_ID);
  const researchInput = JSON.parse(
    readFileSync(join(proved.dir, "C-research-input.json"), "utf8"),
  ) as { decision_domain?: string };
  assert.equal(researchInput.decision_domain, "coffee_preparation");

  const optionId =
    created.decision_brief!.decision_options[0]?.option_id ?? "opt-record-method";
  const approveRes = await fetch(
    `${base}/decision/${encodeURIComponent(created.proposalId)}/approve`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chosen_option_id: optionId,
        rationale: "browser-path italian coffee approve method knowledge",
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
    assert.ok(existsSync(join(dir, name)), `missing ${name}`);
  }
  const model = JSON.parse(
    readFileSync(join(dir, "J-decision-model.json"), "utf8"),
  ) as { chosen_option?: { option_id: string }; actor_id?: string };
  assert.equal(model.chosen_option?.option_id, optionId);
  assert.ok(model.actor_id);
});
