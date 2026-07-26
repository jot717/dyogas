# TASK REGISTRY

**Registry ID:** TASK-REGISTRY-CA-TITLE  
**Sprint:** SPRINT-ENG-AGENT-CODING-ADAPTER-001  
**Current executable task:** **CA-TITLE**

---

### CA-TITLE — Implement toTitleCase in tools/dev-orch

| Field | Content |
|-------|---------|
| **Task ID** | CA-TITLE |
| **Title** | Implement toTitleCase utility and pass coding tests |
| **Objective** | Modify tools/dev-orch/src/util/title-case.ts so toTitleCase works; keep tools/dev-orch/tests/coding/title-case.test.ts passing |
| **Dependencies** | None |
| **Acceptance Criteria** | toTitleCase("hello world") === "Hello World"; empty string returns ""; tests in tests/coding/title-case.test.ts pass; build OK |
| **Test Requirement** | node --import tsx --test tests/coding/title-case.test.ts (cwd tools/dev-orch) |
| **Status** | **READY_FOR_EXECUTION** |
| **Evidence** | docs/eng-agent/fixtures/CA-TITLE-evidence.json |

---

**End of TASK-REGISTRY-CA-TITLE**
