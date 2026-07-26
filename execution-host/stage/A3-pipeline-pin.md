# T-A3 — MVP Pipeline Pin

**Sprint:** SPRINT-EXECUTION-HOST-001  
**Task:** T-A3  
**Trace:** TRACE-EXEC-HOST-001  
**Refs:** `/pipelines/knowledge-ingestion.md` · SPEC-EXECUTION-HOST-001

---

## Pin statement

| Field | MVP value |
|-------|-----------|
| `pipeline_id` | `knowledge-ingestion` **only** |
| `pipeline_version` | Pin at CREATE from pipeline doc (**2.0.0** as declared in `/pipelines/knowledge-ingestion.md`) |
| Topology source | Existing `/pipelines/knowledge-ingestion.md` — Host **loads**, does not invent |
| Personal / parallel topology | **Forbidden** in this sprint |

Canonical stage order (from pipeline doc — loader Group C must not diverge):

```text
Research → Validation → Proposal → Human Review → Markdown → Graph → Embedding → Memory
```

---

## Fail-closed rules (design; enforced in Group C)

| Condition | Expected typed reject reason (design codes) |
|-----------|-----------------------------------------------|
| Unknown `pipeline_id` | `PIPELINE_UNKNOWN` |
| Unsupported id (not MVP-allowed) | `PIPELINE_UNSUPPORTED` |
| Missing `pipeline_version` at CREATE | `PIPELINE_VERSION_REQUIRED` |
| Version mismatch vs pinned definition | `PIPELINE_VERSION_MISMATCH` |
| Attempt to mutate pin after CREATE | `PIPELINE_PIN_IMMUTABLE` |

Tests for these codes: T-C3 / T-J2 (not Phase 1).

**End of T-A3**
