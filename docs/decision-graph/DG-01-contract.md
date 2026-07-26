# DG-01 — Evidence → Knowledge → Decision Graph Contract

**Sprint:** SPRINT-DECISION-GRAPH-FOUNDATION-001  
**Task:** DG-01  
**Status:** DONE  
**Trace:** `TRACE-DECISION-GRAPH-FOUNDATION-001`

---

## Pipeline stages

```text
[Evidence]  Research Agent verified EvidenceItem[] + KnowledgeHandoffContract
     │
     ▼  (ingest adapter — MOD-KNOWLEDGE; no SoR write)
[Knowledge draft package]  handoff + content + pending approval
     │
     ▼  (human-gate — mandatory actor decision)
[Approved Knowledge]  Knowledge SoR apply (ADR-0006)
     │
     ▼  (MOD-GRAPH — decision ontology + mutationAuthorized)
[Decision Graph]  nodes/edges persisted to in-memory graph store
```

## Invariants

1. Research never writes SoR (`sorWriteAllowed: false`).
2. Human approval is required (`requiresHumanApproval: true`).
3. Graph derivation only from `approvalState === "applied"` Knowledge.
4. Graph `apply` mode requires `mutationAuthorized: true` (fail-closed to propose).
5. Every node/edge carries provenance back to Knowledge and/or Evidence ids.

## Contract version

`decision-graph-foundation@1.0.0`

TypeScript source of truth: `graph/src/decision-graph-contract.ts`  
JSON Schema: `schemas/artifacts/decision-graph-foundation.schema.json`

---

**End of DG-01**
