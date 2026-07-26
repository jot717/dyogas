import { requireTrustIdentity } from "../identity/adapter.js";
import type { AuditSink } from "../audit/sink.js";

export type EgressDecision = "allow" | "deny";

export interface EgressRequest {
  readonly destination: string;
  readonly purpose: string;
}

export interface EgressResult {
  readonly decision: EgressDecision;
  readonly reason: string;
}

/**
 * Deny-by-default egress gate (ADR-0002).
 * No allow-policy exists in MVP — every request is denied.
 */
export function evaluateEgress(
  request: EgressRequest,
  audit?: AuditSink,
): EgressResult {
  requireTrustIdentity();
  const result: EgressResult = {
    decision: "deny",
    reason: "deny-by-default (ADR-0002); no allow policy configured",
  };
  if (audit) {
    audit.append({
      type: "egress.decision",
      decision: result.decision,
      destination: request.destination,
      purpose: request.purpose,
      reason: result.reason,
    });
  }
  return result;
}

/** Execute egress only if allowed — MVP always throws. */
export function assertEgressAllowed(request: EgressRequest, audit?: AuditSink): void {
  const r = evaluateEgress(request, audit);
  if (r.decision !== "allow") {
    throw new EgressDeniedError(r.reason);
  }
}

export class EgressDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EgressDeniedError";
  }
}
