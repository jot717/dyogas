# Backlog Item

**ID:** BACKLOG-HOST-RESEARCH-INTEGRATION-001  
**Type:** `feature`  
**Layer:** MOD-EXECUTION-HOST / Execution Platform  
**Trace:** TRACE-EXEC-HOST-001 · GAP-EH-003 · GAP-BR-019  
**Status:** `done` — Sprint **COMPLETE** · Exit **PASS** (2026-07-25)  
**Priority rank:** **P0** (resolved)  
**Estimate band:** `M`  
**Date:** 2026-07-25  
**Completed:** 2026-07-25  
**Auth:** [`DL-HOST-RESEARCH-INTEGRATION-001`](../decision-log/DL-HOST-RESEARCH-INTEGRATION-001.md) **APPROVED**  

---

## Intent

Replace Host Stage-1 synthetic lineage sealing with existing Research Engine execution and a schema-valid, sealed ResearchReport.

```text
ExecutionHost.createRun
  → Host Stage 1
  → existing Research Engine
  → existing ResearchReport schema
  → Runtime seal/handoff
  → HostRun lineage
```

---

## Links

| Field | Reference |
|-------|-----------|
| Host Spec | [`SPEC-EXECUTION-HOST-001`](../../specs/SPEC-EXECUTION-HOST-001.md) |
| Architecture | [`ADR-0010`](../adr/0010-pipeline-execution-host.md) |
| Existing platform gap | `execution-host/stage/A4-gap-register.md` — GAP-EH-003 |
| Bridge-discovered gap | `personal-brain/stage/bridge/GAP-REGISTRY-PB-HARNESS-BRIDGE-001.md` — GAP-BR-019 **P0** |
| Sprint | [`SPRINT-HOST-RESEARCH-INTEGRATION-001`](../../sprints/SPRINT-HOST-RESEARCH-INTEGRATION-001.md) |
| Task Registry | [`TASK-REGISTRY-HOST-RESEARCH-INTEGRATION-001`](../../tasks/TASK-REGISTRY-HOST-RESEARCH-INTEGRATION-001.md) |

---

## Definition of Ready

| Item | Status |
|------|--------|
| Existing Host Spec covers stage execute/bind/seal | Yes |
| ADR-0010 Host boundary accepted | Yes |
| Existing Research Engine | Yes |
| Existing Research Agent contract | Yes |
| Existing ResearchReport schema | Yes |
| Implementation gap evidenced in code | Yes |
| Architecture redesign required | No |
| Founder sprint approval | **Pending** |
| Test approach | Host integration + schema + fail-closed matrix |

---

## Success metrics

| Metric | Target |
|--------|--------|
| Host Stage 1 invokes existing engine | 1 evidenced execution path |
| Schema-valid ResearchReport | 100% successful outputs |
| Synthetic Stage-1 output id | Removed from successful Research path |
| Seal/lineage failures | Fail closed |
| Personal Brain changes | 0 |
| Runtime/SDK/Harness/contract/schema/pipeline edits | 0 |

---

**End of BACKLOG-HOST-RESEARCH-INTEGRATION-001**
