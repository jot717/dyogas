# Decision

**ID:** DL-ENG-AGENT-CODING-ADAPTER-001  
**Date:** 2026-07-26  
**Owner:** Founder (business authority)  
**Status:** **APPROVED**  
**Approved:** 2026-07-26 (Founder via sprint charter)  
**Trace:** `TRACE-ENG-AGENT-001`  
**Sprint:** [`SPRINT-ENG-AGENT-CODING-ADAPTER-001`](../../sprints/SPRINT-ENG-AGENT-CODING-ADAPTER-001.md)

---

## Decision

**APPROVED**

Authorize a **Coding Agent Adapter** under `tools/eng-agent/` that delegates real implementation work to the **Cursor Agent** via `@cursor/sdk` (`Agent.prompt` / local runtime), closing the gap left by declarative `plan.json`-only execution.

```text
DEV-ORCH → ENG-AGENT → CODING AGENT ADAPTER → Cursor Agent → Verifier → Evidence
```

---

## Scope

| Allowed | Forbidden |
|---------|-----------|
| `tools/eng-agent/src/coding-agent/` | New `MOD-*` |
| `tools/dev-orch/` wiring + coding-task util/tests under allowlist | Runtime / SDK / Execution Host |
| `@cursor/sdk` dependency on eng-agent | Product modules |
| Independent verifier: git/snapshot diff + test exit + evidence | Mock code gen / hardcoded PASS / caller facts |

**Implementation authorization:** YES under this Sprint.  
**COMPLETE requires:** demonstrated live Cursor Agent run that modifies source and passes independent verification.

---

**End of DL-ENG-AGENT-CODING-ADAPTER-001**
