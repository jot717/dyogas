# C3 — Stage Artifact Emit Map

**Task:** T-C3  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE · SPEC-AGT-000  
**Depends on:** T-C1, T-C2  
**Mode:** Implementation Mode (mapping only — **no** new schemas/contracts; **no** Runtime/SDK/Host/engine edits)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Define **artifact flow** per `knowledge-ingestion` stage: who emits which existing platform artifact. Confirm producing stages for Bridge-critical types (`ResearchReport`, `Proposal`, `Knowledge`, `GraphUpdate`).

Trusted path (SPEC-AGT-000 §5.5):

```text
ResearchBrief → ResearchReport → ValidationReport → Proposal
  → HumanReviewDecision → Knowledge → GraphUpdate
  (+ EmbeddingJob → MemoryUpdate)
```

Agents emit **candidates**; Host/Runtime seal under Harness — no product self-seal.

---

## Emit index (platform artifact → producing stage)

| Platform artifact | `/artifacts` SoT | Producing stage | Contract |
|-------------------|------------------|-----------------|----------|
| `ResearchBrief` | **No** dedicated file (bootstrap) | Pre-stage / Stage 1 **input** | — (product + Host bootstrap) |
| `ResearchReport` | `artifacts/research-report.md` | **Stage 1** | SPEC-AGT-001 |
| `ValidationReport` | `artifacts/validation-report.md` | **Stage 2** | SPEC-AGT-002 |
| `Proposal` | `artifacts/proposal.md` | **Stage 3** | SPEC-AGT-003 |
| `HumanReviewDecision` | `artifacts/human-review-decision.md` | **Stage 4** | SPEC-AGT-004 + **Human** |
| `Knowledge` | `artifacts/knowledge.md` | **Stage 5** | SPEC-AGT-005 (+ Knowledge Engine apply) |
| `GraphUpdate` | `artifacts/graph-update.md` | **Stage 6** | SPEC-AGT-006 |
| `EmbeddingJob` | `artifacts/embedding-job.md` | **Stage 7** | SPEC-AGT-007 |
| `MemoryUpdate` | `artifacts/memory-update.md` | **Stage 8** | SPEC-AGT-008 |
| `PainStatement` | **No** `/artifacts` file | Stage 3 **input** (pipeline prose) | — |

**Registry AC:** Each named Bridge platform type has producing stage(s): ResearchReport→1, Proposal→3, Knowledge→5, GraphUpdate→6.

---

## Per-stage emit records

### Stage 1 — Research

| Field | Content |
|-------|---------|
| **Stage ID** | `knowledge-ingestion` / Stage **1** |
| **Purpose** | Discover evidence; emit research pack |
| **Input artifact** | `ResearchBrief` (bootstrap — not sealed SoR) |
| **Agent Contract responsible** | SPEC-AGT-001 `research-agent` |
| **Output artifact** | `ResearchReport` |
| **Artifact owner** | Knowledge Platform Engineering (stage); sealed under Harness/Host |
| **Verification requirement** | Schema-valid; provenance or empty+gaps; budget; Review Gate pass |
| **Human approval boundary** | None — automated Review Gate only |

### Stage 2 — Validation

| Field | Content |
|-------|---------|
| **Stage ID** | Stage **2** |
| **Purpose** | Credibility judgment over research evidence |
| **Input artifact** | `ResearchReport` |
| **Agent Contract responsible** | SPEC-AGT-002 `source-validation-agent` |
| **Output artifact** | `ValidationReport` |
| **Artifact owner** | Knowledge Platform Engineering |
| **Verification requirement** | Full evidence coverage; rubric; provenance; Review Gate pass |
| **Human approval boundary** | None — automated Review Gate only |

### Stage 3 — Proposal

| Field | Content |
|-------|---------|
| **Stage ID** | Stage **3** |
| **Purpose** | Decision-ready proposal for possible SoR path |
| **Input artifact** | `ValidationReport` (+ `PainStatement` in stage input) |
| **Agent Contract responsible** | SPEC-AGT-003 `proposal-agent` |
| **Output artifact** | `Proposal` |
| **Artifact owner** | Knowledge Platform Engineering |
| **Verification requirement** | Pain/metrics/non-goals; citations to accepted only; Review Gate pass |
| **Human approval boundary** | Not here — human decides at Stage 4 |

### Stage 4 — Human Review

| Field | Content |
|-------|---------|
| **Stage ID** | Stage **4** |
| **Purpose** | Mandatory Human Approval Gate |
| **Input artifact** | `Proposal` |
| **Agent Contract responsible** | SPEC-AGT-004 `knowledge-review-agent` (package); **Human Approver** (outcome) |
| **Output artifact** | `HumanReviewDecision` (+ `apply_token` iff `approved`) |
| **Artifact owner** | Human Approver Roster (outcome); platform seals decision artifact |
| **Verification requirement** | Harness §9 outcome; approved ⇒ checklist + single-use token bound to Proposal version |
| **Human approval boundary** | **This stage** — agents cannot set final `approved` / mint token as self-approval |

### Stage 5 — Markdown

| Field | Content |
|-------|---------|
| **Stage ID** | Stage **5** |
| **Purpose** | Faithful Knowledge authoring + SoR apply under token |
| **Input artifact** | `HumanReviewDecision` (`approved`) + `Proposal` + `apply_token` |
| **Agent Contract responsible** | SPEC-AGT-005 `markdown-agent`; apply via Knowledge Engine (not a new contract) |
| **Output artifact** | `Knowledge` |
| **Artifact owner** | Knowledge Plane SoR (after apply); artifact sealed under Harness/Host |
| **Verification requirement** | Valid token↔Proposal bind; schema-valid Knowledge; provenance; Review Gate pass |
| **Human approval boundary** | Already at Stage 4 — fail closed without token |

### Stage 6 — Graph

| Field | Content |
|-------|---------|
| **Stage ID** | Stage **6** |
| **Purpose** | Graph connection from verified Knowledge |
| **Input artifact** | `Knowledge` |
| **Agent Contract responsible** | SPEC-AGT-006 `knowledge-graph-agent` |
| **Output artifact** | `GraphUpdate` |
| **Artifact owner** | Knowledge Platform Engineering / Graph store under policy |
| **Verification requirement** | Provenance; ontology; consistency; authorized apply mode when required; Review Gate pass |
| **Human approval boundary** | No new human gate — must not treat unverified Proposal as trusted graph truth |

### Stage 7 — Embedding

| Field | Content |
|-------|---------|
| **Stage ID** | Stage **7** |
| **Purpose** | Embedding job for retrieval |
| **Input artifact** | `Knowledge` (primary); `GraphUpdate` optional |
| **Agent Contract responsible** | SPEC-AGT-007 `embedding-agent` |
| **Output artifact** | `EmbeddingJob` |
| **Artifact owner** | Knowledge Platform Engineering; Trust (egress) |
| **Verification requirement** | Authorized profile; chunk map; egress OK; Review + Egress/Policy Gate |
| **Human approval boundary** | None — never replaces Stage 4 |

### Stage 8 — Memory

| Field | Content |
|-------|---------|
| **Stage ID** | Stage **8** |
| **Purpose** | Auditable memory persist |
| **Input artifact** | `Knowledge` + `EmbeddingJob` (+ optional `GraphUpdate`) |
| **Agent Contract responsible** | SPEC-AGT-008 `memory-agent` |
| **Output artifact** | `MemoryUpdate` |
| **Artifact owner** | Knowledge Platform Engineering; Trust (retention/tenancy) |
| **Verification requirement** | Authorized op; no covert SoR; token when required; audit complete |
| **Human approval boundary** | None — never replaces Stage 4 |

---

## Flow diagram

```text
[Product Request]
      ↓
ResearchBrief (bootstrap) ──GAP-BR-001: no /artifacts file──┐
                                                            ↓
Stage 1  ResearchReport ← research-agent
      ↓
Stage 2  ValidationReport ← source-validation-agent
      ↓
Stage 3  Proposal ← proposal-agent   (PainStatement input — see GAP-BR-014)
      ↓
Stage 4  HumanReviewDecision ← KR agent + Human
      ↓  (apply_token on approved)
Stage 5  Knowledge ← markdown-agent (+ Knowledge Engine apply)
      ↓
Stage 6  GraphUpdate ← knowledge-graph-agent
      ↓
Stage 7  EmbeddingJob ← embedding-agent
      ↓
Stage 8  MemoryUpdate ← memory-agent
```

---

## Missing definitions (register only — do not invent)

| Item | Status | GAP |
|------|--------|-----|
| `ResearchBrief` as `/artifacts` + `/schemas/artifacts` | Missing by design today (bootstrap + Research Agent input) | **GAP-BR-001** (existing OPEN) |
| `PainStatement` as `/artifacts` file | Pipeline requires Stage 3 input; **no** `artifacts/pain-statement.md` | **GAP-BR-014** **OPEN** (new) |
| All Stage 1–8 primary outputs | Present under `/artifacts` | No new GAP |

Do **not** create schemas or artifact files in this task.

---

## Verification

| AC | Met? |
|----|------|
| Each platform artifact type has producing stage(s) named | **Yes** — emit index + Stages 1–8 |
| Bridge-critical: ResearchReport, Proposal, Knowledge, GraphUpdate | **Yes** — Stages 1, 3, 5, 6 |

| Test ID | Check | Result |
|---------|-------|--------|
| T-C3-T1 | Emit index covers trusted-path + Embedding/Memory | **PASS** |
| T-C3-T2 | Per-stage fields complete (I/O, contract, HA, verification) | **PASS** |
| T-C3-T3 | Missing Brief/PainStatement recorded as GAP only | **PASS** |
| T-C3-T4 | No schema/contract/Runtime/SDK/Host/engine edits | **PASS** |

### Scope boundary

- **In:** Documentation under `personal-brain/stage/bridge/`.  
- **Out:** New artifact schemas; contracts; Runtime/SDK/Host; Knowledge/Graph engine code.

---

## Evidence

`personal-brain/stage/bridge/C3-stage-artifact-emit-map.md` (this file)

---

## Next

**T-C4** — Memory/Embedding personal-workspace notes (or **T-D1** Human Approval map).

---

**End of C3-stage-artifact-emit-map**
