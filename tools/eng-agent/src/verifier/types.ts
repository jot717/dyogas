/**
 * Verifier feed types — evidence-in → recommendation-out.
 * Never invents PASS.
 */

export type VerifierRecommendation = "PASS" | "BLOCKED";

export interface VerifierFeed {
  taskId: string;
  evidenceReference: string;
  evidenceExists: boolean;
  testResult: {
    ran: boolean;
    passed: boolean;
    summary: string;
  };
  changedFiles: readonly string[];
  acceptanceCriteriaEvidence: readonly {
    criterion: string;
    status: "PASS" | "FAIL";
  }[];
  gapsRegisteredOpen: boolean;
  ssotCitationsPresent: boolean;
  currentStatus: "READY_FOR_EXECUTION" | "IN_PROGRESS" | "DONE" | "BLOCKED" | "PENDING";
  /** Always false — eng-agent must never invent verifier PASS. */
  inventedPass: false;
}

export type VerifierFeedResult = {
  feed: VerifierFeed;
  recommendation: VerifierRecommendation;
  failedChecks: readonly string[];
};
