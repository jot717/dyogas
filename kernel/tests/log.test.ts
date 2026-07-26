import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  attachLogFields,
  buildLogFields,
  clear,
  createTenantId,
  createTenancyContext,
  generateCorrelationId,
  LogFieldError,
  propagate,
} from "../src/index.js";

beforeEach(() => {
  clear();
});

test("standard fields include module, tenant, correlation", () => {
  const tid = createTenantId("t1");
  propagate(createTenancyContext(tid));
  const corr = generateCorrelationId();
  const f = buildLogFields({ correlationId: corr });
  assert.equal(f.module, "kernel");
  assert.equal(f.tenant_id, "t1");
  assert.equal(f.correlation_id, corr);
});

test("attachLogFields merges without vendor logger", () => {
  const out = attachLogFields({ msg: "hi" }, { correlationId: "abc" });
  assert.equal(out.msg, "hi");
  assert.equal(out.module, "kernel");
  assert.equal(out.correlation_id, "abc");
});

test("secret-like values rejected", () => {
  assert.throws(
    () => buildLogFields({ extra: { note: "sk-abcdefghijklmnopqrstuvwxyz012345" } }),
    LogFieldError,
  );
  assert.throws(
    () => buildLogFields({ extra: { api_key: "x" } }),
    LogFieldError,
  );
});
