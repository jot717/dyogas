import { test } from "node:test";
import assert from "node:assert/strict";
import { adaptExecutionPackage } from "../src/adapter/adapt.ts";
import { authorizeAndExecute } from "../src/agent/execute.ts";
import { buildVerifierFeed } from "../src/verifier/feed.ts";
import {
  collectEngAgentEvidence,
  writeEvidence,
} from "../src/evidence/writer.ts";
import {
  isForbiddenWritePath,
  isWriteAllowed,
} from "../src/evidence/allowlist.ts";
import { buildDevOrchHandoff } from "../src/integration/handoff.ts";
import { sampleFacts, samplePackage } from "./fixtures.ts";

function pipeline() {
  const a = adaptExecutionPackage(samplePackage(), { ok: true });
  assert.equal(a.ok, true);
  if (!a.ok) throw new Error("adapt");
  const exec = authorizeAndExecute({
    adapted: a.adapted,
    gate: { ok: true },
    currentStatus: "IN_PROGRESS",
    facts: sampleFacts(),
  });
  assert.equal(exec.ok, true);
  if (!exec.ok) throw new Error("exec");
  const v = buildVerifierFeed(exec, "IN_PROGRESS");
  assert.ok("recommendation" in v);
  if (!("recommendation" in v)) throw new Error("feed");
  const ev = collectEngAgentEvidence({
    result: exec,
    verifier: v,
    recordedAt: "2026-07-26T00:00:00.000Z",
  });
  assert.ok(!("ok" in ev && ev.ok === false));
  if ("ok" in ev && ev.ok === false) throw new Error("evidence");
  return { exec, v, ev };
}

test("evidence: dry-run writes nothing (TR-4)", () => {
  const { ev } = pipeline();
  const written: string[] = [];
  const result = writeEvidence(
    {
      path: "docs/eng-agent/EA-01-scaffold.json",
      record: ev,
      mode: "dry-run",
    },
    { writeFile: (p) => written.push(p) },
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.mode, "dry-run");
  assert.equal(result.written, false);
  assert.deepEqual(written, []);
});

test("evidence: apply writes allowlisted path", () => {
  const { ev } = pipeline();
  const written: Array<{ path: string; body: string }> = [];
  const result = writeEvidence(
    {
      path: "docs/eng-agent/EA-01-scaffold.json",
      record: ev,
      mode: "apply",
    },
    {
      writeFile: (path, contents) => written.push({ path, body: contents }),
    },
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.written, true);
  assert.equal(written.length, 1);
  assert.equal(written[0]?.path, "docs/eng-agent/EA-01-scaffold.json");
});

test("evidence: forbidden path rejected", () => {
  const { ev } = pipeline();
  const result = writeEvidence({
    path: "runtime/src/index.ts",
    record: ev,
    mode: "apply",
  });
  assert.equal(result.ok, false);
});

test("evidence: allowlist accepts docs/eng-agent", () => {
  assert.equal(isWriteAllowed("docs/eng-agent/EA-01-scaffold.md"), true);
  assert.equal(isWriteAllowed("tasks/TASK-REGISTRY-ENG-AGENT-IMPLEMENTATION-001.md"), true);
  assert.equal(isForbiddenWritePath("runtime/src/x.ts"), true);
  assert.equal(isWriteAllowed("runtime/src/x.ts"), false);
});

test("integration: handoff for dev-orch (TR-5)", () => {
  const { v, ev } = pipeline();
  const h = buildDevOrchHandoff({ verifier: v, evidence: ev });
  assert.equal(h.ok, true);
  if (!h.ok) return;
  assert.equal(h.handoff.bypassesExecutionHost, false);
  assert.equal(h.handoff.productAgent, false);
  assert.equal(h.handoff.dryRunDefault, true);
  assert.equal(h.handoff.implementationEvidence.taskId, "EA-01");
  assert.equal(h.handoff.evidenceRecord.inventedPass, false);
});

test("integration: invented PASS blocked in handoff", () => {
  const { v, ev } = pipeline();
  const bad = {
    ...ev,
    inventedPass: true as unknown as false,
  };
  const h = buildDevOrchHandoff({ verifier: v, evidence: bad });
  assert.equal(h.ok, false);
});
