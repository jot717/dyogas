/**
 * SPRINT-EXECUTION-HOST-001 — public export (Phase 3: G / I / H)
 */

export {
  HostError,
  HostNotImplementedError,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
} from "./errors.js";

export type {
  CreateRunRequest,
  HostRun,
  HostRunStatus,
  HumanDecision,
  HumanDecisionOutcome,
  LineageSnapshot,
  PipelinePin,
} from "./api.js";

export {
  createExecutionHost,
  type ExecutionHost,
  type CreateExecutionHostOptions,
} from "./host.js";

export type {
  PipelineDefinition,
  PipelineStageDef,
  ImmutablePipelinePin,
} from "./pipeline/types.js";

export {
  loadPipeline,
  parsePipelineMarkdown,
  freezePin,
  assertPinImmutable,
  DEFAULT_PIPELINES_DIR,
} from "./pipeline/loader.js";

export {
  createRuntimeAdapter,
  RUNTIME_SYMBOLS_USED,
  type RuntimeAdapter,
} from "./adapters/runtime.js";

export {
  createSdkAdapter,
  SDK_SYMBOLS_USED,
  type SdkAdapter,
} from "./adapters/sdk.js";

export {
  resolveStageContract,
  listStageContractMap,
  type StageContractPin,
} from "./contracts/stage-map.js";

export {
  runStageExecutor,
  assertSealedHandoff,
  type StageExecutorDeps,
  type ExecutorResult,
  type StageExecuteHooks,
} from "./executor/executor.js";

export {
  defaultHumanGatePause,
  type HumanGatePauseHook,
  type HumanGatePauseState,
} from "./executor/human-gate-pause.js";

export {
  createLineageContext,
  appendLineage,
  assertNotOrphan,
  requireApprovalBeforeApply,
  toLineageSnapshot,
  stageOutputKind,
  computeDigest,
  recordArtifactRef,
  type LineageContext,
} from "./lineage/context.js";

export type {
  LineageRecord,
  LineageAppendInput,
  TrustedArtifactKind,
} from "./lineage/types.js";

export { TRUSTED_PATH_ORDER } from "./lineage/types.js";

export {
  createHostAudit,
  HostAuditType,
  assertAuditOrder,
  type HostAudit,
  type HostAuditFields,
} from "./audit/host-audit.js";

export {
  openHumanGate,
  resumeHumanGate,
  authorizeKnowledgeApply,
  authorizeGraphApply,
  type HumanGateSession,
  type ActorKind,
} from "./gate/human.js";

export {
  createResearchEngineAdapter,
  mapBootstrapToResearchBrief,
  type ResearchEngineAdapter,
  type ResearchEngineAdapterOptions,
} from "./adapters/research-engine.js";

export {
  createSealedArtifactStore,
  type SealedArtifactRecord,
  type SealedArtifactStore,
} from "./artifacts/sealed-store.js";

export {
  validateResearchReportCandidate,
  type SchemaValidationResult,
} from "./validation/research-report.js";

export { executeStage1Research } from "./executor/stage1-research.js";

export {
  mintApplyToken,
  consumeApplyTokenForKnowledge,
  assertTokenUnused,
  type ApplyToken,
} from "./gate/apply-token.js";
