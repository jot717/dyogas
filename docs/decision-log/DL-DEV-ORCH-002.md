# Decision

**ID:** DL-DEV-ORCH-002  
**Date:** 2026-07-25  
**Owner:** Founder (business authority)  
**Mode:** Development Harness — Phase 2 Implementation authorization  
**Status:** **APPROVED**  
**Approved:** 2026-07-25 (Founder)  
**Trace:** `TRACE-DEV-ORCH-001`  
**Supersedes (code gate only):** [`DL-DEV-ORCH-001`](./DL-DEV-ORCH-001.md) Phase 1 “no Orchestrator runtime/code” restriction  
**Entry:** [`engineering/START_DEVELOPMENT.md`](../../engineering/START_DEVELOPMENT.md)  
**Founder gate answered:** [`SPRINT-DEV-ORCH-001-FOUNDER-GATE`](../architecture-reviews/SPRINT-DEV-ORCH-001-FOUNDER-GATE.md)  
**Phase 2 Sprint:** [`SPRINT-DEV-ORCH-002`](../../sprints/SPRINT-DEV-ORCH-002.md)

---

## Decision

**APPROVED**

Founder business approval for **Development Orchestrator Phase 2**: implement a runnable engineering tool that automates the approved Process Mode loop in [`SPEC-DEV-ORCH-001`](../../specs/SPEC-DEV-ORCH-001.md) and [`docs/DEV-ORCH-RUNBOOK.md`](../DEV-ORCH-RUNBOOK.md).

This Decision authorizes **tooling only**. It does **not** create a Platform Module, does **not** modify the Execution Harness, and does **not** authorize product-pipeline orchestration.

```text
Development Harness builds DYOGAS.
Execution Harness runs DYOGAS.
```

Phase 2 tooling lives on the **build** side. Execution Host / Runtime / SDK remain the **run** path (ADR-0010).

---

## Subject

**Capability:** Development Orchestrator Agent — Phase 2 executable tooling  

**Purpose:** Automate approved Development Harness workflow execution (Task Registry → Planner → Execution Package → Implementation Agent handoff → Verifier → Evidence → Registry Commit → Next Task) without bypassing Founder / Engineering Agent gates and without becoming a second Execution Harness.

---

## Architecture impact

**Verdict (expected):** `no_arch_impact` — engineering tool under MOD-ENGINEERING ownership; no new `MOD-*`; no ADR for platform topology  

**ADR:** **Not required** for this Decision as scoped  

**Architecture Review:** Confirm or amend [`AR-SPEC-DEV-ORCH-001`](../architecture-reviews/AR-SPEC-DEV-ORCH-001.md) before first Phase 2 Sprint exit (addendum acceptable if verdict unchanged)

---

## Tool location (binding)

| Decision | Value |
|----------|--------|
| **Package home** | `tools/dev-orch/` |
| **Rationale** | Matches existing engineering-tool precedent (`tools/schema-ci/`); outside Platform Module tree; discoverable without inventing `MOD-DEV-ORCH` |
| **Rejected alternatives** | `engineering/` as a source package; `docs/dev-orch/` as executable home (docs remain packages/evidence only); any new `MOD-DEV-ORCH` directory |

Evidence packages and prepared Execution Packages remain under `docs/dev-orch/` (markdown). Executable code **must** live in `tools/dev-orch/`.

---

## Ownership

| Field | Value |
|-------|--------|
| **Owner module (governance)** | **MOD-ENGINEERING** |
| **Spec** | SPEC-DEV-ORCH-001 (Process Mode capability — not a Platform Module) |
| **MASTER registration** | Keep under MOD-ENGINEERING Spec registry row; **do not** add `MOD-DEV-ORCH` |
| **Platform Module created?** | **NO** |

---

## Relationship to MOD-ENG-AGENTS / B17

| Item | Ruling |
|------|--------|
| **MOD-ENG-AGENTS (B17)** | Optional Hosted Mode for Engineering Agent **roles** on Agent SDK — deferred; separate track (`SPEC-ENGIN-005`) |
| **This Decision** | Process Mode **tooling** that automates Development Harness task loop |
| **Relationship** | **Separate.** Phase 2 does **not** implement, replace, or advance Hosted Engineering Agents |
| **SDK dependency** | Phase 2 tool **must not** require Agent SDK / Runtime to operate |

Process Mode Engineering Agents (`engineering/README.md` §2a) remain the approval chain. The Orchestrator tool assists workflow execution; it does not host Engineering Agent contracts.

---

## CI integration (binding)

| Decision | Value |
|----------|--------|
| **CI job** | Add a dedicated `dev-orch` job to `.github/workflows/ci.yml` |
| **Triggers** | Path filters for `tools/dev-orch/**` (and workflow file itself) |
| **Steps** | `npm ci` → `npm test` → `npm run build` (Node 22; same pattern as `tools/schema-ci` / platform packages) |
| **Boundary** | CI validates the tool only — does **not** invoke product pipelines, Execution Host, or agent contracts |

---

## Approved Scope

Implement under `tools/dev-orch/` (and CI wiring as above):

| Capability | Maps to |
|------------|---------|
| Task Registry parser | Runbook §3.1 |
| Planner selector | Runbook §3.2–§3.3 |
| Execution Package generator | Runbook §4 |
| Gate enforcement | START_DEVELOPMENT §5.2–§5.5; Spec §6–§7 |
| Verifier automation | Runbook §6 (V-1…V-8) |
| Evidence collector | Runbook §7 |
| Registry transition writer | Runbook §8 |

Also authorized:

- Phase 2 Sprint + Task Registry **preparation and execution** under Implementation Gate (Sprint IDs to be created only after this Decision is **APPROVED** — not by this draft alone)  
- Dry-run as default operator mode; explicit apply for registry writes  
- Tests proving fail-closed behavior and forbidden-scope enforcement  
- Updates to MASTER / engineering pointers that **do not** invent a new Platform Module  

---

## Explicit Non-Scope / MUST NOT

| Forbidden | Response |
|-----------|----------|
| Create **`MOD-DEV-ORCH`** (or any new Platform Module) | STOP |
| Modify **Runtime** | STOP |
| Modify **SDK** | STOP |
| Modify **Execution Host** | STOP |
| Modify **Product modules** (e.g. Personal Brain, Research Engine product surfaces beyond tool read of SSOT) | STOP |
| Become / substitute **Execution Harness** | STOP |
| Run **product agents** or drive product pipelines | STOP |
| Modify Harness law, unapproved contracts/schemas, or invent ADRs unilaterally | STOP |
| Implement **MOD-ENG-AGENTS** / B17 Hosted Mode under this Decision | STOP |
| Depend on `@dyogas/runtime`, `@dyogas/agent-sdk`, `@dyogas/execution-host`, or product packages | STOP |

Write allowlist for the tool (normative intent): Task Registries, `docs/dev-orch/**`, and sprint/module stage evidence paths named by Execution Packages — nothing under `runtime/`, `sdk/`, `execution-host/`, `harness/` (law), or product module `src/`.

---

## Preconditions before code

1. ~~Founder sets this Decision Status to **APPROVED**.~~ **Done** (2026-07-25).  
2. Architecture Review confirmation / addendum filed (`no_arch_impact` expected) — before or at Sprint exit.  
3. Phase 2 Sprint + Task Registry opened under SSOT — [`SPRINT-DEV-ORCH-002`](../../sprints/SPRINT-DEV-ORCH-002.md).  
4. Implementation Mode + Implementation Gate per START_DEVELOPMENT.

**Phase 2 code** is authorized under this Decision + Phase 2 Sprint tasks only. Still **no** Runtime / SDK / Host / Product / `MOD-DEV-ORCH`.

---

## Related

| Item | Path |
|------|------|
| Prior Decision (Phase 1) | `docs/decision-log/DL-DEV-ORCH-001.md` |
| Spec | `specs/SPEC-DEV-ORCH-001.md` |
| Runbook | `docs/DEV-ORCH-RUNBOOK.md` |
| Phase 1 Sprint (COMPLETE) | `sprints/SPRINT-DEV-ORCH-001.md` |
| Phase 1 Tasks (COMPLETE) | `tasks/TASK-REGISTRY-DEV-ORCH-001.md` |
| Phase 2 Sprint | `sprints/SPRINT-DEV-ORCH-002.md` |
| Phase 2 Tasks | `tasks/TASK-REGISTRY-DEV-ORCH-002.md` |
| Phase 2 Backlog | `docs/backlog/BACKLOG-DEV-ORCH-002.md` |
| Implementation Plan | `docs/dev-orch/PHASE2-IMPLEMENTATION-PLAN.md` |
| Founder Gate | `docs/architecture-reviews/SPRINT-DEV-ORCH-001-FOUNDER-GATE.md` |
| Arch Review | `docs/architecture-reviews/AR-SPEC-DEV-ORCH-001.md` |
| Engineering index | `engineering/README.md` |
| Tool precedent | `tools/schema-ci/` |

---

## Founder action

```text
Status: APPROVED (2026-07-25)
```

Phase 2 Sprint/tasks are authorized. Implement `tools/dev-orch/` under Implementation Gate per `SPRINT-DEV-ORCH-002`.

---

**End of DL-DEV-ORCH-002**
