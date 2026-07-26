# DYOGAS Roadmap

**Version:** 2.1.0
**Status:** Canonical (governance phases)
**Effective:** 2026-07-22
**Owner:** Product + Architecture
**Supersedes:** Roadmap v1.1.0 (completeness expansion; phases and exit criteria unchanged in substance)
**Related:** [`/CONSTITUTION.md`](../CONSTITUTION.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`/harness/HARNESS_SPECIFICATION.md`](../harness/HARNESS_SPECIFICATION.md), [`PRODUCT_VISION.md`](./PRODUCT_VISION.md), [`PRODUCT_PRINCIPLES.md`](./PRODUCT_PRINCIPLES.md)

---

## Purpose

Sequences how DYOGAS is built as an Engineering Operating System — not a mock feature backlog. Phases are exit-gated: a phase does not advance because time has passed, only because its exit criteria are checked, true, and evidenced.

## Definitions

| Term | Definition |
|------|------------|
| **Phase** | A named stretch of governance/engineering maturity with explicit exit criteria; phases are sequential, not parallel tracks to be cherry-picked. |
| **Exit criteria** | The checklist that must be entirely satisfied — not "mostly" or "in spirit" — before a phase is considered complete and the next phase's work may begin in earnest. |
| **Non-goal (roadmap sense)** | Work explicitly out of scope for a phase, stated to prevent scope creep from disguising itself as phase progress. |
| **Governance foundation** | The set of documents and structures (Constitution, docs, harness layout) that must exist before any multi-agent execution is trustworthy. |

## Scope

Applies to sequencing of governance maturity, harness operating discipline, architectural skeleton work, and (later) pain-validated product work. Does not itself define product features (see `PRODUCT_VISION.md`/`PRODUCT_PRINCIPLES.md` for what to build) or architecture shape (see `ARCHITECTURE.md` for where things go) — it defines *when* categories of work are appropriate to begin.

## Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Product + Architecture (Owner)** | Certifies phase exit criteria are met before declaring a phase complete; owns Decision Log entries for phase transitions. |
| **Any Contributor** | Does not begin Phase N+1 categories of work while Phase N exit criteria remain unmet, absent an explicit, logged exception. |
| **Chief Systems Architect** | Confirms ADR-requiring exit criteria (e.g., Knowledge SoR boundary, Cloud AI Compute boundary ADRs) are actually accepted, not merely drafted. |

---

## Phase 0 — Governance Foundation

**Exit criteria:**

- [x] Root Constitution
- [x] `/docs` vision, principles, high-level architecture, roadmap
- [x] Harness-first layout: `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas`
- [x] Decision Log format agreed (`/docs/adr/README.md` Decision Log SoR)
- [x] ADR process live under `/docs/adr`

**Non-goals:** Application code, LangGraph, APIs, mock features.

---

## Phase 1 — Harness Operating Discipline

**Exit criteria:**

- Harness Specification accepted as execution law
- All catalog agents bound by contracts + schemas
- Canonical Research→Memory pipeline specified with exit criteria
- Audit trail and human approval gate semantics frozen for v1
- Retry/failure recovery rules testable as acceptance obligations

---

## Phase 2 — Architectural Skeleton

**Exit criteria:**

- ADRs for Knowledge SoR and Cloud AI Compute boundary
- Threat model for egress and agent actions
- Schema validation strategy chosen via ADR (implementation still later)

---

## Phase 3 — Pain-Validated Core Loop

**Exit criteria:**

- One evidenced pain
- One pipeline run path producing immutable artifacts end-to-end (when implementation begins)
- Tests for contracts/schemas/gates
- Explicit non-goals

**In progress / planned (product):** Personal Brain Bridge coding — [`SPRINT-PB-BRIDGE-CODING-001`](../personal-brain/sprints/SPRINT-PB-BRIDGE-CODING-001.md) (**APPROVED** · `DL-PB-BRIDGE-CODING-001`) — Research Request → `ExecutionHost.createRun()` → ResearchReport. Does not itself certify Phase 3 exit.

**Planned (Execution Platform, P0):** [`SPRINT-HOST-RESEARCH-INTEGRATION-001`](../sprints/SPRINT-HOST-RESEARCH-INTEGRATION-001.md) (**COMPLETE** · Exit **PASS** · 2026-07-25) replaced the Host Stage-1 synthetic lineage seal with existing Research Engine execution (`execute()`), schema-valid ResearchReport emission, existing Runtime seal/handoff, Host sealed-store persistence, and HostRun lineage. **GAP-BR-019** / **GAP-EH-003** **CLOSED**. This uses existing SPEC-EXECUTION-HOST-001 / ADR-0010 boundaries and does not certify Phase 3 exit by itself.

**Complete (Development Harness tooling):** [`SPRINT-DEV-ORCH-002`](../sprints/SPRINT-DEV-ORCH-002.md) (**COMPLETE** 2026-07-25 · exit PASS · `DL-DEV-ORCH-002`) — shipped `tools/dev-orch/` (parser → planner → package → gate → verifier → evidence → registry writer → CLI dry-run) with CI job and boundary tests. Not a Platform Module; does not certify Phase 3 exit. Contains no Coding Agent and no LLM execution.

---

## Phase 4 — Trust Scale

Multi-user policy, provenance depth, zero duplicate SoRs, security cadence.

---

## Phase 5 — Platform Compounding

Stable external contracts; extensions cannot bypass Trust & Control or Harness gates.

---

## Workflow — Advancing a Phase

1. **Enumerate exit criteria** for the current phase exactly as written above — do not silently add or drop items without amending this document.
2. **Evidence each criterion.** A checkbox is only checked when there is a concrete artifact (a merged document, an accepted ADR, a passing test suite) proving it, not an intention to satisfy it soon.
3. **Certify with the Owner.** Product + Architecture records a Decision Log entry naming the phase, the date, and the evidence for each criterion.
4. **Open the next phase.** Only after certification does work matching the next phase's categories begin; work from a later phase started early must be explicitly logged as an exception with a reason.
5. **Re-certify on regression.** If a later change breaks a previously-met exit criterion (e.g., a duplicate SoR reappears, breaking Phase 4's "zero duplicate SoRs"), the roadmap is considered to have regressed to the prior phase for that criterion until fixed.

## Decision Rules

1. Exit criteria are AND-conditions, not OR-conditions — every listed item must be true, not a majority of them.
2. A phase may not be retroactively declared complete based on later phases' work "implying" it was already done; each criterion needs its own direct evidence.
3. Security or ownership regressions (Constitution Articles IX, X) block phase exit regardless of how much other progress has been made, per Prioritization Rule 4 below.
4. Non-goals stated for a phase are binding — work in that category started early is either stopped or explicitly exception-logged with a named owner and reason.

## Examples

- **Compliant**: Phase 1 is declared complete only after the Harness Specification is versioned/accepted, every cataloged agent has a matching contract + schema bundle, and the canonical pipeline's Exit Criteria are checked against actual stage specs — each with a linked artifact in the Decision Log entry.
- **Violation**: A team begins building Phase 3 "pain-validated core loop" implementation work while Phase 0's ADR process is still not live, with no logged exception — this is a roadmap violation, not "parallel workstream efficiency."

## Acceptance Criteria

- [ ] Every checked exit-criterion box in this document has a corresponding artifact (document, ADR, test suite) that can be pointed to.
- [ ] No phase's work has begun without its predecessor phase being certified complete, except via a logged, named exception.
- [ ] This document's phase list matches the actual state of `/docs/adr`, `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas` at time of reading.

## Failure Cases

- Phase 0 is marked complete despite "ADR process live under `/docs/adr`" remaining unchecked → Critical documentation-integrity issue; do not treat Phase 1 work as roadmap-sanctioned until fixed.
- A security regression is discovered during Phase 4 that reintroduces a duplicate SoR → the roadmap treats this as blocking further Phase 4/5 exit claims until resolved, per Prioritization Rule 4.

## Best Practices

- Keep exit criteria few and falsifiable; a criterion nobody can definitively check is not a useful gate.
- Revisit this document at the start of any planning cycle to confirm the checked/unchecked state still matches reality — roadmaps rot silently if not re-verified.

## Anti-patterns

- Treating unchecked exit criteria as "basically done" and proceeding anyway under schedule pressure.
- Adding new phases informally in planning documents without amending this canonical Roadmap.

---

## Prioritization Rules

1. Constitution > ADRs > docs > harness > contracts/pipelines/artifacts/schemas
2. Pain evidence before Phase 3+ product expansion
3. No parallel harnesses or contract forks
4. Security/ownership regressions block phase exit

---

## References

- [`/CONSTITUTION.md`](../CONSTITUTION.md) — Articles VII (Decision Log), VIII (ADR), IX (Security), X (Local-First), XII (Real Pain Point)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — the shape Phase 2's ADRs must resolve into
- [`/harness/HARNESS_SPECIFICATION.md`](../harness/HARNESS_SPECIFICATION.md) — the execution law Phase 1 certifies
- [`/docs/adr/README.md`](./adr/README.md) — the process Phase 0/2 depend on

**End of Roadmap v2.0.0**
