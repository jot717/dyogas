import type { KnowledgeItem } from "@dyogas/knowledge-engine";
import type { LocalEmbeddingVector } from "@dyogas/graph-engine";
import type { SourceMetadata } from "./capture.js";

export interface IndexedBrainItem {
  readonly knowledgeId: string;
  readonly version: number;
  readonly title: string;
  readonly body: string;
  readonly source: SourceMetadata;
  readonly vector: readonly number[];
  readonly captureId: string;
}

export interface PersonalIndex {
  add(item: IndexedBrainItem): void;
  list(): readonly IndexedBrainItem[];
  get(knowledgeId: string): IndexedBrainItem | undefined;
}

export function createPersonalIndex(): PersonalIndex {
  const byId = new Map<string, IndexedBrainItem>();
  return {
    add(item) {
      byId.set(item.knowledgeId, item);
    },
    list() {
      return [...byId.values()];
    },
    get(knowledgeId) {
      return byId.get(knowledgeId);
    },
  };
}

export function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function keywordScore(query: string, item: IndexedBrainItem): number {
  const q = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  if (q.length === 0) return 0;
  const hay = `${item.title}\n${item.body}`.toLowerCase();
  let hits = 0;
  for (const t of q) {
    if (hay.includes(t)) hits++;
  }
  return hits / q.length;
}

export function fromKnowledge(
  item: KnowledgeItem,
  source: SourceMetadata,
  captureId: string,
  vector: LocalEmbeddingVector | readonly number[],
): IndexedBrainItem {
  const values = Array.isArray(vector)
    ? vector
    : (vector as LocalEmbeddingVector).values;
  return {
    knowledgeId: item.knowledgeId,
    version: item.version,
    title: item.title,
    body: item.body,
    source,
    captureId,
    vector: [...values],
  };
}
