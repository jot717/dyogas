# SPEC-EXECUTION-HOST-001 — Pipeline Execution Host

**Spec ID:** SPEC-EXECUTION-HOST-001  
**Title:** Pipeline Execution Host (Execution Layer)  
**Status:** `accepted`  
**Trace ID:** TRACE-EXEC-HOST-001  
**Module:** MOD-EXECUTION-HOST (`@dyogas/execution-host`)  
**Requester:** Architecture Agent (platform gap — T-B1 PARTIAL admission path)  
**Spec Author:** Architecture Agent  
**Related:** Constitution Art. I, III, XIII · `/harness/HARNESS_SPECIFICATION.md` · `/pipelines/*` · SPEC-RT-002 · SPEC-RT-003 · SPEC-PROD-004-HARNESS-BRIDGE · ADR-0003 · ADR-0004 · ADR-0009 · **ADR-0010**  

**Development Harness path:** SPEC → Review → Approval → Sprint → Implementation → Verified  
**Delivery:** SPRINT-EXECUTION-HOST-001 **COMPLETE** · MODULE COMPLETE  

---

## 1. Problem Statement

| Field | Content |
|-------|---------|
| **Who** | Platform engineers, Personal Brain (and future Experience products), operators who must run governed multi-agent knowledge workflows |
| **How it hurts** | Execution Harness **law** and Runtime **primitives** exist, but nothing drives a pinned pipeline from bootstrap input through stages, gates, human approval, SoR apply, and graph update as one auditable run |
| **Frequency** | Every `knowledge-ingestion` (and future pipeline) run required by products |
| **Current workaround** | (a) Manual adherence to docs; (b) engine-local MVPs (e.g. Research `runResearchMvp`) that call `admitRun` then skip remaining stages; (c) product-local orchestration (shadow Harness risk) |
| **Evidence** | T-B1 Runtime Admission Investigation: classification **PARTIAL** — `admitRun` exists; full Pipeline Engine host missing |

### Goals

1. Define a **Pipeline Execution Host** that consumes existing pipeline definitions and drives stage execution under Execution Harness law.  
2. Compose **Runtime** (admit, state, handoff, retry, audit emit) and **Agent SDK** (bind, skills, candidates) without replacing either.  
3. Provide a product-safe admission surface for bootstrap inputs (e.g. `ResearchBrief`) leading to sealed Knowledge / GraphUpdate outcomes when Human Approval succeeds.  
4. Preserve Human Approval Gate, Review Gates, artifact lineage, and Audit Trail.

### Duplicate Check

No existing module is a full Pipeline Execution Host:

| Capability | Exists? | Gap |
|------------|---------|-----|
| Harness law | Yes (`/harness`) | Law, not host |
| Runtime admit/state/handoff | Yes (`@dyogas/runtime`) | Primitives only; no stage walker |
| Agent SDK bind/emit | Yes (`@dyogas/agent-sdk`) | Agent-side; does not admit/orchestrate pipelines |
| Pipeline definitions | Yes (`/pipelines`) | Specs, not executable driver |
| Research MVP | Partial (`runResearchMvp`) | Labels `knowledge-ingestion` but does not run full topology |
| Personal Brain | Product layer | Must **request** host; must not become orchestrator |

**This SPEC consolidates the missing host; it does not duplicate Harness or Runtime.**

---

## 2. Architecture Position

```text
CONSTITUTION
     │
     ├─ Development Harness  (= /engineering)
     │
     └─ Execution Harness    (= /harness law)
              │
              ▼
     ┌────────────────────────────┐
     │  PIPELINE EXECUTION HOST   │  ← THIS SPEC (new layer)
     │  (drives pipeline runs)    │
     └────────────┬───────────────┘
                  │ consumes
     ┌────────────┼────────────────────────┐
     ▼            ▼                        ▼
 Runtime      Agent SDK              /pipelines
 (admit,      (bind, skill,          (topology,
  state,       candidate)             exit criteria)
  handoff,
  retry)
                  │
                  ▼
            Agents (contracts)
                  │
                  ▼
         Knowledge / Graph engines
                  ▲
                  │ requests
            Personal Brain
            (and other Experience products)
```

**Plane note:** Execution Host sits in the **Orchestration / Execution** path between Experience product requests and Knowledge Plane mutation — always under Harness gates. It is **not** Experience UI and **not** a second Constitution.

---

## 3. Responsibility Boundary

### Execution Host SHALL

| Responsibility | Description |
|----------------|-------------|
| Load pinned pipeline definition | Read declared stage topology from `/pipelines` (version-pinned at run create) |
| Admit runs | Call Runtime `admitRun` / `startRun` with pipeline id + contract pins + audit sink |
| Drive stages in order | Admit each stage producer; enforce Exit Criteria / Review Gates per Harness |
| Bind agents via SDK | `bindContract` + allowlisted skill/tool use for the stage’s contract |
| Validate and seal | Use Runtime handoff/seal helpers; refuse unsealed illegal handoffs |
| Pause for Human Approval | Enter WAITING_HUMAN / GATE_HUMAN semantics; never auto-approve |
| Mint / require apply token | Only after attributable `approved` outcome, per pipeline + Harness |
| Invoke Knowledge/Graph apply | Only through existing Knowledge Engine / Graph Engine paths after authorization |
| Emit audit events | Every transition, gate, handoff, and gate decision via Trust audit sink |
| Return outcomes to callers | Run status, artifact refs, lineage ids |

### Execution Host SHALL NOT

| Forbidden | Why |
|-----------|-----|
| Replace Runtime | Runtime remains sole admit/state/handoff primitive host (SPEC-RT-002) |
| Redefine Harness law | `/harness/HARNESS_SPECIFICATION.md` remains SoT for execution semantics |
| Create new agent contracts | Uses `/contracts/agents/*` only |
| Bypass Human Approval | Constitution Art. III / XIII |
| Invent pipeline topology | Consumes `/pipelines`; no personal/parallel topology in this SPEC |
| Mutate Knowledge SoR via side channels | Only authorized apply after gate + token |
| Embed Product UI | Presentation-agnostic |
| Act as Personal Brain product logic | Products **request**; Host **executes** |

---

## 4. Relationships

### 4.1 Execution Harness (`/harness`)

| Role | Relation |
|------|----------|
| Harness | **Law** — Pipeline Engine meaning, Agent Lifecycle, State Machine, Handoff, Retry, Review/Human Gates, Audit |
| Execution Host | **Implementation of the Pipeline Engine role** as a module that obeys that law |

Host does not amend Harness; if law is insufficient, amend Harness Spec via ADR — not silently in Host code.

### 4.2 Runtime (`@dyogas/runtime`)

| Role | Relation |
|------|----------|
| Runtime | Primitives: `admitRun`, transitions, retry helpers, `sealArtifact` / `acceptHandoff`, tenancy-bound `ExecutionContext` |
| Execution Host | **Caller/composer** of Runtime — does not fork state machine or reimplement illegal-transition checks |

### 4.3 Agent SDK (`@dyogas/agent-sdk`)

| Role | Relation |
|------|----------|
| SDK | `bindContract`, `invokeSkill`, `emitCandidate`, tools/memory contracts |
| Execution Host | Invokes SDK **inside** stage Execute phases; does not admit runs via SDK |

### 4.4 Agents (`/contracts`)

| Role | Relation |
|------|----------|
| Agents | Bound producers per stage (Research, Validation, Proposal, Review, Markdown, Graph, Embedding, Memory, …) |
| Execution Host | Schedules/admits invocations per contract pin; never substitutes agent judgment for Human Approval |

### 4.5 Personal Brain (and Experience products)

| Role | Relation |
|------|----------|
| Personal Brain | Product layer (SPEC-PRODUCT-MASTER / SPEC-PROD-004): forms Research Request → Brief; **requests** Host; surfaces Human Approval to owner; consumes Knowledge/Graph outcomes |
| Execution Host | Platform service: runs `knowledge-ingestion` (and later pinned pipelines) under Harness |

Personal Brain **must not** reimplement Host orchestration (Art. XIII). SPEC-PROD-004 Bridge becomes implementable once Host exists.

### 4.6 Knowledge / Graph engines

Host triggers apply/update **only** after Human Approval + apply token (and Review Gates), using existing engine APIs — no parallel SoR.

---

## 5. Pipeline Execution Lifecycle

Canonical lifecycle for one run (aligned with Harness + `knowledge-ingestion`):

```text
1. REQUEST          Product submits bootstrap (e.g. ResearchBrief) + tenancy context
2. CREATE / PIN     Host pins pipeline_id + pipeline_version + contract/schema pins
3. ADMIT RUN        Runtime admitRun → CREATED → startRun → RUNNING
4. STAGE LOOP       For each stage in pipeline order:
                      a. Bind agent (SDK)
                      b. Admit stage invocation (Runtime semantics)
                      c. Execute (skills/tools within allowlist)
                      d. Validate candidate (schema + Exit Criteria)
                      e. Review Gate (automated)
                      f. Seal + Handoff to next stage (Runtime)
5. HUMAN GATE       When pipeline requires Human Approval (e.g. Stage 4):
                      WAITING_HUMAN / GATE_HUMAN
                      Outcomes: approved | rejected | request_changes | expired | escalated
6. APPLY            On approved: mint/require apply_token → Knowledge apply
7. GRAPH+           Continue Graph → Embedding → Memory per pipeline
8. COMPLETE         SUCCEEDED | FAILED | CANCELLED
9. AUDIT CLOSE      Full reconstructable trail
```

Illegal transitions fail closed (Runtime). Host must not invent transitions outside Harness/Runtime law.

---

## 6. Input / Output Contracts

### 6.1 Inputs (conceptual — no new schema invented in this SPEC)

| Input | Required | Notes |
|-------|----------|-------|
| `pipeline_id` | Yes | e.g. `knowledge-ingestion` |
| `pipeline_version` | Yes | Pin at CREATE |
| Bootstrap artifact | Yes | For knowledge-ingestion: `ResearchBrief` (question, scope, constraints, allowed_source_classes, budget, tenancy, correlation) |
| Contract pins | Yes | Per stage / run policy as required by Harness admit |
| Audit sink | Yes | Trust audit |
| Caller / tenancy context | Yes | Kernel tenancy + Trust identity must match |

Exact TypeScript/API shapes are deferred to implementation Spec after Architecture Review; they must map to existing `/schemas` and `/artifacts` where present.

### 6.2 Outputs (conceptual)

| Output | When |
|--------|------|
| `run_id` + run state | Always |
| Stage artifact refs | Per successful stage seal |
| Human Approval decision ref | When gate reached / completed |
| `Knowledge` artifact ref | On successful apply |
| `GraphUpdate` artifact ref | On successful graph stage |
| Audit event stream / digest pointer | Always |
| Terminal status | SUCCEEDED / FAILED / CANCELLED |

### 6.3 Failure outputs

Fail closed with typed reasons (admit denied, gate fail, human rejected/expired, retry exhausted, tenancy mismatch) — no partial SoR write without authorization.

---

## 7. Artifact Lineage Requirements

Every successful Trusted Knowledge path MUST preserve:

```text
ResearchBrief
  → run_id (pinned pipeline_version)
  → ResearchReport
  → ValidationReport (as pipeline requires)
  → Proposal
  → HumanReviewDecision / approval outcome
  → Knowledge
  → GraphUpdate
  (+ EmbeddingJob / MemoryUpdate as pipeline requires)
```

| Rule | Requirement |
|------|-------------|
| Correlation | Brief correlation id present on run and descendant artifacts |
| Digests | Sealed artifacts carry digest per Harness |
| Tenancy | No cross-tenant handoff |
| Provenance | Claims/evidence traceable on ResearchReport and Knowledge |
| No orphan apply | Knowledge apply impossible without approval + token when pipeline requires it |

---

## 8. Human Approval Integration

| Rule | Statement |
|------|-----------|
| Mandatory | Pipelines that require Human Approval (e.g. `knowledge-ingestion` Stage 4) **must** block SoR apply until attributable human outcome |
| Outcomes | `approved`, `rejected`, `request_changes`, `expired`, `escalated` (Harness §9) |
| Actor | Human / owner identity only — **never** agent identity |
| Apply token | Issued only on `approved`; single-use; bound to artifact version |
| Product surfacing | Experience products (e.g. Personal Brain) present the gate; Host enforces wait/fail-closed |
| Urgency | Does not waive approval |

Host provides wait/resume hooks; it does not invent new approval semantics.

---

## 9. Audit Requirements

Host SHALL ensure (via Runtime + Trust sink) audit coverage for at least:

| Event class | Examples |
|-------------|----------|
| Run lifecycle | admitted, started, succeeded, failed, cancelled |
| Stage lifecycle | admitted, completed, failed, retried |
| Gates | Review Gate pass/fail; Human Gate outcome |
| Handoffs | accept/reject with artifact id/version/digest |
| Authorization | apply_token mint/consume; SoR apply attempt |
| Identity | tenant_id, actor where required |

Audit trail must allow reconstruction of “what ran, under which pins, with which approvals.”

---

## 10. Non-Goals

| Non-goal | Rationale |
|----------|-----------|
| Replace Runtime | SPEC-RT-002 remains primitive host |
| Redefine Harness | `/harness` remains execution law SoT |
| New agent contracts | Use existing `/contracts` |
| New pipeline topology / personal-scoped pipeline | Future Spec + ADR if needed |
| Bypass Human Approval | Forbidden |
| Product UI | Out of scope |
| Decision Agent / Decision Model | Personal Brain future; separate Spec |
| Cloud vendor lock-in / LangGraph-as-law | Constitution / Harness non-goals |
| Implementing this SPEC in the same change set | SPEC only |
| Rewriting Personal Brain capture/ask core | Separate; Bridge waits on Host |

---

## 11. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-1 | Spec positions Execution Host as **composer of Runtime + SDK + /pipelines**, not a replacement of Harness or Runtime. |
| AC-2 | Spec forbids new agent contracts, new approval semantics, and Human Approval bypass. |
| AC-3 | Lifecycle covers Brief → admit → stages → gates → human approval → Knowledge → GraphUpdate. |
| AC-4 | Lineage chain ResearchBrief → … → Knowledge → GraphUpdate is mandatory for trusted path. |
| AC-5 | Interface Impact lists consume-only surfaces; Architecture Review can conclude `adr_required` or `no_arch_impact` with rationale. |
| AC-6 | Personal Brain is defined as **requester**, not orchestrator. |
| AC-7 | Non-goals exclude UI, Decision Agent, Runtime/SDK rewrite, new pipeline topology. |
| AC-8 | Development Trace defines SPEC → Review → Approval → Sprint → Implementation; this delivery is SPEC-only. |

### Success Metrics (Spec stage)

| Metric | Target |
|--------|--------|
| Gap coverage | T-B1 “full pipeline host missing” explicitly addressed by this Spec |
| Boundary clarity | Reviewers can state Host vs Runtime vs Harness in one sentence each |
| Bridge unblocked | SPEC-PROD-004 can cite Host as the missing platform dependency without inventing APIs |

---

## Interface Impact

### Consumes (existing)

- `/harness/HARNESS_SPECIFICATION.md`  
- `/pipelines/knowledge-ingestion.md` (+ future pinned pipelines)  
- `@dyogas/runtime` (admit, state, handoff, retry)  
- `@dyogas/agent-sdk` (bind, skills, candidates)  
- `/contracts/agents/*`  
- `/artifacts`, `/schemas`  
- `@dyogas/knowledge-engine`, `@dyogas/graph-engine`  
- `@dyogas/kernel`, `@dyogas/trust`  

### May create (after approval — not in this change set)

- New package/module **MOD-EXECUTION-HOST** (implementation Spec)  
- Product-facing **request** API surface owned by Host (not Personal Brain orchestration)  

### Does not create

- New Harness law document  
- New Runtime state machine  
- New agent contracts  
- New SoR write path  

### Architecture Review expectation

Likely **`adr_required`**: new registered platform module between Runtime and Experience products. ADR must affirm Host does not duplicate Harness or bypass gates.

---

## Development Trace

| Field | Value |
|-------|-------|
| Trace ID | `TRACE-EXEC-HOST-001` |
| Lifecycle | Draft → Review → Approved → Sprint → Implemented → Verified |
| Approval chain | PO → Chief Architect → Tech Lead → EM → Architecture Reviewer → Founder (business) |
| Next after accept | Sprint plan (e.g. SPRINT-EXEC-HOST-001) — **not** started by this Spec |
| Blocks | Full Personal Brain Harness Bridge E2E (SPEC-PROD-004) until Host exists or Architecture approves alternate |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Host becomes second Harness | Hard non-goals; Architecture Review; ADR |
| Products keep shadow orchestration | SPEC-PROD-004 + Constitution Art. XIII; Host as sole multi-agent driver |
| Scope creep into UI/Decision | Explicit non-goals |
| Overloading Runtime | Host composes; Runtime stays primitive |

---

## Open Questions

1. Package name / Build Order slot for MOD-EXECUTION-HOST?  
2. Does Host live as new package vs controlled expansion documented under a new MOD without touching Runtime source? (Prefer new package.)  
3. How Experience products authenticate Human Approval actors into Host wait/resume?  
4. Relationship to `ingestion-e2e` / existing MVP runners — migrate vs wrap?  

---

## Amendment Rules

1. Material boundary changes require Architecture Review + ADR when topology/trust/module registration changes.  
2. Harness semantic changes amend `/harness` — not this Spec alone.  
3. Implementation must cite `TRACE-EXEC-HOST-001` and must not start before Founder business approval of this Spec (and ADR if required).

---

## Status / Next

| Now | SPEC-EXECUTION-HOST-001 **accepted** · ADR-0010 **Accepted** · Module **COMPLETE** |
| Next | Consumers (e.g. Personal Brain Harness Bridge) request Host; no new Host sprint required for MODULE COMPLETE |

**End of SPEC-EXECUTION-HOST-001**
