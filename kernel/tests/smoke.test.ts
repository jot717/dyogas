import { test } from "node:test";
import assert from "node:assert/strict";
import { generateId } from "../src/index.js";

test("smoke: kernel package loads and generates an id", () => {
  const id = generateId();
  assert.equal(typeof id, "string");
  assert.ok(id.length >= 16);
});
