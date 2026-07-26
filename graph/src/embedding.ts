import { createHash } from "node:crypto";
import { GraphError } from "./ontology.js";
import type {
  ChunkMapEntry,
  EmbeddingJob,
  LocalEmbeddingVector,
  SourceRef,
} from "./types.js";

/** Local hash embedding profile — no cloud vendor SDK (OOS-KN-003 / OOS-T-002). */
export const LOCAL_HASH_PROFILE_ID = "embed-profile-local-hash-v1";
export const LOCAL_HASH_DIMENSIONS = 32;

const AUTHORIZED = new Set([LOCAL_HASH_PROFILE_ID]);

function hashToUnitFloats(seed: string, dims: number): number[] {
  const out: number[] = [];
  let counter = 0;
  while (out.length < dims) {
    const digest = createHash("sha256")
      .update(`${seed}:${counter}`)
      .digest();
    for (let i = 0; i + 3 < digest.length && out.length < dims; i += 4) {
      const u =
        ((digest[i]! << 24) |
          (digest[i + 1]! << 16) |
          (digest[i + 2]! << 8) |
          digest[i + 3]!) >>>
        0;
      out.push(u / 0xffffffff);
    }
    counter += 1;
  }
  return out;
}

export interface EmbedSourceContent {
  readonly artifactId: string;
  readonly artifactVersion: string;
  readonly artifactType: "Knowledge" | "GraphUpdate";
  readonly title: string;
  readonly body: string;
}

export interface BuildEmbeddingJobOptions {
  readonly sources: readonly EmbedSourceContent[];
  readonly profileId?: string;
  readonly priorVectorIds?: readonly string[];
}

export interface EmbeddingPathResult {
  readonly job: EmbeddingJob;
  readonly vectors: readonly LocalEmbeddingVector[];
}

/**
 * Deterministic local embedding path — hash-based float arrays + EmbeddingJob candidate body.
 */
export function buildLocalEmbeddingJob(
  opts: BuildEmbeddingJobOptions,
): EmbeddingPathResult {
  const profileId = opts.profileId ?? LOCAL_HASH_PROFILE_ID;
  if (!AUTHORIZED.has(profileId)) {
    throw new GraphError(`unauthorized embedding profile: ${profileId}`);
  }
  if (opts.sources.length < 1) {
    throw new GraphError("source_refs minItems 1");
  }

  const source_refs: SourceRef[] = opts.sources.map((s) => ({
    artifact_id: s.artifactId,
    artifact_version: s.artifactVersion,
    artifact_type: s.artifactType,
  }));

  const chunk_map: ChunkMapEntry[] = [];
  const vectors: LocalEmbeddingVector[] = [];

  for (const s of opts.sources) {
    const chunks: { span: string; text: string }[] = [
      { span: "## Title", text: s.title },
      { span: "## Body", text: s.body },
    ];
    for (const [i, chunk] of chunks.entries()) {
      const chunk_id = `${s.artifactId}#chunk-${i}`;
      const vector_id = `vec_${createHash("sha256")
        .update(`${profileId}:${chunk_id}:${chunk.text}`)
        .digest("hex")
        .slice(0, 24)}`;
      const values = hashToUnitFloats(`${profileId}:${chunk.text}`, LOCAL_HASH_DIMENSIONS);
      chunk_map.push({
        chunk_id,
        source_artifact_id: s.artifactId,
        span: chunk.span,
        vector_id,
      });
      vectors.push({
        vectorId: vector_id,
        profileId,
        dimensions: LOCAL_HASH_DIMENSIONS,
        values: Object.freeze(values),
      });
    }
  }

  const invalidations = (opts.priorVectorIds ?? []).map((vector_id) => ({
    vector_id,
    reason: "source_superseded",
  }));

  const job: EmbeddingJob = {
    source_refs,
    profile_id: profileId,
    chunk_map,
    status: "succeeded",
    invalidations,
  };

  return { job, vectors: Object.freeze(vectors) };
}
