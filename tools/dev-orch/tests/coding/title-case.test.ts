/**
 * Coding-task verification for toTitleCase.
 * Not part of the default suite path used by declarative fixtures.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { toTitleCase } from "../../src/util/title-case.ts";

test("toTitleCase: basic words", () => {
  assert.equal(toTitleCase("hello world"), "Hello World");
});

test("toTitleCase: trims and collapses space", () => {
  assert.equal(toTitleCase("  dyogas   harness "), "Dyogas Harness");
});

test("toTitleCase: empty", () => {
  assert.equal(toTitleCase(""), "");
});
