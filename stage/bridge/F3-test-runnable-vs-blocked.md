# F3 — Test Runnable vs Blocked Classification

**Task:** T-F3  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Depends on:** T-F1, T-F2, T-B5  
**Cites:** E3 lineage evidence; GAP Registry  
**Mode:** Implementation Mode (**classification only** — **no** tests, automation, code, Runtime/SDK/Host edits)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Classify all Bridge verification items from **F1**, **F2**, and **E3** as executable now vs blocked vs design-only, given Host createRun path verdict **AVAILABLE** (`B5-host-createRun-verdict.md`).

---

## Tag legend (Task Registry AC)

| Tag | Meaning |
|-----|---------|
| **RUNNABLE_NOW** | Can be exercised with **existing** `@dyogas/execution-host` public APIs (+ Personal Brain pin/fixtures) **without** Runtime/SDK/Host rewrite. May still need a **minimal PB-side harness** in **T-F4**. |
| **BLOCKED_ON_HOST_CREATERUN** | Cannot proceed until Host `createRun` path exists / is safe. |
| **DESIGN_ONLY** | Satisfied by design docs / static contract review, **or** needs full agent LLM stack / Host hardening / GAP closure beyond createRun availability — not a fair live E2E without further platform work. |

**B5 verdict:** **AVAILABLE** → almost no item should remain **BLOCKED_ON_HOST_CREATERUN**. Residual blocks are **fixtures / GAPs / Host assert hardening**, not missing createRun.

### Runnable now? (YES/NO)

| Value | Meaning |
|-------|---------|
| **YES** | Tag = **RUNNABLE_NOW** (T-F4 may implement). |
| **NO** | Tag = **DESIGN_ONLY** or **BLOCKED_ON_HOST_CREATERUN**. |

---

## Summary counts

| Tag | Count |
|-----|-------|
| RUNNABLE_NOW | 10 |
| BLOCKED_ON_HOST_CREATERUN | 0 |
| DESIGN_ONLY | 22 |
| **Total items** | **32** |

*(HP-01 split into entry smoke + full chain; FC-01…13; E3 EV-LIN / EV-RUN / EV-ART / EV-AUD / V\* packs.)*

---

## A. Happy-path (F1)

| Test ID | Purpose | Tag | Runnable now? | Blocking dependency | Expected future execution stage |
|---------|---------|-----|---------------|---------------------|----------------------------------|
| **HP-01-ENTRY** | `createExecutionHost` + `createRun` with approved pin + tenancy; HostRun returned; no product Runtime orchestrator | **RUNNABLE_NOW** | **YES** | Ambient Kernel/Trust + fixture Brief/bootstrap (GAP-BR-002…005, 012 workarounds) | **T-F4** minimal Host smoke |
| **HP-01-FULL** | Full trusted path → `waiting_human` → human `approved` → token → Knowledge → GraphUpdate + lineage | **DESIGN_ONLY** | **NO** | Full stage agents / LLM or Host fixture hooks **without** Host rewrite; GAP-BR-014 PainStatement; sealed envelopes EV-ART-* | Post–T-F4 follow-up / fixture-capable Host path; not required to invent Host hooks this sprint |

---

## B. Failure cases (F2)

| Test ID | Purpose | Tag | Runnable now? | Blocking dependency | Expected future execution stage |
|---------|---------|-----|---------------|---------------------|----------------------------------|
| **FC-01** | createRun refused (missing/wrong pin / tenancy) | **RUNNABLE_NOW** | **YES** | Host already validates pin/MVP allowlist; align ambient tenancy for positive control | **T-F4** |
| **FC-02** | Stage failure / retry exhaustion → no Knowledge | **DESIGN_ONLY** | **NO** | Controlled stage-failure injection without Host rewrite | Later Host-fixture or Harness test env |
| **FC-03** | Validation / Review package fail | **DESIGN_ONLY** | **NO** | Same — stage fail injection | Later fixture env |
| **FC-04** | Human `rejected` → no token / no SoR | **RUNNABLE_NOW** | **YES** | Reach `waiting_human` (stub or short path) **or** Host allows resume only when waiting; if Gate unreachable without agents → degrade to DESIGN_ONLY at T-F4 skip note | **T-F4** if Gate reachable; else follow-up |
| **FC-05** | Human `request_changes` → re-approval required | **RUNNABLE_NOW** | **YES** | Same Gate reachability as FC-04 | **T-F4** / follow-up |
| **FC-06** | Missing human approval → Stage 5 / apply refused | **RUNNABLE_NOW** | **YES** | Host `applyKnowledgeAuthorized` / token precondition (D2) callable without forged approval | **T-F4** |
| **FC-07** | Invalid or reused apply_token | **RUNNABLE_NOW** | **YES** | Host token consume APIs (D2 cite); may need one successful mint path | **T-F4** / follow-up |
| **FC-08** | Wrong Proposal version / superseded token | **DESIGN_ONLY** | **NO** | Controlled Proposal supersession + remint cycle | Follow-up after HP-01-FULL fixtures |
| **FC-09** | Agent-as-approver / `actor_kind=agent` refused | **RUNNABLE_NOW** | **YES** | Host `resumeHuman` + `assertHumanActor` (D3); needs Gate wait state or Host refuse-on-actor regardless | **T-F4** |
| **FC-10** | Artifact lineage mismatch fail | **DESIGN_ONLY** | **NO** | Sealed multi-artifact chain + LA-* oracle (EV-ART-*); GAP-BR-017/018 | Band F follow-up / T-G2 design pack for exit |
| **FC-11** | Tenant / workspace mismatch | **RUNNABLE_NOW** | **YES** | createRun/Gate tenancy checks; Host may not assert ambient ≡ request (**GAP-BR-012**) — product-align workaround still testable as refuse or misconfig | **T-F4** (partial); full Host assert = Host hardening later |
| **FC-12** | Graph skip without recorded reason | **DESIGN_ONLY** | **NO** | Full path past Knowledge + Graph AC oracle | Follow-up |
| **FC-13** | Product must not call agents / Runtime admit as orchestrator | **RUNNABLE_NOW** | **YES** | Static/contract review of PB Bridge surface (imports / wiring) — no Host run required | **T-F4** (lint/static assert) or doc AC in T-G* |

---

## C. Lineage / exit evidence (E3)

### C.1 Design-pack (mandatory for sprint exit — not live Host)

| Test ID | Purpose | Tag | Runnable now? | Blocking dependency | Expected future execution stage |
|---------|---------|-----|---------------|---------------------|----------------------------------|
| **EV-LIN-01** | E1 LA-* checklist filed | **DESIGN_ONLY** | **NO*** | None — evidence already produced | Sprint exit **T-G2** (verify present) |
| **EV-LIN-02** | E2 envelope fit table | **DESIGN_ONLY** | **NO*** | None — filed | **T-G2** |
| **EV-LIN-03** | E3 evidence definition | **DESIGN_ONLY** | **NO*** | None — filed | **T-G2** |
| **EV-LIN-04** | C3 emit map | **DESIGN_ONLY** | **NO*** | None — filed | **T-G2** |
| **EV-LIN-05** | D1–D3 HA linkage docs | **DESIGN_ONLY** | **NO*** | None — filed | **T-G2** |
| **EV-LIN-06** | GAP-BR-001/005/017/018 cited open | **DESIGN_ONLY** | **NO*** | None — registry | **T-G2** |

\*Runnable now? **NO** for *automated Host E2E*. Design-pack items are **already satisfied as documents**; verification is checklist review at **T-G2**, not T-F4 Host smoke.

### C.2 Run/audit evidence (live Host — Band F)

| Test ID | Purpose | Tag | Runnable now? | Blocking dependency | Expected future execution stage |
|---------|---------|-----|---------------|---------------------|----------------------------------|
| **EV-RUN-01** | HostRun.run_id + pin | **RUNNABLE_NOW** | **YES** | Same as HP-01-ENTRY | **T-F4** |
| **EV-RUN-02** | correlation_id / Host lineage join | **RUNNABLE_NOW** | **YES** | Host lineage snapshot; envelope field join = **GAP-BR-017** (Host join OK) | **T-F4** (Host-side); full envelope join later |
| **EV-RUN-03** | Tenancy on CreateRun/lineage | **RUNNABLE_NOW** | **YES** | GAP-BR-012 workaround | **T-F4** |
| **EV-ART-01…05** | Sealed Report→…→GraphUpdate chain | **DESIGN_ONLY** | **NO** | Full sealed artifact production | Post–fixture / HP-01-FULL |
| **EV-AUD-01** | Trust sink decision + stage events | **DESIGN_ONLY** | **NO** | Shared AuditSink + multi-stage events | T-F4 partial if sink wired; full = follow-up |

### C.3 Verification points (E3 V1–V7)

| Test ID | Purpose | Tag | Runnable now? | Blocking dependency | Expected future execution stage |
|---------|---------|-----|---------------|---------------------|----------------------------------|
| **V1** | Product → Host createRun only | **RUNNABLE_NOW** | **YES** | Contract/static (+ HP-01-ENTRY) | **T-F4** / T-G* |
| **V2** | Trusted path order | **DESIGN_ONLY** | **NO** | Multi-stage run | Follow-up |
| **V3** | Envelope fields / Host join | **DESIGN_ONLY** | **NO** | GAP-BR-017 | Follow-up / T-G2 design |
| **V4** | parents[] policy | **DESIGN_ONLY** | **NO** | GAP-BR-018 | Follow-up |
| **V5** | Human linkage to Knowledge | **DESIGN_ONLY** | **NO** | Approved path + Knowledge | Follow-up |
| **V6** | Token consume evidenced | **RUNNABLE_NOW** | **YES** | Overlaps FC-06/07 when Gate/token reachable | **T-F4** / follow-up |
| **V7** | No agent approval | **RUNNABLE_NOW** | **YES** | Overlaps FC-09 | **T-F4** |

---

## D. BLOCKED_ON_HOST_CREATERUN

| Test ID | Status |
|---------|--------|
| *(none)* | **B5 = AVAILABLE** — createRun path is not the blocker. |

If B5 had been **BLOCKED**, HP-01-ENTRY, FC-01, EV-RUN-*, and Gate/token cases would move here. They do **not**.

---

## E. T-F4 guidance (non-implementation)

**In scope for minimal PB harness (Host APIs only):**

- HP-01-ENTRY, FC-01, FC-06, FC-09, FC-11 (partial), FC-13, EV-RUN-01…03, V1, V7  
- FC-04 / FC-05 / FC-07 / V6 **if** Gate/`waiting_human` reachable without Host rewrite  

**Out of scope for T-F4 (remain DESIGN_ONLY):**

- HP-01-FULL, FC-02/03/08/10/12, EV-ART-01…05, V2–V5 (full), full EV-AUD-01  

**If Gate unreachable without Host edits:** T-F4 implements entry + refuse + static FC-13; records skip for Gate-dependent cases (do **not** rewrite Host).

---

## GAPs

**No new GAP.** Classification reuses:

| GAP | Effect on runnable |
|-----|-------------------|
| GAP-BR-012 | FC-11 / EV-RUN-03 partial without Host assert |
| GAP-BR-014 | HP-01-FULL / stage path fixtures |
| GAP-BR-017 / 018 | EV-ART / FC-10 / V3–V4 |
| GAP-BR-009 | FC-09 proves Host actor_kind rule only; not IdP |

---

## Verification

| AC | Met? |
|----|------|
| Each case tagged RUNNABLE_NOW \| BLOCKED_ON_HOST_CREATERUN \| DESIGN_ONLY | **Yes** |
| F1 + F2 + E3 items covered | **Yes** |
| B5 AVAILABLE reflected (0 Host-createRun blocks) | **Yes** |
| No tests/code/platform changes | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-F3-T1 | HP-01 + FC-01…13 classified | **PASS** |
| T-F3-T2 | E3 EV-* / V* classified | **PASS** |
| T-F3-T3 | BLOCKED_ON_HOST_CREATERUN = 0 under B5 AVAILABLE | **PASS** |
| T-F3-T4 | T-F4 in/out guidance present | **PASS** |

---

## Evidence

`personal-brain/stage/bridge/F3-test-runnable-vs-blocked.md` (this file)

---

## Next

**T-F4** — Minimal Personal Brain Host test harness (**or** skip record if blocked — N/A given B5 AVAILABLE).

---

**End of F3-test-runnable-vs-blocked**
