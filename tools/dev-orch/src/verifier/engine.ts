/**
 * Development Orchestrator Verifier engine (Runbook §6).
 *
 * Verifies implementation evidence against an Execution Package.
 * Recommends PASS or BLOCKED. Does NOT modify Task Registry or close GAPs.
 */
import { extractPathPatterns } from "../gate/validate.js";
import type { ExecutionPackage } from "../package/types.js";
import type {
  ImplementationEvidence,
  VerifierCheckId,
  VerifierCheckResult,
  VerifierResult,
} from "./types.js";

const PLATFORM_FORBIDDEN_PREFIXES = [
  "runtime/",
  "sdk/",
  "execution-host/",
  "harness/",
] as const;

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

function pathMatchesPattern(path: string, pattern: string): boolean {
  const p = normalizePath(path);
  const pat = normalizePath(pattern).replace(/\/$/, "");
  if (!pat) return false;
  return (
    p === pat ||
    p.startsWith(pat) ||
    p.startsWith(`${pat}/`) ||
    p.includes(`/${pat}/`) ||
    p.endsWith(`/${pat}`)
  );
}

function isAllowedPath(path: string, allowedPatterns: string[]): boolean {
  if (allowedPatterns.length === 0) return false;
  return allowedPatterns.some((pat) => pathMatchesPattern(path, pat));
}

function isForbiddenPath(path: string, forbiddenPatterns: string[]): boolean {
  const p = normalizePath(path).toLowerCase();
  for (const prefix of PLATFORM_FORBIDDEN_PREFIXES) {
    if (p === prefix.slice(0, -1) || p.startsWith(prefix)) return true;
  }
  return forbiddenPatterns.some((pat) => pathMatchesPattern(path, pat));
}

function check(
  id: VerifierCheckId,
  pass: boolean,
  message: string,
): VerifierCheckResult {
  return { id, pass, message };
}

/**
 * Run Verifier checks. Any fail → recommendation BLOCKED (never DONE).
 */
export function verifyImplementation(
  pkg: ExecutionPackage,
  evidence: ImplementationEvidence,
): VerifierResult {
  const checks: VerifierCheckResult[] = [];

  // V-1 — Task ID matches package
  const v1 =
    !isBlank(evidence.taskId) && evidence.taskId.trim() === pkg.taskId.trim();
  checks.push(
    check(
      "V-1",
      v1,
      v1
        ? `Task ID matches package (${pkg.taskId})`
        : `Task ID mismatch: evidence='${evidence.taskId}' package='${pkg.taskId}'`,
    ),
  );

  // EVIDENCE / V-2 — evidence reference + existence + expected path alignment
  const hasRef = !isBlank(evidence.evidenceReference);
  const expected = pkg.expectedEvidence.trim();
  const refMatchesExpected =
    !isBlank(expected) &&
    (normalizePath(evidence.evidenceReference) === normalizePath(expected) ||
      normalizePath(evidence.evidenceReference).includes(
        normalizePath(expected).replace(/\/$/, ""),
      ) ||
      normalizePath(expected).includes(
        normalizePath(evidence.evidenceReference).replace(/\/$/, ""),
      ));
  const evidenceOk =
    hasRef &&
    evidence.evidenceExists &&
    evidence.changedFiles.length > 0 &&
    (isBlank(expected) || refMatchesExpected);
  checks.push(
    check(
      "EVIDENCE",
      evidenceOk,
      evidenceOk
        ? "Evidence reference, existence, and changed-files record present"
        : "Missing evidence reference, evidence artifact, changed-files record, or expected-path mismatch",
    ),
  );
  checks.push(
    check(
      "V-2",
      hasRef && evidence.evidenceExists,
      hasRef && evidence.evidenceExists
        ? `Evidence artifact present at ${evidence.evidenceReference}`
        : "Evidence artifact missing or reference empty",
    ),
  );

  // AC / V-3 — all acceptance criteria have PASS evidence
  const acList = evidence.acceptanceCriteriaEvidence;
  const acOk =
    Array.isArray(acList) &&
    acList.length > 0 &&
    acList.every((a) => a.status === "PASS" && !isBlank(a.criterion));
  const acFail = Array.isArray(acList) && acList.some((a) => a.status === "FAIL");
  checks.push(
    check(
      "AC",
      acOk && !acFail,
      acOk && !acFail
        ? `Acceptance criteria evidenced (${acList.length})`
        : acFail
          ? "One or more acceptance criteria marked FAIL"
          : "Missing acceptance criteria evidence",
    ),
  );
  checks.push(
    check(
      "V-3",
      acOk && !acFail,
      acOk && !acFail
        ? "Each Acceptance Criterion cited PASS"
        : "Acceptance Criteria not fully addressed",
    ),
  );

  // TESTS / V-4
  const testsOk =
    evidence.testResult.ran === true && evidence.testResult.passed === true;
  checks.push(
    check(
      "TESTS",
      testsOk,
      testsOk
        ? `Tests passed: ${evidence.testResult.summary}`
        : evidence.testResult.ran
          ? `Tests failed: ${evidence.testResult.summary}`
          : "Required tests did not run",
    ),
  );
  checks.push(
    check(
      "V-4",
      testsOk,
      testsOk
        ? "Test Requirement satisfied"
        : "Test Requirement not satisfied",
    ),
  );

  // V-5 — GAPs registered OPEN
  checks.push(
    check(
      "V-5",
      evidence.gapsRegisteredOpen === true,
      evidence.gapsRegisteredOpen
        ? "GAP registration rule satisfied (OPEN or none)"
        : "New GAPs not registered as OPEN",
    ),
  );

  // SCOPE / V-6 — changed files within allowed; not forbidden
  const allowed = extractPathPatterns(pkg.allowedScope);
  const forbidden = extractPathPatterns(pkg.forbiddenScope);
  const scopeViolations: string[] = [];
  for (const file of evidence.changedFiles) {
    const n = normalizePath(file);
    if (isForbiddenPath(n, forbidden)) {
      scopeViolations.push(`forbidden:${n}`);
    } else if (!isAllowedPath(n, allowed)) {
      scopeViolations.push(`undeclared:${n}`);
    }
  }
  const scopeOk = evidence.changedFiles.length > 0 && scopeViolations.length === 0;
  checks.push(
    check(
      "SCOPE",
      scopeOk,
      scopeOk
        ? "Changed files within allowed scope"
        : `Scope violation: ${scopeViolations.join(", ") || "no changed files"}`,
    ),
  );
  checks.push(
    check(
      "V-6",
      scopeOk,
      scopeOk
        ? "Forbidden scope not violated"
        : "Forbidden or undeclared scope paths present",
    ),
  );

  // V-7 — status transition safety (recommend only; never write registry)
  const statusOk =
    evidence.currentStatus === "READY_FOR_EXECUTION" ||
    evidence.currentStatus === "IN_PROGRESS";
  checks.push(
    check(
      "V-7",
      statusOk,
      statusOk
        ? `Status transition safe from ${evidence.currentStatus}`
        : `Unsafe status for completion recommendation: ${evidence.currentStatus}`,
    ),
  );

  // V-8 — SSOT citations
  checks.push(
    check(
      "V-8",
      evidence.ssotCitationsPresent === true,
      evidence.ssotCitationsPresent
        ? "SSOT citations present"
        : "SSOT citations missing",
    ),
  );

  // Deterministic order by check id
  checks.sort((a, b) => a.id.localeCompare(b.id));

  const failed = checks.filter((c) => !c.pass);
  if (failed.length > 0) {
    return {
      ok: false,
      recommendation: "BLOCKED",
      checks,
      failedCheckIds: failed.map((c) => c.id),
    };
  }

  return {
    ok: true,
    recommendation: "PASS",
    checks,
  };
}

/**
 * Deterministic JSON serialization of a Verifier result.
 */
export function verifierResultToJson(result: VerifierResult): string {
  if (result.ok) {
    return `${JSON.stringify(
      {
        ok: true,
        recommendation: result.recommendation,
        checks: result.checks,
      },
      null,
      2,
    )}\n`;
  }
  return `${JSON.stringify(
    {
      ok: false,
      recommendation: result.recommendation,
      failedCheckIds: result.failedCheckIds,
      checks: result.checks,
    },
    null,
    2,
  )}\n`;
}
