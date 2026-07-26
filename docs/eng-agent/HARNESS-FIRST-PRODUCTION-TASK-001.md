# HARNESS-FIRST-PRODUCTION-TASK-001 — HFP-01 Evidence

**Sprint:** SPRINT-HARNESS-FIRST-PRODUCTION-TASK-001  
**Task:** HFP-01  
**Gap:** GAP-BR-012  
**Verdict:** **PASS**  
**Machine evidence:** [`production/HFP-01-evidence.json`](./production/HFP-01-evidence.json)  
**Execution Package:** [`../dev-orch/execution-packages/HFP-01.json`](../dev-orch/execution-packages/HFP-01.json)

---

## Flow executed

```text
Task Registry (HFP-01)
→ Execution Package (HFP-01.json)
→ Coding Agent (Cursor session — CURSOR_API_KEY absent for Agent.prompt)
→ Code modification
→ Tests
→ Independent verification
→ Evidence
→ Registry DONE
```

## Changed files

| Path | Change |
|------|--------|
| `personal-brain/src/bridge/create-run.ts` | `assertAmbientTenantAligned` via `requireTenant()` before Host `createRun` |
| `personal-brain/tests/bridge-create-run.test.ts` | Ambient setup for existing cases; **C-02-T6** unbound; **C-02-T7** mismatch |
| `personal-brain/tests/bridge-research-agent-path.test.ts` | Ambient for C-03-T1 / C-03-T5 |
| `personal-brain/tests/bridge-execute-research.test.ts` | Ambient for C-04-T4 |
| `personal-brain/tests/bridge-persist-research-report.test.ts` | Ambient for C-05-T5 |

## Tests

| Suite | Result |
|-------|--------|
| `personal-brain` `npm test` | **48 pass · 0 fail** |
| `personal-brain` `npm run build` | **OK** |
| `tools/eng-agent` `npm test` | **39 pass · 0 fail · 1 skipped** |
| `tools/eng-agent` `npm run build` | **OK** |
| `tools/dev-orch` `npm test` | **64 pass · 0 fail** |
| `tools/dev-orch` `npm run build` | **OK** |

## Independent verifier

**PASS** · `trustsCallerFacts=false`

- Unbound ambient refuses before Host call  
- Ambient ≠ request tenant refuses before Host call  
- Matching ambient happy path preserved  
- Forbidden scope (runtime/sdk/execution-host) untouched  

## Limitation

Live `@cursor/sdk` `Agent.prompt` was not invoked in this shell (`CURSOR_API_KEY` missing). Implementation was performed by the Cursor Coding Agent in-session under the Founder `READY_FOR_EXECUTION` directive for HFP-01.

GAP-BR-012 registry status remains **OPEN** until a separately authorized evidence-backed GAP close.

---

**End of HARNESS-FIRST-PRODUCTION-TASK-001 HFP-01 evidence**
