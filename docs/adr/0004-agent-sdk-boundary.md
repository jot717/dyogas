# ADR-0004: Agent SDK Contract-Bind Boundary

**Status:** Accepted  
**Date:** 2026-07-23  
**Accepted:** 2026-07-23  
**Deciders:** Engineering Agents · Founder GRANTED 2026-07-23  
**Related:** Art. VIII, XIII; MASTER B8; SPEC-RT-003; ADR-0003; `/contracts`

## Context

MOD-AGENT-SDK binds Agent Contracts and invokes allowlisted skills. Risk: SDK could host pipelines or seal artifacts, forking Runtime/Harness.

## Options Considered

1. **Embed bind logic in Runtime** — Rejected (ADR-0003).  
2. **Each engine invents its own bind** — Rejected (Art. VI).  
3. **SDK binds contracts/skills/candidates; Runtime remains sole host** — Chosen.

## Decision

1. `@dyogas/agent-sdk` provides contract bind, precondition checks, skill/tool allowlists, memory-contract interfaces, and **unsealed** candidate emission.  
2. SDK **SHALL NOT** implement run admit/state machine/retry host APIs (those remain `@dyogas/runtime`).  
3. SDK depends on `@dyogas/runtime`, `@dyogas/kernel`, `@dyogas/trust` public APIs.  
4. Candidates are handed to Runtime/Harness for seal; SDK never self-seals as authoritative.  
5. Stack: ADR-0001.

## Consequences

B8 Implementation unblocked. Engines use SDK for bind; Runtime for runs.

## Non-Goals

LLM vendor · Editing contract markdown · SoR writes
