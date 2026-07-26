import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { FixedClock, getClock, resetClock, setClock, SystemClock } from "../src/index.js";

afterEach(() => {
  resetClock();
});

test("system clock returns UTC ISO", () => {
  const iso = new SystemClock().nowIso();
  assert.ok(iso.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(iso));
  assert.ok(!Number.isNaN(Date.parse(iso)));
});

test("fixed clock deterministic", () => {
  const fixed = new FixedClock(1_700_000_000_000);
  setClock(fixed);
  assert.equal(getClock().nowMs(), 1_700_000_000_000);
  assert.equal(getClock().nowIso(), new Date(1_700_000_000_000).toISOString());
});
