# TASK REGISTRY

**Registry ID:** TASK-REGISTRY-PB-BRIDGE-CODING-001  
**Created:** 2026-07-25  
**Mode:** **Implementation Mode** — Sprint **APPROVED** (`DL-PB-BRIDGE-CODING-001`)  
**Sprint:** [`../sprints/SPRINT-PB-BRIDGE-CODING-001.md`](../sprints/SPRINT-PB-BRIDGE-CODING-001.md)  
**Trace:** TRACE-PB-BRIDGE-001 (coding slice)  
**Spec:** [`../specs/SPEC-PROD-004-HARNESS-BRIDGE.md`](../specs/SPEC-PROD-004-HARNESS-BRIDGE.md) (`accepted`)  
**Auth:** [`../../docs/decision-log/DL-PB-BRIDGE-CODING-001.md`](../../docs/decision-log/DL-PB-BRIDGE-CODING-001.md) **APPROVED**  
**Predecessor:** SPRINT-PB-HARNESS-BRIDGE-001 COMPLETE · G2 coding follow-up YES  
**Forbidden:** Runtime / SDK / Harness / Host **rewrite**; product→Runtime orchestration; product agent bind; UI; Decision Agent; schema invent; architecture redesign  
**GAP Registry (carry-forward):** [`../stage/bridge/GAP-REGISTRY-PB-HARNESS-BRIDGE-001.md`](../stage/bridge/GAP-REGISTRY-PB-HARNESS-BRIDGE-001.md)  
**Process:** Sprint **COMPLETE** — all C-01–C-07 **DONE** · Exit **PASS**  
**Last updated:** 2026-07-25 (C-07 DONE · sprint COMPLETE)  

---

## Task rules

| Field | Meaning |
|-------|---------|
| Task ID | C-01 … C-07 |
| Status | `READY_FOR_EXECUTION` → `IN_PROGRESS` → `DONE` \| `BLOCKED` |

---

## Execution order

```text
C-01 → C-02 → C-03 → C-04 → C-05 → C-06 → C-07
```

---

## C-01 — Research Request Builder

| Field | Content |
|-------|---------|
| **Task ID** | C-01 |
| **Objective** | Implement Personal Brain **Research Request → ResearchBrief-shaped bootstrap** builder (existing A2 map; no new schema). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | Founder APPROVE (`DL-PB-BRIDGE-CODING-001`) |
| **Input artifacts** | A1/A2; SPEC-PROD-004; Research Agent input schema; GAP-BR-002…005 |
| **Expected output artifact** | Code under `personal-brain/src/bridge/` (e.g. request/brief builder module) |
| **Acceptance Criteria** | Builder accepts Research Request fields; emits Host-ready `bootstrap` Record; fail-closed on missing required fields; no UI; no schema invent (defaults per product policy or fail — cite GAP if choosing). |
| **Test Requirement** | Unit tests for map + fail-closed cases. |
| **Status** | **DONE** (2026-07-25) |
| **Evidence** | `src/bridge/research-request.ts` · `tests/bridge-research-request.test.ts` |

---

## C-02 — createRun integration

| Field | Content |
|-------|---------|
| **Task ID** | C-02 |
| **Objective** | Wire builder output to **`ExecutionHost.createRun()`** with `selectApprovedPipelineForCreateRun()` pin + tenancy/caller/correlation (B2–B4). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | C-01 |
| **Input artifacts** | B2–B4; F4 harness; `@dyogas/execution-host`; `pipeline-pin.ts` |
| **Expected output artifact** | PB bridge entry function(s) calling Host only |
| **Acceptance Criteria** | createRun invoked with `knowledge-ingestion@2.0.0`; returns/observes `HostRun`; **no** `@dyogas/runtime` orchestrator import; ambient Kernel/Trust prep documented (GAP-BR-012). |
| **Test Requirement** | Integration or harness test: createRun called with correct pin fields (mock Host OK if Host unavailable in CI — prefer real Host when env ready). |
| **Status** | **DONE** (2026-07-25) |
| **Evidence** | `src/bridge/create-run.ts` · `tests/bridge-create-run.test.ts` |

---

## C-03 — Host Research Agent path (Stage 1)

| Field | Content |
|-------|---------|
| **Task ID** | C-03 |
| **Objective** | Confirm Stage 1 **Research Agent** is reached via **Host-internal** bind/execute after createRun — Personal Brain must **not** bind agents or call SDK. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | C-02 |
| **Input artifacts** | C2 stage map; SPEC-AGT-001; Host executor (consume-only); B1 |
| **Expected output artifact** | Evidence note + any PB-side observation helpers (refs/status only); **no** Host/SDK source edits |
| **Acceptance Criteria** | Documented/proven that Research Agent execution is Host-owned; PB has zero agent-bind code; if Host path incomplete, record **BLOCKED** + GAP — do not rewrite Host. |
| **Test Requirement** | Assert no PB SDK bind; HostRun/stage evidence or explicit BLOCKED record. |
| **Status** | **DONE** (2026-07-25) |
| **Evidence** | `src/bridge/research-agent-path.ts` · `tests/bridge-research-agent-path.test.ts` · `stage/bridge/C03-host-research-agent-path.md` |

---

## C-04 — Execute Research Agent via Host

| Field | Content |
|-------|---------|
| **Task ID** | C-04 |
| **Objective** | Exercise Host-driven Stage 1 execution until Research Agent completes (fixture LLM/hooks only if Host already supports — **no** Host rewrite to add hooks). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | C-03 |
| **Input artifacts** | SPEC-AGT-001; Host public API; prior design F3/F4 |
| **Expected output artifact** | Runnable path or skip/BLOCKED evidence under `personal-brain/` tests or `stage/bridge/` |
| **Acceptance Criteria** | Agent execution occurs only through Host run; PB does not invoke Research Agent directly; failures fail-closed. |
| **Test Requirement** | Smoke or integration asserting stage progression or Host status toward ResearchReport. |
| **Status** | **DONE** (2026-07-25) |
| **Evidence** | `src/bridge/execute-research.ts` · `tests/bridge-execute-research.test.ts` · `stage/bridge/C04-execute-research-via-host.md` · **GAP-BR-019** |

---

## C-05 — Persist ResearchReport Artifact

| Field | Content |
|-------|---------|
| **Task ID** | C-05 |
| **Objective** | Ensure ResearchReport is **sealed/persisted via existing Host/Runtime artifact path**; PB retains lineage refs only (no parallel SoR). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | C-04 |
| **Input artifacts** | C3 emit map; ResearchReport artifact/schema; E1 LA-RR-01 |
| **Expected output artifact** | PB consume of `HostRun.lineage` / report ref; optional thin indexer — **not** a second artifact store |
| **Acceptance Criteria** | ResearchReport available via Host lineage/refs; envelope fields not invented; GAP-BR-017/018 not “fixed” by schema fork. |
| **Test Requirement** | Assert report ref or sealed artifact observable after successful Stage 1. |
| **Status** | **DONE** (2026-07-25) |
| **Evidence** | `src/bridge/persist-research-report.ts` · `src/persist/research-report-ref-store.ts` · `tests/bridge-persist-research-report.test.ts` |

---

## C-06 — Smoke Test

| Field | Content |
|-------|---------|
| **Task ID** | C-06 |
| **Objective** | End-to-end smoke: Research Request → createRun → ResearchReport (F4 subset + this slice). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | C-05 |
| **Input artifacts** | F4 harness design; C-01…C-05 outputs |
| **Expected output artifact** | Test(s) under `personal-brain/tests/` (or documented env-gated smoke) |
| **Acceptance Criteria** | One green smoke **or** explicit BLOCKED with Host/env cause (no platform rewrite); FC-13 still holds (no Runtime orchestrator). |
| **Test Requirement** | `npm test` (or package test script) remains green for unrelated suites; smoke tagged/env-gated as needed. |
| **Status** | **DONE** (2026-07-25) |
| **Evidence** | `tests/bridge-smoke-c06.test.ts` · `stage/bridge/C06-smoke-test-evidence.md` · Result **PASS** (MVP lineage-seal path; GAP-BR-019 remains OPEN) |

---

## C-07 — Sprint Exit

| Field | Content |
|-------|---------|
| **Task ID** | C-07 |
| **Objective** | File sprint exit: PASS \| FAIL \| BLOCKED; evidence paths; MODULE_STATUS update; GAPs unchanged unless newly discovered. |
| **Owner role** | Engineering Manager Agent |
| **Dependencies** | C-06 |
| **Input artifacts** | All C-01…C-06 evidence; Sprint §9 exit template |
| **Expected output artifact** | `personal-brain/stage/bridge/C07-sprint-exit-coding-001.md` (or equivalent) |
| **Acceptance Criteria** | Exit block complete; SC-1…SC-6 addressed; non-goals restated; Founder-visible go/no-go for next slice (HA/Knowledge). |
| **Test Requirement** | Doc verification checklist. |
| **Status** | **DONE** (2026-07-25) |
| **Evidence** | `stage/bridge/C07-sprint-exit-coding-001.md` · Sprint **COMPLETE** · Exit **PASS** |

---

## Registry summary

| Metric | Value |
|--------|-------|
| Task count | **7** |
| Type | Implementation / code-first |
| Auth | **APPROVED** |
| Sprint | **COMPLETE** (C-01–C-07 DONE · Exit PASS) |

---

**End of TASK-REGISTRY-PB-BRIDGE-CODING-001**
