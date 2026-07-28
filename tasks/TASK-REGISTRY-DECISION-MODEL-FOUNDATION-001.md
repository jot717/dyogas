# TASK-REGISTRY — SPRINT-DECISION-MODEL-FOUNDATION-001

**Registry ID:** TASK-REGISTRY-DECISION-MODEL-FOUNDATION-001  
**Sprint:** SPRINT-DECISION-MODEL-FOUNDATION-001  
**Decision Log:** DL-DECISION-MODEL-FOUNDATION-001 (**APPROVED**)  
**Authorization:** DI-01 only  

| Task | Area | Status | Deliverable |
|------|------|--------|-------------|
| DI-01 | Foundation | **DONE** | Schema + artifact + mapper + `J-decision-model.json` + tests |

## Acceptance (DI-01)

- [x] Schema fields: model_id, tenant_id, decision_id, question, constraints, options, chosen_option, rationale, evidence_refs, knowledge_ref, approval_ref, actor_id, outcome_status, created_at, version
- [x] Approved Decision Asset + Human Approval → Decision Model snapshot
- [x] Golden Path emits `artifacts/golden-path/USER-REQUEST-001/J-decision-model.json`
- [x] Tests: no approval = no model; approval required; evidence refs preserved; lineage preserved
- [x] Forbidden scope unchanged

---

**End of TASK-REGISTRY-DECISION-MODEL-FOUNDATION-001**
