# TASK-REGISTRY — SPRINT-DECISION-GRAPH-FOUNDATION-001

**Sprint:** SPRINT-DECISION-GRAPH-FOUNDATION-001  
**Trace:** `TRACE-DECISION-GRAPH-FOUNDATION-001`  
**Decision Log:** DL-DECISION-GRAPH-FOUNDATION-001 (**APPROVED**)  
**Updated:** 2026-07-26  
**Sprint status:** **COMPLETE · Exit PASS**

---

## Task table

| ID | Title | Depends | Owner module | Write scope | Status | Evidence |
|----|-------|---------|--------------|-------------|--------|----------|
| DG-01 | Evidence → Knowledge → Decision graph contract | — | MOD-GRAPH | `graph/src/decision-graph-contract.ts`, `docs/decision-graph/` | **DONE** | DG-01-contract.md |
| DG-02 | Graph schemas + decision ontology | DG-01 | MOD-GRAPH | `graph/src/ontology.ts`, `schemas/artifacts/decision-graph-foundation.schema.json` | **DONE** | schema + ontology |
| DG-03 | Evidence ingestion adapter from Research | DG-01 | MOD-KNOWLEDGE | `knowledge/src/evidence-ingest.ts` | **DONE** | evidence-ingest.test.ts |
| DG-04 | Human approval gate wiring | DG-03 | human-gate | `human-gate/src/decision-graph-gate.ts` | **DONE** | decision-graph-gate.test.ts |
| DG-05 | Persist approved knowledge nodes | DG-02, DG-04 | MOD-GRAPH | `graph/src/decision-graph-persist.ts` | **DONE** | decision-graph.test.ts |
| DG-06 | Graph verification tests | DG-05 | graph + knowledge + e2e | `*/tests/**`, `ingestion-e2e/tests/` | **DONE** | all green |
| DG-07 | Sprint exit | DG-06 | SSOT | sprint + MODULE_STATUS + exit doc | **DONE** | DG-07-sprint-exit.md |

## Dependency order

```text
DG-01 → DG-02 ─┐
       → DG-03 → DG-04 ─┴→ DG-05 → DG-06 → DG-07
```

## Coding Agent exceptions (DL D-3)

`graph/src/`, `graph/tests/`, `knowledge/src/`, `knowledge/tests/`,
`human-gate/src/`, `human-gate/tests/`, `ingestion-e2e/tests/`,
`schemas/artifacts/`, `docs/decision-graph/`, `docs/eng-agent/production/`

Forbidden: `runtime/`, `sdk/`, `execution-host/`, `personal-brain/`, `kernel/`, `harness/`

---

**End of TASK-REGISTRY-DECISION-GRAPH-FOUNDATION-001**
