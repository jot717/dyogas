# DYOGAS Architecture Alignment Proposal

**Status:** **SUPERSEDED / HISTORICAL**  
**Superseded by:** ADR-0010 (Accepted) · SPEC-EXECUTION-HOST-001 (`accepted`) · MASTER_ARCHITECTURE B18 / §6.7a · `docs/ARCHITECTURE_SYNC_REPORT-EXECUTION-HOST-001.md`  
**Date (original):** 2026-07-23  
**Date stamped superseded:** 2026-07-24  
**Mode:** Historical alignment proposal — **do not treat as active architecture**  
**Owner (draft):** Harness / Architecture alignment pass  

> This document proposed dual Harness naming and a Personal Brain ↔ Execution Harness bridge shape **before** MOD-EXECUTION-HOST existed as a first-class module. Canonical architecture is now: Experience Product → **Execution Host** → Runtime → SDK → Agents. Retain for audit trail only.

---

## 1. Current State

### Platform

| Capability | State |
|------------|--------|
| Constitution | Binding; defines **Harness** as execution path only (`/harness`) |
| Engineering Process (`/engineering`) | Binding development lifecycle; **not** named “Development Harness” |
| Execution Harness Spec | `harness/HARNESS_SPECIFICATION.md` v2 — complete execution law |
| Skill Spec | Canonical catalog; specification-first |
| Runtime (SPEC-RT-002) | Module Complete — enforcement host |
| Agent SDK (SPEC-RT-003) | Module Complete — bind / allowlist / candidates |
| Research / Knowledge / Graph engines | Module Complete (platform) |
| Agent contracts | Research, Validation, Proposal, Review, Markdown, Graph, Embedding, Memory, Learning, Notification — **no Decision Agent** |
| Canonical pipeline | `pipelines/knowledge-ingestion.md`: Research → … → Human Review → Markdown → Graph → Embedding → Memory |

### Personal Brain (`MOD-PERSONAL-BRAIN`)

| Layer | State |
|-------|--------|
| Core (workspace, capture, approve, ask proposals, persistence) | Present |
| External adapters (Supabase, Gemini, Jina) | Present |
| Product UI / HTTP server | **REMOVED** (`stage/PRODUCT_LAYER_REMOVAL.md`) |
| Specs SPEC-PROD-001..003 | Accepted historically; **002/003 still assume UI/HTTP** → drift |
| MODULE_STATUS | Core + connections; next = new product layer |
| Execution Harness admission | **Not** the default path for multi-agent research → SoR |

### Terminology problem (active)

- People say “Harness Execution Engine” for **product delivery** (Engineering Process).
- Constitution + ARCHITECTURE use **Harness** only for **agent runtime orchestration**.
- These must not be merged.

### Product gap (active)

Personal Brain can capture → AI assist → human confirm → store knowledge **in-process**, but professional exploration (“understand AI Agent market”) is **not** admitted as an Execution Harness pipeline run ending in sealed knowledge + graph under Human Approval Gate.

---

## 2. Canonical Architecture

### Dual Harness (binding naming)

| Term | Meaning | Authority |
|------|---------|-----------|
| **Harness** (default) | **Execution Harness** — agent runtime law | `CONSTITUTION.md` Art. XIII; `/harness/HARNESS_SPECIFICATION.md`; Runtime + SDK |
| **Development Harness** | Alias for **Engineering Process** discipline — how DYOGAS is built | `/engineering` (unchanged process law; **do not replace**) |
| Forbidden | A second execution state machine under `/engineering` | Constitution Art. I / XIII |

### Diagram (canonical)

```text
                    CONSTITUTION
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
  DEVELOPMENT HARNESS              EXECUTION HARNESS
  (= Engineering Process)          (= Harness Spec)
          │                               │
   PLAN → SPEC → BACKLOG                  │
   → SPRINT → IMPLEMENT                   │
   → TEST → DEBUG → REVIEW                │
   → ACCEPTANCE → AUDIT RECORD            │
   → RETROSPECTIVE                        │
          │                               │
          │ builds / evolves              ▼
          │                    Runtime (admit, state, handoff, gates)
          │                    + SDK (bind, skills allowlist, candidates)
          │                               │
          │                               ▼
          │                            AGENTS
          │                    (contracts under /contracts)
          │                               │
          │                               ▼
          └───────────────►     Knowledge / Graph / (future Decision)
                                via sealed artifacts + Human Approval
```

### Execution lifecycle (unchanged law)

```text
REQUEST → PIPELINE → STATE MACHINE → ARTIFACT → HANDOFF
  → REVIEW GATE → HUMAN APPROVAL → AUDIT TRAIL → SEALED KNOWLEDGE
```

### Development lifecycle (Engineering Process = Development Harness)

Map to existing `/engineering` (do not fork process docs into a parallel system):

| Proposed name | Engineering Process today |
|---------------|---------------------------|
| PLAN | Pain/roadmap intake + Spec entry (01) |
| SPECIFICATION | 01_SPECIFICATION + Architecture Review |
| BACKLOG | 02_BACKLOG |
| SPRINT | 03_SPRINT |
| IMPLEMENTATION | 05_IMPLEMENTATION |
| TEST | 06_TESTING |
| DEBUG / FAILURE ANALYSIS | 07_DEBUGGING |
| REVIEW | 08_CODE_REVIEW |
| ACCEPTANCE | DoD / Release readiness (09 + 14) |
| AUDIT RECORD | Decision Log (+ ADR when required) |
| RETROSPECTIVE | 10_RETROSPECTIVE |

---

## 3. Personal Brain Target Architecture

### Core product loop

```text
External World
      ↓
AI Understanding          (agents / skills under Execution Harness)
      ↓
Human Confirmation        (Human Approval Gate — owner-attributable)
      ↓
Personal Verified Knowledge
      ↓
Decision Model            (FUTURE boundary — not implemented this alignment)
```

### Professional knowledge exploration (example: “AI Agent market”)

```text
Research Brief
      ↓
Research Agent
      ↓
Validation Agent
      ↓
Knowledge Proposal
      ↓
Human Review              (Execution Harness Human Approval Gate)
      ↓
Knowledge Storage         (Knowledge Engine apply + apply token)
      ↓
Graph Connection          (Graph Agent / Graph Engine)
      ↓
Future Decision Support   (Decision Model — future)
```

### Bridge design (architecture only — no UI, no Runtime rewrite)

```text
Personal Brain request (library API / future Experience surface)
      ↓
Map to ResearchBrief + tenancy (workspace owner)
      ↓
Execution Harness admission (Runtime)   ← required; no bypass
      ↓
Pipeline execution (knowledge-ingestion or personal-scoped variant)
      ↓
Review Gates + Human Gate (owner)
      ↓
Knowledge apply → Graph → personal index / retrieval
```

**Rules for the bridge:**

1. Multi-agent research → SoR **must** go through Execution Harness (Constitution Art. XIII).  
2. Personal Brain **core** remains a product consumer of Knowledge/Graph/Trust/Kernel — it must not become a second orchestrator.  
3. Simple local capture/approve may remain product-owned **only if** SoR writes still use Knowledge Engine approval attribution and never invent a parallel Harness.  
4. No UI in this alignment or in SPRINT-PB-HARNESS-BRIDGE-001.  
5. No Decision Agent implementation; boundary only (below).

### Future Decision boundary (definition only)

| Concept | Meaning | Status |
|---------|---------|--------|
| **Decision Model** | Owner-scoped, versioned representation of preferences, constraints, and past decisions used to support future choices | **Future SPEC** — not implemented |
| **Decision Artifact** | Schema-shaped, sealable artifact type for a decision (or decision support pack) with provenance to verified knowledge | **Future** `/artifacts` + `/schemas` |
| **Decision Agent** | Contracted agent that proposes decision support; never auto-applies SoR; subject to Human Approval | **Future contract** — **do not invent a fake agent now** |

---

## 4. Documentation Changes Required

### A. Terminology alignment (must)

| File | Change |
|------|--------|
| `CONSTITUTION.md` | Global Definitions: keep **Harness** = Execution; add **Development Harness** = Engineering Process alias; Art. I / XIII cross-ref that `/engineering` must not host a second execution state machine |
| `docs/ARCHITECTURE.md` | Dual-Harness section; Experience Plane may *request* Execution Harness; Development Harness is process, not orchestrator |
| `engineering/README.md` | One subsection: “Development Harness (alias)” = this directory; map PLAN…RETROSPECTIVE ↔ stage docs; clarify Agent Contract ≠ Engineering Agent |
| `harness/HARNESS_SPECIFICATION.md` | Purpose/Scope note: this document is **Execution Harness** only; Development Harness lives in `/engineering` |
| `MASTER_ARCHITECTURE.md` | Align naming if it still equates Harness loosely with all governance |
| `docs/adr/README.md` (Decision Log) | Append entry after approval of this proposal |

### B. Personal Brain SPEC / status reconciliation (must)

| File | Change |
|------|--------|
| `personal-brain/specs/SPEC-PROD-002.md` | Remove/supersede UI, `npm run dev`, HTTP product surface; state library core + adapters; note UI removed |
| `personal-brain/specs/SPEC-PROD-003.md` | Rephrase Ask human workflow as **core service** APIs (not `POST /api/*` / Playwright UI); keep propose→approve/edit/reject/learn semantics |
| `personal-brain/MODULE_STATUS.md` | Next = **Harness bridge** (not “new product UI first”); link this proposal |
| Optional: `SPEC-PROD-004` (new, after approval) | Personal Brain ↔ Execution Harness bridge (ResearchBrief admission) — **spec only in sprint, after this proposal APPROVE** |

### C. Obsolete / historical (mark, do not delete without Founder)

| Path | Disposition |
|------|-------------|
| `personal-brain/stage/REAL_ACCEPTANCE_REPORT.md` | Historical UI UAT — stamp **superseded by UI removal** |
| `personal-brain/stage/ACCEPTANCE_AUDIT.md` / gaps | Historical HTTP audit — stamp superseded |
| `personal-brain/stage/reviews/real-uat/*` | Historical — keep as audit record |
| `personal-brain/docs/LOCAL_PRODUCT_TEST.md` | Already deleted with UI |
| Specs that still require Playwright / `npm run dev` | **Obsolete clauses** until reconciled (B) |

### D. Explicitly out of scope for doc pass

- No Runtime/SDK rewrite  
- No new fake agent contracts  
- No Decision Agent contract file until a future SPEC  
- No UI docs revival  

### E. ADR recommendation

After Founder APPROVE of this proposal: short **ADR** (or Decision Log-only if Architect judges no topology change) stating:

> Development Harness ≡ Engineering Process; Harness ≡ Execution Harness; Personal Brain multi-agent knowledge exploration admits via Runtime.

---

## 5. Implementation Sprint Proposal

### SPRINT-PB-HARNESS-BRIDGE-001

**Status:** Proposed — **do not start until this Architecture Alignment Proposal is APPROVED**

#### Goal

Align Personal Brain with Execution Harness so a professional research request can be **admitted**, **pipelined**, **human-gated**, and applied to **personal verified knowledge + graph** — without UI, without Decision Agent, without Runtime/SDK rewrites, without Harness bypass.

#### Scope

1. Documentation dual-Harness naming (Constitution / ARCHITECTURE / engineering README / Harness Spec pointer).  
2. Reconcile SPEC-PROD-002/003 + MODULE_STATUS with UI-removed reality.  
3. Author **SPEC-PROD-004** (or amendment): Personal Brain → Runtime admit → `knowledge-ingestion` (or personal-scoped pipeline) → Human Gate → Knowledge → Graph.  
4. Architecture Review + ADR/Decision Log as required.  
5. Minimal **library-level** bridge design spike (interfaces only / thin adapter sketch **only if** Architecture Reviewer and Founder approve implementation sub-tasks after SPEC acceptance) — default this sprint is **docs + SPEC + review chain**.

#### Non-goals

- Product UI / frontend / dashboard  
- Decision Agent / Decision Model implementation  
- Fake agents  
- Rewriting Runtime or SDK  
- Bypassing Harness for SoR writes  
- Replacing Engineering Process  
- Full production skill host for every Skill Spec entry  

#### Tasks

| # | Task | Owner type |
|---|------|------------|
| T1 | Dual-Harness terminology doc updates (Constitution, ARCHITECTURE, engineering README, Harness Spec note) | Docs / Architect |
| T2 | SPEC-PROD-002/003 reconciliation; MODULE_STATUS update | PO / Spec |
| T3 | SPEC-PROD-004 bridge: ResearchBrief from Personal Brain → Runtime admit → pipeline → owner Human Gate → Knowledge/Graph | Spec |
| T4 | Agent review chain + Founder business approval | Engineering Agents |
| T5 | ADR or Decision Log entry locking dual-Harness + bridge | Architect |
| T6 | (Optional, gated) Interface-only bridge stub tests that **refuse** non-Harness SoR path for research briefs | Tech Lead |

#### Acceptance Criteria

1. Docs state unambiguously: **Harness = Execution Harness**; **Development Harness = Engineering Process**.  
2. SPEC-PROD-002/003 no longer require removed UI/HTTP/Playwright.  
3. SPEC-PROD-004 (or equivalent) accepted: research exploration is Harness-admitted.  
4. MODULE_STATUS next milestone = Harness bridge, not UI-first.  
5. Decision Model/Agent listed only as **future boundary** — no fake implementation.  
6. No Kernel/Trust/Runtime/SDK source rewrites in this sprint.  
7. Engineering Process documents remain SoT for development lifecycle (aliased, not replaced).

#### Tests Required

| Test | When |
|------|------|
| Doc consistency checklist (terminology grep: no “Harness” meaning Engineering Process without qualifier) | After T1 |
| Spec acceptance review artifacts (agent chain) | After T2–T4 |
| If T6 approved: unit tests that research-brief path **cannot** call Knowledge apply without Runtime admit / approval token semantics | After SPEC-PROD-004 accepted |
| Regression: existing Personal Brain **core** unit tests still PASS | Continuous |
| Explicitly **not** required: Playwright, UI smoke, Decision Agent tests | — |

---

## Approval Gate

| Role | Required |
|------|----------|
| Product Owner Agent | Review product/spec impact |
| Chief Architect Agent | Dual-Harness + bridge boundary |
| Tech Lead Agent | Feasibility of SPEC-PROD-004 without Runtime rewrite |
| Engineering Manager Agent | Sprint readiness |
| Architecture Reviewer Agent | Constitution / Art. XIII compliance |
| **Founder** | Business APPROVE / REJECT |

**Until Founder APPROVE: no implementation of SPRINT-PB-HARNESS-BRIDGE-001.**

---

## Summary

This proposal **aligns naming and product target architecture** with the Constitution: one Execution Harness, one Development Harness alias for Engineering Process, Personal Brain as a consumer that must admit multi-agent exploration through Runtime, and Decision capabilities deferred as an explicit future boundary.
