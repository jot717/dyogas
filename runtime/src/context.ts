import { generateId, getClock, requireTenant } from "@dyogas/kernel";
import { requireTrustIdentity, type AuditSink } from "@dyogas/trust";

export class RuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeError";
  }
}

export interface ExecutionContext {
  readonly runId: string;
  readonly pipelineId: string;
  readonly tenantId: string;
  readonly createdAt: string;
  readonly audit: AuditSink;
}

/** Build execution context — requires Kernel tenancy + Trust identity. */
export function createExecutionContext(
  pipelineId: string,
  audit: AuditSink,
): ExecutionContext {
  if (!pipelineId.trim()) throw new RuntimeError("pipelineId required");
  const tenancy = requireTenant();
  const trust = requireTrustIdentity();
  if (tenancy.tenantId !== trust.tenantId) {
    throw new RuntimeError("Kernel tenancy and Trust identity mismatch");
  }
  return {
    runId: generateId(),
    pipelineId,
    tenantId: tenancy.tenantId,
    createdAt: getClock().nowIso(),
    audit,
  };
}
