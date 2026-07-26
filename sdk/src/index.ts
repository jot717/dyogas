/**
 * @dyogas/agent-sdk — SPEC-RT-003 / ADR-0004
 * Binds contracts; does not replace Runtime.
 */

export {
  type AgentContractBinding,
  type BindRequest,
  ContractBindError,
  bindContract,
} from "./contract/bind.js";

export {
  type SkillHandler,
  SkillError,
  invokeSkill,
} from "./skill/allowlist.js";

export {
  type ToolDefinition,
  ToolError,
  ToolRegistry,
} from "./tools/registry.js";

export {
  type MemoryRecord,
  type AgentMemory,
  MemoryContractError,
  createAgentMemory,
} from "./memory/contract.js";

export {
  type CandidateArtifact,
  CandidateError,
  emitCandidate,
} from "./candidate/emit.js";
