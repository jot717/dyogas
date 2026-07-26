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
  RESEARCH_STAGE1_EGRESS_PURPOSE,
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

test("egress deny-by-default for non-Stage-1 purposes", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const audit = createMemoryAuditSink();
  const r = evaluateEgress(
    { destination: "https://api.openai.com", purpose: "completion" },
    audit,
  );
  assert.equal(r.decision, "deny");
  assert.throws(
    () =>
      assertEgressAllowed(
        { destination: "https://example.com", purpose: "x" },
        audit,
      ),
    EgressDeniedError,
  );
  assert.ok(audit.list().every((e) => e.decision === "deny"));
  assert.ok(audit.list().length >= 2);
});

test("egress ADR-0011 Stage-1 allow-path for web/github/reddit https", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const audit = createMemoryAuditSink();
  for (const sourceClass of ["web", "github", "reddit"] as const) {
    const r = evaluateEgress(
      {
        destination: "https://example.com/resource",
        purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
        sourceClass,
      },
      audit,
    );
    assert.equal(r.decision, "allow", sourceClass);
  }
  assert.doesNotThrow(() =>
    assertEgressAllowed(
      {
        destination: "https://api.github.com/search/repositories?q=dyogas",
        purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
        sourceClass: "github",
      },
      audit,
    ),
  );
});

test("egress ADR-0011 still denies http and youtube and missing class", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  assert.equal(
    evaluateEgress({
      destination: "http://example.com",
      purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
      sourceClass: "web",
    }).decision,
    "deny",
  );
  assert.equal(
    evaluateEgress({
      destination: "https://example.com",
      purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
      sourceClass: "youtube",
    }).decision,
    "deny",
  );
  assert.equal(
    evaluateEgress({
      destination: "https://example.com",
      purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
    }).decision,
    "deny",
  );
});

test("audit append-only rejects overwrite", () => {
  const sink = createMemoryAuditSink();
  sink.append({ type: "test", note: "a" });
  assert.throws(() => rejectOverwrite(sink, 0, { type: "hacked" }), AuditError);
  assert.equal(sink.list().length, 1);
  assert.equal(sink.list()[0]?.note, "a");
});
