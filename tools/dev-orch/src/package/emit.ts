/**
 * Execution Package generator (Runbook §4).
 * Fail-closed on missing required fields. Deterministic output.
 */
import type { RegistryTask } from "../types.js";
import {
  DEFAULT_EXECUTION_MODE,
  DEFAULT_FORBIDDEN_SCOPE,
  DEFAULT_STATUS_TRANSITION,
  type EmitExecutionPackageInput,
  type EmitResult,
  type ExecutionPackage,
} from "./types.js";

const REQUIRED_STRING_KEYS = [
  "taskId",
  "title",
  "objective",
  "acceptanceCriteria",
  "testRequirements",
  "allowedScope",
  "expectedEvidence",
  "sprintId",
  "ssotReferences",
  "gapRegistry",
] as const;

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

/**
 * Emit an Execution Package from explicit fields (fail-closed).
 */
export function emitExecutionPackage(
  input: EmitExecutionPackageInput,
): EmitResult {
  for (const key of REQUIRED_STRING_KEYS) {
    if (isBlank(input[key])) {
      return {
        ok: false,
        error: `missing required field '${key}'`,
      };
    }
  }

  if (!Array.isArray(input.dependencies)) {
    return {
      ok: false,
      error: "missing required field 'dependencies'",
    };
  }

  const pkg: ExecutionPackage = {
    taskId: input.taskId.trim(),
    title: input.title.trim(),
    objective: input.objective.trim(),
    dependencies: Object.freeze([...input.dependencies]),
    acceptanceCriteria: input.acceptanceCriteria.trim(),
    testRequirements: input.testRequirements.trim(),
    allowedScope: input.allowedScope.trim(),
    forbiddenScope: (input.forbiddenScope ?? DEFAULT_FORBIDDEN_SCOPE).trim(),
    expectedEvidence: input.expectedEvidence.trim(),
    executionMode: (input.executionMode ?? DEFAULT_EXECUTION_MODE).trim(),
    sprintId: input.sprintId.trim(),
    ssotReferences: input.ssotReferences.trim(),
    gapRegistry: input.gapRegistry.trim(),
    statusTransition: (
      input.statusTransition ?? DEFAULT_STATUS_TRANSITION
    ).trim(),
  };

  if (isBlank(pkg.forbiddenScope)) {
    return {
      ok: false,
      error: "missing required field 'forbiddenScope'",
    };
  }
  if (isBlank(pkg.executionMode)) {
    return {
      ok: false,
      error: "missing required field 'executionMode'",
    };
  }

  return { ok: true, package: pkg };
}

/**
 * Build emit input from a planner-selected RegistryTask + operator context.
 */
export function emitExecutionPackageFromTask(
  task: RegistryTask,
  context: {
    sprintId: string;
    allowedScope: string;
    ssotReferences: string;
    gapRegistry: string;
    forbiddenScope?: string;
    executionMode?: string;
    expectedEvidence?: string;
  },
): EmitResult {
  const objective = task.objective?.trim() ?? "";
  const expectedEvidence =
    context.expectedEvidence?.trim() ||
    task.expectedOutput?.trim() ||
    "";

  return emitExecutionPackage({
    taskId: task.id,
    title: task.title,
    objective,
    dependencies: task.dependencies,
    acceptanceCriteria: task.acceptanceCriteria,
    testRequirements: task.testRequirement,
    allowedScope: context.allowedScope,
    forbiddenScope: context.forbiddenScope,
    expectedEvidence,
    executionMode: context.executionMode,
    sprintId: context.sprintId,
    ssotReferences: context.ssotReferences,
    gapRegistry: context.gapRegistry,
  });
}

/**
 * Deterministic JSON serialization (stable key order).
 */
export function executionPackageToJson(pkg: ExecutionPackage): string {
  const ordered: Record<string, unknown> = {
    taskId: pkg.taskId,
    title: pkg.title,
    objective: pkg.objective,
    dependencies: [...pkg.dependencies],
    acceptanceCriteria: pkg.acceptanceCriteria,
    testRequirements: pkg.testRequirements,
    allowedScope: pkg.allowedScope,
    forbiddenScope: pkg.forbiddenScope,
    expectedEvidence: pkg.expectedEvidence,
    executionMode: pkg.executionMode,
    sprintId: pkg.sprintId,
    ssotReferences: pkg.ssotReferences,
    gapRegistry: pkg.gapRegistry,
    statusTransition: pkg.statusTransition,
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

/**
 * Deterministic markdown table (Runbook §4 shape).
 */
export function executionPackageToMarkdown(pkg: ExecutionPackage): string {
  const rows: [string, string][] = [
    ["Task ID", pkg.taskId],
    ["Sprint ID", pkg.sprintId],
    ["Title", pkg.title],
    ["Objective", pkg.objective],
    ["Dependencies", pkg.dependencies.length ? pkg.dependencies.join(", ") : "None"],
    ["Acceptance Criteria", pkg.acceptanceCriteria],
    ["Test Requirement", pkg.testRequirements],
    ["Allowed scope", pkg.allowedScope],
    ["Forbidden scope", pkg.forbiddenScope],
    ["Expected evidence path", pkg.expectedEvidence],
    ["Execution mode", pkg.executionMode],
    ["SSOT references", pkg.ssotReferences],
    ["GAP registry", pkg.gapRegistry],
    ["Status transition", pkg.statusTransition],
  ];

  const lines = [
    `# Execution Package — ${pkg.taskId}`,
    "",
    "| Field | Content |",
    "|-------|---------|",
    ...rows.map(([k, v]) => `| **${k}** | ${escapeCell(v)} |`),
    "",
  ];
  return lines.join("\n");
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|");
}
