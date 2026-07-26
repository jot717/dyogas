import type { SourceClass } from "./task.js";

export interface SourceMetadata {
  readonly sourceClass: SourceClass;
  readonly title: string;
  readonly pointer: string;
  readonly retrievedAt: string;
  readonly adapter: string;
}

export interface EvidenceItem {
  readonly evidenceId: string;
  readonly excerpt: string;
  readonly metadata: SourceMetadata;
}

export interface SourceCollector {
  readonly adapterId: string;
  collect(input: {
    question: string;
    sourceClass: SourceClass;
    limit: number;
    nowIso: string;
  }): Promise<EvidenceItem[]> | EvidenceItem[];
}

/** Mock collector — no network (ADR-0002 deny-default / OOS-T-002). */
export function createMockSourceCollector(): SourceCollector {
  return {
    adapterId: "mock-source-v1",
    collect({ question, sourceClass, limit, nowIso }) {
      const n = Math.min(limit, 2);
      const items: EvidenceItem[] = [];
      for (let i = 0; i < n; i++) {
        items.push({
          evidenceId: `mock-${sourceClass}-${i}`,
          excerpt: `Mock evidence ${i + 1} for: ${question.slice(0, 80)}`,
          metadata: {
            sourceClass: sourceClass === "mock" ? "mock" : sourceClass,
            title: `Mock ${sourceClass} result ${i + 1}`,
            pointer: `mock://${sourceClass}/${i}`,
            retrievedAt: nowIso,
            adapter: "mock-source-v1",
          },
        });
      }
      return items;
    },
  };
}

/**
 * Offline fixture collector — proves SourceCollector substitutability (Band A).
 * No network. Deterministic pointers under fixture://.
 */
export function createFixtureSourceCollector(
  opts: { readonly itemsPerClass?: number } = {},
): SourceCollector {
  const perClass = opts.itemsPerClass ?? 3;
  return {
    adapterId: "fixture-source-v1",
    collect({ question, sourceClass, limit, nowIso }) {
      const n = Math.min(limit, perClass);
      const items: EvidenceItem[] = [];
      for (let i = 0; i < n; i++) {
        items.push({
          evidenceId: `fixture-${sourceClass}-${i}`,
          excerpt: `Fixture evidence ${i + 1} for: ${question.slice(0, 80)}`,
          metadata: {
            sourceClass,
            title: `Fixture ${sourceClass} result ${i + 1}`,
            pointer: `fixture://${sourceClass}/${i}`,
            retrievedAt: nowIso,
            adapter: "fixture-source-v1",
          },
        });
      }
      return items;
    },
  };
}
