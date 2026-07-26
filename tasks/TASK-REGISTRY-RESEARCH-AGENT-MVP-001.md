# TASK REGISTRY

**Registry ID:** TASK-REGISTRY-RESEARCH-AGENT-MVP-001  
**Sprint:** [`SPRINT-RESEARCH-AGENT-MVP-001`](../sprints/SPRINT-RESEARCH-AGENT-MVP-001.md)  
**Auth:** [`DL-RESEARCH-AGENT-MVP-001`](../docs/decision-log/DL-RESEARCH-AGENT-MVP-001.md) **APPROVED** · [`DL-RESEARCH-AGENT-EGRESS-001`](../docs/decision-log/DL-RESEARCH-AGENT-EGRESS-001.md) **APPROVED** · [`ADR-0011`](../docs/adr/0011-research-agent-stage1-egress-allow-path.md) **Accepted**  
**Mode:** **Implementation Mode**  
**Created:** 2026-07-26  
**Current executable task:** **NONE**  
**Implementation authorized:** **YES** (Band A + Band B complete)  
**Forbidden:** new `agents/research-agent/` tree; new MOD-*; Runtime / SDK / Execution Host redesign

---

## Execution order

```text
RA-01 … RA-04, RA-06, RA-08 DONE (Band A)
RA-05 DONE (Band B)
RA-07 DONE (Band B)
```

---

### RA-01 — Research Agent MVP specification

| Field | Content |
|-------|---------|
| **Task ID** | RA-01 |
| **Dependencies** | None |
| **Acceptance Criteria** | Spec traces to contract; Band B egress named. |
| **Test Requirement** | Docs / suites green. |
| **Evidence** | `docs/research-agent/RA-01-mvp-spec.md` |
| **Status** | **DONE** |

---

### RA-02 — Task Registry integration

| Field | Content |
|-------|---------|
| **Task ID** | RA-02 |
| **Dependencies** | RA-01 |
| **Acceptance Criteria** | Registry parses; packages emit. |
| **Test Requirement** | `tools/dev-orch` npm test/build. |
| **Evidence** | `docs/dev-orch/execution-packages/RA-03.json` |
| **Status** | **DONE** |

---

### RA-03 — Research execution flow

| Field | Content |
|-------|---------|
| **Task ID** | RA-03 |
| **Dependencies** | RA-02 |
| **Acceptance Criteria** | SAC-3…SAC-6. |
| **Test Requirement** | `research` npm test/build. |
| **Evidence** | `docs/eng-agent/production/RA-03-evidence.json` |
| **Status** | **DONE** |

---

### RA-04 — Evidence generation

| Field | Content |
|-------|---------|
| **Task ID** | RA-04 |
| **Dependencies** | RA-03 |
| **Acceptance Criteria** | SAC-7 runtime evidence. |
| **Test Requirement** | `research` npm test/build. |
| **Evidence** | `docs/eng-agent/production/RA-04-evidence.json` |
| **Status** | **DONE** |

---

### RA-05 — Knowledge ingestion bridge / live collectors

| Field | Content |
|-------|---------|
| **Task ID** | RA-05 |
| **Title** | Live Stage-1 source collection (web/github/reddit) |
| **Band** | B |
| **Objective** | Implement Trust-gated live collectors with provenance, timestamps, trust metadata. |
| **Dependencies** | RA-04 · ADR-0011 Accepted |
| **Acceptance Criteria** | Live adapter ≠ mock; Trust egress before fetch; https provenance; fail-closed; no Runtime/SDK/Host redesign. |
| **Test Requirement** | `trust` + `research` + `personal-brain` npm test/build. |
| **Evidence** | `docs/eng-agent/production/RA-05-evidence.json` |
| **Status** | **DONE** |

---

### RA-06 — Verification tests

| Field | Content |
|-------|---------|
| **Task ID** | RA-06 |
| **Dependencies** | RA-04 |
| **Acceptance Criteria** | SAC-8. |
| **Test Requirement** | `research` + `eng-agent` npm test. |
| **Evidence** | `docs/eng-agent/production/RA-06-evidence.json` |
| **Status** | **DONE** |

---

### RA-07 — Harness autonomous execution test

| Field | Content |
|-------|---------|
| **Task ID** | RA-07 |
| **Title** | Live-source autonomous E2E |
| **Band** | B |
| **Objective** | External source → collector → execute → evidence → independent verify PASS; no mock substitute. |
| **Dependencies** | RA-05, RA-06 |
| **Acceptance Criteria** | No mock fallback; evidence; provenance; independent verifier; fail-closed; live HTTPS smoke. |
| **Test Requirement** | research, personal-brain, eng-agent, dev-orch npm test/build. |
| **Evidence** | `docs/eng-agent/production/RA-07-evidence.json` |
| **Status** | **DONE** |

---

### RA-08 — Sprint exit

| Field | Content |
|-------|---------|
| **Task ID** | RA-08 |
| **Dependencies** | RA-06 |
| **Acceptance Criteria** | Exit document; Band B status truthful. |
| **Test Requirement** | Final regression. |
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
| RA-05 | B | **DONE** |
| RA-06 | A | **DONE** |
| RA-07 | B | **DONE** |
| RA-08 | A | **DONE** |

---

**End of TASK-REGISTRY-RESEARCH-AGENT-MVP-001**
