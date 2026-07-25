# F4 — Minimal Personal Brain Host Test Harness

**Task:** T-F4  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Depends on:** T-F3, T-B5 (**AVAILABLE**)  
**Cites:** B2 pin · B3 tenancy/audit · B4 entry · F3 RUNNABLE_NOW subset  
**Mode:** Implementation Mode (**harness definition** — Host public APIs only; **no** Runtime/SDK/Host rewrite; **no** production Bridge code; **no** UI; **no** Agent logic)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Define the **minimal** Personal Brain–side Host test harness that proves Bridge entry via **`ExecutionHost.createRun()`** and related public Host methods, scoped to F3 **RUNNABLE_NOW** items.

**B5:** **AVAILABLE** → not `F4-skipped-blocked.md`.  
**This artifact:** harness contract + evidence plan (executable suite may be added later under this design without expanding scope).

---

## Boundary

```text
Personal Brain test harness
        ↓  @dyogas/execution-host public facade ONLY
createExecutionHost → createRun / getRun / resumeHuman /
                      applyKnowledgeAuthorized / applyGraphAuthorized
        ↓  (Host-internal — harness must NOT import)
Runtime.admitRun / agents / SDK bind
```

| Allowed | Forbidden |
|---------|-----------|
| `@dyogas/execution-host` public API | Direct `@dyogas/runtime` import/call |
| `personal-brain/src/bridge/pipeline-pin.ts` | Modify Runtime / SDK / Execution Host |
| In-memory / fixture AuditSink | Production APIs, UI, Agent logic |
| Static import scan (FC-13) | Invent schemas / pipeline topology |

---

## Test entry

| Step | Action |
|------|--------|
| 1 | Ensure ambient Kernel tenancy + Trust identity for fixture `tenant_id` (B3 / GAP-BR-012 workaround) **before** createRun |
| 2 | `const host = createExecutionHost({ auditSink?: fixtureSink })` |
| 3 | `const pin = selectApprovedPipelineForCreateRun()` |
| 4 | Build fixture `CreateRunRequest` (below) |
| 5 | `const run = await host.createRun(req)` **or** expect throw/fail for refuse cases |
| 6 | Collect evidence (run_id, pin, status, lineage, audit events) |
| 7 | Optional post-create: `getRun`, `resumeHuman`, `applyKnowledgeAuthorized` — only when F3 marks reachable |

**Package entry:** `import { createExecutionHost } from "@dyogas/execution-host"`  
**Pin entry:** `import { selectApprovedPipelineForCreateRun } from "../src/bridge/pipeline-pin.js"` (or package path used by PB tests)

---

## createRun request (fixture shape)

Illustrative fields — **no new schema**; ResearchBrief-shaped bootstrap (A2/B4):

```ts
const pin = selectApprovedPipelineForCreateRun();

const req = {
  ...pin, // pipeline_id: "knowledge-ingestion", pipeline_version: "2.0.0"
  tenant_id: FIXTURE_TENANT_ID,
  caller_id: FIXTURE_OWNER_ID,
  correlation_id: FIXTURE_CORRELATION_ID,
  bootstrap: {
    question: "Research AI Agent market",
    scope: /* fixture — GAP-BR-002 */,
    allowed_source_classes: /* fixture — GAP-BR-003 */,
    budget: { max_items: /* fixture — GAP-BR-004 */ },
    tenancy: {
      tenant_id: FIXTURE_TENANT_ID, // must === req.tenant_id
      workspace_id: FIXTURE_WORKSPACE_ID,
    },
  },
  // audit_sink?: fixtureSink — optional; prefer shared Trust sink when available
};
```

### Refuse variants (FC-01)

| Variant | Mutation | Expected |
|---------|----------|----------|
| Bad pipeline_id | `"not-knowledge-ingestion"` | Host fail closed (`PIPELINE_UNKNOWN` / unsupported) — **or** product pin helper throws first if using `selectApprovedPipelineForCreateRun` |
| Bad version | `"9.9.9"` | Host `PIPELINE_VERSION_MISMATCH` / unsupported |
| Missing pin fields | omit version | Host `PIPELINE_VERSION_REQUIRED` |
| Tenancy misalign | bootstrap.tenant ≠ req.tenant_id | Product fail-closed **before** call (B4); if called anyway, Runtime/Host fail per ambient (GAP-BR-012) |

---

## Expected Host response

### Success path (HP-01-ENTRY / EV-RUN-*)

| Field | Expect |
|-------|--------|
| `run_id` | Non-empty string |
| `pin.pipeline_id` | `knowledge-ingestion` |
| `pin.pipeline_version` | `2.0.0` |
| `status` | One of HostRunStatus (`created` \| `running` \| `waiting_human` \| …) — **not** invent statuses |
| `lineage.correlation_id` | Equals request `correlation_id` (EV-RUN-02) |

Harness **PASS** for entry does **not** require `succeeded` or sealed Knowledge (HP-01-FULL = DESIGN_ONLY).

### Fail path (FC-01)

| Expect |
|--------|
| createRun rejects / throws **or** returns terminal `failed` without trusted SoR |
| No claim of Verified Knowledge |
| Audit/denial observable when sink attached |

---

## Required public APIs

| API | Package | Harness use |
|-----|---------|-------------|
| `createExecutionHost` | `@dyogas/execution-host` | Factory |
| `createRun` | Host facade | Primary entry |
| `getRun` | Host facade | Observe status/lineage |
| `resumeHuman` | Host facade | FC-04/05/09 when `waiting_human` reachable |
| `applyKnowledgeAuthorized` | Host facade | FC-06/07 / V6 when applicable |
| `applyGraphAuthorized` | Host facade | Out of minimal entry scope (DESIGN_ONLY chain) |
| Types: `CreateRunRequest`, `HostRun`, `HumanDecision` | Host public types | Typing only |

**Not required / not allowed in harness:** any `@dyogas/runtime` symbol; SDK agent bind; Host-internal `resumeHumanGate` / `mintApplyToken` direct imports (prefer facade).

---

## Cases in this harness (F3 subset)

| Case | In F4 harness? | Notes |
|------|----------------|-------|
| **HP-01-ENTRY** | **Yes** | createRun + pin + HostRun |
| **FC-01** | **Yes** | Refuse bad pin / tenancy prep |
| **FC-13** / **V1** | **Yes** | Static: PB Bridge must not import Runtime as orchestrator |
| **EV-RUN-01…03** | **Yes** | From successful createRun (+ lineage) |
| **FC-06, FC-07, FC-09, V6, V7** | **Conditional** | Only if Gate/`waiting_human` reachable **without** Host rewrite; else **SKIP** record in evidence |
| **FC-04, FC-05, FC-11** | **Conditional** | Same Gate/tenancy limits; FC-11 partial |
| **HP-01-FULL**, FC-02/03/08/10/12, EV-ART-* | **No** | DESIGN_ONLY (F3) |

### Skip rule (Gate-dependent)

If after createRun the run never enters `waiting_human` without Host/agent fixture hooks:

```text
SKIP: FC-04, FC-05, FC-09 (Gate), FC-07 (needs mint), …
REASON: Gate unreachable without Host rewrite / agent stubs (F3)
DO NOT: modify Execution Host to unblock
```

---

## Evidence collection

| Evidence ID | Collect | Maps to |
|-------------|---------|---------|
| **EV-F4-01** | Call site uses `createExecutionHost` + `createRun` only | V1 / ADR-0010 |
| **EV-F4-02** | Request pin = knowledge-ingestion@2.0.0 via `selectApprovedPipelineForCreateRun` | B2 / LA-PIPE-01 |
| **EV-F4-03** | Response `run_id` + echoed `pin` | EV-RUN-01 |
| **EV-F4-04** | `lineage.correlation_id` match | EV-RUN-02 |
| **EV-F4-05** | `tenant_id` / bootstrap tenancy alignment attempt | EV-RUN-03 / LA-TEN-01 |
| **EV-F4-06** | FC-01 denial (error code or failed status) | F2 FC-01 |
| **EV-F4-07** | Static scan: no product `@dyogas/runtime` orchestrator import in Bridge surface | FC-13 |
| **EV-F4-08** | SKIP list + reason for Gate-dependent cases | F3 conditional |
| **EV-F4-09** | Optional: fixture AuditSink events for create/admit if sink wired | partial EV-AUD-01 |

Store evidence under test output or append to sprint exit pack at **T-G2** (pointers only).

---

## PASS / FAIL criteria

### Harness PASS (minimal)

All of:

1. B5 AVAILABLE honored; harness uses **Host public APIs only**.  
2. HP-01-ENTRY: successful createRun yields `run_id` + pin `knowledge-ingestion` / `2.0.0` **or** documented env precondition failure treated as **infra skip** (not Bridge design FAIL).  
3. FC-01: at least one refuse variant fail-closed.  
4. FC-13/V1: no direct Runtime orchestrator from PB Bridge surface.  
5. EV-RUN-01…03 collected on success path (or SKIP with ambient Kernel reason).  
6. Gate-dependent cases either exercised **or** SKIP with F3 reason — never Host rewrite.  
7. No production Bridge feature code; no UI; no Agent logic added.

### Harness FAIL

Any of:

- Harness imports/calls `@dyogas/runtime` as orchestrator.  
- Harness modifies Runtime / SDK / Execution Host.  
- Claims HP-01-FULL / Verified Knowledge without Gate+token path.  
- Treats DESIGN_ONLY cases as PASS without evidence.  
- Invents new APIs/schemas/pipeline ids.

---

## Non-goals (this task)

| Non-goal | Rationale |
|----------|-----------|
| Implement full automated suite in-repo | User scope: harness **definition**; production code forbidden |
| Full agent LLM E2E | HP-01-FULL DESIGN_ONLY |
| Close GAP-BR-012 Host assert | Host rewrite forbidden |
| UI / Decision Agent | Sprint Non-Goals |

---

## GAPs

**No new GAP.** Open items affect live execution only:

| GAP | Harness impact |
|-----|----------------|
| GAP-BR-012 | Ambient Kernel/Trust must be set; no Host tenant assert |
| GAP-BR-002…005, 014 | Fixture Brief completeness for createRun beyond pin smoke |
| GAP-BR-011 | Retain caller_id for later resumeHuman |
| GAP-BR-017 | Lineage join via Host snapshot for EV-RUN-02 |

---

## Verification

| AC | Met? |
|----|------|
| B5 AVAILABLE → harness defined (not skip-blocked) | **Yes** |
| Host public APIs only | **Yes** |
| createRun request + expected response | **Yes** |
| Evidence + PASS/FAIL | **Yes** |
| No Runtime/SDK/Host/UI/Agent/production code | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-F4-T1 | Entry + request + response documented | **PASS** |
| T-F4-T2 | Public API list = Host facade | **PASS** |
| T-F4-T3 | F3 RUNNABLE_NOW subset + SKIP rule | **PASS** |
| T-F4-T4 | No platform/production implementation | **PASS** |

---

## Evidence

`personal-brain/stage/bridge/F4-minimal-host-test-harness.md` (this file)

(Registry alternate: test code under `personal-brain/` — **deferred**; this document is the authorized harness SoT for Band F follow-up. B5 ≠ BLOCKED → not `F4-skipped-blocked.md`.)

---

## Next

**T-G1** — MODULE_STATUS / SPEC-PROD-004 accepted hygiene.

---

**End of F4-minimal-host-test-harness**
