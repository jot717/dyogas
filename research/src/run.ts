import { getClock, generateId } from "@dyogas/kernel";
import { createMemoryAuditSink, requireTrustIdentity, type AuditSink } from "@dyogas/trust";
import { admitRun, startRun, succeed, type RuntimeRun } from "@dyogas/runtime";
import {
  bindContract,
  emitCandidate,
  invokeSkill,
  type CandidateArtifact,
} from "@dyogas/agent-sdk";
import { createResearchTask, type ResearchBrief, type ResearchTask } from "./task.js";
import {
  createMockSourceCollector,
  type EvidenceItem,
  type SourceCollector,
} from "./sources.js";
import { createEvidenceLedger } from "./evidence.js";
import {
  createPendingApprovalHandoff,
  type HumanApprovalHandoff,
} from "./approval.js";
import {
  buildKnowledgeHandoff,
  type KnowledgeHandoffContract,
} from "./knowledge-handoff.js";

export interface ResearchRunResult {
  readonly task: ResearchTask;
  readonly run: RuntimeRun;
  readonly evidence: readonly EvidenceItem[];
  readonly candidate: CandidateArtifact;
  readonly approvalHandoff: HumanApprovalHandoff;
  readonly knowledgeHandoff: KnowledgeHandoffContract;
  readonly audit: AuditSink;
}

export interface RunResearchOptions {
  readonly brief: ResearchBrief;
  readonly collector?: SourceCollector;
  readonly audit?: AuditSink;
}

/**
 * End-to-end Research Engine MVP path (mock sources).
 * Uses Runtime + Agent SDK + Trust + Kernel — does not rebuild them.
 */
export async function runResearchMvp(
  opts: RunResearchOptions,
): Promise<ResearchRunResult> {
  requireTrustIdentity();
  const audit = opts.audit ?? createMemoryAuditSink();
  const clock = getClock();
  let task = createResearchTask(opts.brief, clock.nowIso());

  const binding = bindContract({
    agentId: "research-agent",
    contractVersion: "1.0.0",
    allowedSkills: ["web-research"],
    satisfiedPreconditions: ["tenancy_present"],
  });

  let run = admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: `${binding.agentId}@${binding.contractVersion}`,
    audit,
  });
  run = startRun(run);

  const collector = opts.collector ?? createMockSourceCollector();
  const ledger = createEvidenceLedger();
  task = { ...task, status: "collecting" };

  const skillOut = await invokeSkill(
    binding,
    "web-research",
    { question: opts.brief.question },
    {
      "web-research": async () => {
        const classes = opts.brief.allowedSourceClasses;
        const perClass = Math.max(1, Math.ceil(opts.brief.maxItems / classes.length));
        const all: EvidenceItem[] = [];
        for (const sourceClass of classes) {
          const batch = await collector.collect({
            question: opts.brief.question,
            sourceClass,
            limit: perClass,
            nowIso: clock.nowIso(),
          });
          all.push(...batch);
        }
        return { collected: all.length };
      },
    },
  );

  // Collect explicitly for evidence ledger (skill stub may only return counts)
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
  void skillOut;

  const candidate = emitCandidate(binding, {
    artifactType: "research-report",
    tenantId: task.tenantId,
    payload: {
      question: opts.brief.question,
      evidence: evidence.map((e) => ({
        evidence_id: e.evidenceId,
        excerpt: e.excerpt,
        provenance: e.metadata,
      })),
      coverage_gaps: evidence.length === 0 ? ["no evidence collected"] : [],
    },
  });

  const approvalHandoff = createPendingApprovalHandoff({
    handoffId: generateId(),
    taskId: task.taskId,
    tenantId: task.tenantId,
    researchArtifactId: candidate.artifactId,
  });

  const knowledgeHandoff = buildKnowledgeHandoff({
    taskId: task.taskId,
    tenantId: task.tenantId,
    researchArtifactId: candidate.artifactId,
    evidenceIds: evidence.map((e) => e.evidenceId),
  });

  task = { ...task, status: "ready_for_review" };
  run = succeed(run);

  audit.append({
    type: "research.mvp.completed",
    task_id: task.taskId,
    evidence_count: String(evidence.length),
    approval: approvalHandoff.decision,
  });

  return {
    task,
    run,
    evidence,
    candidate,
    approvalHandoff,
    knowledgeHandoff,
    audit,
  };
}
