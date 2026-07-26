# SPEC-PIPE-B11 — Human Approval Gate + Notification

**Status:** Accepted (Founder autonomous Build Orchestrator command 2026-07-23)  
**Build Order:** B11  
**Owning planes:** Product Human Approval (Knowledge data path) + Notification (Runtime-adjacent package)  
**Not a new MOD-\*:** pipeline integration package `@dyogas/human-gate`

## Purpose

Productize Human Approval Gate transitions (pending → approved|rejected) with Notification receipts, without SoR self-approve and without Web UI (B16).

## In Scope

- Queue pending approvals from Proposal / Research handoffs
- Record human decision with attributable actor id
- Emit NotificationReceipts for approval-blocking events (in-memory channel)
- Refuse SoR apply unless decision is approved (delegates to knowledge-engine)

## Out of Scope

- Web UI (MOD-WEB-UI)
- Email/chat webhooks (mock in-app channel only)
- Modifying Runtime / Knowledge source (consumes as deps)

## Architecture Review

**Verdict:** `no_arch_impact` — compositions of existing contracts; no new plane.
