# GAP Registry — Personal Brain Harness Bridge

**Registry ID:** GAP-REGISTRY-PB-HARNESS-BRIDGE-001  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`)  
**Created:** 2026-07-24  
**Last updated:** 2026-07-25 (SPRINT-PB-BRIDGE-CODING-001 COMPLETE PASS; GAP-BR-019 remains OPEN P0)
**Mode:** Implementation Mode — **register only** (do not fix gaps here)

---

## Purpose

Canonical register of gaps, deferred decisions, unknowns, missing contracts, and future improvements discovered in Bridge evidence **A1–B3** (and maintained as later tasks complete).

**Rules:** Do not fix gaps in this document. Do not modify Runtime / SDK / Harness / Execution Host. Do not create architecture changes. Do not close a GAP without evidence.

---

## Sources reviewed

| Evidence | Task |
|----------|------|
| `A1-research-request-inputs.md` | T-A1 |
| `A2-request-to-researchbrief-map.md` | T-A2 |
| `A3-tenancy-owner-binding.md` | T-A3 |
| `A4-brief-schema-gaps.md` | T-A4 |
| `B1-host-createRun-inventory.md` | T-B1 |
| `B2-pipeline-pin-mechanism.md` | T-B2 |
| `B3-host-tenancy-audit-flow.md` | T-B3 |

Superseded local IDs (A2): GAP-A2-01…05 → mapped into GAP-BR-* below (see A4).

---

## Status legend

| Status | Meaning |
|--------|---------|
| **OPEN** | Unresolved; no closing evidence |
| **DEFERRED** | Explicitly postponed; decision later |
| **REFERENCED** | Owned by another module/gap register; Bridge tracks dependency only |
| **CLOSED** | Requires evidence path — none closed in this update |

---

## Gap records

### GAP-BR-001

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-001 |
| **Source Task** | T-A2 / T-A4 |
| **Description** | No `/artifacts/research-brief.md` and no dedicated Brief JSON Schema under `/schemas/artifacts`. Brief remains pipeline prose + Research Agent input schema only. |
| **Impact** | Product maps to opaque Host `bootstrap` Record; no first-class sealed Brief artifact. |
| **Severity** | Medium |
| **Owner Area** | Architecture / Spec Author |
| **Status** | **OPEN** |
| **Decision Required** | Keep as-is **or** later Spec (+ ADR if shared schema topology) before any new schema file. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-002

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-002 |
| **Source Task** | T-A2 / T-A4 |
| **Description** | Default `scope` when product `scope_hints` omitted — product-config default string vs fail-closed. |
| **Impact** | Mapping incomplete until product policy chosen. |
| **Severity** | Medium |
| **Owner Area** | Product Owner (Personal Brain) |
| **Status** | **OPEN** |
| **Decision Required** | Product Decision Log or SPEC-PROD-004 amendment if defaults become normative. |
| **Blocking Current Sprint?** | **NO** (design can proceed; coding path must fail closed or document default later) |

### GAP-BR-003

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-003 |
| **Source Task** | T-A2 / T-A4 |
| **Description** | Default `allowed_source_classes` when omitted on Research Request. |
| **Impact** | Brief required field may be unfilled without product allowlist policy. |
| **Severity** | Medium |
| **Owner Area** | Product Owner + policy/Trust (egress) |
| **Status** | **OPEN** |
| **Decision Required** | Product decision; Trust if policy-bound. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-004

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-004 |
| **Source Task** | T-A2 / T-A4 |
| **Description** | Default `budget` when `budget_placeholder` missing/invalid — product `{max_items}` vs fail-closed. |
| **Impact** | Cannot form valid Research Agent input without normalization rule. |
| **Severity** | Medium |
| **Owner Area** | Product Owner |
| **Status** | **OPEN** |
| **Decision Required** | Product decision — **no** Host budget API invention. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-005

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-005 |
| **Source Task** | T-A2 / T-A4 (Band B follow-up) |
| **Description** | When/how `run_id` is written onto bootstrap vs only Host run context (`HostRun.run_id` from Runtime `ctx.runId`). |
| **Impact** | Research Agent input requires `run_id`; timing relative to createRun still product/Host composition concern. |
| **Severity** | Medium |
| **Owner Area** | Tech Lead (T-B* / entry contract) |
| **Status** | **OPEN** |
| **Decision Required** | Confirm Host behavior sufficient for Bridge coding; Spec only if contract input unmet. |
| **Blocking Current Sprint?** | **NO** for design bands; may block wire-up tests until clarified in B4/B5/F* |

### GAP-BR-006

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-006 |
| **Source Task** | T-A3 / T-A4 |
| **Description** | Exact product function `workspace_id` → Kernel `TenantId` without Kernel child-scope API (deferred non-goal). |
| **Impact** | Product must persist/map tenant per workspace using existing Kernel APIs only. |
| **Severity** | High (for production multi-workspace) |
| **Owner Area** | Personal Brain implementer |
| **Status** | **OPEN** |
| **Decision Required** | None for consume-only map; **Yes** (ADR) if Kernel child-scope wanted. |
| **Blocking Current Sprint?** | **NO** (mapping rules documented in A3; persistence implementation later) |

### GAP-BR-007

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-007 |
| **Source Task** | T-A2 / T-A4 / T-B3 |
| **Description** | Whether `correlation_id` may appear inside `bootstrap` Record or Host field only. |
| **Impact** | Low if product always sets Host `correlation_id` (preferred per A4/B3). |
| **Severity** | Low |
| **Owner Area** | Tech Lead |
| **Status** | **OPEN** |
| **Decision Required** | Prefer Host `correlation_id`; no schema const for bootstrap echo (**forbidden** without Spec). |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-008

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-008 |
| **Source Task** | T-A2 / T-A4 |
| **Description** | Product `notes` have no Brief home (`additionalProperties: false` on Research Agent input). |
| **Impact** | Notes stay product-local; must not affect agent input. |
| **Severity** | Low |
| **Owner Area** | Product Owner |
| **Status** | **OPEN** (accepted disposition: product-local only — still tracked until Product Owner confirms) |
| **Decision Required** | Keep notes product-local only. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-009

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-009 |
| **Source Task** | T-A3 / T-A4 |
| **Description** | IdP / proof that `caller_id` / Human `actor_id` is the workspace owner (GAP-EH-002 class). |
| **Impact** | Production attribution incomplete without identity proof. |
| **Severity** | High (production) |
| **Owner Area** | Product + Trust |
| **Status** | **OPEN** |
| **Decision Required** | **Yes** for production auth; not a schema change. |
| **Blocking Current Sprint?** | **NO** (sprint design/consume-only; production auth out of scope) |

### GAP-BR-010

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-010 |
| **Source Task** | T-A4 |
| **Description** | Wire `contract_version` vs markdown Contract Version — governed by contracts README §4; not a Brief gap. |
| **Impact** | Do not bump schema in Bridge sprint. |
| **Severity** | Info |
| **Owner Area** | Contracts governance |
| **Status** | **OPEN** (monitoring / non-action for Bridge) |
| **Decision Required** | ADR + Decision Log if wire bump ever needed. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-011 (GAP-BR-CALLER-001)

| Field | Content |
|-------|---------|
| **GAP ID** | **GAP-BR-011** · alias **GAP-BR-CALLER-001** |
| **Source Task** | **T-B3** |
| **Description** | `caller_id` is **required** on `CreateRunRequest` but is **not** propagated into the Runtime `admitRun` primitive (AdmitRequest has no caller/actor field), and Host `createRun` does **not** stamp/store `caller_id` on `StoredRun` / executor deps today. Product must retain owner for `resumeHuman` / `HumanDecision.actor_id`. |
| **Impact** | Owner attribution at admit is Host-API-level only; Runtime audit admit event lacks caller; product-side retention required for Human Gate. |
| **Severity** | Medium |
| **Owner Area** | Execution Host (hardening) + Personal Brain (retain owner) — **no Host rewrite in this sprint** |
| **Status** | **OPEN** |
| **Decision Required** | Future Host Spec/Decision if Host must persist/emit caller on audit; until then product retains `caller_id`/`owner_id`. Do **not** invent auth model. |
| **Blocking Current Sprint?** | **NO** (documented workaround: product retains owner; Runtime has no caller field by design of primitive) |

### GAP-BR-012

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-012 |
| **Source Task** | T-B3 |
| **Description** | Host passes `req.tenant_id` into executor but does **not** assert `req.tenant_id === runtime.ctx.tenantId` after admit. Runtime tenancy comes from ambient Kernel `requireTenant()` + Trust identity, not from AdmitRequest. |
| **Impact** | Misalignment risk if product sets CreateRun `tenant_id` ≠ ambient Kernel/Trust tenant. |
| **Severity** | Medium |
| **Owner Area** | Product (align ambient context) · Host hardening (future assert) |
| **Status** | **OPEN** |
| **Decision Required** | Product fail-closed alignment now; Host assert only via future Spec — **do not patch Host in this sprint**. |
| **Blocking Current Sprint?** | **NO** (product obligation documented in A3/B3) |

### GAP-EH-001 (referenced)

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-EH-001 |
| **Source Task** | T-B1 (cite); owned by MOD-EXECUTION-HOST |
| **Description** | Human wait modeled at Host layer (`waiting_human`); Runtime MVP RunState may lack WAITING_HUMAN — do not fork Runtime. |
| **Impact** | Product observes Host status overlay, not Runtime WAITING_HUMAN. |
| **Severity** | Medium (platform) |
| **Owner Area** | Execution Host / Runtime (future) |
| **Status** | **REFERENCED** |
| **Decision Required** | Outside Bridge sprint authorization. |
| **Blocking Current Sprint?** | **NO** |

### GAP-EH-002 (referenced)

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-EH-002 |
| **Source Task** | T-A3 / T-A4 (cite); Host/product IdP class |
| **Description** | Identity provider / proof of human actor for gates (related to GAP-BR-009). |
| **Impact** | Production Human Approval attribution. |
| **Severity** | High (production) |
| **Owner Area** | Trust / Host / Product |
| **Status** | **REFERENCED** |
| **Decision Required** | Production auth Decision — out of Bridge sprint fix scope. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-013 (deferred non-goal)

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-013 |
| **Source Task** | T-A3 (Kernel child-scope); SPEC-PROD-004 Non-Goals |
| **Description** | Kernel nested workspace / child-scope API deferred (`kernel/docs/child-scope-nongoal.md`). Personal-scoped pipeline topology also future-only. |
| **Impact** | Bridge must not invent nested Kernel API or new pipeline topology. |
| **Severity** | Info / governance |
| **Owner Area** | Kernel / Architecture |
| **Status** | **DEFERRED** |
| **Decision Required** | ADR to reverse non-goal if ever in scope. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-014

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-014 |
| **Source Task** | **T-C3** |
| **Description** | Pipeline Stage 3 requires `PainStatement` as stage input (Constitution Art. XII / `knowledge-ingestion` prose), but there is **no** `/artifacts/pain-statement.md` (and no matching artifact schema found under `/schemas`). |
| **Impact** | Bridge/product must not invent PainStatement schema; consume pipeline/contract prose until Spec adds artifact SoT. |
| **Severity** | Low–Medium (Stage 3 input clarity) |
| **Owner Area** | Architecture / Spec Author (artifacts) |
| **Status** | **OPEN** |
| **Decision Required** | Later Spec (+ ADR if shared artifact topology) before creating artifact/schema files — **do not invent in Bridge sprint**. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-015

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-015 |
| **Source Task** | **T-C4** |
| **Description** | Exact Personal Brain Ask/index binding to Host-run pipeline `EmbeddingJob` / `MemoryUpdate` outcomes is unspecified relative to ADR-0009 (“Graph + local-hash Embedding remain MOD-GRAPH; Personal Brain only indexes”). Risk of dual-index confusion if product invents a second embedding/memory path. |
| **Impact** | Product must index without treating Memory/vectors as Knowledge SoR; join mechanics deferred. |
| **Severity** | Medium (product wiring) |
| **Owner Area** | Personal Brain + Architecture |
| **Status** | **OPEN** |
| **Decision Required** | Product Decision / later Spec — **do not** invent schemas or fork pipeline in this sprint. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-016

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-016 |
| **Source Task** | **T-D4** |
| **Description** | Product Gate surface must present sealed Proposal/package to the owner using existing Host lineage / artifact refs, but the exact consume-only fetch binding (artifact store access from Personal Brain) is not fully specified. Risk: inventing a parallel approval API or store. |
| **Impact** | Gate surface contract can proceed; product wiring of artifact fetch deferred. |
| **Severity** | Medium (product wiring) |
| **Owner Area** | Personal Brain + Architecture |
| **Status** | **OPEN** |
| **Decision Required** | Later product Spec/Decision — consume existing store/Host surfaces only; **do not** invent approval APIs in this sprint. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-017

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-017 |
| **Source Task** | **T-E2** |
| **Description** | Shared artifact envelope has no `correlation_id` or `pipeline_id`/`pipeline_version`. E1 LA-CORR-01 / LA-PIPE-01 require Host CreateRun + `HostRun.pin` / Host lineage join via `run_id`. |
| **Impact** | Product/verifier must not expect those fields on sealed envelopes alone. |
| **Severity** | Low–Medium |
| **Owner Area** | Architecture (envelope) / Bridge verifiers |
| **Status** | **OPEN** |
| **Decision Required** | Later Spec/ADR before adding envelope fields — **do not invent** now. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-018

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-018 |
| **Source Task** | **T-E2** |
| **Description** | Envelope `parents[]` is optional in `artifact-envelope.schema.json`, but E1 trusted-path assertions expect parent linkage. Empty parents weaken walkable lineage. |
| **Impact** | Bridge lineage PASS should treat missing parents as fail (Host/policy) without schema bump in this sprint. |
| **Severity** | Medium |
| **Owner Area** | Host emit policy / Architecture |
| **Status** | **OPEN** |
| **Decision Required** | Policy enforce vs future schema `required` — Spec/ADR if schema changes. |
| **Blocking Current Sprint?** | **NO** |

### GAP-BR-019

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-019 |
| **Source Task** | **C-04** (SPRINT-PB-BRIDGE-CODING-001) |
| **Description** | Execution Host stage executor binds the Research Agent contract (`bindStage`) then seals a **synthetic** artifact id into lineage kind `ResearchReport` without invoking research-engine skill handlers or returning a schema-valid ResearchReport **payload** via public Host API (`HostRun` exposes refs only). |
| **Impact** | Personal Brain can prove Host Stage 1 path + ResearchReport **lineage ref**, but cannot consume a real ResearchReport body without Host hardening (or forbidden product-side Runtime/SDK/research-engine orchestration). |
| **Priority** | **P0** — blocks real Stage-1 Research execution and canonical ResearchReport production |
| **Severity** | Critical for executable Bridge acceptance; Host createRun/lineage-only smoke remains available |
| **Owner Area** | Execution Host / Platform |
| **Status** | **OPEN** |
| **Planned Resolution** | `SPRINT-HOST-RESEARCH-INTEGRATION-001` (pending Founder approval): Host → existing Research Engine → schema-valid ResearchReport → existing Runtime seal/handoff → HostRun lineage. |
| **Decision Required** | Founder approval of the planned Host implementation sprint; **do not** implement in Personal Brain. |
| **Blocking Current Sprint?** | **YES** for real/schema-body ResearchReport acceptance; **NO** for lineage-only Host smoke |

---

## Index

| GAP ID | Status | Blocking sprint? |
|--------|--------|------------------|
| GAP-BR-001 | OPEN | NO |
| GAP-BR-002 | OPEN | NO |
| GAP-BR-003 | OPEN | NO |
| GAP-BR-004 | OPEN | NO |
| GAP-BR-005 | OPEN | NO |
| GAP-BR-006 | OPEN | NO |
| GAP-BR-007 | OPEN | NO |
| GAP-BR-008 | OPEN | NO |
| GAP-BR-009 | OPEN | NO |
| GAP-BR-010 | OPEN | NO |
| **GAP-BR-011 / GAP-BR-CALLER-001** | **OPEN** | **NO** |
| GAP-BR-012 | OPEN | NO |
| GAP-EH-001 | REFERENCED | NO |
| GAP-EH-002 | REFERENCED | NO |
| GAP-BR-013 | DEFERRED | NO |
| **GAP-BR-014** | **OPEN** | **NO** |
| **GAP-BR-015** | **OPEN** | **NO** |
| **GAP-BR-016** | **OPEN** | **NO** |
| **GAP-BR-017** | **OPEN** | **NO** |
| **GAP-BR-018** | **OPEN** | **NO** |
| **GAP-BR-019** | **OPEN · P0** | **YES** (real ResearchReport) |

**Design sprint status:** `SPRINT-PB-HARNESS-BRIDGE-001` remains COMPLETE (design PASS). **GAP-BR-019 P0 blocks real ResearchReport implementation acceptance** and is assigned to the planned Execution Platform sprint.

---

## Change log

| Date | Change |
|------|--------|
| 2026-07-24 | Initial canonical register from A1–B3; include GAP-BR-011 (CALLER-001) and GAP-BR-012 from T-B3 |
| 2026-07-24 | T-B5 verdict **AVAILABLE** — GAP-BR-011/012/013 confirmed non-blocking for Band C; gaps remain OPEN/DEFERRED (not closed) |
| 2026-07-24 | T-C1 stage map — **no new GAPs**; Embedding/Memory product surface remains T-C4 (not topology) |
| 2026-07-24 | T-C2 stage↔contract map — **no new GAPs**; all stages 1–8 have SPEC-AGT-001…008; Knowledge Apply = engine path (not missing agent) |
| 2026-07-24 | T-C3 emit map — **GAP-BR-014 OPEN** (PainStatement missing `/artifacts` file); GAP-BR-001 restated for ResearchBrief |
| 2026-07-24 | T-C4 boundary — **GAP-BR-015 OPEN** (PB Ask/index ↔ pipeline EmbeddingJob/MemoryUpdate binding) |
| 2026-07-24 | T-D1 owner decisions — **no new GAPs**; Accept/Reject/Modify → §9; re-approval after Modify confirmed |
| 2026-07-24 | T-D2 apply-token/SoR preconditions — **no new GAPs**; consume Host token + Knowledge Engine apply only |
| 2026-07-24 | T-D3 agent/human attestation boundary — **no new GAPs**; agents cannot approve (Art. III / §9 / Host assertHumanActor) |
| 2026-07-24 | T-D4 gate surface contract — **GAP-BR-016 OPEN** (Proposal/package fetch binding for owner review) |
| 2026-07-24 | T-E1 lineage assertion checklist — **no new GAPs**; LA-* ids for full trusted path; existing Brief/Pain gaps cited |
| 2026-07-24 | T-E2 envelope fit — **GAP-BR-017 OPEN** (no correlation/pipeline on envelope); **GAP-BR-018 OPEN** (`parents` optional) |
| 2026-07-24 | T-E3 lineage PASS evidence — **no new GAPs**; S-AC5/T-G2 evidence list; existing lineage GAPs remain OPEN |
| 2026-07-24 | T-F1 E2E happy-path test design — **no new GAPs**; HP-01 Host createRun → GraphUpdate |
| 2026-07-24 | T-F2 E2E failure cases design — **no new GAPs**; FC-01…13 fail-closed (Sprint §8 + token/lineage/tenant) |
| 2026-07-24 | T-F3 runnable vs blocked — **no new GAPs**; B5 AVAILABLE → 0 BLOCKED_ON_HOST_CREATERUN; T-F4 subset identified |
| 2026-07-24 | T-F4 minimal Host test harness definition — **no new GAPs**; Host public APIs only; executable suite deferred |
| 2026-07-25 | T-G1 SPEC-PROD-004 `accepted` + MODULE_STATUS hygiene — **no new GAPs**; path note only (canonical SPEC-PROD-004-HARNESS-BRIDGE) |
| 2026-07-25 | T-G2 sprint exit **PASS** — **no GAPs resolved**; all remain OPEN/DEFERRED/REFERENCED; coding follow-up **YES** |
| 2026-07-25 | C-01 Research Request Builder — **no new GAPs**; product defaults cite GAP-BR-002…005; `run_id` stamp deferred (GAP-BR-005) |
| 2026-07-25 | C-02 createRun integration — **no new GAPs**; Host public API only; GAP-BR-012 ambient Kernel workaround evidenced in C-02-T5 |
| 2026-07-25 | C-03 Host Research Agent path — **no new GAPs**; Host-owned bind; PB observe-only; SPEC-AGT-001 via Host stage map |
| 2026-07-25 | C-04 execute Research via Host — **GAP-BR-019 OPEN** (Host MVP lineage seal, no ResearchReport body via public API) |
| 2026-07-25 | Planning audit — **GAP-BR-019 promoted to P0**; planned resolution `SPRINT-HOST-RESEARCH-INTEGRATION-001` (pending Founder approval) |
| 2026-07-25 | C-05 persist ResearchReport reference — **no new GAPs; none closed**; product stores Host ref + lineage/ownership/tenancy only; GAP-BR-019 remains OPEN P0 |
| 2026-07-25 | C-06 smoke — **PASS** on Host MVP lineage-seal path; **no new GAPs; none closed**; GAP-BR-019 / GAP-EH-003 / GAP-BR-012 / GAP-BR-005 / GAP-BR-002…004 remain OPEN |
| 2026-07-25 | C-07 / `SPRINT-PB-BRIDGE-CODING-001` **COMPLETE · PASS** — **no new GAPs; none closed**; GAP-BR-019 remains **OPEN · P0** |

---

**End of GAP-REGISTRY-PB-HARNESS-BRIDGE-001**
