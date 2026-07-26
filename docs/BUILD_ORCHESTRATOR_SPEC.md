# DYOGAS Full Build Orchestrator Specification

**Document ID:** SPEC-ORCH-001  
**Status:** Accepted (documentation) — **not implemented**  
**Effective:** 2026-07-23  
**Owner:** Harness Architecture Agent (spec custodianship) · Founder (business authority only)  
**Type:** Process / orchestration specification  
**Related:** [`MASTER_ARCHITECTURE.md`](../MASTER_ARCHITECTURE.md) §5–§6 · [`engineering/README.md`](../engineering/README.md) · [`docs/OUT_OF_SCOPE_REGISTRY.md`](./OUT_OF_SCOPE_REGISTRY.md) · [`docs/adr/README.md`](./adr/README.md)

---

## 1. Purpose

Define how DYOGAS **automatically sequences and drives** remaining registered modules through the Engineering Lifecycle until MVP completion — without inventing a second Harness, without rewriting MASTER_ARCHITECTURE, and without bypassing Founder or Engineering Agent gates.

This document is **specification only**. It does **not** authorize new modules, does **not** implement an orchestrator binary, and does **not** amend Constitution, Harness law, or MASTER_ARCHITECTURE.

### 1.1 What the Orchestrator Is

| Is | Is not |
|----|--------|
| A **controller of Engineering Process stages** across `MOD-*` in Build Order | A pipeline runtime / second Harness |
| A **reader** of MASTER §5 Build Order + §6 Module Registry | An editor of MASTER (human/ADR-only amendments) |
| A **gate respector** (Founder, ADR, tests, deps) | A Founder substitute |
| Compatible with Process Mode Engineering Agents today | Required to wait for MOD-ENG-AGENTS (B17) |

### 1.2 Current baseline (informative)

| Module | Status at spec authorship |
|--------|---------------------------|
| MOD-KERNEL | COMPLETE |
| MOD-TRUST | COMPLETE |
| MOD-RUNTIME | COMPLETE |
| MOD-AGENT-SDK | COMPLETE |
| MOD-RESEARCH | COMPLETE |
| MOD-KNOWLEDGE | COMPLETE |

Remaining Build Order work (from MASTER §5) includes B10–B17 class milestones (Validation/Proposal path, Human Approval Gate + Notification, Markdown Engine, Graph Engine + Embedding, full knowledge-ingestion green, Web UI, optional Hosted Engineering Agents), subject to dependency and ADR gates.

---

## 2. Definitions

| Term | Definition |
|------|------------|
| **Build Orchestrator** | Logical agent/process that loads Build Order, selects the next eligible module/milestone, and drives Engineering Lifecycle stages until Module Complete or a hard stop. |
| **Eligible module** | A `MOD-*` (or Build Order milestone mapped to modules) whose dependencies are COMPLETE and whose ADR predecessors are Accepted where required. |
| **Hard stop** | Orchestrator pauses and escalates; does not advance stage or module. |
| **Soft continue** | Orchestrator proceeds to the next stage after DoD attestation. |
| **Module Complete** | Per-module lifecycle finished with tests green and MODULE_STATUS Module Complete = YES. |
| **MVP COMPLETE** | Global predicate defined in §7 — not the same as a single Module Complete. |
| **Out-of-Scope item** | Entry in [`OUT_OF_SCOPE_REGISTRY.md`](./OUT_OF_SCOPE_REGISTRY.md); orchestrator must not schedule it inside a completed module without a new Spec. |

---

## 3. Build Order Loader

### 3.1 Inputs (read-only)

1. [`MASTER_ARCHITECTURE.md`](../MASTER_ARCHITECTURE.md) §5 **Build Order** table (B0–B17).  
2. MASTER §6 **Module Registry** (dependencies, related SPECs, status).  
3. Module `*/MODULE_STATUS.md` files where present.  
4. [`docs/adr/`](./adr/) Accepted ADRs + Decision Log.  
5. [`docs/OUT_OF_SCOPE_REGISTRY.md`](./OUT_OF_SCOPE_REGISTRY.md).  
6. [`engineering/`](../engineering/) lifecycle laws (01–15 + README §2a).

### 3.2 Loader algorithm (normative)

1. **Parse** Build Order steps in ascending order (B0 → B17).  
2. **Classify** each step:
   - `governance` (B0–B1)  
   - `adr_milestone` (B2–B4 and any later ADR-only gates)  
   - `module_implementation` (B5–B9, B12–B14, B16–B17, and engine-mapped steps)  
   - `pipeline_integration` (B10–B11, B15)  
3. **Map** each step to zero or more `MOD-*` IDs from §6 (e.g., B12 → MOD-MARKDOWN).  
4. **Validate dependencies** for the candidate:
   - All listed module dependencies have `Module Complete = YES` (or governance `active_spec` / accepted Specs where no code module).  
   - Required ADRs are `Accepted` (reconcile planned SPEC-ADR-PLANNED-* with actual ADR-0001+ files).  
   - No cycle in dependency graph (MASTER hard rule).  
5. **Skip** steps already evidenced COMPLETE.  
6. **Emit** `NextEligible` = first incomplete step that passes validation; else `Idle` / `MVP_COMPLETE` if §7 satisfied.

### 3.3 Dependency validation failures (hard stop)

| Condition | Action |
|-----------|--------|
| Missing upstream Module Complete | Hard stop: `BLOCKER_MISSING_DEPENDENCY` |
| Required ADR still Proposed/Rejected | Hard stop: `BLOCKER_ADR` |
| Candidate would modify completed module to implement OOS item | Hard stop: `BLOCKER_OOS` — require new Spec for owning module |
| Unregistered `MOD-*` | Hard stop: `BLOCKER_UNREGISTERED` — refuse (MASTER registration required; orchestrator does not create modules) |

### 3.4 ADR reconciliation note

MASTER planned ADRs may already be satisfied by Accepted ADRs (examples at authorship: ADR-0001≈B4, ADR-0002≈B3 boundary, ADR-0006≈B2 SoR ownership). The Loader **must** treat Accepted ADRs that cover the Build Order intent as satisfying the ADR milestone, and record the mapping in orchestrator state (not by editing MASTER).

---

## 4. Module Execution Loop

For each **eligible** `MOD-*` (or pipeline milestone decomposed into Spec-backed work under registered modules):

### 4.1 Canonical stage sequence

```
Specification
→ Architecture Review
→ ADR handling (if verdict adr_required)
→ Backlog
→ Sprint Planning
→ Task Breakdown
→ Implementation
→ Testing
→ Debug (only if failures)
→ Code Review
→ Regression
→ Merge
→ Release
→ Retrospective
→ Module Complete
```

Stages follow [`engineering/README.md`](../engineering/README.md) and docs `01`–`15`. Orchestrator **does not invent stages**.

### 4.2 Per-stage obligations (summary)

| Stage | Must produce | Advance when |
|-------|--------------|--------------|
| Specification | SPEC doc + Engineering Agent chain | All agents approve + Founder business if required |
| Architecture Review | Verdict `no_arch_impact` \| `adr_required` \| `rejected` | Verdict recorded; not `rejected` |
| ADR handling | ADR Proposed → Agents → Founder → Accepted | Status `Accepted` (or N/A) |
| Backlog | Single backlog SoR for module | Backlog DoD PASS |
| Sprint Planning | Sprint goal + committed DoR-ready items | Sprint DoD PASS |
| Task Breakdown | Task graph + registry | Task DoD PASS |
| Implementation | Code under registered path; immutable deps untouched | Tasks done per AC |
| Testing | Automated tests for Spec metrics | All required tests PASS |
| Debug | Fixes for failures | Re-test green |
| Code Review | Engineering Agent review artifacts | All approve |
| Regression | Re-run suite + dependent CI jobs | Green |
| Merge / Release | Attested merge + versioned package/docs | Release notes / MODULE_STATUS |
| Retrospective | Short retro in MODULE_COMPLETE | Recorded |
| Module Complete | MODULE_STATUS + attestation | YES |

### 4.3 Immutability rule

Completed modules listed in §1.2 (and any later COMPLETE modules) are **immutable dependencies**. The Orchestrator must refuse tasks that modify their source except via a new Spec that explicitly reopens that module (rare; Decision Log required).

### 4.4 Automatic continue

After a stage DoD PASS, the Orchestrator **soft continues** to the next stage **without human pause**, except where §5 Hard Stops apply.

---

## 5. Gate Handling

### 5.1 Soft continue (default)

Proceed automatically when:

- Engineering Agents all `approve` for the stage  
- Required tests green  
- Dependencies still satisfied  
- No Architecture Review `rejected`  
- ADR Accepted if previously `adr_required`  
- Out-of-Scope Registry not violated  

### 5.2 Hard stops (must pause)

| Gate | Trigger | Resume when |
|------|---------|-------------|
| **Founder approval** | Spec accept, ADR accept, material business waiver, or process requiring Founder business | Founder records APPROVE (or REJECT → return to prior stage) |
| **Architecture conflict** | Review `rejected`; Art. VI/VIII/X/XI conflict; second orchestrator smell | Spec rework + new Arch Review |
| **Missing dependency** | Upstream Module Complete false; ADR missing | Upstream delivered / ADR Accepted |
| **Failed test** | Any required suite red | Debug → re-test green |
| **OOS violation** | Attempt to implement deferred capability in wrong/completed module | New Spec for rightful owner or superseding ADR |

### 5.3 Founder interaction contract

1. Orchestrator prepares a **Founder Approval Package** (path under module `stage/`).  
2. Orchestrator **stops** and surfaces: module, stage, decision asked, agent verdicts, risks.  
3. Orchestrator **must not pretend** Founder approved.  
4. On APPROVE: resume loop from the blocked stage’s next action (e.g., flip ADR to Accepted, then continue).  
5. On REJECT: return to Specification or ADR revision; log reason.

### 5.4 Engineering Agents

Always Process Mode or Hosted Mode per engineering README §2a:

Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer → (then Founder business when required).

---

## 6. Module State Tracking

### 6.1 Orchestrator state model (logical)

```text
BuildOrchestratorState {
  current_module: MOD-* | null
  current_stage: LifecycleStage | "IDLE" | "HARD_STOP"
  completed_modules: MOD-*[]
  failed_modules: { module: MOD-*, stage: LifecycleStage, reason: string }[]
  blockers: Blocker[]
  build_order_cursor: "B0"..."B17" | "DONE"
  adr_satisfaction_map: { build_step: string, adr_id: string, status: Accepted|Pending }[]
  last_test_report: { module: string, pass: boolean, summary: string }
  mvp_complete: boolean
}
```

### 6.2 Blocker object

| Field | Meaning |
|-------|---------|
| `id` | Stable blocker id |
| `type` | `FOUNDER` \| `ADR` \| `DEPENDENCY` \| `TEST` \| `ARCHITECTURE` \| `OOS` |
| `module` | Affected `MOD-*` |
| `stage` | Stage where stop occurred |
| `message` | Human-readable |
| `resume_condition` | Predicate text |

### 6.3 Persistence (spec-level)

Authoritative human-readable mirrors:

- Per-module: `*/MODULE_STATUS.md`  
- Global optional (future): `docs/BUILD_ORCHESTRATOR_STATE.md` — **not required by this Spec**; if created later, it must not fork MASTER.  

Orchestrator implementations (future) may use JSON state **in addition to**, not instead of, MODULE_STATUS.

### 6.4 Progress reporting (minimum)

Every soft continue or hard stop emits:

- Current Module  
- Current Stage  
- Completed Modules  
- Failed Modules  
- Blockers  
- Next action  

---

## 7. Failure Recovery

### 7.1 Retry rules

| Failure class | Retry | Limit |
|---------------|-------|-------|
| Flaky / environmental test | Auto-retry once after clean rebuild of deps | 1 |
| Deterministic test failure | No auto-retry; enter Debug stage | — |
| Agent `reject` | No retry of same artifact; Spec/ADR revision required | — |
| Founder `REJECT` | No retry of same package; revise then re-request | — |
| Dependency missing | Poll/re-validate after upstream Module Complete | unbounded wait (hard stop) |

### 7.2 Rollback rules

1. **Do not** roll back COMPLETE modules.  
2. **In-progress module:** on unrecoverable Architecture `rejected` or Founder reject of foundational ADR, mark module `FAILED` at stage, restore working tree to last green commit for that module path only (future impl), keep review artifacts for audit.  
3. **Partial Implementation with red tests:** remain in Debug; no Module Complete; no silent Merge.  
4. **Forbidden:** force-push, skip tests, or Founder override of Engineering Agent reject.

### 7.3 Human escalation

Escalate to Founder (business) and/or Architecture Reviewer when:

- Hard stop > agreed SLA (default: same business day for Founder packages)  
- Repeated Debug cycles (>2) on same Spec metric  
- Suspected MASTER inconsistency (report only — do not auto-edit MASTER)  
- Security / tenancy / SoR bypass suspected  

Escalation package must include state snapshot §6.1 + failing evidence.

---

## 8. MVP Completion Criteria

### 8.1 Definition: DYOGAS MVP COMPLETE

**DYOGAS MVP COMPLETE** is true when **all** of the following hold:

1. **Platform spine COMPLETE:** MOD-KERNEL, MOD-TRUST, MOD-RUNTIME, MOD-AGENT-SDK.  
2. **First user-value path COMPLETE:** MOD-RESEARCH, MOD-KNOWLEDGE (approval-gated SoR).  
3. **Human Approval path usable without bypass:**  
   - Product Human Approval is represented as data/contracts (pending→approved) and SoR apply refuses non-approved states.  
   - Web UI may still be incomplete; MVP does **not** require MOD-WEB-UI if approval can be recorded via attested non-UI control path — but B11 remains recommended before claiming *operator-ready* MVP.  
4. **Pipeline integration minimum:**  
   - Research → Knowledge handoff contracts green in tests.  
   - Runtime admit + Trust audit exercised on the path.  
5. **ADR floor Accepted:** stack (ADR-0001), egress deny-default (ADR-0002), Runtime host (ADR-0003), Agent SDK boundary (ADR-0004), Research boundary (ADR-0005), Knowledge SoR (ADR-0006) — or documented supersessions.  
6. **CI green** for all COMPLETE module packages.  
7. **Out-of-Scope Registry ACTIVE** and not violated by MVP claims (live cloud egress, graph DB, Hosted ENG-AGENTS optional).

### 8.2 Explicitly NOT required for MVP COMPLETE

| Item | Build Order | Notes |
|------|-------------|-------|
| MOD-MARKDOWN full engine | B12 | Handoff contract from Knowledge may exist first |
| MOD-GRAPH / graph DB | B14 | Retrieval contract only is enough for MVP |
| Full knowledge-ingestion E2E non-prod | B15 | Stretch; recommended soon after Markdown/Validation |
| MOD-WEB-UI | B16 | Required for *operator UX MVP*, not core SoR MVP |
| MOD-ENG-AGENTS Hosted | B17 | Optional; Process Mode sufficient |
| Cloud AI allow / vendor | OOS-T-001/002 | Deny-default remains valid MVP |

### 8.3 Two-tier completion labels (recommended)

| Label | Meaning |
|-------|---------|
| **MVP-CORE COMPLETE** | §8.1 items 1–2, 4–7 (current baseline at authorship already meets CORE if Knowledge+Research COMPLETE and CI green) |
| **MVP-OPERATOR COMPLETE** | MVP-CORE + B10–B12 path + Human Approval Gate productization (B11) + minimal Web UI **or** equivalent attested approval console |
| **MVP-PIPELINE COMPLETE** | MVP-OPERATOR + B14–B15 (Graph/Embedding + full ingestion green non-prod) |

Orchestrator must state which label it claims; default target for auto-run after current baseline: **MVP-OPERATOR COMPLETE**.

---

## 9. Recommended remaining sequence (informative)

After current COMPLETE set, Loader should prefer:

1. **B10** — Source Validation + Proposal path (engine/contract work under MOD-RESEARCH / CPAS — no new unregistered module).  
2. **B11** — Human Approval Gate + Notification (product gate; may touch Runtime/Notification contract; still no SoR self-approve).  
3. **B12** — MOD-MARKDOWN.  
4. **B13 enrichment** — Knowledge embeddings/memory skills if still thin vs MASTER responsibilities (only via Spec; module already COMPLETE may need *enhancement Spec*).  
5. **B14** — MOD-GRAPH (+ embedding path).  
6. **B15** — Full knowledge-ingestion green (non-prod).  
7. **B16** — MOD-WEB-UI.  
8. **B17** — MOD-ENG-AGENTS (optional).

Exact Spec IDs remain those in MASTER §7 / module registries; Orchestrator does not invent SPECs without Engineering Process.

---

## 10. Non-Goals of this Spec

1. Implementing the orchestrator binary or CI workflow beyond documentation.  
2. Creating new `MOD-*` entries.  
3. Modifying Constitution, Harness, Engineering Process law files, or MASTER_ARCHITECTURE.  
4. Auto-merging to protected branches without DoD.  
5. Replacing Harness as product orchestrator of agent pipelines.

---

## 11. Acceptance Criteria (for this documentation Spec)

- [x] Build Order Loader defined  
- [x] Module Execution Loop defined  
- [x] Gate Handling (auto-continue vs hard stop) defined  
- [x] Module State Tracking defined  
- [x] Failure Recovery defined  
- [x] MVP Completion Criteria defined  
- [x] No implementation code added for the orchestrator itself  

---

## 12. Next Recommended Action

1. Confirm **MVP-CORE** attestation (CI green across COMPLETE modules).  
2. Command Harness Execution Engine: **Start next eligible Build Order step (B10 Validation + Proposal path)** under this Orchestrator Spec — Specification stage first, stop only for Founder.  
3. Optionally add a read-only `docs/BUILD_ORCHESTRATOR_STATE.md` snapshot after first orchestrated run (still docs-only unless separately commanded to implement).

---

**End of SPEC-ORCH-001**
