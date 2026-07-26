/**
 * Evidence collector types (Runbook §7).
 * Collects records only — does not invent evidence, close GAPs, or create tasks.
 */

export interface EvidenceTestResult {
  ran: boolean;
  passed: boolean;
  summary: string;
}

/** Canonical evidence record after a verified implementation cycle. */
export interface EvidenceRecord {
  task_id: string;
  sprint_id: string;
  timestamp: string;
  changed_files: readonly string[];
  test_result: EvidenceTestResult;
  verifier_status: "PASS" | "BLOCKED";
  evidence_path: string;
}

/** Execution result facts supplied by the Implementation Agent (must be real). */
export interface ExecutionResultFacts {
  changed_files: readonly string[];
  test_result: EvidenceTestResult;
  evidence_path: string;
  /** Artifact must exist — collector refuses invented evidence. */
  evidence_exists: boolean;
  /** Optional fixed timestamp for deterministic tests. */
  timestamp?: string;
}

export type CollectOk = { ok: true; record: EvidenceRecord };
export type CollectErr = { ok: false; error: string };
export type CollectResult = CollectOk | CollectErr;
