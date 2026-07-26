/**
 * @dyogas/task-agent — Task Agent foundation (SPRINT-TASK-AGENT-FOUNDATION-001)
 */

export {
  TaskAgentError,
  type TaskAgentRequest,
  type TaskPlanStep,
  type TaskPlanPackageFields,
  type TaskPlanResearchBrief,
  type TaskPlan,
  type AgentRouteEntry,
} from "./types.js";

export {
  BUILTIN_AGENT_ROUTES,
  registerFutureAgentRoute,
  clearFutureAgentRoutes,
  listAgentRoutes,
  resolveAgentRoute,
  routeResearchRequest,
} from "./route.js";

export { createTaskPlan } from "./plan.js";

export {
  generateExecutionPackageFromPlan,
  requireExecutionPackage,
  type PackageFromPlanResult,
} from "./package.js";

export {
  approveTaskPlanExecution,
  type TaskPlanApprovalInput,
  type TaskPlanApprovalResult,
} from "./approve.js";

export {
  buildTaskAgentEvidence,
  writeTaskAgentEvidence,
  type TaskAgentEvidence,
} from "./evidence.js";

export {
  runTaskAgentFoundation,
  type RunTaskAgentOptions,
  type RunTaskAgentResult,
} from "./run.js";
