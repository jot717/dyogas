# F1 — E2E Happy-Path Test Design

**Task:** T-F1  
**Sprint:** SPRINT-PB-HARNESS-BRIDGE-001  
**Trace:** TRACE-PB-BRIDGE-001  
**Depends on:** T-B4, T-C1, T-D1, T-E1 · cites E3, D2, D4, C2, C3  
**Mode:** Implementation Mode (**test design only** — **no** test implementation; **no** Runtime/SDK/Host/UI/production APIs)  
**Date:** 2026-07-24  
**Status:** DONE  

---

## Purpose

Design the **end-to-end successful** Bridge path test: fixture Research Request/Brief → **`ExecutionHost.createRun()`** → stages → Human **Accept** → apply_token → Knowledge → GraphUpdate, with lineage checks.

**Entry:** Host only (ADR-0010). **No** product→Runtime orchestrator. **No** UI.

---

## Test case: HP-01 — Research → Verified Knowledge → Graph

| Field | Content |
|-------|---------|
| **Case ID** | **HP-01** |
| **Title** | Happy path: Personal Brain Bridge via Host createRun |
| **Goal** | Prove documented path yields Knowledge + GraphUpdate under HA + lineage |
| **Pipeline** | `knowledge-ingestion` @ `2.0.0` (B2 pin) |
| **Host path** | B5 **AVAILABLE** |

### Scenario narrative

Owner in personal workspace requests research (e.g. “Research AI Agent market”). Product maps to Brief, calls Host `createRun`, Host drives stages; owner Accepts Proposal; Knowledge applied with token; GraphUpdate sealed; product may index outcomes (not SoR invent).

---

## Initial input (fixture)

| Field | Fixture value (illustrative) |
|-------|------------------------------|
| `intent` / Brief `question` | Non-empty research question |
| `workspace_id` / `owner_id` | Test workspace + human owner |
| `tenant_id` | Kernel test tenant (aligned ambient Kernel/Trust — GAP-BR-012) |
| `caller_id` | = owner_id |
| `correlation_id` | Stable UUID for join |
| `scope` / `allowed_source_classes` / `budget` | Valid Research Agent input shape (A2); defaults per policy or explicit fixture (GAP-BR-002…004) |
| `bootstrap` | ResearchBrief-shaped Record |
| Pin | `selectApprovedPipelineForCreateRun()` → knowledge-ingestion@2.0.0 |

Preconditions: ambient Kernel tenancy + Trust identity set; no production SoR pollution (test tenant).

---

## Host createRun entry

| Step | Action | Expected |
|------|--------|----------|
| 1 | `createExecutionHost({ auditSink })` | Host facade |
| 2 | `host.createRun({ …pin, bootstrap, tenant_id, caller_id, correlation_id, audit_sink? })` | `HostRun` with `run_id`, pin, status, lineage |
| 3 | Assert **no** direct `@dyogas/runtime` admit from product | Contract |

---

## Agent execution sequence (expected)

| Order | Stage | Contract | Primary output |
|-------|-------|----------|----------------|
| 1 | Research | SPEC-AGT-001 | `ResearchReport` |
| 2 | Validation | SPEC-AGT-002 | `ValidationReport` |
| 3 | Proposal | SPEC-AGT-003 | `Proposal` |
| 4 | Human Review | SPEC-AGT-004 package + **Human** | `waiting_human` → decision |
| 5 | Markdown | SPEC-AGT-005 (+ Knowledge Engine apply) | `Knowledge` |
| 6 | Graph | SPEC-AGT-006 | `GraphUpdate` |
| 7 | Embedding | SPEC-AGT-007 | `EmbeddingJob` (supporting) |
| 8 | Memory | SPEC-AGT-008 | `MemoryUpdate` (supporting) |

Host binds agents via SDK internally — product does not bind.

---

## Artifact transitions

```text
Brief (bootstrap)
  → ResearchReport → ValidationReport → Proposal
  → HumanReviewDecision (approved)
  → Knowledge → GraphUpdate
  → EmbeddingJob → MemoryUpdate
```

---

## Human approval step

| Step | Action | Expected |
|------|--------|----------|
| H1 | Observe `HostRun.status === waiting_human` | D4 surface contract |
| H2 | Present Proposal package to owner (no UI invent — test harness / fixture actor) | D4 |
| H3 | `host.resumeHuman(runId, { outcome: "approved", actor_id: owner }, "human")` | D1 Accept |
| H4 | Reject if `actor_kind=agent` | Out of HP-01 (see F2) |

---

## Apply-token step

| Step | Expected |
|------|----------|
| T1 | On `approved`, Host mints token bound to Proposal@version (D2) |
| T2 | Stage 5 / `applyKnowledgeAuthorized` consumes token once |
| T3 | Knowledge SoR apply via existing Knowledge Engine path only |

---

## Knowledge / Graph output

| Output | Assert |
|--------|--------|
| `Knowledge` sealed | Schema + parents/lineage; SoR apply audited |
| `GraphUpdate` sealed | parents → Knowledge |
| Product index | Optional; must not invent parallel SoR (C4 / GAP-BR-015) |

---

## Lineage verification points (E1/E3)

| Check | Assert |
|-------|--------|
| LA-RUN-01 | Same `run_id` across HostRun + envelopes |
| LA-PIPE-01 | Pin knowledge-ingestion@2.0.0 (Host pin; GAP-BR-017 join) |
| LA-CORR-01 | correlation_id on CreateRun / Host lineage |
| LA-TEN-01 | tenant (+ workspace) consistent |
| LA-HRD-02 | Knowledge only after approved + token |
| LA-KN-01 / LA-GU-01 | Chain walkable; parents preferred (GAP-BR-018 policy) |
| EV-AUD-* | Trust sink has decision + stage events |

---

## Expected PASS conditions (HP-01)

All must hold:

1. createRun succeeds with approved pin + tenancy  
2. Stages advance to Human Gate without product Runtime orchestration  
3. Owner `approved` with human actor → token minted  
4. Knowledge sealed/applied; GraphUpdate sealed  
5. Lineage assertions for S-AC5 chain PASS (or N/A with documented Host join for GAP-BR-017)  
6. No UI; no agent approval; no new schemas/APIs  
7. Audit sink shows Gate decision + apply path  

**FAIL** if any of: Runtime admit from product; agent-as-approver; Knowledge without token; wrong pipeline pin; cross-tenant.

---

## Design notes / non-implementation

| Item | Note |
|------|------|
| Full agent LLM execution | May be stubbed/hooked in Host executor for smoke (T-F4) — design allows fixture hooks; must not change Host source in F1 |
| PainStatement | GAP-BR-014 — fixture must supply pipeline-required input without inventing schema file |
| Brief envelope | GAP-BR-001 — bootstrap + Host lineage sufficient for design |

---

## GAPs

No new GAP. Open items affecting executable tests remain: GAP-BR-002…005, 012, 014, 017, 018 (non-blocking for **design**).

---

## Verification

| AC | Met? |
|----|------|
| ≥1 full happy-path case with steps + expected artifacts | **Yes** — HP-01 |
| Host entry | **Yes** |
| No UI | **Yes** |
| No product→Runtime orchestrator | **Yes** |

| Test ID | Check | Result |
|---------|-------|--------|
| T-F1-T1 | HP-01 covers createRun → … → GraphUpdate | **PASS** |
| T-F1-T2 | HA + apply_token + lineage checks present | **PASS** |
| T-F1-T3 | Forbidden scopes restated | **PASS** |
| T-F1-T4 | No tests/code/platform implemented | **PASS** |

---

## Evidence

`personal-brain/stage/bridge/F1-e2e-happy-path-test-design.md` (this file)

(Registry historical name `F1-e2e-happy-path-cases.md` superseded by this filename per execution request.)

---

## Next

**T-F2** — E2E failure cases design.

---

**End of F1-e2e-happy-path-test-design**
