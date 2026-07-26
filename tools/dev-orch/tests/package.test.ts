/**
 * P2-04 — Execution Package generator tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { RegistryTask } from "../src/types.ts";
import {
  emitExecutionPackage,
  emitExecutionPackageFromTask,
  executionPackageToJson,
  executionPackageToMarkdown,
} from "../src/package/emit.ts";
import {
  DEFAULT_FORBIDDEN_SCOPE,
  DEFAULT_EXECUTION_MODE,
} from "../src/package/types.ts";

const validInput = {
  taskId: "P2-04",
  title: "Execution Package generator",
  objective: "Emit Execution Package with Runbook §4.1 fields",
  dependencies: ["P2-03"] as const,
  acceptanceCriteria: "All required fields present; fail closed on missing",
  testRequirements: "Required-field completeness + deterministic output",
  allowedScope: "tools/dev-orch/src/package/; docs/dev-orch/P2-04-*.md",
  expectedEvidence: "docs/dev-orch/P2-04-execution-package.md",
  sprintId: "SPRINT-DEV-ORCH-002",
  ssotReferences:
    "SPEC-DEV-ORCH-001; DEV-ORCH-RUNBOOK §4; DL-DEV-ORCH-002; START_DEVELOPMENT",
  gapRegistry: "none (register new gaps OPEN under docs/dev-orch/ if discovered)",
};

test("package: generate package from valid task", () => {
  const result = emitExecutionPackage({ ...validInput });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.package.taskId, "P2-04");
  assert.equal(result.package.title, validInput.title);
  assert.equal(result.package.executionMode, DEFAULT_EXECUTION_MODE);
  assert.deepEqual([...result.package.dependencies], ["P2-03"]);
});

test("package: required fields exist", () => {
  const result = emitExecutionPackage({ ...validInput });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const pkg = result.package;
  const required = [
    "taskId",
    "title",
    "objective",
    "dependencies",
    "acceptanceCriteria",
    "testRequirements",
    "allowedScope",
    "forbiddenScope",
    "expectedEvidence",
    "executionMode",
    "sprintId",
    "ssotReferences",
    "gapRegistry",
    "statusTransition",
  ] as const;
  for (const key of required) {
    const value = pkg[key];
    if (key === "dependencies") {
      assert.ok(Array.isArray(value));
    } else {
      assert.equal(typeof value, "string");
      assert.ok((value as string).length > 0, `${key} must be non-empty`);
    }
  }
});

test("package: missing required field fails closed", () => {
  const result = emitExecutionPackage({
    ...validInput,
    objective: "   ",
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /missing required field 'objective'/);
});

test("package: forbidden scope is preserved", () => {
  const custom =
    "Runtime; SDK; Execution Host; custom-forbidden-path/**";
  const result = emitExecutionPackage({
    ...validInput,
    forbiddenScope: custom,
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.package.forbiddenScope, custom);
  assert.match(result.package.forbiddenScope, /Runtime/);
  assert.match(result.package.forbiddenScope, /custom-forbidden-path/);
});

test("package: default forbidden scope includes platform boundaries", () => {
  const result = emitExecutionPackage({ ...validInput });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.package.forbiddenScope, DEFAULT_FORBIDDEN_SCOPE);
});

test("package: output is deterministic", () => {
  const a = emitExecutionPackage({ ...validInput });
  const b = emitExecutionPackage({ ...validInput });
  assert.equal(a.ok && b.ok, true);
  if (!a.ok || !b.ok) return;
  assert.equal(executionPackageToJson(a.package), executionPackageToJson(b.package));
  assert.equal(
    executionPackageToMarkdown(a.package),
    executionPackageToMarkdown(b.package),
  );
});

test("package: from RegistryTask fail-closed without objective", () => {
  const task: RegistryTask = {
    id: "T-1",
    title: "No objective",
    statusRaw: "READY_FOR_EXECUTION",
    status: "READY_FOR_EXECUTION",
    dependencies: [],
    acceptanceCriteria: "ac",
    testRequirement: "test",
    evidence: "",
  };
  const result = emitExecutionPackageFromTask(task, {
    sprintId: "SPRINT-X",
    allowedScope: "docs/",
    ssotReferences: "SPEC-X",
    gapRegistry: "none",
    expectedEvidence: "docs/out.md",
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /objective/);
});

test("package: golden field parity vs PREPARED-PB-BRIDGE-T-C1 keys", () => {
  const result = emitExecutionPackage({
    taskId: "T-C1",
    title: "Bridge to pipeline stage map",
    objective:
      "Map Bridge narrative stages to `knowledge-ingestion` stages.",
    dependencies: [],
    acceptanceCriteria:
      "1:1 or documented merge/skip-with-reason; confirms no new topology.",
    testRequirements:
      "(Registry: implied doc conformance — map completeness)",
    allowedScope:
      "Create/update Bridge stage evidence under `personal-brain/stage/bridge/`; update PB Bridge Task Registry status for T-C1 only after Verifier PASS",
    forbiddenScope:
      "Runtime; SDK; Harness Spec; Execution Host implementation; new pipeline topology; new schemas/contracts; fixing GAPs by platform rewrite; executing later Band C/D/E/F tasks in same cycle",
    expectedEvidence:
      "personal-brain/stage/bridge/C1-bridge-to-pipeline-stage-map.md",
    sprintId: "SPRINT-PB-HARNESS-BRIDGE-001",
    ssotReferences:
      "SPEC-PROD-004-HARNESS-BRIDGE §5; `pipelines/knowledge-ingestion.md`; START_DEVELOPMENT; ADR-0010; B5 AVAILABLE verdict; GAP-REGISTRY-PB-HARNESS-BRIDGE-001",
    gapRegistry:
      "`personal-brain/stage/bridge/GAP-REGISTRY-PB-HARNESS-BRIDGE-001.md` — register any new gaps **OPEN**; do not close without evidence",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.package.taskId, "T-C1");
  assert.equal(result.package.sprintId, "SPRINT-PB-HARNESS-BRIDGE-001");
  assert.match(result.package.forbiddenScope, /Runtime/);
  assert.match(result.package.forbiddenScope, /Execution Host/);
  assert.equal(
    result.package.expectedEvidence,
    "personal-brain/stage/bridge/C1-bridge-to-pipeline-stage-map.md",
  );
});
