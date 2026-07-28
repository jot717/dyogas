/**
 * Decision product service — wraps personal-brain Decision Intelligence APIs.
 */

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  configureDecisionProductMemory,
  createDecisionRequest,
  getDecisionInbox,
  getDecisionAnalysis,
  approveDecision,
  rejectDecision,
  listDecisionHistory,
  extractUserDecisionDna,
  type DecisionRequestInput,
} from "@dyogas/personal-brain";
import {
  DecisionProductStore,
  type DecisionViewRecord,
  type PipelineStage,
  type ProductSession,
} from "./decision-store.js";

export type DecisionServiceOptions = {
  readonly memoryRoot: string;
};

function stagesFromCreate(): PipelineStage[] {
  return ["request", "research", "evidence", "decision_asset", "human_approval"];
}

export class DecisionProductService {
  readonly store = new DecisionProductStore();
  private tenancyReady = false;

  constructor(private readonly opts: DecisionServiceOptions) {
    mkdirSync(opts.memoryRoot, { recursive: true });
    configureDecisionProductMemory(opts.memoryRoot);
  }

  private ensureTenancy(session: ProductSession): void {
    propagate(createTenancyContext(createTenantId(session.tenant_id)));
    this.tenancyReady = true;
  }

  getSession(): ProductSession {
    return this.store.getSession();
  }

  setSession(input: { user_id?: string; tenant_id?: string }): ProductSession {
    return this.store.setSession(input);
  }

  async createRequest(body: {
    question: string;
    constraints?: Record<string, unknown>;
    desired_outcome: string;
    request_id?: string;
  }): Promise<DecisionViewRecord> {
    const session = this.store.getSession();
    this.ensureTenancy(session);
    const request_id =
      body.request_id?.trim() ||
      `WEB-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const input: DecisionRequestInput = {
      schema_version: "0.2.0",
      request_id,
      user_id: session.user_id,
      tenant_id: session.tenant_id,
      question: body.question.trim(),
      constraints: { ...(body.constraints ?? {}) },
      desired_outcome: body.desired_outcome.trim(),
      user_intent: body.question.trim(),
      workspace_id: `ws-web-${session.user_id}`,
    };
    if (!input.question || !input.desired_outcome) {
      throw new Error("question and desired_outcome required");
    }

    const created = await createDecisionRequest(input);
    const evidence_ids = created.researchArtifact.evidence.map(
      (e) => e.evidenceId,
    );
    const evidence_items = [...created.researchArtifact.evidence_views];
    const record: DecisionViewRecord = {
      proposalId: created.approvalGate.proposalId,
      requestId: request_id,
      user_id: session.user_id,
      tenant_id: session.tenant_id,
      question: input.question,
      constraints: input.constraints,
      desired_outcome: input.desired_outcome,
      status: "waiting_human",
      createdAt: new Date().toISOString(),
      research_report_ref: created.research.research_report_ref,
      research_brief_ref: created.research.research_brief_ref,
      evidence_count: created.research.evidence_count,
      evidence_ids,
      evidence_items,
      collector_adapter_id: created.researchArtifact.collector_adapter_id,
      research_elapsed_ms: created.researchArtifact.research_elapsed_ms,
      artifact_dir: created.runtimeArtifacts.dir,
      research_summary: created.researchSummary,
      decision_brief: created.decisionBrief,
      decision_asset: created.decisionAsset,
      stages_completed: stagesFromCreate(),
      autoApproved: false,
      host_status: created.hostRun.status,
    };
    this.store.put(record);
    return record;
  }

  inbox(): ReturnType<typeof getDecisionInbox> {
    const session = this.store.getSession();
    this.ensureTenancy(session);
    return getDecisionInbox({
      tenant_id: session.tenant_id,
      user_id: session.user_id,
    });
  }

  getDecision(proposalId: string): DecisionViewRecord {
    const session = this.store.getSession();
    const rec = this.store.get(proposalId);
    if (!rec || rec.user_id !== session.user_id || rec.tenant_id !== session.tenant_id) {
      throw new Error("decision not found for session");
    }
    this.ensureTenancy(session);
    const analysis = getDecisionAnalysis({
      proposalId,
      tenant_id: session.tenant_id,
      user_id: session.user_id,
      question: rec.question,
      constraints: rec.constraints,
    });
    return this.store.update(proposalId, {
      analysis,
      host_status:
        analysis.status === "waiting_human"
          ? "waiting_human"
          : rec.host_status,
    });
  }

  async approve(
    proposalId: string,
    body: {
      rationale?: string;
      chosen_option_id?: string;
      action?: "approve_option" | "request_more_evidence";
    } = {},
  ): Promise<DecisionViewRecord> {
    const session = this.store.getSession();
    const rec = this.getDecision(proposalId);
    if (rec.status !== "waiting_human") {
      throw new Error("decision is not waiting for human approval");
    }
    this.ensureTenancy(session);

    if (body.action === "request_more_evidence") {
      return this.store.update(proposalId, {
        status: "waiting_human",
        rationale:
          body.rationale?.trim() ||
          "Human requested more evidence before approval",
        host_status: "waiting_human",
      });
    }

    const chosen =
      body.chosen_option_id?.trim() ||
      (rec.decision_asset?.options?.[0] as { option_id?: string } | undefined)
        ?.option_id;
    if (!chosen) {
      throw new Error("chosen_option_id required to approve a Decision Asset option");
    }

    const approved = await approveDecision({
      proposalId,
      actorId: session.user_id,
      rationale: body.rationale,
      chosen_option_id: chosen,
    });
    if (!approved.decisionModel) {
      throw new Error("approval did not produce Decision Model");
    }
    let dna: unknown;
    try {
      dna = extractUserDecisionDna(session.tenant_id, session.user_id);
    } catch {
      dna = undefined;
    }
    const history = listDecisionHistory(session.tenant_id, session.user_id);
    const analysis = getDecisionAnalysis({
      proposalId,
      tenant_id: session.tenant_id,
      user_id: session.user_id,
      question: rec.question,
      constraints: rec.constraints,
    });
    return this.store.update(proposalId, {
      status: "approved",
      host_status: approved.hostRun.status,
      decisionModel: approved.decisionModel,
      rationale: approved.rationale ?? body.rationale,
      dna,
      history_snapshot: history,
      analysis,
      stages_completed: [
        ...rec.stages_completed,
        "completed",
      ] as PipelineStage[],
    });
  }

  async reject(
    proposalId: string,
    rationale?: string,
  ): Promise<DecisionViewRecord> {
    const session = this.store.getSession();
    const rec = this.getDecision(proposalId);
    if (rec.status !== "waiting_human") {
      throw new Error("decision is not waiting for human approval");
    }
    this.ensureTenancy(session);
    const rejected = await rejectDecision({
      proposalId,
      actorId: session.user_id,
      rationale,
    });
    return this.store.update(proposalId, {
      status: "rejected",
      host_status: rejected.hostRun.status,
      rationale: rejected.rationale ?? rationale,
      stages_completed: [...rec.stages_completed, "rejected"] as PipelineStage[],
    });
  }

  history(): ReturnType<typeof listDecisionHistory> {
    const session = this.store.getSession();
    this.ensureTenancy(session);
    return listDecisionHistory(session.tenant_id, session.user_id);
  }

  home(): {
    session: ProductSession;
    inbox: ReturnType<typeof getDecisionInbox>;
    history: ReturnType<typeof listDecisionHistory>;
    recent: DecisionViewRecord[];
  } {
    const session = this.store.getSession();
    this.ensureTenancy(session);
    return {
      session,
      inbox: this.inbox(),
      history: this.history(),
      recent: this.store.listForUser(session.user_id, session.tenant_id),
    };
  }
}

export function defaultMemoryRoot(cwd = process.cwd()): string {
  return join(cwd, "data", "decision-memory");
}
