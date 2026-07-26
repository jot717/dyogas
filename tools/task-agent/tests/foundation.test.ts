import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { clear, createTenantId, createTenancyContext, propagate } from "@dyogas/kernel";
import {
  BUILTIN_AGENT_ROUTES,
  TaskAgentError,
  clearFutureAgentRoutes,
  createTaskPlan,
  generateExecutionPackageFromPlan,
  listAgentRoutes,
  registerFutureAgentRoute,
  resolveAgentRoute,
  runTaskAgentFoundation,
} from "../src/index.js";

beforeEach(() => {
  clear();
  clearFutureAgentRoutes();
});

const baseRequest = {
  request: "What are local-first knowledge ingestion practices?",
  scope: "decision-graph-foundation",
  tenant_id: "t1",
  run_id: "run-ta-01",
  sprint_id: "SPRINT-TASK-AGENT-FOUNDATION-001",
};

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");

test("TA-03: research-agent route resolves", () => {
  const route = resolveAgentRoute("research-agent");
  assert.equal(route.kind, "research");
  assert.ok(BUILTIN_AGENT_ROUTES.length >= 1);
  assert.throws(() => resolveAgentRoute("unknown-agent"), TaskAgentError);
});

test("TA-03: future extension point registers without new MOD", () => {
  registerFutureAgentRoute({
    agentId: "future-demo-agent",
    contractDoc: "contracts/agents/future-demo-agent.md",
    kind: "future",
    description: "Extension point smoke",
  });
  assert.ok(listAgentRoutes().some((r) => r.agentId === "future-demo-agent"));
  const plan = createTaskPlan({
    ...baseRequest,
    allowed_agent_ids: ["research-agent", "future-demo-agent"],
  });
  assert.ok(plan.steps.some((s) => s.agent_id === "research-agent"));
  assert.ok(plan.steps.some((s) => s.agent_id === "future-demo-agent"));
});

test("TA-01/02: createTaskPlan produces Research-routed TaskPlan", () => {
  const plan = createTaskPlan(baseRequest);
  assert.equal(plan.requires_human_approval, true);
  assert.deepEqual([...plan.routed_agent_ids], ["research-agent"]);
  assert.ok(plan.research_brief);
  assert.equal(plan.research_brief!.question, baseRequest.request);
  assert.ok(plan.steps[0]!.agent_id === "research-agent");
});

test("TA-04: Execution Package generation is dev-orch compatible", () => {
  const plan = createTaskPlan(baseRequest);
  const result = generateExecutionPackageFromPlan(plan);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const pkg = result.package;
  assert.equal(pkg.taskId, plan.task_id);
  assert.equal(pkg.sprintId, plan.sprint_id);
  assert.ok(pkg.forbiddenScope.includes("Runtime"));
  assert.ok(pkg.allowedScope.includes("tools/task-agent"));
  assert.equal(pkg.executionMode, "Implementation Mode");
});

test("TA-05/06/07: full foundation path with human approval + evidence", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = runTaskAgentFoundation({
    request: baseRequest,
    decision: "approved",
    actorId: "founder",
  });

  assert.equal(result.approved, true);
  assert.equal(result.gate.decision, "approved");
  assert.equal(result.evidence.verdict, "PASS");
  assert.equal(result.executionPackage.sprintId, baseRequest.sprint_id);
  assert.ok(result.evidence.hostCompatible.research_brief);
  assert.deepEqual(
    [...result.plan.routed_agent_ids],
    ["research-agent"],
  );
});

test("TA-05: pending without actor does not approve", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = runTaskAgentFoundation({ request: baseRequest });
  assert.equal(result.approved, false);
  assert.equal(result.gate.decision, "pending");
  assert.equal(result.evidence.verdict, "BLOCKED");
});

test("TA-06: write sprint evidence artifact", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const evidencePath = join(
    repoRoot,
    "docs/task-agent/evidence/TA-FOUNDATION-001.json",
  );
  const result = runTaskAgentFoundation({
    request: baseRequest,
    decision: "approved",
    actorId: "founder",
    evidencePath,
  });
  assert.equal(result.evidence.verdict, "PASS");
  assert.ok(result.executionPackage.taskId.length > 0);
});

test("fail closed on blank request", () => {
  assert.throws(
    () => createTaskPlan({ ...baseRequest, request: "  " }),
    TaskAgentError,
  );
});
