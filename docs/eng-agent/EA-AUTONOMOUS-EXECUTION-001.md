# EA-AUTONOMOUS-EXECUTION-001 — Architecture & Evidence

**Sprint:** SPRINT-ENG-AGENT-AUTONOMOUS-EXECUTION-001  
**Auth:** DL-ENG-AGENT-AUTONOMOUS-EXECUTION-001 **APPROVED**  
**Date:** 2026-07-26  
**Closes:** GAP-EA-001, GAP-EA-002, GAP-EA-003  
**Verdict:** **PASS** (all checklist items true)

---

## PASS criteria

| Criterion | Result |
|-----------|--------|
| real executor exists | **PASS** — `tools/eng-agent/src/executor/` |
| dev-orch calls eng-agent | **PASS** — `tools/dev-orch/src/cli/autonomous.ts` → `runAutonomousCycle` |
| eng-agent executes task | **PASS** — `executePlan` writes files + runs `node --test` |
| verifier independently checks result | **PASS** — `verifyIndependently` uses exit codes + FS; `trustsCallerFacts: false` |
| evidence generated automatically | **PASS** — cycle writes JSON under `docs/eng-agent/fixtures/` |
| integration test passes | **PASS** — `tools/dev-orch/tests/autonomous-e2e.test.ts` |

---

## Architecture

```text
TASK-REGISTRY (+ plan.json)
        ↓
dev-orch Planner + Execution Package + Gate
        ↓
eng-agent adapt + authorize
        ↓
Executor (writeFile / runCommand / runTest)
        ↓
Independent Verifier (exit codes + file existence)
        ↓
Evidence JSON (auto) + optional registry DONE (--apply)
```

**Packages:** `@dyogas/dev-orch` depends on `@dyogas/eng-agent` via `file:../eng-agent` (build-side only).

**CLI:**

```bash
# dry-run (default) — plan + would-execute, no mutation
npx tsx src/cli/main.ts run --registry tools/eng-agent/fixtures/AE-FIX-01/TASK-REGISTRY.md --autonomous --dry-run

# apply — real execute + evidence + registry update
npx tsx src/cli/main.ts run --registry tools/eng-agent/fixtures/AE-FIX-01/TASK-REGISTRY.md --autonomous --apply
```

When `plan.json` sits beside the registry, `--autonomous` is auto-selected.

---

## Execution flow (real)

1. Parse Task Registry markdown  
2. Select next `READY_FOR_EXECUTION`  
3. Emit Execution Package + Gate  
4. Load `plan.json` (steps)  
5. `executePlan`: allowlisted `writeFile`, allowlisted `node --test`  
6. `verifyIndependently`: require `commandExitCodes` all 0, writes on disk, evidence on disk  
7. Write evidence JSON automatically on `--apply`  
8. Advance registry READY → IN_PROGRESS → DONE on PASS  

---

## Key source files

| Path | Function |
|------|----------|
| `tools/eng-agent/src/executor/lifecycle.ts` | `executePlan`, `loadExecutionPlan` |
| `tools/eng-agent/src/executor/command.ts` | `defaultCommandRunner` |
| `tools/eng-agent/src/verifier/independent.ts` | `verifyIndependently` |
| `tools/eng-agent/src/autonomous.ts` | `runAutonomousCycle` |
| `tools/dev-orch/src/cli/autonomous.ts` | `runAutonomous`, `shouldUseAutonomous` |

---

## Tests

```text
tools/eng-agent  → 34 pass · build OK
tools/dev-orch   → 64 pass · build OK
```

Includes: executor boundary, verifier independence, autonomous cycle, e2e harness.

---

## Limitations (remaining)

1. **No LLM / Coding Agent.** Executor runs declarative `plan.json` steps only (writeFile / node / npm).  
2. **Plans are authored artifacts.** Tasks need a `plan.json`; the harness does not invent implementation steps.  
3. **Command allowlist** is `node` and `npm` only.  
4. **Legacy** `authorizeAndExecute` + caller-facts verifier path remains for backward compatibility; autonomous path must use `verifyIndependently`.  
5. **GAP-EA-001…003 closed** for declarative autonomous execution; open product-coding automation remains out of scope.

---

**End of EA-AUTONOMOUS-EXECUTION-001**
