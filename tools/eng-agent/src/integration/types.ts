/**
 * Dev-orch handoff types (structural; no package import).
 */

import type { VerifierFeed } from "../verifier/types.js";
import type { EngAgentEvidenceRecord } from "../evidence/types.js";

export interface DevOrchHandoff {
  /** Matches Orchestrator ImplementationEvidence shape (structural). */
  implementationEvidence: {
    taskId: string;
    evidenceReference: string;
    evidenceExists: boolean;
    testResult: VerifierFeed["testResult"];
    changedFiles: readonly string[];
    acceptanceCriteriaEvidence: VerifierFeed["acceptanceCriteriaEvidence"];
    gapsRegisteredOpen: boolean;
    ssotCitationsPresent: boolean;
    currentStatus: VerifierFeed["currentStatus"];
  };
  evidenceRecord: EngAgentEvidenceRecord;
  /** Explicit: eng-agent does not bypass Execution Host. */
  bypassesExecutionHost: false;
  /** Explicit: not a product agent. */
  productAgent: false;
  dryRunDefault: true;
}

export type HandoffResult =
  | { ok: true; handoff: DevOrchHandoff }
  | { ok: false; error: string };
