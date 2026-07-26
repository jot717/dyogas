# Artifact: Task Plan

**Version:** 1.0.0  
**Status:** Canonical — Binding (Foundation)  
**Artifact Type:** `TaskPlan`  
**Schema:** [`/schemas/artifacts/task-plan.schema.json`](../schemas/artifacts/task-plan.schema.json)  
**Producer:** Task Agent — [contract](../contracts/agents/task-agent.md)  
**Consumers:** Execution Package emitter (`tools/task-agent` → `tools/dev-orch`); Human Approval Gate  
**Related:** DL-TASK-AGENT-FOUNDATION-001

---

## 1. Purpose

A `TaskPlan` is the immutable planning output of the Task Agent: decomposed steps, agent routes, and fields that map onto a **dev-orch Execution Package** without inventing a second package format.

## 2. Scope

### In scope
- Ordered steps with dependencies and `agent_id` routes.
- Package-ready fields (`task_id`, `title`, `objective`, scopes, evidence paths, sprint refs).
- Explicit `requires_human_approval: true`.

### Out of scope
- Sealed Host lineage kinds (no Host redesign).
- Decision Model payloads.
- Knowledge SoR writes.

## 3. Naming

- `plan_id`: `tp-{slug}` assigned by Task Agent.
- `task_id`: stable id used as Execution Package `taskId`.

---

**End of Task Plan artifact**
