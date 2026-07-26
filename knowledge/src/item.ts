import { generateId, getClock, requireTenant, TenancyError } from "@dyogas/kernel";
import type { KnowledgeHandoffContract } from "@dyogas/research-engine";

export class KnowledgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeError";
  }
}

export type KnowledgeApprovalState =
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "applied";

export interface ProvenanceRecord {
  readonly researchArtifactId: string;
  readonly taskId: string;
  readonly evidenceIds: readonly string[];
  readonly capturedAt: string;
}

export interface KnowledgeItem {
  readonly knowledgeId: string;
  readonly tenantId: string;
  readonly title: string;
  readonly body: string;
  readonly version: number;
  readonly approvalState: KnowledgeApprovalState;
  readonly provenance: ProvenanceRecord;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface HumanApprovalRecord {
  readonly decision: "approved" | "rejected";
  readonly researchArtifactId: string;
  readonly decidedAt: string;
  readonly note?: string;
}

function requireTenancy() {
  try {
    return requireTenant();
  } catch (err) {
    if (err instanceof TenancyError) throw new KnowledgeError(err.message);
    throw err;
  }
}

/** Create draft knowledge item from Research knowledge handoff (not SoR apply). */
export function createKnowledgeDraft(
  handoff: KnowledgeHandoffContract,
  content: { title: string; body: string },
): KnowledgeItem {
  const tenancy = requireTenancy();
  if (handoff.tenantId !== tenancy.tenantId) {
    throw new KnowledgeError("tenancy mismatch on handoff");
  }
  if (!handoff.requiresHumanApproval) {
    throw new KnowledgeError("handoff must require human approval");
  }
  if (handoff.sorWriteAllowed) {
    throw new KnowledgeError("research handoff must not pre-authorize SoR write");
  }
  if (!content.title.trim() || !content.body.trim()) {
    throw new KnowledgeError("title and body required");
  }
  const now = getClock().nowIso();
  return {
    knowledgeId: generateId(),
    tenantId: tenancy.tenantId,
    title: content.title,
    body: content.body,
    version: 0,
    approvalState: "pending_approval",
    provenance: {
      researchArtifactId: handoff.researchArtifactId,
      taskId: handoff.taskId,
      evidenceIds: [...handoff.evidenceIds],
      capturedAt: now,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function applyApproval(
  item: KnowledgeItem,
  approval: HumanApprovalRecord,
): KnowledgeItem {
  if (item.approvalState === "applied") {
    throw new KnowledgeError("already applied to SoR");
  }
  if (approval.researchArtifactId !== item.provenance.researchArtifactId) {
    throw new KnowledgeError("approval artifact mismatch");
  }
  const now = getClock().nowIso();
  if (approval.decision === "rejected") {
    return { ...item, approvalState: "rejected", updatedAt: now };
  }
  return { ...item, approvalState: "approved", updatedAt: now };
}
