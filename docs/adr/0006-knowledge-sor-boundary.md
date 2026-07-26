# ADR-0006: Knowledge Engine SoR Boundary

**Status:** Accepted  
**Date:** 2026-07-23  
**Accepted:** 2026-07-23  
**Deciders:** Engineering Agents · Founder GRANTED 2026-07-23  
**Related:** Art. VIII, X; MASTER §6.11; SPEC-ENGIN-002; ADR-0005; Research handoff

## Context

MOD-KNOWLEDGE is the Knowledge Source of Record. Must not be bypassed by Research, UI, or engines writing SoR silently.

## Options Considered

1. **Research Engine writes SoR** — Rejected (ADR-0005).  
2. **Any module may mutate SoR** — Rejected (Art. X).  
3. **Knowledge Engine is sole SoR writer; apply requires Human Approval approved** — Chosen.

## Decision

1. `@dyogas/knowledge-engine` owns local-first Knowledge SoR for MVP (in-process store OK; not a graph DB).  
2. SoR **apply** SHALL require an explicit Human Approval decision of `approved` bound to the research/knowledge artifact.  
3. Engines SHALL NOT self-approve. UI may later record approval; MVP accepts approval records as data.  
4. Graph Engine retrieval is a **contract only** until Graph Engine module exists.  
5. Markdown handoff is a **contract only** — no Markdown Engine implementation here.  
6. Depends on Kernel/Trust/Runtime/SDK/Research public APIs; stack ADR-0001.

## Consequences

Knowledge MVP unblocked. Graph DB and UI remain out of scope.

## Non-Goals

Graph DB · Web UI · Embedding pipeline
