# Decision

**ID:** DL-RESEARCH-AGENT-MVP-001  
**Date:** 2026-07-26  
**Owner:** Founder (business authority)  
**Mode:** Development Harness — Implementation Mode  
**Status:** **APPROVED**  
**Decision:** **APPROVED** (Founder FULL AUTONOMOUS HARNESS EXECUTION directive — 2026-07-26)  
**Implementation authorization:** **YES** (Band A only: RA-01…RA-04, RA-06, RA-08)  
**Approved:** 2026-07-26  
**Founder decisions recorded:** **D-1a** (`research/src/` + approved docs; no new `agents/` tree) · **D-2a** (Band A now; Band B BLOCKED pending allow-egress ADR) · **D-3** (Coding Agent write exception for `research/src/` + `research/tests/` — already patched in eng-agent)  
**Architecture Review:** **`no_arch_impact`** for Band A (consumes existing MOD-RESEARCH + binding contract v2.0.0; no Runtime/SDK/Host redesign)  
**Trace:** `TRACE-RESEARCH-AGENT-MVP-001`  
**Sprint:** [`SPRINT-RESEARCH-AGENT-MVP-001`](../../sprints/SPRINT-RESEARCH-AGENT-MVP-001.md)  
**Entry:** [`engineering/START_DEVELOPMENT.md`](../../engineering/START_DEVELOPMENT.md)

---

## Subject

Use the completed Development Harness (`dev-orch` + `eng-agent` + Coding Agent + Verifier)
to deliver the first **real Research Agent MVP** — replacing mock-only evidence collection
in Stage 1 of `knowledge-ingestion` with a governed, provenance-complete evidence path.

## Repository audit — binding findings

Two findings materially change the requested scope. Both require an explicit Founder decision
before this sprint can be authorized.

### Finding 1 — `agents/research-agent/` does not exist and must not be created

The Research Agent is **already implemented** across existing SSOT:

| Asset | Location | Status |
|-------|----------|--------|
| Agent contract | `contracts/agents/research-agent.md` | **Binding** v2.0.0 |
| Input schema | `schemas/agents/research-agent.schema.json` | Present |
| Output artifact schema | `schemas/artifacts/research-report.schema.json` | Present |
| Implementation | `research/` — `@dyogas/research-engine` (**MOD-RESEARCH**, B9+B10) | **Module Complete** |
| Host Stage-1 wiring | `execution-host/` → `ResearchEngine.execute()` | **COMPLETE** (`SPRINT-HOST-RESEARCH-INTEGRATION-001`) |
| Product consume | `personal-brain/src/bridge/` | **COMPLETE** (`SPRINT-PB-BRIDGE-CODING-001`) |

Creating a new `agents/research-agent/` implementation tree would fork `MOD-RESEARCH`,
producing a duplicate Research SoR. That violates the sprint's own "no new MOD" constraint
and `docs/ROADMAP.md` Phase 4 ("zero duplicate SoRs") / Prioritization Rule 4.

**Proposed correction:** scope this sprint to **`research/src/`** (existing MOD-RESEARCH),
plus already-approved `personal-brain/` bridge integration points. No `agents/` tree is created.

### Finding 2 — the real MVP gap is live collectors, which are egress-gated

Stage 1 currently returns **mock evidence**:

```text
research/src/sources.ts → createMockSourceCollector()
  "Mock collector — no network (ADR-0002 deny-default / OOS-T-002)"
```

A "real" Research Agent MVP means real Web / GitHub / Reddit / YouTube evidence. That is
**OOS-RE-001** (live source adapters) and requires an **Accepted ADR superseding ADR-0002**
(Trust allow-egress). Existing SSOT records this as a Founder **hard stop**
(`stage/GAP_ANALYSIS.md` §5; `docs/EXTERNAL_DEPENDENCY_SETUP.md`).

**Proposed correction:** split the sprint into two bands.

| Band | Content | Gate |
|------|---------|------|
| **Band A** (RA-01…RA-04, RA-06) | Collector abstraction, budget/provenance/fabrication guards, evidence + verification, all provable with offline/fixture collectors | This Decision only |
| **Band B** (RA-05, RA-07) | Live egress collectors and full autonomous run against real sources | **Additionally** requires allow-egress ADR |

Band A delivers a genuinely real agent capability (governed collection contract, budget
enforcement, provenance integrity, fail-closed behavior) without opening the network.
Band B stays **BLOCKED** until the egress ADR is Accepted.

## Decisions required from Founder

| # | Decision | Options |
|---|----------|---------|
| **D-1** | Sprint scope path | **(a)** Correct scope to `research/src/` + approved `personal-brain/` integration points **(recommended)** · **(b)** Insist on `agents/research-agent/` and accept a duplicate Research module · **(c)** Cancel |
| **D-2** | Egress | **(a)** Approve Band A now, keep Band B BLOCKED pending allow-egress ADR **(recommended)** · **(b)** Open allow-egress ADR first and run both bands · **(c)** Band A only, drop Band B |
| **D-3** | Coding Agent write scope | The Coding Agent instruction builder currently forbids `research/`. Approve a scoped write exception for `research/src/` + `research/tests/` (same pattern as `DL-HARNESS-FIRST-PRODUCTION-TASK-001`) |

## Proposed scope (assuming D-1a / D-2a / D-3 approved)

Allowed implementation paths:

- `research/src/` — collector interface, guards, report candidate assembly
- `research/tests/` — unit, budget, provenance, fail-closed suites
- `personal-brain/src/bridge/`, `personal-brain/tests/` — already-approved integration points only
- `docs/eng-agent/`, `docs/dev-orch/execution-packages/` — Harness evidence

Read-only sources: `contracts/agents/research-agent.md` · `schemas/agents/research-agent.schema.json` ·
`schemas/artifacts/research-report.schema.json` · `pipelines/knowledge-ingestion.md` ·
`harness/SKILL_SPECIFICATION.md` §5.1–5.4 · `execution-host/` (consume only)

## Explicit non-scope

- New `agents/research-agent/` module tree · any new `MOD-*`
- Runtime redesign · Agent SDK redesign · Execution Host redesign
- Agent contract version bump (`research-agent` stays v2.0.0)
- Artifact/schema invention
- Live network egress without an Accepted allow-egress ADR
- Source credibility judgement (Stage 2 Source Validation Agent owns this)
- Knowledge Plane SoR writes from the Research Agent
- Hosted `MOD-ENG-AGENTS`

## Architecture impact

**Expected `no_arch_impact` for Band A** — consumes the existing binding contract and existing
module. Band B (live egress) **requires ADR** superseding ADR-0002. Architecture Reviewer
confirms before Implementation Mode.

## Approval gate

Implementation remains prohibited until all are true:

1. Founder records **D-1**, **D-2**, **D-3**.
2. This Decision becomes **APPROVED**.
3. Architecture Review records `no_arch_impact` for the authorized band.
4. Sprint status → **READY_FOR_EXECUTION**.
5. `RA-01` → **READY_FOR_EXECUTION**.

## Implementation authorization

| Item | Authorized? |
|------|-------------|
| Decision Log / Sprint / Task Registry / Backlog authoring | **Yes** |
| Research Agent MVP code (Band A) | **Yes** — Founder APPROVED 2026-07-26 |
| Live egress collectors (Band B) | **No** — additionally requires allow-egress ADR |
| Runtime / Agent SDK / Execution Host changes | **No** — permanently out of scope |
| New `agents/` module tree | **No** (D-1a) |

```text
APPROVED_FOR_EXECUTION (Band A)
Band B remains BLOCKED (allow-egress ADR)
```

## Related

| Item | Reference |
|------|-----------|
| Agent contract | `contracts/agents/research-agent.md` |
| Engine module | `research/` · `research/MODULE_STATUS.md` |
| Engine Spec | `research/specs/SPEC-ENGIN-001.md` · `SPEC-ENGIN-001-B10.md` |
| Host Stage-1 integration | `sprints/SPRINT-HOST-RESEARCH-INTEGRATION-001.md` |
| Product bridge | `personal-brain/specs/SPEC-PROD-004-HARNESS-BRIDGE.md` |
| Egress constraint | `stage/GAP_ANALYSIS.md` · `docs/EXTERNAL_DEPENDENCY_SETUP.md` · ADR-0002 |
| Harness precedent | `docs/decision-log/DL-HARNESS-FIRST-PRODUCTION-TASK-001.md` |
| Sprint | `sprints/SPRINT-RESEARCH-AGENT-MVP-001.md` |
| Task Registry | `tasks/TASK-REGISTRY-RESEARCH-AGENT-MVP-001.md` |
| Backlog | `docs/backlog/BACKLOG-RESEARCH-AGENT-MVP-001.md` |

---

**End of DL-RESEARCH-AGENT-MVP-001**
