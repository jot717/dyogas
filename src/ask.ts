import {
  buildLocalEmbeddingJob,
  LOCAL_HASH_DIMENSIONS,
} from "@dyogas/graph-engine";
import {
  cosineSimilarity,
  keywordScore,
  type IndexedBrainItem,
  type PersonalIndex,
} from "./index-store.js";

export interface RetrievedHit {
  readonly knowledgeId: string;
  readonly title: string;
  readonly excerpt: string;
  readonly score: number;
  readonly sourceKind: string;
}

export interface BrainAnswer {
  readonly query: string;
  readonly answer: string;
  readonly citations: readonly { knowledgeId: string; title: string }[];
  readonly hits: readonly RetrievedHit[];
}

function queryVector(query: string): number[] {
  const job = buildLocalEmbeddingJob({
    sources: [
      {
        artifactId: "ask-query",
        artifactVersion: "1",
        artifactType: "Knowledge",
        title: "query",
        body: query,
      },
    ],
  });
  const v = job.vectors[0]?.values;
  if (!v || v.length !== LOCAL_HASH_DIMENSIONS) {
    return [...(v ?? [])];
  }
  return [...v];
}

function excerpt(body: string, max = 180): string {
  const t = body.trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

/** Retrieve related personal knowledge and form an extractive grounded answer. */
export function askMyBrain(
  index: PersonalIndex,
  query: string,
  topK = 3,
): BrainAnswer {
  const q = query.trim();
  if (!q) {
    return {
      query: "",
      answer: "Empty query.",
      citations: [],
      hits: [],
    };
  }

  const qVec = queryVector(q);
  const scored = index.list().map((item) => {
    const sim = cosineSimilarity(qVec, item.vector);
    const kw = keywordScore(q, item);
    const score = sim * 0.65 + kw * 0.35;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, topK);

  if (top.length === 0) {
    return {
      query: q,
      answer: "No related personal knowledge found.",
      citations: [],
      hits: [],
    };
  }

  const hits: RetrievedHit[] = top.map(({ item, score }) => ({
    knowledgeId: item.knowledgeId,
    title: item.title,
    excerpt: excerpt(item.body),
    score,
    sourceKind: item.source.kind,
  }));

  const answer = [
    `Based on ${hits.length} personal knowledge item(s):`,
    ...hits.map(
      (h, i) =>
        `${i + 1}. [${h.title}] ${h.excerpt} (id=${h.knowledgeId})`,
    ),
  ].join("\n");

  return {
    query: q,
    answer,
    citations: hits.map((h) => ({
      knowledgeId: h.knowledgeId,
      title: h.title,
    })),
    hits,
  };
}

export type { IndexedBrainItem };
