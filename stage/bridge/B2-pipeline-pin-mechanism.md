# B2 — Pipeline Pin Mechanism via Host `createRun`

**Task:** T-B2  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`)  
**Depends on:** T-B1 (`B1-host-createRun-inventory.md`)  
**Mode:** Implementation Mode (product-side mapping only — no Host/Runtime/SDK/Harness edits)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Document how Personal Brain pins **`pipeline_id=knowledge-ingestion`** + **`pipeline_version`** on **`ExecutionHost.createRun()`**, and record the product-side mapping that selects that approved pin.

---

## Ownership (unchanged)

```text
Product (Personal Brain)
        ↓  CreateRunRequest { pipeline_id, pipeline_version, … }
ExecutionHost.createRun()
        ↓  loadPipeline → freezePin (Host-internal)
Runtime.admitRun() …   (primitives — Host only)
        ↓
Pipeline execution (knowledge-ingestion topology)
```

Product **does not** call Runtime. Product **does not** invent admit APIs. Product **does not** create pipeline topology.

---

## Approved pin (sources of truth)

| Surface | Value | Source |
|---------|-------|--------|
| `pipeline_id` | `knowledge-ingestion` | `pipelines/knowledge-ingestion.md` (**Pipeline id**); Host `MVP_PIPELINE_ID` |
| `pipeline_version` | `2.0.0` | Same file (**Version:** 2.0.0); Host `MVP_PIPELINE_VERSION` |
| Execution intent | Run pinned **knowledge-ingestion** under Harness law | SPEC-PROD-004 § Pipeline decision; AC-2 |

No other pipeline id/version is authorized for this Bridge sprint.

---

## Host pin mechanism (consume-only)

### 1. Product supplies pin on `CreateRunRequest`

From `execution-host/src/api.ts`:

| Field | Required | Bridge value |
|-------|----------|--------------|
| `pipeline_id` | Yes | `knowledge-ingestion` |
| `pipeline_version` | Yes | `2.0.0` |

Omit either → Host fails closed (`PIPELINE_VERSION_REQUIRED` — `execution-host/src/pipeline/loader.ts`).

### 2. Host loads + freezes pin at CREATE

`createRun` → `loadPipeline({ pipeline_id, pipeline_version })` (`host.ts` → `loader.ts`):

1. Reject unknown / non-MVP `pipeline_id` (`PIPELINE_UNKNOWN` / `PIPELINE_UNSUPPORTED`).
2. Load `/pipelines/{pipeline_id}.md`.
3. Parse definition **Version** / **Pipeline id**; mismatch with request → `PIPELINE_VERSION_MISMATCH` / parse error.
4. MVP additionally requires `pipeline_version === "2.0.0"`.
5. `freezePin({ pipeline_id, pipeline_version })` → immutable `ImmutablePipelinePin` for the run.

Harness law: runs pin pipeline version at CREATE; mid-run upgrades do not mutate in-flight rules (`HARNESS_SPECIFICATION.md` §2.5, §13).

### 3. Returned `HostRun.pin`

`HostRun.pin` echoes `{ pipeline_id, pipeline_version }` for product observation (`api.ts` / `host.ts`). Product must not treat this as license to call Runtime.

### 4. What product must **not** do

| Forbidden | Reason |
|-----------|--------|
| Call `Runtime.admitRun` / invent admit | Orchestration is Host-only (B1; ADR-0010) |
| Pass unpinned / `"latest"` version | Host requires explicit version; bypasses §13 |
| Invent new pipeline id or topology | SPEC-PROD-004 out of scope |
| Edit Host / Runtime / SDK / Harness / `/pipelines` | Sprint hard rule |

---

## Product-side bridge mapping (this task)

| Artifact | Role |
|----------|------|
| `personal-brain/src/bridge/pipeline-pin.ts` | Approved pin constants + `selectApprovedPipelineForCreateRun()` |
| `personal-brain/tests/bridge-pipeline-pin.test.ts` | Asserts pin fields; fail-closed on alternate id/version |

Mapping rule:

```text
knowledge-ingestion execution intent
        ↓
selectApprovedPipelineForCreateRun()
        ↓
{ pipeline_id: "knowledge-ingestion", pipeline_version: "2.0.0" }
        ↓  (assembled with Brief bootstrap / tenancy in later tasks)
ExecutionHost.createRun({ …pin fields… })
```

Constants **must stay aligned** with Host `MVP_PIPELINE_*` and `pipelines/knowledge-ingestion.md`. Drift is a product defect — do not “fix” by editing Host.

---

## Example createRun pin fragment (illustrative)

```ts
import { selectApprovedPipelineForCreateRun } from "../src/bridge/pipeline-pin.js";

const pin = selectApprovedPipelineForCreateRun();
// → { pipeline_id: "knowledge-ingestion", pipeline_version: "2.0.0" }

await host.createRun({
  ...pin,
  bootstrap,       // A2 Brief map — not this task
  tenant_id,       // A3
  caller_id,
  correlation_id,
});
```

Full Brief/tenancy assembly → T-B3 / T-B4. This task pins **pipeline selection only**.

---

## Verdict

| Question | Answer |
|----------|--------|
| Pin mechanism on Host request? | **Documented** — `pipeline_id` + `pipeline_version` on `CreateRunRequest` |
| Product→Runtime orchestrator? | **No** |
| Invented admit API? | **No** |
| UNKNOWN/BLOCKED? | **N/A** — path AVAILABLE via Host `createRun` (B1) |
| Platform code changed? | **None** |

---

## Verification

| AC | Met? |
|----|------|
| Documents pin mechanism on Host request **or** UNKNOWN/BLOCKED | **Yes** (mechanism documented) |
| No invented admit API | **Yes** |
| No product→Runtime orchestrator | **Yes** |
| createRun request contains approved pipeline reference | **Yes** (product mapping) |
| Pipeline version pinned | **Yes** (`2.0.0`) |
| Evidence created | **Yes** (this file + `src/bridge/pipeline-pin.ts`) |

| Test ID | Result |
|---------|--------|
| T-B2-T1 Approved pin = knowledge-ingestion@2.0.0 | PASS |
| T-B2-T2 Reject alternate pipeline_id / version | PASS |
| T-B2-T3 Mapping does not import/call Runtime | PASS (static — product module has no Runtime import) |

---

## Evidence

- `personal-brain/stage/bridge/B2-pipeline-pin-mechanism.md` (this file)
- `personal-brain/src/bridge/pipeline-pin.ts`
- `personal-brain/tests/bridge-pipeline-pin.test.ts`

---

## Next

**T-B3** — Tenancy / contract / audit flow on Host createRun → Runtime.admitRun (Host-internal).

---

**End of B2-pipeline-pin-mechanism**
