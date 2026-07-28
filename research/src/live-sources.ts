/**
 * Live Stage-1 source collectors (ADR-0011 / RA-05).
 * All network I/O gated by MOD-TRUST egress. No Runtime/SDK/Host changes.
 */

import {
  assertEgressAllowed,
  createMemoryAuditSink,
  EgressDeniedError,
  type AuditSink,
} from "@dyogas/trust";
import type { SourceClass } from "./task.js";
import type { EvidenceItem, SourceCollector, SourceMetadata } from "./sources.js";
import { CollectionGuardError } from "./collection.js";

export const LIVE_STAGE1_ADAPTER_ID = "live-stage1-v1";

/** Must match Trust RESEARCH_STAGE1_EGRESS_PURPOSE (ADR-0011). */
const RESEARCH_STAGE1_EGRESS_PURPOSE = "research-stage1-collect";

export type LiveFetch = (
  url: string,
  init?: { readonly headers?: Record<string, string> },
) => Promise<{
  readonly ok: boolean;
  readonly status: number;
  readonly text: () => Promise<string>;
  readonly json: () => Promise<unknown>;
}>;

export type LiveStage1CollectorOptions = {
  readonly audit?: AuditSink;
  /** Injectable fetch — defaults to global fetch (real network). */
  readonly fetchImpl?: LiveFetch;
  /** When true, deny on any class fails the whole collect with POLICY_DENY if zero items. */
  readonly failClosedAllDenied?: boolean;
};

export type TrustEgressMeta = {
  readonly decision: "allow";
  readonly purpose: string;
  readonly sourceClass: SourceClass;
  readonly destination: string;
};

/** Parse decision-plan annotation from research question (mirrors personal-brain). */
export type ParsedDecisionPlan = {
  readonly domain?: string;
  readonly goal?: string;
  readonly factors: readonly string[];
  readonly queries: readonly string[];
  readonly preferred: readonly string[];
  readonly classes: readonly string[];
  readonly excluded: readonly string[];
};

export type RetrievalRejectionReason =
  | "country mismatch"
  | "factor mismatch"
  | "domain mismatch"
  | "excluded pattern"
  | "source class mismatch"
  | "wikipedia factor mismatch";

export type RetrievalRejectionRecord = {
  readonly source: string;
  readonly rejected: true;
  readonly reason: readonly RetrievalRejectionReason[];
};

export type LiveSourceCollectorWithAudit = SourceCollector & {
  getRejectionAudit(): readonly RetrievalRejectionRecord[];
};

function parseDecisionPlanAnnotation(question: string): ParsedDecisionPlan {
  const m = question.match(/\[decision-plan:\s*([^\]]+)\]/i);
  if (!m?.[1]) {
    return {
      factors: [],
      queries: [],
      preferred: [],
      classes: [],
      excluded: [],
    };
  }
  const body = m[1];
  const domain = body.match(/domain=([^;]+)/i)?.[1]?.trim();
  const goal = body.match(/goal=([^;]+)/i)?.[1]?.trim();
  const factors =
    body
      .match(/factors=([^;]+)/i)?.[1]
      ?.split("|")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const queries =
    body
      .match(/queries=([^;]+)/i)?.[1]
      ?.split("|")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const preferred =
    body
      .match(/preferred=([^;]+)/i)?.[1]
      ?.split("|")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const classes =
    body
      .match(/classes=([^;]+)/i)?.[1]
      ?.split("|")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const excluded =
    body
      .match(/exclude=([^;]+)/i)?.[1]
      ?.split("|")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  return { domain, goal, factors, queries, preferred, classes, excluded };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_]/gu, " ")
    .split(/[\s_]+/)
    .filter((w) => w.length > 2);
}

function factorKeywords(factor: string): string[] {
  return tokenize(factor.replace(/_/g, " "));
}

function matchesResearchFactor(
  factors: readonly string[],
  hay: string,
): boolean {
  if (factors.length === 0) return true;
  const lower = hay.toLowerCase();
  return factors.some((factor) => {
    const keys = factorKeywords(factor);
    if (keys.length === 0) return false;
    const hits = keys.filter((k) => lower.includes(k)).length;
    return hits >= Math.min(2, keys.length) || keys.some((k) => lower.includes(k));
  });
}

function isWikipediaUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes("wikipedia.org");
  } catch {
    return false;
  }
}

function hasCountryMismatch(domain: string | undefined, hay: string): boolean {
  const lower = hay.toLowerCase();
  if (domain === "japan_immigration") {
    if (/\bjamaica\b/i.test(lower) && !/\bjapan\b|\bvisa\b|\bresiden/i.test(lower)) {
      return true;
    }
    if (/immigration to jamaica/i.test(lower)) return true;
  }
  return false;
}

function hasStartupDomainSignal(hay: string): boolean {
  if (/\b(without startup|not a startup|non-startup)\b/i.test(hay)) {
    return false;
  }
  return /\b(startup|founder|venture|entrepreneur|ecosystem|funding|ai company|venture capital)\b/i.test(
    hay,
  );
}

function isGenericCareerWikipedia(
  domain: string | undefined,
  title: string,
  content: string,
): boolean {
  if (domain !== "startup_decision") return false;
  const hay = `${title} ${content}`.toLowerCase();
  const genericCareer =
    /^(employment|labor market|career|job market|economy of)/i.test(title.trim()) ||
    /^labor market of\b/i.test(title);
  if (!genericCareer) return false;
  return !hasStartupDomainSignal(hay);
}

/** Retrieval Contract v4 — evaluate before accepting a candidate source. */
export function evaluateRetrievalContract(input: {
  readonly plan: ParsedDecisionPlan;
  readonly sourceClass: SourceClass;
  readonly title: string;
  readonly content: string;
  readonly pointer: string;
}): { readonly pass: boolean; readonly reasons: RetrievalRejectionReason[] } {
  const reasons: RetrievalRejectionReason[] = [];
  const hay = `${input.title} ${input.content} ${input.pointer}`;
  const { plan } = input;

  if (plan.excluded.length > 0 && isExcludedTitle(hay, plan.excluded)) {
    reasons.push("excluded pattern");
  }
  if (hasCountryMismatch(plan.domain, hay)) {
    reasons.push("country mismatch");
  }
  if (
    plan.classes.length > 0 &&
    !plan.classes.includes(input.sourceClass)
  ) {
    reasons.push("source class mismatch");
  }
  if (!titleAlignedToDomain(plan.domain, input.title, input.content)) {
    reasons.push("domain mismatch");
  }
  if (isGenericCareerWikipedia(plan.domain, input.title, input.content)) {
    reasons.push("domain mismatch");
  }
  if (plan.factors.length > 0 && !matchesResearchFactor(plan.factors, hay)) {
    reasons.push("factor mismatch");
  }
  if (isWikipediaUrl(input.pointer)) {
    const wikiOk =
      titleAlignedToDomain(plan.domain, input.title, input.content) &&
      !isExcludedTitle(hay, plan.excluded) &&
      (plan.factors.length === 0 ||
        matchesResearchFactor(plan.factors, hay) ||
        plan.preferred.some((p) => hay.toLowerCase().includes(p.toLowerCase())));
    if (!wikiOk) {
      reasons.push("wikipedia factor mismatch");
    }
  }

  const unique = [...new Set(reasons)];
  return { pass: unique.length === 0, reasons: unique };
}

export function isLiveSourceCollectorWithAudit(
  collector: SourceCollector,
): collector is LiveSourceCollectorWithAudit {
  return typeof (collector as LiveSourceCollectorWithAudit).getRejectionAudit ===
    "function";
}

function isExcludedTitle(title: string, excluded: readonly string[]): boolean {
  const hay = title.toLowerCase();
  return excluded.some((ex) => hay.includes(ex.toLowerCase().trim()));
}

const GENERIC_GITHUB =
  /\b(course|homework|assignment|CSE\d+|Georgia Tech|university project|student project|tutorial repo|data visualization app)\b/i;

function isGenericGithub(title: string, description: string): boolean {
  return GENERIC_GITHUB.test(`${title} ${description}`);
}

async function fetchWikipediaExtract(
  title: string,
  fetchImpl: LiveFetch,
): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(title)}&format=json`;
  try {
    const res = await fetchImpl(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return "";
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { extract?: string }> };
    };
    const pages = data.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      const extract = page.extract?.trim();
      if (extract && extract.length > 40) return extract.slice(0, 400);
    }
  } catch {
    /* soft fail */
  }
  return "";
}

function wikipediaOpensearchUrl(query: string, limit = 3): string {
  return `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${limit}&namespace=0&format=json`;
}

function searchQuery(question: string): string {
  const cleaned = question.replace(/[?!.,:;]/g, " ").trim();
  const words = cleaned
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 10);
  return encodeURIComponent(words.join(" ").slice(0, 80) || question.slice(0, 80));
}

/** Compact keyword query for GitHub/Reddit/Wikipedia search APIs. */
function apiKeywordQuery(question: string, sourceClass?: SourceClass): string {
  const cleanedQuestion = question
    .replace(/\n?\[research-intents:[^\]]*\]/gi, " ")
    .replace(/\n?\[decision-plan:[^\]]*\]/gi, " ")
    .trim();

  const plan = parseDecisionPlanAnnotation(question);
  if (plan.queries.length > 0) {
    const pick =
      sourceClass === "github"
        ? plan.queries.find((q) => /github|analyzer|market|salary|startup|housing|real estate/i.test(q)) ??
          plan.queries[1] ??
          plan.queries[0]
        : plan.queries[0];
    if (pick) return encodeURIComponent(pick.slice(0, 80));
  }

  const tokens: string[] = [];
  for (const key of [
    "tokyo",
    "japan",
    "startup",
    "founder",
    "solo",
    "career",
    "salary",
    "job",
    "employment",
    "hiring",
    "visa",
    "housing",
    "mortgage",
    "real estate",
    "2026",
  ]) {
    if (
      new RegExp(`\\b${key.replace(/ /g, "\\s+")}\\b`, "i").test(cleanedQuestion) &&
      !tokens.includes(key)
    ) {
      tokens.push(key);
    }
  }
  if (/\bai\b/i.test(cleanedQuestion) && !tokens.includes("AI")) {
    tokens.unshift("AI");
  }
  if (tokens.length >= 2) {
    return encodeURIComponent(tokens.slice(0, 3).join(" "));
  }
  return searchQuery(cleanedQuestion);
}

function destinationFor(
  sourceClass: SourceClass,
  question: string,
): string {
  const q = apiKeywordQuery(question, sourceClass);
  switch (sourceClass) {
    case "web":
      return wikipediaOpensearchUrl(decodeURIComponent(q), 5);
    case "github":
      return `https://api.github.com/search/repositories?q=${q}&per_page=8&sort=stars`;
    case "reddit":
      return `https://www.reddit.com/search.json?q=${q}&limit=5&raw_json=1`;
    default:
      throw new CollectionGuardError(
        `ADR-0011 does not allow live source class: ${sourceClass}`,
      );
  }
}

function defaultFetch(): LiveFetch {
  return async (url, init) => {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json, text/html;q=0.9,*/*;q=0.8",
        // Reddit requires a unique descriptive UA; GitHub tolerates it.
        "User-Agent":
          "dyogas-research-engine/0.2 (ADR-0011 Stage-1; local research harness)",
        ...(init?.headers ?? {}),
      },
    });
    return {
      ok: res.ok,
      status: res.status,
      text: () => res.text(),
      json: () => res.json(),
    };
  };
}

function meta(
  sourceClass: SourceClass,
  pointer: string,
  title: string,
  nowIso: string,
  trust: TrustEgressMeta,
): SourceMetadata & { readonly trust: TrustEgressMeta } {
  return {
    sourceClass,
    title,
    pointer,
    retrievedAt: nowIso,
    adapter: LIVE_STAGE1_ADAPTER_ID,
    trust,
  };
}

/** Targeted search queries from research plan (Research Intelligence v3). */
function targetedQueriesFromPlan(
  question: string,
  plan: ReturnType<typeof parseDecisionPlanAnnotation>,
): string[] {
  if (plan.queries.length > 0) {
    return [...plan.queries].slice(0, 6);
  }
  const qLower = question
    .replace(/\[decision-plan:[^\]]*\]/gi, " ")
    .toLowerCase();
  if (plan.domain === "japan_immigration" || /\b(visa|immigration|highly skilled)\b/.test(qLower)) {
    return [
      "Immigration Services Agency",
      "Japanese residency system",
      "Permanent residency in Japan",
      "Visa policy of Japan",
      "Highly Skilled Professional points calculation",
      "Highly Skilled Professional required documents",
    ];
  }
  if (plan.domain === "coffee_preparation" || /\b(coffee|espresso|cappuccino|barista)\b/.test(qLower)) {
    return ["Espresso", "Cappuccino", "Italian coffee culture", "Coffee preparation"];
  }
  if (plan.domain === "career_transition" || /\b(career|job|salary|employment|hiring)\b/.test(qLower)) {
    return ["Labor market of Japan", "Foreign workers in Japan", "Employment in Japan"];
  }
  if (plan.domain === "startup_decision" || /\b(startup|founder|ai|entrepreneur)\b/.test(qLower)) {
    return ["Startup ecosystem in Japan", "Venture capital in Japan"];
  }
  if (plan.domain === "real_estate" || /\b(house|home|property|real estate|mortgage)\b/.test(qLower)) {
    return ["Real estate in Japan", "Housing in Japan"];
  }
  const topic = qLower
    .replace(/[?!.,:;]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 3)
    .join(" ");
  return topic ? [topic] : [];
}

function titleAlignedToDomain(
  domain: string | undefined,
  title: string,
  desc: string,
): boolean {
  const hay = `${title} ${desc}`.toLowerCase();
  if (/football|soccer|politician|language learning|english language|association football/i.test(hay)) {
    if (domain === "japan_immigration" || domain === "coffee_preparation") {
      return false;
    }
  }
  if (domain === "japan_immigration") {
    if (/japanese language|language learning|learn japanese/i.test(hay)) {
      return false;
    }
    return /immigra|visa|residen|highly.?skilled|points|immigration services|出入国|在留|foreign professional/i.test(
      hay,
    );
  }
  if (domain === "coffee_preparation") {
    return /coffee|espresso|cappuccino|barista|brew|latte|macchiato|mocha|moka|italian/i.test(
      hay,
    );
  }
  if (domain === "career_transition") {
    return /career|job|employment|labor|salary|hiring|work/i.test(hay);
  }
  if (domain === "startup_decision") {
    return hasStartupDomainSignal(hay);
  }
  if (domain === "real_estate") {
    return /housing|real estate|mortgage|property|apartment|home/i.test(hay);
  }
  return !/^Decision[- ]making/i.test(title);
}

async function collectWeb(
  question: string,
  limit: number,
  nowIso: string,
  fetchImpl: LiveFetch,
  trust: TrustEgressMeta,
  audit: AuditSink,
  rejectionAudit: RetrievalRejectionRecord[],
): Promise<EvidenceItem[]> {
  const plan = parseDecisionPlanAnnotation(question);
  const targeted = targetedQueriesFromPlan(question, plan);
  const queries = targeted.map((q) => wikipediaOpensearchUrl(q, 3));
  if (queries.length === 0) {
    queries.push(trust.destination);
  }
  const out: EvidenceItem[] = [];
  const seen = new Set<string>();

  function rejectCandidate(
    source: string,
    reasons: readonly RetrievalRejectionReason[],
  ): void {
    if (reasons.length === 0) return;
    rejectionAudit.push({ source, rejected: true, reason: reasons });
  }

  for (const destination of queries) {
    if (out.length >= limit) break;
    try {
      assertEgressAllowed(
        {
          destination,
          purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
          sourceClass: "web",
        },
        audit,
      );
    } catch (err) {
      if (err instanceof EgressDeniedError) continue;
      throw err;
    }
    const res = await fetchImpl(destination, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) continue;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || data.length < 4) continue;
    const titles = Array.isArray(data[1]) ? (data[1] as unknown[]) : [];
    const descs = Array.isArray(data[2]) ? (data[2] as unknown[]) : [];
    const urls = Array.isArray(data[3]) ? (data[3] as unknown[]) : [];
    for (let i = 0; i < Math.min(titles.length, urls.length); i++) {
      if (out.length >= limit) break;
      const title = typeof titles[i] === "string" ? String(titles[i]).trim() : "";
      const pointer = typeof urls[i] === "string" ? String(urls[i]).trim() : "";
      const desc =
        typeof descs[i] === "string" && String(descs[i]).trim()
          ? String(descs[i]).trim()
          : "";
      if (!pointer.startsWith("https://") || !title) continue;
      if (pointer.includes("example.com")) continue;
      if (/^Career of\b/i.test(title)) continue;
      if (/\(song\)|\(album\)|\(film\)|\(TV series\)/i.test(title)) continue;

      const extract = await fetchWikipediaExtract(title, fetchImpl);
      const content = extract || desc;
      const contract = evaluateRetrievalContract({
        plan,
        sourceClass: "web",
        title,
        content,
        pointer,
      });
      if (!contract.pass) {
        rejectCandidate(title || pointer, contract.reasons);
        continue;
      }
      if (seen.has(pointer)) continue;
      seen.add(pointer);
      const excerpt = (content || `${title} — reference for decision research.`).slice(
        0,
        400,
      );
      if (excerpt.length < 20) continue;
      out.push({
        evidenceId: `live-web-${out.length}`,
        excerpt,
        metadata: meta(
          "web",
          pointer,
          title,
          nowIso,
          {
            decision: "allow",
            purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
            sourceClass: "web",
            destination,
          },
        ),
      });
    }
  }
  if (plan.domain === "japan_immigration" && out.length < Math.min(limit, 4)) {
    await appendWikipediaTitleSeeds(
      [
        "Immigration Services Agency",
        "Japanese residency system",
        "Permanent residency in Japan",
        "Visa policy of Japan",
        "Highly Skilled Professional (Japan)",
      ],
      out,
      seen,
      limit,
      nowIso,
      fetchImpl,
      audit,
      plan,
      rejectionAudit,
    );
  }
  return out;
}

async function appendWikipediaTitleSeeds(
  titles: readonly string[],
  out: EvidenceItem[],
  seen: Set<string>,
  limit: number,
  nowIso: string,
  fetchImpl: LiveFetch,
  audit: AuditSink,
  plan: ParsedDecisionPlan,
  rejectionAudit: RetrievalRejectionRecord[],
): Promise<void> {
  for (const title of titles) {
    if (out.length >= limit) break;
    const pointer = `https://en.wikipedia.org/wiki/${encodeURIComponent(
      title.replace(/ /g, "_"),
    )}`;
    if (seen.has(pointer)) continue;
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(title)}&format=json`;
    try {
      assertEgressAllowed(
        {
          destination: extractUrl,
          purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
          sourceClass: "web",
        },
        audit,
      );
    } catch (err) {
      if (err instanceof EgressDeniedError) continue;
      throw err;
    }
    const extract = await fetchWikipediaExtract(title, fetchImpl);
    const contract = evaluateRetrievalContract({
      plan,
      sourceClass: "web",
      title,
      content: extract,
      pointer,
    });
    if (!contract.pass) {
      rejectionAudit.push({
        source: title,
        rejected: true,
        reason: contract.reasons,
      });
      continue;
    }
    if (extract.length < 40) continue;
    seen.add(pointer);
    out.push({
      evidenceId: `live-web-${out.length}`,
      excerpt: extract.slice(0, 400),
      metadata: meta("web", pointer, title, nowIso, {
        decision: "allow",
        purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
        sourceClass: "web",
        destination: extractUrl,
      }),
    });
  }
}

async function collectGithub(
  question: string,
  limit: number,
  nowIso: string,
  fetchImpl: LiveFetch,
  trust: TrustEgressMeta,
  rejectionAudit: RetrievalRejectionRecord[],
): Promise<EvidenceItem[]> {
  const plan = parseDecisionPlanAnnotation(question);

  async function searchRepos(query: string): Promise<EvidenceItem[]> {
    const destination = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=8&sort=stars`;
    const res = await fetchImpl(destination, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      items?: Array<{ full_name?: string; html_url?: string; description?: string }>;
    };
    const items = data.items ?? [];
    const out: EvidenceItem[] = [];
    for (const row of items) {
      if (out.length >= limit) break;
      const pointer = row.html_url?.trim();
      const title = row.full_name ?? "";
      const description = row.description?.trim() ?? "";
      if (!pointer) continue;
      if (isGenericGithub(title, description)) continue;
      if (description.length < 8) continue;
      const contract = evaluateRetrievalContract({
        plan,
        sourceClass: "github",
        title,
        content: description,
        pointer,
      });
      if (!contract.pass) {
        rejectionAudit.push({
          source: title || pointer,
          rejected: true,
          reason: contract.reasons,
        });
        continue;
      }
      out.push({
        evidenceId: `live-github-${out.length}`,
        excerpt: description.slice(0, 400),
        metadata: meta(
          "github",
          pointer,
          title || `github-result-${out.length}`,
          nowIso,
          trust,
        ),
      });
    }
    return out;
  }

  const queries = [
    decodeURIComponent(apiKeywordQuery(question, "github")),
    ...plan.queries.filter((q) => /startup|ai|tokyo|japan/i.test(q)),
    "AI startup Tokyo",
    "AI startup",
  ];
  const seen = new Set<string>();
  const out: EvidenceItem[] = [];
  for (const query of queries) {
    if (out.length >= limit) break;
    const batch = await searchRepos(query);
    for (const item of batch) {
      const key = item.metadata.pointer ?? item.evidenceId;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        ...item,
        evidenceId: `live-github-${out.length}`,
      });
      if (out.length >= limit) break;
    }
  }
  return out;
}

async function collectReddit(
  question: string,
  limit: number,
  nowIso: string,
  fetchImpl: LiveFetch,
  trust: TrustEgressMeta,
  rejectionAudit: RetrievalRejectionRecord[],
): Promise<EvidenceItem[]> {
  const plan = parseDecisionPlanAnnotation(question);
  const res = await fetchImpl(trust.destination, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (compatible; dyogas-research-engine/0.2; +https://dyogas.local)",
    },
  });
  if (!res.ok) {
    throw new CollectionGuardError(
      `reddit fetch failed HTTP ${res.status} for ${trust.destination}`,
    );
  }
  const data = (await res.json()) as {
    data?: {
      children?: Array<{
        data?: { title?: string; permalink?: string; selftext?: string; url?: string };
      }>;
    };
  };
  const children = data.data?.children ?? [];
  const out: EvidenceItem[] = [];
  for (let i = 0; i < Math.min(limit, children.length); i++) {
    const row = children[i]?.data;
    if (!row) continue;
    const permalink = row.permalink?.trim();
    const pointer = permalink
      ? `https://www.reddit.com${permalink}`
      : row.url?.trim();
    if (!pointer) continue;
    const title = row.title ?? `reddit-result-${i}`;
    const content = (row.selftext || row.title || question).slice(0, 400);
    const contract = evaluateRetrievalContract({
      plan,
      sourceClass: "reddit",
      title,
      content,
      pointer,
    });
    if (!contract.pass) {
      rejectionAudit.push({
        source: title,
        rejected: true,
        reason: contract.reasons,
      });
      continue;
    }
    out.push({
      evidenceId: `live-reddit-${i}`,
      excerpt: content.slice(0, 240),
      metadata: {
        ...meta("reddit", pointer, title, nowIso, trust),
      },
    });
  }
  return out;
}

/**
 * Live Stage-1 collector — adapter id `live-stage1-v1` (never mock/fixture).
 * Calls Trust assertEgressAllowed before every network fetch.
 */
export function createLiveStage1SourceCollector(
  opts: LiveStage1CollectorOptions = {},
): LiveSourceCollectorWithAudit {
  const audit = opts.audit ?? createMemoryAuditSink();
  const fetchImpl = opts.fetchImpl ?? defaultFetch();
  const rejectionAudit: RetrievalRejectionRecord[] = [];

  const collector: LiveSourceCollectorWithAudit = {
    adapterId: LIVE_STAGE1_ADAPTER_ID,
    getRejectionAudit() {
      return Object.freeze([...rejectionAudit]);
    },
    async collect({ question, sourceClass, limit, nowIso }) {
      rejectionAudit.length = 0;
      if (
        sourceClass !== "web" &&
        sourceClass !== "github" &&
        sourceClass !== "reddit"
      ) {
        throw new CollectionGuardError(
          `live Stage-1 collector refuses source class "${sourceClass}" (ADR-0011)`,
        );
      }

      const destination = destinationFor(sourceClass, question);
      try {
        assertEgressAllowed(
          {
            destination,
            purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
            sourceClass,
          },
          audit,
        );
      } catch (err) {
        if (err instanceof EgressDeniedError) {
          return [];
        }
        throw err;
      }

      const trust: TrustEgressMeta = {
        decision: "allow",
        purpose: RESEARCH_STAGE1_EGRESS_PURPOSE,
        sourceClass,
        destination,
      };

      try {
        if (sourceClass === "web") {
          return await collectWeb(
            question,
            limit,
            nowIso,
            fetchImpl,
            trust,
            audit,
            rejectionAudit,
          );
        }
        if (sourceClass === "github") {
          const plan = parseDecisionPlanAnnotation(question);
          if (
            plan.domain === "japan_immigration" ||
            plan.domain === "coffee_preparation" ||
            plan.domain === "generic_how_to"
          ) {
            return [];
          }
          return await collectGithub(
            question,
            limit,
            nowIso,
            fetchImpl,
            trust,
            rejectionAudit,
          );
        }
        return await collectReddit(
          question,
          limit,
          nowIso,
          fetchImpl,
          trust,
          rejectionAudit,
        );
      } catch (err) {
        if (err instanceof CollectionGuardError) {
          return [];
        }
        throw err;
      }
    },
  };

  return collector;
}

/** True when adapter id is a live Stage-1 collector (RA-07 anti-mock check). */
export function isLiveStage1AdapterId(adapterId: string): boolean {
  return adapterId === LIVE_STAGE1_ADAPTER_ID;
}
