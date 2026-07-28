/**
 * Retrieval Contract v4 — source contamination filter before Quality Gate.
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
  createLiveStage1SourceCollector,
  evaluateRetrievalContract,
  execute,
  type LiveFetch,
} from "../src/index.js";

beforeEach(() => clear());

function withTenant(id = "t-retrieval-v4"): void {
  propagate(createTenancyContext(createTenantId(id)));
}

function planAnnotation(input: {
  domain: string;
  goal: string;
  factors: string[];
  queries: string[];
  preferred: string[];
  classes: string[];
  excluded: string[];
}): string {
  return `[decision-plan: domain=${input.domain}; goal=${input.goal}; factors=${input.factors.join("|")}; queries=${input.queries.join("|")}; preferred=${input.preferred.join("|")}; classes=${input.classes.join("|")}; exclude=${input.excluded.join("|")}]`;
}

function wikiOpensearchPayload(
  titles: string[],
  descs: string[],
  urls: string[],
): unknown {
  return ["", titles, descs, urls];
}

function stubFetchWithWiki(
  pages: Record<string, string>,
  opensearch: unknown,
): LiveFetch {
  return async (url) => {
    if (url.includes("action=opensearch")) {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(opensearch),
        json: async () => opensearch,
      };
    }
    if (url.includes("action=query") && url.includes("extracts")) {
      const titleMatch = url.match(/titles=([^&]+)/);
      const title = titleMatch
        ? decodeURIComponent(titleMatch[1]!.replace(/\+/g, " "))
        : "";
      const extract = pages[title] ?? pages[Object.keys(pages).find((k) => title.includes(k)) ?? ""] ?? "";
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            query: {
              pages: {
                "1": { extract },
              },
            },
          }),
        json: async () => ({
          query: {
            pages: {
              "1": { extract },
            },
          },
        }),
      };
    }
    return { ok: false, status: 404, text: async () => "", json: async () => ({}) };
  };
}

test("Case 1: japan HSP visa — PASS ISA/MOJ, REJECT Jamaica/football/language", async () => {
  withTenant();
  const question = `how to apply japan highly skilled visa\n${planAnnotation({
    domain: "japan_immigration",
    goal: "learn_how_to",
    factors: [
      "eligibility",
      "points_calculation",
      "required_documents",
      "application_procedure",
    ],
    queries: [
      "Immigration Services Agency",
      "Highly Skilled Professional points calculation",
    ],
    preferred: [
      "Immigration Services Agency Japan",
      "MOJ Japan",
      "Japan visa official",
    ],
    classes: ["web", "reddit"],
    excluded: [
      "Jamaica",
      "football",
      "language learning",
      "Japanese language",
      "tourism",
    ],
  })}`;

  const pages: Record<string, string> = {
    "Immigration Services Agency":
      "The Immigration Services Agency of Japan administers visa eligibility, points calculation, required documents, and application procedure for Highly Skilled Professional residence status.",
    "Immigration to Jamaica":
      "Immigration to Jamaica covers work permits and residence for foreign nationals moving to Jamaica.",
    "Association football":
      "Association football is a team sport governed by FIFA with national teams including Japan.",
    "Japanese language":
      "Japanese language learning resources for beginners studying grammar and vocabulary.",
  };

  const collector = createLiveStage1SourceCollector({
    audit: createMemoryAuditSink(),
    fetchImpl: stubFetchWithWiki(pages, wikiOpensearchPayload(
      [
        "Immigration Services Agency",
        "Immigration to Jamaica",
        "Association football",
        "Japanese language",
      ],
      [
        "Japan immigration agency",
        "Jamaica immigration",
        "Football in Japan",
        "Learn Japanese",
      ],
      [
        "https://en.wikipedia.org/wiki/Immigration_Services_Agency",
        "https://en.wikipedia.org/wiki/Immigration_to_Jamaica",
        "https://en.wikipedia.org/wiki/Association_football",
        "https://en.wikipedia.org/wiki/Japanese_language",
      ],
    )),
  });

  const out = await execute({
    brief_id: "case-1-hsp",
    brief: {
      question,
      allowedSourceClasses: ["web"],
      maxItems: 6,
    },
    collector,
  });

  const titles = out.evidence.map((e) => e.metadata.title);
  const rejected = collector.getRejectionAudit().map((r) => r.source);

  assert.ok(
    titles.some((t) => /Immigration Services Agency/i.test(t)),
    `PASS expected ISA, got: ${titles.join(", ")}`,
  );
  assert.equal(titles.some((t) => /Jamaica/i.test(t)), false);
  assert.equal(titles.some((t) => /football/i.test(t)), false);
  assert.equal(titles.some((t) => /Japanese language/i.test(t)), false);
  assert.ok(rejected.some((s) => /Jamaica/i.test(s)));
  assert.ok(rejected.some((s) => /football/i.test(s)));
  assert.ok(
    out.runEvidence.rejected_sources?.some((r) =>
      r.reason.includes("country mismatch") || r.reason.includes("excluded pattern"),
    ),
  );
});

test("Case 2: italian coffee — PASS espresso/moka, REJECT decision making", async () => {
  withTenant();
  const question = `how to make italian coffee\n${planAnnotation({
    domain: "coffee_preparation",
    goal: "learn_how_to",
    factors: ["brewing method", "ingredients", "equipment", "technique"],
    queries: ["Espresso", "Cappuccino", "Italian coffee culture"],
    preferred: ["espresso", "moka pot", "Italian coffee preparation"],
    classes: ["web", "reddit"],
    excluded: ["decision making", "business decision", "career"],
  })}`;

  const pages: Record<string, string> = {
    Espresso:
      "Espresso brewing method uses pressure, fine grind, and technique for Italian coffee preparation with moka or machine equipment.",
    "Decision-making":
      "Decision-making is the cognitive process of selecting among business decision alternatives under uncertainty.",
    Cappuccino:
      "Cappuccino combines espresso with steamed milk using barista technique and equipment.",
  };

  const collector = createLiveStage1SourceCollector({
    audit: createMemoryAuditSink(),
    fetchImpl: stubFetchWithWiki(pages, wikiOpensearchPayload(
      ["Espresso", "Decision-making", "Cappuccino"],
      ["Italian coffee", "Business decisions", "Milk foam"],
      [
        "https://en.wikipedia.org/wiki/Espresso",
        "https://en.wikipedia.org/wiki/Decision-making",
        "https://en.wikipedia.org/wiki/Cappuccino",
      ],
    )),
  });

  const out = await execute({
    brief_id: "case-2-coffee",
    brief: { question, allowedSourceClasses: ["web"], maxItems: 5 },
    collector,
  });

  const titles = out.evidence.map((e) => e.metadata.title);
  assert.ok(titles.some((t) => /Espresso|Cappuccino/i.test(t)));
  assert.equal(titles.some((t) => /Decision/i.test(t)), false);
  assert.ok(collector.getRejectionAudit().some((r) => /Decision/i.test(r.source)));
});

test("Case 3: Tokyo AI startup — PASS ecosystem/funding, REJECT generic career Wikipedia", async () => {
  withTenant();
  const question = `Should I build AI startup in Tokyo\n${planAnnotation({
    domain: "startup_decision",
    goal: "make_decision",
    factors: [
      "market opportunity",
      "financial risk",
      "Tokyo ecosystem",
      "funding",
    ],
    queries: ["Startup ecosystem in Japan", "Venture capital in Japan"],
    preferred: ["startup ecosystem", "venture capital", "Tokyo market", "AI startup funding"],
    classes: ["web", "github", "reddit"],
    excluded: ["decision making", "career"],
  })}`;

  const pages: Record<string, string> = {
    "Startup ecosystem in Japan":
      "Tokyo startup ecosystem includes AI venture capital, founder funding rounds, and market opportunity for entrepreneurs.",
    Employment:
      "Employment is a relationship between worker and employer covering salary and labor market conditions without startup context.",
    "Venture capital in Japan":
      "Venture capital in Japan funds startup founders in Tokyo with financial risk and ecosystem support for AI companies.",
  };

  const collector = createLiveStage1SourceCollector({
    audit: createMemoryAuditSink(),
    fetchImpl: stubFetchWithWiki(pages, wikiOpensearchPayload(
      ["Startup ecosystem in Japan", "Employment", "Venture capital in Japan"],
      ["Tokyo startups", "Jobs and wages", "Funding rounds"],
      [
        "https://en.wikipedia.org/wiki/Startup_ecosystem_in_Japan",
        "https://en.wikipedia.org/wiki/Employment",
        "https://en.wikipedia.org/wiki/Venture_capital_in_Japan",
      ],
    )),
  });

  const out = await execute({
    brief_id: "case-3-startup",
    brief: { question, allowedSourceClasses: ["web"], maxItems: 5 },
    collector,
  });

  const titles = out.evidence.map((e) => e.metadata.title);
  assert.ok(
    titles.some((t) => /Startup ecosystem|Venture capital/i.test(t)),
    `expected startup sources, got: ${titles.join(", ")}`,
  );
  assert.equal(titles.some((t) => /^Employment$/i.test(t.trim())), false);
  assert.ok(collector.getRejectionAudit().some((r) => /Employment/i.test(r.source)));
});

test("evaluateRetrievalContract: excluded pattern is immediate reject", () => {
  const result = evaluateRetrievalContract({
    plan: {
      domain: "japan_immigration",
      factors: ["eligibility"],
      queries: [],
      preferred: [],
      classes: ["web"],
      excluded: ["Jamaica"],
    },
    sourceClass: "web",
    title: "Immigration to Jamaica",
    content: "Work permits for Jamaica immigration applicants.",
    pointer: "https://en.wikipedia.org/wiki/Immigration_to_Jamaica",
  });
  assert.equal(result.pass, false);
  assert.ok(result.reasons.includes("country mismatch") || result.reasons.includes("excluded pattern"));
});
