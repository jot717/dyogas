# Development Orchestrator — Phase 2 Implementation Plan

**Doc ID:** PHASE2-IMPLEMENTATION-PLAN  
**Date:** 2026-07-25  
**Auth:** [`DL-DEV-ORCH-002`](../decision-log/DL-DEV-ORCH-002.md) **APPROVED**  
**Sprint:** [`SPRINT-DEV-ORCH-002`](../../sprints/SPRINT-DEV-ORCH-002.md)  
**Tasks:** [`TASK-REGISTRY-DEV-ORCH-002`](../../tasks/TASK-REGISTRY-DEV-ORCH-002.md)  
**Spec:** [`SPEC-DEV-ORCH-001`](../../specs/SPEC-DEV-ORCH-001.md)  
**Runbook:** [`DEV-ORCH-RUNBOOK`](../DEV-ORCH-RUNBOOK.md)  
**Trace:** TRACE-DEV-ORCH-001  

**Status:** Planning complete — **code not started** (await Implementation Mode execution of P2-01+)

---

## 1. Purpose

Define how Phase 2 implements executable Development Orchestrator tooling at `tools/dev-orch/` without redesigning architecture or touching the Execution Harness.

```text
Development Harness builds DYOGAS.   ← this plan
Execution Harness runs DYOGAS.       ← out of scope
```

---

## 2. Package layout (target)

```text
tools/dev-orch/
  package.json          # Node 22; private; no @dyogas/runtime|agent-sdk|execution-host
  README.md
  src/
    index.ts            # public API
    cli.ts              # dry-run default; --apply for writes
    parse/registry.ts   # Task Registry markdown → model
    plan/select.ts      # READY + deps + fail-closed
    package/emit.ts     # Execution Package §4.1
    gate/validate.ts    # START_DEVELOPMENT §5.2–§5.5
    verify/engine.ts    # V-1…V-8
    evidence/collect.ts
    registry/write.ts   # status transitions + Process pointer
    types.ts
  tests/
    parser.test.ts
    planner.test.ts
    package.test.ts
    gate.test.ts
    verifier.test.ts
    writer.test.ts
    cli-dry-run.test.ts
    boundary.test.ts
    fixtures/           # copies/snippets of real registries
```

Evidence markdown packages remain under `docs/dev-orch/execution-packages/` (not executable home).

---

## 3. Module responsibilities

| Module | Responsibility | Runbook / Spec |
|--------|----------------|----------------|
| **parse** | Read Sprint + Task Registry markdown; extract tasks + Process pointer | §3.1 |
| **plan** | Select next READY; STOP on §3.3 conditions | §3.2–§3.3 |
| **package** | Emit Execution Package with all §4.1 fields | §4 |
| **gate** | Mode, Implementation Gate, no-mix, approval interpretation | START_DEVELOPMENT §5; Spec §6–§7 |
| **verify** | V-1…V-8 after implementation claim | §6 |
| **evidence** | Ensure expected evidence paths / checklist shape | §7 |
| **registry write** | READY→IN_PROGRESS→DONE\|BLOCKED; evidence links; Process advance | §8 |
| **cli** | Compose loop; **dry-run default** | DL-002 |

Implementation Agent remains a **human/operator or separate engineering session** — the tool does **not** execute product agents or LLM product work.

---

## 4. Dependency & boundary rules

| Rule | Enforcement |
|------|-------------|
| No platform package imports | `boundary.test` + package.json review |
| No `MOD-DEV-ORCH` | MASTER stays MOD-ENGINEERING; no new MOD row |
| Write allowlist | `tasks/TASK-REGISTRY-*.md`, `docs/dev-orch/**`, Execution Package–named stage evidence only |
| Forbidden write roots | `runtime/`, `sdk/`, `execution-host/`, `harness/` (law), product `*/src/` |
| Not B17 | No Agent SDK; not Hosted Engineering Agents |

---

## 5. Acceptance Criteria (Sprint)

| ID | Criterion |
|----|-----------|
| SAC-1 | `tools/dev-orch/` present; no `MOD-DEV-ORCH` |
| SAC-2 | Parser works on real Task Registry markdown |
| SAC-3 | Planner READY selection + fail-closed |
| SAC-4 | Execution Package includes all §4.1 fields |
| SAC-5 | Gate validator enforces Mode + Implementation Gate + no-mix |
| SAC-6 | Verifier V-1…V-8; fail ≠ DONE |
| SAC-7 | Registry writer legal transitions; dry-run default |
| SAC-8 | CI `dev-orch` job + boundary tests |
| SAC-9 | Build-vs-run architecture rule preserved |

---

## 6. Test Plan

| ID | Area | Cases |
|----|------|-------|
| TP-1 | Parser | `TASK-REGISTRY-DEV-ORCH-001`, `TASK-REGISTRY-DEV-ORCH-002` (self), one product/bridge registry fixture |
| TP-2 | Planner | Process pointer preference; dependency order; skip DONE/BLOCKED |
| TP-3 | Fail-closed | No READY; unmet deps; gate fail → STOP |
| TP-4 | Package | Missing any §4.1 field → error |
| TP-5 | Golden | Field parity vs `PREPARED-PB-BRIDGE-T-C1.md` |
| TP-6 | Gates | Missing Task ID/AC; Planning+code mix rejected |
| TP-7 | Verifier | Pass + fail fixture per V-1…V-8 |
| TP-8 | Writer | Illegal transition rejected; GAP close refused; invent-task refused |
| TP-9 | Dry-run | Default CLI: filesystem unchanged |
| TP-10 | Boundary | Forbidden import fails test |
| TP-11 | CI | Job runs `npm ci` / `npm test` / `npm run build` |

---

## 7. Implementation sequence

```text
P2-01 scaffold
  → P2-02 parser
  → P2-03 planner
  → P2-04 package emitter
  → P2-05 gate (may start after P2-01)
  → P2-06 verifier
  → P2-07 evidence + writer
  → P2-08 CLI
  → P2-09 CI + boundary
  → P2-10 exit
```

**Do not** start P2-01 until Sprint is active under Implementation Mode and Implementation Gate fields are cited in the Execution Package for that task.

---

## 8. CI plan

Per DL-DEV-ORCH-002:

- Job name: `dev-orch`
- Paths: `tools/dev-orch/**`, `.github/workflows/ci.yml`
- Steps: Node 22 → `npm ci` → `npm test` → `npm run build`
- Must not invoke Execution Host or product pipelines

---

## 9. Out of scope (restate)

Runtime · SDK · Execution Host · Product modules · Product agents · Research Agent · Knowledge Graph · `MOD-DEV-ORCH` · Execution Harness substitution · MOD-ENG-AGENTS/B17

---

## 10. Exit artifacts

| Artifact | Path (planned) |
|----------|----------------|
| Sprint exit | `docs/architecture-reviews/SPRINT-DEV-ORCH-002-EXIT.md` |
| AR addendum (if needed) | `docs/architecture-reviews/AR-SPEC-DEV-ORCH-001-PHASE2-ADDENDUM.md` |
| Test evidence | Linked from exit + Task Registry Evidence fields |

---

**End of PHASE2-IMPLEMENTATION-PLAN**
