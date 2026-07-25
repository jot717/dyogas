# B4 — Host Entry Contract Note (Personal Brain → `createRun`)

**Task:** T-B4  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`) §9  
**ADR:** ADR-0010 Accepted  
**Depends on:** T-B2, T-B3, T-A3  
**Mode:** Implementation Mode (contract note — **no** Runtime/SDK/Harness/Host rewrite; **no** new APIs)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Document the **public consume-only contract** Personal Brain uses to enter governed execution:

```text
Personal Brain
        ↓
ExecutionHost.createRun(CreateRunRequest) → HostRun
        ↓  (Host-internal)
Runtime.admitRun() …
```

Product depends on **Host only**. Runtime remains internal. No product orchestration.

---

## Factory (entry)

| Symbol | Package | Role |
|--------|---------|------|
| `createExecutionHost(opts?)` | `@dyogas/execution-host` | Returns `ExecutionHost` facade |
| `ExecutionHost.createRun` | same | **Sole** pipeline execution entry for Bridge |

Optional Host opts (not product orchestration): `auditSink`, `pipelinesDir` — Host composition only.

Related Host methods (post-create; not inventing APIs): `getRun`, `resumeHuman`, `applyKnowledgeAuthorized`, `applyGraphAuthorized` — documented in B1; this note focuses on **createRun** I/O.

---

## createRun — input contract

Source: `execution-host/src/api.ts` `CreateRunRequest` · pin values B2 · tenancy A3/B3.

| Field | Required | Personal Brain rule | Notes |
|-------|----------|---------------------|-------|
| `pipeline_id` | **Yes** | Must be `knowledge-ingestion` via `selectApprovedPipelineForCreateRun()` | B2; Host MVP allowlist |
| `pipeline_version` | **Yes** | Must be `2.0.0` (pinned) | B2; Harness §13 pin at CREATE |
| `bootstrap` | **Yes** | ResearchBrief-shaped `Record` (A2 map) — **no new schema** | Opaque to Host type system |
| `tenant_id` | **Yes** | Kernel `TenantId`; **must equal** `bootstrap.tenancy.tenant_id` | A3; align ambient Kernel/Trust before call (B3 / GAP-BR-012) |
| `caller_id` | **Yes** | Workspace **owner** id (attributable human) | A3; retain for Human Gate (GAP-BR-011) |
| `correlation_id` | **Yes** | Product Request correlation | Prefer Host field (GAP-BR-007) |
| `audit_sink` | No | Optional Trust `AuditSink`; else Host default | Same sink to Runtime (B3) |

### Bootstrap (Brief) — product must supply (existing shapes)

| Brief field | Required for Bridge | From |
|-------------|---------------------|------|
| `question` | Yes | Request `intent` |
| `scope` | Yes | `scope_hints` or product default / fail-closed (GAP-BR-002) |
| `allowed_source_classes` | Yes | Request or default (GAP-BR-003) |
| `budget` | Yes | Normalized `{ max_items, … }` (GAP-BR-004) |
| `tenancy.tenant_id` | Yes | Matches `CreateRunRequest.tenant_id` |
| `tenancy.workspace_id` | Yes (product rule) | Request `workspace_id` |
| `constraints` | No | Optional object |
| `run_id` | Agent input Yes | Timing vs Host assign — **GAP-BR-005** OPEN |

### Fail closed **before** createRun (product)

| Condition | Action |
|-----------|--------|
| Missing owner / workspace / unresolved tenant | Do not call |
| `tenant_id` ≠ Brief tenancy | Do not call |
| Unapproved pipeline pin | Do not call (`selectApprovedPipelineForCreateRun` throws) |
| Ambient Kernel/Trust not set for tenant | Do not call (Runtime admit will fail; GAP-BR-012) |

---

## createRun — output contract

Source: `HostRun` / `LineageSnapshot` (`api.ts`).

| Field | Meaning for Personal Brain |
|-------|----------------------------|
| `run_id` | Host/Runtime-assigned run id — product correlation join key |
| `pin` | `{ pipeline_id, pipeline_version }` echoed — observe only |
| `status` | Host-visible: includes `waiting_human` (GAP-EH-001 overlay) |
| `lineage` | Snapshot of trusted-path refs + `correlation_id` as stages seal |

| `HostRunStatus` | Product interpretation |
|-----------------|------------------------|
| `created` / `running` | In progress |
| `waiting_human` | Surface Human Approval; later `resumeHuman` |
| `applying` | Post-approval apply path |
| `succeeded` | Terminal success |
| `failed` / `cancelled` | Terminal non-success — no trusted SoR from this path |

Product **indexes outcomes** from Host status/lineage — does not drive stages.

---

## Dependency boundary

| May depend on | Must not depend on (as orchestrator) |
|---------------|--------------------------------------|
| `@dyogas/execution-host` public facade | `@dyogas/runtime` `admitRun` / stage drive |
| Host types: `CreateRunRequest`, `HostRun`, … | SDK bind / agent self-admit |
| Product pin helper (`src/bridge/pipeline-pin.ts`) | New Host/Runtime APIs |
| Kernel / Trust for ambient tenancy + audit sink | Harness law edits; pipeline topology edits |

```text
✓  PersonalBrain → ExecutionHost.createRun
✗  PersonalBrain → Runtime.admitRun (orchestrator)
✗  PersonalBrain → invent pipeline / contract / schema
```

---

## Illustrative assembly (non-normative code shape)

```ts
const pin = selectApprovedPipelineForCreateRun();
const host = createExecutionHost({ auditSink }); // optional sink

const run: HostRun = await host.createRun({
  ...pin,
  bootstrap,          // A2 Brief-shaped Record
  tenant_id,          // A3
  caller_id: owner_id,
  correlation_id,
  // audit_sink optional
});
// retain owner_id for resumeHuman — GAP-BR-011
```

No new APIs proposed. Gaps stay in `GAP-REGISTRY-PB-HARNESS-BRIDGE-001.md`.

---

## Explicit non-proposals

| Forbidden | Why |
|-----------|-----|
| Runtime / SDK / Harness / Host implementation changes | Task + sprint hard rule |
| New createRun fields or admit API | Consume existing Host surface only |
| Product stage orchestration | ADR-0010 / SPEC-PROD-004 §9 |
| Closing GAP-BR-011/012 by patching Host | Register only — future Spec |

---

## Verification

| AC | Met? |
|----|------|
| Inputs listed | **Yes** |
| Outputs listed | **Yes** |
| Consume-only Host APIs | **Yes** |
| No Runtime/SDK/Harness/Host change proposals | **Yes** |
| Product only depends on Host for execution entry | **Yes** |
| Runtime remains internal | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-B4-T1 | CreateRunRequest fields match `api.ts` | **PASS** |
| T-B4-T2 | HostRun outputs listed; waiting_human noted | **PASS** |
| T-B4-T3 | Boundary forbids product→Runtime orchestrator | **PASS** |
| T-B4-T4 | Pin + tenancy cite B2/A3/B3; gaps cited not “fixed” | **PASS** |
| T-B4-T5 | No new API / platform edit proposed | **PASS** |

### Scope boundary

- **In:** Documentation of existing Host createRun I/O for Personal Brain.  
- **Out:** Implementation of full Brief assembler, Host patches, Runtime calls.

---

## Evidence

- `personal-brain/stage/bridge/B4-host-entry-contract-note.md` (this file)  
- Related: B1, B2, B3, A3; `GAP-REGISTRY-PB-HARNESS-BRIDGE-001.md`

---

## Next

**T-B5** — Host createRun path verdict (`AVAILABLE` \| `BLOCKED`).

---

**End of B4-host-entry-contract-note**
