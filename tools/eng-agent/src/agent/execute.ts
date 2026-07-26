/**
 * Engineering execution agent — authorize + record facts.
 * Executes only Task Registry–authorized / Gate-passed work.
 * Never invents verifier PASS. Never invents facts.
 */

import type {
  AuthorizeResult,
  AuthorizedExecution,
  ExecutionAgentInput,
  ExecutionResult,
} from "./types.js";
import type { AdaptedTask } from "../adapter/types.js";
import type { GateView } from "../adapter/types.js";
import { isForbiddenWritePath } from "../evidence/allowlist.js";

const LEGAL_STATUS = new Set(["READY_FOR_EXECUTION", "IN_PROGRESS"]);

function scopeViolation(
  changedFiles: readonly string[],
  forbiddenScope: string,
): string | null {
  for (const f of changedFiles) {
    if (isForbiddenWritePath(f)) {
      return `forbidden path in changedFiles: ${f}`;
    }
  }
  const lower = forbiddenScope.toLowerCase();
  const markers: Array<[string, RegExp]> = [
    ["runtime", /(^|\/)runtime\//i],
    ["sdk", /(^|\/)sdk\//i],
    ["agent-sdk", /(^|\/)(sdk|agent-sdk)\//i],
    ["execution host", /(^|\/)execution-host\//i],
    ["execution-host", /(^|\/)execution-host\//i],
  ];
  for (const [label, re] of markers) {
    if (lower.includes(label.replace("-", " ")) || lower.includes(label)) {
      for (const f of changedFiles) {
        if (re.test(f.replace(/\\/g, "/"))) {
          return `changedFiles violate forbiddenScope (${label}): ${f}`;
        }
      }
    }
  }
  return null;
}

/**
 * Authorize an adapted task. Gate must PASS; status must be executable.
 */
export function authorize(
  adapted: AdaptedTask,
  gate: GateView,
  currentStatus: ExecutionAgentInput["currentStatus"],
): AuthorizeResult {
  if (!gate.ok) {
    return { ok: false, reason: `unauthorized: gate failed (${gate.reason ?? "fail"})` };
  }
  if (!LEGAL_STATUS.has(currentStatus)) {
    return {
      ok: false,
      reason: `unauthorized: status ${currentStatus} is not executable`,
    };
  }
  if (!adapted.taskId.trim()) {
    return { ok: false, reason: "unauthorized: missing taskId" };
  }

  const authorized: AuthorizedExecution = {
    taskId: adapted.taskId,
    sprintId: adapted.sprintId,
    allowedScope: adapted.allowedScope,
    forbiddenScope: adapted.forbiddenScope,
  };
  return { ok: true, authorized };
}

/**
 * Authorize and accept supplied execution facts.
 * Does not invent facts or verifier PASS.
 */
export function authorizeAndExecute(input: ExecutionAgentInput): ExecutionResult {
  const auth = authorize(input.adapted, input.gate, input.currentStatus);
  if (!auth.ok) {
    return { ok: false, refused: true, reason: auth.reason };
  }

  const violation = scopeViolation(
    input.facts.changedFiles,
    input.adapted.forbiddenScope,
  );
  if (violation) {
    return { ok: false, refused: true, reason: violation };
  }

  return {
    ok: true,
    authorized: auth.authorized,
    facts: {
      changedFiles: [...input.facts.changedFiles],
      testResult: { ...input.facts.testResult },
      evidenceReference: input.facts.evidenceReference,
      evidenceExists: input.facts.evidenceExists,
      acceptanceCriteriaEvidence: input.facts.acceptanceCriteriaEvidence.map(
        (a) => ({ ...a }),
      ),
      ssotCitationsPresent: input.facts.ssotCitationsPresent,
      gapsRegisteredOpen: input.facts.gapsRegisteredOpen,
    },
    verifierPassInvented: false,
  };
}
