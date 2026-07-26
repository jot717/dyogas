/**
 * Evidence types for eng-agent.
 */

import type { VerifierFeedResult } from "../verifier/types.js";
import type { AuthorizedExecution, ExecutionFacts } from "../agent/types.js";

export type EvidenceWriteMode = "dry-run" | "apply";

export interface EngAgentEvidenceRecord {
  taskId: string;
  sprintId: string;
  authorized: AuthorizedExecution;
  facts: ExecutionFacts;
  verifierRecommendation: "PASS" | "BLOCKED";
  failedChecks: readonly string[];
  inventedPass: false;
  recordedAt: string;
}

export interface EvidenceWriteRequest {
  path: string;
  record: EngAgentEvidenceRecord;
  mode: EvidenceWriteMode;
}

export type EvidenceWriteResult =
  | { ok: true; mode: "dry-run"; wouldWrite: string; written: false }
  | { ok: true; mode: "apply"; path: string; written: true }
  | { ok: false; error: string };

export type { VerifierFeedResult };
