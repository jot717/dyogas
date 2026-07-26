# Research Agent MVP Specification (Band A)

**Task:** RA-01  
**Sprint:** SPRINT-RESEARCH-AGENT-MVP-001  
**Auth:** DL-RESEARCH-AGENT-MVP-001 **APPROVED**  
**Contract:** [`contracts/agents/research-agent.md`](../../contracts/agents/research-agent.md) v2.0.0 (read-only; no version bump)  
**Module:** MOD-RESEARCH (`research/`) — **not** a new `agents/research-agent/` tree  
**Date:** 2026-07-26

---

## 1. Purpose

Define the Band A Research Agent MVP: a governed, provenance-complete, budget-bounded
collection path for Stage 1 of `knowledge-ingestion`, executed offline with pluggable
collectors. Live egress (Band B) remains out of scope until an Accepted ADR supersedes
ADR-0002.

## 2. Contract traceability

| MVP requirement | Contract clause | Band |
|-----------------|-----------------|------|
| Pluggable collector boundary (mock is default, not sole path) | §5.3 skills / §13.5 Collect — collector is injectable; no hardcoded-only path | A |
| Hard budget stop (`max_items`, optional `max_seconds`) | §6 `budget`; §12 V8; §14 budget truncation → coverage gap | A |
| Mandatory resolvable `provenance.pointer` | §7; §11.2; §12 V5 | A |
| Source-class allowlist enforcement | §6 `allowed_source_classes`; §12 V4 | A |
| Explicit `coverage_gaps` / `open_questions` | §5.5; §7; §11.4; §12 V7 | A |
| Fail-closed on empty/invalid provenance | §11.2–11.3; fabrication forbidden | A |
| No Knowledge Plane SoR write from Stage 1 | §2.2 Out of Scope; §5.7 | A |
| No source credibility scoring | §2.2; Stage 2 owns validation | A |
| Live Web/GitHub/Reddit/YouTube network collection | §5.3 + EgressGate (§12 V9) | **B** (BLOCKED — ADR-0002) |
| Harness autonomous live-source E2E | Pipeline + egress | **B** (BLOCKED) |

## 3. Architecture (Band A)

```text
ResearchBrief
  → createResearchTask (ambient Kernel tenancy required)
  → SourceCollector.collect (injected or default mock — no network)
  → BudgetGuard (max_items / max_seconds hard stop)
  → ProvenanceGuard (refuse empty/missing pointer)
  → AllowlistGuard (drop/refuse classes outside allowed_source_classes)
  → EvidenceLedger + coverage_gaps
  → ResearchReport candidate (schema-shaped)
  → CollectionRunEvidence (machine-readable runtime evidence)
```

Host Stage-1 path remains: `ExecutionHost` → `ResearchEngine.execute()` (consume only).

## 4. Module ownership

| Path | Role |
|------|------|
| `research/src/` | Implementation |
| `research/tests/` | Verification |
| `docs/research-agent/` | Spec + sprint evidence |
| `contracts/agents/research-agent.md` | Binding, read-only |
| `schemas/artifacts/research-report.schema.json` | Binding, read-only |

**Forbidden:** new MOD; `agents/research-agent/`; Runtime / SDK / Execution Host redesign;
contract/schema version changes; live network without allow-egress ADR.

## 5. Acceptance mapping to sprint SAC

| SAC | Covered by |
|-----|------------|
| SAC-1 | This document |
| SAC-2 | Task Registry → Harness path |
| SAC-3…SAC-6 | RA-03 |
| SAC-7 | RA-04 |
| SAC-8 | RA-06 |
| SAC-9…SAC-10 | Regression + boundary |
| SAC-11 | RA-05 / RA-07 remain BLOCKED |

## 6. Band B blocker (explicit)

Live source adapters (**OOS-RE-001**) and autonomous real-source runs require an Accepted ADR
superseding **ADR-0002**. Mock or fixture collectors must not be substituted to claim Band B.

---

**End of RA-01**
