/**
 * P2-05 — Gate validator tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { ExecutionPackage } from "../src/package/types.ts";
import { validateExecutionGate } from "../src/gate/validate.ts";
import type { GateContext } from "../src/gate/types.ts";

function basePackage(
  overrides: Partial<ExecutionPackage> = {},
): ExecutionPackage {
  return {
    taskId: "P2-05",
    title: "Gate validator",
    objective: "Enforce Execution Package boundaries",
    dependencies: ["P2-01"],
    acceptanceCriteria: "Rejects missing fields and forbidden paths",
    testRequirements: "Negative tests for each gate failure mode",
    allowedScope: "tools/dev-orch/src/gate/; docs/dev-orch/P2-05-*.md",
    forbiddenScope:
      "Runtime; SDK; Harness Spec; Execution Host; Product modules",
    expectedEvidence: "docs/dev-orch/P2-05-gate-validator.md",
    executionMode: "Implementation Mode",
    sprintId: "SPRINT-DEV-ORCH-002",
    ssotReferences: "START_DEVELOPMENT §5; DL-DEV-ORCH-002; SPEC-DEV-ORCH-001",
    gapRegistry: "none",
    statusTransition:
      "READY_FOR_EXECUTION → IN_PROGRESS → DONE | BLOCKED",
    ...overrides,
  };
}

function baseContext(overrides: Partial<GateContext> = {}): GateContext {
  return {
    mode: "Implementation Mode",
    sprintAuthorized: true,
    decisionLogApproved: true,
    knownTaskIds: ["P2-05", "P2-01"],
    proposedPaths: [
      "tools/dev-orch/src/gate/validate.ts",
      "docs/dev-orch/P2-05-gate-validator.md",
    ],
    createsPlanningArtifacts: false,
    modifiesCode: true,
    ...overrides,
  };
}

test("gate: allowed path passes", () => {
  const result = validateExecutionGate(basePackage(), baseContext());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.ok(result.checks.includes("SCOPE"));
});

test("gate: forbidden path fails", () => {
  const result = validateExecutionGate(
    basePackage(),
    baseContext({
      proposedPaths: ["runtime/src/index.ts"],
    }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.action, "STOP");
  assert.ok(result.violations.some((v) => v.check === "SCOPE"));
  assert.ok(result.violations.some((v) => /forbidden path/i.test(v.message)));
});

test("gate: missing AC fails", () => {
  const result = validateExecutionGate(
    basePackage({ acceptanceCriteria: "  " }),
    baseContext(),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.action, "STOP");
  assert.ok(
    result.violations.some(
      (v) =>
        v.check === "COMPLETENESS" && /Acceptance Criteria/i.test(v.message),
    ),
  );
});

test("gate: missing authorization fails", () => {
  const result = validateExecutionGate(
    basePackage(),
    baseContext({
      sprintAuthorized: false,
      decisionLogApproved: false,
    }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.action, "STOP");
  assert.ok(result.violations.some((v) => v.check === "AUTHORIZATION"));
});

test("gate: invalid task fails", () => {
  const result = validateExecutionGate(
    basePackage({ taskId: "P2-99" }),
    baseContext({ knownTaskIds: ["P2-05"] }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.action, "STOP");
  assert.ok(
    result.violations.some(
      (v) => v.check === "AUTHORIZATION" && /invalid or unknown Task ID/i.test(v.message),
    ),
  );
});

test("gate: fail closed behavior (undeclared path + no override)", () => {
  const result = validateExecutionGate(
    basePackage(),
    baseContext({
      proposedPaths: ["personal-brain/src/secret.ts"],
    }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.action, "STOP");
  assert.ok(
    result.violations.some((v) => /undeclared modification/i.test(v.message)),
  );
});

test("gate: Planning+code mix fails (§5.4)", () => {
  const result = validateExecutionGate(
    basePackage(),
    baseContext({
      createsPlanningArtifacts: true,
      modifiesCode: true,
    }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.action, "STOP");
  assert.ok(result.violations.some((v) => v.check === "MODE"));
});

test("gate: non-Implementation Mode fails", () => {
  const result = validateExecutionGate(
    basePackage(),
    baseContext({ mode: "Planning Mode" }),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(
    result.violations.some((v) =>
      /Implementation Mode not active/i.test(v.message),
    ),
  );
});
