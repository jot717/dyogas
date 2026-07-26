/**
 * P2-09 — boundary + filesystem write safety for Development Orchestrator.
 *
 * Forbidden imports: @dyogas/runtime, agent-sdk, execution-host, research-engine,
 * and any other @dyogas/* / product modules.
 *
 * Forbidden writes: runtime/src, sdk/src, execution-host/src, products, product src.
 * Allowed writes: tasks/, docs/dev-orch/, sprints/, and any .../stage/... evidence path.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isForbiddenWritePath,
  isWriteAllowed,
} from "../src/writer/allowlist.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = join(root, "src");

const FORBIDDEN_PACKAGES = [
  "@dyogas/runtime",
  "@dyogas/agent-sdk",
  "@dyogas/execution-host",
  "@dyogas/research-engine",
  "@dyogas/kernel",
  "@dyogas/trust",
  "@dyogas/knowledge",
  "@dyogas/graph",
  "@dyogas/personal-brain",
] as const;

const PRODUCT_PATH_IMPORTS = [
  "personal-brain/",
  "research/",
  "knowledge/",
  "graph/",
  "web-ui/",
  "execution-host/",
  "runtime/",
  "sdk/",
] as const;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      out.push(...walk(p));
    } else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

test("boundary: src must not import forbidden platform packages", () => {
  const files = walk(src);
  assert.ok(files.length > 0, "src must contain at least one .ts file");

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const spec = m[1]!;
      if (spec.startsWith(".") || spec.startsWith("node:")) continue;
      assert.equal(
        FORBIDDEN_PACKAGES.some((f) => spec === f || spec.startsWith(`${f}/`)),
        false,
        `forbidden import ${spec} in ${relative(root, file)}`,
      );
      assert.equal(
        spec.startsWith("@dyogas/"),
        false,
        `unexpected @dyogas/* import ${spec} in ${relative(root, file)}`,
      );
      assert.equal(
        PRODUCT_PATH_IMPORTS.some(
          (p) => spec === p.slice(0, -1) || spec.startsWith(p) || spec.includes(`/${p}`),
        ),
        false,
        `product/platform path import ${spec} in ${relative(root, file)}`,
      );
    }
  }
});

test("boundary: package.json has zero forbidden dependencies", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const all = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  };
  /** Build-side sibling tooling allowed; platform packages forbidden. */
  const ALLOWED_DYOGAS = new Set(["@dyogas/eng-agent"]);
  for (const name of Object.keys(all)) {
    assert.equal(
      FORBIDDEN_PACKAGES.some((f) => name === f || name.startsWith(`${f}/`)),
      false,
      `forbidden dependency ${name}`,
    );
    if (name.startsWith("@dyogas/")) {
      assert.equal(
        ALLOWED_DYOGAS.has(name),
        true,
        `unexpected @dyogas/* dependency ${name}`,
      );
    }
  }
});

test("boundary: forbidden filesystem write roots rejected", () => {
  const forbidden = [
    "runtime/src/index.ts",
    "sdk/src/index.ts",
    "execution-host/src/host.ts",
    "products/anything.ts",
    "personal-brain/src/index.ts",
    "research/src/execute.ts",
  ];
  for (const p of forbidden) {
    assert.equal(isForbiddenWritePath(p), true, p);
    assert.equal(isWriteAllowed(p), false, p);
  }
});

test("boundary: allowed filesystem write roots accepted", () => {
  const allowed = [
    "tasks/TASK-REGISTRY-DEV-ORCH-002.md",
    "docs/dev-orch/P2-09-ci-boundary.md",
    "sprints/SPRINT-DEV-ORCH-002.md",
    "execution-host/stage/H06-exit.md",
    "personal-brain/stage/bridge/C1.md",
    "docs/dev-orch/execution-packages/PREPARED.md",
  ];
  for (const p of allowed) {
    assert.equal(isWriteAllowed(p), true, p);
  }
});

test("boundary: GAP registry writes still refused", () => {
  assert.equal(isWriteAllowed("docs/dev-orch/GAP-REGISTRY-X.md"), false);
  assert.equal(
    isWriteAllowed("personal-brain/stage/bridge/GAP-REGISTRY-PB.md"),
    false,
  );
});
