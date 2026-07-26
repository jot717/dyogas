import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = join(root, "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

test("boundary: only kernel + trust + relative/node", () => {
  const allowed = new Set(["@dyogas/kernel", "@dyogas/trust"]);
  for (const file of walk(src)) {
    const text = readFileSync(file, "utf8");
    assert.equal(/harness|pipelines|contracts\/agents/.test(text) && /from ['"]/.test(text) && /from ['"][^'"]*(harness|pipelines|contracts)/.test(text), false,
      `forbidden import path in ${relative(root, file)}`);
    for (const m of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const spec = m[1]!;
      if (spec.startsWith(".") || spec.startsWith("node:")) continue;
      assert.ok(allowed.has(spec), `unexpected ${spec} in ${relative(root, file)}`);
    }
  }
});
