# P2-07 Evidence — Evidence collector + Registry writer

**Task:** P2-07  
**Sprint:** SPRINT-DEV-ORCH-002  
**Date:** 2026-07-25  
**Auth:** DL-DEV-ORCH-002  
**Status:** **PASS**

---

## Acceptance Criteria

| AC | Result | Evidence |
|----|--------|----------|
| Collect valid evidence | **PASS** | EvidenceRecord fields populated |
| Reject missing verifier | **PASS** | collect fails closed |
| Reject fake evidence | **PASS** | path mismatch / non-existent |
| READY → IN_PROGRESS | **PASS** | writer test |
| IN_PROGRESS → DONE with PASS | **PASS** | evidence linked; pointer advance |
| IN_PROGRESS → BLOCKED | **PASS** | writer test |
| Reject DONE without PASS | **PASS** | no evidence / BLOCKED verifier |
| Reject illegal transition | **PASS** | READY → DONE rejected |
| Idempotent update | **PASS** | second IN_PROGRESS unchanged |
| Write allowlist | **PASS** | tasks/ + docs/dev-orch/; GAP registry refused |

## Rules enforced

- No task invention  
- No GAP registry closure  
- No DONE without verifier PASS  
- Status-only mutations (definition fields untouched)  
- dryRun flag reserved for CLI (P2-08)

## Tests executed

```text
npm test
tests 53 · pass 53 · fail 0
(evidence/writer: 12 new)

npm run build — OK
```

## Files

| Path | Role |
|------|------|
| `tools/dev-orch/src/evidence/types.ts` | EvidenceRecord types |
| `tools/dev-orch/src/evidence/collector.ts` | `collectEvidence` |
| `tools/dev-orch/src/writer/types.ts` | Writer request/result + allowlist |
| `tools/dev-orch/src/writer/update.ts` | `applyRegistryUpdate` |
| `tools/dev-orch/tests/evidence-writer.test.ts` | Tests |

## Out of scope (not implemented)

CLI · CI

## GAPs

None registered.

---

**End of P2-07 evidence**
