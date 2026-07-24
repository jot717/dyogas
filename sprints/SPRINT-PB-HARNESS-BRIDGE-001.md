# SPRINT-PB-HARNESS-BRIDGE-001

**Sprint ID:** SPRINT-PB-HARNESS-BRIDGE-001  
**Module:** MOD-PERSONAL-BRAIN  
**Trace:** TRACE-PB-BRIDGE-001  
**Status:** Planned — Founder-authorized; **implementation not started**  
**Date:** 2026-07-23  
**Doc sync:** 2026-07-24 — entry path aligned to ADR-0010 / Execution Host (docs only)  
**Authorization:** [`docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md`](../../docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md)  
**Spec:** [`specs/SPEC-PROD-004-HARNESS-BRIDGE.md`](../specs/SPEC-PROD-004-HARNESS-BRIDGE.md) (`accepted` · Architecture Review APPROVE · `no_arch_impact`)  
**Product SSOT:** [`specs/SPEC-PRODUCT-MASTER.md`](../specs/SPEC-PRODUCT-MASTER.md)  
**Host:** SPEC-EXECUTION-HOST-001 `accepted` · ADR-0010 Accepted · MOD-EXECUTION-HOST MODULE COMPLETE

---

## 1. Sprint Goal

Enable and **validate** the first governed Personal Brain → **Execution Host** bridge design.

Prove one complete knowledge workflow **by design and evidence** (analysis + contract mapping + test design; implementation only where consume-only product-layer work is required and Host APIs are known):

```text
Research Request
        ↓
ResearchBrief
        ↓
ExecutionHost.createRun()
        ↓
Execution Host
        ↓
Runtime.admitRun() (primitives)
        ↓
SDK
        ↓
Agents
        ↓
Human Approval
        ↓
Knowledge
        ↓
Graph
```

Pinned pipeline: existing `knowledge-ingestion` (no new topology).

Success for this sprint means: the path is **architecture-proven**, **lineage-defined**, **Human Approval–mandatory**, and **testable** without inventing a second orchestrator, UI, Decision Agent, or new pipeline topology — and without treating Runtime as the product-facing Pipeline Engine.

---

## 2. Background

- Personal Brain core can capture/approve locally but needs a Founder-approved contract to request multi-agent research via **Execution Host**.  
- SPEC-PROD-004 is **`accepted`**; pins consumption of existing `/pipelines/knowledge-ingestion` only.  
- Architecture Review: **APPROVE**. Founder Gate: **APPROVED** (`DL-PB-HARNESS-BRIDGE-001`).  
- Non-scope: UI, Decision Agent, Runtime/SDK/Harness/Host **rewrite**, new pipeline topology.  
- Development Harness (= Engineering Process) governs how this sprint is executed; Execution Harness governs agent-run **law**; Execution Host implements the Pipeline Engine.

---

## 3. Reference Documents

| Document | Role |
|----------|------|
| [`SPEC-PRODUCT-MASTER.md`](../specs/SPEC-PRODUCT-MASTER.md) | Product SSOT |
| [`SPEC-PROD-004-HARNESS-BRIDGE.md`](../specs/SPEC-PROD-004-HARNESS-BRIDGE.md) | Bridge product contract (`accepted`) |
| [`DL-PB-HARNESS-BRIDGE-001.md`](../../docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md) | Founder APPROVE + sprint authorization |
| [`SPEC-EXECUTION-HOST-001.md`](../../specs/SPEC-EXECUTION-HOST-001.md) | Host API (`createRun`, resume, authorize apply) |
| [`ADR-0010`](../../docs/adr/0010-pipeline-execution-host.md) | Host boundary (Accepted) |
| [`/harness/HARNESS_SPECIFICATION.md`](../../harness/HARNESS_SPECIFICATION.md) | Execution law |
| [`/pipelines/knowledge-ingestion.md`](../../pipelines/knowledge-ingestion.md) | Pinned pipeline |
| [`/engineering/README.md`](../../engineering/README.md) | Development Harness |
| Runtime SPEC-RT-002 / SDK SPEC-RT-003 | Primitives / bind — **consumed by Host**, not product-orchestrated |
| ADR-0009 | Product layer boundary |

---

## 4. Deliverables

| # | Deliverable | Notes |
|---|-------------|--------|
| D1 | Research Request → `ResearchBrief` mapping (product-side definition) | Conceptual + field mapping to existing Brief semantics; **no new schema** |
| D2 | Host entry investigation report | How Personal Brain calls **`ExecutionHost.createRun()`** (Host then uses `Runtime.admitRun()`); no invented APIs |
| D3 | Pipeline integration analysis | Stage-by-stage map of Bridge flow → `knowledge-ingestion` stages/agents/artifacts |
| D4 | Human Approval mapping matrix | Owner accept/reject/modify ↔ Harness §9 outcomes; Host `resumeHuman`; apply-token / SoR rules |
| D5 | Artifact lineage checklist | `ResearchBrief` → `ResearchReport` → `Proposal` → approval → `Knowledge` → `GraphUpdate` |
| D6 | End-to-end test design | Happy path + failure cases via Host public APIs |
| D7 | Sprint evidence pack | Stage notes under `personal-brain/stage/` |
| D8 | MODULE_STATUS hygiene | Cite SPEC-PROD-004 `accepted` + Host entry + this sprint |

**Coding** is allowed only for **minimal consume-only** Personal Brain library wiring **after** D2 confirms existing **Execution Host** surfaces — and only if Tech Lead records that no Runtime/SDK/Harness/Host edits are required. Prefer investigation-complete first.

---

## 5. Tasks

Architecture-safe task list. Unknown dependencies = **investigation**. Do **not** invent APIs. Do **not** call Runtime as product pipeline orchestrator.

### A. Personal Brain request artifact definition

| ID | Task | Type |
|----|------|------|
| T-A1 | Define product “Research Request” inputs (intent, workspace/owner, scope hints, budget placeholders) | Design |
| T-A2 | Map Request → platform `ResearchBrief` fields using existing `/artifacts` / `/schemas` / pipeline bootstrap docs | Design |
| T-A3 | Document tenancy/owner binding requirements for Brief (Kernel tenancy consume) | Design |
| T-A4 | Record gaps if Brief schema fields are insufficient — **do not invent schema**; escalate as open question | Investigation |

### B. Execution Host entry investigation

| ID | Task | Type |
|----|------|------|
| T-B1 | Inventory existing **Execution Host** public APIs (`createRun`, `resumeHuman`, authorize apply) + note Runtime primitives used **by Host only** | Investigation |
| T-B2 | Determine how a product caller pins `pipeline_id=knowledge-ingestion` + versions via Host `createRun` | Investigation |
| T-B3 | Determine how tenancy, contract pins, and audit identity flow on Host createRun → Runtime.admitRun | Investigation |
| T-B4 | Produce “Host entry contract” note: required inputs/outputs for Personal Brain **without** proposing Runtime/Host changes | Design |
| T-B5 | If no safe public Host createRun path exists for product layer → document blocker; **no Runtime/Host rewrite** in this sprint | Investigation |

### C. Existing knowledge-ingestion pipeline integration analysis

| ID | Task | Type |
|----|------|------|
| T-C1 | Map Bridge narrative stages to `knowledge-ingestion` stages (Research → Validation → Proposal → Human Review → Markdown → Graph → Embedding → Memory) | Analysis |
| T-C2 | Map product roles to existing agent contracts (Research; Validation; Proposal; Markdown; Knowledge Apply; Graph) | Analysis |
| T-C3 | Identify which stages emit `ResearchReport`, `Proposal`, `Knowledge`, `GraphUpdate` | Analysis |
| T-C4 | Note Memory/Embedding obligations for personal workspace (consume pipeline as-is; no topology fork) | Analysis |

### D. Human approval mapping

| ID | Task | Type |
|----|------|------|
| T-D1 | Map owner Accept / Reject / Modify → `approved` / `rejected` / `request_changes` (Harness §9) | Design |
| T-D2 | Document apply-token / SoR apply preconditions from Host authorize + Knowledge Engine (consume existing) | Investigation |
| T-D3 | Confirm agent identities cannot satisfy Human Approval Gate (Constitution / Harness) | Verification |
| T-D4 | Define how Personal Brain **surfaces** the gate to the owner at the **contract** level (presentation-agnostic; **no UI**) | Design |

### E. Artifact lineage verification

| ID | Task | Type |
|----|------|------|
| T-E1 | Write lineage assertion checklist: Brief.id / run_id / Report / Proposal / approval / Knowledge / GraphUpdate | Design |
| T-E2 | Verify existing artifact envelopes carry enough provenance fields (investigation against schemas) | Investigation |
| T-E3 | Define “lineage PASS” evidence for sprint exit (what must appear in audit/artifacts) | Design |

### F. End-to-end test design

| ID | Task | Type |
|----|------|------|
| T-F1 | Design E2E happy-path test cases (fixture Brief → `ExecutionHost.createRun()` → … → GraphUpdate) | Test design |
| T-F2 | Design failure cases (see §8) as test cases | Test design |
| T-F3 | Identify which tests can run today vs blocked on Host createRun API | Investigation |
| T-F4 | If Host createRun path available without platform edits: implement **minimal** Personal Brain–side test harness calling **existing Host** APIs only | Implementation (conditional) |

### G. Sprint governance / docs

| ID | Task | Type |
|----|------|------|
| T-G1 | Verify SPEC-PROD-004 `accepted` + update `MODULE_STATUS.md` next milestone / Host entry citations | Docs |
| T-G2 | File sprint exit note: READY FOR BRIDGE CODING / BLOCKED (with blockers listed) | Docs |

---

## 6. Acceptance Criteria

Sprint exits **PASS** when:

| # | Criterion |
|---|-----------|
| S-AC1 | End-to-end Bridge workflow is documented and mapped onto `knowledge-ingestion` with no new pipeline topology. |
| S-AC2 | Research Request → `ResearchBrief` mapping is complete against existing Brief semantics (or gaps listed without schema invention). |
| S-AC3 | **Execution Host** `createRun` path is either (a) documented for product consume-only use (Host → Runtime.admitRun primitives), or (b) explicitly **BLOCKED** with no Runtime/Host rewrite attempted. |
| S-AC4 | Human Approval mapping includes accept/reject/modify ↔ Harness outcomes and forbids agent self-approval. |
| S-AC5 | Artifact lineage checklist covers Brief → Report → Proposal → Approval → Knowledge → GraphUpdate. |
| S-AC6 | E2E test design exists for happy path + failure scenarios via Host APIs. |
| S-AC7 | Non-goals honored: no UI, Decision Agent, new pipeline, Runtime state machine edits, SDK contract edits, Host rewrite, Human Approval bypass, product→Runtime orchestration. |
| S-AC8 | Sprint evidence pack + go/no-go recorded under Personal Brain stage/sprint artifacts. |

Alignment with SPEC-PROD-004 AC-1..AC-8: this sprint primarily **designs and verifies**; full product-contract “Verified” lifecycle may span a follow-on coding sprint if S-AC3(b) blocks.

---

## 7. Testing Strategy

| Layer | Intent |
|-------|--------|
| **Contract / doc tests** | Checklist review that mappings match SPEC-PROD-004 + pipeline + Host + contracts |
| **Schema/lineage inspection** | Read-only validation that existing envelopes support lineage assertions |
| **Host createRun smoke (conditional)** | Only if public Host API exists — single `createRun` for `knowledge-ingestion` with test tenancy; no production SoR pollution |
| **Human gate simulation** | Test design for Host `resumeHuman` outcomes (`approved` / `rejected` / `request_changes`) |
| **Regression** | Existing Personal Brain `npm test` must remain green; no platform package edits |
| **Forbidden** | Playwright UI tests; Decision Agent tests; forging approval as an agent; product calling Runtime admit as orchestrator |

---

## 8. Debug / Failure Scenarios

Document and include in T-F2:

| Scenario | Expected Bridge behavior |
|----------|---------------------------|
| Host createRun refused (missing pin / tenancy) | Fail closed; no agent execution; no SoR write |
| Research stage failure / retry exhaustion | Pipeline failure per Harness; no Verified Knowledge |
| Validation / Review Gate fail | No advancement to trusted Knowledge |
| Human `rejected` | No Knowledge SoR apply; lineage shows rejection |
| Human `request_changes` | No seal until re-approval |
| Attempted agent-as-approver | Rejected / impossible per Harness |
| Graph stage skip without recorded reason | Fail AC / audit defect |
| Product tries to call agents or Runtime admit directly as orchestrator | Out of contract — must not be implemented |

---

## 9. Non Goals

This sprint must **NOT**:

| Forbidden | Rationale |
|-----------|-----------|
| Build UI / product frontend | Founder Non-Scope |
| Build Decision Agent / Decision Model | Founder Non-Scope |
| Create new pipeline topology | SPEC-PROD-004 pin |
| Modify Runtime state machine | Founder / Architecture |
| Modify SDK contracts | Founder / Architecture |
| Rewrite Execution Host | Founder / Architecture |
| Bypass Human Approval | Constitution Art. III / XIII |
| Invent undocumented APIs | Architecture-safe rule |
| Rewrite Harness law or Skill Spec | Out of authorization |
| Shadow orchestrator inside Personal Brain | Art. XIII |
| Product-facing Runtime admit as Pipeline Engine | ADR-0010 / Harness §2.1a |

---

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| No product-callable Host createRun surface | T-B5 blocker; escalate via Architecture — **do not** patch Runtime or Host in this sprint |
| Brief schema gaps for personal workspace | T-A4 escalate; no silent schema fork |
| Pipeline Memory stage vs personal boundary | T-C4 analysis only |

---

## Exit Status Template

```text
SPRINT-PB-HARNESS-BRIDGE-001 EXIT: PASS | FAIL | BLOCKED
Host createRun path: AVAILABLE | BLOCKED
Coding follow-up authorized: YES | NO
Evidence: <paths>
```

---

**End of SPRINT-PB-HARNESS-BRIDGE-001** — planning only; implementation not started by this documentation sync.
