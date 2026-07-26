# ADR-0007: Markdown Engine Domain Boundary

**Status:** Accepted  
**Date:** 2026-07-23  
**Accepted:** 2026-07-23  
**Deciders:** Engineering Agents · Founder GRANTED 2026-07-23  
**Related:** Art. VIII, X, XIII; MASTER §6.12; SPEC-ENGIN-003; ADR-0004–0006; Markdown Agent contract

## Context

MOD-MARKDOWN renders approved Knowledge markdown handoffs into review-ready bodies and unsealed candidates. Risk: writing Knowledge SoR, shipping UI, or sealing artifacts outside Runtime/Harness.

## Options Considered

1. **Markdown Engine applies to Knowledge SoR** — Rejected (Art. X; ADR-0006 owns SoR).  
2. **Engine bypasses Agent SDK / Runtime** — Rejected (Art. XIII / ADR-0003/0004).  
3. **Engine consumes Knowledge markdown handoff; emits unsealed `knowledge/markdown` candidates only** — Chosen.

## Decision

1. `@dyogas/markdown-engine` implements Markdown render + citation section MVP for review-ready bodies.  
2. **SHALL** consume `MarkdownHandoffContract` (or equivalent `{title, body, knowledgeId, tenantId, version}`) from Knowledge.  
3. **SHALL** use Kernel tenancy, Trust audit, Runtime admit/start/succeed, Agent SDK `bindContract(markdown-agent)` + `emitCandidate`.  
4. **SHALL** emit **unsealed** candidates only (`sealed: false`); artifactType `knowledge/markdown`.  
5. **SHALL NOT** mutate Knowledge SoR, ship Web UI, open a graph DB, or redefine Harness law.

## Consequences

B12 MVP unblocked. Sealing and SoR apply remain Runtime/Harness + Knowledge-owned.

## Non-Goals

SoR apply · Web UI · Graph DB · Full apply-token Human Gate productization
