# Decision

**ID:** DL-DECISION-INTELLIGENCE-ALPHA-REAL-USER-001  
**Date:** 2026-07-26  
**Owner:** Founder (business authority)  
**Mode:** Development Harness — Implementation Mode  
**Status:** **APPROVED**  
**Decision:** **APPROVED** (real-user Decision Intelligence loop preparation)  
**Implementation authorization:** **YES**  
**Approved:** 2026-07-26  
**Trace:** `TRACE-DECISION-INTELLIGENCE-ALPHA-REAL-USER-001`  
**Sprint:** [`SPRINT-DECISION-INTELLIGENCE-ALPHA-REAL-USER-001`](../../sprints/SPRINT-DECISION-INTELLIGENCE-ALPHA-REAL-USER-001.md)

---

## Subject

Replace fixture-only validation with **real-user workflow preparation**:

- DecisionRequestInput schema v0.2 (`user_id`, `tenant_id`, `question`, `constraints`, `desired_outcome`)
- Stable product façade APIs
- User-scoped Decision Memory: `decision-memory/{tenant_id}/{user_id}/`
- DecisionOutcome v0.1 schema only (no learning)
- Golden Path **USER-REQUEST-REAL-001**

Preserve existing Host → Research → Decision Asset → Approval → Model → DNA path. No new Agent/MOD/UI.

## Decisions

| ID | Decision |
|----|----------|
| **D-1** | Schema `schemas/artifacts/decision-request-input.schema.json` v0.2. |
| **D-2** | Stable APIs: `createDecisionRequest`, `getDecisionInbox`, `getDecisionAnalysis`, `approveDecision`, `rejectDecision`. |
| **D-3** | File-backed memory gains user namespace; Research remains existing Host Stage-1 path. |
| **D-4** | `DecisionOutcome` schema only — no learning algorithm. |

## Rollback

Revert real-user API/schemas/runner; leave Product Alpha + DI foundation unchanged.

---

**End of DL-DECISION-INTELLIGENCE-ALPHA-REAL-USER-001**
