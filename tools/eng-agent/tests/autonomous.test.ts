/**
 * Executor + independent verifier + autonomous cycle tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, rmSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { executePlan } from "../src/executor/lifecycle.ts";
import { isExecutorWriteAllowed } from "../src/executor/paths.ts";
import { verifyIndependently } from "../src/verifier/independent.ts";
import { runAutonomousCycle } from "../src/autonomous.ts";
import type { ExecutionPlan } from "../src/executor/types.ts";
import type { ExecutionPackageView } from "../src/adapter/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const engRoot = resolve(here, "..");
const workspaceRoot = resolve(engRoot, "../..");

const samplePkg = (): ExecutionPackageView => ({
  taskId: "AE-FIX1",
  title: "Create a test file and pass verification",
  objective: "Write generated test and run it",
  dependencies: [],
  acceptanceCriteria: "Generated test exists; node --test exits 0",
  testRequirements: "node --test",
  allowedScope: "tools/eng-agent/fixtures/; docs/eng-agent/",
  forbiddenScope: "Runtime; Agent SDK; Execution Host; Product modules",
  expectedEvidence: "docs/eng-agent/fixtures/AE-FIX-01-evidence.json",
  executionMode: "Implementation Mode",
  sprintId: "SPRINT-ENG-AGENT-AUTONOMOUS-EXECUTION-001",
  ssotReferences: "DL-ENG-AGENT-AUTONOMOUS-EXECUTION-001",
  gapRegistry: "GAP-EA-001",
  statusTransition: "READY_FOR_EXECUTION → IN_PROGRESS → DONE | BLOCKED",
});

function fixturePlan(): ExecutionPlan {
  return JSON.parse(
    readFileSync(
      join(engRoot, "fixtures/AE-FIX-01/plan.json"),
      "utf8",
    ),
  ) as ExecutionPlan;
}

test("executor boundary: rejects runtime write", async () => {
  const plan: ExecutionPlan = {
    taskId: "X",
    evidencePath: "docs/eng-agent/x.json",
    steps: [
      {
        type: "writeFile",
        path: "runtime/src/evil.ts",
        contents: "nope",
      },
    ],
  };
  const result = await executePlan(plan, {
    mode: "apply",
    workspaceRoot,
  });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /forbidden/);
});

test("executor boundary: allowlist accepts fixtures", () => {
  assert.equal(
    isExecutorWriteAllowed(
      workspaceRoot,
      "tools/eng-agent/fixtures/AE-FIX-01/sandbox/generated.test.js",
    ),
    true,
  );
  assert.equal(
    isExecutorWriteAllowed(workspaceRoot, "runtime/src/x.ts"),
    false,
  );
});

test("executor: apply writes file and runs test (real)", async () => {
  const sandboxFile = join(
    workspaceRoot,
    "tools/eng-agent/fixtures/AE-FIX-01/sandbox/generated.test.js",
  );
  if (existsSync(sandboxFile)) rmSync(sandboxFile);

  const result = await executePlan(fixturePlan(), {
    mode: "apply",
    workspaceRoot,
  });
  assert.equal(result.ok, true, result.error);
  assert.ok(result.observation);
  assert.equal(result.observation!.allStepsOk, true);
  assert.deepEqual(result.observation!.commandExitCodes, [0]);
  assert.equal(existsSync(sandboxFile), true);
});

test("verifier independence: uses observation exit codes, not caller facts", () => {
  const observation = {
    taskId: "AE-FIX-01",
    mode: "apply" as const,
    steps: [],
    commandExitCodes: [1],
    writtenPaths: [],
    evidencePath: "docs/eng-agent/fixtures/missing.json",
    evidenceExistsOnDisk: false,
    allStepsOk: false,
  };
  const v = verifyIndependently({
    observation,
    workspaceRoot,
    requireEvidenceOnDisk: true,
  });
  assert.equal(v.trustsCallerFacts, false);
  assert.equal(v.recommendation, "BLOCKED");
  assert.ok(v.failedCheckIds.includes("COMMAND_EXIT") || v.failedCheckIds.includes("STEPS"));
  assert.ok(v.failedCheckIds.includes("EVIDENCE_ON_DISK"));
});

test("verifier independence: PASS only when exit 0 + files + evidence", () => {
  const evidenceRel = "docs/eng-agent/fixtures/AE-FIX-01-evidence.json";
  const evidenceAbs = join(workspaceRoot, evidenceRel);
  mkdirSync(dirname(evidenceAbs), { recursive: true });
  writeFileSync(evidenceAbs, "{}\n");

  const sandboxRel =
    "tools/eng-agent/fixtures/AE-FIX-01/sandbox/generated.test.js";
  const observation = {
    taskId: "AE-FIX-01",
    mode: "apply" as const,
    steps: [
      {
        index: 0,
        step: {
          type: "writeFile" as const,
          path: sandboxRel,
          contents: "x",
        },
        ok: true,
        write: {
          path: sandboxRel,
          bytesWritten: 1,
          existedAfter: true,
        },
      },
      {
        index: 1,
        step: {
          type: "runTest" as const,
          targets: [sandboxRel],
        },
        ok: true,
        command: {
          command: "node",
          args: ["--test", sandboxRel],
          exitCode: 0,
          stdout: "ok",
          stderr: "",
          durationMs: 1,
        },
      },
    ],
    commandExitCodes: [0],
    writtenPaths: [sandboxRel],
    evidencePath: evidenceRel,
    evidenceExistsOnDisk: true,
    allStepsOk: true,
  };

  const v = verifyIndependently({
    observation,
    workspaceRoot,
    requireEvidenceOnDisk: true,
  });
  assert.equal(v.trustsCallerFacts, false);
  assert.equal(v.recommendation, "PASS", JSON.stringify(v.checks));
});

test("autonomous cycle: dry-run then apply end-to-end", async () => {
  const sandboxFile = join(
    workspaceRoot,
    "tools/eng-agent/fixtures/AE-FIX-01/sandbox/generated.test.js",
  );
  const evidenceFile = join(
    workspaceRoot,
    "docs/eng-agent/fixtures/AE-FIX-01-evidence.json",
  );
  if (existsSync(sandboxFile)) rmSync(sandboxFile);
  if (existsSync(evidenceFile)) rmSync(evidenceFile);

  const dry = await runAutonomousCycle({
    pkg: samplePkg(),
    gate: { ok: true },
    plan: fixturePlan(),
    mode: "dry-run",
    workspaceRoot,
    currentStatus: "READY_FOR_EXECUTION",
  });
  assert.equal(dry.recommendation, "PASS", dry.error);
  assert.equal(existsSync(sandboxFile), false, "dry-run must not write");

  const apply = await runAutonomousCycle({
    pkg: samplePkg(),
    gate: { ok: true },
    plan: fixturePlan(),
    mode: "apply",
    workspaceRoot,
    currentStatus: "READY_FOR_EXECUTION",
  });
  assert.equal(apply.recommendation, "PASS", apply.error);
  assert.equal(existsSync(sandboxFile), true);
  assert.equal(existsSync(evidenceFile), true);
  assert.equal(apply.verifier?.trustsCallerFacts, false);
  const evidence = JSON.parse(readFileSync(evidenceFile, "utf8"));
  assert.equal(evidence.trustsCallerFacts, false);
  assert.equal(evidence.recommendation, "PASS");
});
