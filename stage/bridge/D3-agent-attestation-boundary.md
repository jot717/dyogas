# D3 — Agent / Human Attestation Boundary

**Task:** T-D3  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE §7  
**Depends on:** T-D1 (D2 cited)  
**Citations:** Constitution **Art. III**, **Art. XIII**; Harness Spec **§9**; `pipelines/knowledge-ingestion.md` Stage 4; Host `assertHumanActor` (`execution-host/src/gate/human.ts`)  
**Mode:** Implementation Mode (attestation only — **no** approval APIs; **no** auth systems; **no** Runtime/SDK/Host edits)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Attest that **agent execution** and **human approval authority** are separated: agents may prepare; only an attributable human owner may satisfy the Human Approval Gate for personal trusted Knowledge.

---

## Explicit attestation

```text
ATTESTATION (Bridge / knowledge-ingestion Stage 4):

Agent identities MUST NOT appear as the actor on approved / rejected / escalated
Human Approval Gate decisions.

Agents MUST NOT mint apply_token.

Agents MUST NOT authorize Knowledge Plane SoR writes.

Violation → FAIL CLOSED (no SoR apply; no token; Host refuses actor_kind=agent).
```

| Source | Binding statement |
|--------|-------------------|
| Constitution Art. III | Humans retain final authority over Harness Human Approval Gates that mutate knowledge SoR; **no agent identity** as actor on `approved`/`rejected` |
| Constitution Art. XIII | Urgency does not waive Human Approval; SoR traces to Gate decision |
| Harness §9.3 / §9.5 | Agents prepare packages; **may not self-approve**; only human identity via Trust & Control as `actor` |
| Pipeline Stage 4 | Knowledge Review Agent prepares package; **never** self-approves or mints token |
| Host | `assertHumanActor`: `actor_kind === "agent"` → refuse resume |

---

## Separation of duties

### Agent responsibilities

| Role | May | Must not |
|------|-----|----------|
| Research / Validation / Proposal / Markdown / Graph / Embedding / Memory | Produce candidates under contract (C2) | Approve Gate; mint token; write SoR without Host+token |
| Knowledge Review Agent | Prepare checklist, findings, `pending` package | Set final `approved` / mint `apply_token` / act as Human Approver |
| Notification Agent | Deliver pending/critical notices | Decide Gate outcome |
| Learning Agent | Propose lessons via Proposal path | Auto-apply or replace Stage 4 |

### Human Owner responsibilities

| Duty | Content |
|------|---------|
| Final Gate authority | Accept / Reject / Modify → §9 outcomes (D1) |
| Attributable actor | Named human `actor_id` / `approver` on non-pending decision |
| Checklist diligence | Incomplete checklist → no `approved` |
| Re-approval | After Modify / new Proposal version (D1) |

### Attestation producer

| Producer | What they attest / emit |
|----------|-------------------------|
| Knowledge Review Agent | Package + findings; may emit `HumanReviewDecision` with `outcome=pending` only as package scaffold |
| **Human Owner** | Final non-pending outcome on `HumanReviewDecision` — **sole** human-authored final state in pipeline (artifact SoT) |

### Attestation verifier

| Verifier | Check |
|----------|-------|
| **Execution Host** | `resumeHuman` / `assertHumanActor` — reject `actor_kind=agent` |
| **Harness law** | Gate path records human actor (or `harness` for `expired` only) |
| **Audit Trail** | Decision events carry human `actor_id` + outcome |
| **Stage 5 / token consume** | Token present only after human `approved` (D2) |

### Approval authority

| Authority | Holder |
|-----------|--------|
| Human Approval Gate (Stage 4) | **Human Approver Roster / workspace owner** only |
| Apply-token mint | Host/Harness on human `approved` only (D2) |
| Knowledge SoR apply | Knowledge Engine under Host authorize + spent token — not agent self-authorize |

---

## Failure cases (fail closed)

| Case | Required behavior |
|------|-------------------|
| Agent id as Gate `actor` / `actor_kind=agent` | Refuse decision; no token; no SoR |
| Knowledge Review Agent “self-approves” | Forbidden; Host/Harness reject |
| Agent mints or forges `apply_token` | Forbidden; Stage 5 fail closed |
| Slack/UI informal “LGTM” substitutes for Gate | Forbidden (Constitution anti-pattern) — not a valid approval channel |
| Urgency skips Gate | Forbidden (Art. III / XIII) |
| Missing attributable human on `approved` | Refuse |

---

## Explicit non-proposals

| Forbidden | Why |
|-----------|-----|
| New approval / auth APIs | Consume Host `resumeHuman` + existing Trust identity |
| Runtime / SDK / Host implementation | Sprint hard rule |
| Agent permission system redesign | Out of scope; Host already refuses agent actor |
| Closing GAP-BR-009 (IdP proof) | Register only — production identity still OPEN |

---

## GAPs

| Item | Disposition |
|------|-------------|
| Production IdP proves caller = workspace owner | Existing **GAP-BR-009** / **GAP-EH-002** — OPEN (attestation of *rule* does not close identity proof) |

**New GAPs this task:** none.

---

## Verification

| AC | Met? |
|----|------|
| Explicit attestation with citations | **Yes** |
| Fail-closed statement | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-D3-T1 | Art. III / Harness §9 / Host assertHumanActor cited | **PASS** |
| T-D3-T2 | Agent vs Human duties separated | **PASS** |
| T-D3-T3 | Fail-closed cases listed | **PASS** |
| T-D3-T4 | No approval API / Runtime / SDK / Host / auth system created | **PASS** |

### Scope boundary

- **In:** Documentation attestation under `personal-brain/stage/bridge/`.  
- **Out:** Implementing auth; platform edits; UI.

---

## Evidence

`personal-brain/stage/bridge/D3-agent-attestation-boundary.md` (this file)

(Registry historical name `D3-agent-cannot-approve-attestation.md` superseded by this filename per execution request.)

---

## Next

**T-D4** — Gate surface contract (presentation-agnostic; no UI).

---

**End of D3-agent-attestation-boundary**
