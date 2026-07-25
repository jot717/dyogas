# D4 — Human Approval Gate Surface Contract

**Task:** T-D4  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Spec:** SPEC-PROD-004-HARNESS-BRIDGE (AC-8 presentation-agnostic)  
**Depends on:** T-D1 · cites D2, D3  
**Mode:** Implementation Mode (**contract only** — **no UI**; **no** approval frontend/API invention; **no** Runtime/SDK/Host/auth implementation)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Define how Personal Brain **surfaces** the Human Approval Gate to the workspace owner at the **contract** level: what must be presented, decided, and returned to Host — without designing screens or inventing APIs.

```text
Host (waiting_human + Proposal package)
        ↓  surface (product obligation)
Owner decision (Accept / Reject / Modify)
        ↓  Host.resumeHuman(HumanDecision)
Host enforces Gate + token / fail-closed
```

**AC-8:** No acceptance path relies on UI existence.

---

## Explicit exclusions

| Excluded | Statement |
|----------|-----------|
| UI / screens / layout | **Out of scope** |
| Approval frontend | **Out of scope** |
| New approval HTTP/RPC APIs | **Out of scope** — use existing Host `resumeHuman` / `getRun` |
| Authentication / IdP implementation | **Out of scope** (GAP-BR-009 OPEN) |
| Runtime / SDK / Host code | **Forbidden** |

---

## Contract parties

| Party | Obligation |
|-------|------------|
| **Personal Brain (product)** | Detect Host run `waiting_human`; present Gate **inputs** to attributable owner; capture decision; call Host `resumeHuman`; never agent-as-actor (D3) |
| **Execution Host** | Pause at Stage 4; enforce outcomes; mint/refuse token; audit (D1–D2) |
| **Owner (human)** | Sole approval authority |

---

## Gate input (must be surfaceable)

Product must make available to the owner (any channel — not UI-specified):

| Input | Source |
|-------|--------|
| `run_id` | `HostRun.run_id` |
| Pipeline pin | `HostRun.pin` (`knowledge-ingestion` @ version) |
| Sealed **`Proposal`** under review | Lineage / stage package (C3) |
| Review package context | Checklist id, findings from Knowledge Review (`pending` HumanReviewDecision if present) |
| Correlation / tenancy / workspace | CreateRun + Brief tenancy (A3) |
| Allowed decisions | Accept / Reject / Modify only (primary map) |

---

## Gate output (product → Host)

| Output | Mapping |
|--------|---------|
| Decision payload | Host `HumanDecision`: `outcome`, `actor_id`, optional `reason` |
| Actor kind | **human** only — never agent (D3) |
| Host call | `ExecutionHost.resumeHuman(runId, decision, actor_kind?)` |

No parallel product “approval record” substitutes for Host Gate (Constitution anti-pattern).

---

## Human decision artifact

| Artifact | Role |
|----------|------|
| **`HumanReviewDecision`** | Platform sealed Gate record (Stage 4) — Host/Harness authoring path |
| Product local notes | Optional; **must not** replace sealed decision or authorize SoR |

---

## Allowed decisions

| Owner intent | `HumanDecision.outcome` | Effect (D1) |
|--------------|-------------------------|-------------|
| Accept | `approved` | Token mint → Stage 5 path (D2) |
| Reject | `rejected` | Fail closed; no Knowledge |
| Modify | `request_changes` | Stage 3 new Proposal → Gate again; **re-approval** |

Harness `expired` / `escalated` remain Host/Harness-driven — product need not invent them as owner buttons; if surfaced, map only to existing §9 outcomes (no new enums).

---

## Audit requirements

| Requirement | Owner |
|-------------|-------|
| Decision outcome + `actor_id` + timestamp on Trust sink | Host |
| Product must pass attributable owner as `actor_id` | Personal Brain |
| No silent / side-channel approval | Both — fail closed |
| Correlation join Request → run → decision | Product `correlation_id` + Host lineage |

---

## Stage transition rules

| Host status / Gate state | Product contract |
|--------------------------|------------------|
| `waiting_human` | Surface Gate inputs; await owner |
| After `approved` | Observe `applying` / progressed lineage; do not invent SoR write |
| After `rejected` / failed | Surface terminal fail; no Knowledge claim |
| After `request_changes` | Expect new Proposal segment; surface Gate again when `waiting_human` |
| Not waiting | Must not call `resumeHuman` |

Transitions enforced by Host/Harness — product observes `getRun` / lineage, does not drive Runtime.

---

## Failure / reject / modify paths

| Path | Contract behavior |
|------|-------------------|
| **Reject** | `resumeHuman` → `rejected`; no token; run failed; product must not treat as Verified Knowledge |
| **Modify** | `resumeHuman` → `request_changes`; no token; await revised Proposal + new Gate cycle |
| **Agent / unbound actor** | Must not submit; Host refuses (D3) |
| **Incomplete checklist / Host refuse** | Fail closed; product surfaces refusal — no UI invention required |
| **Expired (Harness)** | Treat as failed Gate; new run or Host reopen policy — no assumed approval |

---

## GAPs

| Item | Disposition |
|------|-------------|
| How product obtains sealed Proposal bytes for presentation | Prefer Host lineage refs / existing artifact store — if wire format for product fetch unspecified, **GAP-BR-016** OPEN (below) |
| IdP proof owner = actor | Existing **GAP-BR-009** |

### GAP-BR-016 (registered)

Product Gate surface needs a consume-only way to resolve Proposal (and package) content for owner review from Host lineage refs. Exact product fetch binding to artifact store is not fully specified in Bridge docs yet — **do not invent** approval API or store.

---

## Verification

| AC | Met? |
|----|------|
| Contract-level responsibilities only | **Yes** |
| Explicitly excludes UI design | **Yes** |
| AC-8 presentation-agnostic | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-D4-T1 | Gate I/O + allowed decisions mapped to Host HumanDecision | **PASS** |
| T-D4-T2 | Reject/Modify/fail paths documented | **PASS** |
| T-D4-T3 | UI / frontend / new approval API excluded | **PASS** |
| T-D4-T4 | No Runtime/SDK/Host/auth implementation | **PASS** |

### Scope boundary

- **In:** Contract definition under `personal-brain/stage/bridge/`.  
- **Out:** UI; auth; platform code; inventing Gate HTTP APIs.

---

## Evidence

`personal-brain/stage/bridge/D4-gate-surface-contract.md` (this file)

---

## Band D complete

T-D1…T-D4 **DONE**. Next: **T-E1** (lineage assertion checklist).

---

**End of D4-gate-surface-contract**
