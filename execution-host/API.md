# Execution Host API

**Sprint:** SPRINT-EXECUTION-HOST-001  
**Package:** `@dyogas/execution-host`  
**Phase:** 3 — lineage + audit + human gate overlay.

## Facade

| API | Behavior |
|-----|----------|
| `createRun` | Load/pin pipeline → Runtime admit/start → executor → usually `waiting_human` |
| `getRun` | Status + lineage snapshot |
| `resumeHuman` | Human-only decisions; mint apply token on `approved` |
| `applyKnowledgeAuthorized` | Consume single-use token; append Knowledge lineage; audit |
| `applyGraphAuthorized` | Requires Knowledge; rejects consumed token presentation |

## Modules

| Area | Entry |
|------|-------|
| Lineage | `appendLineage`, `toLineageSnapshot`, `requireApprovalBeforeApply` |
| Audit | `createHostAudit`, `HostAuditType` (Trust `AuditSink`) |
| Human gate | `openHumanGate`, `resumeHumanGate`, apply-token helpers |

No Knowledge/Graph engine implementation — authorization + lineage/audit only.

**End**
