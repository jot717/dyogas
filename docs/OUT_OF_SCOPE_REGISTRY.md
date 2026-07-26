# DYOGAS Out-of-Scope Registry

**Status:** Official — Append-Only Catalog (documentation)  
**Owner:** Architecture Management Agent / Chief Systems Architect  
**Effective:** 2026-07-23  
**Purpose:** Single registry of capabilities **explicitly deferred** from completed platform modules so they are not silently re-introduced mid-implementation.  
**Authority:** Records Non-Goals and deferred decisions already accepted under SPEC/ADR artifacts. Does **not** create new architecture or amend MASTER_ARCHITECTURE.

**Completed modules covered:** MOD-KERNEL · MOD-TRUST · MOD-RUNTIME · MOD-AGENT-SDK · MOD-RESEARCH · MOD-KNOWLEDGE  

**Rules of use**

1. Items here remain out of scope until Activation Condition is met and Engineering Process (Spec → …) is run for the owning module.  
2. Do not implement a listed item inside a completed module without a new Spec + Architecture Review (and ADR when Art. VIII applies).  
3. This file is documentation only — not an executable gate.  
4. **Single registry:** this file is the only Out-of-Scope catalog. Do not create parallel `OUT_OF_SCOPE*.md` files.

---

## Index

| ID | Module | Deferred Capability | Phase |
|----|--------|---------------------|-------|
| OOS-K-001 | MOD-KERNEL | Workspace / child tenancy scope API | Post-MVP Kernel / Runtime need |
| OOS-K-002 | MOD-KERNEL | Tenancy-aware config overlay | Post-MVP Kernel / Runtime need |
| OOS-K-003 | MOD-KERNEL | Kernel-exported monotonic clock API | Post-MVP Kernel |
| OOS-K-004 | MOD-KERNEL | Pipeline / Harness / agent-bind / egress / SoR in Kernel | Never in Kernel (wrong module) |
| OOS-T-001 | MOD-TRUST | Cloud AI Compute vendor selection | After allow-egress ADR |
| OOS-T-002 | MOD-TRUST | Cloud / AI egress allow policies | Superseding ADR to ADR-0002 |
| OOS-T-003 | MOD-TRUST | Full cloud AI client implementation | After OOS-T-001/002 |
| OOS-T-004 | MOD-TRUST | Enterprise IAM / OIDC product | Trust scale |
| OOS-T-005 | MOD-TRUST | Durable / non-memory audit storage backend | Trust scale / ops |
| OOS-T-006 | MOD-TRUST | Human Approval UI / SoR ownership / pipeline orchestration | Wrong module |
| OOS-R-001 | MOD-RUNTIME | Full pipeline graph loader (all `/pipelines` topologies) | Runtime enrichment |
| OOS-R-002 | MOD-RUNTIME | Full Harness invocation state machine + Review/Human gates | Runtime enrichment |
| OOS-R-003 | MOD-RUNTIME | Knowledge-ingestion production E2E hosting | Engines + gates |
| OOS-R-004 | MOD-RUNTIME | Agent contract bind / skill invoke inside Runtime | Wrong module (SDK) |
| OOS-R-005 | MOD-RUNTIME | Knowledge SoR mutation / Cloud AI client in Runtime | Wrong plane |
| OOS-S-001 | MOD-AGENT-SDK | Real Research/Knowledge engine skill handlers | B9+ engines |
| OOS-S-002 | MOD-AGENT-SDK | LLM prompts / model vendor SDKs inside Agent SDK | Engines / future ADR |
| OOS-S-003 | MOD-AGENT-SDK | Pipeline orchestration / run state machine in SDK | Wrong module (Runtime) |
| OOS-S-004 | MOD-AGENT-SDK | Editing `/contracts` or `/schemas` via SDK | Process / ADR |
| OOS-S-005 | MOD-AGENT-SDK | Self-sealing authoritative artifacts in SDK | Forbidden (ADR-0004) |
| OOS-RE-001 | MOD-RESEARCH | Live network YouTube/GitHub/Reddit/Web collectors | After OOS-T-002 + enrichment Spec |
| OOS-RE-002 | MOD-RESEARCH | SoR writes / UI / second Harness in Research | Wrong module (permanent) |
| OOS-KN-001 | MOD-KNOWLEDGE | Graph database materialization | MOD-GRAPH (B14) |
| OOS-KN-002 | MOD-KNOWLEDGE | Web UI / Experience Plane | MOD-WEB-UI (B16) |
| OOS-KN-003 | MOD-KNOWLEDGE | Production embedding model jobs (vendor) | After OOS-T-002 + enrichment Spec |

---

## MOD-KERNEL

### OOS-K-001

| Field | Value |
|-------|-------|
| **ID** | OOS-K-001 |
| **Related Module** | MOD-KERNEL |
| **Deferred Capability** | Workspace / child tenancy scope API (nested scope under `TenantId`) |
| **Reason Deferred** | SPEC-RT-001 Goal 1 requires tenancy context, not nested workspace scopes for MVP; explicit non-goal doc chosen (BL-K-012). |
| **Dependency Required** | Runtime or product Spec demonstrating need for child scope |
| **Planned Implementation Phase** | Post-MVP Kernel enhancement (after B7+ consumers exist) |
| **Activation Condition** | New Spec accepted that requires child scope; Architecture Review complete; optional ADR if tenancy model changes |
| **Related ADR / SPEC** | SPEC-RT-001; `kernel/docs/child-scope-nongoal.md`; BL-K-012 |

### OOS-K-002

| Field | Value |
|-------|-------|
| **ID** | OOS-K-002 |
| **Related Module** | MOD-KERNEL |
| **Deferred Capability** | Tenancy-aware configuration overlay |
| **Reason Deferred** | MVP config is process env via `loadConfig`; per-tenant overlays belong with multi-tenant deployment needs (BL-K-043 non-goal). |
| **Dependency Required** | Multi-tenant deployment requirements; likely MOD-RUNTIME / MOD-TRUST coordination |
| **Planned Implementation Phase** | Post-MVP Kernel or Trust-adjacent config |
| **Activation Condition** | Spec accepting tenancy overlay; tests for isolation of overlays |
| **Related ADR / SPEC** | SPEC-RT-001; ADR-0001; `kernel/docs/tenancy-config-nongoal.md`; BL-K-043 |

### OOS-K-003

| Field | Value |
|-------|-------|
| **ID** | OOS-K-003 |
| **Related Module** | MOD-KERNEL |
| **Deferred Capability** | First-class Kernel-exported monotonic clock API |
| **Reason Deferred** | Kernel MVP exports wall clock only; guidance documents `process.hrtime.bigint()` for durations until a Spec adds Kernel API. |
| **Dependency Required** | Runtime/Engine Spec requiring shared monotonic clock across modules |
| **Planned Implementation Phase** | Post-MVP Kernel |
| **Activation Condition** | Spec + tests for monotonic API; no silent wall-clock misuse |
| **Related ADR / SPEC** | SPEC-RT-001; ADR-0001; `kernel/docs/clock-guidance.md`; BL-K-032 |

### OOS-K-004

| Field | Value |
|-------|-------|
| **ID** | OOS-K-004 |
| **Related Module** | MOD-KERNEL |
| **Deferred Capability** | Pipeline engine, Harness orchestration, agent bind, egress, Knowledge SoR, UI, Hosted Engineering Agents **inside Kernel** |
| **Reason Deferred** | SPEC-RT-001 Non-Goals; Kernel is primitives only. These capabilities belong to other modules/planes. |
| **Dependency Required** | Owning modules (Runtime, Trust, SDK, Engines, Web UI, ENG-AGENTS) per Build Order |
| **Planned Implementation Phase** | Never in MOD-KERNEL — implement only in registered owning modules |
| **Activation Condition** | N/A for Kernel; activate via owning module Specs |
| **Related ADR / SPEC** | SPEC-RT-001; ADR-0001 |

---

## MOD-TRUST

### OOS-T-001

| Field | Value |
|-------|-------|
| **ID** | OOS-T-001 |
| **Related Module** | MOD-TRUST |
| **Deferred Capability** | Cloud AI Compute **vendor** selection |
| **Reason Deferred** | SPEC-RT-004 / ADR-0002 Non-Goal; boundary ADR must not lock a vendor. |
| **Dependency Required** | Business vendor decision; superseding ADR |
| **Planned Implementation Phase** | After allow-egress architecture (post ADR-0002 extension) |
| **Activation Condition** | New ADR Accepted naming vendor + data classes + consent |
| **Related ADR / SPEC** | ADR-0002; SPEC-RT-004; SPEC-ADR-PLANNED-002; Art. XI |

### OOS-T-002

| Field | Value |
|-------|-------|
| **ID** | OOS-T-002 |
| **Related Module** | MOD-TRUST |
| **Deferred Capability** | Cloud / AI **egress allow** policies (any non-deny path) |
| **Reason Deferred** | ADR-0002 Decision: default deny; allow requires superseding ADR. |
| **Dependency Required** | OOS-T-001 (or explicit allow ADR without vendor if policy-only); Trust Visible consent model |
| **Planned Implementation Phase** | Trust Scale / Cloud AI enablement |
| **Activation Condition** | Superseding ADR to ADR-0002 Accepted; tests prove allow is explicit and audited |
| **Related ADR / SPEC** | ADR-0002; SPEC-RT-004 |

### OOS-T-003

| Field | Value |
|-------|-------|
| **ID** | OOS-T-003 |
| **Related Module** | MOD-TRUST |
| **Deferred Capability** | Full Cloud AI HTTP/client implementation inside Trust |
| **Reason Deferred** | SPEC-RT-004 Non-Goal #1; MVP is gate + audit, not a cloud SDK. |
| **Dependency Required** | OOS-T-001, OOS-T-002 |
| **Planned Implementation Phase** | After allow-egress ADR |
| **Activation Condition** | Spec for cloud client adapter; still must call Trust gate |
| **Related ADR / SPEC** | ADR-0002; SPEC-RT-004 |

### OOS-T-004

| Field | Value |
|-------|-------|
| **ID** | OOS-T-004 |
| **Related Module** | MOD-TRUST |
| **Deferred Capability** | Full enterprise IAM / OIDC identity product |
| **Reason Deferred** | SPEC-RT-004 Non-Goal #3; MVP uses Kernel tenancy + local/dev identity adapter. |
| **Dependency Required** | Identity product Spec; possible ADR for IdP trust boundary |
| **Planned Implementation Phase** | Trust Scale (Roadmap Phase 4-class) |
| **Activation Condition** | Accepted Spec for OIDC/IAM; tenancy mapping tests |
| **Related ADR / SPEC** | SPEC-RT-004 |

### OOS-T-005

| Field | Value |
|-------|-------|
| **ID** | OOS-T-005 |
| **Related Module** | MOD-TRUST |
| **Deferred Capability** | Durable audit sink backends (file/DB/log stream beyond in-memory) |
| **Reason Deferred** | MVP ships `createMemoryAuditSink` for interface + append-only semantics; storage tech left open in Spec open questions. |
| **Dependency Required** | Ops requirements; optional ADR if storage crosses tenancy/plane ownership |
| **Planned Implementation Phase** | Trust / Runtime ops hardening |
| **Activation Condition** | Spec for durable sink; append-only + tenancy tests |
| **Related ADR / SPEC** | SPEC-RT-004; ADR-0002 |

### OOS-T-006

| Field | Value |
|-------|-------|
| **ID** | OOS-T-006 |
| **Related Module** | MOD-TRUST |
| **Deferred Capability** | Human Approval UI, Knowledge SoR ownership, pipeline/Harness orchestration **in Trust** |
| **Reason Deferred** | SPEC-RT-004 Non-Goals; Trust is adapters only. |
| **Dependency Required** | MOD-WEB-UI / MOD-KNOWLEDGE / MOD-RUNTIME as owners |
| **Planned Implementation Phase** | Never in MOD-TRUST — owning modules only |
| **Activation Condition** | N/A for Trust |
| **Related ADR / SPEC** | SPEC-RT-004; ADR-0002 |

---

## MOD-RUNTIME

### OOS-R-001

| Field | Value |
|-------|-------|
| **ID** | OOS-R-001 |
| **Related Module** | MOD-RUNTIME |
| **Deferred Capability** | Full pipeline graph loader for all `/pipelines` topologies |
| **Reason Deferred** | ADR-0003 allows MVP minimal run lifecycle; full graph loading deferred without superseding boundary. |
| **Dependency Required** | Pipeline Specs; schema validation path (Ajv/CI already exists) |
| **Planned Implementation Phase** | Runtime enrichment (post B8) |
| **Activation Condition** | Spec for graph loader; illegal edge tests; pin pipeline version |
| **Related ADR / SPEC** | ADR-0003; SPEC-RT-002; `/pipelines/knowledge-ingestion.md` |

### OOS-R-002

| Field | Value |
|-------|-------|
| **ID** | OOS-R-002 |
| **Related Module** | MOD-RUNTIME |
| **Deferred Capability** | Complete Harness invocation-level state machine, Review Gates, Human Approval Gate enforcement in code |
| **Reason Deferred** | MVP covers minimal run states + retry classes + handoff seal rules sufficient for SPEC-RT-002 metrics; full Harness tables remain law in `/harness` until implemented. |
| **Dependency Required** | Harness Spec (consumed); Human Approval surfaces; Agent SDK for binds |
| **Planned Implementation Phase** | Runtime enrichment |
| **Activation Condition** | Spec slices for gates; tests mapped to Harness state tables |
| **Related ADR / SPEC** | SPEC-RT-002; ADR-0003; `harness/HARNESS_SPECIFICATION.md` |

### OOS-R-003

| Field | Value |
|-------|-------|
| **ID** | OOS-R-003 |
| **Related Module** | MOD-RUNTIME |
| **Deferred Capability** | Full knowledge-ingestion production E2E hosted run |
| **Reason Deferred** | SPEC-RT-002 Non-Goal #5; requires engines + gates + allow paths as applicable. |
| **Dependency Required** | MOD-AGENT-SDK (COMPLETE), MOD-RESEARCH (B9+), Trust allow policies if egress needed |
| **Planned Implementation Phase** | After B9 Research Engine MVP |
| **Activation Condition** | Engine Specs accepted; Runtime graph loader (OOS-R-001) sufficient |
| **Related ADR / SPEC** | SPEC-RT-002; SPEC-ENGIN-001 (planned) |

### OOS-R-004

| Field | Value |
|-------|-------|
| **ID** | OOS-R-004 |
| **Related Module** | MOD-RUNTIME |
| **Deferred Capability** | Agent contract bind / skill invocation **inside Runtime** |
| **Reason Deferred** | ADR-0003 / SPEC-RT-002 Non-Goal — belongs to MOD-AGENT-SDK (now COMPLETE for bind MVP). Further skill richness is OOS-S-*. |
| **Dependency Required** | MOD-AGENT-SDK |
| **Planned Implementation Phase** | Never in Runtime — use SDK |
| **Activation Condition** | N/A for Runtime |
| **Related ADR / SPEC** | ADR-0003; ADR-0004; SPEC-RT-002; SPEC-RT-003 |

### OOS-R-005

| Field | Value |
|-------|-------|
| **ID** | OOS-R-005 |
| **Related Module** | MOD-RUNTIME |
| **Deferred Capability** | Knowledge SoR mutation and Cloud AI client **in Runtime** |
| **Reason Deferred** | SPEC-RT-002 Non-Goal #3; SoR and cloud belong to Knowledge plane / Trust egress path. |
| **Dependency Required** | Knowledge Engine; Human Approval apply tokens; OOS-T-002 |
| **Planned Implementation Phase** | Never direct in Runtime — via Harness-approved paths only |
| **Activation Condition** | Knowledge + Trust allow ADRs/Specs |
| **Related ADR / SPEC** | SPEC-RT-002; ADR-0002; Art. X–XI |

---

## MOD-AGENT-SDK

### OOS-S-001

| Field | Value |
|-------|-------|
| **ID** | OOS-S-001 |
| **Related Module** | MOD-AGENT-SDK |
| **Deferred Capability** | Real Research / Knowledge / Markdown **engine skill handlers** (YouTube, GitHub, Reddit, Web, etc.) |
| **Reason Deferred** | SPEC-RT-003 Non-Goal #2; SDK MVP provides allowlist + stub handler registry; engines supply real skills. |
| **Dependency Required** | MOD-RESEARCH / MOD-KNOWLEDGE / MOD-MARKDOWN (B9+) |
| **Planned Implementation Phase** | B9+ domain engines |
| **Activation Condition** | Engine Spec accepted; handlers registered under contract allowlist |
| **Related ADR / SPEC** | SPEC-RT-003; ADR-0004; SPEC-ENGIN-001/002/003 (planned); Skill Spec §5 |

### OOS-S-002

| Field | Value |
|-------|-------|
| **ID** | OOS-S-002 |
| **Related Module** | MOD-AGENT-SDK |
| **Deferred Capability** | LLM prompts / model provider SDKs embedded in Agent SDK |
| **Reason Deferred** | SPEC-RT-003 Non-Goal #2; contracts forbid specifying vendors in `/contracts`; compute via Trust egress when allowed. |
| **Dependency Required** | OOS-T-001/002; Engine Specs |
| **Planned Implementation Phase** | Engines + Cloud AI enablement |
| **Activation Condition** | Allow-egress ADR; engine Spec for model use |
| **Related ADR / SPEC** | SPEC-RT-003; ADR-0002; ADR-0004 |

### OOS-S-003

| Field | Value |
|-------|-------|
| **ID** | OOS-S-003 |
| **Related Module** | MOD-AGENT-SDK |
| **Deferred Capability** | Pipeline orchestration / run admit-state machine **in SDK** |
| **Reason Deferred** | ADR-0004 / SPEC-RT-003 — Runtime remains sole host. |
| **Dependency Required** | MOD-RUNTIME (COMPLETE) |
| **Planned Implementation Phase** | Never in SDK |
| **Activation Condition** | N/A |
| **Related ADR / SPEC** | ADR-0004; ADR-0003; SPEC-RT-003 |

### OOS-S-004

| Field | Value |
|-------|-------|
| **ID** | OOS-S-004 |
| **Related Module** | MOD-AGENT-SDK |
| **Deferred Capability** | SDK-driven editing of `/contracts` or `/schemas` |
| **Reason Deferred** | SPEC-RT-003 Non-Goal #3; contract/schema changes require Engineering Process + ADR when Art. VIII applies. |
| **Dependency Required** | Engineering Process; ADR if topology/schema semantics change |
| **Planned Implementation Phase** | Governance / contract revision cycles — not SDK features |
| **Activation Condition** | Accepted Spec/ADR for contract or schema change |
| **Related ADR / SPEC** | SPEC-RT-003; `/contracts/README.md`; Art. VIII |

### OOS-S-005

| Field | Value |
|-------|-------|
| **ID** | OOS-S-005 |
| **Related Module** | MOD-AGENT-SDK |
| **Deferred Capability** | Self-sealing authoritative artifacts inside SDK (`sealed=true` as SoR of truth) |
| **Reason Deferred** | ADR-0004: candidates unsealed; Runtime/Harness seal. Not a future SDK feature — permanent boundary unless ADR superseded. |
| **Dependency Required** | Superseding ADR (discouraged) |
| **Planned Implementation Phase** | Not planned — boundary constraint |
| **Activation Condition** | Only if ADR-0004 superseded (Architecture Review required) |
| **Related ADR / SPEC** | ADR-0004; SPEC-RT-003; Harness seal rules |

---

## MOD-RESEARCH

### OOS-RE-001

| Field | Value |
|-------|-------|
| **ID** | OOS-RE-001 |
| **Related Module** | MOD-RESEARCH |
| **Deferred Capability** | Live network source collectors (YouTube / GitHub / Reddit / Web) |
| **Reason Deferred** | SPEC-ENGIN-001 / ADR-0005 MVP uses mock collectors; live egress needs Trust allow policy |
| **Dependency Required** | OOS-T-002; enrichment Spec |
| **Planned Implementation Phase** | Post MVP-CORE Research enrichment |
| **Activation Condition** | Allow-egress ADR Accepted + Research enrichment Spec |
| **Related ADR / SPEC** | ADR-0005; ADR-0002; SPEC-ENGIN-001 |

### OOS-RE-002

| Field | Value |
|-------|-------|
| **ID** | OOS-RE-002 |
| **Related Module** | MOD-RESEARCH |
| **Deferred Capability** | Knowledge SoR mutation, Experience Plane UI, or second Harness inside Research |
| **Reason Deferred** | Wrong module / wrong plane — permanent boundary |
| **Dependency Required** | N/A |
| **Planned Implementation Phase** | Never in Research |
| **Activation Condition** | N/A |
| **Related ADR / SPEC** | ADR-0005; ADR-0006 |

---

## MOD-KNOWLEDGE

### OOS-KN-001

| Field | Value |
|-------|-------|
| **ID** | OOS-KN-001 |
| **Related Module** | MOD-KNOWLEDGE |
| **Deferred Capability** | Graph database materialization |
| **Reason Deferred** | SPEC-ENGIN-002 Non-Goal; GraphUpdate owned by MOD-GRAPH |
| **Dependency Required** | MOD-GRAPH (B14) |
| **Planned Implementation Phase** | B14 |
| **Activation Condition** | SPEC-ENGIN-004 Accepted + Graph Module Complete |
| **Related ADR / SPEC** | ADR-0006; SPEC-ENGIN-002 |

### OOS-KN-002

| Field | Value |
|-------|-------|
| **ID** | OOS-KN-002 |
| **Related Module** | MOD-KNOWLEDGE |
| **Deferred Capability** | Web UI / Experience Plane |
| **Reason Deferred** | Wrong plane — MOD-WEB-UI |
| **Dependency Required** | MOD-WEB-UI (B16) |
| **Planned Implementation Phase** | B16 |
| **Activation Condition** | SPEC-UI-001 Accepted |
| **Related ADR / SPEC** | ADR-0006; SPEC-ENGIN-002 |

### OOS-KN-003

| Field | Value |
|-------|-------|
| **ID** | OOS-KN-003 |
| **Related Module** | MOD-KNOWLEDGE |
| **Deferred Capability** | Production embedding model jobs with cloud vendor SDKs |
| **Reason Deferred** | SPEC-ENGIN-002 Non-Goal for MVP; local deterministic embedding path may land under Graph/Knowledge enrichment without cloud |
| **Dependency Required** | OOS-T-002 for cloud; local hash/mock embeddings may ship earlier under B14 Spec |
| **Planned Implementation Phase** | B14+ / Cloud AI enablement |
| **Activation Condition** | Enrichment Spec; allow-egress if remote models |
| **Related ADR / SPEC** | ADR-0006; SPEC-ENGIN-002 |

---

## MASTER_ARCHITECTURE note

This registry is a **documentation catalog of deferred capabilities**, not a new registered module, layer, or Build Order step. It does **not** fork MASTER. Module **status** fields in MASTER §5–§6 may be synchronized with per-module `MODULE_STATUS.md` (docs-only; no dependency/layer changes) — that sync is independent of this registry.

**Consistency check (2026-07-23):** Single file `docs/OUT_OF_SCOPE_REGISTRY.md`; no duplicate registries. Index IDs unique; Closed/Partial Activation section records OOS-S-001 partial + Knowledge SoR MVP note.

---

## Amendment procedure

1. Append new `OOS-*` rows when a Spec/ADR records a new deferral.  
2. When an item is implemented, append a **Closed** subsection with date, Spec/ADR, and module version — do not delete history.  
3. Never use this registry to authorize Implementation without Engineering Process.

---

## Closed / Partially Activated

### OOS-S-001 — partial (2026-07-23)

| Field | Value |
|-------|-------|
| Status | **Partially activated** by MOD-RESEARCH (`@dyogas/research-engine@0.1.0`) |
| What landed | In-engine mock `SourceCollector` + allowlisted `web-research` stub handler |
| Still deferred | Live YouTube/GitHub/Reddit/Web network skill handlers (remain OOS until OOS-T-002 + enrichment) |
| Spec/ADR | SPEC-ENGIN-001; ADR-0005 |

### Knowledge SoR MVP note (2026-07-23)

| Field | Value |
|-------|-------|
| Status | **MOD-KNOWLEDGE COMPLETE** (`@dyogas/knowledge-engine@0.1.0`) |
| Activated | Approval-gated local SoR, versioning, provenance, evidence links, graph/markdown **contracts** |
| Still deferred | Graph database materialization; Web UI; embedding jobs (see SPEC-ENGIN-002 Non-Goals) |
| Spec/ADR | SPEC-ENGIN-002; ADR-0006 |
