# E3 — Lineage PASS Evidence (Sprint Exit)

**Task:** T-E3  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Depends on:** T-E1, T-E2  
**Ties to:** Sprint **S-AC5**; usable by **T-G2** exit  
**Mode:** Implementation Mode (exit verification evidence definition only — **no** lineage engine / Runtime / SDK / Host / DB / schema)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Define what evidence proves **lineage integrity** for Bridge sprint exit — especially **S-AC5** (checklist covers Brief → Report → Proposal → Approval → Knowledge → GraphUpdate).

This sprint is primarily **design/verify**. Lineage PASS for exit = **documented assertions + envelope fit + listed required run/audit artifacts**. Live Host smoke may strengthen PASS later (Band F) but is not required to *define* exit evidence here.

---

## S-AC5 mapping

| S-AC5 node | E1 assertion(s) | Design evidence already filed |
|------------|-----------------|-------------------------------|
| Brief | LA-BRF-01/02 | E1; A2; GAP-BR-001/005 |
| Report | LA-RR-01 | E1; C3; E2 PASS + brief_ref |
| Proposal | LA-PR-01 | E1; C3; E2 |
| Approval | LA-HRD-01/02 | E1; D1–D4; E2 HRD payload PASS |
| Knowledge | LA-KN-01 | E1; D2; C4 |
| GraphUpdate | LA-GU-01 | E1; C3; C4 |

*(ValidationReport LA-VR-01 is Host trusted-path complete; include in full PASS when evaluating live runs.)*

---

## Required evidence items (for T-G2 / lineage PASS)

### A. Design-pack evidence (mandatory for this sprint exit)

| ID | Evidence item | Path / form | Required |
|----|---------------|-------------|----------|
| **EV-LIN-01** | Lineage assertion checklist with LA-* ids | `E1-lineage-assertion-checklist.md` | **Yes** |
| **EV-LIN-02** | Envelope provenance fit PASS/GAP table | `E2-envelope-provenance-fit.md` | **Yes** |
| **EV-LIN-03** | This exit evidence definition | `E3-lineage-pass-evidence.md` | **Yes** |
| **EV-LIN-04** | Trusted-path emit map | `C3-stage-artifact-emit-map.md` | **Yes** |
| **EV-LIN-05** | HA linkage (decision → Knowledge) | `D1` + `D2` + `D3` | **Yes** |
| **EV-LIN-06** | GAP register cites envelope/Brief gaps | GAP-BR-001, 005, 017, 018 OPEN (not silently closed) | **Yes** |

### B. Run/audit evidence (when Host createRun / fixture exercised — Band F / coding follow-up)

| ID | Evidence item | Verification point |
|----|---------------|--------------------|
| **EV-RUN-01** | `HostRun.run_id` + pin `knowledge-ingestion@version` | LA-RUN-01, LA-PIPE-01 |
| **EV-RUN-02** | CreateRun `correlation_id` + Host lineage correlation | LA-CORR-01 (via Host — GAP-BR-017) |
| **EV-RUN-03** | Tenancy: tenant_id (+ workspace) on Brief/CreateRun/lineage | LA-TEN-01 |
| **EV-ART-01** | Sealed ResearchReport envelope (`run_id`, `produced_by`, `digest`, `parents` or brief_ref) | LA-RR-01 |
| **EV-ART-02** | Sealed Proposal with parents → ValidationReport/Report chain | LA-PR-01 |
| **EV-ART-03** | HumanReviewDecision `approved` + human `approver` + apply_token | LA-HRD-01/02; D3 |
| **EV-ART-04** | Sealed Knowledge with parents → HRD/Proposal; SoR apply audit | LA-KN-01; D2 |
| **EV-ART-05** | Sealed GraphUpdate with parents → Knowledge | LA-GU-01 |
| **EV-AUD-01** | Trust sink: Host decision + admit/stage events for same `run_id` | LA-AUD-* |

---

## Lineage verification points

| Point | What to verify |
|-------|----------------|
| **V1 Entry** | Product → Host createRun only (not Runtime orchestrator); pin frozen |
| **V2 Chain order** | Trusted path order respected (Host `TRUSTED_PATH_ORDER`) |
| **V3 Envelope fields** | Where E2 = PASS, fields present; where GAP, join via Host lineage |
| **V4 Parents policy** | Non-empty `parents[]` preferred; empty → fail Bridge PASS (GAP-BR-018 policy) |
| **V5 Human linkage** | Knowledge only if EV-ART-03 approved path |
| **V6 Knowledge eligibility** | Token consume / Host authorize apply evidenced (D2) |
| **V7 No agent approval** | Decision actor human (D3) |

---

## Artifact chain verification (minimum walk)

```text
Brief (bootstrap / Host lineage)
  → ResearchReport
  → ValidationReport   (full Host path)
  → Proposal
  → HumanReviewDecision (approved, human actor, token)
  → Knowledge
  → GraphUpdate
```

Each hop: same `run_id` + `tenant_id`; parent or subject_ref / brief_ref resolvable.

---

## Human approval linkage proof

| Proof | Required |
|-------|----------|
| Decision outcome = `approved` for SoR path | Yes |
| `approver.actor_id` / Host actor human | Yes |
| apply_token minted and bound to Proposal@version | Yes |
| Knowledge after token path | Yes |
| Agent-as-actor absent | Yes |

---

## Knowledge eligibility proof

Knowledge may be treated as Verified Personal Knowledge for Bridge only if:

1. EV-ART-03 + EV-ART-04 present (or design-equivalent documented for this sprint phase), **and**  
2. LA-HRD-02 / D2 preconditions satisfied, **and**  
3. No product→Runtime / agent-approval bypass.

---

## PASS / FAIL criteria (for T-G2 lineage section)

### Lineage **PASS** (design sprint)

All of:

- EV-LIN-01…06 present and cite S-AC5 chain  
- E1 covers Brief → Report → Proposal → Approval → Knowledge → GraphUpdate  
- E2 completed with PASS/GAP (no silent schema invent)  
- Open envelope/Brief GAPs remain **OPEN** in GAP registry  

### Lineage **FAIL**

Any of:

- Missing E1/E2/E3 or S-AC5 chain incomplete in checklist  
- Schema/envelope invented in-sprint to “fix” gaps  
- Claim of live SoR Knowledge without HA linkage definition  

### Lineage **BLOCKED** (optional label)

Host createRun path BLOCKED (contradicts B5 AVAILABLE) or mandatory live EV-RUN-* required by Founder but unavailable — **not** the default for this design exit given B5 **AVAILABLE** and design-pack sufficiency for S-AC5.

---

## T-G2 usage snippet

```text
S-AC5 lineage: PASS | FAIL | BLOCKED
Evidence: E1, E2, E3 (+ C3, D1–D3)
Open GAPs affecting lineage: GAP-BR-001, 005, 017, 018 (non-blocking for design exit)
Live run evidence: YES (paths…) | DEFERRED to coding/F-band
```

---

## GAPs

No new GAP. Existing lineage-related OPEN gaps remain: **GAP-BR-001, 005, 017, 018**.

---

## Verification

| AC | Met? |
|----|------|
| Exit evidence list usable by T-G2 | **Yes** |
| Ties to S-AC5 | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-E3-T1 | EV-LIN + EV-RUN/ART/AUD lists defined | **PASS** |
| T-E3-T2 | S-AC5 nodes mapped to E1/E2 | **PASS** |
| T-E3-T3 | PASS/FAIL criteria for T-G2 | **PASS** |
| T-E3-T4 | No lineage engine / platform / schema implementation | **PASS** |

---

## Evidence

`personal-brain/stage/bridge/E3-lineage-pass-evidence.md` (this file)

---

## Band E complete

T-E1…T-E3 **DONE**. Next: **T-F1** (E2E happy-path test design).

---

**End of E3-lineage-pass-evidence**
