import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  generateId,
  generateCorrelationId,
  setEntropy,
  resetEntropy,
} from "../src/index.js";

afterEach(() => {
  resetEntropy();
});

test("10k ids unique in process", () => {
  const set = new Set<string>();
  for (let i = 0; i < 10_000; i++) {
    set.add(generateId());
  }
  assert.equal(set.size, 10_000);
});

test("injectable entropy seam", () => {
  let n = 0;
  setEntropy({
    bytes(size: number) {
      const out = new Uint8Array(size);
      out.fill(n++ % 256);
      return out;
    },
  });
  const a = generateId(8);
  const b = generateId(8);
  assert.notEqual(a, b);
});

test("opaque: no email-shaped / @ / raw tenant prefix", () => {
  const id = generateId();
  assert.ok(!id.includes("@"));
  assert.ok(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id));
  assert.ok(!id.startsWith("tenant-"));
});

test("correlation id opaque", () => {
  const c = generateCorrelationId();
  assert.equal(typeof c, "string");
  assert.ok(c.length >= 16);
});
