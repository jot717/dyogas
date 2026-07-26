# Development Orchestrator — Process Mode Runbook

**Doc ID:** DEV-ORCH-RUNBOOK  
**Spec:** [`SPEC-DEV-ORCH-001`](../specs/SPEC-DEV-ORCH-001.md) (`accepted`)  
**Auth:** [`DL-DEV-ORCH-001`](./decision-log/DL-DEV-ORCH-001.md) **APPROVED**  
**Sprint:** [`SPRINT-DEV-ORCH-001`](../sprints/SPRINT-DEV-ORCH-001.md)  
**Entry:** [`engineering/START_DEVELOPMENT.md`](../engineering/START_DEVELOPMENT.md)  
**Trace:** TRACE-DEV-ORCH-001  
**Date:** 2026-07-24  
**Phase:** 1 — Process Mode capability (docs/templates). **Orchestrator runtime/daemon code:** not authorized until Founder Phase 2 Decision (see T-O6).

---

## 1. Purpose

Enable the approved Development Harness loop:

```text
TASK REGISTRY
      ↓
Planner
      ↓
Execution Package
      ↓
Implementation Agent
      ↓
Verifier
      ↓
Evidence
      ↓
Task Status Update (Commit)
      ↓
Next Task
```

This is an **Engineering Process tool**, not a Platform Module, not Execution Host, and not product pipeline orchestration (ADR-0010).

**Distinct from:** SPEC-ORCH-001 (Build Order / module sequencing).

---

## 2. Preconditions (START_DEVELOPMENT)

Before any Orchestrator cycle:

| Gate | Requirement |
|------|-------------|
| Load Order | START_DEVELOPMENT §2 |
| Verification | §3 — STOP on architecture conflict |
| Mode | **Implementation Mode** only for task execution (§5.2); never mix Planning + code in one cycle (§5.4) |
| Implementation Gate | §5.3 — Task ID, Sprint, AC, Test Requirement, Spec scope |
| Approvals | Approved DL + Sprint sufficient (§5.5); extra only for new module/scope/platform boundary |

If conflict → **STOP** → Architecture Conflict Report → no implementation.

---

## 3. Planner

### 3.1 Read Task Registry

1. Open Sprint file (status Active / Planned / authorized).  
2. Open matching `TASK-REGISTRY-*.md`.  
3. Parse tasks: ID, Objective, Dependencies, AC, Expected output, Status.

### 3.2 Select next READY_FOR_EXECUTION

Order:

1. Prefer tasks marked **current executable** in registry Process line.  
2. Else first task in declared Execution Order whose:
   - Status = `READY_FOR_EXECUTION`
   - All Dependencies are `DONE` (or none)
3. Skip `DONE` / `BLOCKED` / `IN_PROGRESS` (unless resuming same task).

### 3.3 Fail closed

| Condition | Action |
|-----------|--------|
| No READY task | STOP — Sprint idle / complete |
| Dependencies unmet | Do not select; pick another or STOP |
| Mode Gate fail | STOP — Process Conflict Report |
| Task would touch Runtime/SDK/Harness/Host without authorization | STOP — Forbidden |

---

## 4. Execution Package (normative schema)

Planner **MUST** emit an Execution Package before Implementation Agent starts.

### 4.1 Required fields

| Field | Content |
|-------|---------|
| **Task ID** | e.g. `T-C1` |
| **Sprint ID** | e.g. `SPRINT-PB-HARNESS-BRIDGE-001` |
| **Objective** | From Task Registry |
| **Acceptance Criteria** | From Task Registry (verbatim) |
| **Test Requirement** | From Task Registry if present |
| **SSOT references** | Spec, ADR, DL, START_DEVELOPMENT, pipeline/contracts as cited |
| **Allowed scope** | What Implementation Agent may create/edit |
| **Forbidden scope** | Explicit do-not-touch (always include Runtime/SDK/Harness/Host unless task authorizes otherwise) |
| **Expected evidence path** | From Task Registry Expected output |
| **GAP registry** | Path to GAP register if sprint has one; instruction to register new gaps OPEN |
| **Status transition** | `READY_FOR_EXECUTION` → `IN_PROGRESS` → `DONE` \| `BLOCKED` |

### 4.2 Template location

- Schema/examples: this runbook §4  
- Prepared packages: `docs/dev-orch/execution-packages/`  
- First validation target (prepared, **not executed**): [`PREPARED-PB-BRIDGE-T-C1.md`](./dev-orch/execution-packages/PREPARED-PB-BRIDGE-T-C1.md)

---

## 5. Implementation Agent

Execute **only** Allowed scope from the Execution Package.

- Docs tasks → docs only.  
- Code tasks → only if task + Spec authorize and Gate passes.  
- Do not expand scope mid-cycle.

---

## 6. Verifier interface

Verifier runs **after** Implementation Agent claims complete, **before** status → DONE.

| Check ID | Check | Pass rule |
|----------|-------|-----------|
| V-1 | Task ID matches package | Exact |
| V-2 | Evidence artifact exists at Expected path | File present |
| V-3 | Acceptance Criteria addressed | Each AC cited PASS/FAIL in evidence or checklist |
| V-4 | Test Requirement satisfied | Doc tests or automated tests per task |
| V-5 | GAPs registered | New gaps added to sprint GAP registry as **OPEN** (not silently fixed outside scope) |
| V-6 | Forbidden scope not violated | No Runtime/SDK/Harness/Host/platform edits unless authorized |
| V-7 | Status transition valid | Only READY→IN_PROGRESS→DONE\|BLOCKED; no skip without evidence |
| V-8 | SSOT citations present | Spec/Sprint/Registry referenced |

Any V-* fail → status **BLOCKED** or return to Implementation Agent — **do not** mark DONE.

---

## 7. Evidence

- Write governed evidence under paths named in Task Registry.  
- Evidence must include Task ID, Sprint, AC table, scope boundary.  
- Link evidence in Task Registry when Commit runs.

---

## 8. Registry update mechanism (Commit)

1. Set task **Status** to `DONE` (or `BLOCKED` with reason).  
2. Add **Evidence** field paths.  
3. Update registry **Process** / current executable pointer to next READY task.  
4. Do **not** close GAPs without evidence.  
5. Do **not** invent new tasks outside Sprint authorization.

Commit of **git** is operator/Founder policy — Orchestrator Process Mode records registry/evidence first; git commit follows engineering commit convention when requested.

---

## 9. Next Task

Return to Planner (§3). Repeat until no READY tasks or Sprint exit.

---

## 10. Forbidden (always)

| Forbidden | Response |
|-----------|----------|
| Unilateral architecture / ADR decisions | STOP; escalate |
| Bypass Founder approval when required | STOP |
| Modify Runtime / SDK / Harness Spec / Execution Host | STOP |
| Create Platform Modules | STOP |
| Unapproved contract/schema edits | STOP |
| Mix Planning + product/platform code in one cycle | STOP |
| Substitute for Execution Host / product pipelines | STOP |

---

## 11. Phase 1 vs Phase 2

| Phase | Capability | Authorization |
|-------|------------|---------------|
| **Phase 1 (this Sprint)** | Discoverable Spec, runbook, package schema, verifier checklist, prepared packages, pointers | DL-DEV-ORCH-001 + SPRINT-DEV-ORCH-001 |
| **Phase 2** | Runnable Orchestrator tool/daemon automating registry parse & updates | **Requires new Founder Decision** (T-O6 gate) |

---

## 12. Checklist vs SPEC §5–§7

| Spec section | Runbook coverage |
|--------------|------------------|
| §5 Internal loop | §§3–9 |
| §6 Allowed ops | §§2–9 |
| §7 Forbidden | §10 |

---

**End of DEV-ORCH-RUNBOOK**
