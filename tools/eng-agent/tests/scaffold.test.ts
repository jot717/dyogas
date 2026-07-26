import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getPackageIdentity, PACKAGE_ID } from "../src/index.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("scaffold: package identity is engineering tool, not Platform Module / Hosted", () => {
  const id = getPackageIdentity();
  assert.equal(id.id, PACKAGE_ID);
  assert.equal(id.id, "@dyogas/eng-agent");
  assert.equal(id.layer, "development-harness");
  assert.equal(id.platformModule, false);
  assert.equal(id.hostedEngAgents, false);
});

test("scaffold: package.json has zero forbidden dependencies", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const deps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  };
  const forbidden = [
    "@dyogas/runtime",
    "@dyogas/agent-sdk",
    "@dyogas/execution-host",
    "@dyogas/research-engine",
  ];
  for (const f of forbidden) {
    assert.equal(deps[f], undefined, `must not depend on ${f}`);
  }
  assert.equal(pkg.private, true);
  assert.match(pkg.engines.node, /22/);
});
