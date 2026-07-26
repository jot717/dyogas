# Decision

**ID:** DL-TASK-AGENT-FOUNDATION-001  
**Date:** 2026-07-26  
**Owner:** Founder (business authority)  
**Mode:** Development Harness — Implementation Mode  
**Status:** **APPROVED**  
**Decision:** **APPROVED** (Founder immediate implementation authorization — 2026-07-26)  
**Implementation authorization:** **YES** (TA-01…TA-07)  
**Approved:** 2026-07-26  
**Architecture Review:** [`ARCH-TASK-AGENT-FOUNDATION-001`](../architecture-reviews/ARCH-TASK-AGENT-FOUNDATION-001.md) **APPROVE** · `no_arch_impact`  
**Trace:** `TRACE-TASK-AGENT-FOUNDATION-001`  
**Sprint:** [`SPRINT-TASK-AGENT-FOUNDATION-001`](../../sprints/SPRINT-TASK-AGENT-FOUNDATION-001.md)

---

## Subject

Implement **Layer 2 Task Agent foundation** — plan / decompose / route / emit Execution Package /
human-approve — without a new Platform Module and without Runtime / SDK / Execution Host /
Product / Decision Model redesign.

## Naming disambiguation

Sprint “Layer 2 Task Agent” means **orchestration layer above Research Agent**, **not**
`MASTER_ARCHITECTURE` L2 (Engineering Process). Closest stack neighbor: supporting agent under
MOD-CPAS + engineering tooling (same class as `tools/dev-orch`, `tools/eng-agent`).

## Decisions

| ID | Decision |
|----|----------|
| **D-1** | Implementation lives at **`tools/task-agent/`** (`@dyogas/task-agent`). **Not** a new Platform MOD. Root `task-agent/` package directory is **forbidden** (MASTER_ARCHITECTURE §6/§9). |
| **D-2** | Task Agent is a **supporting / meta agent** (like Learning/Notification): contract + schema under MOD-CPAS; no new pipeline stage; no Host topology change. |
| **D-3** | Agent routing: Research Agent is the only Stage-1 route in this sprint; future agents register via extension map (fail-closed on unknown). |
| **D-4** | Execution Package = existing `tools/dev-orch` `ExecutionPackage` shape (compatible with eng-agent / Host handoff docs). No new package format. |
| **D-5** | Human approval uses **`human-gate`** module (not Host apply-token gate). Agents never self-approve. |
| **D-6** | Host consumption is **compatibility-only** this sprint (package + research brief fields Host already accepts). No `execution-host/` code edits. |

## Scope

**In:** TA-01…TA-07.  
**Out:** New MOD; Runtime/SDK/Host/Product redesign; Decision Model; pipeline topology change.

## Rollback

1. Revert `tools/task-agent/`, contract/schema/artifact additions, index rows.  
2. Leave Research MVP + Decision Graph Foundation unchanged.

---

**End of DL-TASK-AGENT-FOUNDATION-001**
