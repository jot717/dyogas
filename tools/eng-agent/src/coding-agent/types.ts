/**
 * Coding Agent Adapter types.
 */

import type { ExecutionPackageView } from "../adapter/types.js";
import type { CommandObservation } from "../executor/types.js";

export interface CodingInstructionPackage {
  taskId: string;
  sprintId: string;
  objective: string;
  acceptanceCriteria: string;
  testRequirements: string;
  allowedPaths: readonly string[];
  forbiddenPaths: readonly string[];
  /** Prompt sent to Cursor Agent. */
  prompt: string;
  /** Relative paths the agent is expected to touch. */
  targetFiles: readonly string[];
  /** Test command to run after the agent returns. */
  verifyCommand: {
    command: string;
    args: readonly string[];
    cwd: string;
  };
  evidencePath: string;
}

export interface CodingAgentInvokeOptions {
  workspaceRoot: string;
  apiKey?: string;
  modelId?: string;
  mode: "dry-run" | "apply";
  /** Injectable for tests — must still perform real work when used in e2e. */
  invoke?: CodingAgentInvoker;
}

export type CodingAgentInvoker = (input: {
  prompt: string;
  cwd: string;
  apiKey: string;
  modelId: string;
}) => Promise<{
  status: string;
  resultText?: string;
  agentId?: string;
  runId?: string;
}>;

export interface CodingAgentObservation {
  taskId: string;
  mode: "dry-run" | "apply";
  instruction: CodingInstructionPackage;
  /** Agent received the instruction (dry-run records prompt only). */
  instructionDelivered: boolean;
  agentStatus?: string;
  agentId?: string;
  runId?: string;
  /** Files that actually changed (git diff or content snapshot). */
  changedFiles: readonly string[];
  changeDetection: "git-diff" | "content-snapshot" | "none";
  verifyCommand?: CommandObservation;
  evidencePath: string;
  evidenceExistsOnDisk: boolean;
}

export type CodingAgentResult =
  | { ok: true; observation: CodingAgentObservation }
  | { ok: false; error: string; observation?: CodingAgentObservation };

export interface BuildInstructionInput {
  pkg: ExecutionPackageView;
  targetFiles: readonly string[];
  allowedPaths: readonly string[];
  verifyCommand: CodingInstructionPackage["verifyCommand"];
  evidencePath: string;
  extraPromptNotes?: string;
}
