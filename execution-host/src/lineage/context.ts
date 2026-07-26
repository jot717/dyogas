/**
 * SPRINT-EXECUTION-HOST-001 — Group G lineage propagator (T-G1..G3).
 * Fail closed on orphan / broken chain / cross-tenant.
 */

import { createHash } from "node:crypto";
import { HostError } from "../errors.js";
import type { LineageSnapshot } from "../api.js";
import {
  TRUSTED_PATH_ORDER,
  type LineageAppendInput,
  type LineageRecord,
  type TrustedArtifactKind,
} from "./types.js";

export type LineageContext = {
  readonly correlation_id: string;
  readonly tenant_id: string;
  readonly run_id: string;
  readonly pipeline_id: string;
  readonly records: LineageRecord[];
  /** Legacy string refs for executor compatibility. */
  artifactRefs: string[];
};

export function createLineageContext(args: {
  correlation_id: string;
  tenant_id: string;
  run_id: string;
  pipeline_id: string;
}): LineageContext {
  return {
    correlation_id: args.correlation_id,
    tenant_id: args.tenant_id,
    run_id: args.run_id,
    pipeline_id: args.pipeline_id,
    records: [],
    artifactRefs: [],
  };
}

export function computeDigest(parts: readonly string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

function expectedNextKind(ctx: LineageContext): TrustedArtifactKind | undefined {
  const n = ctx.records.length;
  return TRUSTED_PATH_ORDER[n];
}

function lastRecord(ctx: LineageContext): LineageRecord | undefined {
  return ctx.records[ctx.records.length - 1];
}

/**
 * Append a sealed lineage record. Orphans / wrong order / tenancy mismatch fail closed.
 */
export function appendLineage(
  ctx: LineageContext,
  input: LineageAppendInput,
  nowIso: string = new Date().toISOString(),
): LineageRecord {
  if (input.correlation_id !== ctx.correlation_id) {
    throw new HostError(
      "LINEAGE_CORRELATION_MISMATCH",
      "correlation_id must match run lineage context",
    );
  }
  if (input.tenant_id !== ctx.tenant_id) {
    throw new HostError(
      "LINEAGE_TENANCY_VIOLATION",
      "cross-tenant lineage attachment rejected",
    );
  }
  if (input.run_id !== ctx.run_id || input.pipeline_id !== ctx.pipeline_id) {
    throw new HostError(
      "LINEAGE_RUN_MISMATCH",
      "run_id/pipeline_id must match lineage context",
    );
  }

  const expected = expectedNextKind(ctx);
  if (!expected || input.kind !== expected) {
    throw new HostError(
      "LINEAGE_ORDER_VIOLATION",
      `expected ${expected ?? "end"}, got ${input.kind}`,
    );
  }

  const prev = lastRecord(ctx);
  let parent_ids: readonly string[];
  if (input.kind === "ResearchBrief") {
    parent_ids = input.parent_ids ?? [];
    if (parent_ids.length > 0) {
      throw new HostError(
        "LINEAGE_ORPHAN",
        "ResearchBrief must have empty parent_ids",
      );
    }
  } else {
    if (!prev) {
      throw new HostError("LINEAGE_ORPHAN", "missing parent for non-root artifact");
    }
    parent_ids = input.parent_ids ?? [prev.artifact_id];
    if (!parent_ids.includes(prev.artifact_id)) {
      throw new HostError(
        "LINEAGE_ORPHAN",
        "parent_ids must include immediate predecessor",
      );
    }
  }

  const digest = computeDigest([
    input.artifact_id,
    input.version,
    input.kind,
    input.pipeline_id,
    input.run_id,
    input.stage_id,
    ...parent_ids,
    input.payloadHint ?? "",
    nowIso,
  ]);

  const record: LineageRecord = Object.freeze({
    artifact_id: input.artifact_id,
    parent_ids: Object.freeze([...parent_ids]),
    version: input.version,
    pipeline_id: input.pipeline_id,
    run_id: input.run_id,
    stage_id: input.stage_id,
    digest,
    timestamp: nowIso,
    kind: input.kind,
    tenant_id: input.tenant_id,
    correlation_id: input.correlation_id,
  });

  ctx.records.push(record);
  ctx.artifactRefs.push(`${record.artifact_id}@${record.version}`);
  return record;
}

/** Reject orphan candidate that lacks required parent linkage. */
export function assertNotOrphan(
  ctx: LineageContext,
  kind: TrustedArtifactKind,
  parent_ids: readonly string[],
): void {
  if (kind === "ResearchBrief") {
    if (parent_ids.length !== 0) {
      throw new HostError("LINEAGE_ORPHAN", "Brief cannot declare parents");
    }
    return;
  }
  const prev = lastRecord(ctx);
  if (!prev || !parent_ids.includes(prev.artifact_id)) {
    throw new HostError(
      "LINEAGE_ORPHAN",
      `orphan ${kind}: missing parent linkage`,
    );
  }
}

export function requireApprovalBeforeApply(ctx: LineageContext): LineageRecord {
  const approval = ctx.records.find((r) => r.kind === "HumanReviewDecision");
  if (!approval) {
    throw new HostError(
      "LINEAGE_APPROVAL_REQUIRED",
      "Knowledge/Graph apply blocked without HumanReviewDecision in lineage",
    );
  }
  return approval;
}

export function toLineageSnapshot(ctx: LineageContext): LineageSnapshot {
  const byKind = (k: TrustedArtifactKind): string | undefined => {
    const r = ctx.records.find((x) => x.kind === k);
    return r ? `${r.artifact_id}@${r.version}` : undefined;
  };
  return {
    correlation_id: ctx.correlation_id,
    research_brief_ref: byKind("ResearchBrief"),
    research_report_ref: byKind("ResearchReport"),
    validation_report_ref: byKind("ValidationReport"),
    proposal_ref: byKind("Proposal"),
    human_decision_ref: byKind("HumanReviewDecision"),
    knowledge_ref: byKind("Knowledge"),
    graph_update_ref: byKind("GraphUpdate"),
  };
}

/** Map pipeline stage index → primary output kind for pre-human stages. */
export function stageOutputKind(stageIndex: number): TrustedArtifactKind | undefined {
  switch (stageIndex) {
    case 1:
      return "ResearchReport";
    case 2:
      return "ValidationReport";
    case 3:
      return "Proposal";
    default:
      return undefined;
  }
}

/** @deprecated use createLineageContext with run metadata */
export function recordArtifactRef(
  ctx: LineageContext,
  ref: string,
): LineageContext {
  ctx.artifactRefs.push(ref);
  return ctx;
}
