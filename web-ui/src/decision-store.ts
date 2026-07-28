/**
 * Decision product session + in-memory view store for browser MVP.
 * No production auth provider.
 */

export type ProductSession = {
  readonly user_id: string;
  readonly tenant_id: string;
};

export type PipelineStage =
  | "request"
  | "research"
  | "evidence"
  | "decision_asset"
  | "human_approval"
  | "completed"
  | "rejected";

export type DecisionViewRecord = {
  readonly proposalId: string;
  readonly requestId: string;
  readonly user_id: string;
  readonly tenant_id: string;
  readonly question: string;
  readonly constraints: Record<string, unknown>;
  readonly desired_outcome: string;
  readonly status: "waiting_human" | "approved" | "rejected";
  readonly createdAt: string;
  readonly research_report_ref?: string;
  readonly research_brief_ref?: string;
  readonly evidence_count: number;
  readonly evidence_ids: readonly string[];
  readonly evidence_items: readonly {
    readonly evidence_id: string;
    readonly source_url: string;
    readonly source_class: string;
    readonly title?: string;
    readonly timestamp: string;
    readonly extracted_claim?: string;
    readonly relevance_reason?: string;
    readonly confidence?: number;
    readonly provenance: {
      readonly pointer: string;
      readonly retrieved_at: string;
    };
    readonly adapter: string;
  }[];
  readonly collector_adapter_id?: string;
  readonly research_elapsed_ms?: number;
  readonly artifact_dir?: string;
  readonly research_summary?: {
    readonly research_intents?: readonly string[];
    readonly decision_domain?: string;
    readonly decision_factors?: readonly string[];
    readonly key_findings: readonly string[];
    readonly market_signals: readonly string[];
    readonly risks: readonly string[];
    readonly decision_options_preview: readonly string[];
    readonly evidence_count: number;
    readonly status: "WAITING_HUMAN";
    readonly automatic_recommendation: false;
  };
  readonly decision_brief?: {
    readonly question: string;
    readonly context?: string;
    readonly decision_domain: string;
    readonly domain?: string;
    readonly user_goal?: string;
    readonly decision_factors: readonly string[];
    readonly research_factors?: readonly string[];
    readonly key_findings?: readonly string[];
    readonly key_factors: readonly {
      readonly factor: string;
      readonly why_matters: string;
      readonly evidence_ids: readonly string[];
      readonly impact: string;
    }[];
    readonly evidence_summary?: readonly {
      readonly evidence_id: string;
      readonly title: string;
      readonly source_url: string;
      readonly fact: string;
      readonly why_relevant?: string;
      readonly implication: string;
      readonly decision_impact: string;
    }[];
    readonly strongest_evidence: readonly {
      readonly evidence_id: string;
      readonly title: string;
      readonly source_url: string;
      readonly fact: string;
      readonly implication: string;
      readonly decision_impact: string;
    }[];
    readonly tradeoffs?: readonly {
      readonly option_id: string;
      readonly title: string;
      readonly benefits: readonly string[];
      readonly risks: readonly string[];
    }[];
    readonly decision_options: readonly {
      readonly option_id: string;
      readonly title: string;
      readonly why_consider: string;
      readonly advantages: readonly string[];
      readonly risks: readonly string[];
      readonly unknowns: readonly string[];
    }[];
    readonly unknowns?: readonly string[];
    readonly approval_question?: string;
    readonly knowledge_preview?: string;
    readonly proposed_knowledge_artifact?: string;
    readonly excluded_patterns?: readonly string[];
    readonly status: "WAITING_HUMAN";
    readonly automatic_recommendation: false;
    readonly evidence_count: number;
    readonly evidence_quality_status?: "HIGH" | "MEDIUM" | "LOW";
    readonly confidence_warning?: string | null;
    readonly evidence_gaps?: readonly string[];
  };
  readonly decision_asset: unknown;
  readonly stages_completed: readonly PipelineStage[];
  readonly autoApproved: false;
  host_status: string;
  decisionModel?: unknown;
  analysis?: unknown;
  history_snapshot?: unknown;
  dna?: unknown;
  rationale?: string;
};

const DEFAULT_SESSION: ProductSession = {
  user_id: "web-mvp-user",
  tenant_id: "validation-tokyo-2026",
};

export class DecisionProductStore {
  private session: ProductSession = { ...DEFAULT_SESSION };
  private readonly byProposal = new Map<string, DecisionViewRecord>();

  getSession(): ProductSession {
    return this.session;
  }

  setSession(input: { user_id?: string; tenant_id?: string }): ProductSession {
    const user_id = input.user_id?.trim() || this.session.user_id;
    const tenant_id = input.tenant_id?.trim() || this.session.tenant_id;
    if (!user_id || !tenant_id) throw new Error("user_id and tenant_id required");
    this.session = { user_id, tenant_id };
    return this.session;
  }

  put(record: DecisionViewRecord): void {
    this.byProposal.set(record.proposalId, record);
  }

  get(proposalId: string): DecisionViewRecord | undefined {
    return this.byProposal.get(proposalId);
  }

  update(
    proposalId: string,
    patch: Partial<DecisionViewRecord>,
  ): DecisionViewRecord {
    const cur = this.byProposal.get(proposalId);
    if (!cur) throw new Error(`unknown decision ${proposalId}`);
    const next = { ...cur, ...patch } as DecisionViewRecord;
    this.byProposal.set(proposalId, next);
    return next;
  }

  listForUser(user_id: string, tenant_id: string): DecisionViewRecord[] {
    return [...this.byProposal.values()]
      .filter((r) => r.user_id === user_id && r.tenant_id === tenant_id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}
