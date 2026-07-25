# B1 — Execution Host createRun Inventory

**Task:** T-B1  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`)  
**Mode:** Implementation Mode (investigation — no Runtime/Host source edits)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Inventory **callable Execution Host** surfaces for Personal Brain Bridge, and record that **Runtime primitives are Host-internal only**.

---

## Product entry rule

```text
Personal Brain
        ↓
ExecutionHost.createRun() / resumeHuman / authorize apply
        ↓
Execution Host  (Pipeline Engine)
        ↓
Runtime.admitRun() …  (primitives — Host adapter only)
```

**Personal Brain MUST NOT** call `@dyogas/runtime` `admitRun` / `startRun` / etc. as a pipeline orchestrator (SPEC-PROD-004 AC-2; ADR-0010; START_DEVELOPMENT §6).

---

## Package

| Field | Value |
|-------|--------|
| Package | `@dyogas/execution-host@0.0.1` |
| Module status | **MODULE COMPLETE** (`execution-host/MODULE_STATUS.md`) |
| Spec | SPEC-EXECUTION-HOST-001 `accepted` |
| ADR | ADR-0010 Accepted |
| Factory | `createExecutionHost(opts?)` → `ExecutionHost` — `execution-host/src/host.ts` |

---

## Host public facade (`ExecutionHost`)

Source: `execution-host/src/host.ts` · exported from `execution-host/src/index.ts`

| Method | Signature (summary) | Role for Bridge |
|--------|---------------------|-----------------|
| **`createRun`** | `(req: CreateRunRequest) => Promise<HostRun>` | **Primary entry** — pin pipeline, bootstrap Brief, tenancy, correlation |
| **`getRun`** | `(runId: string) => Promise<HostRun>` | Poll status + lineage snapshot |
| **`resumeHuman`** | `(runId, decision: HumanDecision, actor_kind?) => Promise<HostRun>` | Owner Human Approval outcomes (Harness §9) |
| **`applyKnowledgeAuthorized`** | `(runId: string) => Promise<HostRun>` | Consume apply token; authorize Knowledge path (engine apply remains consumer) |
| **`applyGraphAuthorized`** | `(runId, presentedTokenId?) => Promise<HostRun>` | Authorize Graph after Knowledge |

### `CreateRunRequest` (`execution-host/src/api.ts`)

| Field | Type | Notes |
|-------|------|--------|
| `pipeline_id` | string | e.g. `knowledge-ingestion` |
| `pipeline_version` | string | e.g. `2.0.0` (see constants) |
| `bootstrap` | `Record<string, unknown>` | ResearchBrief-shaped — **no new schema** |
| `tenant_id` | string | Must align with Brief tenancy (A3) |
| `caller_id` | string | Owner attribution |
| `correlation_id` | string | Product correlation |
| `audit_sink` | optional | Trust audit sink |

### Convenience constants (`execution-host/src/errors.ts`)

| Symbol | Value |
|--------|--------|
| `MVP_PIPELINE_ID` | `"knowledge-ingestion"` |
| `MVP_PIPELINE_VERSION` | `"2.0.0"` |

### `HumanDecision` (`api.ts`)

`outcome`: `approved` \| `rejected` \| `request_changes` \| `expired` \| `escalated` + attributable `actor_id` (never agent).

### `HostRun`

`run_id`, `pin` (`pipeline_id`/`pipeline_version`), `status`, `lineage` (`LineageSnapshot`).

Statuses include `waiting_human` (Host overlay — GAP-EH-001; do not fork Runtime).

---

## Runtime primitives — Host-only consumption

Adapter: `execution-host/src/adapters/runtime.ts` · `RUNTIME_SYMBOLS_USED`:

| Symbol | Used by Host? | Product may call? |
|--------|---------------|-------------------|
| `admitRun` | Yes (`createRun`) | **No** |
| `startRun` | Yes | **No** |
| `transition` | Yes | **No** |
| `succeed` | Yes | **No** |
| `handleFailure` | Yes | **No** |
| `resumeAfterRetry` | Yes | **No** |
| `sealArtifact` | Yes | **No** |
| `acceptHandoff` | Yes | **No** |
| Error types | Yes | **No** (orchestrate) |

SDK bind is likewise Host-internal via `createSdkAdapter` — product does not bind pipeline agents.

---

## Supporting exports (not product orchestration APIs)

Loader, lineage helpers, gate/token helpers, stage map, etc. are exported for Host composition/tests. **Bridge product code should prefer the `ExecutionHost` facade** (`createRun`, `getRun`, `resumeHuman`, `applyKnowledgeAuthorized`, `applyGraphAuthorized`) unless a later task proves a need.

---

## Verdict for Bridge

| Question | Answer |
|----------|--------|
| Safe public Host path for product? | **Yes** — `createExecutionHost().createRun` |
| Product→Runtime orchestrator? | **Forbidden** |
| Code changes this task? | **None** |

---

## Verification

| AC | Met? |
|----|------|
| Lists Host callable surfaces | **Yes** |
| Product must not call Runtime as orchestrator | **Yes** |
| Cites file/symbol paths | **Yes** |
| No Runtime/Host code changes | **Yes** |

| Test ID | Result |
|---------|--------|
| T-B1-T1 Facade methods listed from `host.ts` | PASS |
| T-B1-T2 RUNTIME_SYMBOLS_USED documented as Host-only | PASS |
| T-B1-T3 MVP pipeline constants cited | PASS |

---

## Evidence

`personal-brain/stage/bridge/B1-host-createRun-inventory.md` (this file)

---

## Next

**T-B2** — Pipeline pin mechanism via Host `createRun`.

---

**End of B1-host-createRun-inventory**
