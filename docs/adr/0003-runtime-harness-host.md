# ADR-0003: Runtime Harness-Enforcement Host Boundary

**Status:** Accepted  
**Date:** 2026-07-23  
**Accepted:** 2026-07-23  
**Deciders:** Engineering Agents (Process Mode) · Founder business GRANTED 2026-07-23  
**Related:** Art. VIII, XIII; MASTER B7; SPEC-RT-002; Harness Spec; ADR-0001; ADR-0002

## Context

MOD-RUNTIME is the process host that must enforce Harness semantics. Without an ADR, Implementation could fork Harness law or embed Agent SDK concerns in Runtime.

## Options Considered

1. **Each engine hosts its own orchestrator** — Rejected (Art. VI / XIII).  
2. **Runtime redefines states/gates independently of Harness Spec** — Rejected (law fork).  
3. **Runtime enforces Harness Spec as sole host; Agent bind deferred to MOD-AGENT-SDK** — Chosen.

## Decision

1. `@dyogas/runtime` is the **sole process host** for admitting pipeline runs and driving Harness-compatible run/invocation state machines in software.  
2. Runtime **SHALL NOT** redefine Harness states, gates, or retry law — it implements/enforces them.  
3. Runtime **SHALL** depend on `@dyogas/kernel` and `@dyogas/trust` public APIs only (plus stdlib); stack per ADR-0001.  
4. Runtime **SHALL NOT** implement Agent contract bind, skill invocation, or engine domain logic (MOD-AGENT-SDK / engines).  
5. Egress remains Trust (ADR-0002 deny-default). Audit events append via Trust audit sink.  
6. MVP may host a **minimal** run lifecycle + handoff + retry + contract-pin gate sufficient for SPEC-RT-002 metrics; full pipeline graph loading may grow later without superseding this boundary.

## Consequences

- B7 Implementation unblocked under this ADR + Kernel + Trust COMPLETE.  
- Agent SDK remains B8.  
- Illegal transitions fail closed in Runtime tests.

## Non-Goals

Vendor Cloud AI · SoR engine · Editing Harness markdown law in this ADR
