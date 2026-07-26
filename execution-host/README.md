# @dyogas/execution-host

**Module:** MOD-EXECUTION-HOST  
**Sprint:** SPRINT-EXECUTION-HOST-001  
**Trace:** TRACE-EXEC-HOST-001  
**Spec:** `/specs/SPEC-EXECUTION-HOST-001.md`  
**ADR:** ADR-0010  

Pipeline Execution Host — drives pinned pipeline runs by composing **Runtime + Agent SDK + `/pipelines`** under Execution Harness law.

## SHALL

- Load version-pinned pipeline definitions from `/pipelines`
- Admit and transition runs via `@dyogas/runtime` (consume only)
- Bind stage agents via `@dyogas/agent-sdk` (consume only)
- Pause for Human Approval before SoR apply
- Propagate artifact lineage and emit audit events

## SHALL NOT

- Replace or rewrite Runtime / Agent SDK
- Redefine `/harness` law
- Create new agent contracts or artifact schemas
- Bypass Human Approval
- Embed Product UI or Decision Agent
- Shadow-orchestrate from Experience products (products **request** Host)

## Phase 1 status

**SPRINT-EXECUTION-HOST-001 COMPLETE** · **MODULE COMPLETE**

See `stage/MODULE_COMPLETE.md` and `stage/ACCEPTANCE-SPRINT-EXECUTION-HOST-001.md`.

```bash
npm test
npm run build
```

**End**
