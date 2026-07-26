# ADR-0005: Research Engine Domain Boundary

**Status:** Accepted  
**Date:** 2026-07-23  
**Accepted:** 2026-07-23  
**Deciders:** Engineering Agents · Founder GRANTED 2026-07-23  
**Related:** Art. VIII, X, XIII; MASTER B9; SPEC-ENGIN-001; ADR-0002–0004; Research Agent contract

## Context

MOD-RESEARCH is the first user-value engine. Risk: writing SoR, calling network without Trust, or embedding UI/Runtime forks.

## Options Considered

1. **Engine owns Knowledge SoR** — Rejected (Art. X).  
2. **Engine bypasses Runtime/SDK** — Rejected (Art. XIII / ADR-0003/0004).  
3. **Engine produces evidence + handoffs; SoR/UI/live egress deferred** — Chosen.

## Decision

1. `@dyogas/research-engine` implements Research task/collect/evidence/artifact/handoff MVP.  
2. **SHALL** use Kernel tenancy, Trust audit (+ egress deny), Runtime admit, Agent SDK bind/emit.  
3. **SHALL NOT** mutate Knowledge SoR, ship Web UI, or redefine Harness law.  
4. External source adapters **MAY** be mocks until a superseding allow-egress path exists (ADR-0002).  
5. Human approval handoff is a **data contract** for later UI/Knowledge — engines never self-approve SoR writes.

## Consequences

B9 MVP unblocked. Live network research remains gated by OOS-T-002.

## Non-Goals

Vendor LLM · Web UI · SoR apply
