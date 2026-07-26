/**
 * @dyogas/eng-agent — Development Harness Engineering Agent tooling.
 *
 * MOD-ENGINEERING build-side tool. Not a Platform Module.
 * Not Hosted MOD-ENG-AGENTS / B17.
 *
 * Auth: DL-ENG-AGENT-IMPLEMENTATION-001 · DL-ENG-AGENT-AUTONOMOUS-EXECUTION-001
 */

export const PACKAGE_ID = "@dyogas/eng-agent" as const;
export const PACKAGE_VERSION = "0.0.0" as const;

export function getPackageIdentity(): {
  id: typeof PACKAGE_ID;
  version: typeof PACKAGE_VERSION;
  layer: "development-harness";
  platformModule: false;
  hostedEngAgents: false;
} {
  return {
    id: PACKAGE_ID,
    version: PACKAGE_VERSION,
    layer: "development-harness",
    platformModule: false,
    hostedEngAgents: false,
  };
}

export type {
  AuthorizedExecution,
  AuthorizeResult,
  ExecutionAgentInput,
  ExecutionFacts,
  ExecutionRefuse,
  ExecutionResult,
} from "./agent/types.js";
export { authorize, authorizeAndExecute } from "./agent/execute.js";

export type {
  AdaptedTask,
  AdaptErr,
  AdaptOk,
  AdaptResult,
  ExecutionPackageView,
  GateView,
} from "./adapter/types.js";
export { adaptExecutionPackage } from "./adapter/adapt.js";

export type {
  VerifierFeed,
  VerifierFeedResult,
  VerifierRecommendation,
} from "./verifier/types.js";
export { buildVerifierFeed, recommendFromFacts } from "./verifier/feed.js";

export type {
  IndependentCheck,
  IndependentRecommendation,
  IndependentVerifierResult,
  IndependentVerifyInput,
} from "./verifier/independent.js";
export { verifyIndependently } from "./verifier/independent.js";

export type {
  EvidenceWriteMode,
  EvidenceWriteRequest,
  EvidenceWriteResult,
  EngAgentEvidenceRecord,
} from "./evidence/types.js";
export {
  WRITE_ALLOWLIST_PREFIXES,
  WRITE_FORBIDDEN_PREFIXES,
  isForbiddenWritePath,
  isWriteAllowed,
} from "./evidence/allowlist.js";
export {
  collectEngAgentEvidence,
  writeEvidence,
} from "./evidence/writer.js";

export type {
  DevOrchHandoff,
  HandoffResult,
} from "./integration/types.js";
export { buildDevOrchHandoff } from "./integration/handoff.js";

export type {
  CommandObservation,
  CommandRunner,
  ExecutePlanResult,
  ExecutionPlan,
  ExecutionStep,
  ExecutorContext,
  ExecutorObservation,
  StepObservation,
  WriteObservation,
} from "./executor/types.js";
export {
  ALLOWED_COMMANDS,
  assertAllowedCommand,
  defaultCommandRunner,
} from "./executor/command.js";
export {
  EXECUTOR_FORBIDDEN_PREFIXES,
  EXECUTOR_WRITE_PREFIXES,
  isExecutorWriteAllowed,
} from "./executor/paths.js";
export { executePlan, loadExecutionPlan } from "./executor/lifecycle.js";

export type {
  AutonomousCycleInput,
  AutonomousCycleResult,
  AutonomousEvidenceRecord,
} from "./autonomous.js";
export { runAutonomousCycle } from "./autonomous.js";

export type {
  BuildInstructionInput,
  CodingAgentInvokeOptions,
  CodingAgentInvoker,
  CodingAgentObservation,
  CodingAgentResult,
  CodingInstructionPackage,
  CodingCycleInput,
  CodingCycleResult,
  CodingEvidenceRecord,
  CodingVerifierCheck,
  CodingVerifierResult,
} from "./coding-agent/index.js";
export {
  buildCodingInstruction,
  collectChangedFiles,
  cursorSdkInvoker,
  DEFAULT_MODEL_ID,
  invokeCodingAgent,
  resolveApiKey,
  resolveCodingForbiddenPaths,
  RESEARCH_WRITE_EXCEPTIONS,
  runCodingCycle,
  verifyCodingObservation,
} from "./coding-agent/index.js";
