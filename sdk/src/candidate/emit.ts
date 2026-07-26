import { generateId } from "@dyogas/kernel";
import type { AgentContractBinding } from "../contract/bind.js";

export interface CandidateArtifact {
  readonly artifactId: string;
  readonly version: string;
  readonly sealed: false;
  readonly artifactType: string;
  readonly producedBy: string;
  readonly contractVersion: string;
  readonly payload: Record<string, unknown>;
  readonly tenantId: string;
}

export class CandidateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CandidateError";
  }
}

/**
 * Emit an unsealed candidate for Runtime/Harness seal.
 * SDK never marks sealed=true (ADR-0004).
 */
export function emitCandidate(
  binding: AgentContractBinding,
  opts: {
    artifactType: string;
    tenantId: string;
    payload: Record<string, unknown>;
  },
): CandidateArtifact {
  if (!opts.artifactType.trim()) throw new CandidateError("artifactType required");
  if (!opts.tenantId.trim()) throw new CandidateError("tenantId required");
  return {
    artifactId: generateId(),
    version: "candidate",
    sealed: false,
    artifactType: opts.artifactType,
    producedBy: binding.agentId,
    contractVersion: binding.contractVersion,
    payload: opts.payload,
    tenantId: opts.tenantId,
  };
}
