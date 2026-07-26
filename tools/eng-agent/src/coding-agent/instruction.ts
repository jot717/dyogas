/**
 * Build a coding instruction package from an Execution Package.
 * No invented scope — targets and allowlist must be supplied by the harness.
 *
 * Scoped production exception (SPRINT-RESEARCH-AGENT-MVP-001 / Founder D-3):
 * when `allowedPaths` includes `research/src/` or `research/tests/`, the blanket
 * `research/` forbid is replaced by `research/other/` so those prefixes are not
 * contradicted in the prompt. Runtime / SDK / Execution Host remain forbidden.
 */

import type {
  BuildInstructionInput,
  CodingInstructionPackage,
} from "./types.js";

/** Always-forbidden product / platform roots. */
const BASE_FORBIDDEN = [
  "runtime/",
  "sdk/",
  "execution-host/",
  "personal-brain/",
  "knowledge/",
  "graph/",
  "kernel/",
  "web-ui/",
  "harness/",
] as const;

/** Blanket research forbid — lifted only for approved prefixes below. */
const RESEARCH_BLANKET = "research/";

/** Approved Coding Agent write exceptions under research/. */
export const RESEARCH_WRITE_EXCEPTIONS = [
  "research/src/",
  "research/tests/",
] as const;

/** Explicit forbid retained when the research exception is active. */
const RESEARCH_OTHER_FORBIDDEN = "research/other/";

function toPosix(p: string): string {
  return p.replace(/\\/g, "/");
}

function hasResearchWriteException(allowedPaths: readonly string[]): boolean {
  const allowed = allowedPaths.map(toPosix);
  return RESEARCH_WRITE_EXCEPTIONS.some((ex) =>
    allowed.some(
      (a) =>
        a === ex ||
        a === ex.slice(0, -1) ||
        a.startsWith(ex) ||
        ex.startsWith(a.endsWith("/") ? a : `${a}/`),
    ),
  );
}

/**
 * Resolve forbidden path prefixes for a coding instruction.
 * `research/src/` and `research/tests/` win over the blanket `research/` forbid
 * when present in `allowedPaths`.
 */
export function resolveCodingForbiddenPaths(
  allowedPaths: readonly string[],
): string[] {
  if (hasResearchWriteException(allowedPaths)) {
    return [...BASE_FORBIDDEN, RESEARCH_OTHER_FORBIDDEN];
  }
  return [...BASE_FORBIDDEN, RESEARCH_BLANKET];
}

export function buildCodingInstruction(
  input: BuildInstructionInput,
): CodingInstructionPackage {
  const forbidden = resolveCodingForbiddenPaths(input.allowedPaths);

  const prompt = [
    `# Coding Task ${input.pkg.taskId}`,
    ``,
    `You are the Implementation Agent for the DYOGAS Development Harness.`,
    `Sprint: ${input.pkg.sprintId}`,
    ``,
    `## Objective`,
    input.pkg.objective,
    ``,
    `## Acceptance Criteria`,
    input.pkg.acceptanceCriteria,
    ``,
    `## Test Requirements`,
    input.pkg.testRequirements,
    ``,
    `## Allowed paths (ONLY modify these)`,
    ...input.allowedPaths.map((p) => `- ${p}`),
    ``,
    `## Target files`,
    ...input.targetFiles.map((p) => `- ${p}`),
    ``,
    `## Forbidden`,
    ...forbidden.map((p) => `- ${p}`),
    `- Do not invent PASS for tests.`,
    `- Do not modify files outside the allowed paths.`,
    `- Do not create a new MOD-* or agents/ module tree.`,
    ``,
    `## Required actions`,
    `1. Implement the missing/incorrect behavior in the target source file(s).`,
    `2. Ensure the verify command will pass: ${input.verifyCommand.command} ${input.verifyCommand.args.join(" ")}`,
    `3. Keep changes minimal and focused.`,
    input.extraPromptNotes ? `\n## Notes\n${input.extraPromptNotes}` : "",
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  return {
    taskId: input.pkg.taskId,
    sprintId: input.pkg.sprintId,
    objective: input.pkg.objective,
    acceptanceCriteria: input.pkg.acceptanceCriteria,
    testRequirements: input.pkg.testRequirements,
    allowedPaths: [...input.allowedPaths],
    forbiddenPaths: forbidden,
    prompt,
    targetFiles: [...input.targetFiles],
    verifyCommand: {
      command: input.verifyCommand.command,
      args: [...input.verifyCommand.args],
      cwd: input.verifyCommand.cwd,
    },
    evidencePath: input.evidencePath,
  };
}
