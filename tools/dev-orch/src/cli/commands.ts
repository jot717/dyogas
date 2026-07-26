/**
 * CLI command handlers — compose parser/planner/package/gate/writer.
 * No coding agent / LLM.
 */
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { parseTaskRegistryMarkdown } from "../parse/registry.js";
import { selectNextTask } from "../planner/select.js";
import {
  emitExecutionPackageFromTask,
  executionPackageToJson,
} from "../package/emit.js";
import { validateExecutionGate } from "../gate/validate.js";
import {
  applyRegistryUpdate,
  isWriteAllowed,
} from "../writer/update.js";
import type { EvidenceRecord } from "../evidence/types.js";
import type { CliArgs } from "./args.js";
import { CLI_USAGE } from "./args.js";

export interface CliIo {
  readFile(path: string): string;
  writeFile(path: string, content: string): void;
  exists(path: string): boolean;
}

export const defaultIo: CliIo = {
  readFile: (p) => readFileSync(p, "utf8"),
  writeFile: (p, c) => writeFileSync(p, c, "utf8"),
  exists: (p) => {
    try {
      return existsSync(p) && statSync(p).isFile();
    } catch {
      return false;
    }
  },
};

export type CliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
  /** Paths written (empty for dry-run / status / plan). */
  writtenPaths: string[];
};

function fail(stderr: string, exitCode = 1): CliResult {
  return { exitCode, stdout: "", stderr, writtenPaths: [] };
}

function ok(stdout: string, writtenPaths: string[] = []): CliResult {
  return { exitCode: 0, stdout, stderr: "", writtenPaths };
}

function requireRegistry(args: CliArgs): string | CliResult {
  if (!args.registryPath) {
    return fail("missing --registry <path>\n" + CLI_USAGE);
  }
  return args.registryPath;
}

export function runStatus(args: CliArgs, io: CliIo = defaultIo): CliResult {
  const reg = requireRegistry(args);
  if (typeof reg !== "string") return reg;
  if (!io.exists(reg)) return fail(`registry not found: ${reg}`);

  const parsed = parseTaskRegistryMarkdown(io.readFile(reg), reg);
  if (!parsed.ok) return fail(parsed.error);

  const r = parsed.registry;
  const counts = {
    READY_FOR_EXECUTION: 0,
    IN_PROGRESS: 0,
    DONE: 0,
    BLOCKED: 0,
    PENDING: 0,
    UNKNOWN: 0,
  };
  for (const t of r.tasks) {
    counts[t.status] = (counts[t.status] ?? 0) + 1;
  }

  const lines = [
    `registryId: ${r.registryId}`,
    `source: ${reg}`,
    `currentExecutableTask: ${r.currentExecutableTask ?? "None"}`,
    `tasks: ${r.tasks.length}`,
    `statusCounts: ${JSON.stringify(counts)}`,
    "",
    "tasks:",
    ...r.tasks.map(
      (t) =>
        `  - ${t.id} [${t.status}] deps=[${t.dependencies.join(",") || "None"}] ${t.title}`,
    ),
    "",
  ];
  return ok(lines.join("\n"));
}

export function runPlan(args: CliArgs, io: CliIo = defaultIo): CliResult {
  const reg = requireRegistry(args);
  if (typeof reg !== "string") return reg;
  if (!io.exists(reg)) return fail(`registry not found: ${reg}`);

  const parsed = parseTaskRegistryMarkdown(io.readFile(reg), reg);
  if (!parsed.ok) return fail(parsed.error);

  const selection = selectNextTask(parsed.registry);
  if (!selection.ok) {
    return ok(
      JSON.stringify(
        {
          ok: false,
          reason: selection.reason,
          message: selection.message,
          candidateIds: selection.candidateIds ?? [],
        },
        null,
        2,
      ) + "\n",
    );
  }

  return ok(
    JSON.stringify(
      {
        ok: true,
        taskId: selection.task.id,
        title: selection.task.title,
        status: selection.task.status,
        dependencies: selection.task.dependencies,
        rationale: selection.rationale,
        filesystemMutation: false,
      },
      null,
      2,
    ) + "\n",
  );
}

export function runDryRun(args: CliArgs, io: CliIo = defaultIo): CliResult {
  const reg = requireRegistry(args);
  if (typeof reg !== "string") return reg;
  if (!io.exists(reg)) return fail(`registry not found: ${reg}`);

  const markdown = io.readFile(reg);
  const parsed = parseTaskRegistryMarkdown(markdown, reg);
  if (!parsed.ok) return fail(parsed.error);

  const selection = selectNextTask(parsed.registry);
  if (!selection.ok) {
    return ok(
      JSON.stringify(
        {
          mode: "dry-run",
          filesystemMutation: false,
          planner: {
            ok: false,
            reason: selection.reason,
            message: selection.message,
          },
        },
        null,
        2,
      ) + "\n",
    );
  }

  const task = selection.task;
  const emit = emitExecutionPackageFromTask(task, {
    sprintId: args.sprintId ?? inferSprint(parsed.registry.registryId),
    allowedScope:
      args.allowedScope ??
      "tasks/; docs/dev-orch/; tools/dev-orch/",
    ssotReferences:
      args.ssotReferences ??
      "SPEC-DEV-ORCH-001; DEV-ORCH-RUNBOOK; DL-DEV-ORCH-002; START_DEVELOPMENT",
    gapRegistry: args.gapRegistry ?? "none",
    expectedEvidence:
      task.expectedOutput ?? `docs/dev-orch/${task.id}-evidence.md`,
  });

  if (!emit.ok) {
    return fail(`package emit failed: ${emit.error}`);
  }

  const gate = validateExecutionGate(emit.package, {
    mode: "Implementation Mode",
    sprintAuthorized: true,
    decisionLogApproved: true,
    knownTaskIds: parsed.registry.tasks.map((t) => t.id),
    proposedPaths: [],
    createsPlanningArtifacts: false,
    modifiesCode: false,
  });

  // Preview READY → IN_PROGRESS via writer without writing
  const preview = applyRegistryUpdate({
    markdown,
    taskId: task.id,
    to: "IN_PROGRESS",
    dryRun: true,
    targetPath: reg,
  });

  return ok(
    JSON.stringify(
      {
        mode: "dry-run",
        filesystemMutation: false,
        writtenPaths: [],
        planner: {
          ok: true,
          taskId: task.id,
          title: task.title,
          rationale: selection.rationale,
        },
        package: JSON.parse(executionPackageToJson(emit.package)),
        gate: gate.ok
          ? { ok: true, checks: gate.checks }
          : { ok: false, action: gate.action, violations: gate.violations },
        writerPreview: preview.ok
          ? {
              ok: true,
              from: preview.from,
              to: preview.to,
              idempotent: preview.idempotent,
            }
          : { ok: false, error: preview.error },
      },
      null,
      2,
    ) + "\n",
  );
}

export function runApply(args: CliArgs, io: CliIo = defaultIo): CliResult {
  const reg = requireRegistry(args);
  if (typeof reg !== "string") return reg;
  if (!io.exists(reg)) return fail(`registry not found: ${reg}`);

  const writePath = args.writePath ?? reg;
  if (!isWriteAllowed(writePath)) {
    return fail(`forbidden write path (not allowlisted): ${writePath}`);
  }

  const markdown = io.readFile(reg);
  const parsed = parseTaskRegistryMarkdown(markdown, reg);
  if (!parsed.ok) return fail(parsed.error);

  const to = args.to ?? "IN_PROGRESS";
  let taskId = args.taskId;

  if (!taskId) {
    const selection = selectNextTask(parsed.registry);
    if (!selection.ok) {
      return fail(`planner STOP: ${selection.message}`);
    }
    taskId = selection.task.id;
  } else {
    const known = parsed.registry.tasks.find((t) => t.id === taskId);
    if (!known) {
      return fail(`unknown task id: ${taskId}`);
    }
  }

  let evidence: EvidenceRecord | undefined;

  if (to === "DONE") {
    return fail(
      "DONE apply requires a Verifier PASS evidence record; use writer APIs after verifyImplementation PASS (CLI does not invent PASS). Transition to IN_PROGRESS via --apply --to IN_PROGRESS.",
    );
  }

  if (to === "BLOCKED") {
    evidence = {
      task_id: taskId,
      sprint_id: args.sprintId ?? inferSprint(parsed.registry.registryId),
      timestamp: new Date().toISOString(),
      changed_files: [],
      test_result: { ran: false, passed: false, summary: "blocked via CLI" },
      verifier_status: "BLOCKED",
      evidence_path: args.evidencePath ?? "none",
    };
  }

  const result = applyRegistryUpdate({
    markdown,
    taskId,
    to,
    evidence,
    nextExecutableTaskId: args.nextExecutableTaskId,
    dryRun: false,
    targetPath: writePath,
  });

  if (!result.ok) return fail(result.error);

  if (result.idempotent) {
    return ok(
      JSON.stringify(
        {
          mode: "apply",
          filesystemMutation: false,
          idempotent: true,
          taskId,
          from: result.from,
          to: result.to,
          writtenPaths: [],
        },
        null,
        2,
      ) + "\n",
    );
  }

  io.writeFile(writePath, result.markdown);
  return ok(
    JSON.stringify(
      {
        mode: "apply",
        filesystemMutation: true,
        taskId,
        from: result.from,
        to: result.to,
        writtenPaths: [writePath],
        via: "applyRegistryUpdate",
      },
      null,
      2,
    ) + "\n",
    [writePath],
  );
}

function inferSprint(registryId: string): string {
  // TASK-REGISTRY-DEV-ORCH-002 → SPRINT-DEV-ORCH-002
  return registryId.replace(/^TASK-REGISTRY-/, "SPRINT-");
}

export async function dispatchCli(
  args: CliArgs,
  io: CliIo = defaultIo,
): Promise<CliResult> {
  if (args.helpText || args.command === "help") {
    return ok(CLI_USAGE);
  }
  switch (args.command) {
    case "status":
      return runStatus(args, io);
    case "plan":
      return runPlan(args, io);
    case "run": {
      // Autonomous when --autonomous or plan.json available beside registry
      const { shouldUseAutonomous } = await import("./autonomous.js");
      if (args.autonomous || shouldUseAutonomous(args)) {
        const { runAutonomous } = await import("./autonomous.js");
        return runAutonomous(args, io);
      }
      if (args.apply) return runApply(args, io);
      return runDryRun(args, io);
    }
    default:
      return fail(CLI_USAGE);
  }
}
