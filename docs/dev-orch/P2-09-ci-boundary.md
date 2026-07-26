# P2-09 Evidence — CI + boundary tests

**Task:** P2-09  
**Sprint:** SPRINT-DEV-ORCH-002  
**Date:** 2026-07-25  
**Auth:** DL-DEV-ORCH-002  
**Status:** **PASS**

---

## Acceptance Criteria

| AC | Result | Evidence |
|----|--------|----------|
| Boundary forbids platform package imports | **PASS** | runtime / agent-sdk / execution-host / research-engine / @dyogas/* |
| Boundary forbids product path imports | **PASS** | personal-brain, research, knowledge, … |
| Forbidden FS writes rejected | **PASS** | runtime/src, sdk/src, execution-host/src, products |
| Allowed FS writes accepted | **PASS** | tasks/, docs/dev-orch/, sprints/, …/stage/… |
| CI job `dev-orch` present | **PASS** | `.github/workflows/ci.yml` |
| Path filters include `tools/dev-orch/**` | **PASS** | push + pull_request |
| Full suite regression | **PASS** | 63 tests pass; P2-01…P2-08 preserved |

## CI job

```yaml
dev-orch:
  runs-on: ubuntu-latest
  steps:
    - checkout
    - setup-node 22
    - npm ci   (tools/dev-orch)
    - npm test
    - npm run build
```

## Tests executed

```text
npm test
tests 63 · pass 63 · fail 0
(boundary: 5)

npm run build — OK
```

## Files

| Path | Role |
|------|------|
| `tools/dev-orch/tests/boundary.test.ts` | Import + write boundary |
| `tools/dev-orch/src/writer/allowlist.ts` | Allow/forbid write roots |
| `tools/dev-orch/src/writer/types.ts` | Re-exports |
| `tools/dev-orch/src/writer/update.ts` | Uses shared allowlist |
| `.github/workflows/ci.yml` | `dev-orch` job + path filters |

## Out of scope

Coding Agent · LLM · Runtime/SDK/Host changes · Sprint exit (P2-10)

## GAPs

None registered.

---

**End of P2-09 evidence**
