import { test } from "node:test";
import assert from "node:assert/strict";
import { getPackageIdentity, PACKAGE_ID } from "../src/index.ts";

test("scaffold: package identity is engineering tool, not a Platform Module", () => {
  const id = getPackageIdentity();
  assert.equal(id.id, PACKAGE_ID);
  assert.equal(id.layer, "development-harness");
  assert.equal(id.platformModule, false);
});
