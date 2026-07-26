# Pipelines

**Version:** 2.0.0
**Status:** Canonical — Binding
**Effective:** 2026-07-22
**Owner:** Chief Systems Architect
**Related:** [`/CONSTITUTION.md`](../CONSTITUTION.md) · [`/harness/HARNESS_SPECIFICATION.md`](../harness/HARNESS_SPECIFICATION.md) · [`/contracts`](../contracts) · [`/artifacts`](../artifacts) · [`/schemas`](../schemas)

---

## 1. Purpose

This document indexes every pipeline specification in DYOGAS and defines the shared conventions that all pipeline specs must follow: stage-table shape, gate vocabulary, retry/timeout defaults, and cross-links to Harness execution law. A pipeline spec is the **stage topology** for a class of work — it declares who produces what, who consumes it, and what must be true to advance. It does not redefine artifact meaning (`/artifacts`) or agent obligations (`/contracts`); it wires them together in order.

---

## 2. Definitions

| Term | Definition |
|------|------------|
| **Pipeline** | A named, versioned sequence of stages that transforms an initial input into a terminal artifact under Harness governance. |
| **Stage** | One named step in a pipeline: one producer, one primary consumer, one input artifact, one output artifact, and explicit Exit Criteria. |
| **Pipeline Run** | One execution instance of a pipeline, identified by `run_id`, pinning `pipeline_version` and every stage's contract/schema versions at `CREATED`. |
| **Exit Criteria** | The stage's Acceptance Criteria — the declarative, testable conditions that must hold before Harness advances to the next stage. |
| **Gate** | An automated Review Gate or a Human Approval Gate that may block advancement independent of Exit Criteria being locally satisfied. |
| **Cross-cutting Gate** | A gate that applies at every stage boundary (e.g., Schema Review Gate) rather than a single named stage. |

---

## 3. Scope

### In scope
- Stage topology, producer/consumer wiring, and per-stage Exit Criteria for every pipeline in this repository.
- Sequence/state diagrams describing normal flow, retry, timeout, human approval, and cancellation paths.
- Cross-cutting gates that apply pipeline-wide.

### Out of scope
- Artifact field-level meaning → `/artifacts`.
- Agent contract obligations, pre/postconditions, retry ceilings → `/contracts/agents`.
- Harness state machine, invocation lifecycle, audit event shape → `/harness/HARNESS_SPECIFICATION.md`.
- Application code, orchestration frameworks, runtime implementations — none exist in this repository by design.

---

## 4. Pipeline Index

| Pipeline | Spec | Status |
|----------|------|--------|
| Knowledge Ingestion (canonical) | [knowledge-ingestion.md](./knowledge-ingestion.md) | Canonical, v2.0.0 |

All pipelines execute only under [`/harness/HARNESS_SPECIFICATION.md`](../harness/HARNESS_SPECIFICATION.md). No pipeline may be invoked outside the Harness Pipeline Engine (Constitution Article XIII).

---

## 5. Responsibilities

| Role | Responsibility |
|------|-----------------|
| Chief Systems Architect | Owns pipeline taxonomy; requires an ADR for new pipelines or stage-topology changes (Constitution Article VIII). |
| Knowledge Platform Engineering | Owns day-to-day pipeline spec maintenance, stage exit-criteria calibration, and metric collection. |
| Human Approver(s) | Own every Human Approval Gate outcome within a pipeline; accountable per Harness Spec §9. |
| Site Reliability / Platform Operations | Own retry ceilings, timeout SLAs, and incident response for stalled/failed runs. |
| Trust & Control Team | Own tenancy isolation and Egress/Policy Gate enforcement across every stage. |

---

## 6. Shared Pipeline Conventions

Every pipeline spec in this directory MUST document, per stage:

1. Producer, Consumer, Input Artifact, Output Artifact, Exit Criteria (as in v1.0.0).
2. **Who owns** the stage's operational health (on-call/maintaining team).
3. **Who approves** advancement when the stage includes or feeds a Human Approval Gate.
4. A **Review checklist** — the concrete items an automated Review Gate or human reviewer checks before sign-off.
5. An **Exit checklist** — the concrete, binary conditions that gate advancement (a checkable rendering of Exit Criteria).
6. A **Rollback** procedure — what happens if this stage's output must be un-done or compensated.
7. **Metrics** — the operational signals tracked for this stage.

Every pipeline spec MUST also include, at the pipeline level:

- A complete Mermaid sequence diagram of the full happy path.
- A Mermaid state diagram of run-level states.
- A dedicated retry-flow diagram.
- Documented timeout behavior per stage.
- A documented human-approval path.
- A documented cancellation path.

---

## 7. Cross-Cutting Gate Vocabulary

| Gate | Applies | Defined in |
|------|---------|------------|
| Schema Review Gate | Every stage handoff | Harness Spec §10 |
| Contract Postcondition Gate | Every agent emission | Harness Spec §10, per-agent contract |
| Human Approval Gate | Any stage authorizing SoR mutation | Harness Spec §9 |
| Egress/Policy Gate | Research, Embedding, any Cloud AI Compute call | Harness Spec §10, Constitution Article XI |

---

## 8. Decision Rules

| Situation | Rule |
|-----------|------|
| A pipeline spec omits a required per-stage field (§6) | Spec is non-conformant; block merge until complete (Constitution Article IV) |
| Two pipelines would produce the same artifact type from different topologies | Requires an ADR justifying why one capability has two producing paths (Constitution Article VI) |
| A stage's Exit Criteria conflict with its producing agent's contract postconditions | Contract wins; the pipeline spec must be corrected to match, never the reverse |

---

## 9. Acceptance Criteria (Pipeline Spec Conformance)

- [ ] Every stage documents Producer, Consumer, Input/Output Artifact, Exit Criteria, Who owns, Who approves, Review checklist, Exit checklist, Rollback, Metrics.
- [ ] A full-pipeline Mermaid sequence diagram is present.
- [ ] State transition, retry-flow, timeout, human-approval, and cancellation diagrams/sections are present.
- [ ] Every artifact referenced links to its `/artifacts` spec and `/schemas` schema.
- [ ] Version is pinned and matches the `pipeline_version` runs will record at `CREATED`.

---

## 10. Failure Cases

| Situation | Outcome |
|-----------|---------|
| Pipeline spec version bumped without a corresponding Decision Log entry | Non-conformant; block merge (Constitution Article VII) |
| Stage topology changed without an ADR | Revertible by default (Constitution Article VIII) |
| A pipeline invoked without pinning `pipeline_version` at `CREATED` | Harness defect; run must fail closed |

---

## 11. Best Practices

- Keep one pipeline spec per named pipeline; do not fork a "v2 pipeline" file — bump the version of the existing file and preserve history via the Decision Log.
- Cross-link every stage's artifact reference both to `/artifacts/<name>.md` and `/schemas/artifacts/<name>.schema.json` so a reader never has to guess where meaning vs. shape live.
- Keep diagrams in sync with the stage table — a stale diagram is worse than no diagram.

---

## 12. Anti-Patterns

- Describing stage behavior only in prose without the required tables/diagrams — undocumented behavior is incomplete behavior (Constitution Article IV).
- Encoding retry/timeout numbers only in a diagram without also stating them in prose/tables (diagrams illustrate; tables are the source of truth).
- Letting a pipeline spec silently drift from the Agent Contracts it wires together.

---

## 13. References

- [`/harness/HARNESS_SPECIFICATION.md`](../harness/HARNESS_SPECIFICATION.md)
- [`/contracts/README.md`](../contracts/README.md)
- [`/artifacts/README.md`](../artifacts/README.md)
- [`/schemas/README.md`](../schemas/README.md)
- [`/CONSTITUTION.md`](../CONSTITUTION.md)

**End of Pipelines Index v2.0.0**
