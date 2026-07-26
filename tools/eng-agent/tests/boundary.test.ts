import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isForbiddenWritePath,
  isWriteAllowed,
} from "../src/evidence/allowlist.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const FORBIDDEN_PACKAGES = [
  "@dyogas/runtime",
  "@dyogas/agent-sdk",
  "@dyogas/execution-host",
  "@dyogas/research-engine",
  "@dyogas/kernel",
  "@dyogas/knowledge",
  "@dyogas/graph",
];

const PRODUCT_PATH_IMPORTS = [
  "runtime/",
  "sdk/",
  "execution-host/",
  "personal-brain/",
  "research/",
  "knowledge/",
  "graph/",
];

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      out.push(...walkTs(p));
    } else if (name.endsWith(".ts")) {
      out.push(p);
    }
  }
  return out;
}

test("boundary: no forbidden package imports in src", () => {
  const files = walkTs(join(root, "src"));
  assert.ok(files.length > 0);
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    for (const pkg of FORBIDDEN_PACKAGES) {
      assert.equal(
        text.includes(`from "${pkg}`) || text.includes(`from '${pkg}`),
        false,
        `${relative(root, f)} must not import ${pkg}`,
      );
    }
    for (const path of PRODUCT_PATH_IMPORTS) {
      const re = new RegExp(
        `from ['"](\\.\\./)*${path.replace("/", "\\/")}`,
      );
      assert.equal(
        re.test(text),
        false,
        `${relative(root, f)} must not import product path ${path}`,
      );
    }
  }
});

test("boundary: forbidden filesystem write roots rejected", () => {
  for (const p of [
    "runtime/src/index.ts",
    "sdk/src/index.ts",
    "execution-host/src/host.ts",
    "personal-brain/src/index.ts",
    "research/src/execute.ts",
  ]) {
    assert.equal(isForbiddenWritePath(p), true, p);
    assert.equal(isWriteAllowed(p), false, p);
  }
});

test("boundary: allowed filesystem write roots accepted", () => {
  for (const p of [
    "docs/eng-agent/EA-01-scaffold.md",
    "tasks/TASK-REGISTRY-ENG-AGENT-IMPLEMENTATION-001.md",
    "sprints/SPRINT-ENG-AGENT-IMPLEMENTATION-001.md",
    "tools/eng-agent/stage/note.md",
  ]) {
    assert.equal(isWriteAllowed(p), true, p);
  }
});

test("boundary: GAP registry writes refused", () => {
  assert.equal(
    isWriteAllowed("personal-brain/stage/bridge/GAP-REGISTRY-X.md"),
    false,
  );
});

test("boundary: package.json has no forbidden deps", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const all = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  };
  for (const f of FORBIDDEN_PACKAGES) {
    assert.equal(all[f], undefined, f);
  }
});
