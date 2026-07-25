/**
 * C-01 — Research Request → ResearchBrief-shaped bootstrap builder.
 * SPEC-PROD-004 / SPRINT-PB-BRIDGE-CODING-001
 *
 * Maps A1 Research Request → Host createRun bootstrap (A2).
 * No new schema. No Host/Runtime call. No UI.
 *
 * Product defaults (GAP-BR-002…004): documented constants below — not Host APIs.
 * run_id omitted until Host assigns (GAP-BR-005).
 */

import { PersonalBrainError } from "../workspace.js";

/** Contract allowlist — schemas/agents/research-agent.schema.json */
export const ALLOWED_SOURCE_CLASS_VALUES = [
  "youtube",
  "github",
  "reddit",
  "web",
] as const;

export type AllowedSourceClass = (typeof ALLOWED_SOURCE_CLASS_VALUES)[number];

/**
 * Product default when Request omits allowed_source_classes (GAP-BR-003).
 * Full contract allowlist — Egress/Policy Gate still enforces.
 */
export const DEFAULT_ALLOWED_SOURCE_CLASSES: readonly AllowedSourceClass[] =
  Object.freeze([...ALLOWED_SOURCE_CLASS_VALUES]);

/** Product default budget when placeholder omitted/invalid (GAP-BR-004). */
export const DEFAULT_BUDGET_MAX_ITEMS = 10;

export type ResearchRequest = {
  readonly intent: string;
  readonly workspace_id: string;
  readonly owner_id: string;
  /** Kernel TenantId already resolved by caller (GAP-BR-006 — no child-scope invent). */
  readonly tenant_id: string;
  readonly correlation_id: string;
  readonly scope_hints?: string;
  readonly constraints?: Record<string, unknown> | string;
  readonly allowed_source_classes?: readonly string[];
  /** Soft hint: number → max_items, or `{ max_items, max_seconds? }`. */
  readonly budget_placeholder?: number | { max_items?: number; max_seconds?: number };
  /** Non-authoritative — never mapped into Brief agent input (A2). */
  readonly notes?: string;
};

export type ResearchBriefBootstrap = {
  readonly question: string;
  readonly scope: string;
  readonly allowed_source_classes: AllowedSourceClass[];
  readonly budget: { max_items: number; max_seconds?: number };
  readonly tenancy: { tenant_id: string; workspace_id: string };
  readonly constraints?: Record<string, unknown>;
  /**
   * Omitted pre-createRun — Host/Runtime supply run_id for agent bind (GAP-BR-005).
   * Present only if caller stamps after Host returns run_id.
   */
  readonly run_id?: string;
};

/** Fields for CreateRunRequest assembly (C-02) — not a Host call. */
export type BridgeCreateRunIdentity = {
  readonly tenant_id: string;
  readonly caller_id: string;
  readonly correlation_id: string;
};

export type BuiltResearchBrief = {
  readonly bootstrap: ResearchBriefBootstrap;
  readonly identity: BridgeCreateRunIdentity;
};

function requireNonEmpty(label: string, value: string | undefined): string {
  const v = value?.trim() ?? "";
  if (!v) {
    throw new PersonalBrainError(`${label} required`);
  }
  return v;
}

function defaultScope(workspaceId: string): string {
  // GAP-BR-002 product convention (A2)
  return `personal-brain workspace:${workspaceId}`;
}

function normalizeSourceClasses(
  raw: readonly string[] | undefined,
): AllowedSourceClass[] {
  const source = raw?.length ? raw : DEFAULT_ALLOWED_SOURCE_CLASSES;
  const allowed = new Set<string>(ALLOWED_SOURCE_CLASS_VALUES);
  const out: AllowedSourceClass[] = [];
  for (const c of source) {
    if (!allowed.has(c)) {
      throw new PersonalBrainError(
        `unsupported allowed_source_class: ${c} (allowed: ${ALLOWED_SOURCE_CLASS_VALUES.join(", ")})`,
      );
    }
    if (!out.includes(c as AllowedSourceClass)) {
      out.push(c as AllowedSourceClass);
    }
  }
  if (out.length === 0) {
    throw new PersonalBrainError("allowed_source_classes must be non-empty");
  }
  return out;
}

function normalizeBudget(
  placeholder: ResearchRequest["budget_placeholder"],
): { max_items: number; max_seconds?: number } {
  if (placeholder === undefined || placeholder === null) {
    return { max_items: DEFAULT_BUDGET_MAX_ITEMS };
  }
  if (typeof placeholder === "number") {
    if (!Number.isInteger(placeholder) || placeholder < 1) {
      throw new PersonalBrainError(
        "budget_placeholder number must be integer ≥ 1",
      );
    }
    return { max_items: placeholder };
  }
  const max_items =
    placeholder.max_items === undefined
      ? DEFAULT_BUDGET_MAX_ITEMS
      : placeholder.max_items;
  if (!Number.isInteger(max_items) || max_items < 1) {
    throw new PersonalBrainError("budget.max_items must be integer ≥ 1");
  }
  const budget: { max_items: number; max_seconds?: number } = { max_items };
  if (placeholder.max_seconds !== undefined) {
    if (
      !Number.isInteger(placeholder.max_seconds) ||
      placeholder.max_seconds < 1
    ) {
      throw new PersonalBrainError("budget.max_seconds must be integer ≥ 1");
    }
    budget.max_seconds = placeholder.max_seconds;
  }
  return budget;
}

function normalizeConstraints(
  constraints: ResearchRequest["constraints"],
): Record<string, unknown> | undefined {
  if (constraints === undefined) return undefined;
  if (typeof constraints === "string") {
    const text = constraints.trim();
    if (!text) return undefined;
    return { text };
  }
  return { ...constraints };
}

/**
 * Build Host-ready ResearchBrief-shaped bootstrap from a Research Request.
 * Fail closed on missing owner/workspace/tenant/intent/correlation.
 * Does not call Execution Host or Runtime.
 */
export function buildResearchBriefBootstrap(
  req: ResearchRequest,
): BuiltResearchBrief {
  const intent = requireNonEmpty("intent", req.intent);
  const workspace_id = requireNonEmpty("workspace_id", req.workspace_id);
  const owner_id = requireNonEmpty("owner_id", req.owner_id);
  const tenant_id = requireNonEmpty("tenant_id", req.tenant_id);
  const correlation_id = requireNonEmpty("correlation_id", req.correlation_id);

  const scope = req.scope_hints?.trim()
    ? req.scope_hints.trim()
    : defaultScope(workspace_id);

  const constraints = normalizeConstraints(req.constraints);

  const bootstrap: ResearchBriefBootstrap = {
    question: intent,
    scope,
    allowed_source_classes: normalizeSourceClasses(req.allowed_source_classes),
    budget: normalizeBudget(req.budget_placeholder),
    tenancy: { tenant_id, workspace_id },
    ...(constraints ? { constraints } : {}),
  };

  // notes intentionally discarded (A2)

  return {
    bootstrap,
    identity: {
      tenant_id,
      caller_id: owner_id,
      correlation_id,
    },
  };
}

/**
 * Stamp Host-assigned run_id onto bootstrap after createRun (GAP-BR-005).
 * Call from C-02+ only — not required for C-01 emit.
 */
export function stampBootstrapRunId(
  bootstrap: ResearchBriefBootstrap,
  run_id: string,
): ResearchBriefBootstrap {
  const id = requireNonEmpty("run_id", run_id);
  return Object.freeze({ ...bootstrap, run_id: id });
}
