# DYOGAS Engineering Process — Index

**Version:** 2.3.0
**Status:** Binding — Engineering Process Law
**Effective:** 2026-07-22
**Owner:** Engineering Manager Agent (process custodianship) · Founder (business authority only)
**Approvers:** Engineering Agents (Process Mode or Hosted Mode) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval (binding — see §2a; includes Process Mode bootstrap)
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) · [/harness/HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md) · [/contracts/README.md](../contracts/README.md) · [/pipelines/README.md](../pipelines/README.md) · [/artifacts/README.md](../artifacts/README.md) · [/schemas/README.md](../schemas/README.md) · [/docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) · [START_DEVELOPMENT.md](./START_DEVELOPMENT.md) · [SPEC-DEV-ORCH-001](../specs/SPEC-DEV-ORCH-001.md) (Development Orchestrator — Process Mode) · [DEV-ORCH Runbook](../docs/DEV-ORCH-RUNBOOK.md)

---

## 1. Purpose

`/engineering` is the single, binding description of **how work moves from a real pain point to a released, retrospected outcome** inside DYOGAS.

DYOGAS is an **AI-native Engineering Operating System**. Engineering responsibilities are performed by **Engineering Agents**. The Founder is **not** an engineering role and does **not** replace Product Owner, Tech Lead, Chief Architect, Engineering Manager, or Architecture Reviewer.

This directory is **process law**, not application code.

---

## 2. Definitions

| Term | Definition |
|---|---|
| **Lifecycle Stage** | One named phase of the canonical delivery flow with an owning document in this directory. |
| **Gate** | A checkpoint that must pass before work advances: Quality Gates (technical) and Approval Gates (Engineering Agents + optional Founder business approval). |
| **Engineering Agent** | An AI agent with an independent engineering responsibility (Product Owner, Chief Architect, Tech Lead, Engineering Manager, or Architecture Reviewer). Must produce its own review artifact; may approve or reject. |
| **Founder** | Human business authority only. Does **not** perform engineering reviews and does **not** substitute for any Engineering Agent. |
| **Founder Approval** | Final **business** decision after **all** required Engineering Agents have approved. Never replaces an Engineering Agent verdict. |
| **Review Artifact** | Mandatory written output of an Engineering Agent for a gate (approve/reject, rationale, checklist evidence). |
| **DoR / DoD** | Definition of Ready / Done ([15](./15_DEFINITION_OF_READY.md), [14](./14_DEFINITION_OF_DONE.md)). |
| **ADR / Decision Log** | Architecture Decision Records and append-only decisions (`/docs/adr`). |
| **Agent Contract** | Harness/runtime agent contracts under `/contracts` (product agents) — distinct from Engineering Agents unless separately contracted. |
| **Waiver** | Time-boxed exception requiring Engineering Manager Agent + Architecture Reviewer Agent approval, then Founder business approval; Decision Log required. |

---

## 2a. AI-Native Engineering Agent Approval (Binding)

**Status:** Binding on all `/engineering` documents  
**Supersedes and voids:** Solo Founder Mode and any rule that mapped Founder = Product Owner / Chief Architect / Tech Lead / Engineering Manager / Architecture Reviewer / Final engineering Approver.

### Forbidden (explicit)

- Founder = Product Owner  
- Founder = Chief Architect  
- Founder = Tech Lead  
- Founder = Engineering Manager  
- Founder = Architecture Reviewer  
- Founder = Final Approver *(engineering)*  
- Founder performing engineering reviews  
- Any stage blocked solely because a human must impersonate an Engineering Agent role  

### Engineering Agents (independent)

| Engineering Agent | Responsibility |
|-------------------|----------------|
| **Product Owner Agent** | Product completeness (pain, goals, non-goals, metrics, principle litmus) |
| **Chief Architect Agent** | System architecture (planes, boundaries, module fit, ADR need) |
| **Tech Lead Agent** | Technical feasibility (approach risk, dependencies, testability) |
| **Engineering Manager Agent** | Process compliance (DoR/DoD, stage artifacts, lifecycle integrity) |
| **Architecture Reviewer Agent** | Standards & quality (Constitution/Harness/engineering standards conformance) |

### Canonical Approval Chain

```
Specification (or stage work product)
        ↓
Product Owner Agent
(Product completeness)
        ↓
Chief Architect Agent
(System architecture)
        ↓
Tech Lead Agent
(Technical feasibility)
        ↓
Engineering Manager Agent
(Process compliance)
        ↓
Architecture Reviewer Agent
(Standards & quality)
        ↓
Founder Approval
(Business decision only)
```

### Rules

1. Every Engineering Agent has **independent** responsibilities; verdicts are not merged into one “team LGTM.”  
2. Every Engineering Agent **must** generate its own **review artifact** (approve | reject + rationale + checklist evidence).  
3. Engineering Agents may **approve or reject** a stage.  
4. The Founder **never** replaces an Engineering Agent.  
5. The Founder performs **only** final **business** approval **after** all Engineering Agents have approved.  
6. If **any** Engineering Agent rejects, the process **returns to the previous stage** for correction (do not skip ahead; do not Founder-override).  
7. Quality Gates (tests, schemas, mandatory artifact presence) remain mandatory and are not satisfied by Founder Approval.  
8. Where older text says “Product Owner,” “Tech Lead,” etc., it means the corresponding **Engineering Agent**, not the Founder.

### Bootstrap — Process Mode (breaks Runtime deadlock)

**Problem avoided:** Requiring `MOD-ENG-AGENTS` / Agent SDK / Runtime before any Specification can be approved creates a circular bootstrap (Runtime needs approved specs; hosted Engineering Agents need Runtime).

**Rule:**

| Mode | When | How Engineering Agents execute | Depends on Runtime/SDK? |
|------|------|--------------------------------|-------------------------|
| **Process Mode** | Until `MOD-RUNTIME` + `MOD-AGENT-SDK` are Module Complete | AI operators execute each Engineering Agent **role** under this `/engineering` law and write review artifacts under the module’s `stage/reviews/` | **No** |
| **Hosted Mode** | After Runtime + Agent SDK complete | Same roles hosted as `MOD-ENG-AGENTS` contracts on the Agent SDK | **Yes** |

Process Mode **is** the Engineering Agent Approval Chain — not Founder substitution. Hosted Mode is an implementation upgrade, not a new approval model.

**MVP first module:** `MOD-KERNEL` (Build Order B5). Kernel specs and reviews use Process Mode. Runtime Implementation remains blocked on Kernel + Trust per Build Order; Runtime **Specification** may complete in Process Mode without Kernel existing.

### Review Artifact Minimum Fields

```markdown
# Review Artifact: <Agent Name> — <Stage> — <Trace ID>
Agent: Product Owner Agent | Chief Architect Agent | Tech Lead Agent | Engineering Manager Agent | Architecture Reviewer Agent
Verdict: approve | reject
Rationale: ...
Checklist evidence: ...
Inputs reviewed: ...
Timestamp: ...
```

### Decision Log

Adoption of this model, Process Mode bootstrap, and voiding of Solo Founder Mode: `/docs/adr/README.md` Decision Log.

---

## 3. Scope

### 3.1 In scope

- Canonical development lifecycle from Specification through Retrospective.
- Engineering Agent approval chain and Founder business approval.
- Branching, commit, and documentation standards.
- DoR and DoD gates.
- How product/runtime AI agents participate under Harness (separate from Engineering Agents).

### 3.2 Out of scope

- Application code, APIs, or runtime frameworks.
- Product vision/roadmap/high-level architecture content ownership (`/docs`).
- Harness execution semantics (`/harness`, `/pipelines`, `/artifacts`, `/schemas`).
- Concrete issue-tracker vendor choice (tool-agnostic process).

---

## 4. Development Lifecycle (Canonical)

```
 1. Specification
       ↓
 2. Engineering Agent Approval Chain
       (PO → Chief Architect → Tech Lead → EM → Architecture Reviewer)
       ↓
 3. Founder Approval (business only)
       ↓
 4. Architecture Review (Chief Architect Agent + Architecture Reviewer Agent;
       ADR if required; still subject to chain + Founder business approval when material)
       ↓
 5. Backlog
       ↓
 6. Sprint Planning
       ↓
 7. Task Breakdown
       ↓
 8. Implementation  ⇄  Debugging (interrupt; no gate bypass)
       ↓
 9. Testing
       ↓
10. Code Review (Engineering Agents — not Founder)
       ↓
11. Regression
       ↓
12. Merge
       ↓
13. Release (Engineering Agents approve readiness → Founder business go/no-go)
       ↓
14. Retrospective  → Backlog
```

Any Engineering Agent **reject** at steps 2, 4, 10, or 13 returns work to the **previous** stage for correction.

Debugging (07) is an interrupt path: it returns through Testing and Code Review before Merge.

---

## 5. Document Map

| # | Document | Lifecycle stage(s) covered | Type |
|---|---|---|---|
| — | [README.md](./README.md) (this file) | Index, Agent approval model, lifecycle | Index |
| 01 | [01_SPECIFICATION.md](./01_SPECIFICATION.md) | Specification · Architecture Review | Stage |
| 02 | [02_BACKLOG.md](./02_BACKLOG.md) | Backlog | Stage |
| 03 | [03_SPRINT.md](./03_SPRINT.md) | Sprint Planning | Stage |
| 04 | [04_TASK_MANAGEMENT.md](./04_TASK_MANAGEMENT.md) | Task Breakdown | Stage |
| 05 | [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md) | Implementation | Stage |
| 06 | [06_TESTING.md](./06_TESTING.md) | Testing | Stage |
| 07 | [07_DEBUGGING.md](./07_DEBUGGING.md) | Debugging (interrupt) | Stage |
| 08 | [08_CODE_REVIEW.md](./08_CODE_REVIEW.md) | Code Review | Stage |
| 09 | [09_RELEASE.md](./09_RELEASE.md) | Regression · Merge · Release | Stage |
| 10 | [10_RETROSPECTIVE.md](./10_RETROSPECTIVE.md) | Retrospective | Stage |
| 11 | [11_BRANCHING.md](./11_BRANCHING.md) | Branching standard | Standard |
| 12 | [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md) | Commit standard | Standard |
| 13 | [13_DOCUMENTATION.md](./13_DOCUMENTATION.md) | Documentation standard | Standard |
| 14 | [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md) | DoD gate | Gate |
| 15 | [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md) | DoR gate | Gate |

---

## 6. Stage Contract (Universal Fields)

Every lifecycle stage document defines: Purpose, Entry/Exit Criteria, Owner (Engineering Agent or Task Owner), Approvers (Engineering Agent chain ± Founder business), Inputs, Outputs, Artifacts, Quality Gates, Approval Rules, Failure Conditions, Metrics, Review/Exit checklists, Rollback.

---

## 7. Authority

1. Constitution (legal substance)  
2. ADRs  
3. Domain SoRs (`/docs`, `/harness`, CPAS) as applicable  
4. **`/engineering` process law** (this tree)  
5. Sprint/backlog tool fields and PR text  

Conflict with Constitution → Constitution wins. Solo Founder Mode is **void**.

---

## 8. Non-Goals

- Treating the Founder as an Engineering Agent substitute  
- Parallel shadow approval processes  
- Skipping Engineering Agent review artifacts  

**End of Engineering Process Index v2.3.0**
