/**
 * @dyogas/dev-orch — Development Orchestrator tooling.
 *
 * Process Mode engineering tool under MOD-ENGINEERING.
 * Not a Platform Module. Does not run product pipelines.
 *
 * Spec: SPEC-DEV-ORCH-001 · Auth: DL-DEV-ORCH-002 · Sprint: SPRINT-DEV-ORCH-002
 */

export const PACKAGE_ID = "@dyogas/dev-orch" as const;
export const PACKAGE_VERSION = "0.0.0" as const;

/** Scaffold identity. */
export function getPackageIdentity(): {
  id: typeof PACKAGE_ID;
  version: typeof PACKAGE_VERSION;
  layer: "development-harness";
  platformModule: false;
} {
  return {
    id: PACKAGE_ID,
    version: PACKAGE_VERSION,
    layer: "development-harness",
    platformModule: false,
  };
}

export type {
  ParseErr,
  ParseOk,
  ParseResult,
  RegistryTask,
  TaskRegistry,
  TaskStatusToken,
} from "./types.js";

export type {
  PlannerResult,
  PlannerSelected,
  PlannerStopReason,
  PlannerStopped,
} from "./planner/types.js";

export type {
  EmitErr,
  EmitExecutionPackageInput,
  EmitOk,
  EmitResult,
  ExecutionPackage,
} from "./package/types.js";

export {
  DEFAULT_EXECUTION_MODE,
  DEFAULT_FORBIDDEN_SCOPE,
  DEFAULT_STATUS_TRANSITION,
} from "./package/types.js";

export {
  parseTaskRegistryFile,
  parseTaskRegistryMarkdown,
} from "./parse/registry.js";

export { selectNextTask } from "./planner/select.js";

export {
  emitExecutionPackage,
  emitExecutionPackageFromTask,
  executionPackageToJson,
  executionPackageToMarkdown,
} from "./package/emit.js";

export type {
  GateCheckId,
  GateContext,
  GateFail,
  GatePass,
  GateResult,
  GateViolation,
} from "./gate/types.js";

export {
  extractPathPatterns,
  validateExecutionGate,
} from "./gate/validate.js";

export type {
  ImplementationEvidence,
  VerifierBlocked,
  VerifierCheckId,
  VerifierCheckResult,
  VerifierPass,
  VerifierResult,
} from "./verifier/types.js";

export {
  verifyImplementation,
  verifierResultToJson,
} from "./verifier/engine.js";

export type {
  CollectErr,
  CollectOk,
  CollectResult,
  EvidenceRecord,
  EvidenceTestResult,
  ExecutionResultFacts,
} from "./evidence/types.js";

export {
  collectEvidence,
  evidenceRecordToJson,
} from "./evidence/collector.js";

export type {
  RegistryWriteErr,
  RegistryWriteOk,
  RegistryWriteRequest,
  RegistryWriteResult,
  WritableStatus,
} from "./writer/types.js";

export { WRITE_ALLOWLIST_PREFIXES } from "./writer/types.js";

export {
  WRITE_FORBIDDEN_PREFIXES,
  isForbiddenWritePath,
  isStageEvidencePath,
} from "./writer/allowlist.js";

export {
  applyRegistryUpdate,
  isWriteAllowed,
} from "./writer/update.js";

export type { CliArgs, CliCommand } from "./cli/args.js";
export { parseArgs, CLI_USAGE } from "./cli/args.js";
export type { CliIo, CliResult } from "./cli/commands.js";
export {
  defaultIo,
  dispatchCli,
  runApply,
  runDryRun,
  runPlan,
  runStatus,
} from "./cli/commands.js";
export { main as cliMain } from "./cli/main.js";
export {
  resolveWorkspaceRoot,
  runAutonomous,
  shouldUseAutonomous,
} from "./cli/autonomous.js";
