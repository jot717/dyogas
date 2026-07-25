# A4 — ResearchBrief Schema Gap Register

**Task:** T-A4  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`)  
**Depends on:** T-A2, T-A3  
**Mode:** Implementation Mode (gap register only)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Register **unresolved** ResearchBrief / bootstrap questions from T-A1–T-A3.

**This document does not** invent fields, create schemas, modify contracts, or resolve architecture without approval.

---

## 1. Known fields (confirmed — no invention)

Sources: `pipelines/knowledge-ingestion.md`; `contracts/agents/research-agent.md` §6; `schemas/agents/research-agent.schema.json` `input`; Host `CreateRunRequest` (`execution-host/src/api.ts`).

| Field | Where defined | Required |
|-------|---------------|----------|
| `question` | Research Agent input / Brief | Yes |
| `scope` | Research Agent input / Brief | Yes |
| `constraints` | Research Agent input | No (object) |
| `allowed_source_classes` | Research Agent input (`youtube`\|`github`\|`reddit`\|`web`) | Yes |
| `budget` | `{ max_items` (req), `max_seconds`? `}` | Yes |
| `run_id` | Research Agent input | Yes |
| `tenancy.tenant_id` | Research Agent input | Yes |
| `tenancy.workspace_id` | Research Agent input | Optional (contract); **product-required** for Bridge (A3) |
| Host `pipeline_id` / `pipeline_version` | CreateRunRequest | Yes (Host) |
| Host `tenant_id` | CreateRunRequest | Yes — must match Brief tenancy |
| Host `caller_id` | CreateRunRequest | Yes — owner attribution |
| Host `correlation_id` | CreateRunRequest | Yes |
| Host `bootstrap` | Opaque Record (Brief-shaped) | Yes |

---

## 2. Confirmed ownership

| Concern | Owner (existing) | Notes |
|---------|------------------|-------|
| Per-agent Brief **input** shape | Research Agent contract + `research-agent.schema.json` | SoR for Stage 1 input |
| Pipeline Brief prose | `pipelines/knowledge-ingestion.md` | Bootstrap definition |
| Host bootstrap transport | SPEC-EXECUTION-HOST-001 / `@dyogas/execution-host` | `Record` — no new Brief schema |
| Product Research Request fields | SPEC-PROD-004 + A1 | Product-side only |
| Tenancy primitives | Kernel (`createTenantId`, …) | Consume; no Kernel change |
| Personal boundary tenant+owner | ADR-0009 | Consume |
| Human Approval actor | Harness §9 / Host `HumanDecision` | Not redesigned here |

---

## 3. Existing contracts / specs referenced

- `contracts/agents/research-agent.md`  
- `schemas/agents/research-agent.schema.json`  
- `pipelines/knowledge-ingestion.md`  
- SPEC-PROD-004-HARNESS-BRIDGE  
- SPEC-EXECUTION-HOST-001 / ADR-0010  
- ADR-0009  
- Kernel API + `child-scope-nongoal.md`  
- A1, A2, A3 stage docs  

---

## 4. Gap register

| Gap ID | Unknown / unresolved | Deferred decision | Future owner / action | Approval needed? |
|--------|----------------------|-------------------|----------------------|------------------|
| **GAP-BR-001** | No `/artifacts/research-brief.md` and no dedicated Brief JSON Schema under `/schemas/artifacts` | Keep Brief as pipeline prose + Research Agent **input** schema only, **or** later Spec to add artifact/schema | Architecture / Spec Author | **Yes** — Spec (+ ADR if shared schema topology) before any new schema file |
| **GAP-BR-002** | Default `scope` when product `scope_hints` omitted | Product-config default string vs fail-closed | Product Owner (Personal Brain) | Product Decision Log or Spec amendment if defaults become normative |
| **GAP-BR-003** | Default `allowed_source_classes` when omitted on Request | Product default allowlist vs fail-closed | Product Owner + policy/Trust (egress) | Product decision; Trust if policy-bound |
| **GAP-BR-004** | Default `budget` when `budget_placeholder` missing/invalid | Product-configured `{max_items}` vs fail-closed | Product Owner | Product decision — **no** Host budget API invention |
| **GAP-BR-005** | When/how `run_id` is written onto bootstrap vs only Host run context | Confirm in Band B Host investigation | Tech Lead (T-B*) | None if Host behavior already sufficient; Spec only if contract input unmet |
| **GAP-BR-006** | Exact product function `workspace_id` → Kernel `TenantId` (no child-scope API) | Persist/map tenant per workspace in **product** storage using Kernel `createTenantId` only | Personal Brain implementer | None for consume-only map; **Yes** if Kernel child-scope wanted (contradicts deferred non-goal → ADR) |
| **GAP-BR-007** | Whether `correlation_id` may appear inside `bootstrap` Record or Host field only | Prefer Host `correlation_id`; bootstrap echo optional only if Host accepts opaque Record | Tech Lead (Band B) | None unless schema const added (**forbidden** without Spec) |
| **GAP-BR-008** | Product `notes` have no Brief home (`additionalProperties: false` on agent input) | Keep notes product-local only | Product Owner | None |
| **GAP-BR-009** | IdP / proof that `caller_id` / Human `actor_id` is the workspace owner | Remains GAP-EH-002 class — product IdP | Product + Trust | **Yes** for production auth; not schema |
| **GAP-BR-010** | Wire `contract_version` vs markdown Contract Version | Already governed by contracts README §4 — **not a Brief gap**; do not bump schema here | — | ADR + Decision Log if wire bump ever needed |

**Supersessions:** A2’s GAP-A2-05 (owner→tenant/caller mapping rules) is **documented** in A3; residual is **GAP-BR-006** (concrete workspace→tenant persistence), not a new Brief field.

---

## 5. Deferred decisions (summary)

1. Whether ResearchBrief ever becomes a first-class `/artifacts` + `/schemas/artifacts` type (**GAP-BR-001**).  
2. Product defaults vs fail-closed for scope / sources / budget (**GAP-BR-002…004**).  
3. `run_id` stamping relative to createRun (**GAP-BR-005** → Band B).  
4. Workspace→tenant persistence without Kernel child-scope (**GAP-BR-006**).  
5. Production owner identity proof (**GAP-BR-009**).

---

## 6. Required future approval points

| Change sought | Gate |
|---------------|------|
| New Brief artifact file or JSON Schema | New/amended Spec + Architecture Review; **ADR** if shared contract/schema topology |
| New Brief fields / `additionalProperties` | Research Agent contract + schema change → Decision Log; ADR if material |
| Kernel workspace/child-scope API | ADR (reverses deferred non-goal) |
| Runtime / SDK / Harness / Host rewrite | Out of SPEC-PROD-004; separate authorization |
| Resolve GAP-BR-002…004 as binding product law | Product Decision Log or SPEC-PROD-004 amendment |

**Until approved: fail closed or leave gaps open — do not invent.**

---

## 7. Verification

### Acceptance Criteria

| # | Criterion | Met? |
|---|-----------|------|
| 1 | Gap list empty **or** each gap has escalation note | **Yes** — GAP-BR-001…010 |
| 2 | Zero new schema files created | **Yes** |

### Tests (doc)

| ID | Check | Result |
|----|-------|--------|
| T-A4-T1 | All A2 deferred gaps represented or superseded | **PASS** |
| T-A4-T2 | No speculative field designs added | **PASS** |
| T-A4-T3 | Future owner/action per gap | **PASS** |
| T-A4-T4 | Approval points listed | **PASS** |

### Scope boundary

In: gap register only. Out: schemas, contracts, Runtime, SDK, Harness, invented fields, unapproved architecture resolution.

---

## Evidence

`personal-brain/stage/bridge/A4-brief-schema-gaps.md` (this file)

---

## Band A complete

T-A1…T-A4 **DONE**. Next per registry order / parallel: **T-B1** or **T-C1**.

---

**End of A4-brief-schema-gaps**
