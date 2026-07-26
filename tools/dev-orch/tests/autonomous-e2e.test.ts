/**
 * End-to-end: dev-orch autonomous run against AE-FIX-01 fixture.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  rmSync,
  readFileSync,
  writeFileSync,
  mkdtempSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { parseArgs } from "../src/cli/args.ts";
import { runAutonomous, resolveWorkspaceRoot } from "../src/cli/autonomous.ts";
import { defaultIo } from "../src/cli/commands.ts";

const here = dirname(fileURLToPath(import.meta.url));
// tests/ → package → tools → repo
const repoRoot = resolve(here, "../../..");

test("e2e harness: autonomous dry-run then apply on fixture", async () => {
  const workspaceRoot = resolveWorkspaceRoot(join(repoRoot, "tools/dev-orch"));
  assert.ok(workspaceRoot.replace(/\\/g, "/").endsWith("dyogas") || existsSync(join(workspaceRoot, "tools/eng-agent")));

  const registryRel =
    "tools/eng-agent/fixtures/AE-FIX-01/TASK-REGISTRY.md";
  const registryAbs = join(workspaceRoot, registryRel);
  const sandbox = join(
    workspaceRoot,
    "tools/eng-agent/fixtures/AE-FIX-01/sandbox/generated.test.js",
  );
  const evidence = join(
    workspaceRoot,
    "docs/eng-agent/fixtures/AE-FIX-01-evidence.json",
  );

  // Reset fixture registry to READY
  const original = readFileSync(registryAbs, "utf8");
  const ready = original
    .replace(/\*\*DONE\*\*/g, "**READY_FOR_EXECUTION**")
    .replace(/\*\*IN_PROGRESS\*\*/g, "**READY_FOR_EXECUTION**")
    .replace(/\*\*BLOCKED\*\*/g, "**READY_FOR_EXECUTION**");
  writeFileSync(registryAbs, ready, "utf8");
  if (existsSync(sandbox)) rmSync(sandbox);
  if (existsSync(evidence)) rmSync(evidence);

  const prev = process.cwd();
  process.chdir(join(workspaceRoot, "tools/dev-orch"));
  try {
    const dry = await runAutonomous(
      parseArgs([
        "run",
        "--registry",
        registryRel,
        "--dry-run",
        "--autonomous",
      ]),
      defaultIo,
    );
    assert.equal(dry.exitCode, 0, dry.stderr + dry.stdout);
    const dryBody = JSON.parse(dry.stdout);
    assert.equal(dryBody.recommendation, "PASS");
    assert.equal(dryBody.trustsCallerFacts, false);
    assert.equal(existsSync(sandbox), false);

    const apply = await runAutonomous(
      parseArgs([
        "run",
        "--registry",
        registryRel,
        "--apply",
        "--autonomous",
      ]),
      defaultIo,
    );
    assert.equal(apply.exitCode, 0, apply.stderr + apply.stdout);
    const body = JSON.parse(apply.stdout);
    assert.equal(body.recommendation, "PASS");
    assert.equal(body.verifier.trustsCallerFacts, false);
    assert.deepEqual(body.observation.commandExitCodes, [0]);
    assert.equal(existsSync(sandbox), true);
    assert.equal(existsSync(evidence), true);

    const regAfter = readFileSync(registryAbs, "utf8");
    assert.match(regAfter, /DONE/);
  } finally {
    process.chdir(prev);
    // restore READY for repeatability
    writeFileSync(registryAbs, ready, "utf8");
  }
});
