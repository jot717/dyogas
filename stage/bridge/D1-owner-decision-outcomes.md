# D1 — Owner Decision Outcomes → Harness §9

**Task:** T-D1  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE §7  
**Law:** `harness/HARNESS_SPECIFICATION.md` §9 · `pipelines/knowledge-ingestion.md` Stage 4  
**Depends on:** T-C1 (recommended); C3/C4 for Knowledge eligibility context  
**Mode:** Implementation Mode (mapping only — **no** UI; **no** new approval APIs; **no** Runtime/SDK/Host edits)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Map Personal Brain **owner** decisions (Accept / Reject / Modify) to Harness Human Approval Gate outcomes. Confirm **re-approval** after Modify before any Knowledge SoR write.

Product **surfaces** the gate; **Host** enforces wait/fail-closed (ADR-0010). Personal Brain does not invent approval semantics.

---

## Review input artifact

| Field | Content |
|-------|---------|
| **Primary review input** | Sealed `Proposal` (Stage 3 output) |
| **Package producer** | Knowledge Review Agent (SPEC-AGT-004) — checklist/findings only |
| **Gate stage** | Stage 4 — Human Review |
| **Decision artifact** | `HumanReviewDecision` (`artifacts/human-review-decision.md`) |
| **Approver** | Workspace **owner** (attributable human) — same class as `caller_id` / A3; **never** an agent |

Initial seal may be `outcome=pending` until the owner acts (pipeline §5.5).

---

## Three-way mapping (product → Harness)

| Owner decision | Harness §9 outcome | Host `HumanDecision.outcome` |
|----------------|--------------------|------------------------------|
| **Accept** | `approved` | `approved` |
| **Reject** | `rejected` | `rejected` |
| **Modify** | `request_changes` | `request_changes` |

Harness also defines `expired` and `escalated` (pipeline/Harness-driven). Product Bridge primary UX map is the three above; do **not** invent new outcomes.

---

## Per-outcome behavior

### Accept → `approved`

| Field | Content |
|-------|---------|
| **Next stage** | Stage **5 — Markdown** (then Graph → Embedding → Memory) |
| **Artifact handling** | Seal `HumanReviewDecision` with `approved` + attributable `approver` / `actor_id`; mint **single-use** `apply_token` bound to `Proposal artifact_id@version`; prior sealed Proposal unchanged |
| **Knowledge eligibility** | **Eligible to proceed** — SoR apply only at Stage 5 with valid token (C4); not yet Knowledge until Stage 5 completes |
| **Audit requirement** | Record outcome, actor, timestamp; Host Human Gate + Trust audit; token mint event |
| **Verification requirement** | Checklist complete before `approved`; token single-use and version-bound; agent did not self-approve |

### Reject → `rejected`

| Field | Content |
|-------|---------|
| **Next stage** | **None** — run **FAILED** closed; no Stage 5 handoff |
| **Artifact handling** | Seal `HumanReviewDecision` with `rejected` + approver; **no** `apply_token` |
| **Knowledge eligibility** | **No** — no personal trusted Knowledge from this Proposal |
| **Audit requirement** | Outcome + actor + fail-closed reason; run terminal failed |
| **Verification requirement** | No downstream SoR apply; no token present |

### Modify → `request_changes`

| Field | Content |
|-------|---------|
| **Next stage** | Return to **Stage 3 — Proposal** (new run segment); new `Proposal` version |
| **Artifact handling** | Seal `HumanReviewDecision` with `request_changes` (+ change list); prior `Proposal` / decision versions remain **immutable history**; new Proposal `parents[]` include prior Proposal version (Harness §5 / §9) |
| **Knowledge eligibility** | **No** until a later **Accept** (`approved`) on the **new** Proposal version |
| **Audit requirement** | Outcome + actor + change requests; lineage walkable to prior Proposal |
| **Verification requirement** | **Re-approval required** after revise — no auto-promote; no token on `request_changes` |

```text
Modify (request_changes)
        ↓
Stage 3 new Proposal@version+1
        ↓
Stage 4 again (pending → owner decision)
        ↓
Accept → approved → Stage 5 …
   or Reject / Modify again
```

---

## Hard rules (restated)

1. Agent identity **cannot** satisfy the Human Approval Gate (→ T-D3).  
2. No automatic promotion Proposal → Knowledge.  
3. Urgency never waives Human Approval.  
4. No new approval semantics / UI / IdP invented here (GAP-BR-009 / GAP-EH-002 remain OPEN for production identity proof).

---

## GAPs

| Item | Action |
|------|--------|
| Production IdP proof of owner = approver | Existing **GAP-BR-009** / **GAP-EH-002** — not closed |
| Product “owner edit + re-submit” vs pure `request_changes` packaging | Covered by Spec §7 “and/or”; **no new GAP** — both require re-approval before Knowledge |
| New outcomes beyond §9 | **Forbidden** — do not invent |

**New GAPs this task:** none.

---

## Verification

| AC | Met? |
|----|------|
| Three-way mapping complete | **Yes** — Accept/Reject/Modify → approved/rejected/request_changes |
| Re-approval required after modify | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-D1-T1 | Review input = Proposal; decision = HumanReviewDecision | **PASS** |
| T-D1-T2 | Accept → Stage 5 + token; Reject → fail closed; Modify → Stage 3 + re-gate | **PASS** |
| T-D1-T3 | Knowledge eligibility only after approved path | **PASS** |
| T-D1-T4 | No UI / Runtime / SDK / Host / invented approval APIs | **PASS** |

### Scope boundary

- **In:** Documentation map under `personal-brain/stage/bridge/`.  
- **Out:** UI; new approval system; platform edits; closing identity GAPs.

---

## Evidence

`personal-brain/stage/bridge/D1-owner-decision-outcomes.md` (this file)

(Registry historical name `D1-human-approval-outcome-map.md` superseded by this filename per execution request.)

---

## Next

**T-D2** — Apply-token / SoR apply preconditions (deps T-D1 + T-C3 met).

---

**End of D1-owner-decision-outcomes**
