/**
 * SPRINT-EXECUTION-HOST-001 — Host error types (Phase 1).
 * Typed reject codes for pipeline pin align with stage/A3-pipeline-pin.md.
 */

export class HostError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HostError";
  }
}

/** Phase 1 stub: full pipeline drive not yet implemented (Groups C–I). */
export class HostNotImplementedError extends HostError {
  constructor(operation: string) {
    super(
      "HOST_NOT_IMPLEMENTED",
      `Execution Host operation not implemented in Phase 1 (SPRINT-EXECUTION-HOST-001): ${operation}`,
    );
    this.name = "HostNotImplementedError";
  }
}

/** MVP pin — T-A3 / stage/A3-pipeline-pin.md */
export const MVP_PIPELINE_ID = "knowledge-ingestion" as const;
export const MVP_PIPELINE_VERSION = "2.0.0" as const;
