# Artifact: Decision Model

**Version:** 0.1.0  
**Status:** Canonical — Foundation (DI-01)  
**Artifact Type:** `DecisionModel`  
**Schema:** [`/schemas/artifacts/decision-model.schema.json`](../schemas/artifacts/decision-model.schema.json)  
**Sprint:** SPRINT-DECISION-MODEL-FOUNDATION-001  
**Decision Log:** DL-DECISION-MODEL-FOUNDATION-001  

---

## 1. Purpose

A `DecisionModel` v0.1 is a **snapshot** produced only after:

```text
Approved Decision Asset
        +
Human Approval
        ↓
Decision Model snapshot
```

It records question, constraints, options (from Decision Asset claims), the human-approved package choice, evidence/knowledge/approval refs, and actor. It does **not** predict, recommend, or replace human judgment.

## 2. Producers / Consumers

| Role | Component |
|------|-----------|
| Producer | Product composition (`personal-brain` bridge `buildDecisionModelSnapshot`) — **not** a Decision Agent |
| Inputs | Decision Asset, Human Approval, applied Knowledge, Host lineage |
| Consumers | Golden Path evidence, future Decision Intelligence (no new SoR) |

## 3. Invariants

1. No Decision Model without human `approved` decision + `actor_id`.  
2. `evidence_refs` must be non-empty and subset of Decision Asset evidence.  
3. `knowledge_ref` and `approval_ref` required.  
4. No auto-approve. No prediction engine. No new persistence engine (snapshot file/object only).

## 4. Out of scope (DI-01)

Decision Agent · UI · recommendation/prediction · durable graph DB · Runtime/SDK/Host redesign · new MOD

---

**End of Decision Model artifact v0.1.0**
