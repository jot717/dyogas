# E1 — Lineage Assertion Checklist

**Task:** T-E1  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE §6  
**Depends on:** T-A2, T-C3 · cites D4, C2, Host `TRUSTED_PATH_ORDER`  
**Mode:** Implementation Mode (checklist / contract only — **no** lineage system implementation; **no** Runtime/SDK/Host/DB schema)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Define **lineage assertions** Personal Brain / verifiers must be able to check for a Bridge `knowledge-ingestion` run so Verified Knowledge remains traceable to Brief, run, Proposal, and human approval.

Canonical chain (SPEC-PROD-004 §6 + Host trusted path):

```text
ResearchBrief → ResearchReport → ValidationReport → Proposal
  → HumanReviewDecision → Knowledge → GraphUpdate
```

(+ EmbeddingJob / MemoryUpdate per C3/C4 — supporting; not SoR)

---

## Identity & binding assertions

| Assertion ID | Concern | Assert | Fail closed if |
|--------------|---------|--------|----------------|
| **LA-RUN-01** | Run identity | `HostRun.run_id` present and equals lineage `run_id` on every trusted-path record | Missing/mismatched `run_id` |
| **LA-PIPE-01** | Pipeline identity | `pin.pipeline_id` = `knowledge-ingestion` and `pin.pipeline_version` frozen (B2) | Wrong/unpinned pipeline |
| **LA-CORR-01** | Correlation | Product `correlation_id` equals Host lineage `correlation_id` / CreateRun field | Orphan Request vs run |
| **LA-TEN-01** | Owner/workspace binding | `tenant_id` consistent across CreateRun, Brief tenancy, lineage; `workspace_id` on Brief; `caller_id`/owner attributable (A3) | Cross-tenant / unbound owner |
| **LA-AGT-01** | Agent identity | Each sealed stage output attributable to bound contract producer (C2 SPEC-AGT-*), not product-local swarm | Unbound / invented agent |
| **LA-CTR-01** | Contract version | Stage bind uses published contract pin (Host stage-map / SPEC-AGT-000); wire vs markdown version per contracts README §4 | Missing contract pin at admit/bind |

---

## Trusted-path node assertions

| Assertion ID | Node | Assert |
|--------------|------|--------|
| **LA-BRF-01** | ResearchBrief | Bootstrap id/ref present in Host lineage (or `brief-{correlation_id}`); carries tenancy; **not** SoR |
| **LA-BRF-02** | ResearchBrief ↔ run | Brief eventually joinable to `run_id` (GAP-BR-005 if stamp timing unclear) |
| **LA-RR-01** | ResearchReport | Exists; `parents`/`parent_ids` → Brief; same `run_id`/`tenant_id`/`pipeline_id` |
| **LA-VR-01** | ValidationReport | Exists; lineage → ResearchReport; same run/tenant |
| **LA-PR-01** | Proposal | Exists; lineage → ValidationReport; same run/tenant |
| **LA-HRD-01** | HumanReviewDecision | Exists; subject → Proposal; non-pending outcome for terminal SoR path; **human** actor (D3) |
| **LA-HRD-02** | Approval → Knowledge | If Knowledge exists: decision was `approved` + apply_token consumed (D2) |
| **LA-KN-01** | Knowledge | Exists only after LA-HRD-02; lineage → HumanReviewDecision + Proposal; SoR apply audited |
| **LA-GU-01** | GraphUpdate | If present: lineage → Knowledge; same run/tenant (C4: not SoR) |

### Supporting (optional for Bridge S-AC lineage; still pipeline-complete)

| Assertion ID | Node | Assert |
|--------------|------|--------|
| **LA-EJ-01** | EmbeddingJob | If present: `source_refs` → Knowledge (+ optional GraphUpdate); index ≠ SoR |
| **LA-MU-01** | MemoryUpdate | If present: `source_refs` → Knowledge + EmbeddingJob; memory ≠ SoR |

---

## Input / output lineage (per agent stage)

| Stage | Input lineage assert | Output lineage assert |
|-------|----------------------|------------------------|
| 1 Research | Brief bootstrap in context | ResearchReport parents → Brief |
| 2 Validation | ResearchReport sealed | ValidationReport parents → ResearchReport |
| 3 Proposal | ValidationReport (+ PainStatement input — GAP-BR-014) | Proposal parents → ValidationReport |
| 4 Human Review | Proposal sealed | HumanReviewDecision subject → Proposal |
| 5 Markdown | approved HRD + Proposal + token | Knowledge parents → HRD/Proposal |
| 6 Graph | Knowledge sealed | GraphUpdate parents → Knowledge |
| 7 Embedding | Knowledge (+ opt GraphUpdate) | EmbeddingJob source_refs |
| 8 Memory | Knowledge + EmbeddingJob | MemoryUpdate source_refs |

Agents emit **candidates**; Host/Runtime seal — product does not forge lineage digests.

---

## Audit requirements

| Assertion ID | Audit expect |
|--------------|--------------|
| **LA-AUD-01** | Host/Runtime events share Trust sink for run (B3) |
| **LA-AUD-02** | Human decision event with human `actor_id` (D3/D4) |
| **LA-AUD-03** | Token mint/consume (or Host equivalent) before Knowledge apply (D2) |
| **LA-AUD-04** | No SoR write audit without Gate `approved` lineage |

---

## Checklist usage

1. After a Bridge run (or fixture), evaluate each **LA-*** ID → PASS / FAIL / N/A.  
2. Knowledge claimed as Verified Personal Knowledge requires **LA-BRF-01**, **LA-RUN-01**, **LA-RR-01**…**LA-KN-01**, **LA-HRD-02**, **LA-TEN-01**, **LA-AUD-02/03**.  
3. Envelope field fit → **T-E2**. Lineage PASS evidence pack → **T-E3**.

---

## GAPs

| Item | Disposition |
|------|-------------|
| Brief `run_id` stamp timing | Existing **GAP-BR-005** OPEN |
| ResearchBrief not `/artifacts` | Existing **GAP-BR-001** OPEN |
| PainStatement artifact file | Existing **GAP-BR-014** OPEN |
| Envelope field sufficiency | Deferred to **T-E2** (not a new GAP here) |

**New GAPs this task:** none.

---

## Verification

| AC | Met? |
|----|------|
| Checklist covers full chain | **Yes** — Brief→…→GraphUpdate (+ supporting) |
| Each node has assertion id | **Yes** — LA-* ids |

| Test ID | Check | Result |
|---------|-------|--------|
| T-E1-T1 | SPEC §6 chain + ValidationReport covered | **PASS** |
| T-E1-T2 | Run/pipeline/agent/contract/tenancy assertions present | **PASS** |
| T-E1-T3 | Approval before Knowledge asserted (LA-HRD-02) | **PASS** |
| T-E1-T4 | No lineage system / Runtime / SDK / Host / DB schema implemented | **PASS** |

### Scope boundary

- **In:** Checklist documentation under `personal-brain/stage/bridge/`.  
- **Out:** Implementing lineage store; platform edits; schema authoring.

---

## Evidence

`personal-brain/stage/bridge/E1-lineage-assertion-checklist.md` (this file)

---

## Next

**T-E2** — Envelope provenance fit vs schemas (PASS/GAP per checklist item).

---

**End of E1-lineage-assertion-checklist**
