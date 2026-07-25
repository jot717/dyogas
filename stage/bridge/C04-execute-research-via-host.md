# C-04 — Execute Research Agent via Host

**Task:** C-04  
**Sprint:** SPRINT-PB-BRIDGE-CODING-001  
**Date:** 2026-07-25  
**Status:** DONE  

---

## Result

`executeResearchViaHost()` calls Host `createRun` only, then asserts Host lineage carries a **ResearchReport** slot (`research_report_ref`) linked to Brief + `run_id`.

## Production mode (honest)

| Question | Answer |
|----------|--------|
| Real LLM Research Agent body? | **No** |
| research-engine `runResearchMvp` via Host? | **No** (Host does not wire it; PB must not call it) |
| What Host does today | `bindStage(Research Agent)` then **MVP seal** of synthetic artifact id into lineage kind `ResearchReport` |
| PB fabrication? | **No** — no hardcoded `evidence_items` / report payload |

**Production mode constant:** `host_mvp_lineage_seal` (GAP-BR-019).

---

## Code

| Path | Role |
|------|------|
| `src/bridge/execute-research.ts` | Execute + assert Host ResearchReport ref |
| `tests/bridge-execute-research.test.ts` | C-04-T1…T7 |

---

## GAP

**GAP-BR-019 OPEN** — Host public path does not return schema ResearchReport payload; lineage seal only.

---

**End of C-04**
