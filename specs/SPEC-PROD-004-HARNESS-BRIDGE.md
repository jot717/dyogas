# SPEC-PROD-004 — Harness Bridge

**Spec ID:** SPEC-PROD-004-HARNESS-BRIDGE  
**Title:** Personal Brain ↔ Execution Harness Bridge  
**Module:** MOD-PERSONAL-BRAIN  
**Status:** `draft` — revised after Architecture Review REQUEST CHANGES (awaiting re-review)  
**Parent SSOT:** [`SPEC-PRODUCT-MASTER.md`](./SPEC-PRODUCT-MASTER.md)  
**Trace ID:** TRACE-PB-BRIDGE-001  
**Related:** Constitution Art. III, XIII · `/harness/HARNESS_SPECIFICATION.md` · `/pipelines/knowledge-ingestion.md` · ADR-0009 · Runtime (SPEC-RT-002) · Agent SDK (SPEC-RT-003)  
**Non-modification:** This SPEC does **not** authorize changes to Runtime, SDK, or Harness **implementation**. It defines the **product contract** Personal Brain must honor when requesting governed agent work.  
**Duplicate check:** Does **not** invent a second orchestrator or parallel ingestion pipeline. Consumes existing Execution Harness path `knowledge-ingestion` and existing contracts/artifacts.

---

## Development Trace

**Trace ID:** `TRACE-PB-BRIDGE-001`

### Approval Chain

```text
Specification
        ↓
Architecture Review
        ↓
Founder Approval (business)
```

(Engineering Agent chain per `/engineering`: Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer → Founder business.)

### Lifecycle

| State | Meaning |
|-------|---------|
| **Draft** | Spec authored / revised (current) |
| **Review** | Engineering Agent + Architecture Review in progress |
| **Approved** | Spec `accepted`; Founder business APPROVE recorded |
| **Implemented** | Bridge behavior delivered per this contract (future sprint) |
| **Verified** | Acceptance Criteria AC-1..AC-8 evidenced |

---

## Pain Statement

| Field | Content |
|-------|---------|
| **Who** | Personal Brain owners (and platform operators) who need professional or thematic research turned into **trusted personal knowledge** |
| **How it hurts** | Multi-agent research cannot be claimed as Constitution-compliant: no Harness-admitted run, weak audit lineage, risk of product-local agent orchestration |
| **Frequency** | Every professional exploration request (e.g. “Research AI Agent market”) |
| **Current workaround** | (a) Manual research outside DYOGAS, or (b) product-local capture/AI assist without Execution Harness admission |
| **Why workaround fails** | Manual work loses platform provenance/gates; product-local orchestration is a **shadow Harness** (Art. XIII) and cannot issue proper apply-token / Human Approval Gate semantics for SoR |

---

## 1. Purpose

Personal Brain needs a **Harness Bridge** so that multi-agent research and knowledge promotion follow DYOGAS **Execution Harness** law instead of ad-hoc product orchestration.

The Bridge is the product-facing contract that:

1. Turns a personal research intent into a **Research Brief** suitable for Harness admission.  
2. Requests **Execution Harness** (via Runtime) to run the **existing** agent pipeline.  
3. Surfaces **Human Approval** to the workspace owner before anything becomes personal trusted knowledge.  
4. Receives **Verified Knowledge** and **Graph** outcomes with lineage intact.

Without the Bridge, Personal Brain can capture and locally process material but cannot claim Constitution-compliant **governed** research → verified knowledge for professional exploration.

---

## 2. Problem Statement

### Current

- Personal Brain **core** can capture, propose, and (with human confirmation) store personal knowledge.  
- External adapters exist for intake/understanding assistance.  
- Product UI layer is removed; library core remains.

### Missing

- A governed **multi-agent research workflow** admitted by the Execution Harness.  
- Explicit product contract: Personal Brain **requests** pipelines; it does **not** execute agents itself.  
- End-to-end lineage from user research request → brief → agents → human gate → sealed personal knowledge → graph.

### Pain

See **Pain Statement** above. Product-local shortcuts would recreate a shadow orchestrator and violate Article XIII spirit.

---

## 3. Scope

### Pipeline decision (pinned — no ambiguity)

Personal Brain Harness Bridge **consumes existing**:

**[`/pipelines/knowledge-ingestion`](../../../pipelines/knowledge-ingestion.md)**

- The Bridge does **not** create new pipeline topology.  
- A **personal-scoped pipeline** is **future consideration only** and is **out of scope** for this SPEC. Any such topology requires a future Spec + Architecture Review (+ ADR if topology/trust changes).

### In scope (product contract)

| Capability | Description |
|------------|-------------|
| Research request | Owner-initiated intent (natural language or structured) within a personal workspace |
| Research Brief | Conceptual artifact that bootstraps a Harness pipeline run |
| Agent pipeline request | Admission request to Execution Harness / Runtime for pinned pipeline **`knowledge-ingestion`** |
| Human review | Owner-attributable Human Approval Gate outcomes before trusted knowledge |
| Knowledge acceptance | Only approved outcomes become **Verified Personal Knowledge** |
| Graph update | Post-acceptance connection of verified knowledge in the Knowledge Graph |

### Traceability to Product SSOT

Maps to SPEC-PRODUCT-MASTER capabilities: **B Research**, **C Verify**, **D Store**, **E Retrieve and Connect** (Decision Intelligence remains future).

---

## 4. Non Goals

This SPEC explicitly excludes:

| Non-goal | Reason |
|----------|--------|
| UI design / product frontend | Presentation is out of scope |
| Decision Agent implementation | Future boundary only (SSOT §9) |
| Runtime rewrite | Consume Runtime as-is |
| SDK rewrite | Consume SDK as-is |
| Harness law rewrite | Consume `/harness/HARNESS_SPECIFICATION.md` |
| New pipeline topology / personal-scoped pipeline | Future only; Bridge uses `knowledge-ingestion` |
| Autonomous knowledge acceptance | Forbidden by SSOT and Constitution |
| Fake / unbound agents | Agents run only under published contracts via Harness |
| New agent contract named “Knowledge Agent” | Product role only — see §8 |
| Replacing simple capture path redesign | Local capture/approve may coexist; this SPEC covers **Harness-bound research exploration** |

---

## Interface Impact

### Consumes existing

| Surface | Use |
|---------|-----|
| **Runtime admission** | Admit pipeline runs / invocations per SPEC-RT-002 |
| **Execution Harness pipeline execution** | Law in `/harness/HARNESS_SPECIFICATION.md`; topology `knowledge-ingestion` |
| **Existing agent contracts** | `/contracts/agents/*` (Research, Source Validation, Proposal, Knowledge Review, Markdown, Knowledge Graph, Embedding, Memory, …) |
| **Existing artifacts and schemas** | `/artifacts`, `/schemas` — see Artifact Mapping |
| **Knowledge Engine** | Authorized SoR apply after Human Approval / apply token |
| **Graph Engine** | Graph connection after verified knowledge |

### Does NOT create

| Forbidden creation | Statement |
|--------------------|-----------|
| New orchestrator | Personal Brain must not become a second Harness |
| New pipeline engine | No parallel engine beside Runtime / Harness law |
| New approval semantics | Uses existing Human Approval Gate outcomes (`approved`, `rejected`, `request_changes`, … per Harness §9) |
| New SoR write path | No writes outside Knowledge Engine apply rules |

**Architecture impact (expected):** `no_arch_impact` under ADR-0009 product boundary — consume-only Bridge. Confirmed at Architecture Review on accept.

---

## 5. User Flow

**Example user intent:** “Research AI Agent market.”

```text
Request
   ↓
Research Brief
   ↓
Execution Harness Admission (Runtime)
   ↓
knowledge-ingestion pipeline
   ↓
Research Agent
   ↓
Validation
   ↓
Knowledge Proposal
   ↓
Human Review (owner) — Harness Human Approval Gate
   ↓
Verified Knowledge
   ↓
Graph Connection
```

### Narrative

1. **Request** — Owner states a research intent in their Personal Brain workspace.  
2. **Research Brief** — Personal Brain maps intent + workspace tenancy + constraints into a Brief suitable for pipeline bootstrap.  
3. **Admission** — Personal Brain **requests** Execution Harness admission (Runtime) for **`knowledge-ingestion`**. Agents do not self-admit.  
4. **Research → Validation → Proposal** — Contracted agents produce sealed-stage artifacts under Harness state machine, handoffs, and Review Gates.  
5. **Human Review** — Owner decides **accept / reject / modify** mapped to Harness §9 outcomes (`approved` / `rejected` / `request_changes`) at the Human Approval Gate.  
6. **Verified Knowledge** — Only on attributable approval does knowledge become personal trusted knowledge (Knowledge Plane apply under platform rules).  
7. **Graph Connection** — Graph stage connects verified knowledge for later retrieval and decision support.

Personal Brain product loop alignment:

```text
External World → AI Understanding → Human Confirmation
  → Personal Verified Knowledge → Knowledge Graph → Decision Model (future)
```

---

## 6. Artifact Definition

Conceptual artifacts only — **no database schema**, no field-level JSON Schema in this SPEC. Platform `/artifacts` and `/schemas` remain SoT for sealed shapes. **No schema changes** authorized by this SPEC.

| Artifact | Meaning | Sealed Knowledge Plane? |
|----------|---------|-------------------------|
| **Research Brief** | Bootstrap intent: question/topic, scope, constraints, allowed source classes, budget, tenancy/workspace binding, correlation ids | No — run input |
| **Research Result** | Collected candidate evidence / research report from Research (and related) stages | Candidate / stage artifact — not yet personal trusted knowledge |
| **Knowledge Proposal** | Decision-ready proposal for what should become personal knowledge (may include markdown-ready body, citations, gaps) | No — awaiting Human Approval |
| **Verified Knowledge** | Owner-approved personal knowledge with provenance to Brief, run, proposal, and approval decision | Yes — personal trusted SoR |

### Artifact Mapping (Product Concept → Platform Artifact)

| Product concept | Platform artifact |
|-----------------|-------------------|
| Research Brief | `ResearchBrief` |
| Research Result | `ResearchReport` |
| Knowledge Proposal | `Proposal` |
| Verified Knowledge | `Knowledge` |
| Graph Update | `GraphUpdate` |

(Human Approval decisions use existing Human Review / approval artifact semantics under Harness and pipeline Stage 4 — not redefined here.)

### Lineage (required conceptually)

```text
Research Brief → (pipeline run_id) → Research Result → Knowledge Proposal
  → Human Approval decision → Verified Knowledge → Graph Update
```

Every Verified Knowledge item must remain traceable to the originating Brief and approval.

---

## 7. Human Approval Boundary

**AI prepares. Human decides.**

| Owner decision | Harness §9 outcome (conceptual map) | Effect |
|----------------|-------------------------------------|--------|
| **Accept** | `approved` | Proposal may proceed to Verified Personal Knowledge (and subsequent graph connection) under platform apply rules |
| **Reject** | `rejected` | No personal trusted knowledge write from that proposal; run fails or terminates per Harness policy |
| **Modify** | `request_changes` (and/or owner edit + re-submit) | AI may revise; **re-approval** required before sealing trusted knowledge |

### Hard rules

1. No agent identity may satisfy the Human Approval Gate for personal trusted knowledge.  
2. No automatic promotion from Research Result or Knowledge Proposal to Verified Knowledge.  
3. Capture-path human approval and Ask-path human approval remain consistent with SPEC-PRODUCT-MASTER §6; this SPEC does not weaken them.  
4. Urgency never waives Human Approval for SoR mutation (Constitution Art. III / XIII).  
5. This SPEC does **not** invent new approval semantics.

---

## 8. Agent Responsibilities

### Knowledge Agent (product role — not a new contract)

**Knowledge Agent** is a **product role concept** only.  
This SPEC does **not** create a new agent contract named Knowledge Agent.

**Implementation uses existing platform agents/stages:**

| Existing capability | Role in Bridge |
|---------------------|----------------|
| **Validation** (Source Validation Agent) | Credibility / source validation of research outputs |
| **Proposal** (Proposal Agent) | Decision-ready Knowledge Proposal |
| **Markdown** (Markdown Agent) | Faithful authoring after approval as required by pipeline |
| **Knowledge Apply** (Knowledge Engine apply path + Review as required) | SoR write of Verified Knowledge only after Human Approval / apply token |

### Product-facing role map

| Product role | Maps to (existing) | Must not |
|--------------|-------------------|----------|
| **Research Agent** | `research-agent` contract | Seal personal trusted knowledge; skip validation |
| **Knowledge Agent** (role) | Validation + Proposal + Markdown + Knowledge Apply (as above) | Bypass Human Approval; invent sources; imply a new contract |
| **Graph Agent** | `knowledge-graph-agent` (+ Graph Engine) | Graph-write unverified proposals as trusted truth |
| **Decision Agent (future)** | No contract in this SPEC | Auto-accept knowledge; replace human judgment |

Supporting agents (Notification, Learning, Embedding, Memory, etc.) follow `knowledge-ingestion` law — they never replace Human Approval.

---

## 9. Execution Harness Relationship

### Principle

**Personal Brain does not execute agents directly.**

```text
Personal Brain (product layer)
        ↓  request (Brief + tenancy + pipeline pin = knowledge-ingestion)
Execution Harness admission (Runtime)
        ↓
Pipeline knowledge-ingestion + State Machine + Artifacts + Handoffs
        ↓
Review Gates + Human Approval Gate
        ↓
Audit Trail + Sealed / Verified Knowledge (+ GraphUpdate)
        ↓  outcomes / references
Personal Brain (indexes, retrieval, future Decision Model)
```

### Obligations

| Party | Obligation |
|-------|------------|
| **Personal Brain** | Form Brief; request admission to **`knowledge-ingestion`**; present human gate to owner; consume outcomes; never self-admit agents; never shadow-orchestrate multi-agent SoR writes |
| **Execution Harness** | Sole admitting authority; enforce lifecycle, state, handoffs, retries, gates, audit |
| **Runtime** | Enforce Harness semantics (consume, do not rewrite under this SPEC) |
| **SDK** | Bind agents to contracts; emit candidates for Harness seal (consume, do not rewrite) |

### Development vs Execution

- **Development Harness** (= Engineering Process) governs how this SPEC is built and accepted (`TRACE-PB-BRIDGE-001`).  
- **Execution Harness** governs how agents run for a research request.  
These must not be merged.

---

## 10. Acceptance Criteria

Measurable conditions for declaring the Bridge **product-contract complete** (implementation may follow in a later sprint after Founder/Architecture approval):

| # | Criterion |
|---|-----------|
| AC-1 | A Personal Brain research request can be expressed as a **Research Brief** (`ResearchBrief`) with workspace tenancy and correlation to the owner. |
| AC-2 | The Brief becomes a **governed pipeline request** admitted by Execution Harness / Runtime for pinned **`knowledge-ingestion`** (no product-local agent swarm; no new pipeline topology). |
| AC-3 | **Human Approval** exists as a mandatory gate before any research-derived content becomes **Verified Personal Knowledge**. |
| AC-4 | Owner decisions support **accept / reject / modify** mapped to Harness outcomes (`approved` / `rejected` / `request_changes`) with attributable identity. |
| AC-5 | **Knowledge lineage** is preserved: Verified Knowledge traces to Brief, run, proposal, and approval. |
| AC-6 | Post-acceptance **Graph connection** (`GraphUpdate`) is part of the happy path (not optional silent skip without recorded reason). |
| AC-7 | Personal Brain documentation and MODULE_STATUS name this SPEC as the Bridge contract under SPEC-PRODUCT-MASTER. |
| AC-8 | No acceptance path relies on UI existence; contract is presentation-agnostic. |

Out of acceptance for this SPEC: Decision Agent behavior, UI screens, Runtime/SDK code changes, personal-scoped pipeline.

---

## 11. Future Evolution

### Decision Model connection

After Verified Knowledge and Graph Connection are Harness-bridged:

```text
Verified Personal Knowledge + Graph
        ↓
Decision Model (future)
        ↓
Decision Agent proposals (future)
        ↓
Human judgment (always)
```

- Decision Model consumes **verified** personal knowledge only.  
- Decision Agent (future) proposes support; never auto-writes trusted knowledge or final decisions.  
- Any Decision path requires its own SPEC under SPEC-PRODUCT-MASTER amendment rules — **out of scope for SPEC-PROD-004 implementation**.

### Future considerations (not authorized by this SPEC)

- **Personal-scoped pipeline topology** — requires new Spec + Architecture Review (+ ADR if needed)  
- Budget / egress policy profiles for personal research  
- Experience Plane surfaces for Brief creation and Human Gate (still not UI design in this SPEC)

---

## Amendment Rules

1. Changes to Bridge product meaning update **this file** and remain subordinate to **SPEC-PRODUCT-MASTER**.  
2. Material boundary changes require Architecture Review (+ ADR if Execution Harness topology or trust model is affected).  
3. Implementation SPECs/tasks must cite SPEC-PROD-004 / `TRACE-PB-BRIDGE-001` and must not bypass AC-2 / AC-3.  
4. Creating new pipeline topology is **forbidden** under this SPEC’s Scope.

---

## Status / Next

| State | Action |
|-------|--------|
| Now | Spec **revised** for Architecture Review REQUEST CHANGES — still **no implementation** |
| Next | Re-run Architecture Review → Engineering Agent chain → Founder business approval → optional implementation sprint |

**End of SPEC-PROD-004-HARNESS-BRIDGE**
