# Artifact: Decision DNA

**Version:** 0.1.0  
**Status:** Canonical — Foundation  
**Artifact Type:** `DecisionDNA`  
**Schema:** [`/schemas/artifacts/decision-dna.schema.json`](../schemas/artifacts/decision-dna.schema.json)  
**Sprint:** SPRINT-DECISION-INTELLIGENCE-FOUNDATION-001  
**Decision Log:** DL-DECISION-INTELLIGENCE-FOUNDATION-001  

---

## 1. Purpose

A `DecisionDNA` v0.1 snapshot aggregates patterns across one or more **Decision Model** records for a tenant:

```text
Multiple Decision Model artifacts
        ↓
Decision DNA snapshot
```

It records decision patterns, preference signals, constraint patterns, and a descriptive risk profile. It does **not** predict outcomes or choose options.

## 2. Producers / Consumers

| Role | Component |
|------|-----------|
| Producer | `personal-brain` composition `extractDecisionDna` |
| Input | Decision Model Registry / Decision Model[] |
| Consumers | Decision Intelligence Query, Golden Path evidence |

## 3. Invariants

1. `model_refs` non-empty; every ref must exist in the input set.  
2. No Decision Agent. No automatic decision.  
3. Lineage refs (knowledge / approval / graph) preserved when present on models.

---

**End of Decision DNA artifact v0.1.0**
