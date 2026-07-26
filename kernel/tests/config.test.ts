import { test } from "node:test";
import assert from "node:assert/strict";
import { ConfigError, loadConfig } from "../src/index.js";

test("fail-closed on missing required key", () => {
  const cfg = loadConfig({});
  assert.throws(() => cfg.requireString("DYOGAS_REQUIRED"), ConfigError);
});

test("typed getter + unknown keys ignored", () => {
  const cfg = loadConfig({ FOO: "bar", EXTRA: "x" } as NodeJS.ProcessEnv);
  assert.equal(cfg.getString("FOO"), "bar");
  assert.equal(cfg.getString("MISSING"), undefined);
});

test("secrets redacted in dump", () => {
  const cfg = loadConfig({
    PUBLIC: "ok",
    API_KEY: "super-secret-value",
    db_password: "hunter2",
  } as NodeJS.ProcessEnv);
  const dump = cfg.dumpRedacted();
  const text = JSON.stringify(dump);
  assert.equal(dump.PUBLIC, "ok");
  assert.equal(dump.API_KEY, "[REDACTED]");
  assert.equal(dump.db_password, "[REDACTED]");
  assert.ok(!text.includes("super-secret-value"));
  assert.ok(!text.includes("hunter2"));
});
