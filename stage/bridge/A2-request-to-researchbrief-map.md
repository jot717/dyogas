# A2 — Research Request → ResearchBrief Map

**Task:** T-A2  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (`accepted`)  
**Depends on:** T-A1 (`A1-research-request-inputs.md`)  
**Mode:** Implementation Mode (design deliverable)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Field-level map from product **Research Request** (T-A1) to platform **`ResearchBrief`** bootstrap semantics used when Personal Brain calls `ExecutionHost.createRun({ bootstrap, … })`.

**Boundary:** External World intent → Research Brief bootstrap → **Execution Host** (not product→Runtime orchestration).

**No new schema.** Gaps → T-A4.

---

## Sources of truth (existing)

| Source | Role |
|--------|------|
| T-A1 | Product Research Request fields |
| `pipelines/knowledge-ingestion.md` | `ResearchBrief` = run bootstrap: `question`, `scope`, `constraints`, `allowed_source_classes`, `budget`, `run_id`, `tenancy` |
| `contracts/agents/research-agent.md` §3, §6 | Brief field meanings + required/optional |
| `schemas/agents/research-agent.schema.json` `input` | Machine-required: `question`, `scope`, `allowed_source_classes`, `budget`, `run_id`, `tenancy` |
| `specs/SPEC-EXECUTION-HOST-001.md` | `CreateRunRequest.bootstrap` = ResearchBrief-shaped `Record` (opaque; no new schema) |
| `execution-host/src/api.ts` | `bootstrap`, `tenant_id`, `caller_id`, `correlation_id` on createRun |
| `/artifacts` | **No** dedicated `research-brief.md` — Brief is **not** a sealed Knowledge Plane artifact (pipeline + Research Agent contract) |

---

## Field-level mapping (Product → Platform)

| Product Research Request (A1) | Platform `ResearchBrief` / Host createRun | Required on Brief? | Mapping rule |
|-------------------------------|-------------------------------------------|--------------------|--------------|
| `intent` | `bootstrap.question` | **Yes** | Copy string; minLength ≥ 1 |
| `scope_hints` | `bootstrap.scope` | **Yes** (schema) | If absent: derive default scope string from workspace context (e.g. `"personal-brain workspace:{workspace_id}"`) — **not** a schema invent; product convention. Escalate if unacceptable → T-A4 |
| `constraints` | `bootstrap.constraints` | No | Pass as object; if only free-text, wrap `{ "text": "…" }` without new schema keys beyond free-form object |
| `allowed_source_classes` | `bootstrap.allowed_source_classes` | **Yes** | Must be subset of `youtube`\|`github`\|`reddit`\|`web`. If omitted on Request: product fills **default allowlist** from policy/contract (document default in product; do not invent Host API). Gap if no product default → T-A4 |
| `budget_placeholder` | `bootstrap.budget` | **Yes** | Must become `{ max_items: int≥1, max_seconds?: int≥1 }`. Soft placeholder must be **normalized** to this shape before createRun. If cannot normalize → fail closed / T-A4 |
| *(none — Host-assigned)* | `bootstrap.run_id` | **Yes** (agent input) | **Not** from Research Request. Set from Host `run_id` after/at admit, or Host/executor-assigned brief id pattern — product must not invent run_id. Mapping: leave unset in pre-create Brief draft; Host run context supplies `run_id` for agent bind (Band B confirms exact timing) |
| `workspace_id` + `owner_id` | `bootstrap.tenancy` + CreateRun `tenant_id` / `caller_id` | **Yes** | `tenancy.tenant_id` ← product tenancy id (T-A3); `tenancy.workspace_id` ← `workspace_id`; `caller_id` ← `owner_id` (or Trust identity mapping — T-A3). Fail closed if unbound |
| `correlation_id` | CreateRunRequest `correlation_id` (+ optional bootstrap echo) | CreateRun **Yes** | Pass through to Host; may also store on bootstrap as opaque field **only if** existing Host accepts Record — do not add schema const. Prefer Host `correlation_id` field |
| `notes` | **Not mapped** to Brief decision fields | — | Discard for Brief I/O; must not affect agent input schema (`additionalProperties: false` on research-agent input) |

---

## CreateRun assembly (consume-only; no API invention)

```text
Research Request (A1)
        ↓  map (this doc)
ResearchBrief-shaped bootstrap (Record)
        ↓
ExecutionHost.createRun({
  pipeline_id: "knowledge-ingestion",
  pipeline_version: <pinned>,
  bootstrap,
  tenant_id,
  caller_id,
  correlation_id
})
        ↓
Execution Host → Runtime.admitRun() …
```

Pipeline pin values confirmed in Band B (T-B2) — not invented here.

---

## Defaults & fail-closed

| Situation | Behavior |
|-----------|----------|
| Missing `intent` | Do not map; do not createRun |
| Missing `scope_hints` | Apply documented default scope string **or** block → T-A4 |
| Missing `allowed_source_classes` | Apply product default allowlist **or** block → T-A4 |
| Missing/invalid `budget_placeholder` | Do not invent budget API; block or use product-configured default `{max_items}` only if already agreed in product config — else T-A4 |
| Missing owner/workspace | Fail closed (T-A3) |
| Desire to add Brief fields not in research-agent input | **Forbidden** — T-A4 escalation; no schema change |

---

## Gaps deferred to T-A4

| Gap ID | Description |
|--------|-------------|
| GAP-A2-01 | No `/artifacts/research-brief.md` / dedicated Brief JSON Schema — Brief is contract input + pipeline prose only |
| GAP-A2-02 | Exact default for `scope` when `scope_hints` omitted |
| GAP-A2-03 | Exact default `allowed_source_classes` / `budget` when placeholders omitted |
| GAP-A2-04 | When `run_id` is stamped onto bootstrap relative to Host createRun (Band B) |
| GAP-A2-05 | Precise `owner_id` → `tenant_id` / `caller_id` mapping (T-A3) |

**Zero new schema files created.**

---

## Verification (T-A2 Acceptance + Tests)

### Acceptance Criteria

| # | Criterion | Met? |
|---|-----------|------|
| 1 | Field-level Product→Platform table | **Yes** |
| 2 | No new schema invented | **Yes** |
| 3 | Gaps deferred to T-A4 | **Yes** (GAP-A2-01…05) |

### Tests (doc conformance — no platform code)

| Test ID | Check | Result |
|---------|-------|--------|
| T-A2-T1 | Every research-agent **required** input field appears in mapping or explicit Host-supplied rule | **PASS** (`question`, `scope`, `allowed_source_classes`, `budget`, `run_id`, `tenancy`) |
| T-A2-T2 | `notes` not injected into Brief agent input | **PASS** |
| T-A2-T3 | Entry path remains Request → Brief → ExecutionHost.createRun | **PASS** |
| T-A2-T4 | No `/schemas` or `/artifacts` files modified | **PASS** |

---

## Evidence

- This file: `personal-brain/stage/bridge/A2-request-to-researchbrief-map.md`
- Inputs: A1; `pipelines/knowledge-ingestion.md`; `contracts/agents/research-agent.md`; `schemas/agents/research-agent.schema.json`; SPEC-EXECUTION-HOST-001; `execution-host/src/api.ts` (read-only)

---

## Next

**T-A3** — Tenancy/owner binding for Brief (Kernel tenancy consume).

---

**End of A2-request-to-researchbrief-map**
