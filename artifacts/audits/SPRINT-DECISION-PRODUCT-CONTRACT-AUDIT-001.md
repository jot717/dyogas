# SPRINT-DECISION-PRODUCT-CONTRACT-AUDIT-001

Generated: 2026-07-27T05:30:35.378Z

Evidence basis: live browser-path product server (`/decision/request` → approve), runtime artifacts under `artifacts/runtime-decisions/`. Not unit-test-only.

Golden Path under audit:

External World → Research Request → Execution Host → Runtime → SDK → Research Agent → Decision Asset Agent → Human Approval → Knowledge → Graph → Decision Model

## CASE-001

- artifact_dir=C:\Users\juiyu\OneDrive\Desktop\dyogas\artifacts\runtime-decisions\CONTRACT-AUDIT-CASE-001
- A.question=how to apply japan highly skilled visa
- evidence_count=3

### 1. Research Request artifact: **PASS**

- Expected contract: domain=japan_immigration; factors; source requirements; constraints present
- Actual runtime: domain=japan_immigration; factors=["eligibility","points_calculation","required_documents","application_procedure"]; goal=learn_how_to; constraints={}; host_receives_research_plan=true
- Gap: none
- Fix required: none

### 2. Execution Host input: **PASS**

- Expected contract: Host receives Research Plan (domain/factors/queries), not only raw NL question
- Actual runtime: host_receives_research_plan=true; plan_domain=japan_immigration; note=Stage-1 collectors receive [decision-plan] annotation with domain/factors/queries/exclude
- Gap: none
- Fix required: none

### 3. Runtime trace: **PASS**

- Expected contract: Request → Research Agent → Evidence → Decision Asset → Human Gate
- Actual runtime: path=["BrowserUser|API","web-ui|/decision/request","personal-brain|createDecisionRequest","ExecutionHost|createRun","ResearchAgent|stage1","EvidenceArtifact","DecisionAsset","HumanApproval|waiting_human"]; stages=["request","research","evidence","decision_asset","human_approval"]; waiting_human=true
- Gap: none
- Fix required: none

### 4. Decision Asset / Brief output: **PASS**

- Expected contract: Answers 'what is human approving?' with context, findings, evidence, tradeoffs, unknowns, proposed knowledge; domain-specific options
- Actual runtime: options=["Create Japan HSP visa application knowledge based on ISA requirements, points calculation and documents.","Create Japan HSP points-and-documents checklist knowledge before filing the application."]; proposed=Japan HSP visa application (ISA requirements, points calculation, documents); findings=3; evidence_summary=3; unknowns=4
- Gap: none
- Fix required: none

### 5. Human Approval UI contract: **PASS**

- Expected contract: Approval screen: "You are approving creation of: XXXXX Knowledge" (not "Approve research")
- Actual runtime: approval_question=You are approving creation of: Japan HSP visa application (ISA requirements, points calculation, documents) Knowledge; proposed=Japan HSP visa application (ISA requirements, points calculation, documents); status=waiting_human; autoApproved=false; F.decision=pending
- Gap: none
- Fix required: none

### 6. After approval → Knowledge / Graph / Decision Model: **PASS**

- Expected contract: Human Approval → Knowledge artifact → Graph node → Decision Model update
- Actual runtime: approve_status=200; G=true; H=true; J=true; knowledge_snip={
  "item": {
    "knowledgeId": "2fb197e1557731302711a9642915f700",
    "tenantId": "validation-tokyo-2026",
    "title": "Decision Asset: how to apply japan highly skilled visa",
- Gap: none
- Fix required: none

## CASE-002

- artifact_dir=C:\Users\juiyu\OneDrive\Desktop\dyogas\artifacts\runtime-decisions\CONTRACT-AUDIT-CASE-002
- A.question=Should I build an AI startup in Tokyo or continue employment?
- evidence_count=8

### 1. Research Request artifact: **PASS**

- Expected contract: domain=startup_decision; factors; source requirements; constraints present
- Actual runtime: domain=startup_decision; factors=["market opportunity","financial risk","opportunity cost","Tokyo ecosystem","personal constraints"]; goal=make_decision; constraints={}; host_receives_research_plan=true
- Gap: none
- Fix required: none

### 2. Execution Host input: **PASS**

- Expected contract: Host receives Research Plan (domain/factors/queries), not only raw NL question
- Actual runtime: host_receives_research_plan=true; plan_domain=startup_decision; note=Stage-1 collectors receive [decision-plan] annotation with domain/factors/queries/exclude
- Gap: none
- Fix required: none

### 3. Runtime trace: **PASS**

- Expected contract: Request → Research Agent → Evidence → Decision Asset → Human Gate
- Actual runtime: path=["BrowserUser|API","web-ui|/decision/request","personal-brain|createDecisionRequest","ExecutionHost|createRun","ResearchAgent|stage1","EvidenceArtifact","DecisionAsset","HumanApproval|waiting_human"]; stages=["request","research","evidence","decision_asset","human_approval"]; waiting_human=true
- Gap: none
- Fix required: none

### 4. Decision Asset / Brief output: **PASS**

- Expected contract: Answers 'what is human approving?' with context, findings, evidence, tradeoffs, unknowns, proposed knowledge; domain-specific options
- Actual runtime: options=["Create Tokyo AI startup decision knowledge recording a build-now path versus employment baseline.","Create Tokyo AI startup decision knowledge recording continue-employment / validate-first before full build."]; proposed=Tokyo AI startup vs employment decision; findings=3; evidence_summary=3; unknowns=4
- Gap: none
- Fix required: none

### 5. Human Approval UI contract: **PASS**

- Expected contract: Approval screen: "You are approving creation of: XXXXX Knowledge" (not "Approve research")
- Actual runtime: approval_question=You are approving creation of: Tokyo AI startup vs employment decision Knowledge; proposed=Tokyo AI startup vs employment decision; status=waiting_human; autoApproved=false; F.decision=pending
- Gap: none
- Fix required: none

### 6. After approval → Knowledge / Graph / Decision Model: **PASS**

- Expected contract: Human Approval → Knowledge artifact → Graph node → Decision Model update
- Actual runtime: approve_status=200; G=true; H=true; J=true; knowledge_snip={
  "item": {
    "knowledgeId": "91f66e3391706d8c1e664ea2c4f40426",
    "tenantId": "validation-tokyo-2026",
    "title": "Decision Asset: Should I build an AI startup in Tokyo or
- Gap: none
- Fix required: none

## CASE-003

- artifact_dir=C:\Users\juiyu\OneDrive\Desktop\dyogas\artifacts\runtime-decisions\CONTRACT-AUDIT-CASE-003
- A.question=how to make italian coffee
- evidence_count=6

### 1. Research Request artifact: **PASS**

- Expected contract: domain=coffee_preparation; factors; source requirements; constraints present
- Actual runtime: domain=coffee_preparation; factors=["brewing method","ingredients","equipment","technique"]; goal=learn_how_to; constraints={}; host_receives_research_plan=true
- Gap: none
- Fix required: none

### 2. Execution Host input: **PASS**

- Expected contract: Host receives Research Plan (domain/factors/queries), not only raw NL question
- Actual runtime: host_receives_research_plan=true; plan_domain=coffee_preparation; note=Stage-1 collectors receive [decision-plan] annotation with domain/factors/queries/exclude
- Gap: none
- Fix required: none

### 3. Runtime trace: **PASS**

- Expected contract: Request → Research Agent → Evidence → Decision Asset → Human Gate
- Actual runtime: path=["BrowserUser|API","web-ui|/decision/request","personal-brain|createDecisionRequest","ExecutionHost|createRun","ResearchAgent|stage1","EvidenceArtifact","DecisionAsset","HumanApproval|waiting_human"]; stages=["request","research","evidence","decision_asset","human_approval"]; waiting_human=true
- Gap: none
- Fix required: none

### 4. Decision Asset / Brief output: **PASS**

- Expected contract: Answers 'what is human approving?' with context, findings, evidence, tradeoffs, unknowns, proposed knowledge; domain-specific options
- Actual runtime: options=["Create Italian coffee preparation knowledge covering brewing method, ingredients, equipment and technique.","Create comparative Italian coffee technique knowledge before committing to one brew method."]; proposed=Italian coffee preparation (brewing method, ingredients, equipment, technique); findings=3; evidence_summary=3; unknowns=4
- Gap: none
- Fix required: none

### 5. Human Approval UI contract: **PASS**

- Expected contract: Approval screen: "You are approving creation of: XXXXX Knowledge" (not "Approve research")
- Actual runtime: approval_question=You are approving creation of: Italian coffee preparation (brewing method, ingredients, equipment, technique) Knowledge; proposed=Italian coffee preparation (brewing method, ingredients, equipment, technique); status=waiting_human; autoApproved=false; F.decision=pending
- Gap: none
- Fix required: none

### 6. After approval → Knowledge / Graph / Decision Model: **PASS**

- Expected contract: Human Approval → Knowledge artifact → Graph node → Decision Model update
- Actual runtime: approve_status=200; G=true; H=true; J=true; knowledge_snip={
  "item": {
    "knowledgeId": "8b9497871fed367d697068ea102ce431",
    "tenantId": "validation-tokyo-2026",
    "title": "Decision Asset: how to make italian coffee",
    "body":
- Gap: none
- Fix required: none

## Summary

All audited layers PASS across CASE-001/002/003.
