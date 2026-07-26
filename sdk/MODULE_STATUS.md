# MOD-AGENT-SDK — Module Status

**Module:** MOD-AGENT-SDK  
**SPEC-ID:** SPEC-RT-003 (`accepted`)  
**Trace:** TRACE-SDK-001  
**Build Order:** B8  
**Depends on:** MOD-KERNEL · MOD-TRUST · MOD-RUNTIME (immutable) · ADR-0004  

| Stage | Status |
|-------|--------|
| Specification → Module Complete | **YES — COMPLETE** |

**Package:** `@dyogas/agent-sdk@0.1.0`

## Responsibility (canonical)

SDK = agent-side bind only:

- Agent contract binding  
- Skill invocation (allowlist)  
- Contract pinning  
- Memory contracts  
- Candidate emission (unsealed)

SDK **never** orchestrates pipelines. **Execution Host** (`MOD-EXECUTION-HOST`) orchestrates; SDK is consumed inside stage Execute.

**Related:** [`../execution-host/MODULE_STATUS.md`](../execution-host/MODULE_STATUS.md)
