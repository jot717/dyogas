# Spec: DYOGAS Kernel (MOD-KERNEL) — Platform Primitives

**Spec ID:** SPEC-RT-001  
**Module:** MOD-KERNEL  
**Trace ID:** TRACE-KERNEL-001  
**Future Backlog ID:** BACKLOG-KERNEL-001  
**Requester:** Founder (business sponsor — not Product Owner)  
**Spec Author:** Chief Architecture Refactoring Agent (draft)  
**Status:** `accepted`  
**Founder Approval (business):** GRANTED — 2026-07-22 (MVP enter B5 / Architecture Review command)  
**Build Order:** B5 — **MVP first code module**  
**Dependencies:** None on Runtime/SDK/Trust (Trust/Runtime depend on Kernel)

---

## Pain Statement

**Who:** All future Runtime, Trust, Agent SDK, and Engine implementers.  
**How it hurts:** Without shared tenancy, id, time, config, and log-field primitives, every module would fork infrastructure — violating Constitution Art. VI and blocking a single Runtime.  
**Frequency:** Continuous from first line of platform code.  
**Current workaround:** None — no code exists; primitives must land first.  
**Evidence:** MASTER_ARCHITECTURE Build Order B5; empty kernel prior to this Spec.

---

## Goals

1. Define minimal Kernel primitives: tenancy context, id generation, clock, config load, structured log fields.  
2. No product/Harness orchestration in Kernel.  
3. Enable Trust and Runtime to depend on Kernel without cycles.

---

## Non-Goals

1. Pipeline engine, agent bind, egress, SoR, UI.  
2. Choosing final language beyond what B4 ADR will lock (implementation may start behind ADR for stack if Architecture Review allows `adr_required` with Kernel-limited scope — default: stack ADR B4 before merge to protected main).  
3. Hosted Engineering Agents.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Tenancy isolation tests | 100% of cross-tenant access attempts denied in unit tests |
| No Harness/orchestration imports in Kernel | Enforced by package boundary test |
| Runtime can link Kernel APIs | Smoke compile/link once Runtime skeleton exists |

---

## Interfaces Touched

| Surface | Impact |
|---------|--------|
| `/docs/ARCHITECTURE.md` | Consumed (tenancy concepts) |
| Future `/kernel/**` | Created at Implementation |
| Trust/Runtime | Downstream consumers only |

---

## Duplicate Check

No existing Kernel module. **No duplicate.**

---

## Security / Ownership

Deny-by-default tenancy; no secrets in repo; Kernel does not perform egress.

---

## Engineering Agent Approval Chain (Process Mode)

Specification reviews: `kernel/stage/reviews/` (non-backlog/arch-review prefixed).  
**Founder Approval (business) on Spec:** GRANTED — 2026-07-22
