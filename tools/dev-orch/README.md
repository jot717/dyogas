# @dyogas/dev-orch

**Development Orchestrator tooling** — executable Development Harness helper.

| Field | Value |
|-------|--------|
| **Owner** | MOD-ENGINEERING (governance) |
| **Platform Module?** | **No** — not `MOD-DEV-ORCH` |
| **Spec** | [`SPEC-DEV-ORCH-001`](../../specs/SPEC-DEV-ORCH-001.md) |
| **Auth** | [`DL-DEV-ORCH-002`](../../docs/decision-log/DL-DEV-ORCH-002.md) |
| **Sprint** | [`SPRINT-DEV-ORCH-002`](../../sprints/SPRINT-DEV-ORCH-002.md) |
| **Runbook** | [`DEV-ORCH-RUNBOOK`](../../docs/DEV-ORCH-RUNBOOK.md) |
| **Plan** | [`PHASE2-IMPLEMENTATION-PLAN`](../../docs/dev-orch/PHASE2-IMPLEMENTATION-PLAN.md) |

## Architecture rule

```text
Development Harness builds DYOGAS.   ← this package
Execution Harness runs DYOGAS.       ← Runtime / SDK / Execution Host (out of scope)
```

## CLI

```bash
npm run dev-orch -- status --registry ../../tasks/TASK-REGISTRY-DEV-ORCH-002.md
npm run dev-orch -- plan --registry ../../tasks/TASK-REGISTRY-DEV-ORCH-002.md
npm run dev-orch -- run --registry ../../tasks/TASK-REGISTRY-DEV-ORCH-002.md --dry-run
npm run dev-orch -- run --registry ../../tasks/TASK-REGISTRY-DEV-ORCH-002.md --apply --to IN_PROGRESS
```

| Command | Effect |
|---------|--------|
| `status` | Show registry / task state (read-only) |
| `plan` | Parser + planner → next READY task (no writes) |
| `run --dry-run` | Preview package + gate + writer (default; no writes) |
| `run --apply` | Writer-only allowlisted registry update |

Does **not** invoke coding agents, LLMs, Runtime, SDK, or Execution Host.

## Scripts

```bash
npm ci
npm test
npm run build
```

## Forbidden dependencies

Must **not** depend on:

- `@dyogas/runtime`
- `@dyogas/agent-sdk`
- `@dyogas/execution-host`
- product pipeline packages

Allowed: Node built-ins (`node:*`), relative imports only.

## Precedent

Lives under `tools/` alongside [`tools/schema-ci`](../schema-ci/) — engineering tooling, not a Platform Module package tree.
