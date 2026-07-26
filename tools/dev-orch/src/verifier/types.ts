/**
 * Verifier types (Runbook §6 V-1…V-8).
 * Recommends PASS | BLOCKED — never mutates Task Registry / GAPs.
 */

export type VerifierCheckId =
  | "V-1"
  | "V-2"
  | "V-3"
  | "V-4"
  | "V-5"
  | "V-6"
  | "V-7"
  | "V-8"
  | "EVIDENCE"
  | "AC"
  | "TESTS"
  | "SCOPE";

export type VerifierCheckResult = {
  id: VerifierCheckId;
  pass: boolean;
  message: string;
};

/** Implementation evidence supplied after Implementation Agent claims complete. */
export interface ImplementationEvidence {
  /** Must match Execution Package Task ID (V-1). */
  taskId: string;
  /** Evidence reference / path (V-2 / EVIDENCE). */
  evidenceReference: string;
  /** Whether evidence artifact is present at expected location. */
  evidenceExists: boolean;
  /** Automated or documented test outcome (V-4 / TESTS). */
  testResult: {
    ran: boolean;
    passed: boolean;
    summary: string;
  };
  /** Files created or modified in this cycle (SCOPE / V-6). */
  changedFiles: readonly string[];
  /**
   * Per–Acceptance-Criteria evidence (V-3 / AC).
   * Each criterion must be cited PASS (FAIL blocks).
   */
  acceptanceCriteriaEvidence: readonly {
    criterion: string;
    status: "PASS" | "FAIL";
  }[];
  /**
   * New gaps registered as OPEN when discovered (V-5).
   * Use true when no new gaps, or when all new gaps are OPEN in registry.
   */
  gapsRegisteredOpen: boolean;
  /** SSOT citations present in evidence (V-8). */
  ssotCitationsPresent: boolean;
  /**
   * Current task status before Commit (V-7).
   * Legal path to completion: READY_FOR_EXECUTION | IN_PROGRESS.
   */
  currentStatus: "READY_FOR_EXECUTION" | "IN_PROGRESS" | "DONE" | "BLOCKED" | "PENDING";
}

export type VerifierPass = {
  ok: true;
  recommendation: "PASS";
  checks: VerifierCheckResult[];
};

export type VerifierBlocked = {
  ok: false;
  recommendation: "BLOCKED";
  checks: VerifierCheckResult[];
  /** Failed check ids (sorted, deterministic). */
  failedCheckIds: VerifierCheckId[];
};

export type VerifierResult = VerifierPass | VerifierBlocked;
