import { requireTrustIdentity } from "../identity/adapter.js";
import type { AuditSink } from "../audit/sink.js";

export type EgressDecision = "allow" | "deny";

/** Purpose token for Research Agent Stage-1 collection (ADR-0011). */
export const RESEARCH_STAGE1_EGRESS_PURPOSE = "research-stage1-collect";

const ADR0011_SOURCE_CLASSES = new Set(["web", "github", "reddit"]);

export interface EgressRequest {
  readonly destination: string;
  readonly purpose: string;
  /** Research Stage-1 source class when purpose is research-stage1-collect. */
  readonly sourceClass?: string;
}

export interface EgressResult {
  readonly decision: EgressDecision;
  readonly reason: string;
}

function isHttpsDestination(destination: string): boolean {
  try {
    const u = new URL(destination);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Evaluate egress (ADR-0002 deny-default + ADR-0011 Stage-1 allow-path).
 *
 * Allow ONLY when:
 * - purpose === research-stage1-collect
 * - sourceClass ∈ {web, github, reddit}
 * - destination is https://
 *
 * All other requests remain deny-by-default.
 */
export function evaluateEgress(
  request: EgressRequest,
  audit?: AuditSink,
): EgressResult {
  requireTrustIdentity();

  let result: EgressResult;

  if (
    request.purpose === RESEARCH_STAGE1_EGRESS_PURPOSE &&
    request.sourceClass != null &&
    ADR0011_SOURCE_CLASSES.has(request.sourceClass) &&
    isHttpsDestination(request.destination)
  ) {
    result = {
      decision: "allow",
      reason: "ADR-0011 Research Stage-1 allow-path",
    };
  } else {
    result = {
      decision: "deny",
      reason:
        "deny-by-default (ADR-0002); no matching ADR-0011 Stage-1 allow predicate",
    };
  }

  if (audit) {
    audit.append({
      type: "egress.decision",
      decision: result.decision,
      destination: request.destination,
      purpose: request.purpose,
      source_class: request.sourceClass ?? "",
      reason: result.reason,
    });
  }
  return result;
}

/** Execute egress only if allowed. */
export function assertEgressAllowed(
  request: EgressRequest,
  audit?: AuditSink,
): void {
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
