import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  assertEgressAllowed,
  createMemoryAuditSink,
  createSecretsVault,
  evaluateEgress,
  EgressDeniedError,
  rejectOverwrite,
  requireTrustIdentity,
  TrustIdentityError,
  AuditError,
} from "../src/index.js";

beforeEach(() => {
  clear();
});

test("smoke: trust loads", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  assert.equal(requireTrustIdentity().tenantId, "t1");
});

test("identity deny without tenancy", () => {
  assert.throws(() => requireTrustIdentity(), TrustIdentityError);
});

test("secrets redact and never expose raw in dump", () => {
  const v = createSecretsVault({
    PUBLIC: "ok",
    API_SECRET: "raw-secret-value",
  } as NodeJS.ProcessEnv);
  assert.equal(v.require("API_SECRET"), "raw-secret-value");
  const dump = JSON.stringify(v.redactDump());
  assert.ok(!dump.includes("raw-secret-value"));
  assert.equal(v.redactDump().API_SECRET, "[REDACTED]");
});

test("egress deny-by-default 100%", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const audit = createMemoryAuditSink();
  const r = evaluateEgress(
    { destination: "https://api.openai.com", purpose: "completion" },
    audit,
  );
  assert.equal(r.decision, "deny");
  assert.throws(
    () =>
      assertEgressAllowed({ destination: "https://example.com", purpose: "x" }, audit),
    EgressDeniedError,
  );
  assert.ok(audit.list().every((e) => e.decision === "deny"));
  assert.ok(audit.list().length >= 2);
});

test("audit append-only rejects overwrite", () => {
  const sink = createMemoryAuditSink();
  sink.append({ type: "test", note: "a" });
  assert.throws(() => rejectOverwrite(sink, 0, { type: "hacked" }), AuditError);
  assert.equal(sink.list().length, 1);
  assert.equal(sink.list()[0]?.note, "a");
});
