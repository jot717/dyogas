# F2 — E2E Failure Cases Design

**Task:** T-F2  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Depends on:** T-F1 · cites D2, D3, D4, E3, Sprint §8  
**Mode:** Implementation Mode (**failure design only** — **no** test implementation; **no** Runtime/SDK/Host/UI/APIs)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Design **fail-closed** Bridge behaviors for Host entry, Gate, apply_token, lineage, tenancy, and out-of-contract product calls. Complements **HP-01** (`F1-e2e-happy-path-test-design.md`).

**Entry:** Host only (ADR-0010). **No** UI. **No** product→Runtime orchestrator.

---

## Case catalog

| Case ID | Title | Family |
|---------|-------|--------|
| FC-01 | Host createRun refused (pin / tenancy) | Entry |
| FC-02 | Research / stage failure / retry exhaustion | Stage |
| FC-03 | Validation / Review Gate package fail | Stage / Gate |
| FC-04 | Human `rejected` | Gate |
| FC-05 | Human `request_changes` | Gate |
| FC-06 | Missing human approval (advance without Gate) | Gate |
| FC-07 | Invalid or reused apply_token | Token |
| FC-08 | Wrong Proposal version (superseded token) | Token |
| FC-09 | Unauthorized agent approval attempt | Attestation |
| FC-10 | Artifact lineage mismatch | Lineage |
| FC-11 | Tenant / workspace mismatch | Tenancy |
| FC-12 | Graph stage skip without recorded reason | Stage / AC |
| FC-13 | Product calls agents or Runtime admit as orchestrator | Contract |

---

## Case templates

Each case: **Scenario → Detection → Rejection → Audit → Recovery → Related GAP**.

---

### FC-01 — Host createRun refused (missing pin / tenancy)

| Field | Content |
|-------|---------|
| **Failure scenario** | Product calls `createRun` without approved pin (`knowledge-ingestion@2.0.0`) and/or without valid Kernel tenant / caller binding. |
| **Detection point** | `ExecutionHost.createRun` preconditions (B2/B3/B4). |
| **Expected rejection** | Fail closed; **no** agent execution; **no** SoR write; no `run_id` progression into stages. |
| **Audit evidence** | Trust/audit sink: createRun denial (pin/tenancy reason); no stage-start events. |
| **Recovery path** | Supply pin via `selectApprovedPipelineForCreateRun()`; align ambient Kernel tenancy + Trust identity; retry createRun. |
| **Related GAP** | GAP-BR-012 (tenant assert); GAP-BR-011 / CALLER-001; GAP-EH-* if Host surface incomplete. |

---

### FC-02 — Research / stage failure / retry exhaustion

| Field | Content |
|-------|---------|
| **Failure scenario** | Stage 1 (or later agent stage) fails after Harness retry budget. |
| **Detection point** | Host/Runtime stage failure terminalization (Harness retry policy). |
| **Expected rejection** | Pipeline failed; **no** Verified Knowledge; no token mint; no GraphUpdate as success path. |
| **Audit evidence** | Stage fail + retry exhaustion events; run terminal failed. |
| **Recovery path** | New run with corrected Brief/bootstrap; do not resume as approved. |
| **Related GAP** | None new (Harness policy consume). |

---

### FC-03 — Validation / Review Gate package fail

| Field | Content |
|-------|---------|
| **Failure scenario** | Validation fails or Knowledge Review package is incomplete / non-sealable before human decision. |
| **Detection point** | Stage 2 fail **or** Stage 4 package readiness before `waiting_human`. |
| **Expected rejection** | No advancement to trusted Knowledge; Gate not treatable as approved; no token. |
| **Audit evidence** | Validation/Review failure codes; no `approved` HumanReviewDecision. |
| **Recovery path** | Fix upstream artifacts via new stage cycle or new run per Host policy. |
| **Related GAP** | GAP-BR-016 (Proposal fetch for presentation — if surface blocked). |

---

### FC-04 — Human `rejected`

| Field | Content |
|-------|---------|
| **Failure scenario** | Owner calls `resumeHuman(..., { outcome: "rejected" }, "human")`. |
| **Detection point** | Host Gate / `resumeHumanGate` (D1/D4). |
| **Expected rejection** | No `apply_token`; no Knowledge SoR apply; run failed (or terminal reject state); product must not claim Verified Knowledge. |
| **Audit evidence** | HumanReviewDecision `rejected`; actor_kind=human; no token mint event. |
| **Recovery path** | New research run if owner still wants Knowledge; lineage retains rejection. |
| **Related GAP** | None new. |

---

### FC-05 — Human `request_changes`

| Field | Content |
|-------|---------|
| **Failure scenario** | Owner `request_changes` at Gate. |
| **Detection point** | Host Gate (D1/D4). |
| **Expected rejection** | No token; no Knowledge seal/apply until **re-approval** of a **new** Proposal segment. |
| **Audit evidence** | Decision `request_changes`; subsequent Proposal revision events; Gate re-entry `waiting_human`. |
| **Recovery path** | Stage 3 produces revised Proposal → Gate again → human `approved` (then HP-01 token path). |
| **Related GAP** | None new. |

---

### FC-06 — Missing human approval

| Field | Content |
|-------|---------|
| **Failure scenario** | Attempt to run Stage 5 / Knowledge apply / claim Verified Knowledge while Gate never reached `approved` (skip Gate, forge advance, or apply while still `waiting_human` / pending). |
| **Detection point** | Host authorize-apply / Stage 5 preconditions / D2 “no approved → no token → no SoR”. |
| **Expected rejection** | Fail closed; `APPLY_TOKEN_REQUIRED` / missing approved decision; **no** SoR write. |
| **Audit evidence** | Denial without token mint; no Knowledge apply success; optional attempt-audit. |
| **Recovery path** | Complete Gate with human `approved` (HP-01); never product-side SoR write. |
| **Related GAP** | None new (D2/D4). |

---

### FC-07 — Invalid or reused apply_token

| Field | Content |
|-------|---------|
| **Failure scenario** | Stage 5 presents missing, malformed, forged, or **already spent** token. |
| **Detection point** | Host `consumeApplyTokenForKnowledge` / `assertTokenUnused` (D2). |
| **Expected rejection** | `TOKEN_INVALID` / reuse denial; **no** second SoR apply; no Graph success from forged path. |
| **Audit evidence** | Token deny code (invalid/spent); first successful consume (if any) only once. |
| **Recovery path** | Only via new human `approved` mint for current Proposal@version (no silent remint). |
| **Related GAP** | None new. |

---

### FC-08 — Wrong Proposal version (superseded token)

| Field | Content |
|-------|---------|
| **Failure scenario** | Token bound to Proposal `id@vN` presented after supersession (`vN+1`) or against mismatched subject_refs. |
| **Detection point** | Token bind check vs current Proposal artifact_id@version (D2 supersession). |
| **Expected rejection** | Token **void**; fail closed; re-approve new Proposal required. |
| **Audit evidence** | Mismatch/void denial; lineage shows superseding Proposal. |
| **Recovery path** | Human Gate on new Proposal → new token → Stage 5. |
| **Related GAP** | None new. |

---

### FC-09 — Unauthorized agent approval attempt

| Field | Content |
|-------|---------|
| **Failure scenario** | `resumeHuman` (or equivalent) with `actor_kind=agent`, agent `actor_id`, or Knowledge Review Agent self-approve / agent-minted token. |
| **Detection point** | Host `assertHumanActor` / Gate (D3); Stage 5 refuses agent-minted token. |
| **Expected rejection** | Decision refused; **no** token; **no** SoR; impossible path per Harness. |
| **Audit evidence** | Actor-kind rejection; no `approved` with agent actor. |
| **Recovery path** | Human owner `resumeHuman` with `actor_kind=human` only. |
| **Related GAP** | GAP-BR-009 / GAP-EH-002 (IdP proof of human — rule exists; production proof OPEN). |

---

### FC-10 — Artifact lineage mismatch

| Field | Content |
|-------|---------|
| **Failure scenario** | Downstream artifact parents/run_id/correlation disagree with HostRun lineage (wrong parent Knowledge, crossed runs, broken chain). |
| **Detection point** | Lineage assertions LA-* (E1/E3) at seal / AC check / test oracle. |
| **Expected rejection** | Fail AC / fail closed on apply or seal policy; no “Verified Knowledge” claim for mismatched chain. |
| **Audit evidence** | Lineage assertion fail id (e.g. LA-RUN-01, LA-KN-01); Host vs envelope join evidence. |
| **Recovery path** | Re-run under single HostRun; do not splice foreign artifacts. |
| **Related GAP** | GAP-BR-017 (envelope correlation/pipeline join); GAP-BR-018 (parents optional policy). |

---

### FC-11 — Tenant / workspace mismatch

| Field | Content |
|-------|---------|
| **Failure scenario** | createRun or Gate/apply uses tenant/workspace/caller inconsistent with ambient Kernel/Trust or owner binding (A3). |
| **Detection point** | Host createRun tenancy / Gate actor vs workspace owner / LA-TEN-01. |
| **Expected rejection** | Fail closed at entry or Gate; no cross-tenant SoR write. |
| **Audit evidence** | Tenancy denial; tenant_id on denial event. |
| **Recovery path** | Align fixture tenant + workspace owner + caller; retry. |
| **Related GAP** | GAP-BR-012; GAP-BR-011; GAP-BR-009. |

---

### FC-12 — Graph stage skip without recorded reason

| Field | Content |
|-------|---------|
| **Failure scenario** | Pipeline completes Knowledge path but GraphUpdate stage skipped with no Harness-recorded skip reason. |
| **Detection point** | Stage 6 completion / AC / audit completeness check (Sprint §8). |
| **Expected rejection** | Fail AC / audit defect — Bridge PASS must not claim Graph success; treat as incomplete. |
| **Audit evidence** | Missing GraphUpdate + missing skip reason; lineage incomplete vs E3 S-AC5 expectations. |
| **Recovery path** | Host/Harness must execute Graph or record authorized skip; product must not invent GraphUpdate. |
| **Related GAP** | None new (AC defect). |

---

### FC-13 — Product calls agents or Runtime admit as orchestrator

| Field | Content |
|-------|---------|
| **Failure scenario** | Personal Brain (or test) imports/calls agent runners or `@dyogas/runtime` `admitRun` directly as pipeline engine. |
| **Detection point** | Static/contract review + forbidden import/call in Bridge surface (B4/ADR-0010); test oracle. |
| **Expected rejection** | **Out of contract** — must not be implemented; test **FAIL** if present. Not a Host soft-error path — architecture ban. |
| **Audit evidence** | N/A Host denial (call never legal); design evidence = no such product API/wiring. |
| **Recovery path** | Route exclusively through `ExecutionHost.createRun` / Host resume APIs. |
| **Related GAP** | None new. |

---

## Required coverage matrix

| Required theme (user + Sprint §8 / T-F2 AC) | Case(s) |
|--------------------------------------------|---------|
| Missing human approval | FC-06 |
| Invalid or reused apply token | FC-07 |
| Artifact lineage mismatch | FC-10 |
| Wrong proposal version | FC-08 |
| Unauthorized agent approval | FC-09 |
| Tenant/workspace mismatch | FC-11 |
| Host createRun refuse | FC-01 |
| Stage fail | FC-02 |
| Gate fail | FC-03 |
| Human reject | FC-04 |
| request_changes | FC-05 |
| Agent-as-approver | FC-09 |
| Graph skip without reason | FC-12 |
| Direct agent / Runtime orchestrator forbidden | FC-13 |

---

## Cross-cutting fail-closed rules

1. **No token ⇒ no Knowledge SoR apply.**  
2. **No human `approved` ⇒ no token.**  
3. **Agent actor ⇒ Gate refuse.**  
4. **Spent / mismatched / superseded token ⇒ refuse.**  
5. **Tenancy mismatch ⇒ refuse at entry or Gate.**  
6. **Product must not admit/orchestrate Runtime or bind agents.**  
7. **Lineage break ⇒ no Verified Knowledge claim.**

---

## Design notes / non-implementation

| Item | Note |
|------|------|
| Exact Host error string codes | Cite D2 names where known; Host may surface equivalents — assert semantic fail-closed, not string equality unless Host exports stable codes |
| Stub stages in T-F4 | Failure injection via Host fixtures allowed in later tasks; **F2 does not implement** |
| IdP proof | FC-09 asserts Host actor_kind rule; production identity = GAP-BR-009 |

---

## GAPs

**No new GAP.** Design consumes existing OPEN gaps where detection/recovery depends on them (012, 011, 009, 016, 017, 018).

---

## Verification

| AC | Met? |
|----|------|
| Host createRun refuse | **Yes** — FC-01 |
| Stage fail | **Yes** — FC-02 |
| Gate fail | **Yes** — FC-03 |
| reject | **Yes** — FC-04 |
| request_changes | **Yes** — FC-05 |
| agent-as-approver | **Yes** — FC-09 |
| graph skip | **Yes** — FC-12 |
| direct agent/Runtime-orchestrator forbidden | **Yes** — FC-13 |
| User-required themes (approval/token/lineage/version/agent/tenant) | **Yes** — FC-06…11 |

| Test ID | Check | Result |
|---------|-------|--------|
| T-F2-T1 | Catalog covers Sprint §8 + required themes | **PASS** |
| T-F2-T2 | Each case has detection, reject, audit, recovery, GAP | **PASS** |
| T-F2-T3 | Fail-closed rules restated | **PASS** |
| T-F2-T4 | No tests/code/platform implemented | **PASS** |

---

## Evidence

`personal-brain/stage/bridge/F2-e2e-failure-cases.md` (this file)

---

## Next

**T-F3** — Runnable vs blocked test classification.

---

**End of F2-e2e-failure-cases**
