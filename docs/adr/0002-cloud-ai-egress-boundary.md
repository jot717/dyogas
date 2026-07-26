# ADR-0002: Cloud AI Compute / Egress Boundary

**Status:** Superseded by ADR-0011 (scoped Research Stage-1 source-fetch allow-path only; deny-default remains for all other egress)  
**Date:** 2026-07-23  
**Accepted:** 2026-07-23  
**Superseded:** 2026-07-26 by [`ADR-0011`](./0011-research-agent-stage1-egress-allow-path.md)  
**Deciders:** Engineering Agents (Process Mode, all approve) · Founder business approval GRANTED 2026-07-23 (MOD-TRUST Module Complete command)  
**Related:** Constitution Art. VIII, XI; MASTER Build Order B3/B6; SPEC-RT-004; SPEC-ADR-PLANNED-002; ADR-0001; TRACE-TRUST-001; ADR-0011

## Context

MOD-TRUST (B6) introduces the platform egress gate and audit sink. Without a written Cloud AI / egress boundary, Runtime or engines could invent allow-paths or vendor clients and violate local-first / Trust Visible. Build Order B3 requires this ADR before Trust egress to cloud.

## Options Considered

1. **Allow unrestricted egress from any module** — Rejected: violates Art. XI and Trust Visible.  
2. **Defer Trust module until a cloud vendor is chosen** — Rejected: blocks Runtime (B7); vendor choice is a Non-Goal of SPEC-RT-004.  
3. **Deny-by-default egress gate in MOD-TRUST; no cloud allow and no vendor lock until a superseding ADR** — Chosen.  
4. **Pick a cloud AI vendor in this ADR** — Rejected: out of scope for B3 boundary ADR and SPEC-RT-004 Non-Goal #1.

## Decision

1. **All egress requests** from DYOGAS platform code SHALL pass through **MOD-TRUST** egress gate APIs. No module may call network/cloud AI directly.  
2. **Default policy:** **deny**. Absent an explicit allow decision recorded under an Accepted superseding ADR (or an Accepted amendment process that updates this boundary), Trust MUST deny egress.  
3. **MOD-TRUST MVP** MAY ship: identity adapter (Kernel tenancy), secrets interface (redact; no secrets in repo), deny-all egress gate, append-only audit sink — on ADR-0001 stack.  
4. **Cloud AI Compute vendor selection** is **not** decided here. Enabling any cloud/AI egress allow-path requires a **new ADR** that supersedes or extends this one with vendor, data classes allowed, and consent/audit requirements.  
5. Trust SHALL NOT import Harness orchestration, pipelines, or agent-bind packages; SHALL depend on `@dyogas/kernel` public API only.

## Consequences

- Trust Implementation may proceed under deny-by-default.  
- Runtime/engines blocked from direct network until they call Trust (and Trust will deny until a future allow ADR).  
- Audit events for deny decisions SHOULD be appendable for Trust Visible.  
- B3 Build Order item satisfied for “egress boundary”; vendor ADR remains future work.

## Non-Goals

- Choosing Cloud AI vendor or model provider  
- Knowledge SoR storage engine  
- Implementing Runtime or Harness  
- Human Approval UI
