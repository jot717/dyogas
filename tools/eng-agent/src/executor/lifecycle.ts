/**
 * Task execution lifecycle — runs ExecutionPlan steps and captures observations.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  assertAllowedCommand,
  defaultCommandRunner,
} from "./command.js";
import {
  isExecutorWriteAllowed,
  relativeToRoot,
  resolveUnderRoot,
  toPosix,
} from "./paths.js";
import type {
  ExecutePlanResult,
  ExecutionPlan,
  ExecutorContext,
  ExecutorObservation,
  StepObservation,
} from "./types.js";

export function loadExecutionPlan(absPath: string): ExecutionPlan {
  const raw = JSON.parse(readFileSync(absPath, "utf8")) as ExecutionPlan;
  if (!raw.taskId || !Array.isArray(raw.steps) || !raw.evidencePath) {
    throw new Error(`invalid execution plan: ${absPath}`);
  }
  return raw;
}

/**
 * Execute an ExecutionPlan. Dry-run validates and reports would-write / would-run
 * without mutating or spawning. Apply performs real writes and commands.
 */
export async function executePlan(
  plan: ExecutionPlan,
  ctx: ExecutorContext,
): Promise<ExecutePlanResult> {
  const runCommand = ctx.runCommand ?? defaultCommandRunner;
  const writeFile =
    ctx.writeFile ??
    ((abs: string, contents: string) => {
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, contents, "utf8");
    });
  const fileExists = ctx.fileExists ?? ((abs: string) => existsSync(abs));

  const stepObs: StepObservation[] = [];
  const writtenPaths: string[] = [];
  const commandExitCodes: number[] = [];

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i]!;

    if (step.type === "writeFile") {
      if (!isExecutorWriteAllowed(ctx.workspaceRoot, step.path)) {
        const obs: StepObservation = {
          index: i,
          step,
          ok: false,
          error: `write path forbidden: ${step.path}`,
        };
        stepObs.push(obs);
        return {
          ok: false,
          error: obs.error!,
          observation: finalize(
            plan,
            ctx.mode,
            stepObs,
            writtenPaths,
            commandExitCodes,
            false,
          ),
        };
      }

      const abs = resolveUnderRoot(ctx.workspaceRoot, step.path);
      const rel = toPosix(relativeToRoot(ctx.workspaceRoot, abs));

      if (ctx.mode === "dry-run") {
        writtenPaths.push(rel);
        stepObs.push({
          index: i,
          step,
          ok: true,
          write: {
            path: rel,
            bytesWritten: Buffer.byteLength(step.contents, "utf8"),
            existedAfter: false,
          },
        });
        continue;
      }

      writeFile(abs, step.contents);
      const existedAfter = fileExists(abs);
      writtenPaths.push(rel);
      stepObs.push({
        index: i,
        step,
        ok: existedAfter,
        write: {
          path: rel,
          bytesWritten: Buffer.byteLength(step.contents, "utf8"),
          existedAfter,
        },
        error: existedAfter ? undefined : "file missing after write",
      });
      if (!existedAfter) {
        return {
          ok: false,
          error: `write did not persist: ${rel}`,
          observation: finalize(
            plan,
            ctx.mode,
            stepObs,
            writtenPaths,
            commandExitCodes,
            false,
          ),
        };
      }
      continue;
    }

    if (step.type === "runCommand" || step.type === "runTest") {
      const command = step.type === "runTest" ? "node" : step.command;
      const args =
        step.type === "runTest" ? ["--test", ...step.targets] : step.args;
      const cwdRel = step.cwd ?? ".";
      const cwdAbs = resolveUnderRoot(ctx.workspaceRoot, cwdRel);

      const denied = assertAllowedCommand(command);
      if (denied) {
        stepObs.push({ index: i, step, ok: false, error: denied });
        return {
          ok: false,
          error: denied,
          observation: finalize(
            plan,
            ctx.mode,
            stepObs,
            writtenPaths,
            commandExitCodes,
            false,
          ),
        };
      }

      // Bound test targets to allowlisted write roots (no arbitrary FS)
      if (step.type === "runTest") {
        for (const t of step.targets) {
          if (!isExecutorWriteAllowed(ctx.workspaceRoot, t)) {
            const err = `test target outside allowlist: ${t}`;
            stepObs.push({ index: i, step, ok: false, error: err });
            return {
              ok: false,
              error: err,
              observation: finalize(
                plan,
                ctx.mode,
                stepObs,
                writtenPaths,
                commandExitCodes,
                false,
              ),
            };
          }
        }
      }

      if (ctx.mode === "dry-run") {
        stepObs.push({
          index: i,
          step,
          ok: true,
          command: {
            command,
            args,
            exitCode: 0,
            stdout: "(dry-run: not executed)",
            stderr: "",
            durationMs: 0,
          },
        });
        continue;
      }

      const cmdObs = await runCommand({ command, args, cwd: cwdAbs });
      commandExitCodes.push(cmdObs.exitCode);
      const ok = cmdObs.exitCode === 0;
      stepObs.push({
        index: i,
        step,
        ok,
        command: cmdObs,
        error: ok ? undefined : `exit code ${cmdObs.exitCode}`,
      });
      if (!ok) {
        return {
          ok: false,
          error: `command failed: ${command} ${args.join(" ")} (exit ${cmdObs.exitCode})`,
          observation: finalize(
            plan,
            ctx.mode,
            stepObs,
            writtenPaths,
            commandExitCodes,
            false,
          ),
        };
      }
    }
  }

  const observation = finalize(
    plan,
    ctx.mode,
    stepObs,
    writtenPaths,
    commandExitCodes,
    true,
  );
  return { ok: true, observation };
}

function finalize(
  plan: ExecutionPlan,
  mode: "dry-run" | "apply",
  steps: StepObservation[],
  writtenPaths: string[],
  commandExitCodes: number[],
  allStepsOk: boolean,
): ExecutorObservation {
  return {
    taskId: plan.taskId,
    mode,
    steps,
    commandExitCodes,
    writtenPaths,
    evidencePath: plan.evidencePath,
    evidenceExistsOnDisk: false,
    allStepsOk,
  };
}
