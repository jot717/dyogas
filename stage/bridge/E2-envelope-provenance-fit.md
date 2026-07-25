# E2 — Envelope Provenance Fit vs Schemas

**Task:** T-E2  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Depends on:** T-E1  
**SoT:** `schemas/common/artifact-envelope.schema.json` · `/artifacts/README.md` · per-type `/schemas/artifacts/*`  
**Mode:** Implementation Mode (compatibility analysis only — **no** schema/Runtime/SDK/Host/DB changes)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Determine whether **existing** sealed artifact envelopes can carry E1 lineage provenance requirements. Record **PASS** or **GAP** per assertion — do not invent fields.

---

## Required provenance fields (from E1)

| Need | E1 IDs |
|------|--------|
| Run identity | LA-RUN-01 |
| Pipeline identity | LA-PIPE-01 |
| Correlation | LA-CORR-01 |
| Tenant / workspace | LA-TEN-01 |
| Agent + contract version | LA-AGT-01, LA-CTR-01 |
| Parent / input lineage | LA-RR-01 … LA-GU-01 |
| Brief join | LA-BRF-01/02 |
| Approval actor / token path | LA-HRD-01/02 |
| Digest / seal integrity | implied by trusted path |

---

## Existing envelope compatibility

### Shared envelope (`artifact-envelope.schema.json`)

| Envelope field | Required? | Fits E1 need | Verdict |
|----------------|-----------|--------------|---------|
| `artifact_id` / `artifact_version` | **Yes** | Node identity | **PASS** |
| `artifact_type` | **Yes** | Kind (8 sealed types) | **PASS** for sealed stages; **GAP** for Brief (not in enum) |
| `run_id` | **Yes** | LA-RUN-01 | **PASS** |
| `produced_by` (`agent@contract_version`) | **Yes** | LA-AGT-01, LA-CTR-01 | **PASS** (wire pin format) |
| `created_at` | **Yes** | Audit timestamp | **PASS** |
| `digest` | **Yes** | Tamper-evidence / handoff | **PASS** |
| `tenancy.tenant_id` | **Yes** | LA-TEN-01 | **PASS** |
| `tenancy.workspace_id` | Optional | LA-TEN-01 workspace | **PASS*** (product must populate; not schema-required) |
| `schema_version` | **Yes** | Payload schema pin | **PASS** |
| `parents[]` | **Optional** | Input lineage | **GAP-BR-018** — not required by schema |
| `correlation_id` | **Absent** | LA-CORR-01 | **GAP-BR-017** |
| `pipeline_id` / `pipeline_version` | **Absent** | LA-PIPE-01 | **GAP-BR-017** |

\*Workspace: envelope allows `workspace_id`; Bridge product rule (A3) requires it on Brief — sealed artifacts should carry it when known.

### Artifact type enum vs trusted path

| Kind | In envelope enum? | Schema file | Fit |
|------|-------------------|-------------|-----|
| ResearchBrief | **No** | None (`/artifacts`) | **GAP-BR-001** (existing) |
| ResearchReport | Yes | `research-report.schema.json` | **PASS** (+ `brief_ref.brief_id`) |
| ValidationReport | Yes | present | **PASS** |
| Proposal | Yes | present | **PASS** |
| HumanReviewDecision | Yes | present (`subject_refs`, `approver`, `apply_token`) | **PASS** for LA-HRD-01/02 payload fields |
| Knowledge | Yes | present | **PASS** |
| GraphUpdate | Yes | present | **PASS** |
| EmbeddingJob / MemoryUpdate | Yes | present (`source_refs`) | **PASS** for LA-EJ/MU |

---

## PASS / GAP per E1 assertion

| Assertion ID | Envelope / schema fit | Result |
|--------------|----------------------|--------|
| LA-RUN-01 | `run_id` required | **PASS** |
| LA-PIPE-01 | No pipeline fields on envelope; use Host `HostRun.pin` + Host lineage | **GAP-BR-017** |
| LA-CORR-01 | No `correlation_id` on envelope; Host lineage / CreateRun only | **GAP-BR-017** |
| LA-TEN-01 | `tenancy.tenant_id` required; `workspace_id` optional | **PASS** (enforce workspace in product/Host policy) |
| LA-AGT-01 | `produced_by` required | **PASS** |
| LA-CTR-01 | `produced_by` includes `@contract_version` | **PASS** (wire; markdown Contract Version 2.0.0 remains contracts README §4 / GAP-BR-010) |
| LA-BRF-01 | Brief not sealed envelope type | **GAP-BR-001** |
| LA-BRF-02 | `ResearchReport.payload.brief_ref` + Host lineage | **PASS** with **GAP-BR-005** (stamp timing) |
| LA-RR-01 | Envelope + `brief_ref`; parents optional | **PASS*** / **GAP-BR-018** if parents empty |
| LA-VR-01 | Envelope + parents optional | **PASS*** / **GAP-BR-018** |
| LA-PR-01 | Envelope + parents optional | **PASS*** / **GAP-BR-018** |
| LA-HRD-01 | Envelope + `subject_refs` + `approver` | **PASS** |
| LA-HRD-02 | `outcome` + `apply_token` in payload | **PASS** |
| LA-KN-01 | Envelope + parents optional | **PASS*** / **GAP-BR-018** |
| LA-GU-01 | Envelope + parents optional | **PASS*** / **GAP-BR-018** |
| LA-EJ-01 / LA-MU-01 | `source_refs` in payload | **PASS** |
| LA-AUD-* | Trust audit sink (not envelope) | **PASS** (Host/Harness; out of envelope schema) |

\*Structural capability exists; Bridge lineage PASS should **require** populated `parents[]` as policy without changing schema (register GAP if Host emits empty parents).

---

## Contract version tracking

| Mechanism | Location | Fit |
|-----------|----------|-----|
| Agent contract wire pin | `produced_by` = `{agent}@{version}` | **PASS** for sealed artifacts |
| Payload schema pin | `schema_version` | **PASS** |
| Pipeline version | Host pin / CreateRun — **not** on envelope | **GAP-BR-017** |
| Markdown Contract Version 2.0.0 vs wire | contracts README §4 | Existing **GAP-BR-010** (monitor) |

---

## Compatibility verdict

| Question | Answer |
|----------|--------|
| Can existing envelopes carry core sealed-stage provenance? | **Mostly yes** — id, version, type, run_id, produced_by, digest, tenancy, parents (when filled), type payloads |
| Enough alone for full E1 without Host lineage? | **No** — missing Brief-as-envelope, `correlation_id`, `pipeline_id`/`pipeline_version`; `parents` not schema-mandatory |
| Schema changes this task? | **None** — GAPs only |

**Bridge posture:** Assert E1 using **envelope fields where PASS** + **Host lineage / CreateRun / pin** to cover GAP-BR-017; do not invent envelope fields here.

---

## New GAPs

### GAP-BR-017

| Field | Content |
|-------|---------|
| **GAP ID** | GAP-BR-017 |
| **Source Task** | T-E2 |
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
| **Source Task** | T-E2 |
| **Description** | Envelope `parents[]` is optional in `artifact-envelope.schema.json`, but E1 trusted-path assertions expect parent linkage. Empty parents weaken walkable lineage. |
| **Impact** | Bridge lineage PASS should treat missing parents as fail (Host/policy) without schema bump in this sprint. |
| **Severity** | Medium |
| **Owner Area** | Host emit policy / Architecture |
| **Status** | **OPEN** |
| **Decision Required** | Policy enforce vs future schema `required` — Spec/ADR if schema changes. |
| **Blocking Current Sprint?** | **NO** |

---

## Verification

| AC | Met? |
|----|------|
| PASS/GAP per checklist item | **Yes** |
| No schema changes authored | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-E2-T1 | Envelope required fields mapped to E1 | **PASS** |
| T-E2-T2 | Brief/correlation/pipeline/parents gaps recorded | **PASS** |
| T-E2-T3 | HumanReviewDecision payload fields fit LA-HRD | **PASS** |
| T-E2-T4 | No schema/Runtime/SDK/Host/DB implementation | **PASS** |

---

## Evidence

`personal-brain/stage/bridge/E2-envelope-provenance-fit.md` (this file)

---

## Next

**T-E3** — Lineage PASS evidence for sprint exit.

---

**End of E2-envelope-provenance-fit**
