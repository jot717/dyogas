import { getClock, requireTenant } from "@dyogas/kernel";
import { createMemoryAuditSink, requireTrustIdentity, type AuditSink } from "@dyogas/trust";
import { admitRun, startRun, succeed } from "@dyogas/runtime";
import type { KnowledgeHandoffContract } from "@dyogas/research-engine";
import {
  applyApproval,
  createKnowledgeDraft,
  type HumanApprovalRecord,
  type KnowledgeItem,
} from "./item.js";
import { createMemoryKnowledgeSoR, type KnowledgeSoR } from "./sor.js";
import { buildGraphRetrievalContract } from "./graph-retrieval.js";
import { buildMarkdownHandoff } from "./markdown-handoff.js";

export interface KnowledgeApplyResult {
  readonly item: KnowledgeItem;
  readonly graphRetrieval: ReturnType<typeof buildGraphRetrievalContract>;
  readonly markdownHandoff: ReturnType<typeof buildMarkdownHandoff>;
  readonly audit: AuditSink;
}

export interface ApplyApprovedKnowledgeOptions {
  readonly handoff: KnowledgeHandoffContract;
  readonly content: { title: string; body: string };
  readonly approval: Omit<HumanApprovalRecord, "decidedAt"> & { decidedAt?: string };
  readonly sor?: KnowledgeSoR;
  readonly audit?: AuditSink;
}

/**
 * Draft from Research handoff → record Human Approval → apply to SoR.
 * Rejects if approval is not `approved`.
 */
export function applyApprovedKnowledge(
  opts: ApplyApprovedKnowledgeOptions,
): KnowledgeApplyResult {
  requireTenant();
  requireTrustIdentity();
  const audit = opts.audit ?? createMemoryAuditSink();
  const sor = opts.sor ?? createMemoryKnowledgeSoR();

  let run = admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: "knowledge-review-agent@1.0.0",
    audit,
  });
  run = startRun(run);

  let item = createKnowledgeDraft(opts.handoff, opts.content);
  const approval: HumanApprovalRecord = {
    decision: opts.approval.decision,
    researchArtifactId: opts.approval.researchArtifactId,
    decidedAt: opts.approval.decidedAt ?? getClock().nowIso(),
    note: opts.approval.note,
  };
  item = applyApproval(item, approval);
  const applied = sor.apply(item);

  const graphRetrieval = buildGraphRetrievalContract(applied);
  const markdownHandoff = buildMarkdownHandoff(applied);

  audit.append({
    type: "knowledge.sor.applied",
    knowledge_id: applied.knowledgeId,
    version: String(applied.version),
  });

  succeed(run);

  return { item: applied, graphRetrieval, markdownHandoff, audit };
}

export { createMemoryKnowledgeSoR };
export type { KnowledgeSoR };
