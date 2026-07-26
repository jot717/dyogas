/**
 * Autonomous harness run — wires parser/planner/package/gate → eng-agent executor.
 */
import { existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
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
import type { CliArgs } from "./args.js";
import type { CliIo, CliResult } from "./commands.js";
import { defaultIo } from "./commands.js";

async function loadEngAgent() {
  return import("@dyogas/eng-agent");
}

function fail(stderr: string, exitCode = 1): CliResult {
  return { exitCode, stdout: "", stderr, writtenPaths: [] };
}

function ok(stdout: string, writtenPaths: string[] = []): CliResult {
  return { exitCode: 0, stdout, stderr: "", writtenPaths };
}

function inferSprint(registryId: string): string {
  return registryId.replace(/^TASK-REGISTRY-/, "SPRINT-");
}

function findPlanPath(
  registryPath: string,
  taskId: string,
  explicit?: string,
): string | null {
  if (explicit && existsSync(explicit)) return explicit;
  const dir = dirname(resolve(registryPath));
  const candidates = [
    join(dir, "plan.json"),
    join(dir, `${taskId}.plan.json`),
    join(dir, "plans", `${taskId}.json`),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

export function resolveWorkspaceRoot(cwd = process.cwd()): string {
  const norm = cwd.replace(/\\/g, "/");
  if (/(^|\/)tools\/(dev-orch|eng-agent)\/?$/.test(norm)) {
    return resolve(cwd, "../..");
  }
  const m = norm.match(/^(.*?)\/tools\/(dev-orch|eng-agent)(?:\/|$)/);
  if (m?.[1]) return m[1];
  return cwd;
}

/** True when autonomous loop should run for this CLI invocation. */
export function shouldUseAutonomous(args: CliArgs): boolean {
  if (args.autonomous) return true;
  if (args.planPath && existsSync(args.planPath)) return true;
  if (!args.registryPath) return false;
  const abs = resolve(resolveWorkspaceRoot(), args.registryPath);
  return existsSync(join(dirname(abs), "plan.json"));
}

/**
 * Autonomous run:
 * Registry → Planner → Package → Gate → Eng-Agent Executor → Independent Verifier → Evidence
 */
export async function runAutonomous(
  args: CliArgs,
  io: CliIo = defaultIo,
): Promise<CliResult> {
  if (!args.registryPath) {
    return fail("missing --registry <path>");
  }
  const reg = args.registryPath;
  const mode = args.apply ? "apply" : "dry-run";
  const workspaceRoot = resolveWorkspaceRoot(process.cwd());
  const regAbs = resolve(workspaceRoot, reg);
  const regReadPath = existsSync(regAbs) ? regAbs : reg;

  if (!existsSync(regAbs) && !io.exists(reg)) {
    return fail(`registry not found: ${reg}`);
  }

  const markdown = io.readFile(regReadPath);
  const parsed = parseTaskRegistryMarkdown(markdown, reg);
  if (!parsed.ok) return fail(parsed.error);

  const selection = selectNextTask(parsed.registry);
  if (!selection.ok) {
    return ok(
      JSON.stringify(
        {
          mode,
          filesystemMutation: false,
          recommendation: "BLOCKED",
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
  const sprintId = args.sprintId ?? inferSprint(parsed.registry.registryId);

  const emit = emitExecutionPackageFromTask(task, {
    sprintId,
    allowedScope:
      args.allowedScope ?? "tools/eng-agent/fixtures/; docs/eng-agent/",
    ssotReferences:
      args.ssotReferences ??
      "DL-ENG-AGENT-AUTONOMOUS-EXECUTION-001; SPRINT-ENG-AGENT-AUTONOMOUS-EXECUTION-001",
    gapRegistry: args.gapRegistry ?? "GAP-EA-001;GAP-EA-002;GAP-EA-003",
    expectedEvidence:
      task.evidence ??
      task.expectedOutput ??
      `docs/eng-agent/fixtures/${task.id}-evidence.json`,
  });
  if (!emit.ok) return fail(`package emit failed: ${emit.error}`);

  const gate = validateExecutionGate(emit.package, {
    mode: "Implementation Mode",
    sprintAuthorized: true,
    decisionLogApproved: true,
    knownTaskIds: parsed.registry.tasks.map((t) => t.id),
    proposedPaths: [],
    createsPlanningArtifacts: false,
    modifiesCode: mode === "apply",
  });

  if (!gate.ok) {
    return ok(
      JSON.stringify(
        {
          mode,
          filesystemMutation: false,
          recommendation: "BLOCKED",
          planner: { ok: true, taskId: task.id },
          package: JSON.parse(executionPackageToJson(emit.package)),
          gate: { ok: false, violations: gate.violations },
        },
        null,
        2,
      ) + "\n",
    );
  }

  const planPath = findPlanPath(regAbs, task.id, args.planPath);
  if (!planPath) {
    return fail(
      `execution plan not found for ${task.id} (expected plan.json beside registry or --plan)`,
    );
  }

  const eng = await loadEngAgent();
  const plan = eng.loadExecutionPlan(planPath);

  const cycle = await eng.runAutonomousCycle({
    pkg: emit.package,
    gate: { ok: true },
    plan,
    mode,
    workspaceRoot,
    currentStatus:
      task.status === "IN_PROGRESS" ? "IN_PROGRESS" : "READY_FOR_EXECUTION",
  });

  const writtenPaths = [...cycle.writtenPaths];
  const writePath = args.writePath ?? (existsSync(regAbs) ? regAbs : reg);
  const writePathForAllow = existsSync(regAbs) ? reg : writePath;

  if (mode === "apply" && cycle.recommendation === "PASS" && cycle.evidence) {
    if (!isWriteAllowed(writePathForAllow) && !isWriteAllowed(reg)) {
      return fail(`forbidden write path: ${writePathForAllow}`);
    }

    let md = markdown;
    const toProgress = applyRegistryUpdate({
      markdown: md,
      taskId: task.id,
      to: "IN_PROGRESS",
      dryRun: false,
      targetPath: reg,
    });
    if (toProgress.ok && !toProgress.idempotent) {
      md = toProgress.markdown;
    }

    const evidenceRecord = {
      task_id: task.id,
      sprint_id: sprintId,
      timestamp: cycle.evidence.generatedAt,
      changed_files: cycle.observation?.writtenPaths ?? [],
      test_result: {
        ran: true,
        passed: true,
        summary: `independent verifier PASS; exitCodes=[${(
          cycle.observation?.commandExitCodes ?? []
        ).join(",")}]`,
      },
      verifier_status: "PASS" as const,
      evidence_path: cycle.evidencePath ?? plan.evidencePath,
    };

    const toDone = applyRegistryUpdate({
      markdown: md,
      taskId: task.id,
      to: "DONE",
      evidence: evidenceRecord,
      dryRun: false,
      targetPath: reg,
      nextExecutableTaskId: null,
    });

    if (!toDone.ok) {
      return fail(`registry DONE update failed: ${toDone.error}`);
    }
    if (!toDone.idempotent) {
      io.writeFile(writePath, toDone.markdown);
      writtenPaths.push(reg.replace(/\\/g, "/"));
    }
  }

  if (mode === "apply" && cycle.recommendation === "BLOCKED") {
    if (isWriteAllowed(reg) || isWriteAllowed(writePathForAllow)) {
      const blocked = applyRegistryUpdate({
        markdown,
        taskId: task.id,
        to: "BLOCKED",
        evidence: {
          task_id: task.id,
          sprint_id: sprintId,
          timestamp: new Date().toISOString(),
          changed_files: cycle.observation?.writtenPaths ?? [],
          test_result: {
            ran: (cycle.observation?.commandExitCodes.length ?? 0) > 0,
            passed: false,
            summary: cycle.error ?? "independent verifier BLOCKED",
          },
          verifier_status: "BLOCKED",
          evidence_path: cycle.evidencePath ?? "none",
        },
        dryRun: false,
        targetPath: reg,
      });
      if (blocked.ok && !blocked.idempotent) {
        io.writeFile(writePath, blocked.markdown);
        writtenPaths.push(reg.replace(/\\/g, "/"));
      }
    }
  }

  const payload = {
    mode,
    filesystemMutation: mode === "apply" && writtenPaths.length > 0,
    recommendation: cycle.recommendation,
    trustsCallerFacts: false,
    planner: { ok: true, taskId: task.id, title: task.title },
    package: JSON.parse(executionPackageToJson(emit.package)),
    gate: { ok: true },
    planPath: planPath.replace(/\\/g, "/"),
    observation: cycle.observation
      ? {
          allStepsOk: cycle.observation.allStepsOk,
          commandExitCodes: cycle.observation.commandExitCodes,
          writtenPaths: cycle.observation.writtenPaths,
          evidencePath: cycle.observation.evidencePath,
          evidenceExistsOnDisk: cycle.observation.evidenceExistsOnDisk,
        }
      : null,
    verifier: cycle.verifier
      ? {
          recommendation: cycle.verifier.recommendation,
          failedCheckIds: cycle.verifier.failedCheckIds,
          checks: cycle.verifier.checks,
          trustsCallerFacts: cycle.verifier.trustsCallerFacts,
        }
      : null,
    evidencePath: cycle.evidencePath ?? null,
    writtenPaths,
    error: cycle.error ?? null,
  };

  return {
    exitCode: cycle.recommendation === "PASS" ? 0 : 1,
    stdout: JSON.stringify(payload, null, 2) + "\n",
    stderr: cycle.error ? cycle.error + "\n" : "",
    writtenPaths: mode === "apply" ? writtenPaths : [],
  };
}
