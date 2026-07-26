/**
 * P2-08 — CLI dry-run / apply tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "../src/cli/args.ts";
import { dispatchCli, type CliIo } from "../src/cli/commands.ts";

const fixtureRegistry = `# TASK REGISTRY

**Registry ID:** TASK-REGISTRY-CLI-FIXTURE  
**Current executable task:** **C-1**

---

### C-1 — First ready

| Field | Content |
|-------|---------|
| **Task ID** | C-1 |
| **Objective** | Be selected by planner |
| **Dependencies** | None |
| **Acceptance Criteria** | selected |
| **Test Requirement** | cli tests |
| **Expected output** | docs/dev-orch/C-1-evidence.md |
| **Status** | **READY_FOR_EXECUTION** |

---

### C-2 — Waiting

| Field | Content |
|-------|---------|
| **Task ID** | C-2 |
| **Objective** | Wait |
| **Dependencies** | C-1 |
| **Acceptance Criteria** | later |
| **Test Requirement** | later |
| **Status** | **PENDING** |
`;

function memoryIo(initial: Record<string, string>): CliIo & {
  writes: string[];
  files: Record<string, string>;
} {
  const files = { ...initial };
  const writes: string[] = [];
  return {
    files,
    writes,
    readFile: (p) => {
      if (!(p in files)) throw new Error(`ENOENT ${p}`);
      return files[p]!;
    },
    writeFile: (p, c) => {
      writes.push(p);
      files[p] = c;
    },
    exists: (p) => p in files,
  };
}

test("cli: status", async () => {
  const io = memoryIo({ "tasks/REG.md": fixtureRegistry });
  const result = await dispatchCli(
    parseArgs(["status", "--registry", "tasks/REG.md"]),
    io,
  );
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /TASK-REGISTRY-CLI-FIXTURE/);
  assert.match(result.stdout, /C-1 \[READY_FOR_EXECUTION\]/);
  assert.deepEqual(result.writtenPaths, []);
  assert.equal(io.writes.length, 0);
});

test("cli: plan selects READY task", async () => {
  const io = memoryIo({ "tasks/REG.md": fixtureRegistry });
  const result = await dispatchCli(
    parseArgs(["plan", "--registry", "tasks/REG.md"]),
    io,
  );
  assert.equal(result.exitCode, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.ok, true);
  assert.equal(body.taskId, "C-1");
  assert.equal(body.filesystemMutation, false);
  assert.equal(io.writes.length, 0);
});

test("cli: dry-run produces no writes", async () => {
  const io = memoryIo({ "tasks/REG.md": fixtureRegistry });
  const before = io.files["tasks/REG.md"];
  const result = await dispatchCli(
    parseArgs(["run", "--registry", "tasks/REG.md", "--dry-run"]),
    io,
  );
  assert.equal(result.exitCode, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.mode, "dry-run");
  assert.equal(body.filesystemMutation, false);
  assert.deepEqual(body.writtenPaths, []);
  assert.equal(io.writes.length, 0);
  assert.equal(io.files["tasks/REG.md"], before);
  assert.equal(body.planner.taskId, "C-1");
});

test("cli: apply uses writer only", async () => {
  const io = memoryIo({ "tasks/REG.md": fixtureRegistry });
  const result = await dispatchCli(
    parseArgs([
      "run",
      "--registry",
      "tasks/REG.md",
      "--apply",
      "--to",
      "IN_PROGRESS",
    ]),
    io,
  );
  assert.equal(result.exitCode, 0, result.stderr);
  const body = JSON.parse(result.stdout);
  assert.equal(body.mode, "apply");
  assert.equal(body.via, "applyRegistryUpdate");
  assert.equal(body.to, "IN_PROGRESS");
  assert.deepEqual(result.writtenPaths, ["tasks/REG.md"]);
  assert.equal(io.writes.length, 1);
  assert.match(io.files["tasks/REG.md"]!, /IN_PROGRESS/);
});

test("cli: forbidden paths rejected", async () => {
  const io = memoryIo({
    "tasks/REG.md": fixtureRegistry,
    "runtime/src/x.ts": "nope",
  });
  const result = await dispatchCli(
    parseArgs([
      "run",
      "--registry",
      "tasks/REG.md",
      "--apply",
      "--write-path",
      "runtime/src/x.ts",
    ]),
    io,
  );
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /forbidden write path/i);
  assert.equal(io.writes.length, 0);
});

test("cli: run without flags defaults to dry-run", async () => {
  const io = memoryIo({ "tasks/REG.md": fixtureRegistry });
  const result = await dispatchCli(
    parseArgs(["run", "--registry", "tasks/REG.md"]),
    io,
  );
  assert.equal(result.exitCode, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.mode, "dry-run");
  assert.equal(io.writes.length, 0);
});

test("cli: DONE apply does not invent verifier PASS", async () => {
  const io = memoryIo({
    "tasks/REG.md": fixtureRegistry.replace(
      "**READY_FOR_EXECUTION**",
      "**IN_PROGRESS**",
    ),
    "docs/dev-orch/C-1-evidence.md": "# evidence",
  });
  const result = await dispatchCli(
    parseArgs([
      "run",
      "--registry",
      "tasks/REG.md",
      "--apply",
      "--task",
      "C-1",
      "--to",
      "DONE",
      "--evidence",
      "docs/dev-orch/C-1-evidence.md",
    ]),
    io,
  );
  assert.equal(result.exitCode, 1);
  assert.match(result.stderr, /does not invent PASS/i);
  assert.equal(io.writes.length, 0);
});
