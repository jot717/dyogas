# C1 — Bridge Narrative ↔ knowledge-ingestion Stage Map

**Task:** T-C1  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`) §5  
**Pipeline:** `pipelines/knowledge-ingestion.md` v2.0.0  
**Execution package:** `docs/dev-orch/execution-packages/PREPARED-PB-BRIDGE-T-C1.md`  
**Mode:** Implementation Mode (mapping only — no Runtime/SDK/Harness/Host edits; no new topology)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Map Personal Brain Bridge **narrative** stages (SPEC-PROD-004 §5) onto the existing pinned **`knowledge-ingestion`** pipeline stages. Confirm **no new pipeline topology**.

---

## Pinned topology (unchanged)

```text
Research → Validation → Proposal → Human Review → Markdown → Graph → Embedding → Memory
```

Host entry (product): `ExecutionHost.createRun()` → Host → Runtime primitives (ADR-0010). Not a pipeline stage.

---

## Master map

| # | Bridge narrative (SPEC-PROD-004 §5) | Pipeline stage | Map kind | Notes |
|---|-----------------------------------|----------------|----------|-------|
| — | **Request** (owner research intent) | *(none)* | **Pre-pipeline** | Product Research Request (A1) — outside `/pipelines` |
| — | **Research Brief** | Stage 1 **input** (`ResearchBrief` bootstrap) | **Bootstrap** | Not a sealed stage; Host `createRun.bootstrap` |
| — | **Host createRun** | *(none — Host entry)* | **Entry** | Product → Host only; not Runtime orchestrator |
| 4a | Research (within “Research → Validation → Proposal”) | **Stage 1 — Research** | **1:1** | Producer: Research Agent → `ResearchReport` |
| 4b | Validation | **Stage 2 — Validation** | **1:1** | Producer: Source Validation Agent → `ValidationReport` |
| 4c | Proposal | **Stage 3 — Proposal** | **1:1** | Producer: Proposal Agent → `Proposal` |
| 5 | **Human Review** | **Stage 4 — Human Review** | **1:1** | Human Approval Gate; `HumanReviewDecision` + apply_token on `approved` |
| 6 | **Verified Knowledge** | **Stage 5 — Markdown** | **1:1** (product name) | Platform emits/applies `Knowledge` after approval; product “Verified Knowledge” = approved SoR Knowledge |
| 7 | **Graph Connection** | **Stage 6 — Graph** | **1:1** | `GraphUpdate` from Knowledge Graph Agent |
| — | *(implied by topology line; not numbered in narrative)* | **Stage 7 — Embedding** | **Pipeline-only / continue** | Required by pinned pipeline; product consumption detail → T-C4 |
| — | *(implied by topology line; not numbered in narrative)* | **Stage 8 — Memory** | **Pipeline-only / continue** | Required by pinned pipeline; product notes → T-C4 |
| — | **Decision Model** (product loop “future”) | *(none)* | **Skip — out of scope** | SPEC-PROD-004 Non-Goal / future; no new stage |

---

## Narrative step ↔ artifacts

| Bridge concept | Platform artifact / event |
|----------------|---------------------------|
| Request | Product-only (no sealed artifact) |
| Research Brief | `ResearchBrief` (bootstrap) |
| Research Result | `ResearchReport` (Stage 1) |
| *(validation)* | `ValidationReport` (Stage 2) |
| Knowledge Proposal | `Proposal` (Stage 3) |
| Owner decision | `HumanReviewDecision` (Stage 4) |
| Verified Knowledge | `Knowledge` (Stage 5) |
| Graph Connection | `GraphUpdate` (Stage 6) |
| *(retrieval support)* | `EmbeddingJob` (Stage 7), `MemoryUpdate` (Stage 8) |

---

## Merge / skip reasons (explicit)

| Item | Reason |
|------|--------|
| Spec narrative collapses Research→Validation→Proposal into one bullet | **Not a merge of stages** — three pipeline stages remain; Bridge narrative is abbreviated |
| Spec “Verified Knowledge” vs Stage name “Markdown” | **Name mapping only** — Stage 5 produces/applies `Knowledge`; no topology change |
| Embedding + Memory absent from numbered narrative 1–7 | **Continue with pipeline** — topology line already lists them; document here; product surface → T-C4 |
| Decision Model | **Skip** — future product boundary; forbidden to invent stage |
| Supporting Notification / Learning agents | **Not canonical stages** — observe/branch per pipeline; never replace Stage 4 |

---

## Topology confirmation

| Question | Answer |
|----------|--------|
| New pipeline stages invented? | **No** |
| Stages removed from `knowledge-ingestion`? | **No** |
| Personal-scoped pipeline? | **No** (GAP-BR-013 deferred) |
| Product may skip Validation or Human Review? | **No** |

```text
Bridge narrative  ⊆  knowledge-ingestion stages + product pre-entry
        (no superset topology)
```

---

## Verification

| AC | Met? |
|----|------|
| 1:1 or documented merge/skip-with-reason | **Yes** — Stages 1–6 1:1 to narrative; 7–8 continue-with-reason; pre-entry + Decision Model skip-with-reason |
| Confirms no new topology | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-C1-T1 | All 8 pipeline stages appear in map | **PASS** |
| T-C1-T2 | Bridge §5 narrative steps covered | **PASS** |
| T-C1-T3 | No new stage / topology proposed | **PASS** |
| T-C1-T4 | Forbidden platform paths untouched | **PASS** |

### Scope boundary

- **In:** Documentation map only.  
- **Out:** Runtime/SDK/Harness/Host; contracts; schemas; pipeline file edits; T-C2… later tasks.

### GAPs

No new GAP registered. Embedding/Memory product surfacing deferred to **T-C4** (existing task), not a new topology gap.

---

## Evidence

`personal-brain/stage/bridge/C1-bridge-to-pipeline-stage-map.md` (this file)

---

## Next

**T-C2** — Product roles → existing agent contracts (depends on T-C1).

---

**End of C1-bridge-to-pipeline-stage-map**
