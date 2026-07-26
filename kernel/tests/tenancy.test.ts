import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
  requireTenant,
  assertSameTenant,
  TenancyError,
} from "../src/index.js";

beforeEach(() => {
  clear();
});

test("empty tenant id rejected", () => {
  assert.throws(() => createTenantId(""), TenancyError);
  assert.throws(() => createTenantId("   "), TenancyError);
});

test("absent context deny-by-default", () => {
  assert.throws(() => requireTenant(), TenancyError);
});

test("propagate and require", () => {
  const tid = createTenantId("tenant-a");
  propagate(createTenancyContext(tid));
  assert.equal(requireTenant().tenantId, tid);
});

test("cross-tenant access denied (isolation)", () => {
  const a = createTenantId("tenant-a");
  const b = createTenantId("tenant-b");
  propagate(createTenancyContext(a));
  assert.throws(() => assertSameTenant(b), TenancyError);
  assertSameTenant(a);
});

test("forged tenant swap denied", () => {
  const a = createTenantId("tenant-a");
  const b = createTenantId("tenant-b");
  propagate(createTenancyContext(a));
  assert.throws(() => assertSameTenant(b), /cross-tenant/);
});

test("context reuse across tenants denied after clear", () => {
  const a = createTenantId("tenant-a");
  const b = createTenantId("tenant-b");
  propagate(createTenancyContext(a));
  clear();
  assert.throws(() => assertSameTenant(b), TenancyError);
  propagate(createTenancyContext(b));
  assertSameTenant(b);
  assert.throws(() => assertSameTenant(a), TenancyError);
});
