# C4 — Memory / Embedding / Personal Workspace Boundary

**Task:** T-C4  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE · SPEC-AGT-000  
**ADR:** ADR-0009 (Personal Brain product layer)  
**Depends on:** T-C1, T-C2, T-C3  
**Mode:** Implementation Mode (boundary notes only — **no** schemas; **no** engine/Runtime/SDK/Host edits)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Document **boundaries only** between pipeline artifacts and **Knowledge / Embedding / Memory / Personal Workspace**.

**Posture:** Consume `knowledge-ingestion` Stages 7–8 **as-is**. **No** pipeline topology fork. **No** parallel Knowledge SoR in Memory or vectors.

---

## Hard boundary rules

| Rule | Statement |
|------|-----------|
| Knowledge SoR | Only sealed `Knowledge` after Stage 4 `approved` + Stage 5 apply may enter the Knowledge Plane |
| Vectors | `EmbeddingJob` / vector index = **index, never SoR** (`artifacts/embedding-job.md`) |
| Memory | `MemoryUpdate` = governed memory transaction; **never a parallel knowledge SoR** (`artifacts/memory-update.md`) |
| Workspace | Personal boundary = Kernel **tenant + owner** (ADR-0009); `workspace_id` on Brief tenancy (A3) — not a Kernel child-scope |
| Product Ask | Personal Brain **indexes** outcomes for Ask; does not invent embedding/memory engines (ADR-0009) |
| Human Approval | Stages 7–8 do **not** replace Stage 4; they never promote Proposal → trusted Knowledge |

```text
… → Stage 4 Human Approval → Stage 5 Knowledge (SoR)
        ↓
Stage 6 GraphUpdate
        ↓
Stage 7 EmbeddingJob  (index only)
        ↓
Stage 8 MemoryUpdate  (not SoR)
        ↓
Personal Brain indexes refs for Ask (product layer)
```

---

## Artifact eligibility matrix

Legend: **Yes** / **No** / **N/A** (artifact is itself that layer) / **After HA** (only after Stage 4 approved path).

| Artifact | Source stage | → Knowledge (SoR)? | → Embedding? | → Memory? | Workspace ownership | Human approval | Verification |
|----------|--------------|--------------------|--------------|-----------|---------------------|----------------|--------------|
| `ResearchBrief` | Bootstrap | **No** | **No** | **No** | `tenancy.tenant_id` + `workspace_id` + owner/`caller_id` | N/A (pre-pipeline) | Brief/tenancy consistency (A3); not sealed SoR |
| `ResearchReport` | Stage 1 | **No** | **No** | **No** | Same run tenant | **No** (Review Gate only) | Schema + provenance; Review Gate |
| `ValidationReport` | Stage 2 | **No** | **No** | **No** | Same run tenant | **No** | Coverage + rubric; Review Gate |
| `Proposal` | Stage 3 | **No** (awaiting HA) | **No** | **No** | Same run tenant | **No** at emit — decides at Stage 4 | Pain/citations; Review Gate |
| `HumanReviewDecision` | Stage 4 | Gate only | **No** | **No** | Owner = approver class | **Yes — mandatory gate** | §9 outcome; token iff `approved` |
| `Knowledge` | Stage 5 | **Yes (N/A — is SoR)** | **Yes** (Stage 7 primary input) | **Yes** (Stage 8 source_ref) | Tenant of sealed Knowledge; workspace via lineage/Brief | **Already required** at Stage 4; token bind | Token↔Proposal; schema; Review Gate; SoR apply |
| `GraphUpdate` | Stage 6 | **No** (graph ≠ Knowledge SoR) | **Optional** input to Stage 7 | **Optional** source_ref Stage 8 | Same tenant | No new HA; policy token if `mode=apply` | Provenance; ontology; Review Gate |
| `EmbeddingJob` | Stage 7 | **No** (index ≠ SoR) | **N/A** (is embedding record) | **Yes** (Stage 8 input) | Profile authorized for **tenancy**; egress-cleared | **No** new HA | Profile + chunk_map + egress; Review + Egress Gate |
| `MemoryUpdate` | Stage 8 | **No** (memory ≠ SoR) | **No** | **N/A** (is memory record) | Retention/tenancy policy; no covert SoR | **No** new HA; `persist` may need **policy token** | Explicit result; no duplicate SoR; Review Gate |
| `PainStatement` | Stage 3 input | **No** | **No** | **No** | Same run | N/A | **GAP-BR-014** — no `/artifacts` file |

---

## Personal Workspace vs pipeline layers

| Layer | Who owns write | Personal Brain role |
|-------|----------------|---------------------|
| Knowledge Plane SoR | Knowledge Engine apply after HA + token | Consume sealed `Knowledge` refs; never silent write |
| Graph | Graph Agent / MOD-GRAPH | Consume `GraphUpdate`; index for Ask |
| Embedding (pipeline Stage 7) | Embedding Agent → vector index subsystem | **Do not** invent second embedding SoR; may **index** results |
| Memory (pipeline Stage 8) | Memory Agent → memory subsystem | **Do not** treat as trusted Knowledge; audit/recall only |
| Product Ask index | Personal Brain (ADR-0009 local-hash / similarity) | Product-local retrieval aid — **not** pipeline Topology; must not bypass HA for SoR |

**Consume-as-is:** Bridge uses existing Stages 7–8; no personal-scoped pipeline fork (GAP-BR-013 DEFERRED).

---

## Open questions (GAP — do not solve here)

| ID | Unknown | Status |
|----|---------|--------|
| **GAP-BR-015** | Exact product binding: how Personal Brain Ask/index joins Host-run `EmbeddingJob` / `MemoryUpdate` vs ADR-0009 “local-hash Embedding remain MOD-GRAPH; PB only indexes” | **OPEN** |
| GAP-BR-001 | ResearchBrief not first-class `/artifacts` | OPEN (existing) |
| GAP-BR-014 | PainStatement missing `/artifacts` | OPEN (existing) |

---

## Explicit non-proposals

| Forbidden | Why |
|-----------|-----|
| New Memory/Embedding schemas | Task + Spec |
| Memory/Knowledge/Graph engine edits | Sprint hard rule |
| Runtime / SDK / Host rewrite | Sprint hard rule |
| Pipeline fork / skip Embedding or Memory | Topology consume-as-is |
| Promote Proposal → Embedding/Memory without Knowledge | Violates HA + SoR rules |

---

## Verification

| AC (registry) | Met? |
|---------------|------|
| Consume-as-is posture stated | **Yes** |
| Open questions listed | **Yes** (GAP-BR-015) |
| No pipeline fork proposed | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-C4-T1 | Eligibility matrix covers trusted-path + Embedding/Memory artifacts | **PASS** |
| T-C4-T2 | Pre-HA artifacts cannot enter Knowledge/Embedding/Memory as SoR/index source | **PASS** |
| T-C4-T3 | Vectors/Memory marked non-SoR | **PASS** |
| T-C4-T4 | No schema/engine/Runtime/SDK/Host edits; GAPs registered not fixed | **PASS** |

### Scope boundary

- **In:** Boundary documentation under `personal-brain/stage/bridge/`.  
- **Out:** Implementing Ask↔Embedding join; new artifacts; engine code.

---

## Evidence

`personal-brain/stage/bridge/C4-memory-embedding-boundary.md` (this file)

(Registry historical name `C4-memory-embedding-personal-notes.md` superseded by this filename per execution request.)

---

## Band C complete

T-C1…T-C4 **DONE**. Next: **T-D1** (Human Approval outcome map).

---

**End of C4-memory-embedding-boundary**
