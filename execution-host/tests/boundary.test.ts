/**
 * SPRINT-EXECUTION-HOST-001 — dependency boundary (Phase 2).
 * SPRINT-HOST-RESEARCH-INTEGRATION-001 — allow research-engine public entry.
 * Allowed: kernel, trust, runtime, agent-sdk, research-engine, relative, node:.
 * Forbidden: deep imports into runtime/sdk internals; harness paths.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = join(root, "src");
const allowed = new Set([
  "@dyogas/kernel",
  "@dyogas/trust",
  "@dyogas/runtime",
  "@dyogas/agent-sdk",
  "@dyogas/research-engine",
]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

test("boundary: Host src only imports allowed packages", () => {
  for (const file of walk(src)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const spec = m[1]!;
      if (spec.startsWith(".") || spec.startsWith("node:")) continue;
      assert.ok(
        allowed.has(spec),
        `unexpected ${spec} in ${relative(root, file)}`,
      );
      assert.equal(
        spec.includes("/src/") || spec.endsWith(".js") && spec.startsWith("@dyogas/") && spec.split("/").length > 2,
        false,
      );
    }
  }
});

test("boundary: adapters may import Runtime/SDK public entry only", () => {
  const runtimeAdapter = readFileSync(join(src, "adapters/runtime.ts"), "utf8");
  const sdkAdapter = readFileSync(join(src, "adapters/sdk.ts"), "utf8");
  assert.match(runtimeAdapter, /from ["']@dyogas\/runtime["']/);
  assert.match(sdkAdapter, /from ["']@dyogas\/agent-sdk["']/);
  assert.equal(/from ["']\.\.\/\.\.\/runtime/.test(runtimeAdapter), false);
  assert.equal(/from ["']\.\.\/\.\.\/sdk/.test(sdkAdapter), false);
});
