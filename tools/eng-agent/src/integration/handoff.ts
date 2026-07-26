/**
 * Build a structural handoff payload for tools/dev-orch verifier / evidence loop.
 * Does not import @dyogas/dev-orch (avoids platform-adjacent coupling).
 * Does not bypass Execution Host. Does not create product agents.
 */

import type { VerifierFeedResult } from "../verifier/types.js";
import type { EngAgentEvidenceRecord } from "../evidence/types.js";
import type { HandoffResult } from "./types.js";

export function buildDevOrchHandoff(input: {
  verifier: VerifierFeedResult;
  evidence: EngAgentEvidenceRecord;
}): HandoffResult {
  if (input.verifier.feed.inventedPass !== false) {
    return { ok: false, error: "handoff refused: invented PASS" };
  }
  if (input.evidence.inventedPass !== false) {
    return { ok: false, error: "handoff refused: invented PASS in evidence" };
  }
  if (input.verifier.feed.taskId !== input.evidence.taskId) {
    return {
      ok: false,
      error: `taskId mismatch: feed=${input.verifier.feed.taskId} evidence=${input.evidence.taskId}`,
    };
  }

  return {
    ok: true,
    handoff: {
      implementationEvidence: {
        taskId: input.verifier.feed.taskId,
        evidenceReference: input.verifier.feed.evidenceReference,
        evidenceExists: input.verifier.feed.evidenceExists,
        testResult: { ...input.verifier.feed.testResult },
        changedFiles: [...input.verifier.feed.changedFiles],
        acceptanceCriteriaEvidence:
          input.verifier.feed.acceptanceCriteriaEvidence.map((a) => ({
            ...a,
          })),
        gapsRegisteredOpen: input.verifier.feed.gapsRegisteredOpen,
        ssotCitationsPresent: input.verifier.feed.ssotCitationsPresent,
        currentStatus: input.verifier.feed.currentStatus,
      },
      evidenceRecord: input.evidence,
      bypassesExecutionHost: false,
      productAgent: false,
      dryRunDefault: true,
    },
  };
}
