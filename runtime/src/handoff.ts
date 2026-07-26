export interface ArtifactRef {
  readonly artifactId: string;
  readonly version: string;
  readonly sealed: boolean;
  readonly schemaOk: boolean;
  readonly tenantId: string;
}

export class HandoffError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HandoffError";
  }
}

/** Seal a candidate artifact (immutable version). */
export function sealArtifact(
  artifactId: string,
  version: string,
  tenantId: string,
  schemaOk: boolean,
): ArtifactRef {
  if (!schemaOk) throw new HandoffError("cannot seal schema-invalid artifact");
  return { artifactId, version, sealed: true, schemaOk: true, tenantId };
}

/**
 * Accept handoff only if sealed, schema OK, and same tenancy.
 * Consumers never operate on unsealed candidates (Harness §6).
 */
export function acceptHandoff(
  artifact: ArtifactRef,
  consumerTenantId: string,
): ArtifactRef {
  if (!artifact.sealed) throw new HandoffError("unsealed artifact rejected");
  if (!artifact.schemaOk) throw new HandoffError("schema-invalid handoff rejected");
  if (artifact.tenantId !== consumerTenantId) {
    throw new HandoffError("TENANCY_VIOLATION");
  }
  return artifact;
}
