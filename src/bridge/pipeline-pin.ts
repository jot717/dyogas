/**
 * SPEC-PROD-004 / SPRINT-PB-HARNESS-BRIDGE-001 — T-B2
 * Product-side approved pipeline pin for ExecutionHost.createRun().
 *
 * Must stay aligned with:
 * - pipelines/knowledge-ingestion.md (Pipeline id + Version)
 * - @dyogas/execution-host MVP_PIPELINE_ID / MVP_PIPELINE_VERSION
 *
 * Does not call Runtime. Does not invent admit APIs or pipeline topology.
 */

import { PersonalBrainError } from "../workspace.js";

/** Approved Bridge pipeline — SPEC-PROD-004 pinned topology. */
export const APPROVED_PIPELINE_ID = "knowledge-ingestion" as const;

/** Approved Bridge pipeline version — pin at createRun (Harness §13). */
export const APPROVED_PIPELINE_VERSION = "2.0.0" as const;

/**
 * Execution intent for this Bridge: request Host to run knowledge-ingestion.
 * Selecting this pin is the product's execution intent signal.
 */
export const KNOWLEDGE_INGESTION_EXECUTION_INTENT =
  APPROVED_PIPELINE_ID;

export type ApprovedPipelinePin = {
  readonly pipeline_id: typeof APPROVED_PIPELINE_ID;
  readonly pipeline_version: typeof APPROVED_PIPELINE_VERSION;
};

/** Frozen pin fields for CreateRunRequest.pipeline_id / pipeline_version. */
export function approvedPipelinePinForCreateRun(): ApprovedPipelinePin {
  return Object.freeze({
    pipeline_id: APPROVED_PIPELINE_ID,
    pipeline_version: APPROVED_PIPELINE_VERSION,
  });
}

/**
 * Select the approved pipeline for Host createRun.
 * Optional args must match the approved pin or fail closed (no version bypass).
 */
export function selectApprovedPipelineForCreateRun(opts?: {
  readonly pipeline_id?: string;
  readonly pipeline_version?: string;
}): ApprovedPipelinePin {
  const pipeline_id = opts?.pipeline_id ?? APPROVED_PIPELINE_ID;
  const pipeline_version = opts?.pipeline_version ?? APPROVED_PIPELINE_VERSION;

  if (pipeline_id !== APPROVED_PIPELINE_ID) {
    throw new PersonalBrainError(
      `unsupported pipeline_id for Bridge: ${pipeline_id} (approved: ${APPROVED_PIPELINE_ID})`,
    );
  }
  if (pipeline_version !== APPROVED_PIPELINE_VERSION) {
    throw new PersonalBrainError(
      `unsupported pipeline_version for Bridge: ${pipeline_version} (approved pin: ${APPROVED_PIPELINE_VERSION})`,
    );
  }

  return approvedPipelinePinForCreateRun();
}
