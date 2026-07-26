import { test } from "node:test";
import assert from "node:assert/strict";
import { adaptExecutionPackage } from "../src/adapter/adapt.ts";
import { samplePackage } from "./fixtures.ts";

test("adapter: gate pass preserves all package fields (TR-2)", () => {
  const pkg = samplePackage();
  const result = adaptExecutionPackage(pkg, { ok: true });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.adapted.taskId, pkg.taskId);
  assert.equal(result.adapted.allowedScope, pkg.allowedScope);
  assert.equal(result.adapted.forbiddenScope, pkg.forbiddenScope);
  assert.equal(result.adapted.objective, pkg.objective);
  assert.deepEqual(result.adapted.sourcePackage, {
    ...pkg,
    dependencies: [...pkg.dependencies],
  });
});

test("adapter: gate fail refuses (no invented scope)", () => {
  const result = adaptExecutionPackage(samplePackage(), {
    ok: false,
    reason: "missing AC",
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /gate failed/);
});

test("adapter: missing required field fails", () => {
  const result = adaptExecutionPackage(samplePackage({ taskId: "" }), {
    ok: true,
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /taskId/);
});

test("adapter: does not invent allowedScope", () => {
  const pkg = samplePackage({ allowedScope: "tools/eng-agent/" });
  const result = adaptExecutionPackage(pkg, { ok: true });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.adapted.allowedScope, "tools/eng-agent/");
  assert.notEqual(result.adapted.allowedScope, "runtime/");
});
