/**
 * Full coding cycle: build instruction → invoke → verify → write evidence.
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { ExecutionPackageView } from "../adapter/types.js";
import { buildCodingInstruction } from "./instruction.js";
import { invokeCodingAgent } from "./adapter.js";
import {
  verifyCodingObservation,
  type CodingVerifierResult,
} from "./verify.js";
import type {
  CodingAgentObservation,
  CodingInstructionPackage,
} from "./types.js";

export interface CodingCycleInput {
  pkg: ExecutionPackageView;
  targetFiles: readonly string[];
  allowedPaths: readonly string[];
  verifyCommand: CodingInstructionPackage["verifyCommand"];
  evidencePath: string;
  workspaceRoot: string;
  mode: "dry-run" | "apply";
  apiKey?: string;
  modelId?: string;
  extraPromptNotes?: string;
}

export interface CodingEvidenceRecord {
  taskId: string;
  sprintId: string;
  mode: "dry-run" | "apply";
  recommendation: "PASS" | "BLOCKED";
  trustsCallerFacts: false;
  integration: "cursor-sdk-agent-prompt";
  observation: CodingAgentObservation;
  verifier: CodingVerifierResult;
  generatedAt: string;
}

export type CodingCycleResult = {
  ok: boolean;
  recommendation: "PASS" | "BLOCKED" | "REFUSED";
  instruction?: CodingInstructionPackage;
  observation?: CodingAgentObservation;
  verifier?: CodingVerifierResult;
  evidence?: CodingEvidenceRecord;
  evidencePath?: string;
  error?: string;
};

export async function runCodingCycle(
  input: CodingCycleInput,
): Promise<CodingCycleResult> {
  const instruction = buildCodingInstruction({
    pkg: input.pkg,
    targetFiles: input.targetFiles,
    allowedPaths: input.allowedPaths,
    verifyCommand: input.verifyCommand,
    evidencePath: input.evidencePath,
    extraPromptNotes: input.extraPromptNotes,
  });

  const invoked = await invokeCodingAgent(instruction, {
    workspaceRoot: input.workspaceRoot,
    mode: input.mode,
    apiKey: input.apiKey,
    modelId: input.modelId,
  });

  if (!invoked.ok) {
    return {
      ok: false,
      recommendation: "REFUSED",
      instruction,
      observation: invoked.observation,
      error: invoked.error,
    };
  }

  let observation = invoked.observation;

  if (input.mode === "dry-run") {
    const verifier = verifyCodingObservation({
      observation,
      workspaceRoot: input.workspaceRoot,
      requireEvidenceOnDisk: false,
    });
    return {
      ok: verifier.recommendation === "PASS",
      recommendation: verifier.recommendation,
      instruction,
      observation,
      verifier,
      evidencePath: instruction.evidencePath,
    };
  }

  // Write evidence then re-verify with evidence-on-disk
  const preliminary = verifyCodingObservation({
    observation,
    workspaceRoot: input.workspaceRoot,
    requireEvidenceOnDisk: false,
  });

  const evidence: CodingEvidenceRecord = {
    taskId: input.pkg.taskId,
    sprintId: input.pkg.sprintId,
    mode: input.mode,
    recommendation: preliminary.recommendation,
    trustsCallerFacts: false,
    integration: "cursor-sdk-agent-prompt",
    observation,
    verifier: preliminary,
    generatedAt: new Date().toISOString(),
  };

  const abs = resolve(input.workspaceRoot, instruction.evidencePath);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, JSON.stringify(evidence, null, 2) + "\n", "utf8");
  observation = {
    ...observation,
    evidenceExistsOnDisk: existsSync(abs),
  };

  const finalVerifier = verifyCodingObservation({
    observation,
    workspaceRoot: input.workspaceRoot,
    requireEvidenceOnDisk: true,
  });

  const finalEvidence: CodingEvidenceRecord = {
    ...evidence,
    recommendation: finalVerifier.recommendation,
    observation,
    verifier: finalVerifier,
  };
  writeFileSync(abs, JSON.stringify(finalEvidence, null, 2) + "\n", "utf8");

  return {
    ok: finalVerifier.recommendation === "PASS",
    recommendation: finalVerifier.recommendation,
    instruction,
    observation,
    verifier: finalVerifier,
    evidence: finalEvidence,
    evidencePath: instruction.evidencePath,
  };
}
