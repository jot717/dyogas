import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const kernelRoot = fileURLToPath(new URL("..", import.meta.url));
const srcRoot = join(kernelRoot, "src");

const FORBIDDEN = [
  /from\s+['"][^'"]*harness[^'"]*['"]/,
  /from\s+['"][^'"]*pipelines[^'"]*['"]/,
  /from\s+['"][^'"]*contracts[^'"]*['"]/,
  /require\s*\(\s*['"][^'"]*harness[^'"]*['"]/,
  /require\s*\(\s*['"][^'"]*pipelines[^'"]*['"]/,
  /require\s*\(\s*['"][^'"]*contracts[^'"]*['"]/,
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

test("package boundary: kernel src must not import harness/pipelines/contracts", () => {
  const files = walk(srcRoot);
  assert.ok(files.length > 0);
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const re of FORBIDDEN) {
      assert.equal(
        re.test(text),
        false,
        `forbidden import in ${relative(kernelRoot, file)}: ${re}`,
      );
    }
  }
});
