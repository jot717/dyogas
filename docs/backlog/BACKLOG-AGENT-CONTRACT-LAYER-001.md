# Backlog Item

**ID:** BACKLOG-AGENT-CONTRACT-LAYER-001  
**Type:** `docs`  
**Module:** `MOD-CPAS` (existing — **no new Platform Module**)  
**Trace:** `TRACE-AGT-LAYER-001`  
**Status:** `done` — SPRINT-AGT-000 docs hygiene COMPLETE; code DoR still FAIL (not authorized)  
**Priority rank:** 1 (within Agent Contract Layer capability; does not auto-preempt Personal Brain Bridge — Founder may reorder)  
**Estimate band:** `S`  
**Date:** 2026-07-24  

---

## 1. Intent

Deliver accepted Agent Contract Layer Spec and complete Sprint documentation/registry hygiene so Execution Host bind path is unambiguous — **without** implementation of Runtime/SDK/Harness/Host/Product code.

---

## 2. Links

| Field | Link |
|-------|------|
| Decision Log | [`DL-AGENT-CONTRACT-LAYER-001`](../decision-log/DL-AGENT-CONTRACT-LAYER-001.md) **APPROVED** |
| Spec | [`SPEC-AGT-000`](../../specs/SPEC-AGT-000.md) **`accepted`** |
| Architecture Review | [`AR-SPEC-AGT-000`](../architecture-reviews/AR-SPEC-AGT-000.md) — `no_arch_impact` |
| Sprint | [`SPRINT-AGT-000`](../../sprints/SPRINT-AGT-000.md) |
| Task Registry | [`TASK-REGISTRY-AGT-000`](../../tasks/TASK-REGISTRY-AGT-000.md) |
| Per-agent SoR | `SPEC-AGT-001`…`010`, [`contracts/README.md`](../../contracts/README.md) |

---

## 3. Priority rationale

Founder APPROVED Agent Contract Layer capability. Spec accepted. Next accountable unit is docs/registry Sprint — **not** coding — to close MASTER/contracts index pointers and evidence pack.

---

## 4. DoR (attestation started)

| DoR item | Status |
|----------|--------|
| Pain/problem clear | Yes — SPEC-AGT-000 |
| Goals/non-goals/metrics | Yes |
| Spec link approved | Yes — `accepted` |
| Architecture Review | Yes — `no_arch_impact` |
| Dependencies identified | Yes — Host/Runtime/SDK/Harness consume-only |
| Estimate band | `S` |
| Test approach | Doc checklist + registry presence tests (no runtime code) |
| Owner/skill | Process Mode Engineering Agents |
| No Constitution/Harness contradiction | Yes |
| Human Approval implications | Unchanged — contracts still forbid self-approval |

**DoR for Implementation coding:** **FAIL** (intentionally) — Implementation not authorized.  
**DoR for docs Sprint commitment:** **PASS**.

---

## 5. Success metrics

| Metric | Target |
|--------|--------|
| SPEC-AGT-000 `accepted` | Done |
| MASTER §7 registry row | Sprint task |
| contracts/README points to SPEC-AGT-000 | Sprint task |
| Zero platform code changes | Sprint exit |

---

## 6. Non-goals

Implementation; new agents; new modules; Host/Runtime/SDK/Harness rewrites.

---

**End of BACKLOG-AGENT-CONTRACT-LAYER-001**
