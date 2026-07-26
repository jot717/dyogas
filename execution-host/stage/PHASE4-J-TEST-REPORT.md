# PHASE4-J-TEST-REPORT

**Sprint:** SPRINT-EXECUTION-HOST-001  
**Trace:** TRACE-EXEC-HOST-001  
**Group:** J — Formal Verification  
**Package:** `@dyogas/execution-host@0.0.1`  
**Date:** 2026-07-23  
**Commands:** `npm test` · `npm run build`  

---

## Executive result

| Metric | Value |
|--------|-------|
| Tests run | 43 |
| Passed | **43** |
| Failed | **0** |
| Build (`tsc`) | **PASS** |
| Host-only import boundary | **PASS** (0 illegal package imports) |
| Runtime/SDK/Harness used as fix surface | **None** |

---

## Verification matrix

| Area | Evidence | Result |
|------|----------|--------|
| Pipeline loading | `tests/loader.test.ts` | PASS |
| Pipeline pinning | `loader.test.ts` (immutable pin, version mismatch) | PASS |
| Stage execution | `tests/executor.test.ts` | PASS |
| Runtime adapter | `tests/runtime-adapter.test.ts` | PASS |
| SDK adapter | `tests/sdk-adapter.test.ts` | PASS |
| Artifact lineage | `tests/lineage.test.ts` | PASS |
| Audit integration | `tests/audit.test.ts` | PASS |
| Human approval | `tests/human-gate.test.ts` | PASS |
| Apply token lifecycle | `human-gate.test.ts` (mint/consume/reuse) | PASS |
| Pause / Resume | `human-gate.test.ts` · `e2e-host.test.ts` | PASS |
| Boundary protection | `tests/boundary.test.ts` | PASS |
| Fail-closed behavior | `tests/fail-closed-matrix.test.ts` | PASS |
| Regression coverage | `scaffold.test.ts` + full suite | PASS |
| Host E2E (fakes) | `tests/e2e-host.test.ts` | PASS |
| Build | `npm run build` | PASS |

---

## Fail-closed sample (typed)

| Case | Code |
|------|------|
| Unknown pipeline | `PIPELINE_UNKNOWN` |
| Version mismatch | `PIPELINE_VERSION_MISMATCH` |
| Unsealed handoff | `RUNTIME_HANDOFF_ERROR` |
| Cross-tenant lineage | `LINEAGE_TENANCY_VIOLATION` |
| Agent approve | `HUMAN_ACTOR_REQUIRED` |
| Token reuse | `APPLY_TOKEN_REUSED` |

---

## Tasks

| ID | Status |
|----|--------|
| T-J1 | DONE |
| T-J2 | DONE |
| T-J3 | DONE |
| T-J4 | DONE |

**Group J: COMPLETE**

**End of PHASE4-J-TEST-REPORT**
