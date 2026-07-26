# Decision

**ID:** DL-ENG-AGENT-IMPLEMENTATION-001  
**Date:** 2026-07-26  
**Owner:** Founder (business authority)  
**Mode:** Development Harness — Engineering Agent execution tooling authorization  
**Status:** **APPROVED**  
**Approved:** 2026-07-26 (Founder)  
**Implementation authorization:** **YES** (Sprint `SPRINT-ENG-AGENT-IMPLEMENTATION-001` under Implementation Gate)  
**Trace:** `TRACE-ENG-AGENT-001`  
**Entry:** [`engineering/START_DEVELOPMENT.md`](../../engineering/START_DEVELOPMENT.md)  
**Precedent:** [`DL-DEV-ORCH-002`](./DL-DEV-ORCH-002.md) (build-side tooling authorization pattern)  
**Sprint:** [`SPRINT-ENG-AGENT-IMPLEMENTATION-001`](../../sprints/SPRINT-ENG-AGENT-IMPLEMENTATION-001.md)

---

## Decision

**APPROVED**

Founder business approval for **Development Harness Engineering Agent** tooling: enable the Development
Harness to **execute authorized engineering tasks automatically**, integrating with the existing
`tools/dev-orch/` loop (task execution adapter, verifier integration, evidence generation).

```text
Development Harness builds DYOGAS.   ← this tooling (MOD-ENGINEERING)
Execution Harness runs DYOGAS.       ← Runtime / SDK / Execution Host, untouched
```

---

## Founder clarification (binding)

**ENG-AGENT-IMPLEMENTATION-001 means:** Development Harness Engineering Agent.

**Purpose:** Allow the Development Harness to execute authorized engineering tasks automatically.

| It is | It is NOT |
|-------|-----------|
| MOD-ENGINEERING build-side tooling | Hosted `MOD-ENG-AGENTS` |
| Engineering execution agent for authorized tasks | B17 implementation |
| `tools/dev-orch` integration + adapters | A new Platform Module |
| Verifier + evidence integration | An agent marketplace |
| Process Mode Development Harness capability | A Runtime replacement |

---

## Objective

Close the known limitation recorded at [`SPRINT-DEV-ORCH-002` exit](../dev-orch/P2-10-sprint-exit.md) —
*"the Development Orchestrator contains no Coding Agent and no LLM execution"* — by shipping a build-side
**engineering execution agent** that can carry out Task Registry–authorized work under the Development
Orchestrator, without becoming Hosted Engineering Agents, a Platform Module, or a product-agent runtime.

---

## Authorization

| Field | Value |
|-------|-------|
| **Authority** | Founder business approval (this Decision) |
| **Current status** | **APPROVED** (2026-07-26) |
| **Implementation authorized** | **YES** — under `SPRINT-ENG-AGENT-IMPLEMENTATION-001` + Implementation Gate |
| **Architecture boundary** | **MOD-ENGINEERING tooling only** |

---

## Scope (approved)

Build-side tooling only, under **MOD-ENGINEERING** governance:

| Capability | Notes |
|------------|-------|
| `tools/dev-orch` integration | Handoff at Implementation Agent step; preserve dry-run default and gate/verifier contracts |
| Engineering execution agent | Executes **authorized** engineering tasks only (Task Registry + Execution Package + Gate) |
| Task execution adapter | Adapter between Orchestrator Execution Package and engineering task execution |
| Verifier integration | Consume / feed Orchestrator verifier; no inventing PASS |
| Evidence generation | Produce evidence records for registry / stage paths (allowlisted writes) |

**Package home (binding):** `tools/eng-agent/` (sibling of `tools/dev-orch/`, `tools/schema-ci/`) — outside the
Platform Module tree.

---

## Non-goals / Forbidden

| Forbidden | Response |
|-----------|----------|
| Create **`MOD-ENG-AGENTS`** (Hosted Mode) / advance **B17** | STOP |
| Create any **new `MOD-*`** Platform Module | STOP |
| Modify **Runtime** | STOP |
| Modify **Agent SDK** | STOP |
| Bypass **Execution Host** / become Execution Harness | STOP |
| Create **autonomous product agents** / agent marketplace | STOP |
| Depend on `@dyogas/runtime`, `@dyogas/agent-sdk`, `@dyogas/execution-host`, or product packages | STOP |
| Unilateral Spec/ADR invent or GAP closure without verification | STOP |

---

## Architecture impact

**Verdict (expected):** `no_arch_impact` — MOD-ENGINEERING tooling only; no new `MOD-*`; no Runtime / SDK /
Execution Host change; no Hosted `MOD-ENG-AGENTS` / B17.

**ADR:** Not required for this Decision as scoped.

**Open architecture question (RESOLVED by Founder clarification, 2026-07-26):** This is **not** Hosted Mode,
**not** B17, and **not** a Runtime/SDK dependency path. It is Development Harness Process Mode tooling under
MOD-ENGINEERING. File Architecture Review confirmation / addendum (`no_arch_impact`) at or before Sprint exit.

---

## Implementation authorization

```text
Implementation authorized: YES
Sprint: SPRINT-ENG-AGENT-IMPLEMENTATION-001 — READY_FOR_EXECUTION
First executable task: EA-01 (package scaffold)
Code: authorized under Implementation Gate; execute via Task Registry only
```

---

## Preconditions (post-approval)

1. ~~Founder sets this Decision Status to **APPROVED**.~~ **Done** (2026-07-26).  
2. Architecture Review confirmation / addendum (`no_arch_impact` expected) — before or at Sprint exit.  
3. Spec hygiene: author `SPEC-ENG-AGENT-001` (or equivalent stage note) as evidence during sprint if needed for exit completeness; **does not block EA-01**.  
4. Implementation Mode + Implementation Gate per `START_DEVELOPMENT` §5.

---

## Relationship to prior tracks

| Track | Ruling |
|-------|--------|
| `SPRINT-DEV-ORCH-002` (COMPLETE) | Predecessor; this sprint adds the missing execution agent handoff |
| `MOD-ENG-AGENTS` / B17 (`SPEC-ENGIN-005`) | **Separate, deferred.** This Decision does **not** implement or advance it |
| `SPRINT-AGT-000` / Agent Contract Layer | Product agent contracts — unrelated |

---

## Related

| Item | Path |
|------|------|
| Sprint | `sprints/SPRINT-ENG-AGENT-IMPLEMENTATION-001.md` |
| Task Registry | `tasks/TASK-REGISTRY-ENG-AGENT-IMPLEMENTATION-001.md` |
| Backlog | `docs/backlog/BACKLOG-ENG-AGENT-IMPLEMENTATION-001.md` |
| Build-side precedent | `docs/decision-log/DL-DEV-ORCH-002.md` · `tools/dev-orch/` |
| Engineering process law | `engineering/README.md` §2a (approval model unchanged; this Decision does not redefine it) |
| Prior sprint exit | `docs/dev-orch/P2-10-sprint-exit.md` |

---

## Founder action

```text
Status: APPROVED (2026-07-26)
Clarification: Development Harness Engineering Agent — execute authorized engineering tasks automatically.
NOT: Hosted MOD-ENG-AGENTS · B17 · new Platform Module · agent marketplace · Runtime replacement
```

---

**End of DL-ENG-AGENT-IMPLEMENTATION-001**
