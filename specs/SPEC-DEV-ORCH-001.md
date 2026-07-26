# SPEC-DEV-ORCH-001 — Development Orchestrator Agent

**Spec ID:** SPEC-DEV-ORCH-001  
**Title:** Development Orchestrator Agent  
**Status:** `accepted`  
**Module / Layer:** `/engineering` Process Mode capability — **not** a Platform Module (`MOD-*`)  
**Trace ID:** TRACE-DEV-ORCH-001  
**Requester:** Founder  
**Spec Author:** Development Harness Agent  
**Authorization:** [`DL-DEV-ORCH-001`](../docs/decision-log/DL-DEV-ORCH-001.md) **APPROVED**  
**Architecture Review:** [`AR-SPEC-DEV-ORCH-001`](../docs/architecture-reviews/AR-SPEC-DEV-ORCH-001.md) — `no_arch_impact`  
**Related:** [`engineering/START_DEVELOPMENT.md`](../engineering/START_DEVELOPMENT.md) · [`engineering/README.md`](../engineering/README.md) · SPEC-ORCH-001 (Build Orchestrator — distinct)  
**Non-modification:** Does **not** authorize Runtime, SDK, Harness law, Execution Host, unapproved contract, or schema changes.

---

## Pain Statement

| Field | Content |
|-------|---------|
| **Who** | Operators executing Development Harness Implementation Mode |
| **How it hurts** | Manual READY-task selection, verification, and status/evidence updates are slow and inconsistent |
| **Frequency** | Every approved Sprint with executable tasks |
| **Current workaround** | Manual “Read START_DEVELOPMENT → Continue” sessions |
| **Evidence** | START_DEVELOPMENT §5 Mode Selection; repeated sprint operations |

---

## 1. Purpose

Define the **Development Orchestrator Agent**: a Process Mode engineering capability that automates **approved** Development Harness workflow execution — reading SSOT, selecting READY tasks, invoking implementation/verification workflows within task scope, recording evidence, advancing task status, and sequencing to the next task — **without** bypassing Founder/Engineering Agent approvals or modifying platform execution layers.

---

## 2. Goals

1. Encode Orchestrator allowed/denied operations.  
2. Bind Orchestrator to START_DEVELOPMENT Load Order, Verification, Mode Selection, and Implementation Gate.  
3. Define the internal loop: Task Registry → Planner → Implementation Agent → Verifier → Evidence → Commit → Next Task.  
4. Keep Orchestrator outside Execution Host / product pipeline path.  
5. Distinguish from SPEC-ORCH-001 (Build Order module sequencing).

## 3. Non-Goals

| Non-goal | Reason |
|----------|--------|
| New Platform Module | Mission |
| Hosted `MOD-ENG-AGENTS` in this Spec | Optional B17 — separate |
| Autonomous ADR / architecture decisions | Art. VIII |
| Founder substitution | engineering §2a |
| Runtime/SDK/Harness/Host edits | Mission |
| Unapproved contract/schema edits | Change control |
| Product pipeline orchestration | ADR-0010 / Execution Host |

---

## 4. Architecture Position

```text
Founder / Engineering Agents (approvals)
        ↓
Development Orchestrator Agent  ← THIS SPEC (Process Mode)
        ↓
TASK REGISTRY
        ↓
Planner
        ↓
Implementation Agent
        ↓
Verifier
        ↓
Evidence
        ↓
Commit (task status / evidence pointers)
        ↓
Next Task
```

**Not** on the path: Experience Product → ExecutionHost.createRun() → Runtime → SDK → Agents.

---

## 5. Internal loop (normative)

| Stage | Responsibility |
|-------|----------------|
| **Planner** | Read Sprint + Task Registry; select next `READY_FOR_EXECUTION` task by dependency order; enforce Mode + Implementation Gate |
| **Implementation Agent** | Execute only task-scoped work (docs or code as task type allows) |
| **Verifier** | Check Task ID, AC, tests/evidence requirements |
| **Evidence** | Write governed evidence paths |
| **Commit** | Advance status `IN_PROGRESS` → `DONE` \| `BLOCKED`; record evidence links |
| **Next Task** | Return to Planner |

Roles above are **Process Mode responsibilities**, not new Platform Modules or `/contracts` product agents.

---

## 6. Allowed operations

| Operation | Constraint |
|-----------|------------|
| Read ACTIVE SSOT | Load Order (START_DEVELOPMENT §2) |
| Inspect approved Sprint | Active / authorized |
| Inspect Task Registry | Matching Sprint |
| Select `READY_FOR_EXECUTION` tasks | Dependency order |
| Invoke implementation workflow | Implementation Mode + Gate (§5.2–§5.3) |
| Invoke verification workflow | Per task AC / tests |
| Collect evidence | Sprint/module stage paths |
| Advance task lifecycle | Registry vocabulary |
| Sequence to next READY task | After Commit |

## 7. Forbidden operations

| Forbidden | Response |
|-----------|----------|
| Create architecture decisions unilaterally | STOP; escalate |
| Bypass Founder approval | STOP |
| Modify Runtime / SDK / Harness specification / Execution Host | STOP |
| Create Platform Modules | STOP |
| Modify contracts without approval | STOP |
| Mix Planning + code in one cycle | STOP (§5.4) |
| Drive product pipelines as Execution Host substitute | STOP |

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Spec `accepted` + Arch Review recorded | Yes |
| Zero platform boundary violations | 0 |
| Tasks advanced only with evidence | 100% |

## 9. Acceptance Criteria

| # | Criterion |
|---|-----------|
| AC-1 | Process Mode / not a `MOD-*` |
| AC-2 | Allowed/forbidden lists match mission |
| AC-3 | Bound to START_DEVELOPMENT Mode + Implementation Gate |
| AC-4 | Internal loop documented (Planner → … → Next Task) |
| AC-5 | Distinct from SPEC-ORCH-001 |
| AC-6 | No Runtime/SDK/Harness/Host/unapproved schema authorization |
| AC-7 | Phase 1 Sprint is docs/process preparation; Orchestrator **runtime code** not claimed done by Spec acceptance |

---

## 10. Interface Impact

| Surface | Impact |
|---------|--------|
| `/engineering`, START_DEVELOPMENT | Consume; optional pointer in later docs task |
| Sprint / Task Registry | Read/update when authorized |
| Platform modules | **None** |
| `/contracts`, `/schemas` | No unapproved edits |

**Architecture impact:** `no_arch_impact` · ADR **not required**

---

## 11. Status / Next

| State | Action |
|-------|--------|
| Now | Spec **`accepted`**. Phase 1 Sprint `SPRINT-DEV-ORCH-001` prepared. |
| Next | Execute docs/process tasks in Task Registry — **no platform code** until a task explicitly authorizes and Gate passes. |

---

**End of SPEC-DEV-ORCH-001**
