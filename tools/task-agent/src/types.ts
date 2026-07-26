/**
 * Task Agent foundation types — TaskPlan mirrors schemas/artifacts/task-plan.schema.json.
 */

export class TaskAgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskAgentError";
  }
}

export interface TaskAgentRequest {
  readonly request: string;
  readonly scope: string;
  readonly tenant_id: string;
  readonly run_id: string;
  readonly sprint_id: string;
  readonly constraints?: Record<string, unknown>;
  readonly allowed_agent_ids?: readonly string[];
  readonly allowed_source_classes?: readonly (
    | "youtube"
    | "github"
    | "reddit"
    | "web"
  )[];
  readonly budget?: { readonly max_items?: number; readonly max_seconds?: number };
}

export interface TaskPlanStep {
  readonly step_id: string;
  readonly title: string;
  readonly agent_id: string;
  readonly depends_on: readonly string[];
  readonly objective?: string;
}

export interface TaskPlanPackageFields {
  readonly acceptanceCriteria: string;
  readonly testRequirements: string;
  readonly allowedScope: string;
  readonly forbiddenScope: string;
  readonly expectedEvidence: string;
  readonly ssotReferences: string;
  readonly gapRegistry: string;
  readonly executionMode?: string;
  readonly dependencies?: readonly string[];
}

export interface TaskPlanResearchBrief {
  readonly question: string;
  readonly scope: string;
  readonly allowed_source_classes: readonly (
    | "youtube"
    | "github"
    | "reddit"
    | "web"
  )[];
  readonly budget: { readonly max_items: number; readonly max_seconds?: number };
}

export interface TaskPlan {
  readonly plan_id: string;
  readonly task_id: string;
  readonly title: string;
  readonly objective: string;
  readonly tenant_id: string;
  readonly run_id: string;
  readonly sprint_id: string;
  readonly steps: readonly TaskPlanStep[];
  readonly package_fields: TaskPlanPackageFields;
  readonly requires_human_approval: true;
  readonly routed_agent_ids: readonly string[];
  readonly research_brief?: TaskPlanResearchBrief;
}

export interface AgentRouteEntry {
  readonly agentId: string;
  readonly contractDoc: string;
  readonly kind: "research" | "future";
  readonly description: string;
}
