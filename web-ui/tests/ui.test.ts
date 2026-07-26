import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { ApprovalConsole, startApprovalServer } from "../src/index.js";

beforeEach(() => clear());

test("approval console enqueue and decide via HTTP", async () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const store = new ApprovalConsole();
  const server = await startApprovalServer(store, 0);
  try {
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
  } finally {
    await server.close();
  }
});
