/**
 * @dyogas/research-engine — MOD-RESEARCH / SPEC-ENGIN-001 / ADR-0005
 */

export {
  type SourceClass,
  type ResearchBrief,
  type ResearchTask,
  ResearchError,
  createResearchTask,
} from "./task.js";

export {
  type SourceMetadata,
  type EvidenceItem,
  type SourceCollector,
  createMockSourceCollector,
  createFixtureSourceCollector,
} from "./sources.js";

export {
  type BudgetOutcome,
  type CollectionRunEvidence,
  type CollectUnderBudgetInput,
  type CollectUnderBudgetResult,
  CollectionGuardError,
  isResolvablePointer,
  assertAllowedSourceClass,
  sanitizeBatch,
  collectUnderBudget,
  buildCollectionRunEvidence,
} from "./collection.js";

export {
  type EvidenceLedger,
  createEvidenceLedger,
} from "./evidence.js";

export {
  type ApprovalDecision,
  type HumanApprovalHandoff,
  createPendingApprovalHandoff,
} from "./approval.js";

export {
  type KnowledgeHandoffContract,
  buildKnowledgeHandoff,
} from "./knowledge-handoff.js";

export {
  type ResearchRunResult,
  type RunResearchOptions,
  runResearchMvp,
} from "./run.js";

export {
  type ResearchReportCandidate,
  type ExecuteResearchOptions,
  type ResearchExecuteResult,
  execute,
} from "./execute.js";

export {
  type ValidationStatus,
  type TrustTier,
  type ValidationResultItem,
  type ValidationReport,
  ValidationError,
  validateEvidence,
  acceptedEvidenceIds,
} from "./validate.js";

export {
  type ProposalOption,
  type ProposalCitation,
  type Proposal,
  ProposalError,
  buildProposal,
} from "./propose.js";

export {
  type B10PipelineResult,
  type RunB10Options,
  runValidationProposalPath,
} from "./b10-pipeline.js";
