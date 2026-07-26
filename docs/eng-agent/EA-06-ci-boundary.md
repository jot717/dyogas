# EA-06 Evidence — CI + boundary tests

**Task:** EA-06  
**Sprint:** SPRINT-ENG-AGENT-IMPLEMENTATION-001  
**Date:** 2026-07-26  
**Auth:** DL-ENG-AGENT-IMPLEMENTATION-001 **APPROVED**  
**Status:** **PASS**

---

## Acceptance Criteria

| AC | Result | Evidence |
|----|--------|----------|
| Forbidden imports rejected | **PASS** | boundary.test.ts |
| Forbidden write roots rejected | **PASS** | runtime/sdk/execution-host/product |
| Allowed writes accepted | **PASS** | docs/eng-agent, tasks, sprints, stage |
| CI job `eng-agent` present | **PASS** | `.github/workflows/ci.yml` |
| Path filters include `tools/eng-agent/**` | **PASS** | push + pull_request |
| Full suite | **PASS** | 28 tests pass |

## CI job

```yaml
eng-agent:
  runs-on: ubuntu-latest
  steps:
    - checkout
    - setup-node 22
    - npm ci   (tools/eng-agent)
    - npm test
    - npm run build
```

## Files

| Path | Role |
|------|------|
| `tools/eng-agent/tests/boundary.test.ts` | TR-6 |
| `.github/workflows/ci.yml` | eng-agent job + path filters |

---

**End of EA-06 evidence**
