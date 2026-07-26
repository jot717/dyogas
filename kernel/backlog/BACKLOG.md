# MOD-KERNEL Single Backlog

**Module:** MOD-KERNEL  
**SPEC:** SPEC-RT-001 (ACCEPTED)  
**Trace:** TRACE-KERNEL-001  
**Architecture Review:** `adr_required` → ADR-0001 (**Accepted** 2026-07-23)  
**Backlog SoR:** this file (`kernel/backlog/BACKLOG.md`)  
**Status:** DELIVERED — MOD-KERNEL Module Complete 2026-07-23  
**Build Order:** B5  

**Global Implementation Gate:** ADR-0001 **Accepted**. Kernel MVP shipped as `@dyogas/kernel@0.1.0`.

**Pain / Metrics (all `feature`/`security` code items inherit):**  
SPEC-RT-001 · Success metrics: 100% tenancy isolation tests; zero Harness/orchestration imports; Runtime can link Kernel APIs · Security: deny-by-default tenancy; no secrets in repo; Kernel performs no egress.

**Complexity scale:** XS < S < M ≤ one sprint · **L/XL forbidden** in this backlog (none present).

---

## Traceability Rule

Every `BL-K-*` traces **only** to **SPEC-RT-001** (`SpecRef` column). No orphans. No items outside SPEC goals/non-goals/success metrics/security.

---

## Epic Index

| Epic ID | Title | Spec Mapping |
|---------|-------|--------------|
| EPIC-K-00 | Kernel Foundation & ADR Gate | Enables Goals 1–3; ADR-0001; Non-goal stack lock |
| EPIC-K-01 | Tenancy Context | Goal 1 tenancy; Success metric isolation; Security deny-by-default |
| EPIC-K-02 | Identity Generation | Goal 1 id generation |
| EPIC-K-03 | Clock / Time | Goal 1 clock |
| EPIC-K-04 | Configuration Loading | Goal 1 config; Security no secret leak |
| EPIC-K-05 | Structured Log Fields | Goal 1 log fields; Security no secret-in-logs |
| EPIC-K-06 | Boundaries, Export & MVP Proof | Goals 2–3; Success metrics boundary + linkability; no egress |

---

## EPIC-K-00 — Kernel Foundation & ADR Gate

### Feature F-K-00.1 — ADR-0001 Acceptance Path

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-001 | EPIC-K-00 | F-K-00.1 | docs | P0 | S | S-K0 | ready | no | SPEC-RT-001, Arch Review | SPEC-RT-001 | ADR-0001 body lists concrete language, package layout, test runner, and schema-validation CI approach; Engineering Agent chain + Founder business approval set ADR Status=`Accepted`; Decision Log entry cites ADR-0001 |
| BL-K-002 | EPIC-K-00 | F-K-00.1 | chore | P0 | XS | S-K0 | ready | BL-K-001 | BL-K-001 | SPEC-RT-001 | `MODULE_STATUS.md` shows Implementation unblocked for ADR; backlog DoR column for code items may flip from `blocked_adr` → `ready` when their other deps are met |

### Feature F-K-00.2 — Module Scaffold

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-003 | EPIC-K-00 | F-K-00.2 | chore | P0 | S | S-K1 | blocked_adr | ADR-0001 | BL-K-001 | SPEC-RT-001 | Package layout matches ADR-0001; README states non-goals (no Harness/orchestration/pipelines/agent-bind); documents empty public API placeholder; states Kernel must not import those packages |
| BL-K-004 | EPIC-K-00 | F-K-00.2 | chore | P0 | S | S-K1 | blocked_adr | ADR-0001 | BL-K-001, BL-K-003 | SPEC-RT-001 | Test runner from ADR-0001 boots; exactly one smoke test passes in CI/local |

---

## EPIC-K-01 — Tenancy Context

### Feature F-K-01.1 — Tenancy Model

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-010 | EPIC-K-01 | F-K-01.1 | feature | P0 | M | S-K1 | blocked_adr | ADR-0001 | BL-K-003 | SPEC-RT-001 | `TenantId` type + tenancy context type exist; required fields documented; empty/invalid tenant construct fails with testable error |
| BL-K-011 | EPIC-K-01 | F-K-01.1 | feature | P0 | M | S-K2 | blocked_adr | ADR-0001 | BL-K-010 | SPEC-RT-001 | propagate/clear APIs; tenant-scoped operation with absent context denies by default (automated test) |

### Feature F-K-01.2 — Tenancy Isolation & Adversarial Tests

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-013 | EPIC-K-01 | F-K-01.2 | feature | P0 | M | S-K2 | blocked_adr | ADR-0001 | BL-K-011 | SPEC-RT-001 | Automated suite demonstrates cross-tenant access failure rate = 100% for declared tenant-scoped ops (SPEC success metric) |
| BL-K-014 | EPIC-K-01 | F-K-01.2 | security | P0 | S | S-K2 | blocked_adr | ADR-0001 | BL-K-011 | SPEC-RT-001 | Tests cover forged tenant swap, missing context, and context reuse across tenants — each must deny |

### Feature F-K-01.3 — Child Scope Decision (explicit)

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-012 | EPIC-K-01 | F-K-01.3 | docs | P2 | XS | S-K3 | blocked_adr | ADR-0001 | BL-K-010 | SPEC-RT-001 | Ship either (a) workspace/child-scope API with tests **or** (b) a SPEC-aligned non-goal doc stating child scope is deferred — not both ambiguous |

---

## EPIC-K-02 — Identity Generation

### Feature F-K-02.1 — ID Primitives

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-020 | EPIC-K-02 | F-K-02.1 | feature | P0 | S | S-K1 | blocked_adr | ADR-0001 | BL-K-003 | SPEC-RT-001 | Unique id API; no collisions in 10k generated ids in one process (test); injectable entropy/clock seam for tests |
| BL-K-021 | EPIC-K-02 | F-K-02.1 | feature | P1 | S | S-K2 | blocked_adr | ADR-0001 | BL-K-020 | SPEC-RT-001 | Correlation/run id helper returns opaque id; Kernel does not emit audit events |
| BL-K-022 | EPIC-K-02 | F-K-02.1 | feature | P1 | XS | S-K2 | blocked_adr | ADR-0001 | BL-K-020 | SPEC-RT-001 | Unit test: generated ids contain no `@`, no email-shaped substrings, no raw tenant string as prefix unless hashed/opaque per ADR |

---

## EPIC-K-03 — Clock / Time

### Feature F-K-03.1 — Clock Abstraction

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-030 | EPIC-K-03 | F-K-03.1 | feature | P0 | S | S-K2 | blocked_adr | ADR-0001 | BL-K-003 | SPEC-RT-001 | Clock API returns UTC; system implementation matches wall clock within test tolerance |
| BL-K-031 | EPIC-K-03 | F-K-03.1 | feature | P0 | S | S-K2 | blocked_adr | ADR-0001 | BL-K-030 | SPEC-RT-001 | Fake/fixed clock available; one test asserts deterministic time under fake clock |
| BL-K-032 | EPIC-K-03 | F-K-03.1 | docs | P2 | XS | S-K3 | blocked_adr | ADR-0001 | BL-K-030 | SPEC-RT-001 | Doc states when to use wall vs monotonic time for Runtime consumers (no code change required) |

---

## EPIC-K-04 — Configuration Loading

### Feature F-K-04.1 — Config Load

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-040 | EPIC-K-04 | F-K-04.1 | feature | P0 | M | S-K2 | blocked_adr | ADR-0001 | BL-K-003 | SPEC-RT-001 | Loads from ADR-approved source; missing required key → fail-closed error (test) |
| BL-K-041 | EPIC-K-04 | F-K-04.1 | feature | P0 | S | S-K3 | blocked_adr | ADR-0001 | BL-K-040 | SPEC-RT-001 | Typed getters; unknown-key policy documented and tested (ignore **or** reject — one policy only) |
| BL-K-042 | EPIC-K-04 | F-K-04.1 | security | P0 | S | S-K3 | blocked_adr | ADR-0001 | BL-K-040 | SPEC-RT-001 | Config debug/dump redacts keys matching secret patterns; test asserts raw secret value absent from dump string |

### Feature F-K-04.2 — Tenancy Config Overlay Decision

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-043 | EPIC-K-04 | F-K-04.2 | docs | P2 | XS | S-K3 | blocked_adr | ADR-0001 | BL-K-040 | SPEC-RT-001 | Either implement tenancy-aware overlay with tests **or** publish deferred non-goal doc — binary choice recorded in MODULE_STATUS |

---

## EPIC-K-05 — Structured Log Fields

### Feature F-K-05.1 — Log Field Contract

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-050 | EPIC-K-05 | F-K-05.1 | feature | P0 | S | S-K3 | blocked_adr | ADR-0001 | BL-K-010, BL-K-020 | SPEC-RT-001 | Field builder includes `tenant_id` when context present, `correlation_id`, `module=kernel` (asserted in test) |
| BL-K-051 | EPIC-K-05 | F-K-05.1 | feature | P0 | S | S-K3 | blocked_adr | ADR-0001 | BL-K-050 | SPEC-RT-001 | Attach-fields helper works with ADR-0001 logging approach; no second logging framework introduced |
| BL-K-052 | EPIC-K-05 | F-K-05.1 | security | P1 | S | S-K3 | blocked_adr | ADR-0001 | BL-K-051 | Test: secret-like value passed into fields is redacted or rejected |

---

## EPIC-K-06 — Boundaries, Export & MVP Proof

### Feature F-K-06.1 — Package Boundary & No-Egress

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-060 | EPIC-K-06 | F-K-06.1 | feature | P0 | M | S-K2 | blocked_adr | ADR-0001 | BL-K-003 | SPEC-RT-001 | Automated boundary test fails CI if Kernel imports harness/pipelines/contracts agent-runtime packages (SPEC success metric) |
| BL-K-061 | EPIC-K-06 | F-K-06.1 | chore | P1 | XS | S-K2 | blocked_adr | ADR-0001 | BL-K-060 | SPEC-RT-001 | CI runs BL-K-060 test on Kernel path changes |
| BL-K-015 | EPIC-K-06 | F-K-06.1 | security | P0 | S | S-K2 | blocked_adr | ADR-0001 | BL-K-003 | SPEC-RT-001 | Documented + tested: Kernel public API exposes no network/egress client; repo scan/chore checklist ensures no secrets committed under `kernel/` |

### Feature F-K-06.2 — Public Export & Downstream Readiness

| ID | Epic | Feature | Type | Pri | Cx | Sprint | DoR | Blocked | Dependencies | SpecRef | Acceptance Criteria |
|----|------|---------|------|-----|----|--------|-----|---------|--------------|---------|---------------------|
| BL-K-062 | EPIC-K-06 | F-K-06.2 | feature | P0 | M | S-K3 | blocked_adr | ADR-0001 | BL-K-011, BL-K-020, BL-K-030, BL-K-040, BL-K-050 | SPEC-RT-001 | Versioned public export lists tenancy, id, clock, config, log-field APIs; Trust/Runtime can import without reaching internals |
| BL-K-063 | EPIC-K-06 | F-K-06.2 | feature | P0 | S | S-K3 | blocked_adr | ADR-0001 | BL-K-062 | SPEC-RT-001 | Fixture consumer package compiles/links against public export (SPEC “Runtime can link” proxy) |
| BL-K-064 | EPIC-K-06 | F-K-06.2 | docs | P1 | S | S-K3 | blocked_adr | ADR-0001 | BL-K-062 | SPEC-RT-001 | API overview links SPEC-RT-001 goals, non-goals, and three success metrics |
| BL-K-065 | EPIC-K-06 | F-K-06.2 | chore | P0 | M | S-K3 | blocked_adr | ADR-0001 | BL-K-013, BL-K-060, BL-K-063 | SPEC-RT-001 | Single MVP verification command/CI job runs isolation + boundary + consumer-link suites green |

---

## Priority Order (Single Backlog Rank)

| Rank | ID | Rationale |
|------|-----|-----------|
| 1 | BL-K-001 | ADR unlocks all code |
| 2 | BL-K-002 | Gate hygiene |
| 3 | BL-K-003 | Scaffold |
| 4 | BL-K-004 | Test harness |
| 5 | BL-K-010 | Tenancy types |
| 6 | BL-K-020 | Ids (parallelizable after scaffold) |
| 7 | BL-K-011 | Tenancy propagate/deny |
| 8 | BL-K-030 | Clock |
| 9 | BL-K-031 | Fake clock |
| 10 | BL-K-013 | Isolation metric |
| 11 | BL-K-014 | Adversarial tenancy |
| 12 | BL-K-015 | No egress / no secrets-in-tree |
| 13 | BL-K-040 | Config load |
| 14 | BL-K-060 | Package boundary metric |
| 15 | BL-K-061 | CI boundary |
| 16 | BL-K-021 | Correlation id |
| 17 | BL-K-022 | Opaque id policy |
| 18 | BL-K-041 | Config getters |
| 19 | BL-K-042 | Config redact |
| 20 | BL-K-050 | Log fields |
| 21 | BL-K-051 | Log attach helper |
| 22 | BL-K-052 | Log secret tests |
| 23 | BL-K-062 | Public export |
| 24 | BL-K-063 | Consumer link smoke |
| 25 | BL-K-065 | MVP DoD bundle |
| 26 | BL-K-064 | API docs |
| 27 | BL-K-012 | Child-scope decision |
| 28 | BL-K-043 | Tenancy config decision |
| 29 | BL-K-032 | Clock guidance docs |

---

## Suggested Sprints (rebalanced)

| Sprint | Goal | Items | Notes |
|--------|------|-------|-------|
| S-K0 | ADR unlock | BL-K-001, BL-K-002 | Only `DoR=ready` items today |
| S-K1 | Scaffold + tenancy types + ids | BL-K-003, BL-K-004, BL-K-010, BL-K-020 | After ADR Accepted; ≤1 M + scaffold |
| S-K2 | Tenancy harden + clock + config core + boundary | BL-K-011, BL-K-013, BL-K-014, BL-K-015, BL-K-030, BL-K-031, BL-K-040, BL-K-060, BL-K-061, BL-K-021, BL-K-022 | Split across capacity; pull subset if sprint capacity thin |
| S-K3 | Config polish + logs + export + MVP proof | BL-K-041, BL-K-042, BL-K-050–052, BL-K-062–065, BL-K-012, BL-K-043, BL-K-032 | Closes SPEC success metrics |

**Sprint Planning rule:** Commit only items with `DoR=ready` (requires ADR-0001 Accepted for all `blocked_adr` rows). Prefer ≤8 items or ≤2×M per sprint.

---

## DoR Matrix

| DoR value | Meaning |
|-----------|---------|
| `ready` | May be Sprint-committed now |
| `blocked_adr` | Spec/Arch/estimate OK; **not** Sprint-ready for Implementation until ADR-0001 Accepted **and** listed deps complete |

Per-item DoR: see tables. **Full Definition of Ready for code sprints is not satisfied until ADR-0001 is Accepted** (Architecture Review gate). S-K0 is DoR-ready now.

---

## Audit Log (2026-07-22)

| Criterion | Result | Fix applied |
|-----------|--------|-------------|
| 1 Trace to SPEC-RT-001 | PASS | `SpecRef` column on every item |
| 2 No duplicates | FIXED | Removed BL-K-005 (folded into BL-K-003 AC) |
| 3 No missing requirements | FIXED | Added BL-K-015 (no egress / no secrets-in-tree) |
| 4 Epic decomposition | PASS | Epics map 1:1 to SPEC goals |
| 5 Feature decomposition | FIXED | Soft “or defer” features split to docs decisions F-K-01.3 / F-K-04.2 |
| 6 Independently implementable | PASS | Each BL is a single vertical; integration only BL-K-065 |
| 7 Item ≤ one sprint | PASS | Max complexity M; no L/XL |
| 8 Dependencies correct | FIXED | Explicit `blocked_adr`; removed ambiguous dual-deps |
| 9 Sprint allocation reasonable | FIXED | Rebalanced S-K1–S-K3; capacity rule noted |
| 10 Complexity consistent | PASS | XS/S/M only; M reserved for multi-API or suites |
| 11 AC testable | FIXED | Removed vague “or” without deliverable; binary ACs |
| 12 DoR satisfied | FIXED | Per-item DoR; S-K0 ready; code items `blocked_adr` until ADR |
| 13 No arch violations | PASS | No Harness/SoR/egress product work |
| 14 No hidden impl | FIXED | Soft options → explicit docs items |
| 15 No circular deps | PASS | DAG only |

---

## Engineering Agent Approval (Backlog · post-audit)

| Agent | Verdict | Artifact |
|-------|---------|----------|
| Product Owner Agent | approve | `kernel/stage/reviews/backlog-audit-product-owner-agent.md` |
| Chief Architect Agent | approve | `kernel/stage/reviews/backlog-audit-chief-architect-agent.md` |
| Tech Lead Agent | approve | `kernel/stage/reviews/backlog-audit-tech-lead-agent.md` |
| Engineering Manager Agent | approve | `kernel/stage/reviews/backlog-audit-engineering-manager-agent.md` |
| Architecture Reviewer Agent | approve | `kernel/stage/reviews/backlog-audit-architecture-reviewer-agent.md` |
| Founder Approval (business) | GRANTED — 2026-07-22 (auditor command auto-fix) | — |

**Backlog Stage Status:** COMPLETE (audit-cleaned)  
**Ready for Sprint Planning:** YES — for **S-K0** immediately; for **S-K1+** after ADR-0001 Accepted  
**Next Stage:** Sprint Planning
