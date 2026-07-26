/**
 * CLI argument parsing for `dev-orch`.
 * No LLM / coding agent — orchestration control only.
 */

export type CliCommand = "status" | "plan" | "run" | "help";

export interface CliArgs {
  command: CliCommand;
  registryPath?: string;
  /** run mode: dry-run is default when neither flag set */
  dryRun: boolean;
  apply: boolean;
  /** Force autonomous execution loop (Registry→…→Evidence) */
  autonomous: boolean;
  /** Path to execution plan JSON */
  planPath?: string;
  /** Status transition target for --apply (default IN_PROGRESS) */
  to?: "IN_PROGRESS" | "DONE" | "BLOCKED";
  nextExecutableTaskId?: string | null;
  /** Evidence path required for DONE apply */
  evidencePath?: string;
  /** Explicit write target override (must be allowlisted) */
  writePath?: string;
  /** Explicit task id for apply (required for DONE/BLOCKED on IN_PROGRESS tasks) */
  taskId?: string;
  /** Sprint id for package preview */
  sprintId?: string;
  allowedScope?: string;
  ssotReferences?: string;
  gapRegistry?: string;
  helpText?: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice();
  // drop node + script
  while (args[0] && (args[0].endsWith("node") || args[0].includes("tsx") || args[0].includes("cli"))) {
    // keep going only for typical launcher noise — better: caller passes args after script
    break;
  }

  const positional: string[] = [];
  const flags = new Map<string, string | boolean>();

  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "--") continue;
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq > 0) {
        flags.set(a.slice(2, eq), a.slice(eq + 1));
      } else {
        const key = a.slice(2);
        const next = args[i + 1];
        if (next && !next.startsWith("-")) {
          flags.set(key, next);
          i++;
        } else {
          flags.set(key, true);
        }
      }
    } else if (a.startsWith("-") && a.length === 2) {
      flags.set(a.slice(1), true);
    } else {
      positional.push(a);
    }
  }

  const commandRaw = (positional[0] ?? "help").toLowerCase();
  const command: CliCommand =
    commandRaw === "status" ||
    commandRaw === "plan" ||
    commandRaw === "run" ||
    commandRaw === "help"
      ? commandRaw
      : "help";

  const apply = flags.get("apply") === true;
  const dryRunFlag = flags.get("dry-run") === true;
  const dryRun = apply ? false : dryRunFlag || !apply;
  const autonomous = flags.get("autonomous") === true;

  const toRaw = flags.get("to");
  let to: CliArgs["to"];
  if (typeof toRaw === "string") {
    const u = toRaw.toUpperCase();
    if (u === "IN_PROGRESS" || u === "DONE" || u === "BLOCKED") to = u;
  }

  return {
    command,
    registryPath:
      typeof flags.get("registry") === "string"
        ? (flags.get("registry") as string)
        : positional[1],
    dryRun: command === "run" ? dryRun : true,
    apply: command === "run" ? apply : false,
    autonomous: command === "run" ? autonomous : false,
    planPath:
      typeof flags.get("plan") === "string"
        ? (flags.get("plan") as string)
        : undefined,
    to,
    nextExecutableTaskId:
      typeof flags.get("next") === "string"
        ? (flags.get("next") as string)
        : undefined,
    evidencePath:
      typeof flags.get("evidence") === "string"
        ? (flags.get("evidence") as string)
        : undefined,
    writePath:
      typeof flags.get("write-path") === "string"
        ? (flags.get("write-path") as string)
        : undefined,
    taskId:
      typeof flags.get("task") === "string"
        ? (flags.get("task") as string)
        : undefined,
    sprintId:
      typeof flags.get("sprint") === "string"
        ? (flags.get("sprint") as string)
        : undefined,
    allowedScope:
      typeof flags.get("allowed-scope") === "string"
        ? (flags.get("allowed-scope") as string)
        : undefined,
    ssotReferences:
      typeof flags.get("ssot") === "string"
        ? (flags.get("ssot") as string)
        : undefined,
    gapRegistry:
      typeof flags.get("gap-registry") === "string"
        ? (flags.get("gap-registry") as string)
        : undefined,
    helpText: flags.get("help") === true || command === "help",
  };
}

export const CLI_USAGE = `dev-orch — Development Orchestrator CLI (MOD-ENGINEERING tooling)

Usage:
  dev-orch status --registry <path>
  dev-orch plan --registry <path>
  dev-orch run --registry <path> [--dry-run] [--autonomous] [--plan <path>]
  dev-orch run --registry <path> --apply [--autonomous] [--plan <path>]
  dev-orch run --registry <path> --apply --to IN_PROGRESS|DONE|BLOCKED

Autonomous loop (--autonomous, or when plan.json sits beside the registry):
  Task Registry → Planner → Execution Package → Eng-Agent Executor
  → Tests → Independent Verifier → Evidence

Notes:
  - Default for run is --dry-run (no filesystem mutation).
  - --apply required for mutation (executor writes, evidence, registry).
  - Does not invoke Coding Agents, LLMs, Runtime, SDK, or Execution Host.
`;
