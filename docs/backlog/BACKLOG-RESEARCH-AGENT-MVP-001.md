# Backlog Item

**ID:** BACKLOG-RESEARCH-AGENT-MVP-001  
**Type:** `feature` (product capability — Stage 1 of `knowledge-ingestion`)  
**Layer:** **MOD-RESEARCH** (existing module) — **not** a new module  
**Trace:** `TRACE-RESEARCH-AGENT-MVP-001`  
**Status:** `done` — [`SPRINT-RESEARCH-AGENT-MVP-001`](../../sprints/SPRINT-RESEARCH-AGENT-MVP-001.md) **COMPLETE** · Exit **PASS** (Band A) · Band B **BLOCKED** (2026-07-26)  
**Priority rank:** 1 within product capability work (first Harness-executed product feature)  
**Estimate band:** `L` (Band A `M`; Band B egress-gated)  
**Date:** 2026-07-26  
**Auth:** [`DL-RESEARCH-AGENT-MVP-001`](../decision-log/DL-RESEARCH-AGENT-MVP-001.md) — **APPROVED**  
**Predecessor:** [`SPRINT-HARNESS-FIRST-PRODUCTION-TASK-001`](../../sprints/SPRINT-HARNESS-FIRST-PRODUCTION-TASK-001.md) — first Harness production task, **COMPLETE** · Exit PASS (no backlog entry was raised for that sprint)

---

## Intent

Use the completed Development Harness to deliver the first **real Research Agent MVP**:

```text
Task Registry
  → dev-orch
  → eng-agent
  → Cursor Coding Agent
  → tests
  → Verifier
  → evidence
```

Stage 1 of `knowledge-ingestion` currently produces **mock evidence only**
(`research/src/sources.ts → createMockSourceCollector()`). The MVP replaces mock-only behavior
with an enforceable collection contract: pluggable collectors, hard budget stops, mandatory
resolvable provenance, source-class allowlist enforcement, explicit coverage gaps, and
fail-closed refusal.

**Scope correction on record.** The request named `agents/research-agent/`. No such directory
exists — the Research Agent is already implemented as **MOD-RESEARCH** under `research/`, with a
binding v2.0.0 contract and completed Host Stage-1 integration. Creating `agents/research-agent/`
would fork the module and create a duplicate Research SoR, violating the sprint's own
"no new MOD" constraint and ROADMAP Phase 4. See `DL-RESEARCH-AGENT-MVP-001` Finding 1.

---

## Links

| Field | Link |
|-------|------|
| Decision Log | [`DL-RESEARCH-AGENT-MVP-001`](../decision-log/DL-RESEARCH-AGENT-MVP-001.md) **APPROVED** |
| Sprint | [`SPRINT-RESEARCH-AGENT-MVP-001`](../../sprints/SPRINT-RESEARCH-AGENT-MVP-001.md) **COMPLETE** · Exit **PASS** (Band A) |
| Task Registry | [`TASK-REGISTRY-RESEARCH-AGENT-MVP-001`](../../tasks/TASK-REGISTRY-RESEARCH-AGENT-MVP-001.md) |
| Agent contract (binding) | [`contracts/agents/research-agent.md`](../../contracts/agents/research-agent.md) v2.0.0 |
| Module | [`research/MODULE_STATUS.md`](../../research/MODULE_STATUS.md) — MOD-RESEARCH, B9+B10 complete |
| Host Stage-1 integration | [`SPRINT-HOST-RESEARCH-INTEGRATION-001`](../../sprints/SPRINT-HOST-RESEARCH-INTEGRATION-001.md) |
| Harness precedent | [`DL-HARNESS-FIRST-PRODUCTION-TASK-001`](../decision-log/DL-HARNESS-FIRST-PRODUCTION-TASK-001.md) |
| Egress constraint | [`stage/GAP_ANALYSIS.md`](../../stage/GAP_ANALYSIS.md) · ADR-0002 · OOS-RE-001 / OOS-T-002 |

---

## Definition of Ready

| Item | Status |
|------|--------|
| DL APPROVED | **No** — pending Founder decisions D-1 / D-2 / D-3 |
| Scope path resolved (D-1) | **Pending** — `research/src/` proposed over new `agents/` tree |
| Egress band decision (D-2) | **Pending** — Band A now, Band B ADR-gated |
| Coding Agent write exception for `research/` (D-3) | **Pending** |
| Sprint + Task Registry authored | **Yes** |
| First executable task | **RA-01** (after approval) |
| Architecture Review | Required before Implementation Mode |
| Runtime / SDK / Host redesign required | **No** |
| Development Harness available | **Yes** — Exit PASS |

---

## Success metrics

| Metric | Target |
|--------|--------|
| Mock-only Stage-1 dependency removed | Yes (pluggable collector boundary) |
| Budget enforced as hard stop | Proven by test |
| Evidence items lacking provenance | 0 (fail closed) |
| Disallowed source class accepted | 0 |
| Runtime-generated evidence | 100% (no hand-authored evidence) |
| New `MOD-*` created | 0 |
| New `agents/` module tree | 0 |
| Runtime / SDK / Execution Host changes | 0 |
| Contract version bump | 0 (stays v2.0.0) |
| Live egress without Accepted ADR | 0 |
| SAC-1 … SAC-11 | PASS at sprint exit |

---

## Known blocker

**Band B (RA-05, RA-07) is BLOCKED.** Live source adapters (**OOS-RE-001**) require an Accepted
ADR superseding **ADR-0002** (Trust allow-egress) — a documented Founder hard stop. Band B must
not be claimed complete using mock collector output.

---

## Explicit non-scope

New `agents/research-agent/` tree · new `MOD-*` · Runtime redesign · Agent SDK redesign ·
Execution Host redesign · contract or schema version changes · Stage 2+ pipeline stages ·
source credibility scoring · Knowledge Plane SoR writes from Stage 1 · cloud LLM summarization ·
UI surfaces · Hosted `MOD-ENG-AGENTS`

---

**End of BACKLOG-RESEARCH-AGENT-MVP-001**
