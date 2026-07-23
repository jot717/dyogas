# Gap Analysis — PERSONAL-BRAIN MVP IMPLEMENTATION SPRINT

**Document ID:** GAP-PB-MVP-001  
**Module:** MOD-PERSONAL-BRAIN only (no new `MOD-*`)  
**Baseline:** CORE COMPLETE — `@dyogas/personal-brain@0.1.0` / SPEC-PROD-001 / ADR-0009  
**Date:** 2026-07-23  
**Harness role:** Harness Execution Engine (planning stage)  
**Immutability:** Do not modify Kernel, Runtime; do not rebuild Research; no duplicate modules.

---

## 1. Purpose of this sprint

Transform Personal Brain **core contracts/APIs** into a **real user product**: durable storage, richer capture, a processing pipeline with approval, a product UI, and deployable packaging — still entirely under `personal-brain/`.

---

## 2. Current state (what CORE COMPLETE already delivers)

| Capability | Present in 0.1.0 | Notes |
|------------|------------------|--------|
| User workspace (owner + tenant boundary) | **Yes** | In-memory object; lost on process exit |
| Text capture | **Yes** | `normalizeCapture` + Knowledge apply |
| URL capture | **Partial** | Metadata only; **no fetch** (SPEC-PROD-001 Non-Goal) |
| Document capture | **No** | Not modeled |
| Knowledge Engine apply (owner-attributed approval) | **Yes** | Immediate `approved` on capture |
| Graph + local embedding index | **Yes** | Via MOD-GRAPH consume |
| Ask My Brain (extractive) | **Yes** | Cosine + keyword; no LLM |
| Persistence (disk) | **No** | Explicit Non-Goal in SPEC-PROD-001 |
| Product UI (login / dashboard / capture / knowledge / ask) | **No** | API-only; MOD-WEB-UI is separate approval console — must not fork as new module |
| AI extraction / summarization pipeline | **No** | Capture body used as-is |
| Explicit pending→approve product flow | **Partial** | Capture auto-approves as owner; no staged “review before apply” UX |
| Deployment packaging | **No** | Library package only |

---

## 3. Required MVP capabilities vs gaps

### 3.1 Persistence Layer

| Requirement | Gap | Proposed closure (in-module) |
|-------------|-----|------------------------------|
| User ownership | Soft gap — owner id in memory only | Persist `users.json` / workspace manifest under `data/<tenant>/` |
| Workspace storage | **Gap** | File-backed workspace registry + load-on-start |
| Knowledge artifact persistence | **Gap** | Serialize applied Knowledge items + personal index (vectors, source metadata) to disk; reload into memory SoR + index on boot |

**Constraint:** Must wrap/consume `@dyogas/knowledge-engine` SoR — **not** invent a second SoR. Product layer adds a **persistence adapter** that rehydrates Knowledge items into `createMemoryKnowledgeSoR` (or a thin file-backed façade owned by Personal Brain).

**Spec impact:** SPEC-PROD-001 Non-Goal “Durable disk SoR” must be **superseded by enrichment Spec SPEC-PROD-002** (Architecture Review; likely `no_arch_impact` if file store stays product-local and Knowledge remains sole logical SoR writer API).

### 3.2 Real Input Layer

| Requirement | Gap | Proposed closure |
|-------------|-----|------------------|
| Text capture | Done | Keep; add UI binding |
| URL capture | Partial | Keep metadata path; optional **local-only** fetch stub behind feature flag — **live network fetch requires Trust allow-egress ADR (Founder gate)**; sprint default = no live fetch, richer metadata + user-supplied title/notes |
| Document capture abstraction | **Gap** | `kind: "document"` — accept filename, mime, text extraction interface; MVP = plain-text / markdown file bytes in-process (no OCR cloud) |

### 3.3 AI Processing Pipeline

| Requirement | Gap | Proposed closure |
|-------------|-----|------------------|
| Extraction | **Gap** | Local heuristic extract (title, key sentences, URL/host fields) in `personal-brain/src/pipeline/` |
| Summarization | **Gap** | Local extractive summary (sentence ranking) — **no cloud LLM** unless Founder accepts allow-egress ADR |
| Knowledge creation | Partial | Pipeline produces draft title/body → Knowledge apply |
| Approval flow | Partial | Add **pending capture queue** in product layer: extract/summarize → `pending` → owner approve/reject → then Knowledge apply (still owner-attributed; still ADR-0006 compliant) |

**Hard stop risk:** Cloud LLM summarization = Trust/ADR business decision. Sprint Plan treats cloud as **Out of Sprint** unless Founder APPROVE mid-sprint.

### 3.4 Product UI

| Screen | Gap | Proposed closure |
|--------|-----|------------------|
| Login | **Gap** | Local demo auth: username → sets Kernel tenancy + Trust identity in process (product-layer session); **not** enterprise IAM (OOS-T-004) |
| Brain dashboard | **Gap** | Counts, recent captures, pending approvals |
| Capture screen | **Gap** | Text / URL / document forms |
| Knowledge view | **Gap** | List + detail of persisted items |
| Ask My Brain | **Gap** | Query box + cited answer |

**Placement:** `personal-brain/ui/` + `personal-brain/src/server.ts` (HTTP) under **MOD-PERSONAL-BRAIN only**. Do **not** create `MOD-PERSONAL-BRAIN-UI` or modify Kernel/Runtime. May **pattern-match** `@dyogas/web-ui` without merging modules.

### 3.5 Deployment readiness

| Requirement | Gap | Proposed closure |
|-------------|-----|------------------|
| Runnable product entrypoint | **Gap** | `npm start` → HTTP server + data dir |
| Config | **Gap** | `PERSONAL_BRAIN_DATA_DIR`, port, demo user |
| Health check | **Gap** | `GET /health` |
| Docs runbook | **Gap** | `personal-brain/DEPLOY.md` |
| Production multi-instance / HA | Out of sprint | Single-node local/docker MVP |

---

## 4. Explicit non-goals for this sprint (still)

| Item | Reason |
|------|--------|
| Modify `kernel/`, `runtime/` | User rule |
| Modify/rebuild `research/` | User rule |
| New registered `MOD-*` | No duplicates |
| Enterprise OIDC / org tenancy | OOS-T-004 |
| Durable graph DB | OOS-KN-001 |
| Cloud AI without ADR | OOS-T-002 |

---

## 5. Architecture / Founder gates

| Gate | Trigger | Resume |
|------|---------|--------|
| Enrichment Spec SPEC-PROD-002 | Persistence + pending approval + UI in-module | Arch Review → Founder if `adr_required` |
| Allow-egress ADR | Live URL fetch or cloud LLM | **Hard stop** until Founder APPROVE |
| Kernel/Runtime change request | None expected | Refuse |

**Preliminary Arch verdict for SPEC-PROD-002:** likely `no_arch_impact` if product file persistence + UI stay in Experience/Product layer and SoR mutations remain via Knowledge Engine APIs.

---

## 6. Gap severity summary

| Area | Severity | Blocks “real user product”? |
|------|----------|------------------------------|
| Persistence | **P0** | Yes |
| Document capture abstraction | **P1** | Partial |
| Pipeline extract/summarize + pending approve | **P0** | Yes (for “AI processing + approval”) |
| Product UI | **P0** | Yes |
| Deployment entrypoint | **P1** | Yes for demo/deploy |
| Live URL / cloud LLM | **P2** (gated) | Nice-to-have; not required for local MVP product |

---

## 7. Recommendation

Proceed to **Backlog + Sprint Plan** scoped to P0/P1 in-module work under enrichment Spec **SPEC-PROD-002**, with cloud/live network explicitly deferred unless Founder opens Trust egress.

**End of GAP-PB-MVP-001**
