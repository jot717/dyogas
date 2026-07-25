# C-03 — Host Research Agent Path

**Task:** C-03  
**Sprint:** SPRINT-PB-BRIDGE-CODING-001  
**Date:** 2026-07-25  
**Status:** DONE  

---

## Boundary

```text
Personal Brain
  → createBridgeRun() / ExecutionHost.createRun()   ← only product call
        ↓  Host-internal
  Host binds Research Agent (research-agent@2.0.0) via SDK
        ↓
  Stage 1 → ResearchReport (lineage refs on HostRun)
```

| PB may | PB must not |
|--------|-------------|
| Call Host `createRun` | Import `@dyogas/runtime` |
| Observe `HostRun.lineage` | Import `@dyogas/agent-sdk` / bind agents |
| Read Host `listStageContractMap` (verify) | Orchestrate stages / invent contracts |

---

## Host contract selection (existing)

| Field | Value | Source |
|-------|-------|--------|
| Producer | `Research Agent` | Host stage-map / C2 |
| Agent id | `research-agent` | SPEC-AGT-001 / `contracts/agents/research-agent.md` |
| Version | `2.0.0` | Host pin (admit uses `research-agent@2.0.0`) |
| Code | `hostResearchAgentContractPin()` / `assertHostSelectsResearchAgentContract()` | `src/bridge/research-agent-path.ts` |

---

## Evidence code

| Artifact | Role |
|----------|------|
| `src/bridge/research-agent-path.ts` | Observe + assert Host-owned path |
| `tests/bridge-research-agent-path.test.ts` | C-03 tests |
| `src/bridge/create-run.ts` | Sole stage-start via Host createRun |

---

## GAPs

**No new GAP.** Path complete via existing Host fakes/executor (evidenced by lineage refs).

---

**End of C-03**
