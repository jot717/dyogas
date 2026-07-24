# TASK REGISTRY

**Registry ID:** TASK-REGISTRY-PB-HARNESS-BRIDGE-001  
**Created:** 2026-07-23  
**Mode:** Development Harness — Task Registry (planning only)  
**Initial status for all tasks:** `READY_FOR_EXECUTION`  
**Forbidden:** Marking IMPLEMENTED in this creation/sync step; code / Runtime / SDK / Harness / Host rewrite / integration implementation beyond consume-only Host APIs when authorized by sprint gates
**Doc sync:** 2026-07-24 — Band B/F aligned to `ExecutionHost.createRun()` → Runtime primitives (ADR-0010)

---

## Sprint Reference

**SPRINT-PB-HARNESS-BRIDGE-001**  
File: [`../sprints/SPRINT-PB-HARNESS-BRIDGE-001.md`](../sprints/SPRINT-PB-HARNESS-BRIDGE-001.md)  
Trace: `TRACE-PB-BRIDGE-001`  
Auth: [`docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md`](../../docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md)  
Spec: [`../specs/SPEC-PROD-004-HARNESS-BRIDGE.md`](../specs/SPEC-PROD-004-HARNESS-BRIDGE.md)

---

## Task Rules

Each task must contain:

| Field | Meaning |
|-------|---------|
| Task ID | Stable id (T-*) |
| Objective | What must be achieved |
| Owner role | Engineering Agent / role (not a named person) |
| Dependencies | Prerequisite task ids or artifacts |
| Input artifacts | Specs, docs, packages consumed |
| Expected output artifact | Governed deliverable path/name |
| Acceptance Criteria | Measurable done checks |
| Status | `READY_FOR_EXECUTION` until executed |

**Status vocabulary for this sprint:** `READY_FOR_EXECUTION` → `IN_PROGRESS` → `DONE` | `BLOCKED`. Do **not** use `IMPLEMENTED` for registry creation.

---

## Execution Order (recommended)

```text
T-A1 → T-A2 → T-A3 → T-A4
T-B1 → T-B2 → T-B3 → T-B4 → T-B5
T-C1 → T-C2 → T-C3 → T-C4          (can parallel with A/B after sprint start)
T-D1 → T-D2 → T-D3 → T-D4          (after C1 recommended)
T-E1 → T-E2 → T-E3                 (after A2 + C3)
T-F1 → T-F2 → T-F3 → T-F4          (F4 conditional on B4/B5)
T-G1 (early or mid) → T-G2 (last)
```

Parallel bands: **A ∥ B ∥ C** at start; **D** after C1; **E** after A2+C3; **F** after B4+D1+E1; **G2** after all DONE/BLOCKED resolved.

---

## A. Request → ResearchBrief

### T-A1

| Field | Content |
|-------|---------|
| **Task ID** | T-A1 |
| **Objective** | Define product “Research Request” inputs (intent, workspace/owner, scope hints, budget placeholders). |
| **Owner role** | Product Owner Agent |
| **Dependencies** | None (sprint start) |
| **Input artifacts** | SPEC-PRODUCT-MASTER; SPEC-PROD-004 §5; SPRINT-PB-HARNESS-BRIDGE-001 |
| **Expected output artifact** | `personal-brain/stage/bridge/A1-research-request-inputs.md` |
| **Acceptance Criteria** | Document lists required vs optional fields; ties to workspace owner; no UI; no invented Host/Runtime APIs. |
| **Status** | READY_FOR_EXECUTION |

### T-A2

| Field | Content |
|-------|---------|
| **Task ID** | T-A2 |
| **Objective** | Map Research Request → platform `ResearchBrief` using existing `/artifacts`, `/schemas`, pipeline bootstrap docs. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-A1 |
| **Input artifacts** | T-A1 output; `/artifacts`; `/schemas`; `pipelines/knowledge-ingestion.md` |
| **Expected output artifact** | `personal-brain/stage/bridge/A2-request-to-researchbrief-map.md` |
| **Acceptance Criteria** | Field-level mapping table Product→Platform; no new schema invented; gaps deferred to T-A4. |
| **Status** | READY_FOR_EXECUTION |

### T-A3

| Field | Content |
|-------|---------|
| **Task ID** | T-A3 |
| **Objective** | Document tenancy/owner binding requirements for Brief (Kernel tenancy consume). |
| **Owner role** | Chief Architect Agent |
| **Dependencies** | T-A1 |
| **Input artifacts** | ADR-0009; Kernel tenancy docs/API; SPEC-PROD-004 Interface Impact |
| **Expected output artifact** | `personal-brain/stage/bridge/A3-tenancy-owner-binding.md` |
| **Acceptance Criteria** | States how workspace owner maps to tenancy on Brief; fail-closed if unbound; no Kernel modification proposed. |
| **Status** | READY_FOR_EXECUTION |

### T-A4

| Field | Content |
|-------|---------|
| **Task ID** | T-A4 |
| **Objective** | Record gaps if Brief schema fields are insufficient — do not invent schema; escalate as open question. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-A2, T-A3 |
| **Input artifacts** | A2 map; A3 binding; existing ResearchBrief schema |
| **Expected output artifact** | `personal-brain/stage/bridge/A4-brief-schema-gaps.md` |
| **Acceptance Criteria** | Gap list empty **or** each gap has escalation note; zero new schema files created. |
| **Status** | READY_FOR_EXECUTION |

---

## B. Execution Host Entry Investigation

### T-B1

| Field | Content |
|-------|---------|
| **Task ID** | T-B1 |
| **Objective** | Inventory existing **Execution Host** public APIs (`createRun`, `resumeHuman`, authorize apply) and document that Runtime primitives (`admitRun`, …) are used **by Host only** (SPEC-EXECUTION-HOST-001 + `execution-host/` exports; SPEC-RT-002 as Host dependency). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | None (parallel with A) |
| **Input artifacts** | SPEC-EXECUTION-HOST-001; ADR-0010; `execution-host/MODULE_STATUS.md`; SPEC-RT-002 (Host-consumed primitives) |
| **Expected output artifact** | `personal-brain/stage/bridge/B1-host-createRun-inventory.md` |
| **Acceptance Criteria** | Lists Host callable surfaces; states product must not call Runtime as orchestrator; cites file/symbol paths; no Runtime/Host code changes. |
| **Status** | READY_FOR_EXECUTION |

### T-B2

| Field | Content |
|-------|---------|
| **Task ID** | T-B2 |
| **Objective** | Determine how a product caller pins `pipeline_id=knowledge-ingestion` + versions via **Host `createRun`**. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-B1 |
| **Input artifacts** | B1 inventory; `pipelines/knowledge-ingestion.md`; Host CreateRunRequest; Harness Spec versioning |
| **Expected output artifact** | `personal-brain/stage/bridge/B2-pipeline-pin-mechanism.md` |
| **Acceptance Criteria** | Documents pin mechanism on Host request **or** explicit UNKNOWN/BLOCKED; no invented admit API; no product→Runtime orchestrator. |
| **Status** | READY_FOR_EXECUTION |

### T-B3

| Field | Content |
|-------|---------|
| **Task ID** | T-B3 |
| **Objective** | Determine how tenancy, contract pins, and audit identity flow on **Host createRun → Runtime.admitRun()** (primitives). |
| **Owner role** | Chief Architect Agent |
| **Dependencies** | T-B1 |
| **Input artifacts** | B1; Trust audit; Host + Harness Bind/Admit; Kernel tenancy |
| **Expected output artifact** | `personal-brain/stage/bridge/B3-host-tenancy-audit-flow.md` |
| **Acceptance Criteria** | Flow diagram or table for tenancy/contract/audit via Host; fail-closed behavior noted; no platform edits. |
| **Status** | READY_FOR_EXECUTION |

### T-B4

| Field | Content |
|-------|---------|
| **Task ID** | T-B4 |
| **Objective** | Produce “Host entry contract” note: required inputs/outputs for Personal Brain **`ExecutionHost.createRun()`** without proposing Runtime/Host changes. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-B2, T-B3, T-A3 |
| **Input artifacts** | B2, B3, A3; SPEC-PROD-004 §9 |
| **Expected output artifact** | `personal-brain/stage/bridge/B4-host-entry-contract-note.md` |
| **Acceptance Criteria** | Inputs/outputs listed; consume-only Host APIs; no Runtime/SDK/Harness/Host change proposals. |
| **Status** | READY_FOR_EXECUTION |

### T-B5

| Field | Content |
|-------|---------|
| **Task ID** | T-B5 |
| **Objective** | If no safe public **Host createRun** path exists for product layer → document blocker; **no Runtime/Host rewrite** in this sprint. |
| **Owner role** | Engineering Manager Agent |
| **Dependencies** | T-B4 |
| **Input artifacts** | B4 Host entry contract note |
| **Expected output artifact** | `personal-brain/stage/bridge/B5-host-createRun-path-verdict.md` (`AVAILABLE` \| `BLOCKED`) |
| **Acceptance Criteria** | Clear verdict; if BLOCKED, lists escalation only (no Runtime/Host patch in sprint). |
| **Status** | READY_FOR_EXECUTION |

---

## C. knowledge-ingestion Analysis

### T-C1

| Field | Content |
|-------|---------|
| **Task ID** | T-C1 |
| **Objective** | Map Bridge narrative stages to `knowledge-ingestion` stages. |
| **Owner role** | Chief Architect Agent |
| **Dependencies** | None (parallel) |
| **Input artifacts** | SPEC-PROD-004 §5; `pipelines/knowledge-ingestion.md` |
| **Expected output artifact** | `personal-brain/stage/bridge/C1-bridge-to-pipeline-stage-map.md` |
| **Acceptance Criteria** | 1:1 or documented merge/skip-with-reason; confirms no new topology. |
| **Status** | READY_FOR_EXECUTION |

### T-C2

| Field | Content |
|-------|---------|
| **Task ID** | T-C2 |
| **Objective** | Map product roles to existing agent contracts (Research; Validation; Proposal; Markdown; Knowledge Apply; Graph). |
| **Owner role** | Product Owner Agent |
| **Dependencies** | T-C1 |
| **Input artifacts** | C1; `/contracts/agents/*`; SPEC-PROD-004 §8 |
| **Expected output artifact** | `personal-brain/stage/bridge/C2-product-role-to-contract-map.md` |
| **Acceptance Criteria** | Knowledge Agent role maps only to existing contracts; no new contract proposed. |
| **Status** | READY_FOR_EXECUTION |

### T-C3

| Field | Content |
|-------|---------|
| **Task ID** | T-C3 |
| **Objective** | Identify which stages emit `ResearchReport`, `Proposal`, `Knowledge`, `GraphUpdate`. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-C1 |
| **Input artifacts** | C1; pipeline; `/artifacts` |
| **Expected output artifact** | `personal-brain/stage/bridge/C3-stage-artifact-emit-map.md` |
| **Acceptance Criteria** | Each platform artifact type has producing stage(s) named. |
| **Status** | READY_FOR_EXECUTION |

### T-C4

| Field | Content |
|-------|---------|
| **Task ID** | T-C4 |
| **Objective** | Note Memory/Embedding obligations for personal workspace (consume pipeline as-is; no topology fork). |
| **Owner role** | Chief Architect Agent |
| **Dependencies** | T-C1 |
| **Input artifacts** | C1; pipeline Memory/Embedding stages; ADR-0009 |
| **Expected output artifact** | `personal-brain/stage/bridge/C4-memory-embedding-personal-notes.md` |
| **Acceptance Criteria** | States consume-as-is posture; open questions listed; no pipeline fork proposed. |
| **Status** | READY_FOR_EXECUTION |

---

## D. Human Approval Mapping

### T-D1

| Field | Content |
|-------|---------|
| **Task ID** | T-D1 |
| **Objective** | Map owner Accept / Reject / Modify → `approved` / `rejected` / `request_changes` (Harness §9). |
| **Owner role** | Product Owner Agent |
| **Dependencies** | T-C1 (recommended) |
| **Input artifacts** | SPEC-PROD-004 §7; Harness Spec §9 |
| **Expected output artifact** | `personal-brain/stage/bridge/D1-human-approval-outcome-map.md` |
| **Acceptance Criteria** | Three-way mapping complete; re-approval required after modify. |
| **Status** | READY_FOR_EXECUTION |

### T-D2

| Field | Content |
|-------|---------|
| **Task ID** | T-D2 |
| **Objective** | Document apply-token / SoR apply preconditions from pipeline + Knowledge Engine (consume existing). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-D1, T-C3 |
| **Input artifacts** | D1; knowledge-ingestion Stage 4/5; Knowledge Engine docs |
| **Expected output artifact** | `personal-brain/stage/bridge/D2-apply-token-sor-preconditions.md` |
| **Acceptance Criteria** | Preconditions listed; no new SoR write path; no new approval semantics. |
| **Status** | READY_FOR_EXECUTION |

### T-D3

| Field | Content |
|-------|---------|
| **Task ID** | T-D3 |
| **Objective** | Confirm agent identities cannot satisfy Human Approval Gate (Constitution / Harness). |
| **Owner role** | Architecture Reviewer Agent |
| **Dependencies** | T-D1 |
| **Input artifacts** | Constitution Art. III; Harness §9; D1 |
| **Expected output artifact** | `personal-brain/stage/bridge/D3-agent-cannot-approve-attestation.md` |
| **Acceptance Criteria** | Explicit attestation with citations; fail-closed statement. |
| **Status** | READY_FOR_EXECUTION |

### T-D4

| Field | Content |
|-------|---------|
| **Task ID** | T-D4 |
| **Objective** | Define how Personal Brain surfaces the gate to the owner at the **contract** level (presentation-agnostic; **no UI**). |
| **Owner role** | Product Owner Agent |
| **Dependencies** | T-D1 |
| **Input artifacts** | D1; SPEC-PROD-004 AC-8 |
| **Expected output artifact** | `personal-brain/stage/bridge/D4-gate-surface-contract.md` |
| **Acceptance Criteria** | Contract-level responsibilities only; explicitly excludes UI design. |
| **Status** | READY_FOR_EXECUTION |

---

## E. Artifact Lineage

### T-E1

| Field | Content |
|-------|---------|
| **Task ID** | T-E1 |
| **Objective** | Write lineage assertion checklist: Brief.id / run_id / Report / Proposal / approval / Knowledge / GraphUpdate. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-A2, T-C3 |
| **Input artifacts** | A2; C3; SPEC-PROD-004 §6 |
| **Expected output artifact** | `personal-brain/stage/bridge/E1-lineage-assertion-checklist.md` |
| **Acceptance Criteria** | Checklist covers full chain; each node has assertion id. |
| **Status** | READY_FOR_EXECUTION |

### T-E2

| Field | Content |
|-------|---------|
| **Task ID** | T-E2 |
| **Objective** | Verify existing artifact envelopes carry enough provenance fields (investigation against schemas). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-E1 |
| **Input artifacts** | E1; `/schemas`; `/artifacts` |
| **Expected output artifact** | `personal-brain/stage/bridge/E2-envelope-provenance-fit.md` |
| **Acceptance Criteria** | PASS/GAP per checklist item; no schema changes authored. |
| **Status** | READY_FOR_EXECUTION |

### T-E3

| Field | Content |
|-------|---------|
| **Task ID** | T-E3 |
| **Objective** | Define “lineage PASS” evidence for sprint exit (what must appear in audit/artifacts). |
| **Owner role** | Engineering Manager Agent |
| **Dependencies** | T-E2 |
| **Input artifacts** | E1, E2; Harness Audit Trail concepts |
| **Expected output artifact** | `personal-brain/stage/bridge/E3-lineage-pass-evidence.md` |
| **Acceptance Criteria** | Exit evidence list usable by T-G2; ties to S-AC5. |
| **Status** | READY_FOR_EXECUTION |

---

## F. E2E Test Design

### T-F1

| Field | Content |
|-------|---------|
| **Task ID** | T-F1 |
| **Objective** | Design E2E happy-path test cases for Bridge workflow (fixture Brief → `ExecutionHost.createRun()` → … → GraphUpdate). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-B4, T-C1, T-D1, T-E1 |
| **Input artifacts** | B4; C1; D1; E1; Sprint §7 |
| **Expected output artifact** | `personal-brain/stage/bridge/F1-e2e-happy-path-cases.md` |
| **Acceptance Criteria** | ≥1 full happy-path case with steps and expected artifacts; Host entry; no UI; no product→Runtime orchestrator. |
| **Status** | READY_FOR_EXECUTION |

### T-F2

| Field | Content |
|-------|---------|
| **Task ID** | T-F2 |
| **Objective** | Design failure cases (Sprint §8) as test cases. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-F1 |
| **Input artifacts** | F1; SPRINT Debug/Failure Scenarios |
| **Expected output artifact** | `personal-brain/stage/bridge/F2-e2e-failure-cases.md` |
| **Acceptance Criteria** | Covers Host createRun refuse, stage fail, gate fail, reject, request_changes, agent-as-approver, graph skip, direct agent/Runtime-orchestrator call forbidden. |
| **Status** | READY_FOR_EXECUTION |

### T-F3

| Field | Content |
|-------|---------|
| **Task ID** | T-F3 |
| **Objective** | Identify which tests can run today vs blocked on Host createRun API. |
| **Owner role** | Engineering Manager Agent |
| **Dependencies** | T-F1, T-F2, T-B5 |
| **Input artifacts** | F1, F2, B5 |
| **Expected output artifact** | `personal-brain/stage/bridge/F3-test-runnable-vs-blocked.md` |
| **Acceptance Criteria** | Each case tagged RUNNABLE_NOW \| BLOCKED_ON_HOST_CREATERUN \| DESIGN_ONLY. |
| **Status** | READY_FOR_EXECUTION |

### T-F4

| Field | Content |
|-------|---------|
| **Task ID** | T-F4 |
| **Objective** | If Host createRun path available without platform edits: implement **minimal** Personal Brain–side test harness calling **existing Execution Host** APIs only. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | T-F3, T-B5 (`AVAILABLE`) |
| **Input artifacts** | F3; B5 AVAILABLE; existing `@dyogas/execution-host` public API only |
| **Expected output artifact** | Either test code under `personal-brain/` **or** skip record `F4-skipped-blocked.md` if B5=BLOCKED |
| **Acceptance Criteria** | If B5=BLOCKED → task DONE via skip record (no Runtime/Host rewrite). If AVAILABLE → minimal test uses Host APIs only (Host may call Runtime.admitRun internally); `npm test` still green for unrelated suites. |
| **Status** | READY_FOR_EXECUTION |

---

## G. Documentation Exit

### T-G1

| Field | Content |
|-------|---------|
| **Task ID** | T-G1 |
| **Objective** | Verify SPEC-PROD-004 status is `accepted` and `MODULE_STATUS.md` cites Host entry + this sprint (doc hygiene). |
| **Owner role** | Engineering Manager Agent |
| **Dependencies** | Founder DL-PB-HARNESS-BRIDGE-001 (satisfied); may run mid-sprint |
| **Input artifacts** | DL-PB-HARNESS-BRIDGE-001; Architecture APPROVE; SPEC-PROD-004; ADR-0010 |
| **Expected output artifact** | Verified `personal-brain/MODULE_STATUS.md`; SPEC-PROD-004 status remains `accepted` |
| **Acceptance Criteria** | MODULE_STATUS cites SPEC-PRODUCT-MASTER + SPEC-PROD-004 `accepted` + Host `createRun` + this sprint; Spec header status `accepted`. |
| **Status** | READY_FOR_EXECUTION |

### T-G2

| Field | Content |
|-------|---------|
| **Task ID** | T-G2 |
| **Objective** | File sprint exit note: READY FOR BRIDGE CODING / BLOCKED (with blockers listed). |
| **Owner role** | Engineering Manager Agent |
| **Dependencies** | T-A4, T-B5, T-C4, T-D4, T-E3, T-F3 (and T-F4 if applicable) |
| **Input artifacts** | All category exit artifacts; Sprint Exit Status Template |
| **Expected output artifact** | `personal-brain/stage/bridge/G2-sprint-exit.md` |
| **Acceptance Criteria** | Contains PASS\|FAIL\|BLOCKED; Host createRun path AVAILABLE\|BLOCKED; Coding follow-up YES\|NO; evidence paths listed; S-AC1..S-AC8 addressed. |
| **Status** | READY_FOR_EXECUTION |

---

## Registry Summary

| Metric | Value |
|--------|-------|
| Task count | **26** (T-A1..A4, T-B1..B5, T-C1..C4, T-D1..D4, T-E1..E3, T-F1..F4, T-G1..G2) |
| Initial status | All `READY_FOR_EXECUTION` |
| Implementation started | **No** |

---

**End of TASK-REGISTRY-PB-HARNESS-BRIDGE-001**
