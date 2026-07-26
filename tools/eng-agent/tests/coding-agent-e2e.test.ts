/**
 * Real Coding Agent e2e — requires CURSOR_API_KEY and @cursor/sdk.
 *
 * PASS requires live Agent.prompt that modifies title-case.ts and makes
 * tools/dev-orch coding tests pass. No mock invoker in this file.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveApiKey,
  runCodingCycle,
  type ExecutionPackageView,
} from "../src/index.ts";

const here = dirname(fileURLToPath(import.meta.url));
const engRoot = resolve(here, "..");
const workspaceRoot = resolve(engRoot, "../..");
const utilRel = "tools/dev-orch/src/util/title-case.ts";
const utilAbs = join(workspaceRoot, utilRel);
const evidenceRel = "docs/eng-agent/fixtures/CA-TITLE-evidence.json";
const evidenceAbs = join(workspaceRoot, evidenceRel);

const STUB = `/**
 * Title-case utility — coding-agent target for SPRINT-ENG-AGENT-CODING-ADAPTER-001.
 *
 * INTENTIONALLY incomplete: Coding Agent must implement real title-case behavior.
 */
export function toTitleCase(input: string): string {
  throw new Error("not implemented — Coding Agent must implement toTitleCase");
}
`;

function pkg(): ExecutionPackageView {
  return {
    taskId: "CA-TITLE",
    title: "Implement toTitleCase utility and pass coding tests",
    objective:
      "Modify tools/dev-orch/src/util/title-case.ts so toTitleCase works correctly. Do not modify the test file unless necessary. Implement: trim, collapse whitespace, capitalize each word; empty string returns empty string.",
    dependencies: [],
    acceptanceCriteria:
      'toTitleCase("hello world") === "Hello World"; empty → ""; coding tests pass',
    testRequirements:
      "node --import tsx --test tests/coding/title-case.test.ts (cwd: tools/dev-orch)",
    allowedScope:
      "tools/dev-orch/src/util/; tools/dev-orch/tests/coding/; docs/eng-agent/",
    forbiddenScope:
      "Runtime; Agent SDK; Execution Host; Product modules; tools/eng-agent/src (except via harness)",
    expectedEvidence: evidenceRel,
    executionMode: "Implementation Mode",
    sprintId: "SPRINT-ENG-AGENT-CODING-ADAPTER-001",
    ssotReferences: "DL-ENG-AGENT-CODING-ADAPTER-001",
    gapRegistry: "none",
    statusTransition: "READY_FOR_EXECUTION → IN_PROGRESS → DONE | BLOCKED",
  };
}

test("coding-agent e2e: dry-run delivers instruction without mutation", async () => {
  writeFileSync(utilAbs, STUB, "utf8");
  const before = readFileSync(utilAbs, "utf8");
  const cycle = await runCodingCycle({
    pkg: pkg(),
    targetFiles: [utilRel],
    allowedPaths: [
      "tools/dev-orch/src/util/",
      "tools/dev-orch/tests/coding/",
      "docs/eng-agent/",
    ],
    verifyCommand: {
      command: "node",
      args: ["--import", "tsx", "--test", "tests/coding/title-case.test.ts"],
      cwd: "tools/dev-orch",
    },
    evidencePath: evidenceRel,
    workspaceRoot,
    mode: "dry-run",
  });
  assert.equal(cycle.recommendation, "PASS", cycle.error);
  assert.equal(cycle.instruction?.prompt.includes("CA-TITLE"), true);
  assert.equal(readFileSync(utilAbs, "utf8"), before);
});

test("coding-agent e2e: live Cursor Agent modifies source and passes verify", async (t) => {
  const key = resolveApiKey(undefined, workspaceRoot);
  if (!key) {
    t.skip(
      "CURSOR_API_KEY not set (env or .env.local) — cannot demonstrate live Cursor Agent (sprint remains incomplete)",
    );
    return;
  }

  writeFileSync(utilAbs, STUB, "utf8");
  if (existsSync(evidenceAbs)) rmSync(evidenceAbs);

  const beforeHash = readFileSync(utilAbs, "utf8");

  const cycle = await runCodingCycle({
    pkg: pkg(),
    targetFiles: [utilRel],
    allowedPaths: [
      "tools/dev-orch/src/util/",
      "tools/dev-orch/tests/coding/",
      "docs/eng-agent/",
    ],
    verifyCommand: {
      command: "node",
      args: ["--import", "tsx", "--test", "tests/coding/title-case.test.ts"],
      cwd: "tools/dev-orch",
    },
    evidencePath: evidenceRel,
    workspaceRoot,
    mode: "apply",
    apiKey: key,
  });

  assert.equal(cycle.ok, true, cycle.error ?? JSON.stringify(cycle.verifier));
  assert.equal(cycle.recommendation, "PASS");
  assert.equal(cycle.observation?.instructionDelivered, true);
  assert.ok(
    (cycle.observation?.changedFiles.length ?? 0) > 0,
    "expected source file changes",
  );
  assert.ok(
    cycle.observation?.changedFiles.some((f) => f.includes("title-case")),
    `changedFiles=${JSON.stringify(cycle.observation?.changedFiles)}`,
  );
  assert.notEqual(readFileSync(utilAbs, "utf8"), beforeHash);
  assert.equal(cycle.observation?.verifyCommand?.exitCode, 0);
  assert.equal(existsSync(evidenceAbs), true);
  assert.equal(cycle.verifier?.trustsCallerFacts, false);
  assert.equal(cycle.evidence?.integration, "cursor-sdk-agent-prompt");
});
