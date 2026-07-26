/**
 * Evidence collector + writer (allowlisted; dry-run default).
 */

import { isWriteAllowed } from "./allowlist.js";
import type {
  EngAgentEvidenceRecord,
  EvidenceWriteRequest,
  EvidenceWriteResult,
} from "./types.js";
import type { ExecutionResult } from "../agent/types.js";
import type { VerifierFeedResult } from "../verifier/types.js";

export function collectEngAgentEvidence(input: {
  result: ExecutionResult;
  verifier: VerifierFeedResult;
  recordedAt?: string;
}): EngAgentEvidenceRecord | { ok: false; error: string } {
  if (!input.result.ok) {
    return { ok: false, error: `cannot collect evidence: ${input.result.reason}` };
  }
  if (input.result.verifierPassInvented !== false) {
    return { ok: false, error: "refusing invented verifier PASS in evidence" };
  }
  if (input.verifier.feed.inventedPass !== false) {
    return { ok: false, error: "refusing invented verifier PASS in feed" };
  }

  return {
    taskId: input.result.authorized.taskId,
    sprintId: input.result.authorized.sprintId,
    authorized: { ...input.result.authorized },
    facts: {
      ...input.result.facts,
      changedFiles: [...input.result.facts.changedFiles],
      testResult: { ...input.result.facts.testResult },
      acceptanceCriteriaEvidence:
        input.result.facts.acceptanceCriteriaEvidence.map((a) => ({ ...a })),
    },
    verifierRecommendation: input.verifier.recommendation,
    failedChecks: [...input.verifier.failedChecks],
    inventedPass: false,
    recordedAt: input.recordedAt ?? "1970-01-01T00:00:00.000Z",
  };
}

export type WriteIo = {
  writeFile: (path: string, contents: string) => void;
};

/**
 * Write evidence JSON. Default mode is dry-run (zero filesystem mutation).
 */
export function writeEvidence(
  req: EvidenceWriteRequest,
  io?: WriteIo,
): EvidenceWriteResult {
  if (!isWriteAllowed(req.path)) {
    return { ok: false, error: `write path not allowlisted: ${req.path}` };
  }
  if (req.record.inventedPass !== false) {
    return { ok: false, error: "refusing to write evidence with invented PASS" };
  }

  const body = JSON.stringify(req.record, null, 2) + "\n";

  if (req.mode === "dry-run") {
    return { ok: true, mode: "dry-run", wouldWrite: req.path, written: false };
  }

  if (!io?.writeFile) {
    return { ok: false, error: "apply mode requires writeFile io" };
  }
  io.writeFile(req.path, body);
  return { ok: true, mode: "apply", path: req.path, written: true };
}
