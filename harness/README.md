# DYOGAS Harness Layer

**Version:** 2.0.0
**Status:** Canonical — Execution Law Index
**Effective:** 2026-07-22
**Owner:** Chief Systems Architect
**Related:** [`/CONSTITUTION.md`](../CONSTITUTION.md) Article XIII, [`/docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md), [`/contracts/`](../contracts/), [`/pipelines/`](../pipelines/), [`/artifacts/`](../artifacts/), [`/schemas/`](../schemas/)

---

## Purpose

`/harness` is the execution law for the Engineering OS: the specification of how agent work actually runs, transitions, retries, fails, and gets approved, independent of what any individual agent's job is. It is the layer that makes "Harness-first execution" (Constitution Article XIII) a checkable reality rather than a slogan.

## Definitions

| Term | Definition |
|------|------------|
| **Harness** | The sole production execution **law** for multi-agent work (see `HARNESS_SPECIFICATION.md`). |
| **Execution Host** | Software that implements the Pipeline Engine role under Harness law (`MOD-EXECUTION-HOST`). |
| **Skill** | A reusable, testable capability unit invoked *inside* a contracted agent's execution; not an orchestrator (see `SKILL_SPECIFICATION.md`). |
| **Execution law** | Rules that govern *how* any agent work runs, as opposed to `/contracts` (what a specific agent is obligated to do) or `/pipelines` (what order stages run in for a specific job). |

## Scope

This layer defines cross-cutting execution mechanics that apply to every pipeline and every agent: state transitions, retry ceilings, audit event shape, versioning rules, and the skill catalog agents may invoke. It does not define any single agent's specific obligations (`/contracts`) or any single pipeline's specific stage topology (`/pipelines`) — those layers exist beneath and reference this one.

## Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Chief Systems Architect (Owner)** | Maintains both documents in this layer; approves amendments per each document's own amendment section. |
| **Pipeline authors** | Ensure their pipeline spec's stages are fully explainable in terms of this layer's state machine, handoff, retry, and gate rules — never invent parallel execution semantics. |
| **Agent Contract owners** | Ensure their contract's retry strategy and failure conditions are expressible under `HARNESS_SPECIFICATION.md` §7–§8. |
| **Skill implementers (future)** | Implement skills exactly as catalogued in `SKILL_SPECIFICATION.md`; propose amendments rather than diverging silently. |

---

## Documents in This Layer

| Document | Role |
|----------|------|
| [HARNESS_SPECIFICATION.md](./HARNESS_SPECIFICATION.md) | Pipeline engine, agent lifecycle, state machine, artifact flow, handoffs, retry, failure recovery, human approval gates, review gates, acceptance criteria, audit trail, versioning |
| [SKILL_SPECIFICATION.md](./SKILL_SPECIFICATION.md) | Reusable skills invoked inside contracted agents, with full I/O, dependencies, error handling, and test-case obligations |

Skills are not orchestrators. Pipelines live in `/pipelines`. Agent obligations live in `/contracts`.

---

## Workflow — Using This Layer

1. **Before running any agent**, confirm the Harness can bind it to a published contract (`HARNESS_SPECIFICATION.md` §3) — an unbound agent must not execute.
2. **Before designing a new pipeline stage**, confirm it can be expressed using the existing State Machine, Handoff Protocol, and Gate mechanics here — do not invent a parallel state model.
3. **Before implementing a new capability inside an agent**, check `SKILL_SPECIFICATION.md`'s catalog for an existing skill; extend it rather than duplicating (Constitution Article VI).
4. **When a failure occurs**, classify it per `HARNESS_SPECIFICATION.md` §7–§8 (Retry Rules, Failure Recovery) before deciding how to respond — do not improvise a bespoke recovery path.
5. **When amending this layer**, follow each document's own Amendment section, including Decision Log and, if topology/trust changes, an ADR.

## Decision Rules

1. If a proposed pipeline behavior cannot be expressed in terms of this layer's existing states, gates, and retry classes, the correct action is to amend `HARNESS_SPECIFICATION.md` (with Decision Log + possible ADR) — not to build a workaround at the pipeline or contract layer.
2. If a proposed agent capability resembles an existing skill, it must extend that skill's catalog entry, not fork a new one.
3. Execution-semantics conflicts between a pipeline spec and this layer are resolved in favor of this layer (Constitution Hierarchy of Authority places Harness above Pipelines).

## Examples

- **Compliant**: A new pipeline needing a "wait for external system callback" behavior is expressed using `WAITING_HUMAN`-adjacent semantics extended via an amendment to the State Machine, documented once here, then reused by any pipeline needing it.
- **Violation**: A pipeline spec defines its own bespoke "PAUSED" state not present in `HARNESS_SPECIFICATION.md`'s State Machine, interpreted differently by different stages.

## Acceptance Criteria

- [ ] Every pipeline's stage transitions are fully explainable using the state machine, handoff, retry, and gate definitions in `HARNESS_SPECIFICATION.md`.
- [ ] Every capability invoked inside an agent traces to a cataloged skill in `SKILL_SPECIFICATION.md`, or a proposed amendment to it.
- [ ] No execution-semantics rule is defined redundantly outside this layer.

## Failure Cases

- A pipeline document defines its own retry ceiling logic contradicting `HARNESS_SPECIFICATION.md` §7's default ceiling → Major, reconcile immediately.
- A new skill is implemented ad hoc inside one agent's codebase without a catalog entry here → Major, catalog it or replace it with an existing cataloged skill.

## Best Practices

- Treat this layer as the place where "how does the system behave when things go wrong" is answered once, for every pipeline, rather than per-pipeline.
- Keep the skill catalog's Shared Reusable Component Registry (`SKILL_SPECIFICATION.md` §7) as the first stop before defining any new cross-skill data shape.

## Anti-patterns

- Defining agent-specific or pipeline-specific retry/failure logic that silently diverges from this layer's defaults without an amendment.
- Treating skills as a place to stash one-off logic rather than genuinely reusable, tested capability units.

---

## Non-Goals (This Layer)

- Application code, LangGraph graphs, API servers, vendor lock-in
- Prompt text or model vendor selection
- Any single agent's specific obligations (see `/contracts`)
- Any single pipeline's specific stage topology (see `/pipelines`)

## References

- [`/CONSTITUTION.md`](../CONSTITUTION.md) Article XIII — Harness-First Execution
- [`/docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) — the plane structure this layer orchestrates across
- [`/contracts/README.md`](../contracts/README.md), [`/pipelines/README.md`](../pipelines/README.md), [`/artifacts/README.md`](../artifacts/README.md), [`/schemas/README.md`](../schemas/README.md)

**End of Harness Layer Index v2.0.0**
