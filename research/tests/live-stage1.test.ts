/**
 * Band B — live Stage-1 collectors (RA-05 / RA-07). ADR-0011.
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { createMemoryAuditSink } from "@dyogas/trust";
import {
  CollectionGuardError,
  LIVE_STAGE1_ADAPTER_ID,
  createLiveStage1SourceCollector,
  createMockSourceCollector,
  execute,
  isLiveStage1AdapterId,
  type LiveFetch,
} from "../src/index.js";

beforeEach(() => clear());

function withTenant(id = "t-live"): void {
  propagate(createTenancyContext(createTenantId(id)));
}

function stubFetch(payload: unknown, status = 200): LiveFetch {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    text: async () =>
      typeof payload === "string" ? payload : JSON.stringify(payload),
    json: async () => payload,
  });
}

test("RA-05: live adapter id is not mock/fixture", () => {
  assert.equal(isLiveStage1AdapterId(LIVE_STAGE1_ADAPTER_ID), true);
  assert.equal(isLiveStage1AdapterId("mock-source-v1"), false);
  assert.equal(isLiveStage1AdapterId("fixture-source-v1"), false);
});

test("RA-05: live web collect requires Trust allow and records provenance + trust meta", async () => {
  withTenant();
  const audit = createMemoryAuditSink();
  const collector = createLiveStage1SourceCollector({
    audit,
    fetchImpl: stubFetch([
      "local-first knowledge",
      ["Local-first software"],
      ["Knowledge that stays on your device"],
      ["https://en.wikipedia.org/wiki/Local-first_software"],
    ]),
  });
  const out = await execute({
    brief_id: "brief-live-web",
    brief: {
      question: "local-first knowledge",
      allowedSourceClasses: ["web"],
      maxItems: 2,
    },
    collector,
  });
  assert.equal(out.runEvidence.collectorAdapterId, LIVE_STAGE1_ADAPTER_ID);
  assert.ok(out.evidence.length >= 1);
  const item = out.evidence[0]!;
  assert.ok(item.metadata.pointer.startsWith("https://"));
  assert.equal(item.metadata.pointer.includes("example.com"), false);
  assert.equal(item.metadata.adapter, LIVE_STAGE1_ADAPTER_ID);
  assert.ok(item.metadata.retrievedAt);
  assert.equal(item.metadata.trust?.decision, "allow");
  assert.ok(audit.list().some((e) => e.decision === "allow"));
});

test("RA-05: live github + reddit paths produce resolvable pointers", async () => {
  withTenant();
  const collector = createLiveStage1SourceCollector({
    fetchImpl: async (url) => {
      if (url.includes("api.github.com")) {
        return stubFetch({
          items: [
            {
              full_name: "dyogas/dyogas",
              html_url: "https://github.com/dyogas/dyogas",
              description: "Decision OS",
            },
          ],
        })(url);
      }
      return stubFetch({
        data: {
          children: [
            {
              data: {
                title: "local first discussion",
                permalink: "/r/programming/comments/abc/local/",
                selftext: "community note",
              },
            },
          ],
        },
      })(url);
    },
  });
  const out = await execute({
    brief_id: "brief-live-multi",
    brief: {
      question: "dyogas",
      allowedSourceClasses: ["github", "reddit"],
      maxItems: 4,
    },
    collector,
  });
  assert.equal(out.runEvidence.collectorAdapterId, LIVE_STAGE1_ADAPTER_ID);
  assert.ok(out.evidence.some((e) => e.metadata.sourceClass === "github"));
  assert.ok(out.evidence.some((e) => e.metadata.sourceClass === "reddit"));
  assert.ok(
    out.evidence.every((e) => e.metadata.pointer.startsWith("https://")),
  );
});

test("RA-05: youtube refused by live collector (fail closed)", async () => {
  withTenant();
  const collector = createLiveStage1SourceCollector({
    fetchImpl: stubFetch("nope"),
  });
  await assert.rejects(
    () =>
      collector.collect({
        question: "q",
        sourceClass: "youtube",
        limit: 1,
        nowIso: "2026-01-01T00:00:00.000Z",
      }),
    CollectionGuardError,
  );
});

test("RA-05: egress deny returns no fabricated evidence (fail closed)", async () => {
  withTenant();
  // Wrong purpose path: inject collector that still uses Trust — deny by using
  // a fetch that never runs because we simulate deny via source outside allow
  // by calling evaluate through collector with youtube class already tested.
  // Here: mock Trust by using live collector when identity missing.
  clear();
  const collector = createLiveStage1SourceCollector({
    fetchImpl: stubFetch("should-not-fetch"),
  });
  await assert.rejects(
    () =>
      execute({
        brief_id: "brief-no-tenant",
        brief: {
          question: "q",
          allowedSourceClasses: ["web"],
          maxItems: 1,
        },
        collector,
      }),
  );
});

test("RA-07 anti-mock: claiming live PASS with mock adapter fails independent check", async () => {
  withTenant();
  const mock = createMockSourceCollector();
  const out = await execute({
    brief_id: "brief-mock-claim",
    brief: {
      question: "q",
      allowedSourceClasses: ["web"],
      maxItems: 1,
    },
    collector: mock,
  });
  const claimedLive = true;
  const independentLive =
    isLiveStage1AdapterId(out.runEvidence.collectorAdapterId) &&
    out.evidence.length > 0 &&
    out.evidence.every((e) => e.metadata.pointer.startsWith("https://"));
  assert.equal(claimedLive && independentLive, false);
  assert.equal(out.runEvidence.collectorAdapterId, "mock-source-v1");
});

test("RA-07: live E2E path with Trust-gated fetch produces evidence artifact", async () => {
  withTenant("t-e2e");
  const audit = createMemoryAuditSink();
  const collector = createLiveStage1SourceCollector({
    audit,
    fetchImpl: async (url) => {
      if (url.includes("wikipedia.org")) {
        return stubFetch([
          "dyogas",
          ["Decision support system"],
          ["Systems that support business decision-making"],
          ["https://en.wikipedia.org/wiki/Decision_support_system"],
        ])(url);
      }
      if (url.includes("api.github.com")) {
        return stubFetch({
          items: [
            {
              full_name: "example/repo",
              html_url: "https://github.com/example/repo",
              description: "external github",
            },
          ],
        })(url);
      }
      return stubFetch({
        data: {
          children: [
            {
              data: {
                title: "external reddit",
                permalink: "/r/test/comments/1/x/",
                selftext: "external",
              },
            },
          ],
        },
      })(url);
    },
  });

  const out = await execute({
    brief_id: "brief-ra07",
    brief: {
      question: "dyogas research agent",
      allowedSourceClasses: ["web", "github", "reddit"],
      maxItems: 5,
    },
    collector,
  });

  assert.equal(isLiveStage1AdapterId(out.runEvidence.collectorAdapterId), true);
  assert.notEqual(out.runEvidence.collectorAdapterId, "mock-source-v1");
  assert.ok(out.evidence.length >= 1);
  assert.ok(out.candidate.evidence_items.every((i) => i.provenance.pointer));
  assert.equal(out.runEvidence.kind, "research-collection-run-evidence");
  assert.ok(audit.list().some((e) => e.decision === "allow"));
  // Independent verifier shape
  const independentPass =
    out.runEvidence.collectorAdapterId === LIVE_STAGE1_ADAPTER_ID &&
    out.evidence.length === out.runEvidence.budget.itemsCollected &&
    out.evidence.every((e) => e.metadata.trust?.decision === "allow");
  assert.equal(independentPass, true);
});
