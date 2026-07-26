# Decision

**ID:** DL-RESEARCH-AGENT-EGRESS-001  
**Date:** 2026-07-26  
**Owner:** Founder (business authority)  
**Mode:** Development Harness — Implementation Mode (Band B)  
**Status:** **APPROVED**  
**Decision:** **APPROVED** — Architecture Review APPROVE · ADR-0011 **Accepted** · Band B RA-05 / RA-07 authorized  
**Approved:** 2026-07-26  
**Implementation authorization:** **YES** (RA-05, RA-07 only)  
**Network / egress authorization:** **YES** — scoped Stage-1 allow-path per ADR-0011 via MOD-TRUST only  
**Architecture Review:** [`ARCH-RESEARCH-AGENT-EGRESS-001`](../architecture-reviews/ARCH-RESEARCH-AGENT-EGRESS-001.md) — **APPROVE**  
**ADR:** [`ADR-0011`](../adr/0011-research-agent-stage1-egress-allow-path.md) — **Accepted**  
**Trace:** `TRACE-RESEARCH-AGENT-EGRESS-001`  
**Predecessor:** [`DL-RESEARCH-AGENT-MVP-001`](./DL-RESEARCH-AGENT-MVP-001.md) **APPROVED** · Band A **COMPLETE**  
**Sprint:** [`SPRINT-RESEARCH-AGENT-MVP-001`](../../sprints/SPRINT-RESEARCH-AGENT-MVP-001.md)  
**Execution package:** [`docs/dev-orch/execution-packages/RA-EGRESS-PREP-01.json`](../dev-orch/execution-packages/RA-EGRESS-PREP-01.json)  
**Entry:** [`engineering/START_DEVELOPMENT.md`](../../engineering/START_DEVELOPMENT.md)

---

## Subject

Authorize Band B Research Agent live Stage-1 collection (`web` / `github` / `reddit`) under
Accepted ADR-0011, removing the ADR-0002 deny-default blocker for RA-05 and RA-07 only.

## Scope authorization

| Path | Authorization |
|------|----------------|
| `research/src/**` | Coding Agent write — YES |
| `research/tests/**` | Coding Agent write — YES |
| `docs/research-agent/**` | Coding Agent write — YES |
| `docs/eng-agent/production/**` | Evidence write — YES |
| `trust/src/egress/**` | Trust allow-rule for ADR-0011 predicates only — YES |
| `runtime/` · `sdk/` · `execution-host/` · Product layer | **NO** |
| New MOD / `agents/research-agent/` | **NO** |

## Bound decisions (E-1…E-4)

| # | Decision | Recorded |
|---|----------|----------|
| E-1 | Proceed with Band B | **APPROVED** |
| E-2 | Allowlist `web` + `github` + `reddit` | **Bound in ADR-0011** |
| E-3 | Stage-1 fetch via Trust only (no cloud LLM) | **Bound in ADR-0011** |
| E-4 | Rollback R1–R6 binding | **YES** |

## Implementation authorization

| Item | Authorized? |
|------|-------------|
| RA-05 live collectors + provenance/trust metadata | **Yes** |
| RA-07 live-source autonomous E2E | **Yes** |
| Runtime / SDK / Execution Host / Product redesign | **No** |

```text
APPROVED
  → RA-05 READY_FOR_EXECUTION
  → RA-07 READY_FOR_EXECUTION
```

## Related

| Item | Reference |
|------|-----------|
| Architecture Review | `docs/architecture-reviews/ARCH-RESEARCH-AGENT-EGRESS-001.md` |
| ADR-0011 | `docs/adr/0011-research-agent-stage1-egress-allow-path.md` **Accepted** |
| ADR-0002 | `docs/adr/0002-cloud-ai-egress-boundary.md` **Superseded by ADR-0011** (scoped) |
| Task Registry | `tasks/TASK-REGISTRY-RESEARCH-AGENT-MVP-001.md` |

---

**End of DL-RESEARCH-AGENT-EGRESS-001**
