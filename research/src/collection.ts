/**
 * Governed collection helpers for Research Agent MVP (Band A).
 * No network. No egress. Fail-closed provenance / allowlist / budget.
 */

import type { ResearchBrief, SourceClass } from "./task.js";
import type { EvidenceItem, SourceCollector } from "./sources.js";

export type BudgetOutcome = {
  readonly maxItems: number;
  readonly maxSeconds?: number;
  readonly itemsCollected: number;
  readonly truncatedByItems: boolean;
  readonly truncatedByTime: boolean;
  readonly elapsedMs: number;
};

/** Machine-readable runtime evidence produced by execute() — not hand-authored. */
export type CollectionRunEvidence = {
  readonly kind: "research-collection-run-evidence";
  readonly version: "1.0.0";
  readonly generatedAt: string;
  readonly briefId: string;
  readonly question: string;
  readonly collectorAdapterId: string;
  readonly allowedSourceClasses: readonly SourceClass[];
  readonly budget: BudgetOutcome;
  readonly coverageGaps: readonly string[];
  readonly openQuestions: readonly string[];
  readonly evidence: readonly {
    readonly evidenceId: string;
    readonly sourceClass: SourceClass;
    readonly pointer: string;
    readonly title?: string;
  }[];
};

export class CollectionGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CollectionGuardError";
  }
}

export function isResolvablePointer(pointer: string | undefined | null): boolean {
  return typeof pointer === "string" && pointer.trim().length > 0;
}

export function assertAllowedSourceClass(
  sourceClass: SourceClass,
  allowed: readonly SourceClass[],
): void {
  if (!allowed.includes(sourceClass)) {
    throw new CollectionGuardError(
      `source class "${sourceClass}" is outside allowed_source_classes [${allowed.join(", ")}]`,
    );
  }
}

/**
 * Filter a collector batch: drop empty provenance; refuse foreign source classes.
 * Returns kept items and gap notes for dropped provenance.
 */
export function sanitizeBatch(
  batch: readonly EvidenceItem[],
  allowed: readonly SourceClass[],
): { kept: EvidenceItem[]; gaps: string[] } {
  const kept: EvidenceItem[] = [];
  const gaps: string[] = [];
  for (const item of batch) {
    assertAllowedSourceClass(item.metadata.sourceClass, allowed);
    if (!isResolvablePointer(item.metadata.pointer)) {
      gaps.push(
        `dropped evidence without resolvable provenance.pointer (id=${item.evidenceId})`,
      );
      continue;
    }
    kept.push(item);
  }
  return { kept, gaps };
}

export type CollectUnderBudgetInput = {
  readonly brief: ResearchBrief;
  readonly collector: SourceCollector;
  readonly nowIso: string;
  /** Injectable clock for tests (ms since epoch). */
  readonly nowMs?: () => number;
};

export type CollectUnderBudgetResult = {
  readonly evidence: readonly EvidenceItem[];
  readonly coverageGaps: readonly string[];
  readonly openQuestions: readonly string[];
  readonly budget: BudgetOutcome;
};

/**
 * Collect across allowed source classes with hard budget stops.
 * Does not call the collector for classes outside allowedSourceClasses.
 */
export async function collectUnderBudget(
  input: CollectUnderBudgetInput,
): Promise<CollectUnderBudgetResult> {
  const nowMs = input.nowMs ?? (() => Date.now());
  const started = nowMs();
  const maxItems = input.brief.maxItems;
  const maxSeconds = input.brief.maxSeconds;
  const gaps: string[] = [];
  const openQuestions: string[] = [];
  const collected: EvidenceItem[] = [];
  let truncatedByItems = false;
  let truncatedByTime = false;

  const remaining = () => maxItems - collected.length;
  const timeExceeded = () =>
    maxSeconds != null && (nowMs() - started) / 1000 >= maxSeconds;

  for (const sourceClass of input.brief.allowedSourceClasses) {
    if (remaining() <= 0) {
      truncatedByItems = true;
      break;
    }
    if (timeExceeded()) {
      truncatedByTime = true;
      gaps.push(
        `budget max_seconds=${maxSeconds} exhausted before source class ${sourceClass} was queried`,
      );
      break;
    }

    const batch = await input.collector.collect({
      question: input.brief.question,
      sourceClass,
      limit: remaining(),
      nowIso: input.nowIso,
    });
    const { kept, gaps: batchGaps } = sanitizeBatch(
      batch,
      input.brief.allowedSourceClasses,
    );
    gaps.push(...batchGaps);

    for (const item of kept) {
      if (remaining() <= 0) {
        truncatedByItems = true;
        break;
      }
      if (timeExceeded()) {
        truncatedByTime = true;
        gaps.push(
          `budget max_seconds=${maxSeconds} exhausted during collection`,
        );
        break;
      }
      collected.push(item);
    }
    if (truncatedByItems || truncatedByTime) break;
  }

  if (truncatedByItems) {
    gaps.push(
      `budget max_items=${maxItems} reached; collection truncated`,
    );
  }
  if (collected.length === 0 && gaps.length === 0) {
    gaps.push("no evidence collected");
  }

  const elapsedMs = Math.max(0, nowMs() - started);
  return {
    evidence: collected,
    coverageGaps: gaps,
    openQuestions,
    budget: {
      maxItems,
      maxSeconds,
      itemsCollected: collected.length,
      truncatedByItems,
      truncatedByTime,
      elapsedMs,
    },
  };
}

export function buildCollectionRunEvidence(input: {
  briefId: string;
  brief: ResearchBrief;
  collectorAdapterId: string;
  generatedAt: string;
  evidence: readonly EvidenceItem[];
  coverageGaps: readonly string[];
  openQuestions: readonly string[];
  budget: BudgetOutcome;
}): CollectionRunEvidence {
  return {
    kind: "research-collection-run-evidence",
    version: "1.0.0",
    generatedAt: input.generatedAt,
    briefId: input.briefId,
    question: input.brief.question,
    collectorAdapterId: input.collectorAdapterId,
    allowedSourceClasses: [...input.brief.allowedSourceClasses],
    budget: input.budget,
    coverageGaps: [...input.coverageGaps],
    openQuestions: [...input.openQuestions],
    evidence: input.evidence.map((e) => ({
      evidenceId: e.evidenceId,
      sourceClass: e.metadata.sourceClass,
      pointer: e.metadata.pointer,
      title: e.metadata.title,
    })),
  };
}
