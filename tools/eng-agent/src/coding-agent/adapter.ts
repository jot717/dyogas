/**
 * Coding Agent Adapter — invoke Cursor Agent and observe results.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defaultCommandRunner, assertAllowedCommand } from "../executor/command.js";
import {
  collectChangedFiles,
  snapshotPaths,
} from "./changes.js";
import {
  cursorSdkInvoker,
  DEFAULT_MODEL_ID,
  resolveApiKey,
} from "./cursor-invoke.js";
import type {
  CodingAgentInvokeOptions,
  CodingAgentObservation,
  CodingAgentResult,
  CodingInstructionPackage,
} from "./types.js";

/**
 * Invoke the coding agent with a prepared instruction package.
 * Dry-run delivers instruction metadata only (no Cursor call, no mutation).
 * Apply requires CURSOR_API_KEY and performs a real Agent.prompt.
 */
export async function invokeCodingAgent(
  instruction: CodingInstructionPackage,
  options: CodingAgentInvokeOptions,
): Promise<CodingAgentResult> {
  const watched = [
    ...new Set([...instruction.targetFiles, ...instruction.allowedPaths]),
  ];
  const before = snapshotPaths(options.workspaceRoot, watched);

  if (options.mode === "dry-run") {
    const observation: CodingAgentObservation = {
      taskId: instruction.taskId,
      mode: "dry-run",
      instruction,
      instructionDelivered: true,
      changedFiles: [],
      changeDetection: "none",
      evidencePath: instruction.evidencePath,
      evidenceExistsOnDisk: false,
    };
    return { ok: true, observation };
  }

  const apiKey = resolveApiKey(options.apiKey, options.workspaceRoot);
  if (!apiKey) {
    return {
      ok: false,
      error:
        "CURSOR_API_KEY missing — cannot invoke Cursor Coding Agent (no mock fallback)",
    };
  }

  const invoker = options.invoke ?? cursorSdkInvoker;
  const modelId = options.modelId ?? DEFAULT_MODEL_ID;

  let agentStatus = "unknown";
  let agentId: string | undefined;
  let runId: string | undefined;

  try {
    const agentResult = await invoker({
      prompt: instruction.prompt,
      cwd: options.workspaceRoot,
      apiKey,
      modelId,
    });
    agentStatus = agentResult.status;
    agentId = agentResult.agentId;
    runId = agentResult.runId;
    if (agentStatus === "error" || agentStatus === "cancelled") {
      return {
        ok: false,
        error: `Cursor Agent run status=${agentStatus}`,
        observation: {
          taskId: instruction.taskId,
          mode: "apply",
          instruction,
          instructionDelivered: true,
          agentStatus,
          agentId,
          runId,
          changedFiles: [],
          changeDetection: "none",
          evidencePath: instruction.evidencePath,
          evidenceExistsOnDisk: false,
        },
      };
    }
  } catch (err) {
    return {
      ok: false,
      error: `Cursor Agent invoke failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  const { changedFiles, method } = collectChangedFiles({
    workspaceRoot: options.workspaceRoot,
    allowPrefixes: instruction.allowedPaths,
    watchedPaths: watched,
    before,
  });

  const denied = assertAllowedCommand(instruction.verifyCommand.command);
  if (denied) {
    return { ok: false, error: denied };
  }

  const cwdAbs = resolve(
    options.workspaceRoot,
    instruction.verifyCommand.cwd || ".",
  );
  const verifyCommand = await defaultCommandRunner({
    command: instruction.verifyCommand.command,
    args: instruction.verifyCommand.args,
    cwd: cwdAbs,
  });

  const evidenceAbs = resolve(
    options.workspaceRoot,
    instruction.evidencePath,
  );

  const observation: CodingAgentObservation = {
    taskId: instruction.taskId,
    mode: "apply",
    instruction,
    instructionDelivered: true,
    agentStatus,
    agentId,
    runId,
    changedFiles,
    changeDetection: method,
    verifyCommand,
    evidencePath: instruction.evidencePath,
    evidenceExistsOnDisk: existsSync(evidenceAbs),
  };

  return { ok: true, observation };
}
