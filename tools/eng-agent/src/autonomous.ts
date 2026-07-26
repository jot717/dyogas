/**
 * Autonomous cycle: adapt → authorize → execute plan → independent verify → evidence.
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { adaptExecutionPackage } from "./adapter/adapt.js";
import type { ExecutionPackageView, GateView } from "./adapter/types.js";
import { authorize } from "./agent/execute.js";
import { executePlan } from "./executor/lifecycle.js";
import type { ExecutionPlan, ExecutorObservation } from "./executor/types.js";
import {
  verifyIndependently,
  type IndependentVerifierResult,
} from "./verifier/independent.js";
import { isExecutorWriteAllowed } from "./executor/paths.js";

export interface AutonomousCycleInput {
  pkg: ExecutionPackageView;
  gate: GateView;
  plan: ExecutionPlan;
  mode: "dry-run" | "apply";
  workspaceRoot: string;
  currentStatus: "READY_FOR_EXECUTION" | "IN_PROGRESS";
}

export interface AutonomousEvidenceRecord {
  taskId: string;
  sprintId: string;
  mode: "dry-run" | "apply";
  recommendation: "PASS" | "BLOCKED";
  trustsCallerFacts: false;
  observation: ExecutorObservation;
  verifier: IndependentVerifierResult;
  generatedAt: string;
}

export type AutonomousCycleResult = {
  ok: boolean;
  recommendation: "PASS" | "BLOCKED" | "REFUSED";
  observation?: ExecutorObservation;
  verifier?: IndependentVerifierResult;
  evidence?: AutonomousEvidenceRecord;
  evidencePath?: string;
  writtenPaths: string[];
  error?: string;
};

/**
 * Run one autonomous engineering cycle.
 * Evidence JSON is written automatically on apply when verification path requires it.
 */
export async function runAutonomousCycle(
  input: AutonomousCycleInput,
): Promise<AutonomousCycleResult> {
  const adapted = adaptExecutionPackage(input.pkg, input.gate);
  if (!adapted.ok) {
    return {
      ok: false,
      recommendation: "REFUSED",
      writtenPaths: [],
      error: adapted.error,
    };
  }

  const auth = authorize(adapted.adapted, input.gate, input.currentStatus);
  if (!auth.ok) {
    return {
      ok: false,
      recommendation: "REFUSED",
      writtenPaths: [],
      error: auth.reason,
    };
  }

  if (input.plan.taskId !== input.pkg.taskId) {
    return {
      ok: false,
      recommendation: "REFUSED",
      writtenPaths: [],
      error: `plan.taskId ${input.plan.taskId} != package.taskId ${input.pkg.taskId}`,
    };
  }

  const exec = await executePlan(input.plan, {
    mode: input.mode,
    workspaceRoot: input.workspaceRoot,
  });

  if (!exec.ok) {
    return {
      ok: false,
      recommendation: "BLOCKED",
      observation: exec.observation,
      writtenPaths: exec.observation?.writtenPaths
        ? [...exec.observation.writtenPaths]
        : [],
      error: exec.error,
    };
  }

  let observation = exec.observation;
  const writtenPaths = [...observation.writtenPaths];

  // Build evidence record from observation (not caller facts)
  const preliminary = verifyIndependently({
    observation,
    workspaceRoot: input.workspaceRoot,
    requireEvidenceOnDisk: false,
  });

  const evidence: AutonomousEvidenceRecord = {
    taskId: input.pkg.taskId,
    sprintId: input.pkg.sprintId,
    mode: input.mode,
    recommendation: preliminary.recommendation,
    trustsCallerFacts: false,
    observation,
    verifier: preliminary,
    generatedAt: new Date().toISOString(),
  };

  let evidencePath = input.plan.evidencePath;

  if (input.mode === "apply") {
    if (!isExecutorWriteAllowed(input.workspaceRoot, evidencePath)) {
      return {
        ok: false,
        recommendation: "BLOCKED",
        observation,
        writtenPaths,
        error: `evidence path not allowlisted: ${evidencePath}`,
      };
    }
    const abs = resolve(input.workspaceRoot, evidencePath);
    mkdirSync(dirname(abs), { recursive: true });
    // Temporary recommendation may update after evidence write
    writeFileSync(abs, JSON.stringify(evidence, null, 2) + "\n", "utf8");
    writtenPaths.push(evidencePath.replace(/\\/g, "/"));
    observation = {
      ...observation,
      evidenceExistsOnDisk: existsSync(abs),
    };

    const finalVerifier = verifyIndependently({
      observation,
      workspaceRoot: input.workspaceRoot,
      requireEvidenceOnDisk: true,
    });

    // Rewrite evidence with final verifier result
    const finalEvidence: AutonomousEvidenceRecord = {
      ...evidence,
      recommendation: finalVerifier.recommendation,
      observation,
      verifier: finalVerifier,
    };
    writeFileSync(abs, JSON.stringify(finalEvidence, null, 2) + "\n", "utf8");

    return {
      ok: finalVerifier.recommendation === "PASS",
      recommendation: finalVerifier.recommendation,
      observation,
      verifier: finalVerifier,
      evidence: finalEvidence,
      evidencePath,
      writtenPaths,
    };
  }

  // dry-run: no evidence file required on disk
  return {
    ok: preliminary.recommendation === "PASS",
    recommendation: preliminary.recommendation,
    observation,
    verifier: preliminary,
    evidence,
    evidencePath,
    writtenPaths,
  };
}
