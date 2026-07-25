# D2 — Apply-Token / SoR Apply Preconditions

**Task:** T-D2  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE  
**Depends on:** T-D1, T-C3  
**Law / SoT (consume):** Harness §9 · `pipelines/knowledge-ingestion.md` Stages 4–5 · `artifacts/human-review-decision.md` · Host `gate/apply-token.ts` / `resumeHumanGate` · Knowledge Engine apply path (existing)  
**Mode:** Implementation Mode (preconditions only — **no** token implementation; **no** Runtime/SDK/Host/schema/API invention)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Document **conditions required** before approved content may become **Knowledge Plane SoR**. No new SoR write path. No new approval semantics.

```text
Proposal (sealed)
        ↓ Stage 4
HumanReviewDecision (approved) + apply_token
        ↓ Stage 5
Knowledge sealed + Knowledge Engine apply (token spent once)
```

Personal Brain: surface gate + call Host (`resumeHuman` / authorize apply) — never mint tokens or write SoR itself.

---

## 1. Input artifacts

| Artifact | Role |
|----------|------|
| Sealed **`Proposal`** | Subject under review (`subject_refs` / token bind target) |
| **`HumanReviewDecision`** | Gate outcome + optional `apply_token` |
| **`apply_token`** | Single-use authorization for Knowledge Plane apply (minted only on `approved`) |

Stage 5 also consumes Proposal content for faithful authoring (Markdown Agent) — only after valid approved decision + token.

---

## 2. HumanReviewDecision requirements

| Requirement | Rule |
|-------------|------|
| Outcome | Must be **`approved`** for SoR path (D1 Accept) |
| Approver | Attributable **human** `approver.actor_id` / Host `HumanDecision.actor_id` — never agent (→ T-D3) |
| Checklist | Incomplete checklist → **no** `approved` (Harness §9.3 / §9.5) |
| Subject | Decision bound to exact Proposal under review |
| Token field | `apply_token` **required** when `approved`; **forbidden** when `rejected` (artifact SoT) |
| Pending | `pending` alone does **not** authorize SoR |

---

## 3. Apply-token conditions

| Condition | Rule | Failure if violated |
|-----------|------|---------------------|
| Mint trigger | Only on Gate outcome **`approved`** (Harness §9; Host `resumeHumanGate`) | No token → no SoR |
| Binding | Bound to exact `Proposal artifact_id@version` (+ Host: `run_id`) | `APPLY_TOKEN_MISMATCH` / void |
| Single-use | Spent **atomically** with Knowledge apply; never reusable | `APPLY_TOKEN_REUSED` / `DOUBLE_APPLY` |
| Supersession | If Proposal superseded before use → token **void** against new version | Fail closed; re-approve new Proposal |
| Presenter | Downstream Stage 5 / Host authorize-apply presents unspent token | `APPLY_TOKEN_REQUIRED` |
| Agent mint | Knowledge Review Agent / any agent **must not** mint | Forbidden / fail closed |

Host symbols (consume-only cite): `mintApplyToken`, `consumeApplyTokenForKnowledge`, `assertTokenUnused` — `execution-host/src/gate/apply-token.ts`.

---

## 4. Knowledge write eligibility

All must hold:

1. Stage 4 **`approved`** with human actor.  
2. Valid, unspent `apply_token` matching Proposal `artifact_id@version` and run.  
3. Stage 5 Markdown path under Host (Review Gate + schema / claim-provenance checks).  
4. SoR mutation via **existing Knowledge Engine apply** authorized by Host — **not** product-direct SoR write.  
5. Tenancy consistent with run / Brief (A3, C4).

| Eligible? | When |
|-----------|------|
| **Yes** | Above preconditions met → sealed `Knowledge` applied to Knowledge Plane |
| **No** | `rejected` / `request_changes` / `expired` / missing-invalid-spent token / agent-as-approver / product bypass Host |

Post-apply: Embedding/Memory may proceed (C4) — they are **not** SoR substitutes.

---

## 5. Audit requirements

| Event | Must record |
|-------|-------------|
| Human decision | Outcome, actor_id, actor_kind=human, timestamp, run/tenant/pipeline |
| Token mint | Bound Proposal id@version, run_id |
| Token consume | Atomic with Knowledge apply; spent flag |
| Knowledge seal/apply | Artifact id@version, digest, tenancy, parents/lineage |
| Failures | Explicit denial codes (reuse, mismatch, missing token, policy) |

Same Trust audit sink path as Host createRun (B3) — no parallel product audit store for SoR authorization.

---

## 6. Failure cases (fail closed)

| Case | Behavior |
|------|----------|
| Approve with incomplete checklist | Refuse `approved` |
| Agent / self-approval as actor | Reject (T-D3) |
| Missing apply token at Stage 5 | `TOKEN_INVALID` / `APPLY_TOKEN_REQUIRED` — no SoR |
| Token reused | Critical — void second apply; investigate double-apply |
| Token vs wrong Proposal version | Mismatch — no SoR |
| Proposal superseded; old token used | Void — re-approve new version |
| `rejected` / `expired` | No token; run failed; no Knowledge |
| `request_changes` | No token; new Proposal + **re-approval** (D1) |
| Product writes Knowledge without Host/token | **Forbidden** — Constitution / Spec Non-Goals |

---

## Explicit non-proposals

| Forbidden | Why |
|-----------|-----|
| Implement / redesign tokens in this task | Docs only |
| New authorization APIs | Consume Host |
| New Knowledge schemas | Spec |
| Runtime / SDK / Host code changes | Sprint hard rule |
| New SoR write path beside Knowledge Engine + Host authorize | ADR-0010 / SPEC-PROD-004 |

---

## GAPs

| Item | Disposition |
|------|-------------|
| Production proof owner = approver | Existing **GAP-BR-009** / **GAP-EH-002** — OPEN |
| Product Ask↔Embedding join | Existing **GAP-BR-015** — unrelated to token mint |

**New GAPs this task:** none.

---

## Verification

| AC | Met? |
|----|------|
| Preconditions listed | **Yes** |
| No new SoR write path | **Yes** |
| No new approval semantics | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-D2-T1 | approved + token bind + single-use documented | **PASS** |
| T-D2-T2 | Knowledge eligibility requires Host/Engine path | **PASS** |
| T-D2-T3 | Failure matrix fail-closed | **PASS** |
| T-D2-T4 | No token/Runtime/SDK/Host/schema implementation | **PASS** |

### Scope boundary

- **In:** Documentation under `personal-brain/stage/bridge/`.  
- **Out:** Coding tokens; platform edits; UI; new APIs.

---

## Evidence

`personal-brain/stage/bridge/D2-apply-token-sor-preconditions.md` (this file)

---

## Next

**T-D3** — Agent cannot approve attestation (or parallel **T-D4** gate surface contract).

---

**End of D2-apply-token-sor-preconditions**
