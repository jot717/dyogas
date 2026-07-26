# DYOGAS MVP Product Validation Report

**Document ID:** VAL-MVP-001  
**Type:** Product validation (documentation only)  
**Date:** 2026-07-23  
**Harness role:** Product Validation Harness  
**Baseline:** MVP-PIPELINE COMPLETE (Build Order B0–B16)  
**Authority:** Evaluates product readiness against Vision / Principles / completed modules. Does **not** amend Constitution, Harness, MASTER architecture, or completed module code.

**Evidence sources:** `docs/BUILD_ORCHESTRATOR_STATE.md`, per-module `MODULE_STATUS.md`, `docs/PRODUCT_VISION.md`, `docs/OUT_OF_SCOPE_REGISTRY.md`, `ingestion-e2e/`, `web-ui/`, engine packages under `research/`, `knowledge/`, `markdown/`, `graph/`, `human-gate/`

---

## Executive summary

| Dimension | Verdict |
|-----------|---------|
| **MVP Status** | **PIPELINE COMPLETE** — platform spine + ingestion path + minimal approval UI exist and test green |
| **Product Readiness** | **PARTIAL** — one valuable *technical* journey works; end-user product journey is operator-assisted |
| **Technical Readiness** | **LAB / NON-PROD READY** — contracts + unit/integration tests green; persistence, live sources, and production hosting deferred |
| **Commercial Readiness** | **NOT READY TO CHARGE** — no durable product surface, no live evidence, no packaging/auth |
| **Recommended Next Phase** | **C — Real data/source integrations** |

---

## 1. End-to-end user journey

### 1.1 Intended journey

```text
User Question
  → Research (evidence collect)
  → Validation (credibility gate)
  → Proposal (decision-ready options)
  → Human Approval
  → Knowledge Storage (SoR apply)
  → Retrieval (markdown / graph / embedding contracts)
```

### 1.2 What is proven today

| Stage | Status | How proven | Quality of experience |
|-------|--------|------------|------------------------|
| User Question | **Yes (API)** | `ResearchBrief.question` in `@dyogas/research-engine` | No consumer “ask” UX; brief is code/API |
| Research | **Yes (mock)** | `runResearchMvp` / B10 path; mock collectors | Evidence is synthetic (`mock://…`); live web/GitHub/etc. = OOS-RE-001 |
| Validation | **Yes** | `validateEvidence` + validation-report candidate | Rubric MVP (`default-v1` / `strict-v1`); not domain-tuned |
| Proposal | **Yes** | `buildProposal` / `runValidationProposalPath` | Art. XII pain gate enforced; always `requires_human_approval: true` |
| Human Approval | **Yes (thin)** | `@dyogas/human-gate` + `@dyogas/web-ui` console | Attributable decide; UI lists gates — not a full review workspace |
| Knowledge Storage | **Yes (memory)** | `@dyogas/knowledge-engine` approval-gated SoR | In-memory SoR; survives process only |
| Retrieval | **Partial** | Markdown render + GraphUpdate + local-hash EmbeddingJob candidates; B15 e2e stitches path | No user-facing search/Q&A over SoR; graph not durable DB |

**B15 attestation:** `ingestion-e2e` proves non-prod green: Research→Validation→Proposal→Approve→Markdown→Graph/Embedding in one automated path.

### 1.3 Journey gaps (product, not architecture)

1. **No single product entrypoint** that a non-engineer can run for “ask → approve → browse.”  
2. **Evidence is not real-world** until live collectors + Trust allow-egress (OOS-RE-001 / OOS-T-002).  
3. **Retrieval is contract/candidate oriented**, not “find my knowledge” UX.  
4. **Web UI does not drive the full pipeline** — approvals only; research/proposal still API/script.  
5. **No durable store** — restart loses Knowledge SoR / audit memory sinks.

**Journey verdict:** *Technically closed in lab.* *Product-closed for a real user: No.*

---

## 2. Product completeness

### 2.1 Can a new user understand value?

| Criterion | Assessment |
|-----------|------------|
| Vision clarity (docs) | **Strong** — local-first knowledge, Harness gates, Trust-visible (`PRODUCT_VISION.md`) |
| In-product value signal | **Weak** — brand hero on approval console only; no guided first-run explaining the ingestion promise |
| Differentiator visible in UI | **Weak** — user sees “pending/approved,” not provenance, denial of silent SoR write, or evidence trail |

**Verdict:** A technical reader of Vision + Specs understands value. A new end user opening Web UI alone **does not** yet understand DYOGAS.

### 2.2 Can a user complete one valuable task?

**Valuable task (Vision-aligned):** *“Turn a research question into approved, attributable local knowledge without silent SoR write.”*

| Mode | Completable? |
|------|----------------|
| Engineer / Founder via packages + tests | **Yes** — B15 + human-gate + knowledge apply |
| Operator via Web UI alone | **No** — UI does not start research or show knowledge browse |
| External end customer | **No** — no install/onboarding product, no persistence, no live sources |

**One valuable task exists for builders.** It does **not** yet exist as a self-serve product task.

### 2.3 Where manual operation is still required

| Manual step | Why |
|-------------|-----|
| Provide tenancy / trust identity in process | Kernel/Trust primitives; no product login |
| Invoke Research / B10 APIs or tests | No “New research” UI |
| Supply title/body content at approval apply | Gate flow can apply content; not auto-derived from proposal markdown in UI |
| Decide approve/reject | Intentional (Constitution / Harness) — **must remain human** |
| Start Web UI server + call APIs | Minimal console; not packaged app |
| Re-seed data after restart | Memory SoR / memory audit |
| Wire live sources + egress policy | Deferred OOS |
| Interpret graph/embedding candidates | No browse/search UI |

---

## 3. Technical readiness

### 3.1 Module contracts

| Area | Readiness |
|------|-----------|
| Agent contracts + schemas (CPAS) | Binding docs present; engines emit **unsealed candidates** (ADR-0003/0004) |
| Inter-engine handoffs | Research→Knowledge, Markdown handoff, Graph retrieval contracts exist |
| Human Approval | Data path + gate package; SoR refuses non-approved (ADR-0006) |
| Full Harness state machine / all pipeline topologies | Incomplete (OOS-R-001/002) — Runtime MVP host only |
| Production pipeline hosting | Deferred (OOS-R-003) |

### 3.2 Test coverage (attested at MVP-PIPELINE)

| Package / path | Tests (last orchestrator snapshot) |
|----------------|-------------------------------------|
| research-engine (incl. B10) | 9/9 |
| human-gate | 3/3 |
| markdown-engine | 7/7 |
| graph-engine | 9/9 |
| web-ui | 1/1 |
| ingestion-e2e | 1/1 |
| Earlier spine (kernel→knowledge) | Module Complete + CI jobs |

**Coverage character:** Strong **unit / boundary / happy-path integration**. Thin **UI**, **chaos**, **multi-tenant concurrency**, **durability**, and **live-network** coverage (by design / OOS).

### 3.3 Failure points (highest risk)

1. **Process restart** — in-memory SoR and audit sinks lose state.  
2. **Deny-by-default egress** — correct for Trust; blocks real research until allow policy ADR.  
3. **Mock evidence quality** — validation/proposal can “succeed” on non-real sources → false confidence.  
4. **UI ↔ pipeline disconnect** — approval without upstream run context → operator error.  
5. **Incomplete Runtime Harness gates** — product claims must not overstate production orchestration.  
6. **No durable authN/Z product** — tenancy is primitive, not customer IAM (OOS-T-004).

### 3.4 Missing integrations

| Integration | Status |
|-------------|--------|
| Live YouTube / GitHub / Reddit / Web collectors | Missing (OOS-RE-001) |
| Cloud AI compute allow + client | Missing (OOS-T-001–003) |
| Durable audit backend | Missing (OOS-T-005) |
| Durable Knowledge / Graph store | Missing (memory / no graph DB) |
| Production embedding models | Missing (local-hash only; OOS-KN-003) |
| Full Experience Plane (browse, run status, notifications channels) | Approval console only |
| Hosted Engineering Agents (B17) | Optional / not required for MVP |

**Technical verdict:** Ready for **continued Founder/lab development and demos to technical stakeholders**. Not ready for **production multi-user deployment**.

---

## 4. Commercial MVP readiness

### 4.1 First target user

**Primary:** Solo founder / technical knowledge worker who already distrusts “upload everything to the vendor” AI tools and will tolerate API/operator UX.  

**Secondary (soon):** Small team lead needing **attributable approval** before knowledge becomes shared truth.

*Not yet:* Non-technical SMB buyer expecting polished SaaS onboarding.

### 4.2 First use case

**“Approve-gated local knowledge capture from a research question”**  
Ask → (eventually real) sources → validate → propose → human approve → local SoR item with provenance.

Today this use case is **demoable with mocks**; commercially credible only after **real sources + persistence**.

### 4.3 First paid feature (candidate)

**Paid wedge (recommended once C lands):**  
**Local Knowledge SoR + Human Approval audit trail** (sovereign store + “nothing writes without you”) — optionally bundled with **live research collectors** as the acquisition hook.

*Do not sell first:* Hosted Engineering Agents (B17) — internal leverage, not end-customer pain.  
*Do not sell first:* Graph DB / embeddings alone — supporting infrastructure, not the pain.

### 4.4 Missing product requirements (commercial blockers)

| Requirement | Why blocking |
|-------------|--------------|
| Durable local (or customer-controlled) persistence | Restart = data loss |
| Real source integrations + consent/egress UX | Mock demos don’t convert |
| First-run onboarding that explains Trust posture | Value not understood |
| Knowledge browse / retrieval UX | Task incomplete after approve |
| Account / tenancy productization | Can’t bill or isolate customers |
| Packaging (install, update, support boundary) | No SKU |
| Pricing / ToS / data-processing story | Commercial process absent |
| Notification channels beyond in-app mock | Operators miss gates |

**Commercial verdict:** **Pre-revenue technical MVP.** Do not position as sellable product until persistence + real sources + clearer operator UX exist.

---

## 5. Next Phase recommendation

### Options evaluated

| Option | Fit now | Rationale |
|--------|---------|-----------|
| **A. B17 Hosted Agent Platform** | Low | Improves *how DYOGAS is built*, not *what users buy*; Process Mode already sufficient for engineering gates |
| **B. Product UI development** | Medium–High | Needed for commercial path, but UI over mocks risks “empty product” demos |
| **C. Real data/source integrations** | **Highest** | Unlocks honest value proof for Vision; unblocks validation/proposal credibility; prerequisite to meaningful UI content |
| **D. Other** | — | e.g. durability-only sprint — valuable but secondary to proving real evidence path |

### Decision: **C — Real data/source integrations**

**Why C first**

1. Product Vision requires knowledge from the world without surrendering SoR — mocks cannot validate the thesis.  
2. Validation + Proposal quality is gated on real evidence (OOS-RE-001).  
3. Trust allow-egress (OOS-T-002) is a **Founder/ADR** business decision — Product Validation flags it as the critical unlock, not an architecture rewrite.  
4. UI (B) should **immediately follow** C in a short tandem: “live collect → approve → browse,” not a redesign of planes.

**Suggested sequence (informative, not a MASTER amendment)**

1. Founder ADR / Spec for **allow-list egress** + first live collector(s) under MOD-RESEARCH enrichment.  
2. Durable SoR/audit spike (Knowledge/Trust enrichment Specs — reopen via Spec, do not silent-edit).  
3. Experience Plane enrichment: start run + browse approved knowledge (MOD-WEB-UI Spec).  
4. Revisit B17 only if engineering throughput becomes the bottleneck.

---

## 6. Scorecard (normative output)

| Field | Value |
|-------|--------|
| **MVP Status** | **COMPLETE (PIPELINE)** — B0–B16 delivered; lab E2E green; B17 deferred optional |
| **Product Readiness** | **PARTIAL** — builder-completable valuable task; not self-serve end-user product |
| **Technical Readiness** | **NON-PROD / LAB** — contracts + tests solid; durability, live I/O, full Harness, IAM missing |
| **Commercial Readiness** | **NOT READY** — no SKU, persistence, or real-source wedge yet |
| **Recommended Next Phase** | **C. Real data/source integrations** |

---

## 7. Explicit non-actions of this report

- Does **not** create modules  
- Does **not** modify completed modules  
- Does **not** change MASTER dependencies, layers, or Constitution/Harness law  
- Does **not** claim production or paid readiness  

---

## 8. Sign-off

| Role | Statement |
|------|-----------|
| Product Validation Harness | Validation complete against MVP-PIPELINE baseline; recommend Phase **C** before commercial claims |
| Founder | Business decision required for allow-egress / live collectors before Phase C Implementation |

---

**End of VAL-MVP-001**
