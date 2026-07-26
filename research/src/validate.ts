import { generateId, getClock } from "@dyogas/kernel";
import type { EvidenceItem } from "./sources.js";

export type ValidationStatus = "accepted" | "rejected" | "needs_human";
export type TrustTier = "high" | "medium" | "low" | "untrusted";

export interface ValidationResultItem {
  readonly evidenceId: string;
  readonly status: ValidationStatus;
  readonly trustTier: TrustTier;
  readonly rationale: string;
  readonly riskFlags: readonly string[];
}

export interface ValidationReport {
  readonly reportId: string;
  readonly rubricId: string;
  readonly researchArtifactId: string;
  readonly tenantId: string;
  readonly results: readonly ValidationResultItem[];
  readonly createdAt: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const KNOWN_RUBRICS = new Set(["default-v1", "strict-v1"]);

/**
 * Full-coverage validation: every evidence id gets exactly one result.
 * Mock heuristic: empty excerpt → rejected; pointer mock://… → accepted medium.
 */
export function validateEvidence(opts: {
  readonly tenantId: string;
  readonly researchArtifactId: string;
  readonly rubricId: string;
  readonly evidence: readonly EvidenceItem[];
}): ValidationReport {
  if (!KNOWN_RUBRICS.has(opts.rubricId)) {
    throw new ValidationError(`unknown rubric: ${opts.rubricId}`);
  }
  if (!opts.researchArtifactId.trim()) {
    throw new ValidationError("researchArtifactId required");
  }

  const results: ValidationResultItem[] = opts.evidence.map((item) => {
    if (!item.excerpt.trim()) {
      return {
        evidenceId: item.evidenceId,
        status: "rejected" as const,
        trustTier: "untrusted" as const,
        rationale: "empty excerpt",
        riskFlags: ["empty_excerpt"],
      };
    }
    if (opts.rubricId === "strict-v1" && item.metadata.sourceClass === "reddit") {
      return {
        evidenceId: item.evidenceId,
        status: "needs_human" as const,
        trustTier: "low" as const,
        rationale: "strict rubric escalates reddit",
        riskFlags: ["community_source"],
      };
    }
    return {
      evidenceId: item.evidenceId,
      status: "accepted" as const,
      trustTier: "medium" as const,
      rationale: "mock rubric accept",
      riskFlags: [],
    };
  });

  const seen = new Set(results.map((r) => r.evidenceId));
  if (seen.size !== opts.evidence.length) {
    throw new ValidationError("validation coverage incomplete");
  }

  return {
    reportId: generateId(),
    rubricId: opts.rubricId,
    researchArtifactId: opts.researchArtifactId,
    tenantId: opts.tenantId,
    results,
    createdAt: getClock().nowIso(),
  };
}

export function acceptedEvidenceIds(report: ValidationReport): string[] {
  return report.results.filter((r) => r.status === "accepted").map((r) => r.evidenceId);
}
