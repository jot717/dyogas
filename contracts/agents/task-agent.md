# Contract: Task Agent

**Contract Version:** 2.0.0  
**Status:** Binding — Supporting / Meta Agent (Foundation)  
**Effective:** 2026-07-26  
**Schema Bundle:** [/schemas/agents/task-agent.schema.json](../../schemas/agents/task-agent.schema.json)  
**Artifact Schema:** [/schemas/artifacts/task-plan.schema.json](../../schemas/artifacts/task-plan.schema.json)  
**Artifact Spec:** [/artifacts/task-plan.md](../../artifacts/task-plan.md)  
**Decision Log:** [/docs/decision-log/DL-TASK-AGENT-FOUNDATION-001.md](../../docs/decision-log/DL-TASK-AGENT-FOUNDATION-001.md)  
**Implementation:** `tools/task-agent/` (`@dyogas/task-agent`) — engineering tool, **not** a Platform Module  
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md)

> **Versioning note.** Document Contract Version is 2.0.0. Wire `contract_version` remains `"1.0.0"` until schema ADR. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Task Agent converts a **User Research Request** into a bounded **TaskPlan**: decomposed work items, agent routing targets, and fields sufficient to emit a **dev-orch-compatible Execution Package**. It does not execute Research, write Knowledge SoR, redesign Execution Host, or implement a Decision Model.

## 2. Scope

### 2.1 In Scope

- Accept a research-oriented user request with tenancy / run context.
- Decompose into ordered task steps with dependencies.
- Route each step to a known agent id (Research Agent in foundation; extension map for future agents).
- Emit a `TaskPlan` artifact payload that maps 1:1 onto Execution Package fields.
- Require human approval before any downstream execution handoff.

### 2.2 Out of Scope

- New Platform Module registration.
- Runtime / Agent SDK / Execution Host / Product redesign.
- Decision Model / Decision Intelligence implementation.
- Self-approval or SoR mutation.
- Inventing unknown agent routes.

## 3. Definitions

| Term | Meaning |
|------|---------|
| **User Research Request** | Natural-language research objective plus tenancy/run context. |
| **TaskPlan** | Structured decomposition + routing + package-ready fields. |
| **Agent Route** | Mapping from a plan step to a published agent contract id. |
| **Execution Package** | Existing 14-field `tools/dev-orch` package (Runbook §4.1). |
| **Extension Point** | Registry entry for future agent ids; unknown ids fail closed. |

## 4. Role

Plan and route research work. Do not execute skills, seal Host artifacts, or authorize Knowledge writes.

## 5. Responsibilities

1. Validate input against the schema bundle before planning.
2. Produce a `TaskPlan` with at least one Research-routed step for research requests.
3. Never invent agent ids outside the published route registry.
4. Never self-approve; hand off to Human Approval Gate.
5. Preserve tenancy; fail closed on blank objective or missing tenant.

## 6. Input Schema

See `input` in [task-agent.schema.json](../../schemas/agents/task-agent.schema.json).

| Field | Required | Notes |
|-------|----------|-------|
| `request` | yes | User research question / objective |
| `scope` | yes | Bounding context |
| `tenant_id` | yes | Tenancy |
| `run_id` | yes | Correlation / run id |
| `sprint_id` | yes | Sprint binding for Execution Package |
| `constraints` | no | Free-form constraints |
| `allowed_agent_ids` | no | Subset filter; default = registry |

## 7. Output Schema

See [task-plan.schema.json](../../schemas/artifacts/task-plan.schema.json).

## 8. Accepted Artifact(s)

None required — run bootstrap / user request.

## 9. Produced Artifact(s)

`TaskPlan` — consumed by Execution Package emitter + Human Approval Gate.

## 10. Preconditions

1. Input validates.
2. `tenant_id` and `run_id` non-empty.
3. At least one routable agent remains after `allowed_agent_ids` filter.

## 11. Postconditions

1. Output validates as `TaskPlan`.
2. Every step has a known `agent_id`.
3. Package-ready fields are complete enough for `emitExecutionPackage`.
4. `requires_human_approval` is `true`.

## 12. Forbidden Behaviors

- Self-approve execution.
- Write Knowledge / Graph SoR.
- Call Execution Host internals or invent Host APIs.
- Route to unpublished agent ids.
- Fabricate evidence or acceptance criteria that invent Host redesign.

## 13. Acceptance Criteria

- Contract indexed as supporting agent.
- Schema bundle + TaskPlan artifact published.
- `tools/task-agent` implements plan → route → package → approve → evidence.
- Tests green; Sprint Exit PASS.

## 14. References

- SPEC-AGT-000 (Agent Contract Layer under MOD-CPAS)
- DL-TASK-AGENT-FOUNDATION-001
- tools/dev-orch Execution Package types
- human-gate B11

---

**End of Task Agent Contract v2.0.0**
