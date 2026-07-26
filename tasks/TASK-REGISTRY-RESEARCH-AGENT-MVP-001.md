# TASK REGISTRY

**Registry ID:** TASK-REGISTRY-RESEARCH-AGENT-MVP-001  
**Sprint:** [`SPRINT-RESEARCH-AGENT-MVP-001`](../sprints/SPRINT-RESEARCH-AGENT-MVP-001.md)  
**Auth:** [`DL-RESEARCH-AGENT-MVP-001`](../docs/decision-log/DL-RESEARCH-AGENT-MVP-001.md) — **APPROVED**  
**Mode:** **Implementation Mode**  
**Created:** 2026-07-26  
**Current executable task:** **NONE**  
**Implementation authorized:** **YES** (Band A complete)  
**Forbidden:** new `agents/research-agent/` tree; new MOD-*; Runtime / SDK / Execution Host redesign; contract version bump; live egress without Accepted allow-egress ADR

---

## Execution order

```text
RA-01 DONE
  ↓
RA-02 DONE
  ↓
RA-03 DONE
  ↓
RA-04 DONE
  ↓
RA-06 DONE
  ↓
RA-05 BLOCKED (allow-egress ADR)
RA-07 BLOCKED (allow-egress ADR)
  ↓
RA-08 DONE
```

---

### RA-01 — Research Agent MVP specification

| Field | Content |
|-------|---------|
| **Task ID** | RA-01 |
| **Title** | Research Agent MVP specification |
| **Band** | A |
| **Objective** | Author the MVP specification for the Research Agent under `docs/research-agent/`, tracing every MVP requirement to a clause of `contracts/agents/research-agent.md` v2.0.0. |
| **Dependencies** | None |
| **Acceptance Criteria** | Every MVP requirement cites a contract clause; no contract drift; Band B egress dependency stated. |
| **Test Requirement** | Documentation task — existing suites remain green. |
| **Evidence** | `docs/research-agent/RA-01-mvp-spec.md` |
| **Status** | **DONE** |

---

### RA-02 — Task Registry integration

| Field | Content |
|-------|---------|
| **Task ID** | RA-02 |
| **Title** | Task Registry integration |
| **Band** | A |
| **Objective** | Verify this registry parses under `dev-orch` and that each RA task resolves to a valid Execution Package. |
| **Dependencies** | RA-01 |
| **Acceptance Criteria** | `dev-orch` loads this registry; Execution Package for RA-03; scope fields intact. |
| **Test Requirement** | `npm test` and `npm run build` in `tools/dev-orch`. |
| **Evidence** | `docs/dev-orch/execution-packages/RA-03.json` |
| **Status** | **DONE** |

---

### RA-03 — Research execution flow

| Field | Content |
|-------|---------|
| **Task ID** | RA-03 |
| **Title** | Research execution flow |
| **Band** | A |
| **Objective** | Implement governed collection: pluggable collector, budget hard stops, provenance, allowlist, coverage gaps. |
| **Dependencies** | RA-02 |
| **Acceptance Criteria** | SAC-3…SAC-6; no network; research tests green. |
| **Test Requirement** | `npm test` / `npm run build` in `research`; regression personal-brain, eng-agent, dev-orch. |
| **Evidence** | `docs/eng-agent/production/RA-03-evidence.json` |
| **Status** | **DONE** |

---

### RA-04 — Evidence generation

| Field | Content |
|-------|---------|
| **Task ID** | RA-04 |
| **Title** | Evidence generation |
| **Band** | A |
| **Objective** | Runtime `CollectionRunEvidence` from `execute()` — collector id, budget, gaps, provenance. |
| **Dependencies** | RA-03 |
| **Acceptance Criteria** | SAC-7; test asserts evidence matches run. |
| **Test Requirement** | `npm test` / `npm run build` in `research`. |
| **Evidence** | `docs/eng-agent/production/RA-04-evidence.json` |
| **Status** | **DONE** |

---

### RA-05 — Knowledge ingestion bridge

| Field | Content |
|-------|---------|
| **Task ID** | RA-05 |
| **Title** | Knowledge ingestion bridge |
| **Band** | **B — BLOCKED** |
| **Objective** | Live evidence through Host Stage-1 path. |
| **Dependencies** | RA-04 |
| **Blocker** | **OOS-RE-001 / OOS-T-002** — allow-egress ADR required |
| **Acceptance Criteria** | Not claimed without Accepted ADR superseding ADR-0002. |
| **Test Requirement** | Blocked — no tests until allow-egress ADR Accepted. |
| **Evidence** | — |
| **Status** | **BLOCKED** |

---

### RA-06 — Verification tests

| Field | Content |
|-------|---------|
| **Task ID** | RA-06 |
| **Title** | Verification tests |
| **Band** | A |
| **Objective** | Independent verification without trusting agent self-report. |
| **Dependencies** | RA-04 |
| **Acceptance Criteria** | SAC-8; negative independence test PASS. |
| **Test Requirement** | `npm test` in `research` and `tools/eng-agent`. |
| **Evidence** | `docs/eng-agent/production/RA-06-evidence.json` |
| **Status** | **DONE** |

---

### RA-07 — Harness autonomous execution test

| Field | Content |
|-------|---------|
| **Task ID** | RA-07 |
| **Title** | Harness autonomous execution test |
| **Band** | **B — BLOCKED** |
| **Objective** | Autonomous live-source research run. |
| **Dependencies** | RA-05, RA-06 |
| **Blocker** | **OOS-RE-001** — egress ADR; mock must not substitute |
| **Acceptance Criteria** | Not claimed without live collection under Accepted allow-egress ADR. |
| **Test Requirement** | Blocked — no autonomous live-source E2E until allow-egress ADR Accepted. |
| **Evidence** | — |
| **Status** | **BLOCKED** |

---

### RA-08 — Sprint exit

| Field | Content |
|-------|---------|
| **Task ID** | RA-08 |
| **Title** | Sprint exit |
| **Band** | A |
| **Objective** | Governance verification; write exit document; update Sprint / Registry / Backlog / MODULE_STATUS. |
| **Dependencies** | RA-06 |
| **Acceptance Criteria** | Exit document lists completed tasks, Band B blockers, test evidence, boundary confirmation. |
| **Test Requirement** | Final regression research, personal-brain, eng-agent, dev-orch. |
| **Evidence** | `docs/research-agent/RA-08-sprint-exit.md` |
| **Status** | **DONE** |

---

## Status summary

| Task | Band | Status |
|------|------|--------|
| RA-01 | A | **DONE** |
| RA-02 | A | **DONE** |
| RA-03 | A | **DONE** |
| RA-04 | A | **DONE** |
| RA-05 | B | **BLOCKED** — allow-egress ADR |
| RA-06 | A | **DONE** |
| RA-07 | B | **BLOCKED** — allow-egress ADR |
| RA-08 | A | **DONE** |

---

**End of TASK-REGISTRY-RESEARCH-AGENT-MVP-001**
