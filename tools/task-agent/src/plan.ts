/**
 * Task planning / decomposition — User Research Request → TaskPlan.
 */

import { createHash } from "node:crypto";
import { DEFAULT_FORBIDDEN_SCOPE } from "@dyogas/dev-orch";
import { routeResearchRequest } from "./route.js";
import {
  TaskAgentError,
  type TaskAgentRequest,
  type TaskPlan,
} from "./types.js";

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "request"
  );
}

function stablePlanId(seed: string): string {
  const h = createHash("sha256").update(seed).digest("hex").slice(0, 10);
  return `tp-${h}`;
}

/**
 * Decompose a user research request into a TaskPlan (TA-01/TA-02/TA-03).
 */
export function createTaskPlan(input: TaskAgentRequest): TaskPlan {
  const request = input.request?.trim() ?? "";
  const scope = input.scope?.trim() ?? "";
  const tenantId = input.tenant_id?.trim() ?? "";
  const runId = input.run_id?.trim() ?? "";
  const sprintId = input.sprint_id?.trim() ?? "";

  if (!request) throw new TaskAgentError("request required");
  if (!scope) throw new TaskAgentError("scope required");
  if (!tenantId) throw new TaskAgentError("tenant_id required");
  if (!runId) throw new TaskAgentError("run_id required");
  if (!sprintId) throw new TaskAgentError("sprint_id required");

  const { steps, routedAgentIds } = routeResearchRequest(input);
  const taskId = `TA-${slug(request).slice(0, 24).toUpperCase() || "RESEARCH"}`;
  const planId = stablePlanId(`${tenantId}:${runId}:${request}`);
  const title = `Research: ${request.slice(0, 80)}`;
  const sourceClasses = input.allowed_source_classes?.length
    ? [...input.allowed_source_classes]
    : (["web"] as const);
  const maxItems = input.budget?.max_items ?? 5;

  return {
    plan_id: planId,
    task_id: taskId,
    title,
    objective: request,
    tenant_id: tenantId,
    run_id: runId,
    sprint_id: sprintId,
    steps,
    package_fields: {
      acceptanceCriteria:
        "TaskPlan validates; research-agent routed; Execution Package emits; human approval required before execution",
      testRequirements:
        "tools/task-agent tests; plan→route→package→approve→evidence path green",
      allowedScope:
        "tools/task-agent/; contracts/agents/task-agent.md; schemas/agents/task-agent.schema.json; schemas/artifacts/task-plan.schema.json; docs/task-agent/",
      forbiddenScope: DEFAULT_FORBIDDEN_SCOPE,
      expectedEvidence: `docs/task-agent/evidence/${taskId}.json`,
      ssotReferences:
        "contracts/agents/task-agent.md; DL-TASK-AGENT-FOUNDATION-001; SPRINT-TASK-AGENT-FOUNDATION-001",
      gapRegistry: "docs/backlog/BACKLOG-TASK-AGENT-FOUNDATION-001.md",
      executionMode: "Implementation Mode",
      dependencies: [],
    },
    requires_human_approval: true,
    routed_agent_ids: routedAgentIds,
    research_brief: {
      question: request,
      scope,
      allowed_source_classes: sourceClasses,
      budget: {
        max_items: maxItems,
        ...(input.budget?.max_seconds
          ? { max_seconds: input.budget.max_seconds }
          : {}),
      },
    },
  };
}
