import { createMemoryAuditSink, requireTrustIdentity, type AuditSink } from "@dyogas/trust";
import { emitCandidate, bindContract, type CandidateArtifact } from "@dyogas/agent-sdk";
import { runResearchMvp, type ResearchRunResult, type RunResearchOptions } from "./run.js";
import { validateEvidence, type ValidationReport } from "./validate.js";
import { buildProposal, type Proposal } from "./propose.js";

export interface B10PipelineResult {
  readonly research: ResearchRunResult;
  readonly validation: ValidationReport;
  readonly validationCandidate: CandidateArtifact;
  readonly proposal: Proposal;
  readonly proposalCandidate: CandidateArtifact;
  readonly audit: AuditSink;
}

export interface RunB10Options extends RunResearchOptions {
  readonly rubricId?: string;
  readonly painStatement: string;
}

/**
 * B10 path: Research MVP → Validation → Proposal (no SoR, no UI).
 */
export async function runValidationProposalPath(
  opts: RunB10Options,
): Promise<B10PipelineResult> {
  requireTrustIdentity();
  const audit = opts.audit ?? createMemoryAuditSink();
  const research = await runResearchMvp({ ...opts, audit });

  const validation = validateEvidence({
    tenantId: research.task.tenantId,
    researchArtifactId: research.candidate.artifactId,
    rubricId: opts.rubricId ?? "default-v1",
    evidence: research.evidence,
  });

  const validationBinding = bindContract({
    agentId: "source-validation-agent",
    contractVersion: "1.0.0",
    allowedSkills: ["web-research"],
    satisfiedPreconditions: ["tenancy_present"],
  });

  const validationCandidate = emitCandidate(validationBinding, {
    artifactType: "validation-report",
    tenantId: research.task.tenantId,
    payload: { ...validation } as unknown as Record<string, unknown>,
  });

  const proposal = buildProposal({
    tenantId: research.task.tenantId,
    validation,
    painStatement: opts.painStatement,
  });

  const proposalBinding = bindContract({
    agentId: "proposal-agent",
    contractVersion: "1.0.0",
    allowedSkills: ["web-research"],
    satisfiedPreconditions: ["tenancy_present"],
  });

  const proposalCandidate = emitCandidate(proposalBinding, {
    artifactType: "proposal",
    tenantId: research.task.tenantId,
    payload: { ...proposal } as unknown as Record<string, unknown>,
  });

  audit.append({
    type: "research.b10.completed",
    validation_id: validation.reportId,
    proposal_id: proposal.proposalId,
    requires_human_approval: "true",
  });

  return {
    research,
    validation,
    validationCandidate,
    proposal,
    proposalCandidate,
    audit,
  };
}
