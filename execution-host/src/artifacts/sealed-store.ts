/**
 * Host-local sealed artifact persistence (Stage-1 ResearchReport payloads).
 * Complements Runtime sealArtifact refs with resolvable payload bodies.
 */

export type SealedArtifactRecord = {
  readonly artifact_id: string;
  readonly version: string;
  readonly tenant_id: string;
  readonly kind: "ResearchReport";
  readonly payload: Record<string, unknown>;
  readonly produced_by: string;
  readonly contract_version: string;
  readonly run_id: string;
  readonly brief_ref: string;
  readonly sealed: true;
  readonly schema_ok: true;
};

export type SealedArtifactStore = {
  readonly put: (record: SealedArtifactRecord) => void;
  readonly get: (
    artifactId: string,
    tenantId: string,
  ) => SealedArtifactRecord | undefined;
};

export function createSealedArtifactStore(): SealedArtifactStore {
  const byKey = new Map<string, SealedArtifactRecord>();
  return {
    put(record) {
      byKey.set(`${record.tenant_id}::${record.artifact_id}`, record);
    },
    get(artifactId, tenantId) {
      return byKey.get(`${tenantId}::${artifactId}`);
    },
  };
}
