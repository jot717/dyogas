/**
 * Decision Intelligence browser MVP tests
 * (SPRINT-PERSONAL-BRAIN-WEB-MVP-001).
 */

import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { clear } from "@dyogas/kernel";
import { clearDecisionRequestSessions } from "@dyogas/personal-brain";
import {
  ApprovalConsole,
  startApprovalServer,
  startDecisionProductServer,
} from "../src/index.js";

let memoryRoot = "";
let server: Awaited<ReturnType<typeof startDecisionProductServer>> | null =
  null;

beforeEach(() => {
  clear();
  clearDecisionRequestSessions();
  memoryRoot = mkdtempSync(join(tmpdir(), "dyogas-web-mvp-"));
});

afterEach(async () => {
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

test("WEB-MVP: favicon route returns 200 or 204", async () => {
  server = await startDecisionProductServer({ port: 0, memoryRoot });
  const res = await fetch(`http://127.0.0.1:${server.port}/favicon.ico`);
  assert.ok(
    res.status === 200 || res.status === 204,
    `favicon status=${res.status}`,
  );
});

test("legacy approval console enqueue and decide via HTTP", async () => {
  const store = new ApprovalConsole();
  server = await startApprovalServer(store, 0);
  // tenancy required by human-gate enqueue
  const { createTenantId, createTenancyContext, propagate } = await import(
    "@dyogas/kernel"
  );
  propagate(createTenancyContext(createTenantId("t1")));

  const created = await fetch(`http://127.0.0.1:${server.port}/api/gates`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      proposalId: "p1",
      researchArtifactId: "r1",
      painStatement: "Need visible approvals",
    }),
  });
  assert.equal(created.status, 201);
  const gate = (await created.json()) as { gateId: string; decision: string };
  assert.equal(gate.decision, "pending");

  const decided = await fetch(
    `http://127.0.0.1:${server.port}/api/gates/${gate.gateId}/decide`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: "approved", actorId: "founder" }),
    },
  );
  assert.equal(decided.status, 200);
  const body = (await decided.json()) as { decision: string };
  assert.equal(body.decision, "approved");

  const home = await fetch(`http://127.0.0.1:${server.port}/`);
  assert.equal(home.status, 200);
  const html = await home.text();
  assert.match(html, /DYOGAS/);
  assert.match(html, /app\.js/);
});

test("WEB-MVP: API create → inbox → approve → history (no auto decision)", async () => {
  server = await startDecisionProductServer({ port: 0, memoryRoot });
  await fetch(`http://127.0.0.1:${server.port}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: "web-mvp-user",
      tenant_id: "validation-tokyo-2026",
    }),
  });

  const createdRes = await fetch(
    `http://127.0.0.1:${server.port}/decision/request`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question:
          "Should I build an AI startup in Tokyo or continue employment?",
        constraints: { location: "Tokyo", timeframe: "2026" },
        desired_outcome: "Maximize long-term entrepreneurial optionality",
        request_id: "USER-WEB-MVP-001",
      }),
    },
  );
  assert.equal(createdRes.status, 201);
  const created = (await createdRes.json()) as {
    proposalId: string;
    status: string;
    autoApproved: boolean;
    host_status: string;
    stages_completed: string[];
    evidence_count: number;
  };
  assert.equal(created.status, "waiting_human");
  assert.equal(created.autoApproved, false);
  assert.equal(created.host_status, "waiting_human");
  assert.ok(created.stages_completed.includes("research"));
  assert.ok(created.stages_completed.includes("human_approval"));
  assert.ok(created.evidence_count >= 1);

  const inboxRes = await fetch(
    `http://127.0.0.1:${server.port}/decision/inbox`,
  );
  const inbox = (await inboxRes.json()) as Array<{ proposalId: string }>;
  assert.ok(inbox.some((i) => i.proposalId === created.proposalId));

  const getRes = await fetch(
    `http://127.0.0.1:${server.port}/decision/${created.proposalId}`,
  );
  const detail = (await getRes.json()) as {
    analysis: { automatic_decision: boolean; recommendation: boolean };
  };
  assert.equal(detail.analysis.automatic_decision, false);
  assert.equal(detail.analysis.recommendation, false);

  const approveRes = await fetch(
    `http://127.0.0.1:${server.port}/decision/${created.proposalId}/approve`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rationale: "WEB-MVP approve" }),
    },
  );
  assert.equal(approveRes.status, 200);
  const approved = (await approveRes.json()) as {
    status: string;
    decisionModel: { question: string };
  };
  assert.equal(approved.status, "approved");
  assert.ok(approved.decisionModel.question);

  const histRes = await fetch(
    `http://127.0.0.1:${server.port}/decision/history`,
  );
  const history = (await histRes.json()) as unknown[];
  assert.ok(history.length >= 1);
});

test("WEB-MVP: user isolation", async () => {
  server = await startDecisionProductServer({ port: 0, memoryRoot });
  await fetch(`http://127.0.0.1:${server.port}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: "user-a",
      tenant_id: "validation-tokyo-2026",
    }),
  });
  const createdRes = await fetch(
    `http://127.0.0.1:${server.port}/decision/request`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question: "Isolation check decision?",
        constraints: { location: "Tokyo" },
        desired_outcome: "Stay isolated",
        request_id: "WEB-ISO-A",
      }),
    },
  );
  const created = (await createdRes.json()) as { proposalId: string };
  await fetch(
    `http://127.0.0.1:${server.port}/decision/${created.proposalId}/approve`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    },
  );

  await fetch(`http://127.0.0.1:${server.port}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: "user-b",
      tenant_id: "validation-tokyo-2026",
    }),
  });
  const histB = (await (
    await fetch(`http://127.0.0.1:${server.port}/decision/history`)
  ).json()) as unknown[];
  assert.equal(histB.length, 0);

  const other = await fetch(
    `http://127.0.0.1:${server.port}/decision/${created.proposalId}`,
  );
  assert.equal(other.status, 400);
});

test("WEB-MVP: reject blocks model", async () => {
  server = await startDecisionProductServer({ port: 0, memoryRoot });
  await fetch(`http://127.0.0.1:${server.port}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: "web-mvp-user",
      tenant_id: "validation-tokyo-2026",
    }),
  });
  const created = (await (
    await fetch(`http://127.0.0.1:${server.port}/decision/request`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question: "Reject path?",
        constraints: {},
        desired_outcome: "Do not proceed",
        request_id: "WEB-REJECT",
      }),
    })
  ).json()) as { proposalId: string };

  const rejected = (await (
    await fetch(
      `http://127.0.0.1:${server.port}/decision/${created.proposalId}/reject`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rationale: "no" }),
      },
    )
  ).json()) as { status: string; decisionModel?: unknown };
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.decisionModel, undefined);

  const hist = (await (
    await fetch(`http://127.0.0.1:${server.port}/decision/history`)
  ).json()) as unknown[];
  assert.equal(hist.length, 0);
});
