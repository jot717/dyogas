# Architecture Review — Research Agent Stage-1 Egress Allow-Path

**Review ID:** ARCH-RESEARCH-AGENT-EGRESS-001  
**Date:** 2026-07-26  
**Subject:** ADR-0011 · DL-RESEARCH-AGENT-EGRESS-001 · Band B RA-05 / RA-07  
**Sprint:** SPRINT-RESEARCH-AGENT-MVP-001 (no new Sprint)  
**Verdict:** **APPROVE** · `adr_required` satisfied by ADR-0011 (accept concurrently)  
**Architecture impact:** **Scoped allow-path only** — no new MOD; MOD-RESEARCH remains owner

---

## Mission

Review whether accepting ADR-0011 and executing RA-05 / RA-07 stays within
architecture boundaries without Runtime / SDK / Execution Host / Product redesign.

## Checklist

| Check | Result | Notes |
|-------|--------|-------|
| No new MOD created | **PASS** | Live collectors land in existing `@dyogas/research-engine` |
| Existing MOD-RESEARCH remains owner | **PASS** | Stage-1 evidence collection ownership unchanged (ADR-0005) |
| No Runtime modification | **PASS** | Out of Band B scope |
| No SDK modification | **PASS** | Out of Band B scope |
| No Execution Host modification | **PASS** | Host already accepts `researchCollector` injection |
| No Product layer modification | **PASS** | personal-brain untouched for Band B collectors |
| ADR-0002 supersession scope limited to Research Stage-1 egress | **PASS** | ADR-0011 D1 — narrow allow-path; deny-default elsewhere |
| Fail-closed remains mandatory | **PASS** | Deny → gap / POLICY_DENY; no fabrication |
| Provenance and evidence requirements enforceable | **PASS** | Band A guards + live adapter id distinct from mock/fixture |
| Rollback R1–R6 executable | **PASS** | Revert to mock/fixture default; RA-05/07 → BLOCKED |

## Trust surface

ADR-0011 requires MOD-TRUST to evaluate the Stage-1 allow-path (purpose + source class).
That is **Trust policy completion under an Accepted ADR**, not a new module and not a
Runtime/SDK/Host redesign. Direct network from research without Trust remains **forbidden**.

## Verdict

**APPROVE** acceptance of ADR-0011 and unlock of RA-05 → RA-07 under
`SPRINT-RESEARCH-AGENT-MVP-001`, subject to:

1. ADR-0011 status → Accepted  
2. Coding Agent write scope: `research/src/**`, `research/tests/**`, `docs/research-agent/**`, `docs/eng-agent/production/**`  
3. Optional Trust egress allow-rule implementation limited to ADR-0011 predicates  
4. Rollback R1–R6 remain binding

```text
ARCHITECTURE REVIEW: APPROVE
ARCH-RESEARCH-AGENT-EGRESS-001
```

---

**End of ARCH-RESEARCH-AGENT-EGRESS-001**
