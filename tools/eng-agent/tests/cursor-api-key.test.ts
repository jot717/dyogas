/**
 * Unit tests for CURSOR_API_KEY resolution (no live Cursor call).
 */
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  envLocalCandidates,
  resolveApiKey,
} from "../src/coding-agent/cursor-invoke.ts";

const ORIGINAL_KEY = process.env.CURSOR_API_KEY;
let tempRoots: string[] = [];

afterEach(() => {
  if (ORIGINAL_KEY === undefined) delete process.env.CURSOR_API_KEY;
  else process.env.CURSOR_API_KEY = ORIGINAL_KEY;
  for (const root of tempRoots) {
    try {
      rmSync(root, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
  tempRoots = [];
});

function makeWorkspace(): string {
  const root = mkdtempSync(join(tmpdir(), "eng-agent-apikey-"));
  tempRoots.push(root);
  mkdirSync(join(root, "tools", "eng-agent"), { recursive: true });
  return root;
}

test("resolveApiKey: explicit argument wins", () => {
  process.env.CURSOR_API_KEY = "env-should-not-win";
  const key = resolveApiKey("explicit-key-value", makeWorkspace());
  assert.equal(key, "explicit-key-value");
});

test("resolveApiKey: CURSOR_API_KEY env when no explicit", () => {
  process.env.CURSOR_API_KEY = "from-env-key";
  const key = resolveApiKey(undefined, makeWorkspace());
  assert.equal(key, "from-env-key");
});

test("resolveApiKey: tools/eng-agent/.env.local fallback", () => {
  delete process.env.CURSOR_API_KEY;
  const root = makeWorkspace();
  writeFileSync(
    join(root, "tools", "eng-agent", ".env.local"),
    "# local secret\nCURSOR_API_KEY=from-env-local\n",
    "utf8",
  );
  const key = resolveApiKey(undefined, root);
  assert.equal(key, "from-env-local");
});

test("resolveApiKey: workspace root .env.local fallback", () => {
  delete process.env.CURSOR_API_KEY;
  const root = makeWorkspace();
  writeFileSync(
    join(root, ".env.local"),
    "CURSOR_API_KEY=\"quoted-root-key\"\n",
    "utf8",
  );
  const key = resolveApiKey(undefined, root);
  assert.equal(key, "quoted-root-key");
});

test("resolveApiKey: eng-agent .env.local preferred over workspace root", () => {
  delete process.env.CURSOR_API_KEY;
  const root = makeWorkspace();
  writeFileSync(
    join(root, "tools", "eng-agent", ".env.local"),
    "CURSOR_API_KEY=nearest\n",
    "utf8",
  );
  writeFileSync(
    join(root, ".env.local"),
    "CURSOR_API_KEY=farther\n",
    "utf8",
  );
  const key = resolveApiKey(undefined, root);
  assert.equal(key, "nearest");
});

test("resolveApiKey: fail closed when unavailable", () => {
  delete process.env.CURSOR_API_KEY;
  const root = makeWorkspace();
  // Isolate from ambient tools/eng-agent/.env.local via process.cwd()
  const prevCwd = process.cwd();
  try {
    process.chdir(root);
    assert.equal(resolveApiKey(undefined, root), null);
  } finally {
    process.chdir(prevCwd);
  }
});

test("envLocalCandidates: includes eng-agent and workspace root", () => {
  const root = makeWorkspace();
  const candidates = envLocalCandidates(root);
  assert.ok(
    candidates.some((c) => c.replace(/\\/g, "/").endsWith("tools/eng-agent/.env.local")),
  );
  assert.ok(candidates.some((c) => c.replace(/\\/g, "/").endsWith("/.env.local")));
});
