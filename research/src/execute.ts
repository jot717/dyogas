/**
 * Host-owned Stage-1 capability path — no Runtime admit/start/succeed.
 * Host remains sole orchestrator (ADR-0010 / H-02).
 *
 * Emits a ResearchReport **candidate payload** only (schema-shaped).
 * Host validates, SDK-emits, seals, and lineages.
 */

import { getClock } from "@dyogas/kernel";
import { createResearchTask, type ResearchBrief, type ResearchTask } from "./task.js";
import {
  createMockSourceCollector,
  type EvidenceItem,
  type SourceCollector,
} from "./sources.js";
import { createEvidenceLedger } from "./evidence.js";

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
  readonly collector?: SourceCollector;
};

export type ResearchExecuteResult = {
  readonly task: ResearchTask;
  readonly evidence: readonly EvidenceItem[];
  /** Unsealed ResearchReport candidate payload — Host must validate before seal. */
  readonly candidate: ResearchReportCandidate;
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
    coverage_gaps:
      evidence.length === 0
        ? (["no evidence collected"] as const)
        : ([] as const),
    open_questions: [] as const,
  };
}

/**
 * Execute Research Engine collection capability for Host Stage 1.
 *
 * Does **not** call Runtime admit/start/succeed or SDK emitCandidate.
 * Does **not** create a shadow pipeline run.
 */
export async function execute(
  opts: ExecuteResearchOptions,
): Promise<ResearchExecuteResult> {
  if (!opts.brief_id.trim()) {
    throw new Error("brief_id required");
  }
  const clock = getClock();
  let task = createResearchTask(opts.brief, clock.nowIso());
  const collector = opts.collector ?? createMockSourceCollector();
  const ledger = createEvidenceLedger();
  task = { ...task, status: "collecting" };

  for (const sourceClass of opts.brief.allowedSourceClasses) {
    const batch = await collector.collect({
      question: opts.brief.question,
      sourceClass,
      limit: opts.brief.maxItems,
      nowIso: clock.nowIso(),
    });
    ledger.add(batch);
  }

  const evidence = ledger.list().slice(0, opts.brief.maxItems);
  const candidate = toResearchReportCandidate(
    opts.brief_id,
    opts.brief,
    evidence,
  );
  task = { ...task, status: "ready_for_review" };

  return { task, evidence, candidate };
}
