/**
 * P2-02 — Task Registry parser tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parseTaskRegistryFile,
  parseTaskRegistryMarkdown,
} from "../src/parse/registry.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const registry002Live = join(
  repoRoot,
  "tasks/TASK-REGISTRY-DEV-ORCH-002.md",
);
const registry001Live = join(
  repoRoot,
  "tasks/TASK-REGISTRY-DEV-ORCH-001.md",
);
const fixtures = join(here, "fixtures");
const registry002Snapshot = join(
  fixtures,
  "TASK-REGISTRY-DEV-ORCH-002.snapshot.md",
);

test("parser: parse TASK-REGISTRY-DEV-ORCH-002.md fixture", () => {
  const result = parseTaskRegistryFile(registry002Snapshot);
  assert.equal(result.ok, true, result.ok ? "" : result.error);
  if (!result.ok) return;

  assert.equal(result.registry.registryId, "TASK-REGISTRY-DEV-ORCH-002");
  assert.equal(result.registry.tasks.length, 10);
  assert.equal(result.registry.currentExecutableTask, "P2-02");
});

test("parser: extract P2-01 / P2-02 correctly and preserve status", () => {
  const result = parseTaskRegistryFile(registry002Snapshot);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const p201 = result.registry.tasks.find((t) => t.id === "P2-01");
  const p202 = result.registry.tasks.find((t) => t.id === "P2-02");
  assert.ok(p201, "P2-01 present");
  assert.ok(p202, "P2-02 present");

  assert.equal(p201!.title, "Package scaffold `tools/dev-orch/`");
  assert.equal(p201!.status, "DONE");
  assert.match(p201!.statusRaw, /DONE/);
  assert.deepEqual(p201!.dependencies, []);
  assert.ok(p201!.acceptanceCriteria.length > 0);
  assert.ok(p201!.testRequirement.length > 0);
  assert.ok(p201!.evidence.includes("P2-01-package-scaffold"));

  assert.equal(p202!.title, "Task Registry parser");
  assert.equal(p202!.status, "READY_FOR_EXECUTION");
  assert.deepEqual(p202!.dependencies, ["P2-01"]);
  assert.ok(p202!.acceptanceCriteria.length > 0);
  assert.ok(p202!.testRequirement.length > 0);
});

test("parser: live TASK-REGISTRY-DEV-ORCH-002.md still parses", () => {
  const result = parseTaskRegistryFile(registry002Live);
  assert.equal(result.ok, true, result.ok ? "" : result.error);
  if (!result.ok) return;
  assert.equal(result.registry.registryId, "TASK-REGISTRY-DEV-ORCH-002");
  assert.ok(result.registry.tasks.some((t) => t.id === "P2-01"));
  assert.ok(result.registry.tasks.some((t) => t.id === "P2-02"));
});

test("parser: also loads TASK-REGISTRY-DEV-ORCH-001 without field loss", () => {
  const result = parseTaskRegistryFile(registry001Live);
  assert.equal(result.ok, true, result.ok ? "" : result.error);
  if (!result.ok) return;

  assert.equal(result.registry.registryId, "TASK-REGISTRY-DEV-ORCH-001");
  assert.equal(result.registry.tasks.length, 6);
  const tO1 = result.registry.tasks.find((t) => t.id === "T-O1");
  assert.ok(tO1);
  assert.equal(tO1!.status, "DONE");
  assert.deepEqual(tO1!.dependencies, []);
  assert.ok(tO1!.evidence.length > 0);
});

test("parser: missing required fields must fail closed", () => {
  const markdown = readFileSync(
    join(fixtures, "missing-required-fields.md"),
    "utf8",
  );
  const result = parseTaskRegistryMarkdown(markdown);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /missing required field/i);
});

test("parser: invalid registry format must return error", () => {
  const markdown = readFileSync(
    join(fixtures, "invalid-format.md"),
    "utf8",
  );
  const result = parseTaskRegistryMarkdown(markdown);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /invalid registry format/i);
});

test("parser: empty document fails closed", () => {
  const result = parseTaskRegistryMarkdown("   ");
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /empty/i);
});
