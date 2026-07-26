/**
 * Verifier integration — build feed from facts; recommend from evidence only.
 * Never invents PASS.
 */

import type { ExecutionResult } from "../agent/types.js";
import type { VerifierFeed, VerifierFeedResult } from "./types.js";

export function buildVerifierFeed(
  result: ExecutionResult,
  currentStatus: VerifierFeed["currentStatus"],
): VerifierFeedResult | { ok: false; error: string } {
  if (!result.ok) {
    return { ok: false, error: `cannot feed verifier: ${result.reason}` };
  }
  if (result.verifierPassInvented !== false) {
    return { ok: false, error: "refusing invented verifier PASS" };
  }

  const feed: VerifierFeed = {
    taskId: result.authorized.taskId,
    evidenceReference: result.facts.evidenceReference,
    evidenceExists: result.facts.evidenceExists,
    testResult: { ...result.facts.testResult },
    changedFiles: [...result.facts.changedFiles],
    acceptanceCriteriaEvidence: result.facts.acceptanceCriteriaEvidence.map(
      (a) => ({ ...a }),
    ),
    gapsRegisteredOpen: result.facts.gapsRegisteredOpen,
    ssotCitationsPresent: result.facts.ssotCitationsPresent,
    currentStatus,
    inventedPass: false,
  };

  return recommendFromFacts(feed);
}

/**
 * Derive recommendation strictly from supplied facts.
 * Missing / failed evidence → BLOCKED. Never invent PASS.
 */
export function recommendFromFacts(feed: VerifierFeed): VerifierFeedResult {
  const failed: string[] = [];

  if (feed.inventedPass !== false) {
    failed.push("INVENTED_PASS");
  }
  if (!feed.evidenceExists || !feed.evidenceReference.trim()) {
    failed.push("EVIDENCE");
  }
  if (!feed.testResult.ran || !feed.testResult.passed) {
    failed.push("TESTS");
  }
  if (
    feed.acceptanceCriteriaEvidence.length === 0 ||
    feed.acceptanceCriteriaEvidence.some((a) => a.status === "FAIL")
  ) {
    failed.push("AC");
  }
  if (!feed.ssotCitationsPresent) {
    failed.push("SSOT");
  }
  if (!feed.gapsRegisteredOpen) {
    failed.push("GAPS");
  }
  if (
    feed.currentStatus !== "READY_FOR_EXECUTION" &&
    feed.currentStatus !== "IN_PROGRESS"
  ) {
    failed.push("STATUS");
  }

  const recommendation = failed.length === 0 ? "PASS" : "BLOCKED";
  return {
    feed,
    recommendation,
    failedChecks: failed,
  };
}
