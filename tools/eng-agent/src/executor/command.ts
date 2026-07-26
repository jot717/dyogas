/**
 * Command execution abstraction — captures exit code, stdout, stderr.
 */

import { spawnSync } from "node:child_process";
import type { CommandObservation, CommandRunner } from "./types.js";

export const defaultCommandRunner: CommandRunner = ({ command, args, cwd }) => {
  const started = Date.now();
  const result = spawnSync(command, [...args], {
    cwd,
    encoding: "utf8",
    shell: false,
    env: process.env,
  });
  const exitCode =
    typeof result.status === "number"
      ? result.status
      : result.error
        ? 1
        : 0;
  return {
    command,
    args,
    exitCode,
    stdout: result.stdout?.toString() ?? "",
    stderr:
      (result.stderr?.toString() ?? "") +
      (result.error ? `\n${result.error.message}` : ""),
    durationMs: Date.now() - started,
  };
};

/** Allowlisted executable names for harness safety. */
export const ALLOWED_COMMANDS = new Set(["node", "npm"]);

export function assertAllowedCommand(command: string): string | null {
  const base = command.replace(/\\/g, "/").split("/").pop() ?? command;
  if (!ALLOWED_COMMANDS.has(base) && !ALLOWED_COMMANDS.has(command)) {
    return `command not allowlisted: ${command}`;
  }
  return null;
}
