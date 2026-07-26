# T-B1 — Package Naming & Registration Plan

**Sprint:** SPRINT-EXECUTION-HOST-001  
**Task:** T-B1  
**Trace:** TRACE-EXEC-HOST-001  
**Refs:** ADR-0010

---

## Decision

| Field | Value |
|-------|-------|
| Module | **MOD-EXECUTION-HOST** |
| Package name | **`@dyogas/execution-host`** |
| Path | **`/execution-host`** (new package — **not** Runtime expansion) |
| Rationale | ADR-0010 Option D: dedicated Host composing Runtime + SDK + `/pipelines` |

---

## MODULE_STATUS / Build Order plan

| Action | When | Notes |
|--------|------|-------|
| Create `execution-host/MODULE_STATUS.md` | Phase 1 (now) | Stage = scaffold / Phase 1 complete for A–B |
| Propose Build Order slot **B18** | Documented in GAP-EH-004 | Do **not** edit Kernel/Runtime/SDK or MASTER_ARCHITECTURE in Phase 1 |
| Official Build Order / ADR status hygiene | After Founder/Architect confirm ADR Accepted + B-slot | Separate doc change |

**Shall not:** expand `@dyogas/runtime` package to own Pipeline Engine.

**End of T-B1**
