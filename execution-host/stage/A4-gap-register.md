# T-A4 — Gap Register

**Sprint:** SPRINT-EXECUTION-HOST-001  
**Task:** T-A4  
**Trace:** TRACE-EXEC-HOST-001  
**Rule:** Escalate — **do not invent** schemas, contracts, or Harness/Runtime law.

| ID | Gap | Impact | Escalation | Invented? |
|----|-----|--------|------------|-----------|
| GAP-EH-001 | Runtime `RunState` MVP subset lacks `WAITING_HUMAN` / `GATE_HUMAN` | Host must model Human Gate wait without forking Runtime transitions | **Mitigated Phase 3:** Host overlay `paused`/`approved`/… via `gate/human.ts` — no Runtime state added | No |
| GAP-EH-002 | Human actor authentication into Host `resume` | Products must prove attributable human/owner identity | **Partial Phase 3:** `actor_kind` human\|agent enforced; product auth still external | No |
| GAP-EH-003 | Host Stage 1 binds Research Agent but does not execute Research Engine; synthetic lineage seal only | Blocks real/schema-valid ResearchReport production; duplicate runners risk shadow orchestration | **CLOSED** 2026-07-25 — `SPRINT-HOST-RESEARCH-INTEGRATION-001` PASS · `ResearchEngine.execute()` → schema validate → seal → lineage | No |
| GAP-EH-004 | Build Order slot for MOD-EXECUTION-HOST | MODULE_STATUS needs official B-slot | Propose **B18** (after B16 DONE; B17 optional deferred) — Founder/Architect confirm; do not edit MASTER until accepted | No |
| GAP-EH-005 | Full Knowledge/Graph apply wiring | Host must not invent SoR paths | Use existing engines only in later groups; fail closed if hooks incomplete | No |
| GAP-EH-006 | Pipeline definition machine-readable form | Loader may need structured parse of markdown pipeline | **Mitigated Phase 2:** `parsePipelineMarkdown` / `loadPipeline` reads `/pipelines/*.md` — no new topology file | No |

**End of T-A4**
