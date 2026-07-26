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

test("boundary: platform packages only", () => {
  for (const file of walk(src)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const spec = m[1]!;
      if (spec.startsWith(".") || spec.startsWith("node:")) continue;
      assert.ok(allowed.has(spec), `${spec} in ${relative(root, file)}`);
    }
  }
});
