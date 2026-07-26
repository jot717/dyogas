# TASK REGISTRY

**Registry ID:** TASK-REGISTRY-HARNESS-FIRST-PRODUCTION-TASK-001  
**Sprint:** [`SPRINT-HARNESS-FIRST-PRODUCTION-TASK-001`](../sprints/SPRINT-HARNESS-FIRST-PRODUCTION-TASK-001.md)  
**Auth:** [`DL-HARNESS-FIRST-PRODUCTION-TASK-001`](../docs/decision-log/DL-HARNESS-FIRST-PRODUCTION-TASK-001.md) **APPROVED** (Founder READY_FOR_EXECUTION directive 2026-07-26)  
**Mode:** **Implementation Mode**  
**Created:** 2026-07-26  
**Selected gap:** `GAP-BR-012`  
**Current executable task:** **NONE**  
**Implementation authorized:** **YES**  
**Forbidden:** Runtime / SDK / Execution Host rewrite; new MOD-*; Hosted MOD-ENG-AGENTS

---

## Execution order

```text
HFP-01 DONE
```

---

### HFP-01 — Enforce fail-closed ambient Kernel tenancy in createBridgeRun

| Field | Content |
|-------|---------|
| **Task ID** | HFP-01 |
| **Title** | Enforce fail-closed ambient Kernel tenancy in createBridgeRun |
| **Objective** | Resolve the product obligation of GAP-BR-012: before ExecutionHost.createRun, assert ambient Kernel tenancy via requireTenant(); fail closed when unbound or ambient tenant ≠ request tenant_id; preserve matching happy path; extend C-02 tests; produce Harness evidence. |
| **Dependencies** | None |
| **Acceptance Criteria** | Unbound ambient refuses before Host call; ambient ≠ request tenant refuses before Host call; matching tenant preserves happy path; identity↔bootstrap check remains; personal-brain npm test/build pass; eng-agent and dev-orch suites remain green; no Runtime/SDK/Host edits. |
| **Test Requirement** | `npx tsx --test tests/bridge-create-run.test.ts` and `npm test` / `npm run build` in `personal-brain`; `npm test` / `npm run build` in `tools/eng-agent` and `tools/dev-orch`; all exit 0. |
| **Status** | **DONE** |
| **Evidence** | `docs/eng-agent/production/HFP-01-evidence.json`; `docs/eng-agent/HARNESS-FIRST-PRODUCTION-TASK-001.md`; `docs/dev-orch/execution-packages/HFP-01.json` |

---

**End of TASK-REGISTRY-HARNESS-FIRST-PRODUCTION-TASK-001**
