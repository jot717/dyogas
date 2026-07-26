import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as trust from "../src/index.js";

const trustRoot = fileURLToPath(new URL("..", import.meta.url));
const srcRoot = join(trustRoot, "src");

const FORBIDDEN = [
  /from\s+['"][^'"]*harness[^'"]*['"]/,
  /from\s+['"][^'"]*pipelines[^'"]*['"]/,
  /from\s+['"][^'"]*contracts[^'"]*['"]/,
  /from\s+['"][^'"]*runtime[^'"]*['"]/,
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

test("boundary: only kernel + relative imports", () => {
  for (const file of walk(srcRoot)) {
    const text = readFileSync(file, "utf8");
    for (const re of FORBIDDEN) {
      assert.equal(re.test(text), false, `forbidden in ${relative(trustRoot, file)}`);
    }
    const imports = [...text.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]!);
    for (const spec of imports) {
      if (spec.startsWith(".") || spec.startsWith("node:")) continue;
      assert.equal(
        spec === "@dyogas/kernel",
        true,
        `unexpected dependency ${spec} in ${relative(trustRoot, file)}`,
      );
    }
  }
});

test("no network/egress client in public API names", () => {
  for (const key of Object.keys(trust)) {
    const lower = key.toLowerCase();
    assert.equal(lower.includes("fetch"), false);
    assert.equal(lower.includes("axios"), false);
    assert.equal(lower.includes("httpclient"), false);
  }
});
