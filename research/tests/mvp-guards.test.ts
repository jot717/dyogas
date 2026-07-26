/**
 * Band A Research Agent MVP — collection guards (RA-03 / RA-04 / RA-06).
 * Offline only — no network.
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  CollectionGuardError,
  assertAllowedSourceClass,
  createFixtureSourceCollector,
  createMockSourceCollector,
  execute,
  isResolvablePointer,
  type EvidenceItem,
  type SourceCollector,
} from "../src/index.js";

beforeEach(() => clear());

function withTenant(): void {
  propagate(createTenancyContext(createTenantId("t-mvp")));
}

test("SAC-3: fixture collector substitutes for mock without changing execute shape", async () => {
  withTenant();
  const fixture = createFixtureSourceCollector({ itemsPerClass: 2 });
  const out = await execute({
    brief_id: "brief-fixture-1",
    brief: {
      question: "local-first knowledge?",
      allowedSourceClasses: ["web"],
      maxItems: 2,
    },
    collector: fixture,
  });
  assert.equal(out.runEvidence.collectorAdapterId, "fixture-source-v1");
  assert.equal(out.evidence.length, 2);
  assert.ok(out.evidence.every((e) => e.metadata.pointer.startsWith("fixture://")));
  assert.equal(out.candidate.brief_ref.brief_id, "brief-fixture-1");
  assert.ok(out.candidate.evidence_items.every((i) => i.provenance.pointer));
});

test("SAC-3: default path still uses mock when collector omitted", async () => {
  withTenant();
  const out = await execute({
    brief_id: "brief-mock-1",
    brief: {
      question: "q",
      allowedSourceClasses: ["web"],
      maxItems: 1,
    },
  });
  assert.equal(out.runEvidence.collectorAdapterId, "mock-source-v1");
  assert.ok(out.evidence.length >= 1);
});

test("SAC-4: max_items is a hard stop with coverage gap", async () => {
  withTenant();
  const collector = createFixtureSourceCollector({ itemsPerClass: 10 });
  const out = await execute({
    brief_id: "brief-budget-items",
    brief: {
      question: "budget items",
      allowedSourceClasses: ["web", "github"],
      maxItems: 2,
    },
    collector,
  });
  assert.equal(out.evidence.length, 2);
  assert.equal(out.runEvidence.budget.truncatedByItems, true);
  assert.equal(out.runEvidence.budget.itemsCollected, 2);
  assert.ok(
    out.candidate.coverage_gaps.some((g) => /max_items/i.test(g)),
    JSON.stringify(out.candidate.coverage_gaps),
  );
});

test("SAC-4: max_seconds is a hard stop with coverage gap", async () => {
  withTenant();
  let t = 0;
  const slow: SourceCollector = {
    adapterId: "slow-fixture-v1",
    collect({ sourceClass, limit, nowIso }) {
      t += 2000; // each class costs 2s of simulated time after return
      return [
        {
          evidenceId: `slow-${sourceClass}-0`,
          excerpt: "x",
          metadata: {
            sourceClass,
            title: "slow",
            pointer: `fixture://slow/${sourceClass}`,
            retrievedAt: nowIso,
            adapter: "slow-fixture-v1",
          },
        },
      ].slice(0, limit);
    },
  };
  const out = await execute({
    brief_id: "brief-budget-time",
    brief: {
      question: "budget time",
      allowedSourceClasses: ["web", "github", "reddit"],
      maxItems: 10,
      maxSeconds: 1,
    },
    collector: slow,
    nowMs: () => t,
  });
  assert.ok(out.runEvidence.budget.truncatedByTime || out.evidence.length < 3);
  assert.ok(
    out.candidate.coverage_gaps.some((g) => /max_seconds/i.test(g)),
    JSON.stringify(out.candidate.coverage_gaps),
  );
});

test("SAC-5: missing provenance.pointer is refused (dropped + gap), not emitted", async () => {
  withTenant();
  const bad: SourceCollector = {
    adapterId: "bad-pointer-v1",
    collect() {
      const items: EvidenceItem[] = [
        {
          evidenceId: "no-pointer",
          excerpt: "fabricated?",
          metadata: {
            sourceClass: "web",
            title: "bad",
            pointer: "   ",
            retrievedAt: "2026-01-01T00:00:00.000Z",
            adapter: "bad-pointer-v1",
          },
        },
        {
          evidenceId: "good",
          excerpt: "ok",
          metadata: {
            sourceClass: "web",
            title: "good",
            pointer: "https://example.com/a",
            retrievedAt: "2026-01-01T00:00:00.000Z",
            adapter: "bad-pointer-v1",
          },
        },
      ];
      return items;
    },
  };
  const out = await execute({
    brief_id: "brief-prov",
    brief: {
      question: "provenance",
      allowedSourceClasses: ["web"],
      maxItems: 5,
    },
    collector: bad,
  });
  assert.equal(out.evidence.length, 1);
  assert.equal(out.evidence[0]?.evidenceId, "good");
  assert.ok(
    out.candidate.coverage_gaps.some((g) => /provenance\.pointer/i.test(g)),
  );
  assert.equal(isResolvablePointer(""), false);
  assert.equal(isResolvablePointer("https://x"), true);
});

test("SAC-6: source class outside allowlist fails closed", () => {
  assert.throws(
    () => assertAllowedSourceClass("github", ["web"]),
    CollectionGuardError,
  );
});

test("SAC-6: collector returning disallowed class fails closed", async () => {
  withTenant();
  const evil: SourceCollector = {
    adapterId: "evil-v1",
    collect() {
      return [
        {
          evidenceId: "x",
          excerpt: "x",
          metadata: {
            sourceClass: "reddit",
            title: "x",
            pointer: "https://reddit.com/r/x",
            retrievedAt: "2026-01-01T00:00:00.000Z",
            adapter: "evil-v1",
          },
        },
      ];
    },
  };
  await assert.rejects(
    () =>
      execute({
        brief_id: "brief-allow",
        brief: {
          question: "allowlist",
          allowedSourceClasses: ["web"],
          maxItems: 2,
        },
        collector: evil,
      }),
    CollectionGuardError,
  );
});

test("SAC-7: runEvidence is produced by execute runtime and matches the run", async () => {
  withTenant();
  const out = await execute({
    brief_id: "brief-ev",
    brief: {
      question: "evidence runtime",
      allowedSourceClasses: ["web"],
      maxItems: 2,
    },
    collector: createFixtureSourceCollector(),
  });
  assert.equal(out.runEvidence.kind, "research-collection-run-evidence");
  assert.equal(out.runEvidence.version, "1.0.0");
  assert.equal(out.runEvidence.briefId, "brief-ev");
  assert.equal(out.runEvidence.collectorAdapterId, "fixture-source-v1");
  assert.equal(out.runEvidence.evidence.length, out.evidence.length);
  assert.deepEqual(
    out.runEvidence.evidence.map((e) => e.pointer),
    out.evidence.map((e) => e.metadata.pointer),
  );
  assert.equal(out.runEvidence.budget.itemsCollected, out.evidence.length);
  assert.deepEqual(
    [...out.runEvidence.coverageGaps],
    [...out.candidate.coverage_gaps],
  );
});

test("SAC-8 negative: claiming success while evidence empty is detectable", async () => {
  withTenant();
  const empty: SourceCollector = {
    adapterId: "empty-v1",
    collect() {
      return [];
    },
  };
  const out = await execute({
    brief_id: "brief-empty",
    brief: {
      question: "none",
      allowedSourceClasses: ["web"],
      maxItems: 3,
    },
    collector: empty,
  });
  // Agent cannot invent PASS: empty collection yields gap, zero items
  assert.equal(out.evidence.length, 0);
  assert.ok(out.candidate.coverage_gaps.length > 0);
  assert.equal(out.runEvidence.budget.itemsCollected, 0);
  // Independent check (not agent self-report): evidence length vs claim
  const agentSelfReport = { passed: true, items: 3 };
  const independentPass =
    out.evidence.length === agentSelfReport.items &&
    out.runEvidence.budget.itemsCollected === agentSelfReport.items;
  assert.equal(independentPass, false);
});

test("mock collector still available for legacy paths", async () => {
  const c = createMockSourceCollector();
  assert.equal(c.adapterId, "mock-source-v1");
  const items = await c.collect({
    question: "q",
    sourceClass: "web",
    limit: 1,
    nowIso: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(items.length, 1);
});
