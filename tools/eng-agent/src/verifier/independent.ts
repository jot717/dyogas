/**
 * Independent verifier — observes executor results + filesystem.
 * Does NOT trust caller-supplied facts.testResult.passed or facts.evidenceExists.
 */

import { existsSync, statSync } from "node:fs";
import { resolveUnderRoot, toPosix, relativeToRoot } from "../executor/paths.js";
import type { ExecutorObservation } from "../executor/types.js";

export type IndependentRecommendation = "PASS" | "BLOCKED";

export interface IndependentCheck {
  id: string;
  pass: boolean;
  message: string;
}

export interface IndependentVerifierResult {
  recommendation: IndependentRecommendation;
  checks: IndependentCheck[];
  failedCheckIds: string[];
  /** Provenance: observation-based, not caller facts. */
  trustsCallerFacts: false;
}

export interface IndependentVerifyInput {
  observation: ExecutorObservation;
  workspaceRoot: string;
  /** When true, require evidence file on disk (after harness wrote it). */
  requireEvidenceOnDisk: boolean;
  fileExists?: (absPath: string) => boolean;
}

/**
 * Verify from executor observation + filesystem — never from caller booleans.
 */
export function verifyIndependently(
  input: IndependentVerifyInput,
): IndependentVerifierResult {
  const fileExists =
    input.fileExists ??
    ((abs: string) => {
      try {
        return existsSync(abs) && statSync(abs).isFile();
      } catch {
        return false;
      }
    });

  const checks: IndependentCheck[] = [];
  const obs = input.observation;

  checks.push({
    id: "STEPS",
    pass: obs.allStepsOk,
    message: obs.allStepsOk
      ? "all executor steps ok"
      : "one or more executor steps failed",
  });

  if (obs.mode === "apply") {
    const allZero =
      obs.commandExitCodes.length > 0 &&
      obs.commandExitCodes.every((c) => c === 0);
    const noCommands = obs.commandExitCodes.length === 0;
    // Require at least one successful command/test when plan included runTest/runCommand
    const hadCommandStep = obs.steps.some(
      (s) => s.step.type === "runCommand" || s.step.type === "runTest",
    );
    checks.push({
      id: "COMMAND_EXIT",
      pass: hadCommandStep ? allZero : true,
      message: hadCommandStep
        ? allZero
          ? `all exit codes 0: [${obs.commandExitCodes.join(",")}]`
          : `non-zero exit codes: [${obs.commandExitCodes.join(",")}]`
        : "no command steps",
    });

    // Confirm written files exist on disk
    let writesOk = true;
    const missing: string[] = [];
    for (const s of obs.steps) {
      if (s.step.type === "writeFile" && s.write) {
        const abs = resolveUnderRoot(input.workspaceRoot, s.write.path);
        if (!fileExists(abs)) {
          writesOk = false;
          missing.push(s.write.path);
        }
      }
    }
    checks.push({
      id: "WRITES_ON_DISK",
      pass: writesOk,
      message: writesOk
        ? "all written files exist on disk"
        : `missing after write: ${missing.join(", ")}`,
    });
  } else {
    checks.push({
      id: "DRY_RUN",
      pass: true,
      message: "dry-run: command exit / disk writes not required",
    });
  }

  if (input.requireEvidenceOnDisk) {
    const abs = resolveUnderRoot(input.workspaceRoot, obs.evidencePath);
    const exists = fileExists(abs);
    checks.push({
      id: "EVIDENCE_ON_DISK",
      pass: exists,
      message: exists
        ? `evidence present: ${toPosix(relativeToRoot(input.workspaceRoot, abs))}`
        : `evidence missing: ${obs.evidencePath}`,
    });
  } else {
    checks.push({
      id: "EVIDENCE_ON_DISK",
      pass: true,
      message: "evidence check deferred",
    });
  }

  // Explicitly reject any attempt to inject caller pass flags (API has none)
  checks.push({
    id: "NO_CALLER_FACTS",
    pass: true,
    message: "verifier used ExecutorObservation only (trustsCallerFacts=false)",
  });

  const failed = checks.filter((c) => !c.pass).map((c) => c.id);
  return {
    recommendation: failed.length === 0 ? "PASS" : "BLOCKED",
    checks,
    failedCheckIds: failed,
    trustsCallerFacts: false,
  };
}
