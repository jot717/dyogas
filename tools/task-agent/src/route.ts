/**
 * Agent routing layer — Research Agent + future extension point.
 * Unknown agent ids fail closed. No new MOD.
 */

import {
  TaskAgentError,
  type AgentRouteEntry,
  type TaskAgentRequest,
  type TaskPlanStep,
} from "./types.js";

/** Built-in routes for foundation sprint. */
export const BUILTIN_AGENT_ROUTES: readonly AgentRouteEntry[] = Object.freeze([
  Object.freeze({
    agentId: "research-agent",
    contractDoc: "contracts/agents/research-agent.md",
    kind: "research" as const,
    description: "Stage-1 Research Agent (MOD-RESEARCH)",
  }),
]);

/** Extension map for future agents — empty until registered. */
const EXTENSION_ROUTES = new Map<string, AgentRouteEntry>();

export function registerFutureAgentRoute(entry: AgentRouteEntry): void {
  if (entry.kind !== "future") {
    throw new TaskAgentError("extension registry accepts kind=future only");
  }
  if (BUILTIN_AGENT_ROUTES.some((r) => r.agentId === entry.agentId)) {
    throw new TaskAgentError(`cannot override builtin route: ${entry.agentId}`);
  }
  EXTENSION_ROUTES.set(entry.agentId, Object.freeze({ ...entry }));
}

export function clearFutureAgentRoutes(): void {
  EXTENSION_ROUTES.clear();
}

export function listAgentRoutes(): readonly AgentRouteEntry[] {
  return Object.freeze([
    ...BUILTIN_AGENT_ROUTES,
    ...EXTENSION_ROUTES.values(),
  ]);
}

export function resolveAgentRoute(agentId: string): AgentRouteEntry {
  const builtin = BUILTIN_AGENT_ROUTES.find((r) => r.agentId === agentId);
  if (builtin) return builtin;
  const ext = EXTENSION_ROUTES.get(agentId);
  if (ext) return ext;
  throw new TaskAgentError(`unknown agent route: ${agentId}`);
}

/**
 * Route a research request to Research Agent (+ optional future steps).
 * Fail-closed if allowed_agent_ids excludes all known routes.
 */
export function routeResearchRequest(
  input: TaskAgentRequest,
): { steps: TaskPlanStep[]; routedAgentIds: string[] } {
  const allowed = input.allowed_agent_ids
    ? new Set(input.allowed_agent_ids)
    : null;

  const researchId = "research-agent";
  if (allowed && !allowed.has(researchId)) {
    throw new TaskAgentError(
      "research-agent not permitted by allowed_agent_ids",
    );
  }
  resolveAgentRoute(researchId);

  const steps: TaskPlanStep[] = [
    {
      step_id: "step-research-01",
      title: "Collect research evidence",
      agent_id: researchId,
      depends_on: [],
      objective: input.request.trim(),
    },
  ];

  // Future extension: if caller lists additional known future routes, append after research.
  if (allowed) {
    for (const id of allowed) {
      if (id === researchId) continue;
      const route = resolveAgentRoute(id);
      if (route.kind !== "future") {
        throw new TaskAgentError(`unsupported foundation route: ${id}`);
      }
      steps.push({
        step_id: `step-${id}-01`,
        title: `Future agent step: ${id}`,
        agent_id: id,
        depends_on: ["step-research-01"],
        objective: `Post-research handoff to ${id}`,
      });
    }
  }

  const routedAgentIds = [...new Set(steps.map((s) => s.agent_id))];
  return { steps, routedAgentIds };
}
