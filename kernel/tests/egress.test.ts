import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as kernel from "../src/index.js";

const kernelRoot = fileURLToPath(new URL("..", import.meta.url));

test("public API exposes no network/egress client", () => {
  const forbiddenNames = ["fetch", "http", "https", "net", "axios", "got", "request", "egress"];
  for (const key of Object.keys(kernel)) {
    const lower = key.toLowerCase();
    for (const bad of forbiddenNames) {
      assert.equal(lower.includes(bad), false, `public export looks like egress: ${key}`);
    }
  }
});

test("no secrets committed under kernel/ (heuristic scan)", () => {
  const secretPatterns = [
    /-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----/,
    /AKIA[0-9A-Z]{16}/,
    /ghp_[A-Za-z0-9]{36}/,
  ];
  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === "dist") continue;
      const p = join(dir, name);
      if (statSync(p).isDirectory()) out.push(...walk(p));
      else out.push(p);
    }
    return out;
  }
  for (const file of walk(kernelRoot)) {
    if (!/\.(ts|md|json|yml|yaml)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const re of secretPatterns) {
      assert.equal(re.test(text), false, `possible secret in ${file}`);
    }
  }
});
