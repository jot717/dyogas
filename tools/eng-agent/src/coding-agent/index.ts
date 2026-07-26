/**
 * Coding Agent Adapter public exports.
 */

export type {
  BuildInstructionInput,
  CodingAgentInvokeOptions,
  CodingAgentInvoker,
  CodingAgentObservation,
  CodingAgentResult,
  CodingInstructionPackage,
} from "./types.js";
export { buildCodingInstruction } from "./instruction.js";
export {
  collectChangedFiles,
  diffSnapshots,
  gitDiffChangedFiles,
  hasGitRepo,
  snapshotPaths,
} from "./changes.js";
export {
  cursorSdkInvoker,
  DEFAULT_MODEL_ID,
  resolveApiKey,
} from "./cursor-invoke.js";
export { invokeCodingAgent } from "./adapter.js";
export {
  verifyCodingObservation,
  type CodingVerifierCheck,
  type CodingVerifierResult,
} from "./verify.js";
export {
  runCodingCycle,
  type CodingCycleInput,
  type CodingCycleResult,
  type CodingEvidenceRecord,
} from "./cycle.js";
