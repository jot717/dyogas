# A1 — Research Request Inputs

**Task:** T-A1  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`)  
**Mode:** Implementation Mode (design deliverable — no Host/Runtime/SDK/Harness code)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Define the **product-side** “Research Request” inputs that Personal Brain collects before mapping to platform `ResearchBrief` (T-A2) and calling `ExecutionHost.createRun()` (Band B).

No UI design. No invented Host/Runtime APIs.

---

## Required fields

| Field | Meaning | Owner binding | Notes |
|-------|---------|---------------|-------|
| `intent` | Natural-language research question or topic (e.g. “Research AI Agent market”) | Must be attributable to the requesting **workspace owner** | Maps toward Brief `question` |
| `workspace_id` | Personal Brain workspace identifier | Required — Request is workspace-scoped | Used with owner for tenancy (T-A3) |
| `owner_id` | Attributable human owner of the workspace | Required — fail closed if missing | Human Approval later must be same attributable class (Spec AC-4) |
| `correlation_id` | Product-side correlation for the request | Required for lineage / audit join | Distinct from Host `run_id` (assigned at createRun) |

---

## Optional fields (placeholders allowed)

| Field | Meaning | Notes |
|-------|---------|-------|
| `scope_hints` | Topic bounds, include/exclude themes, geography, time window | Maps toward Brief `scope` / `constraints` |
| `constraints` | Hard limits stated by owner (e.g. “public sources only”) | Maps toward Brief `constraints` |
| `allowed_source_classes` | Preferred source classes if owner states them | Maps toward Brief `allowed_source_classes`; default = pipeline/contract allowlist if omitted |
| `budget_placeholder` | Soft budget hint (time/cost/units) | Maps toward Brief `budget`; Host/pipeline enforce real budget — product does not invent Host budget APIs |
| `notes` | Free-text non-authoritative context | Must not be treated as sealed artifact content (Harness: notes are not decision inputs) |

---

## Explicitly out of Research Request

| Item | Why |
|------|-----|
| UI layout / screens | SPEC-PROD-004 Non-Goal; AC-8 presentation-agnostic |
| Direct agent calls / Runtime `admitRun` as orchestrator | Product requests **Execution Host** only (AC-2) |
| Invented Host/Runtime API fields | Band B inventories real Host surfaces |
| Decision Model / Decision Agent fields | Future; out of Spec |
| Trusted Knowledge payload | Request is pre-Brief; SoR writes only after Human Approval |

---

## Workspace owner tie-in

1. Every Research Request **MUST** carry `workspace_id` + `owner_id`.  
2. Unbound owner → **fail closed** — do not form Brief or call `createRun` (T-A3 expands tenancy mapping).  
3. Owner identity is the same class used later for Human Approval surfacing (product obligation; Host enforces gate).

---

## Relation to platform Brief (preview — T-A2 owns mapping)

Per pipeline `ResearchBrief` bootstrap: `question`, `scope`, `constraints`, `allowed_source_classes`, `budget`, `run_id`, `tenancy`.

| Product Research Request | Platform Brief (conceptual) |
|--------------------------|----------------------------|
| `intent` | `question` |
| `scope_hints` / `constraints` | `scope` / `constraints` |
| `allowed_source_classes` | `allowed_source_classes` |
| `budget_placeholder` | `budget` |
| `workspace_id` + `owner_id` | `tenancy` (detail in T-A3) |
| `correlation_id` | product correlation; `run_id` from Host |

---

## Acceptance Criteria (T-A1)

| # | Criterion | Met? |
|---|-----------|------|
| 1 | Required vs optional fields listed | Yes |
| 2 | Ties to workspace owner | Yes (`workspace_id`, `owner_id`) |
| 3 | No UI | Yes |
| 4 | No invented Host/Runtime APIs | Yes |

---

## Next

**T-A2** — Map Research Request → platform `ResearchBrief` field-level using existing `/artifacts` / `/schemas` / pipeline docs.

---

**End of A1-research-request-inputs**
