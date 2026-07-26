import type { EvidenceItem } from "./sources.js";

export interface EvidenceLedger {
  add(items: readonly EvidenceItem[]): void;
  list(): readonly EvidenceItem[];
  byPointer(pointer: string): EvidenceItem | undefined;
}

export function createEvidenceLedger(): EvidenceLedger {
  const items: EvidenceItem[] = [];
  const seen = new Set<string>();
  return {
    add(batch) {
      for (const item of batch) {
        if (seen.has(item.metadata.pointer)) continue;
        seen.add(item.metadata.pointer);
        items.push(item);
      }
    },
    list() {
      return items.slice();
    },
    byPointer(pointer) {
      return items.find((i) => i.metadata.pointer === pointer);
    },
  };
}
