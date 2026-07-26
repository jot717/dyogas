# Decision

**ID:** DL-ENG-AGENT-AUTONOMOUS-EXECUTION-001  
**Date:** 2026-07-26  
**Owner:** Founder (business authority)  
**Status:** **APPROVED**  
**Approved:** 2026-07-26 (Founder via sprint charter)  
**Trace:** `TRACE-ENG-AGENT-001`  
**Supersedes (capability):** fact-wrapper-only path of SPRINT-ENG-AGENT-IMPLEMENTATION-001 for autonomous execution  
**Sprint:** [`SPRINT-ENG-AGENT-AUTONOMOUS-EXECUTION-001`](../../sprints/SPRINT-ENG-AGENT-AUTONOMOUS-EXECUTION-001.md)

---

## Decision

**APPROVED**

Authorize upgrading Development Harness tooling so `tools/dev-orch` + `tools/eng-agent` form a **real autonomous engineering execution loop** that closes GAP-EA-001…003:

- Real executor (commands + lifecycle + result capture)
- End-to-end wiring: Registry → Package → Eng-Agent → Executor → Tests → Verifier → Evidence
- Verifier observes command/test exit codes and evidence files independently (does not trust caller `facts.*.passed`)

```text
Development Harness builds DYOGAS.
Execution Harness runs DYOGAS.
```

---

## Scope

| Allowed | Forbidden |
|---------|-----------|
| `tools/eng-agent/` executor + independent verifier | New `MOD-*` |
| `tools/dev-orch/` CLI autonomous run wiring | Runtime / Agent SDK / Execution Host |
| Fixture tasks under `tools/eng-agent/fixtures/` | Product module source |
| Evidence under `docs/eng-agent/` | Hosted `MOD-ENG-AGENTS` / B17 |
| Dry-run default; `--apply` for mutation | LLM / Coding Agent (still out of scope) |

**Implementation authorization:** YES under this Sprint.

---

**End of DL-ENG-AGENT-AUTONOMOUS-EXECUTION-001**
