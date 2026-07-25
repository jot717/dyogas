# C-06 — Smoke Test Evidence

**Task:** C-06  
**Sprint:** SPRINT-PB-BRIDGE-CODING-001  
**Date:** 2026-07-25  
**Status:** DONE  
**Result:** **PASS** (within Host MVP lineage-seal limits)

---

## End-to-end execution path (as implemented)

```text
Research Request
        ↓  buildResearchBriefBootstrap (C-01)
Research Brief bootstrap (+ identity)
        ↓  createBridgeRun / ExecutionHost.createRun (C-02)
Host Stage 1 (bind Research Agent; MVP synthetic seal) (C-03/C-04)
        ↓
Host MVP ResearchReport reference (lineage.research_report_ref)
        ↓  persistResearchReportReference (C-05)
Persisted product-local reference index
        ↓
PASS
```

---

## Smoke checkpoints verified

| Checkpoint | Result |
|------------|--------|
| Research Request created | PASS |
| Brief created | PASS |
| createRun succeeds | PASS |
| Host returns lineage | PASS |
| ResearchReport reference exists | PASS (MVP lineage seal) |
| Persistence succeeds | PASS |
| Lineage preserved | PASS |
| Ownership preserved | PASS |
| Tenancy preserved | PASS |
| Correlation preserved | PASS |
| No Runtime/SDK orchestrator in smoke | PASS |

---

## MVP limitations encountered (not solved)

| Limitation | GAP |
|------------|-----|
| No schema-valid ResearchReport **payload** from Host | **GAP-BR-019 P0** (OPEN — not closed) |
| Research Engine not wired into Host Stage 1 | **GAP-EH-003 P0** |
| Ambient Kernel tenancy required before createRun | **GAP-BR-012** |
| `run_id` on bootstrap only after Host assign | **GAP-BR-005** |
| Product defaults for omitted Brief fields | **GAP-BR-002 / 003 / 004** |

Production mode observed: `host_mvp_lineage_seal`.

---

## Evidence

| Artifact | Path |
|----------|------|
| Smoke test | `tests/bridge-smoke-c06.test.ts` |
| Entry used | `executeAndPersistResearchViaHost` |

---

## Executable today?

**YES** — from Research Request through Persistence of the Host ResearchReport **reference**, under documented MVP limits. Full schema-body ResearchReport remains blocked by GAP-BR-019 / planned Host integration sprint.

---

**End of C-06**
