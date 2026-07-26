# Formal Test Report — Phase 4 Group J

**Sprint:** SPRINT-EXECUTION-HOST-001  
**Trace:** TRACE-EXEC-HOST-001  
**Package:** `@dyogas/execution-host@0.0.1`  
**Date:** 2026-07-23  
**Command:** `npm test` · `npm run build`

## Summary

| Metric | Result |
|--------|--------|
| Tests | **43** |
| Pass | **43** |
| Fail | **0** |
| Build (`tsc`) | **PASS** |
| Runtime/SDK/Harness patches used as fix | **None** |

## Coverage matrix (T-J1…J3)

| Area | Test files | Result |
|------|------------|--------|
| Pipeline loading | `loader.test.ts` | PASS |
| Stage execution | `executor.test.ts` | PASS |
| Runtime adapter | `runtime-adapter.test.ts` | PASS |
| SDK adapter | `sdk-adapter.test.ts` | PASS |
| Artifact lineage | `lineage.test.ts` | PASS |
| Audit integration | `audit.test.ts` | PASS |
| Human approval | `human-gate.test.ts` | PASS |
| Apply token lifecycle | `human-gate.test.ts` | PASS |
| Boundary protection | `boundary.test.ts` | PASS |
| Fail-closed behavior | `fail-closed-matrix.test.ts` | PASS |
| Regression / scaffold | `scaffold.test.ts` | PASS |
| Host E2E (fakes) | `e2e-host.test.ts` | PASS |

## Fail-closed proofs (T-J2)

| Case | Expected code / behavior | Status |
|------|--------------------------|--------|
| Unknown pipeline | `PIPELINE_UNKNOWN` | PASS |
| Version mismatch | `PIPELINE_VERSION_MISMATCH` | PASS |
| Unsealed handoff | `RUNTIME_HANDOFF_ERROR` | PASS |
| Cross-tenant lineage | `LINEAGE_TENANCY_VIOLATION` | PASS |
| Agent auto-approve | `HUMAN_ACTOR_REQUIRED` | PASS |
| Token reuse | `APPLY_TOKEN_REUSED` | PASS |
| Apply without approval | `APPLY_TOKEN_REQUIRED` / lineage block | PASS |
| Illegal Runtime transition | `RUNTIME_ILLEGAL_TRANSITION` | PASS |

## E2E happy path (T-J3)

`Brief → stages → waiting_human → approved → Knowledge authorize → GraphUpdate` — **PASS** (no cloud/LLM, no Personal Brain UI).

## Debug (T-J4)

No open failures. See `DEBUG-PHASE4.md`.

**End of TEST_REPORT**
