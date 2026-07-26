/**
 * Evidence collector (Runbook §7).
 * Builds an EvidenceRecord from package + verifier + execution facts.
 * Must NOT invent evidence, close GAPs, or create tasks.
 */
import type { ExecutionPackage } from "../package/types.js";
import type { VerifierResult } from "../verifier/types.js";
import type {
  CollectResult,
  EvidenceRecord,
  ExecutionResultFacts,
} from "./types.js";

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

function pathsAlign(a: string, b: string): boolean {
  const na = normalizePath(a);
  const nb = normalizePath(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

/**
 * Collect evidence after verification. Fail-closed on missing/fake inputs.
 */
export function collectEvidence(
  pkg: ExecutionPackage,
  verifier: VerifierResult | null | undefined,
  execution: ExecutionResultFacts,
): CollectResult {
  if (!verifier) {
    return { ok: false, error: "missing verifier result" };
  }

  if (isBlank(pkg.taskId) || isBlank(pkg.sprintId)) {
    return { ok: false, error: "package missing task_id or sprint_id" };
  }

  if (isBlank(execution.evidence_path)) {
    return { ok: false, error: "missing evidence_path" };
  }

  if (!execution.evidence_exists) {
    return {
      ok: false,
      error: "reject fake evidence: evidence artifact does not exist",
    };
  }

  if (!pathsAlign(execution.evidence_path, pkg.expectedEvidence)) {
    return {
      ok: false,
      error: `reject fake evidence: evidence_path '${execution.evidence_path}' does not match package expectedEvidence '${pkg.expectedEvidence}'`,
    };
  }

  if (!Array.isArray(execution.changed_files) || execution.changed_files.length === 0) {
    return {
      ok: false,
      error: "reject fake evidence: changed_files record is empty",
    };
  }

  if (!execution.test_result || typeof execution.test_result.ran !== "boolean") {
    return { ok: false, error: "missing test_result" };
  }

  // Evidence path should appear in changed files OR be the declared expected path
  // (docs evidence may be written separately but must not be invented).
  const evidenceNorm = normalizePath(execution.evidence_path);
  const listed = execution.changed_files.some(
    (f) => normalizePath(f) === evidenceNorm,
  );
  if (!listed && !pathsAlign(execution.evidence_path, pkg.expectedEvidence)) {
    return {
      ok: false,
      error: "reject fake evidence: evidence_path not grounded in execution facts",
    };
  }

  const record: EvidenceRecord = {
    task_id: pkg.taskId.trim(),
    sprint_id: pkg.sprintId.trim(),
    timestamp: execution.timestamp ?? new Date().toISOString(),
    changed_files: Object.freeze([...execution.changed_files.map(normalizePath)]),
    test_result: {
      ran: execution.test_result.ran,
      passed: execution.test_result.passed,
      summary: execution.test_result.summary,
    },
    verifier_status: verifier.recommendation,
    evidence_path: evidenceNorm,
  };

  return { ok: true, record };
}

/** Deterministic JSON for an evidence record. */
export function evidenceRecordToJson(record: EvidenceRecord): string {
  return `${JSON.stringify(
    {
      task_id: record.task_id,
      sprint_id: record.sprint_id,
      timestamp: record.timestamp,
      changed_files: [...record.changed_files],
      test_result: record.test_result,
      verifier_status: record.verifier_status,
      evidence_path: record.evidence_path,
    },
    null,
    2,
  )}\n`;
}
