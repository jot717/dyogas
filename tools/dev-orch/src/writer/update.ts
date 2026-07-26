/**
 * Task Registry writer (Runbook §8).
 *
 * Allowed transitions:
 *   READY_FOR_EXECUTION → IN_PROGRESS → DONE
 *   IN_PROGRESS → BLOCKED
 *
 * Cannot: invent tasks, close GAPs, bypass verifier, mark DONE without PASS.
 * Idempotent when already at target with matching evidence.
 */
import { parseTaskRegistryMarkdown } from "../parse/registry.js";
import type { EvidenceRecord } from "../evidence/types.js";
import type { TaskStatusToken } from "../types.js";
import { isWriteAllowed } from "./allowlist.js";
import type {
  RegistryWriteRequest,
  RegistryWriteResult,
  WritableStatus,
} from "./types.js";

function isBlank(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0;
}

export { isWriteAllowed } from "./allowlist.js";

function isLegalTransition(
  from: TaskStatusToken,
  to: WritableStatus,
): boolean {
  if (from === to) return true; // idempotent candidate
  if (from === "READY_FOR_EXECUTION" && to === "IN_PROGRESS") return true;
  if (from === "IN_PROGRESS" && (to === "DONE" || to === "BLOCKED")) return true;
  return false;
}

function formatStatus(to: WritableStatus, evidence?: EvidenceRecord): string {
  const date =
    evidence?.timestamp?.slice(0, 10) ??
    new Date().toISOString().slice(0, 10);
  if (to === "DONE") return `**DONE** (${date})`;
  if (to === "BLOCKED") return `**BLOCKED** (${date})`;
  return `**IN_PROGRESS** (${date})`;
}

function formatEvidenceCell(evidence: EvidenceRecord): string {
  return `\`${evidence.evidence_path}\` · verifier ${evidence.verifier_status}`;
}

/**
 * Apply a status transition to Task Registry markdown (in memory).
 */
export function applyRegistryUpdate(
  request: RegistryWriteRequest,
): RegistryWriteResult {
  if (request.targetPath && !isWriteAllowed(request.targetPath)) {
    return {
      ok: false,
      error: `write path not allowlisted or GAP registry forbidden: ${request.targetPath}`,
    };
  }

  const parsed = parseTaskRegistryMarkdown(request.markdown);
  if (!parsed.ok) {
    return { ok: false, error: `invalid registry: ${parsed.error}` };
  }

  const task = parsed.registry.tasks.find((t) => t.id === request.taskId);
  if (!task) {
    return {
      ok: false,
      error: `cannot create tasks: unknown Task ID '${request.taskId}'`,
    };
  }

  const from = task.status;
  const to = request.to;

  if (!isLegalTransition(from, to)) {
    return {
      ok: false,
      error: `illegal transition ${from} → ${to}`,
    };
  }

  // DONE requires PASS evidence — cannot bypass verifier
  if (to === "DONE") {
    if (!request.evidence) {
      return { ok: false, error: "cannot mark DONE without PASS evidence" };
    }
    if (request.evidence.verifier_status !== "PASS") {
      return {
        ok: false,
        error: "cannot mark DONE without verifier PASS (bypass forbidden)",
      };
    }
    if (request.evidence.task_id !== request.taskId) {
      return {
        ok: false,
        error: "evidence task_id does not match write target",
      };
    }
  }

  // Idempotent: already at target
  if (from === to) {
    if (to === "DONE") {
      const existing = task.evidence ?? "";
      const path = request.evidence?.evidence_path ?? "";
      if (path && existing.includes(path)) {
        return {
          ok: true,
          markdown: request.markdown,
          from,
          to,
          idempotent: true,
        };
      }
      // Same status but evidence refresh still allowed only if PASS evidence provided
      if (!request.evidence || request.evidence.verifier_status !== "PASS") {
        return {
          ok: true,
          markdown: request.markdown,
          from,
          to,
          idempotent: true,
        };
      }
    } else {
      return {
        ok: true,
        markdown: request.markdown,
        from,
        to,
        idempotent: true,
      };
    }
  }

  let next = updateTaskStatusInMarkdown(
    request.markdown,
    request.taskId,
    to,
    request.evidence,
  );

  if (request.nextExecutableTaskId !== undefined) {
    next = updateCurrentExecutable(next, request.nextExecutableTaskId);
  } else if (to === "DONE") {
    // Advance pointer away from completed task when pointer matches
    const pointer = parsed.registry.currentExecutableTask;
    if (pointer === request.taskId) {
      next = updateCurrentExecutable(next, null);
    }
  }

  // dryRun flag reserved for CLI (P2-08); writer still returns markdown either way
  void request.dryRun;

  return {
    ok: true,
    markdown: next,
    from,
    to,
    idempotent: false,
  };
}

function updateTaskStatusInMarkdown(
  markdown: string,
  taskId: string,
  to: WritableStatus,
  evidence?: EvidenceRecord,
): string {
  const idx = markdown.search(
    new RegExp(`^###\\s+${escapeRegExp(taskId)}\\s+[—–-]`, "m"),
  );
  if (idx < 0) return markdown;
  const rest = markdown.slice(idx);
  const nextHeading = rest.slice(1).search(/^###\s+/m);
  const end = nextHeading < 0 ? markdown.length : idx + 1 + nextHeading;
  const block = markdown.slice(idx, end);
  const updated = rewriteTaskBlock(block, to, evidence);
  return markdown.slice(0, idx) + updated + markdown.slice(end);
}

function rewriteTaskBlock(
  block: string,
  to: WritableStatus,
  evidence?: EvidenceRecord,
): string {
  const statusLine = `| **Status** | ${formatStatus(to, evidence)} |`;
  let out = block.replace(
    /^\|\s*\*\*Status\*\*\s*\|\s*.*?\s*\|\s*$/m,
    statusLine,
  );

  const evidenceLine = evidence
    ? `| **Evidence** | ${formatEvidenceCell(evidence)} |`
    : null;

  if (evidenceLine) {
    if (/^\|\s*\*\*Evidence\*\*\s*\|/m.test(out)) {
      out = out.replace(
        /^\|\s*\*\*Evidence\*\*\s*\|\s*.*?\s*\|\s*$/m,
        evidenceLine,
      );
    } else {
      // Insert Evidence row after Status
      out = out.replace(statusLine, `${statusLine}\n${evidenceLine}`);
    }
  }

  // Do not alter Objective / AC / Dependencies (task definition immutable)
  return out;
}

function updateCurrentExecutable(
  markdown: string,
  nextId: string | null,
): string {
  const value =
    nextId === null || isBlank(nextId)
      ? "**None**"
      : `**${nextId.trim()}**`;
  if (/\*\*Current executable task:\*\*/i.test(markdown)) {
    return markdown.replace(
      /\*\*Current executable task:\*\*\s*.+$/im,
      `**Current executable task:** ${value}`,
    );
  }
  return markdown;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
