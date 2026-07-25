/**
 * @dyogas/personal-brain — MOD-PERSONAL-BRAIN core + connection layer
 * Product SSOT: specs/SPEC-PRODUCT-MASTER.md. Product UI layer removed.
 */

export {
  PersonalBrainError,
  type UserWorkspace,
  createWorkspace,
  assertWorkspaceBoundary,
} from "./workspace.js";

export {
  type CaptureKind,
  type SourceMetadata,
  type CaptureInput,
  type NormalizedCapture,
  normalizeCapture,
} from "./capture.js";

export {
  type IndexedBrainItem,
  type PersonalIndex,
  createPersonalIndex,
  cosineSimilarity,
  keywordScore,
} from "./index-store.js";

export { type RetrievedHit, type BrainAnswer, askMyBrain } from "./ask.js";

export {
  type CaptureResult,
  type PersonalBrain,
  createPersonalBrain,
} from "./brain.js";

/** Core product service (no HTTP/UI) — workspace, capture, approve, ask proposals, persistence. */
export { PersonalBrainProduct } from "./product/app.js";
export { buildMarkdownArtifact, parseFrontmatter } from "./knowledge/markdown-artifact.js";
export { loadEnv } from "./env.js";

/** Bridge → Host createRun pipeline pin (SPEC-PROD-004 / T-B2). */
export {
  APPROVED_PIPELINE_ID,
  APPROVED_PIPELINE_VERSION,
  KNOWLEDGE_INGESTION_EXECUTION_INTENT,
  approvedPipelinePinForCreateRun,
  selectApprovedPipelineForCreateRun,
  type ApprovedPipelinePin,
} from "./bridge/pipeline-pin.js";

/** Bridge Research Request → Brief bootstrap (C-01). */
export {
  ALLOWED_SOURCE_CLASS_VALUES,
  DEFAULT_ALLOWED_SOURCE_CLASSES,
  DEFAULT_BUDGET_MAX_ITEMS,
  buildResearchBriefBootstrap,
  stampBootstrapRunId,
  type AllowedSourceClass,
  type ResearchRequest,
  type ResearchBriefBootstrap,
  type BridgeCreateRunIdentity,
  type BuiltResearchBrief,
} from "./bridge/research-request.js";

/** Bridge → ExecutionHost.createRun (C-02). */
export {
  createBridgeRun,
  type BridgeExecutionHost,
  type CreateBridgeRunOptions,
  type BridgeCreateRunResult,
} from "./bridge/create-run.js";

/** Bridge Host Research Agent path observe (C-03). */
export {
  STAGE1_RESEARCH_PRODUCER,
  STAGE1_RESEARCH_AGENT_ID,
  STAGE1_RESEARCH_CONTRACT_VERSION,
  hostResearchAgentContractPin,
  assertHostSelectsResearchAgentContract,
  observeResearchAgentPath,
  assertResearchAgentPathReached,
  type ResearchAgentPathObservation,
} from "./bridge/research-agent-path.js";

/** Bridge execute Research via Host (C-04). */
export {
  RESEARCH_REPORT_ARTIFACT_TYPE,
  assertHostResearchReport,
  executeResearchViaHost,
  type ResearchReportProductionMode,
  type HostResearchReportRef,
  type ExecuteResearchViaHostResult,
} from "./bridge/execute-research.js";

/** Persist Host ResearchReport references only (C-05). */
export {
  persistResearchReportReference,
  executeAndPersistResearchViaHost,
  type ExecuteAndPersistResearchOptions,
} from "./bridge/persist-research-report.js";

export {
  createFileResearchReportReferenceStore,
  type StoredResearchReportReference,
  type PersistResearchReportDisposition,
  type PersistResearchReportResult,
  type ResearchReportReferenceStore,
} from "./persist/research-report-ref-store.js";

export type {
  CreateRunRequest,
  HostRun,
  HostRunStatus,
  LineageSnapshot,
} from "@dyogas/execution-host";
