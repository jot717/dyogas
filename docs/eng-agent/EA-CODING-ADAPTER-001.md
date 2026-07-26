# EA-CODING-ADAPTER-001 — Status & Evidence

**Sprint:** SPRINT-ENG-AGENT-CODING-ADAPTER-001  
**Auth:** DL-ENG-AGENT-CODING-ADAPTER-001 **APPROVED**  
**Date:** 2026-07-26  
**Sprint status:** **COMPLETE**  
**Exit:** **PASS**  
**Live E2E:** [`EA-CODING-ADAPTER-LIVE-E2E.md`](./EA-CODING-ADAPTER-LIVE-E2E.md)

---

## Integration method

**Cursor TypeScript SDK** — `@cursor/sdk` `Agent.prompt(...)` with **local** runtime:

```typescript
import { Agent } from "@cursor/sdk";

await Agent.prompt(instruction.prompt, {
  apiKey: process.env.CURSOR_API_KEY,
  model: { id: "composer-2.5" },
  local: { cwd: workspaceRoot },
});
```

Flow:

```text
Execution Package
  → buildCodingInstruction()
  → invokeCodingAgent() / Agent.prompt
  → collectChangedFiles (git diff || content snapshot)
  → run verify command (node --test)
  → verifyCodingObservation (independent)
  → write evidence JSON
```

---

## PASS criteria

| Criterion | Result |
|-----------|--------|
| Harness starts task | **PASS** |
| Coding agent receives instruction | **PASS** |
| Source file changes occur | **PASS** (`title-case.ts`) |
| Tests execute | **PASS** (verify exit 0) |
| Independent verifier confirms result | **PASS** (`trustsCallerFacts=false`) |

**Overall:** sprint **COMPLETE** / Exit **PASS**.

---

## Tests (closure)

```text
tools/eng-agent  → live e2e PASS · 40 pass · 0 fail · 0 skipped (reporter-confirmed)
tools/dev-orch   → default suite excludes tests/coding/ (intentional); fixture verify exit 0
```

Machine evidence: `docs/eng-agent/fixtures/CA-TITLE-evidence.json`  
Narrative evidence: `docs/eng-agent/EA-CODING-ADAPTER-LIVE-E2E.md`

---

## Limitations

1. Requires `CURSOR_API_KEY` (env or `.env.local`) — no mock fallback (by design).
2. Change detection may use content snapshot when git history is unavailable.
3. Coding agent write surface is allowlisted (`tools/dev-orch/src/util/`, `tests/coding/`, `docs/eng-agent/`).
4. This is Process Mode harness tooling — **not** Hosted `MOD-ENG-AGENTS`.

---

**End of EA-CODING-ADAPTER-001**
