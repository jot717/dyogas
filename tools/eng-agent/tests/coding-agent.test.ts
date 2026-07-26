/**
 * Unit tests for coding-agent adapter (no live Cursor call).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCodingInstruction } from "../src/coding-agent/instruction.ts";
import { verifyCodingObservation } from "../src/coding-agent/verify.ts";
import { diffSnapshots } from "../src/coding-agent/changes.ts";
import type { CodingAgentObservation } from "../src/coding-agent/types.ts";
import type { ExecutionPackageView } from "../src/adapter/types.ts";

const pkg: ExecutionPackageView = {
  taskId: "CA-TITLE",
  title: "t",
  objective: "implement toTitleCase",
  dependencies: [],
  acceptanceCriteria: "tests pass",
  testRequirements: "node --test",
  allowedScope: "tools/dev-orch/src/util/",
  forbiddenScope: "runtime",
  expectedEvidence: "docs/eng-agent/x.json",
  executionMode: "Implementation Mode",
  sprintId: "SPRINT-ENG-AGENT-CODING-ADAPTER-001",
  ssotReferences: "DL-ENG-AGENT-CODING-ADAPTER-001",
  gapRegistry: "none",
  statusTransition: "READY → DONE",
};

test("coding instruction includes package fields and targets", () => {
  const ins = buildCodingInstruction({
    pkg,
    targetFiles: ["tools/dev-orch/src/util/title-case.ts"],
    allowedPaths: ["tools/dev-orch/src/util/"],
    verifyCommand: {
      command: "node",
      args: ["--test", "tests/coding/title-case.test.ts"],
      cwd: "tools/dev-orch",
    },
    evidencePath: "docs/eng-agent/fixtures/CA-TITLE-evidence.json",
  });
  assert.match(ins.prompt, /CA-TITLE/);
  assert.match(ins.prompt, /toTitleCase/);
  assert.match(ins.prompt, /tools\/dev-orch\/src\/util\/title-case\.ts/);
  assert.equal(ins.taskId, "CA-TITLE");
});

test("coding verifier blocks when no source changes", () => {
  const observation: CodingAgentObservation = {
    taskId: "CA-TITLE",
    mode: "apply",
    instruction: buildCodingInstruction({
      pkg,
      targetFiles: ["tools/dev-orch/src/util/title-case.ts"],
      allowedPaths: ["tools/dev-orch/src/util/"],
      verifyCommand: { command: "node", args: ["--test"], cwd: "." },
      evidencePath: "docs/eng-agent/x.json",
    }),
    instructionDelivered: true,
    changedFiles: [],
    changeDetection: "content-snapshot",
    verifyCommand: {
      command: "node",
      args: [],
      exitCode: 0,
      stdout: "",
      stderr: "",
      durationMs: 1,
    },
    evidencePath: "docs/eng-agent/x.json",
    evidenceExistsOnDisk: true,
  };
  const v = verifyCodingObservation({
    observation,
    workspaceRoot: process.cwd(),
    requireEvidenceOnDisk: false,
  });
  assert.equal(v.trustsCallerFacts, false);
  assert.equal(v.recommendation, "BLOCKED");
  assert.ok(v.failedCheckIds.includes("SOURCE_CHANGES"));
});

test("coding verifier blocks on non-zero test exit", () => {
  const observation: CodingAgentObservation = {
    taskId: "CA-TITLE",
    mode: "apply",
    instruction: buildCodingInstruction({
      pkg,
      targetFiles: ["tools/dev-orch/src/util/title-case.ts"],
      allowedPaths: ["tools/dev-orch/src/util/"],
      verifyCommand: { command: "node", args: ["--test"], cwd: "." },
      evidencePath: "docs/eng-agent/x.json",
    }),
    instructionDelivered: true,
    changedFiles: ["tools/dev-orch/src/util/title-case.ts"],
    changeDetection: "content-snapshot",
    verifyCommand: {
      command: "node",
      args: [],
      exitCode: 1,
      stdout: "",
      stderr: "fail",
      durationMs: 1,
    },
    evidencePath: "docs/eng-agent/x.json",
    evidenceExistsOnDisk: false,
  };
  const v = verifyCodingObservation({
    observation,
    workspaceRoot: process.cwd(),
    requireEvidenceOnDisk: false,
  });
  assert.equal(v.recommendation, "BLOCKED");
  assert.ok(v.failedCheckIds.includes("TEST_EXIT"));
});

test("snapshot diff detects changes", () => {
  const before = new Map([["a.ts", "aaa"]]);
  const after = new Map([["a.ts", "bbb"]]);
  assert.deepEqual(diffSnapshots(before, after), ["a.ts"]);
});
