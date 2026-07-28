/**
 * Host-owned Stage-1 capability path — no Runtime admit/start/succeed.
 * Host remains sole orchestrator (ADR-0010 / H-02).
 *
 * Emits a ResearchReport **candidate payload** only (schema-shaped).
 * Host validates, SDK-emits, seals, and lineages.
 *
 * Band A (SPRINT-RESEARCH-AGENT-MVP-001): pluggable collector, budget/provenance/
 * allowlist guards, machine-readable CollectionRunEvidence. No network egress.
 */

import { getClock } from "@dyogas/kernel";
import { createResearchTask, type ResearchBrief, type ResearchTask } from "./task.js";
import {
  createMockSourceCollector,
  type EvidenceItem,
  type SourceCollector,
} from "./sources.js";
import {
  buildCollectionRunEvidence,
  collectUnderBudget,
  type CollectionRunEvidence,
} from "./collection.js";

/** Schema-aligned ResearchReport candidate (schemas/artifacts/research-report.schema.json). */
export type ResearchReportCandidate = {
  readonly brief_ref: {
    readonly brief_id: string;
    readonly question?: string;
  };
  readonly evidence_items: readonly {
    readonly evidence_id: string;
    readonly source_class: "youtube" | "github" | "reddit" | "web" | "other";
    readonly title?: string;
    readonly excerpt?: string;
    readonly provenance: {
      readonly pointer: string;
      readonly retrieved_at?: string;
    };
    readonly signal_tier?: "primary" | "secondary" | "community" | "unknown";
  }[];
  readonly coverage_gaps: readonly string[];
  readonly open_questions: readonly string[];
};

export type ExecuteResearchOptions = {
  readonly brief: ResearchBrief;
  /** Bootstrap Brief id for brief_ref (Host lineage). */
  readonly brief_id: string;
  /** Injected collector — defaults to mock (no network). */
  readonly collector?: SourceCollector;
  /** Injectable clock (ms) for budget tests. */
  readonly nowMs?: () => number;
};

export type ResearchExecuteResult = {
  readonly task: ResearchTask;
  readonly evidence: readonly EvidenceItem[];
  /** Unsealed ResearchReport candidate payload — Host must validate before seal. */
  readonly candidate: ResearchReportCandidate;
  /** Runtime-generated collection evidence (SAC-7). */
  readonly runEvidence: CollectionRunEvidence;
};

function toSchemaSourceClass(
  sourceClass: EvidenceItem["metadata"]["sourceClass"],
): ResearchReportCandidate["evidence_items"][number]["source_class"] {
  if (sourceClass === "mock") return "other";
  return sourceClass;
}

function toResearchReportCandidate(
  briefId: string,
  brief: ResearchBrief,
  evidence: readonly EvidenceItem[],
  coverageGaps: readonly string[],
  openQuestions: readonly string[],
): ResearchReportCandidate {
  return {
    brief_ref: {
      brief_id: briefId,
      question: brief.question,
    },
    evidence_items: evidence.map((e) => ({
      evidence_id: e.evidenceId,
      source_class: toSchemaSourceClass(e.metadata.sourceClass),
      title: e.metadata.title,
      excerpt: e.excerpt,
      provenance: {
        pointer: e.metadata.pointer,
        retrieved_at: e.metadata.retrievedAt,
      },
      signal_tier: "unknown" as const,
    })),
    coverage_gaps: [...coverageGaps],
    open_questions: [...openQuestions],
  };
}

/**
 * Execute Research Engine collection capability for Host Stage 1.
 *
 * Does **not** call Runtime admit/start/succeed or SDK emitCandidate.
 * Does **not** create a shadow pipeline run.
 * Does **not** perform network egress (Band A).
 */
export async function execute(
  opts: ExecuteResearchOptions,
): Promise<ResearchExecuteResult> {
  if (!opts.brief_id.trim()) {
    throw new Error("brief_id required");
  }
  const clock = getClock();
  const nowIso = clock.nowIso();
  let task = createResearchTask(opts.brief, nowIso);
  const collector = opts.collector ?? createMockSourceCollector();
  task = { ...task, status: "collecting" };

  const collected = await collectUnderBudget({
    brief: opts.brief,
    collector,
    nowIso,
    nowMs: opts.nowMs,
  });

  const candidate = toResearchReportCandidate(
    opts.brief_id,
    opts.brief,
    collected.evidence,
    collected.coverageGaps,
    collected.openQuestions,
  );

  const runEvidence = buildCollectionRunEvidence({
    briefId: opts.brief_id,
    brief: opts.brief,
    collectorAdapterId: collector.adapterId,
    generatedAt: nowIso,
    evidence: collected.evidence,
    coverageGaps: collected.coverageGaps,
    openQuestions: collected.openQuestions,
    budget: collected.budget,
    rejected_sources: collected.rejected_sources,
  });

  task = { ...task, status: "ready_for_review" };

  return {
    task,
    evidence: collected.evidence,
    candidate,
    runEvidence,
  };
}
