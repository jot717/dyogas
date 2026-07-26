export interface ArtifactRef {
  readonly artifact_id: string;
  readonly artifact_version: string;
}

export interface GraphNode {
  readonly node_id: string;
  readonly label: string;
  readonly types: readonly string[];
  readonly provenance: readonly string[];
}

export interface GraphEdge {
  readonly edge_id: string;
  readonly from: string;
  readonly to: string;
  readonly relation: string;
  readonly provenance: readonly string[];
}

export interface ConsistencyReport {
  readonly ok: boolean;
  readonly issues: readonly string[];
}

/** GraphUpdate payload — unsealed candidate body (schemas/artifacts/graph-update). */
export interface GraphUpdate {
  readonly knowledge_ref: ArtifactRef;
  readonly ontology_profile_id: string;
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly consistency_report: ConsistencyReport;
  readonly mode: "propose" | "apply";
}

export interface SourceRef {
  readonly artifact_id: string;
  readonly artifact_version: string;
  readonly artifact_type: string;
}

export interface ChunkMapEntry {
  readonly chunk_id: string;
  readonly source_artifact_id: string;
  readonly span: string;
  readonly vector_id?: string;
}

export interface Invalidation {
  readonly vector_id: string;
  readonly reason: string;
}

/** EmbeddingJob payload — unsealed candidate body. */
export interface EmbeddingJob {
  readonly source_refs: readonly SourceRef[];
  readonly profile_id: string;
  readonly chunk_map: readonly ChunkMapEntry[];
  readonly status: "queued" | "succeeded" | "failed" | "partial";
  readonly invalidations: readonly Invalidation[];
}

/** Local deterministic vector — not a cloud embedding (OOS-KN-003 / OOS-T-002). */
export interface LocalEmbeddingVector {
  readonly vectorId: string;
  readonly profileId: string;
  readonly dimensions: number;
  readonly values: readonly number[];
}
