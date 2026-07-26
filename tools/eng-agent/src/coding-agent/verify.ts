/**
 * Independent verifier for Coding Agent runs.
 * Checks: changed files (git/snapshot), test exit code, evidence on disk.
 * Does NOT trust caller-supplied PASS facts.
 */

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import type { CodingAgentObservation } from "./types.js";

export interface CodingVerifierCheck {
  id: string;
  pass: boolean;
  message: string;
}

export interface CodingVerifierResult {
  recommendation: "PASS" | "BLOCKED";
  checks: CodingVerifierCheck[];
  failedCheckIds: string[];
  trustsCallerFacts: false;
}

export function verifyCodingObservation(input: {
  observation: CodingAgentObservation;
  workspaceRoot: string;
  requireEvidenceOnDisk: boolean;
}): CodingVerifierResult {
  const obs = input.observation;
  const checks: CodingVerifierCheck[] = [];

  checks.push({
    id: "INSTRUCTION_DELIVERED",
    pass: obs.instructionDelivered === true,
    message: obs.instructionDelivered
      ? "coding instruction delivered to agent"
      : "instruction not delivered",
  });

  if (obs.mode === "apply") {
    checks.push({
      id: "SOURCE_CHANGES",
      pass: obs.changedFiles.length > 0,
      message:
        obs.changedFiles.length > 0
          ? `changed files (${obs.changeDetection}): ${obs.changedFiles.join(", ")}`
          : "no source file changes detected (git diff / snapshot)",
    });

    const exit = obs.verifyCommand?.exitCode;
    checks.push({
      id: "TEST_EXIT",
      pass: exit === 0,
      message:
        exit === 0
          ? "verify command exit code 0"
          : `verify command exit code ${exit ?? "missing"}`,
    });
  } else {
    checks.push({
      id: "DRY_RUN",
      pass: true,
      message: "dry-run: source changes / test exit not required",
    });
  }

  if (input.requireEvidenceOnDisk) {
    const abs = resolve(input.workspaceRoot, obs.evidencePath);
    let exists = false;
    try {
      exists = existsSync(abs) && statSync(abs).isFile();
    } catch {
      exists = false;
    }
    checks.push({
      id: "EVIDENCE_ON_DISK",
      pass: exists,
      message: exists
        ? `evidence present: ${obs.evidencePath}`
        : `evidence missing: ${obs.evidencePath}`,
    });
  }

  checks.push({
    id: "NO_CALLER_FACTS",
    pass: true,
    message: "verifier used CodingAgentObservation only (trustsCallerFacts=false)",
  });

  const failed = checks.filter((c) => !c.pass).map((c) => c.id);
  return {
    recommendation: failed.length === 0 ? "PASS" : "BLOCKED",
    checks,
    failedCheckIds: failed,
    trustsCallerFacts: false,
  };
}
