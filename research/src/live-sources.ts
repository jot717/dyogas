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

function destinationFor(
  sourceClass: SourceClass,
  question: string,
): string {
  const q = encodeURIComponent(question.slice(0, 80));
  switch (sourceClass) {
    case "web":
      return `https://example.com/?q=${q}`;
    case "github":
      return `https://api.github.com/search/repositories?q=${q}&per_page=3`;
    case "reddit":
      return `https://www.reddit.com/search.json?q=${q}&limit=3`;
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
        "User-Agent": "dyogas-research-engine/0.2 (ADR-0011 Stage-1)",
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

async function collectWeb(
  question: string,
  limit: number,
  nowIso: string,
  fetchImpl: LiveFetch,
  trust: TrustEgressMeta,
): Promise<EvidenceItem[]> {
  const res = await fetchImpl(trust.destination);
  if (!res.ok) {
    throw new CollectionGuardError(
      `web fetch failed HTTP ${res.status} for ${trust.destination}`,
    );
  }
  const body = await res.text();
  const excerpt = body.replace(/\s+/g, " ").trim().slice(0, 240);
  return [
    {
      evidenceId: `live-web-0`,
      excerpt: excerpt || `Retrieved HTML for question: ${question.slice(0, 80)}`,
      metadata: meta(
        "web",
        trust.destination,
        "example.com live retrieval",
        nowIso,
        trust,
      ),
    },
  ].slice(0, limit);
}

async function collectGithub(
  question: string,
  limit: number,
  nowIso: string,
  fetchImpl: LiveFetch,
  trust: TrustEgressMeta,
): Promise<EvidenceItem[]> {
  const res = await fetchImpl(trust.destination, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new CollectionGuardError(
      `github fetch failed HTTP ${res.status} for ${trust.destination}`,
    );
  }
  const data = (await res.json()) as {
    items?: Array<{ full_name?: string; html_url?: string; description?: string }>;
  };
  const items = data.items ?? [];
  const out: EvidenceItem[] = [];
  for (let i = 0; i < Math.min(limit, items.length); i++) {
    const row = items[i]!;
    const pointer = row.html_url?.trim();
    if (!pointer) continue;
    out.push({
      evidenceId: `live-github-${i}`,
      excerpt: (row.description ?? question).slice(0, 240),
      metadata: meta(
        "github",
        pointer,
        row.full_name ?? `github-result-${i}`,
        nowIso,
        trust,
      ),
    });
  }
  return out;
}

async function collectReddit(
  question: string,
  limit: number,
  nowIso: string,
  fetchImpl: LiveFetch,
  trust: TrustEgressMeta,
): Promise<EvidenceItem[]> {
  const res = await fetchImpl(trust.destination);
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
    out.push({
      evidenceId: `live-reddit-${i}`,
      excerpt: (row.selftext || row.title || question).slice(0, 240),
      metadata: {
        ...meta("reddit", pointer, row.title ?? `reddit-result-${i}`, nowIso, trust),
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
): SourceCollector {
  const audit = opts.audit ?? createMemoryAuditSink();
  const fetchImpl = opts.fetchImpl ?? defaultFetch();

  return {
    adapterId: LIVE_STAGE1_ADAPTER_ID,
    async collect({ question, sourceClass, limit, nowIso }) {
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
          // Per-class deny: return empty; caller records coverage gap / POLICY_DENY
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

      if (sourceClass === "web") {
        return collectWeb(question, limit, nowIso, fetchImpl, trust);
      }
      if (sourceClass === "github") {
        return collectGithub(question, limit, nowIso, fetchImpl, trust);
      }
      return collectReddit(question, limit, nowIso, fetchImpl, trust);
    },
  };
}

/** True when adapter id is a live Stage-1 collector (RA-07 anti-mock check). */
export function isLiveStage1AdapterId(adapterId: string): boolean {
  return adapterId === LIVE_STAGE1_ADAPTER_ID;
}
