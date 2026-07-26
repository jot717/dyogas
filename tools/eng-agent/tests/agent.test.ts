import { test } from "node:test";
import assert from "node:assert/strict";
import { adaptExecutionPackage } from "../src/adapter/adapt.ts";
import { authorizeAndExecute } from "../src/agent/execute.ts";
import { sampleFacts, samplePackage } from "./fixtures.ts";

function adapted() {
  const r = adaptExecutionPackage(samplePackage(), { ok: true });
  assert.equal(r.ok, true);
  if (!r.ok) throw new Error("adapt failed");
  return r.adapted;
}

test("agent: authorized + gate pass accepts facts (TR-1)", () => {
  const result = authorizeAndExecute({
    adapted: adapted(),
    gate: { ok: true },
    currentStatus: "READY_FOR_EXECUTION",
    facts: sampleFacts(),
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.authorized.taskId, "EA-01");
  assert.equal(result.verifierPassInvented, false);
});

test("agent: gate fail refuses (TR-1)", () => {
  const result = authorizeAndExecute({
    adapted: adapted(),
    gate: { ok: false, reason: "scope" },
    currentStatus: "READY_FOR_EXECUTION",
    facts: sampleFacts(),
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /unauthorized/);
});

test("agent: DONE status refuses", () => {
  const result = authorizeAndExecute({
    adapted: adapted(),
    gate: { ok: true },
    currentStatus: "DONE",
    facts: sampleFacts(),
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /not executable/);
});

test("agent: forbidden changedFiles refuse", () => {
  const result = authorizeAndExecute({
    adapted: adapted(),
    gate: { ok: true },
    currentStatus: "IN_PROGRESS",
    facts: sampleFacts({
      changedFiles: ["runtime/src/index.ts"],
    }),
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.reason, /forbidden|runtime/i);
});

test("agent: never invents verifier PASS", () => {
  const result = authorizeAndExecute({
    adapted: adapted(),
    gate: { ok: true },
    currentStatus: "READY_FOR_EXECUTION",
    facts: sampleFacts(),
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.verifierPassInvented, false);
});
