# Decision

**ID:** DL-DECISION-GRAPH-FOUNDATION-001  
**Date:** 2026-07-26  
**Owner:** Founder (business authority)  
**Mode:** Development Harness — Implementation Mode  
**Status:** **APPROVED**  
**Decision:** **APPROVED** (Founder FULL AUTONOMOUS HARNESS EXECUTION directive — 2026-07-26)  
**Implementation authorization:** **YES** (DG-01…DG-07)  
**Approved:** 2026-07-26  
**Architecture Review:** [`ARCH-DECISION-GRAPH-FOUNDATION-001`](../architecture-reviews/ARCH-DECISION-GRAPH-FOUNDATION-001.md) **APPROVE** · `no_arch_impact`  
**Trace:** `TRACE-DECISION-GRAPH-FOUNDATION-001`  
**Sprint:** [`SPRINT-DECISION-GRAPH-FOUNDATION-001`](../../sprints/SPRINT-DECISION-GRAPH-FOUNDATION-001.md)  
**Entry:** [`engineering/START_DEVELOPMENT.md`](../../engineering/START_DEVELOPMENT.md)

---

## Subject

Transform verified Research Agent evidence into the first **Decision Graph foundation**
by composing existing modules — no new MOD, no Runtime / SDK / Execution Host redesign.

## Repository audit — binding findings

| Asset | Location | Status |
|-------|----------|--------|
| Research evidence + handoff | `research/` (`KnowledgeHandoffContract`, collectors) | **COMPLETE** (MVP Band A+B) |
| Human approval gate | `human-gate/` (`runHumanApprovalGate`) | **COMPLETE** (B11) |
| Knowledge SoR | `knowledge/` (`applyApprovedKnowledge`, ADR-0006) | **COMPLETE** |
| Graph propose/apply store | `graph/` (`proposeGraphUpdate`, `createMemoryGraphStore`) | **COMPLETE** |
| End-to-end green path | `ingestion-e2e/` | **COMPLETE** (B15) |
| Decision Graph contract / ontology | — | **GAP** (this sprint) |

**Correction vs inventing a new module:** Decision Graph semantics land as **contracts + ontology profile + composition APIs** inside existing MOD-GRAPH / MOD-KNOWLEDGE / human-gate / research. SoR write remains Knowledge-only after human approval (ADR-0005 / ADR-0006 / Art. X).

## Decisions

| ID | Decision |
|----|----------|
| **D-1** | No new MOD. Composition over `trust/`, `research/`, `knowledge/`, `human-gate/`, `graph/`. `personal-brain/` reused as Product consumer only — **no Product redesign**. |
| **D-2** | Evidence → Knowledge → Decision is a **contracted pipeline**, not a new engine. |
| **D-3** | Coding Agent write exceptions for this sprint: `graph/src/`, `graph/tests/`, `knowledge/src/`, `knowledge/tests/`, `human-gate/src/`, `human-gate/tests/`, `ingestion-e2e/tests/`, `schemas/artifacts/`, `docs/decision-graph/`, `docs/eng-agent/production/`. Runtime / SDK / Host / `personal-brain/` remain forbidden. |
| **D-4** | Persist = process-lifetime SoR + in-memory graph store (durable DB remains deferred per MODULE_STATUS). |
| **D-5** | Human approval is mandatory; engines never self-approve. |

## Scope

**In:** DG-01…DG-07 as listed in the Sprint.  
**Out:** Durable graph DB, cloud embeddings, Runtime/SDK/Host/Product redesign, new MOD, Decision Intelligence UI.

## Rollback

1. Revert additive decision-graph exports / ontology registration.  
2. Leave Research MVP + B11/B15 paths unchanged.  
3. Mark sprint tasks BLOCKED if ADR-0005/0006 guards would be weakened.

---

**End of DL-DECISION-GRAPH-FOUNDATION-001**
