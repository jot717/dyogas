/**
 * Registry writer types (Runbook §8).
 * Status transitions only — no task invention, no GAP closure.
 */
import type { EvidenceRecord } from "../evidence/types.js";
import type { TaskStatusToken } from "../types.js";

export type WritableStatus = "IN_PROGRESS" | "DONE" | "BLOCKED";

export interface RegistryWriteRequest {
  /** Full Task Registry markdown. */
  markdown: string;
  /** Task to update. */
  taskId: string;
  /** Target status. */
  to: WritableStatus;
  /**
   * Required when transitioning to DONE (must be verifier PASS).
   * Optional for IN_PROGRESS; for BLOCKED may include evidence of failure.
   */
  evidence?: EvidenceRecord;
  /** Update Process pointer after DONE/BLOCKED (optional). */
  nextExecutableTaskId?: string | null;
  /** If true, return proposed markdown without claiming disk write. */
  dryRun?: boolean;
  /** Absolute or repo-relative path intended for write (allowlist checked). */
  targetPath?: string;
}

export type RegistryWriteOk = {
  ok: true;
  markdown: string;
  from: TaskStatusToken;
  to: WritableStatus;
  /** True when markdown unchanged (idempotent hit). */
  idempotent: boolean;
};

export type RegistryWriteErr = {
  ok: false;
  error: string;
};

export type RegistryWriteResult = RegistryWriteOk | RegistryWriteErr;

export {
  WRITE_ALLOWLIST_PREFIXES,
  WRITE_FORBIDDEN_PREFIXES,
  isForbiddenWritePath,
  isStageEvidencePath,
  isWriteAllowed,
} from "./allowlist.js";
