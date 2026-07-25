# A3 — Tenancy / Owner Binding for ResearchBrief

**Task:** T-A3  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`)  
**Depends on:** T-A1 (T-A2 map referenced)  
**Mode:** Implementation Mode (design deliverable)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Document how **ResearchBrief** and `ExecutionHost.createRun` carry **workspace ownership** and **tenancy** by **consuming** existing Kernel / Host / contract rules.

**Does not:** invent a tenancy model, identity system, Kernel child-scope API, or schemas.

---

## Existing platform rules (consume only)

| Source | Binding rule |
|--------|----------------|
| **ADR-0009** | Workspace ownership maps to Kernel tenancy; personal boundary = **tenant + owner id**. Product **SHALL NOT** modify Kernel. |
| **Kernel API** (`kernel/API.md`) | `createTenantId`, `createTenancyContext`, `requireTenant`, `assertSameTenant`, `TenancyError` — deny-by-default |
| **Kernel child-scope** (`kernel/docs/child-scope-nongoal.md`) | Nested workspace/child-scope API **deferred** — not available; do not invent |
| **Research Agent contract** §6 | Brief `tenancy`: `{ tenant_id` (required), `workspace_id` (optional) `}` |
| **Host CreateRunRequest** | `tenant_id`, `caller_id`, `correlation_id` + `bootstrap` (Brief-shaped Record) |
| **SPEC-PROD-004 AC-1 / AC-4** | Brief has workspace tenancy + owner correlation; Human Approval attributable to owner |

---

## Mapping: Research Request → tenancy on Brief / createRun

| Product field (A1) | Platform field | Rule |
|--------------------|----------------|------|
| *(derived)* | `bootstrap.tenancy.tenant_id` | **Required.** Must equal Kernel-valid `TenantId` for the personal workspace’s tenancy boundary (ADR-0009). Product resolves workspace → existing tenant id **without** Kernel child-scope API. |
| `workspace_id` | `bootstrap.tenancy.workspace_id` | **Required for Personal Brain Bridge** (product rule). Carried as optional contract field for lineage within tenant. **Not** a Kernel nested-scope API. |
| `owner_id` | CreateRun `caller_id` | **Required.** Attributable human owner; used later as Human Approval `actor_id` class (Host `HumanDecision.actor_id`). |
| `owner_id` | *(not* a Kernel tenancy field*)* | Owner is **identity**, not `tenant_id`. Personal boundary = tenant **+** owner (ADR-0009). |
| `correlation_id` | CreateRun `correlation_id` | Product correlation for audit/lineage join across Brief → run → Knowledge. |
| CreateRun `tenant_id` | Must **match** `bootstrap.tenancy.tenant_id` | Fail closed on mismatch (cross-tenant / inconsistent admit). |

```text
workspace_id + owner_id  (Research Request)
        ↓  product resolve (no Kernel fork)
tenant_id (Kernel TenantId) + owner_id
        ↓
bootstrap.tenancy = { tenant_id, workspace_id }
createRun.tenant_id = tenant_id
createRun.caller_id = owner_id
        ↓
ExecutionHost.createRun(…)
```

---

## Fail-closed conditions

| Condition | Behavior |
|-----------|----------|
| Missing `owner_id` or `workspace_id` | **Do not** form Brief; **do not** `createRun` |
| Cannot resolve `workspace_id` → Kernel `tenant_id` | **Do not** invent tenant; **do not** `createRun` |
| `createRun.tenant_id` ≠ `bootstrap.tenancy.tenant_id` | **Do not** call / abort — tenancy inconsistency |
| Attempt to use agent id as `caller_id` / future `actor_id` | **Forbidden** (Harness §9 / Host HumanDecision) |
| Cross-tenant Brief or handoff | Platform deny-by-default (`assertSameTenant` / Host+Runtime) — product must not request cross-tenant runs |

---

## Lineage implications

1. Every trusted-path artifact after Brief must remain under the same `tenant_id` isolation boundary.  
2. Verified Knowledge (SPEC-PROD-004) must remain traceable to Brief + owner approval — owner identity on Request/`caller_id` enables attributable Human Approval.  
3. `workspace_id` on Brief tenancy supports product-side indexing of outcomes per workspace **inside** the tenant; it does not create a second SoR or Kernel scope.  
4. `correlation_id` links product Request → Host run → lineage snapshot without embedding PII in Kernel ids.  
5. Empty / wrong tenancy → no lineage chain starts (fail closed before Research stage).

---

## Explicit non-proposals

| Forbidden | Why |
|-----------|-----|
| New tenancy model | Art. VI / ADR-0009 consume Kernel |
| New identity / IdP system | Out of task; GAP-EH-002 remains Host/product concern for later |
| Kernel child-scope / workspace API | Deferred non-goal — do not implement |
| Kernel / Runtime / SDK / Harness / schema changes | Task + Spec Non-Goals |

---

## Verification

### Acceptance Criteria

| # | Criterion | Met? |
|---|-----------|------|
| 1 | How workspace owner maps to tenancy on Brief | **Yes** (table + flow) |
| 2 | Fail-closed if unbound | **Yes** |
| 3 | No Kernel modification proposed | **Yes** |

### Tests (doc conformance)

| Test ID | Check | Result |
|---------|-------|--------|
| T-A3-T1 | ADR-0009 tenant+owner boundary cited | **PASS** |
| T-A3-T2 | Kernel APIs listed consume-only; child-scope deferred respected | **PASS** |
| T-A3-T3 | Brief `tenancy.tenant_id` required; `workspace_id` product-required | **PASS** |
| T-A3-T4 | Fail-closed rules present | **PASS** |
| T-A3-T5 | Lineage implications recorded | **PASS** |

### Scope boundary

- **In:** Documentation of binding using existing Kernel + Host + contract fields.  
- **Out:** Kernel/Runtime/SDK/Harness/schema code; new identity; new tenancy model.

---

## Evidence

`personal-brain/stage/bridge/A3-tenancy-owner-binding.md` (this file)

Inputs (read-only): ADR-0009; `kernel/API.md`; `kernel/docs/child-scope-nongoal.md`; research-agent contract §6; SPEC-PROD-004; A1; Host `CreateRunRequest`.

---

## Next

**T-A4** — Record Brief schema gaps (depends on T-A2 + T-A3).

---

**End of A3-tenancy-owner-binding**
