/**
 * Shared fixtures for eng-agent tests.
 */

import type { ExecutionPackageView } from "../src/adapter/types.js";
import type { ExecutionFacts } from "../src/agent/types.js";

export function samplePackage(
  overrides: Partial<ExecutionPackageView> = {},
): ExecutionPackageView {
  return {
    taskId: "EA-01",
    title: "Package scaffold",
    objective: "Create tools/eng-agent scaffold",
    dependencies: [],
    acceptanceCriteria: "Installs; npm test runnable; no forbidden deps",
    testRequirements: "npm test; npm run build",
    allowedScope: "tools/eng-agent/; docs/eng-agent/",
    forbiddenScope:
      "Runtime; Agent SDK; Execution Host; Product modules; MOD-ENG-AGENTS; B17",
    expectedEvidence: "docs/eng-agent/EA-01-scaffold.md",
    executionMode: "Implementation Mode",
    sprintId: "SPRINT-ENG-AGENT-IMPLEMENTATION-001",
    ssotReferences: "DL-ENG-AGENT-IMPLEMENTATION-001",
    gapRegistry: "none",
    statusTransition: "READY_FOR_EXECUTION → IN_PROGRESS → DONE | BLOCKED",
    ...overrides,
  };
}

export function sampleFacts(
  overrides: Partial<ExecutionFacts> = {},
): ExecutionFacts {
  return {
    changedFiles: [
      "tools/eng-agent/package.json",
      "docs/eng-agent/EA-01-scaffold.md",
    ],
    testResult: { ran: true, passed: true, summary: "all pass" },
    evidenceReference: "docs/eng-agent/EA-01-scaffold.md",
    evidenceExists: true,
    acceptanceCriteriaEvidence: [
      { criterion: "Installs; npm test runnable", status: "PASS" },
    ],
    ssotCitationsPresent: true,
    gapsRegisteredOpen: true,
    ...overrides,
  };
}
