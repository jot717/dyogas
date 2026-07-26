import { generateId, getClock } from "@dyogas/kernel";
import type { ValidationReport } from "./validate.js";
import { acceptedEvidenceIds } from "./validate.js";

export interface ProposalOption {
  readonly optionId: string;
  readonly summary: string;
  readonly tradeoffs: string;
  readonly recommended?: boolean;
}

export interface ProposalCitation {
  readonly citationKey: string;
  readonly evidenceId: string;
}

export interface Proposal {
  readonly proposalId: string;
  readonly tenantId: string;
  readonly validationReportId: string;
  readonly painStatement: string;
  readonly kind: "knowledge";
  readonly options: readonly ProposalOption[];
  readonly successMetrics: readonly string[];
  readonly nonGoals: readonly string[];
  readonly citations: readonly ProposalCitation[];
  readonly requiresHumanApproval: true;
  readonly createdAt: string;
}

export class ProposalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProposalError";
  }
}

/**
 * Build a decision-ready proposal from accepted validation results only.
 */
export function buildProposal(opts: {
  readonly tenantId: string;
  readonly validation: ValidationReport;
  readonly painStatement: string;
  readonly constraints?: Record<string, string>;
}): Proposal {
  const pain = opts.painStatement.trim();
  if (!pain) {
    throw new ProposalError("pain_statement required (Art. XII)");
  }

  const accepted = acceptedEvidenceIds(opts.validation);
  if (accepted.length === 0) {
    throw new ProposalError("no accepted evidence for proposal");
  }

  const rejected = new Set(
    opts.validation.results.filter((r) => r.status === "rejected").map((r) => r.evidenceId),
  );

  const citations: ProposalCitation[] = accepted.map((evidenceId, i) => ({
    citationKey: `c${i + 1}`,
    evidenceId,
  }));

  for (const c of citations) {
    if (rejected.has(c.evidenceId)) {
      throw new ProposalError("citation must not reference rejected evidence");
    }
  }

  void opts.constraints;

  return {
    proposalId: generateId(),
    tenantId: opts.tenantId,
    validationReportId: opts.validation.reportId,
    painStatement: pain,
    kind: "knowledge",
    options: [
      {
        optionId: "opt-ingest",
        summary: "Ingest accepted evidence into local Knowledge SoR after human approval",
        tradeoffs: "Adds review latency; avoids silent SoR writes",
        recommended: true,
      },
      {
        optionId: "opt-defer",
        summary: "Defer ingestion and keep evidence as research-only candidates",
        tradeoffs: "No knowledge growth; lowest risk",
      },
    ],
    successMetrics: [
      "Human Approval recorded before any SoR apply",
      "≥1 accepted citation retained in sealed proposal",
    ],
    nonGoals: [
      "Live cloud AI rewrite of evidence",
      "Automatic SoR mutation without Human Approval",
    ],
    citations,
    requiresHumanApproval: true,
    createdAt: getClock().nowIso(),
  };
}
