import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { createMemoryAuditSink } from "@dyogas/trust";
import { admitRun, sealArtifact, acceptHandoff } from "@dyogas/runtime";
import * as sdk from "../src/index.js";
import {
  bindContract,
  ContractBindError,
  createAgentMemory,
  emitCandidate,
  invokeSkill,
  SkillError,
  ToolRegistry,
} from "../src/index.js";

beforeEach(() => clear());

test("bind requires pin and preconditions", () => {
  assert.throws(
    () =>
      bindContract({
        agentId: "research-agent",
        contractVersion: "",
        allowedSkills: ["web-research"],
      }),
    ContractBindError,
  );
  assert.throws(
    () =>
      bindContract({
        agentId: "research-agent",
        contractVersion: "1.0.0",
        allowedSkills: ["web-research"],
        satisfiedPreconditions: [],
      }),
    ContractBindError,
  );
  const b = bindContract({
    agentId: "research-agent",
    contractVersion: "1.0.0",
    allowedSkills: ["web-research"],
    satisfiedPreconditions: ["tenancy_present"],
  });
  assert.equal(b.contractVersion, "1.0.0");
});

test("skill allowlist enforced", async () => {
  const b = bindContract({
    agentId: "research-agent",
    contractVersion: "1.0.0",
    allowedSkills: ["web-research"],
    satisfiedPreconditions: ["tenancy_present"],
  });
  await assert.rejects(
    () => invokeSkill(b, "github-research", {}, { "web-research": () => ({ ok: true }) }),
    SkillError,
  );
  const out = await invokeSkill(
    b,
    "web-research",
    { q: "x" },
    { "web-research": (i) => ({ echo: i.q }) },
  );
  assert.equal(out.echo, "x");
});

test("tools + memory contracts", () => {
  const tools = new ToolRegistry();
  tools.register({
    toolId: "echo",
    description: "echo",
    invoke: (a) => a,
  });
  assert.deepEqual(tools.get("echo").invoke({ a: 1 }), { a: 1 });
  const mem = createAgentMemory();
  mem.put({ key: "k", value: "v", tenantId: "t1" });
  assert.equal(mem.get("t1", "k"), "v");
  assert.equal(mem.get("t2", "k"), undefined);
});

test("candidate unsealed; Runtime seals", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const b = bindContract({
    agentId: "research-agent",
    contractVersion: "1.0.0",
    allowedSkills: [],
    satisfiedPreconditions: ["tenancy_present"],
  });
  const cand = emitCandidate(b, {
    artifactType: "research-report",
    tenantId: "t1",
    payload: { items: [] },
  });
  assert.equal(cand.sealed, false);
  const sealed = sealArtifact(cand.artifactId, "1", cand.tenantId, true);
  assert.equal(acceptHandoff(sealed, "t1").sealed, true);
  const audit = createMemoryAuditSink();
  const run = admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: `${b.agentId}@${b.contractVersion}`,
    audit,
  });
  assert.equal(run.contractPin, "research-agent@1.0.0");
});

test("SDK does not export Runtime host APIs", () => {
  assert.equal("admitRun" in sdk, false);
  assert.equal("transition" in sdk, false);
  assert.equal("startRun" in sdk, false);
});
