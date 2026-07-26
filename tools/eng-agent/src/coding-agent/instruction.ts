/**
 * Build a coding instruction package from an Execution Package.
 * No invented scope — targets and allowlist must be supplied by the harness.
 */

import type {
  BuildInstructionInput,
  CodingInstructionPackage,
} from "./types.js";

export function buildCodingInstruction(
  input: BuildInstructionInput,
): CodingInstructionPackage {
  const forbidden = [
    "runtime/",
    "sdk/",
    "execution-host/",
    "personal-brain/",
    "research/",
    "knowledge/",
    "graph/",
    "kernel/",
    "web-ui/",
    "harness/",
  ];

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
