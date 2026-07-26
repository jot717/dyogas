# P2-08 Evidence — CLI dry-run / apply

**Task:** P2-08  
**Sprint:** SPRINT-DEV-ORCH-002  
**Date:** 2026-07-25  
**Auth:** DL-DEV-ORCH-002  
**Status:** **PASS**

---

## Acceptance Criteria

| AC | Result | Evidence |
|----|--------|----------|
| CLI status | **PASS** | read-only registry summary |
| plan selects READY | **PASS** | C-1 selected; no writes |
| dry-run no writes | **PASS** | default + `--dry-run` |
| apply uses writer only | **PASS** | `via: applyRegistryUpdate` |
| forbidden paths rejected | **PASS** | `runtime/` write-path STOP |
| no invented DONE PASS | **PASS** | DONE apply refused |

## Commands

| Command | Mutation |
|---------|----------|
| `status` | none |
| `plan` | none |
| `run` / `run --dry-run` | none |
| `run --apply --to IN_PROGRESS` | allowlisted registry via writer |

## Tests executed

```text
npm test
tests 60 · pass 60 · fail 0
(cli: 7 new)

npm run build — OK
```

## Files

| Path | Role |
|------|------|
| `tools/dev-orch/src/cli/args.ts` | Arg parsing + usage |
| `tools/dev-orch/src/cli/commands.ts` | status / plan / dry-run / apply |
| `tools/dev-orch/src/cli/main.ts` | Entrypoint |
| `tools/dev-orch/tests/cli.test.ts` | Tests |
| `tools/dev-orch/package.json` | `bin` + `dev-orch` script |
| `tools/dev-orch/README.md` | CLI docs |

## Out of scope

CI (P2-09) · Sprint exit (P2-10) · coding agent / LLM

## GAPs

None registered.

---

**End of P2-08 evidence**
