# Artifact: Decision Intelligence Query Result

**Version:** 0.1.0  
**Status:** Canonical — Foundation  
**Artifact Type:** `DecisionIntelligenceQueryResult`  
**Schema:** [`/schemas/artifacts/decision-intelligence-query.schema.json`](../schemas/artifacts/decision-intelligence-query.schema.json)  
**Sprint:** SPRINT-DECISION-INTELLIGENCE-FOUNDATION-001  
**Decision Log:** DL-DECISION-INTELLIGENCE-FOUNDATION-001  

---

## 1. Purpose

Assistive retrieval over Decision Model Registry + Decision DNA:

```text
{ question, constraints }
        ↓
similar previous decisions
+ matching DNA signals
+ supporting evidence references
```

**Human remains final approval.**  
`automatic_decision` = false · `recommendation` = false · `human_approval_required` = true.

## 2. Out of scope

Decision Agent · ranking of options · auto-approve · UI · durable DB

---

**End of Decision Intelligence Query artifact v0.1.0**
