# C2 — Stage → Agent Contract Map

**Task:** T-C2  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`) §8  
**Layer:** SPEC-AGT-000 (`accepted`) — Host binds `SPEC-AGT-001`…`010` / `/contracts/agents/*` only  
**Depends on:** T-C1 (`C1-bridge-to-pipeline-stage-map.md`)  
**Mode:** Implementation Mode (mapping only — **no** new contracts; **no** Runtime/SDK/Host/topology edits)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Map each `knowledge-ingestion` stage to an **existing** Agent Contract (SPEC-AGT-*), plus product-role crosswalk. Confirm product **Knowledge Agent** is a **role** only — not a new contract.

---

## Bind path (consume only)

```text
Personal Brain → ExecutionHost.createRun()
        → Host binds stage producer via SDK
        → existing /contracts/agents/* only
```

Products must not bind agents to orchestrate pipelines (SPEC-AGT-000 §5.2).

---

## Stage → contract matrix

### Stage 1 — Research

| Field | Content |
|-------|---------|
| **Stage purpose** | Discover evidence within budget; emit research pack |
| **Required capability** | Source discovery + provenance-bearing report (no fabrication) |
| **Existing agent contract** | `research-agent` · `contracts/agents/research-agent.md` · **SPEC-AGT-001** · v2.0.0 |
| **Input artifact** | `ResearchBrief` (bootstrap) |
| **Output artifact** | `ResearchReport` |
| **Verification requirement** | Schema-valid report; provenance or explicit empty+gaps; budget; **Review Gate** pass |
| **Human approval boundary** | **None at this stage** — automated Review Gate only; must not seal trusted Knowledge |

### Stage 2 — Validation

| Field | Content |
|-------|---------|
| **Stage purpose** | Credibility / source validation of research evidence |
| **Required capability** | Independent rubric judgment over ResearchReport items |
| **Existing agent contract** | `source-validation-agent` · `contracts/agents/source-validation-agent.md` · **SPEC-AGT-002** · v2.0.0 |
| **Input artifact** | `ResearchReport` |
| **Output artifact** | `ValidationReport` |
| **Verification requirement** | Every evidence id covered; statuses + rubric; no accepted item without provenance; **Review Gate** pass |
| **Human approval boundary** | **None** — automated Review Gate only; must not approve SoR |

### Stage 3 — Proposal

| Field | Content |
|-------|---------|
| **Stage purpose** | Decision-ready proposal for what may become knowledge |
| **Required capability** | Pain + metrics + citations to accepted sources only |
| **Existing agent contract** | `proposal-agent` · `contracts/agents/proposal-agent.md` · **SPEC-AGT-003** · v2.0.0 |
| **Input artifact** | `ValidationReport` (+ `PainStatement` in stage input) |
| **Output artifact** | `Proposal` |
| **Verification requirement** | Pain/metrics/non-goals; citations; `requires_human_approval` when SoR path; **Review Gate** pass |
| **Human approval boundary** | **Not here** — human decides at Stage 4 against this output |

### Stage 4 — Human Review

| Field | Content |
|-------|---------|
| **Stage purpose** | Mandatory Human Approval Gate before SoR-authorizing path |
| **Required capability** | Review package prep + **attributable human outcome** |
| **Existing agent contract** | `knowledge-review-agent` · `contracts/agents/knowledge-review-agent.md` · **SPEC-AGT-004** · v2.0.0 (**package only**) |
| **Input artifact** | `Proposal` |
| **Output artifact** | `HumanReviewDecision` (+ `apply_token` iff `approved`) |
| **Verification requirement** | Outcome ∈ Harness §9 set; `approved` ⇒ checklist + single-use token bound to Proposal version; agent must **not** mint token as self-approval |
| **Human approval boundary** | **HERE** — only Human Approver Roster may set final outcome; agents cannot satisfy the gate |

### Stage 5 — Markdown (Verified Knowledge path)

| Field | Content |
|-------|---------|
| **Stage purpose** | Faithful authoring + Knowledge Plane apply under token |
| **Required capability** | Markdown/Knowledge emit; consume valid `apply_token`; SoR write only when authorized |
| **Existing agent contract** | `markdown-agent` · `contracts/agents/markdown-agent.md` · **SPEC-AGT-005** · v2.0.0 |
| **Knowledge Apply** | **Not a separate agent contract** — Knowledge Engine apply path + Host authorize apply (SPEC-PROD-004 §8); consumes Stage 4 token |
| **Input artifact** | `HumanReviewDecision` (`approved`) + `Proposal` + `apply_token` |
| **Output artifact** | `Knowledge` |
| **Verification requirement** | Token binds to Proposal version; schema-valid Knowledge; claim provenance; **Review Gate** pass |
| **Human approval boundary** | **Already satisfied at Stage 4** — no second human gate; invalid/missing token → fail closed |

### Stage 6 — Graph

| Field | Content |
|-------|---------|
| **Stage purpose** | Connect verified Knowledge into graph structures |
| **Required capability** | Derive nodes/edges with provenance; consistency |
| **Existing agent contract** | `knowledge-graph-agent` · `contracts/agents/knowledge-graph-agent.md` · **SPEC-AGT-006** · v2.0.0 |
| **Input artifact** | `Knowledge` |
| **Output artifact** | `GraphUpdate` |
| **Verification requirement** | Provenance; ontology profile; consistency; apply mode only with policy authorization when required; **Review Gate** pass |
| **Human approval boundary** | **No new human gate** — must not graph-write unverified proposals as trusted truth |

### Stage 7 — Embedding

| Field | Content |
|-------|---------|
| **Stage purpose** | Vector index job for retrieval support |
| **Required capability** | Authorized embedding profile + egress-safe compute |
| **Existing agent contract** | `embedding-agent` · `contracts/agents/embedding-agent.md` · **SPEC-AGT-007** · v2.0.0 |
| **Input artifact** | `Knowledge` (primary); `GraphUpdate` optional |
| **Output artifact** | `EmbeddingJob` |
| **Verification requirement** | Profile authorized; chunk map; egress OK; **Review Gate** + Egress/Policy Gate |
| **Human approval boundary** | **None** — never replaces Stage 4 |

### Stage 8 — Memory

| Field | Content |
|-------|---------|
| **Stage purpose** | Auditable memory persist for recall |
| **Required capability** | Memory op with tenancy/token policy |
| **Existing agent contract** | `memory-agent` · `contracts/agents/memory-agent.md` · **SPEC-AGT-008** · v2.0.0 |
| **Input artifact** | `Knowledge` + `EmbeddingJob` (+ optional `GraphUpdate`) |
| **Output artifact** | `MemoryUpdate` |
| **Verification requirement** | Authorized op result; no covert SoR; token when required; audit complete |
| **Human approval boundary** | **None** — never replaces Stage 4 |

---

## Supporting contracts (not canonical stages)

| Contract | SPEC | Role | Human approval |
|----------|------|------|----------------|
| `notification-agent` | SPEC-AGT-010 | Inform pending/critical | Must not decide |
| `learning-agent` | SPEC-AGT-009 | `Proposal(kind=lesson)` re-enters Stage 3/4 | Must not auto-apply / replace Stage 4 |

---

## Product role → contract crosswalk (SPEC-PROD-004 §8)

| Product role | Maps to existing | Must not |
|--------------|------------------|----------|
| **Research Agent** | SPEC-AGT-001 `research-agent` | Seal trusted Knowledge; skip Validation |
| **Knowledge Agent** *(role only)* | SPEC-AGT-002 + 003 + 005 + Knowledge Engine apply (no new contract) | Bypass Human Approval; invent sources; imply new contract named Knowledge Agent |
| **Graph Agent** | SPEC-AGT-006 `knowledge-graph-agent` (+ Graph Engine) | Graph-write unverified proposals as truth |
| **Decision Agent (future)** | **No contract in this SPEC** | Auto-accept; replace human judgment |

**Verdict:** Product Knowledge Agent role → **existing contracts only**. **No new Agent Contract proposed.**

---

## Missing contract check

| Need | Present? | GAP? |
|------|----------|------|
| Stages 1–8 producers | Yes — SPEC-AGT-001…008 | **No** |
| Knowledge Review package | Yes — SPEC-AGT-004 | **No** |
| Human Approver | Human roster (not an agent contract) | **No** — by design |
| Knowledge Apply engine path | Engine + Host authorize (not SPEC-AGT-*) | **No** — not missing agent; do not invent apply-agent |
| Decision Agent | Absent | **Out of scope** — not required for Bridge |

**New GAPs this task:** none.

---

## Verification

| AC (registry) | Met? |
|---------------|------|
| Knowledge Agent role maps only to existing contracts | **Yes** |
| No new contract proposed | **Yes** |

| User field coverage | Met? |
|---------------------|------|
| Stage purpose / capability / contract / I/O / verification / HA boundary per stage | **Yes** (Stages 1–8) |

| Test ID | Check | Result |
|---------|-------|--------|
| T-C2-T1 | Each stage cites SPEC-AGT-* + `/contracts/agents/*` | **PASS** |
| T-C2-T2 | Stage 4 human-only final outcome; agent cannot approve | **PASS** |
| T-C2-T3 | Knowledge Agent role ≠ new contract | **PASS** |
| T-C2-T4 | No Runtime/SDK/Host/pipeline/contract file edits | **PASS** |

### Scope boundary

- **In:** Documentation map under `personal-brain/stage/bridge/`.  
- **Out:** New contracts; SDK/Runtime/Host; topology; Agent API invention.

---

## Evidence

`personal-brain/stage/bridge/C2-stage-agent-contract-map.md` (this file)

(Registry historical name `C2-product-role-to-contract-map.md` superseded by this filename per execution request; content covers both stage matrix and product-role crosswalk.)

---

## Next

**T-C3** — Stage artifact emit map (`ResearchReport`, `Proposal`, `Knowledge`, `GraphUpdate`).

---

**End of C2-stage-agent-contract-map**
