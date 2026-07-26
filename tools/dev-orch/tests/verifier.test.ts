/**
 * P2-06 — Verifier engine tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { ExecutionPackage } from "../src/package/types.ts";
import type { ImplementationEvidence } from "../src/verifier/types.ts";
import {
  verifyImplementation,
  verifierResultToJson,
} from "../src/verifier/engine.ts";

function basePackage(
  overrides: Partial<ExecutionPackage> = {},
): ExecutionPackage {
  return {
    taskId: "P2-06",
    title: "Verifier engine",
    objective: "Verify implementation against Execution Package",
    dependencies: ["P2-04", "P2-05"],
    acceptanceCriteria: "One pass and one fail fixture per check family",
    testRequirements: "8×(pass+fail) minimum coverage",
    allowedScope: "tools/dev-orch/src/verifier/; docs/dev-orch/P2-06-*.md",
    forbiddenScope: "Runtime; SDK; Execution Host; Product modules",
    expectedEvidence: "docs/dev-orch/P2-06-verifier.md",
    executionMode: "Implementation Mode",
    sprintId: "SPRINT-DEV-ORCH-002",
    ssotReferences: "DEV-ORCH-RUNBOOK §6; DL-DEV-ORCH-002",
    gapRegistry: "none",
    statusTransition:
      "READY_FOR_EXECUTION → IN_PROGRESS → DONE | BLOCKED",
    ...overrides,
  };
}

function baseEvidence(
  overrides: Partial<ImplementationEvidence> = {},
): ImplementationEvidence {
  return {
    taskId: "P2-06",
    evidenceReference: "docs/dev-orch/P2-06-verifier.md",
    evidenceExists: true,
    testResult: {
      ran: true,
      passed: true,
      summary: "all verifier tests pass",
    },
    changedFiles: [
      "tools/dev-orch/src/verifier/engine.ts",
      "docs/dev-orch/P2-06-verifier.md",
    ],
    acceptanceCriteriaEvidence: [
      {
        criterion: "One pass and one fail fixture per check family",
        status: "PASS",
      },
    ],
    gapsRegisteredOpen: true,
    ssotCitationsPresent: true,
    currentStatus: "IN_PROGRESS",
    ...overrides,
  };
}

test("verifier: valid implementation passes", () => {
  const result = verifyImplementation(basePackage(), baseEvidence());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.recommendation, "PASS");
});

test("verifier: missing evidence fails", () => {
  const result = verifyImplementation(
    basePackage(),
    baseEvidence({
      evidenceReference: "",
      evidenceExists: false,
      changedFiles: [],
    }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.recommendation, "BLOCKED");
  assert.ok(result.failedCheckIds.includes("EVIDENCE"));
});

test("verifier: missing AC evidence fails", () => {
  const result = verifyImplementation(
    basePackage(),
    baseEvidence({ acceptanceCriteriaEvidence: [] }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.recommendation, "BLOCKED");
  assert.ok(result.failedCheckIds.includes("AC"));
});

test("verifier: failed test blocks", () => {
  const result = verifyImplementation(
    basePackage(),
    baseEvidence({
      testResult: {
        ran: true,
        passed: false,
        summary: "1 failed",
      },
    }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.recommendation, "BLOCKED");
  assert.ok(result.failedCheckIds.includes("TESTS"));
});

test("verifier: scope violation blocks", () => {
  const result = verifyImplementation(
    basePackage(),
    baseEvidence({
      changedFiles: ["runtime/src/index.ts"],
    }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.recommendation, "BLOCKED");
  assert.ok(result.failedCheckIds.includes("SCOPE"));
});

test("verifier: output deterministic", () => {
  const a = verifyImplementation(basePackage(), baseEvidence());
  const b = verifyImplementation(basePackage(), baseEvidence());
  assert.equal(verifierResultToJson(a), verifierResultToJson(b));
});

test("verifier: MUST NOT claim registry mutation (recommendation only)", () => {
  const result = verifyImplementation(basePackage(), baseEvidence());
  const json = verifierResultToJson(result);
  assert.equal(json.includes("DONE"), false);
  assert.match(json, /"recommendation": "PASS"/);
});

test("verifier: AC FAIL status blocks", () => {
  const result = verifyImplementation(
    basePackage(),
    baseEvidence({
      acceptanceCriteriaEvidence: [
        { criterion: "required criterion", status: "FAIL" },
      ],
    }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.failedCheckIds.includes("AC"));
});
