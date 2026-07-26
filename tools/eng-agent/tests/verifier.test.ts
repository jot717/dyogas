import { test } from "node:test";
import assert from "node:assert/strict";
import { adaptExecutionPackage } from "../src/adapter/adapt.ts";
import { authorizeAndExecute } from "../src/agent/execute.ts";
import {
  buildVerifierFeed,
  recommendFromFacts,
} from "../src/verifier/feed.ts";
import { sampleFacts, samplePackage } from "./fixtures.ts";

function execOk(facts = sampleFacts()) {
  const a = adaptExecutionPackage(samplePackage(), { ok: true });
  assert.equal(a.ok, true);
  if (!a.ok) throw new Error("adapt");
  const r = authorizeAndExecute({
    adapted: a.adapted,
    gate: { ok: true },
    currentStatus: "IN_PROGRESS",
    facts,
  });
  assert.equal(r.ok, true);
  if (!r.ok) throw new Error("exec");
  return r;
}

test("verifier: evidence-in → PASS when all facts good (TR-3)", () => {
  const feed = buildVerifierFeed(execOk(), "IN_PROGRESS");
  assert.ok("recommendation" in feed);
  if (!("recommendation" in feed)) return;
  assert.equal(feed.recommendation, "PASS");
  assert.equal(feed.feed.inventedPass, false);
  assert.deepEqual(feed.failedChecks, []);
});

test("verifier: missing evidence → BLOCKED (never invent PASS)", () => {
  const feed = buildVerifierFeed(
    execOk(
      sampleFacts({ evidenceExists: false, evidenceReference: "" }),
    ),
    "IN_PROGRESS",
  );
  assert.ok("recommendation" in feed);
  if (!("recommendation" in feed)) return;
  assert.equal(feed.recommendation, "BLOCKED");
  assert.ok(feed.failedChecks.includes("EVIDENCE"));
});

test("verifier: failed tests → BLOCKED", () => {
  const feed = buildVerifierFeed(
    execOk(
      sampleFacts({
        testResult: { ran: true, passed: false, summary: "fail" },
      }),
    ),
    "IN_PROGRESS",
  );
  assert.ok("recommendation" in feed);
  if (!("recommendation" in feed)) return;
  assert.equal(feed.recommendation, "BLOCKED");
  assert.ok(feed.failedChecks.includes("TESTS"));
});

test("verifier: AC FAIL → BLOCKED", () => {
  const feed = buildVerifierFeed(
    execOk(
      sampleFacts({
        acceptanceCriteriaEvidence: [
          { criterion: "x", status: "FAIL" },
        ],
      }),
    ),
    "IN_PROGRESS",
  );
  assert.ok("recommendation" in feed);
  if (!("recommendation" in feed)) return;
  assert.equal(feed.recommendation, "BLOCKED");
  assert.ok(feed.failedChecks.includes("AC"));
});

test("verifier: refused execution cannot feed", () => {
  const a = adaptExecutionPackage(samplePackage(), { ok: true });
  assert.equal(a.ok, true);
  if (!a.ok) return;
  const refused = authorizeAndExecute({
    adapted: a.adapted,
    gate: { ok: false, reason: "no" },
    currentStatus: "READY_FOR_EXECUTION",
    facts: sampleFacts(),
  });
  const feed = buildVerifierFeed(refused, "READY_FOR_EXECUTION");
  assert.equal("ok" in feed && feed.ok === false, true);
});

test("verifier: recommendFromFacts never invents PASS without evidence", () => {
  const r = recommendFromFacts({
    taskId: "EA-01",
    evidenceReference: "",
    evidenceExists: false,
    testResult: { ran: false, passed: false, summary: "" },
    changedFiles: [],
    acceptanceCriteriaEvidence: [],
    gapsRegisteredOpen: true,
    ssotCitationsPresent: true,
    currentStatus: "IN_PROGRESS",
    inventedPass: false,
  });
  assert.equal(r.recommendation, "BLOCKED");
});
