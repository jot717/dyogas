# Decision

**ID:** DL-PERSONAL-BRAIN-WEB-MVP-001  
**Date:** 2026-07-27  
**Owner:** Founder (business authority)  
**Mode:** Development Harness — Implementation Mode  
**Status:** **APPROVED**  
**Decision:** **APPROVED** (browser product MVP on existing web-ui + Decision Intelligence APIs)  
**Implementation authorization:** **YES**  
**Approved:** 2026-07-27  
**Trace:** `TRACE-PERSONAL-BRAIN-WEB-MVP-001`  
**Sprint:** [`SPRINT-PERSONAL-BRAIN-WEB-MVP-001`](../../sprints/SPRINT-PERSONAL-BRAIN-WEB-MVP-001.md)

---

## Subject

Convert Decision Intelligence backend into a **usable browser product MVP** via existing `web-ui`:

- Screens: Home, Create, Progress, Approval, Result, Memory  
- HTTP: `/decision/*` façade over personal-brain decision APIs  
- Minimal session: `user_id` + `tenant_id` (no production auth)

No new Agent/MOD. No backend redesign. No second memory system.

## Decisions

| ID | Decision |
|----|----------|
| **D-1** | Product surface lives in `web-ui` (HTTP + static SPA). |
| **D-2** | Calls existing `createDecisionRequest` / inbox / approve / reject / history. |
| **D-3** | File-backed Decision Memory under web-ui data dir (same registry). |
| **D-4** | Golden validation: USER-WEB-MVP-001 (HTTP + HTML surface). |

## Rollback

Revert web-ui decision product modules/public assets; leave personal-brain DI APIs unchanged.

---

**End of DL-PERSONAL-BRAIN-WEB-MVP-001**
