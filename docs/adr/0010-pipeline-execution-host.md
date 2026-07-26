# ADR-0010: Pipeline Execution Host Module Boundary

**Status:** Accepted  
**Date:** 2026-07-23  
**Accepted:** 2026-07-23  
**Deciders:** Founder (business) · Architecture Review (technical) — Accepted after SPRINT-EXECUTION-HOST-001 Module Complete  
**Related:** Constitution Art. I, III, VIII, XIII · `/harness/HARNESS_SPECIFICATION.md` · SPEC-EXECUTION-HOST-001 · SPEC-RT-002 · SPEC-RT-003 · ADR-0003 · ADR-0004 · ADR-0006 · ADR-0009 · SPEC-PROD-004-HARNESS-BRIDGE · DL-EXECUTION-HOST-001 · TRACE-EXEC-HOST-001  

**Implementation:** Authorized and **COMPLETE** — `@dyogas/execution-host` / MOD-EXECUTION-HOST MODULE COMPLETE.

---

## Context

Execution Harness law (`/harness`) and Runtime primitives (`admitRun`, state, handoff, retry) exist. Pipeline definitions exist under `/pipelines`. Agent SDK binds agents. Products (Personal Brain via SPEC-PROD-004) must request governed `knowledge-ingestion` runs.

T-B1 investigation classified Runtime admission as **PARTIAL**: Runtime admits runs but does not load or drive full pipeline topology (stages → Review Gates → Human Approval → Knowledge apply → GraphUpdate). Engine-local MVPs (e.g. Research `runResearchMvp`) label `knowledge-ingestion` then skip remaining stages. Product-local orchestration would violate Constitution Art. XIII (shadow Harness).

Architecture Review of `SPEC-EXECUTION-HOST-001` returned **APPROVE**, with expectation **`adr_required`** for a new registered platform module.

ADR-0003 established Runtime as the sole **process host** for Harness-compatible admit/state/handoff enforcement, and noted full pipeline graph loading “may grow later.” This ADR decides **where** that growth lives: a dedicated Execution Host module that **composes** Runtime, not a fork of Runtime law.

---

## Problem

Without a registered Pipeline Execution Host:

1. No auditable, single driver walks Brief → … → Knowledge → GraphUpdate under Harness gates.  
2. Personal Brain cannot complete Harness Bridge without becoming an illegal orchestrator.  
3. Future Experience products would each invent parallel runners.  
4. Expanding Runtime into full pipeline orchestration would blur ADR-0003 / ADR-0004 boundaries (Runtime vs SDK vs engines).

---

## Decision

**Accepted.**

1. Register platform module **MOD-EXECUTION-HOST** (package `@dyogas/execution-host`).  
2. **Pipeline Execution Host** is the sole implementation of the Harness **Pipeline Engine role** in software: load version-pinned `/pipelines` definitions; admit runs via Runtime; drive stages in order; bind agents via Agent SDK; enforce Review Gates; pause for Human Approval; mint/require apply token only after attributable `approved`; authorize Knowledge/Graph apply only through existing engine paths; emit audit via Trust sink.  
3. Host **SHALL NOT** replace Runtime, redefine Harness markdown law, create new agent contracts, invent pipeline topology outside `/pipelines`, bypass Human Approval, or embed Product UI.  
4. Experience products (Personal Brain first; later Research Workspace, Enterprise Knowledge, Decision System, etc.) **request** Host runs — they **SHALL NOT** reimplement multi-agent SoR orchestration.  
5. Implementation delivered under SPRINT-EXECUTION-HOST-001 — **MODULE COMPLETE**.

### Trusted artifact lineage (mandatory for successful trusted path)

```text
ResearchBrief
  → ResearchReport
  → ValidationReport (as pipeline requires)
  → Proposal
  → HumanReviewDecision / approval outcome
  → Knowledge
  → GraphUpdate
```

---

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A. Grow full Pipeline Engine inside `@dyogas/runtime`** | One package; ADR-0003 “may grow later” literal | Blurs Runtime primitives vs stage orchestration; pulls SDK bind into Runtime contrary to ADR-0003/0004 | **Rejected** |
| **B. Each product / engine hosts its own orchestrator** | Fast local shipping | Shadow Harness; Art. XIII violation; divergent gates/lineage | **Rejected** |
| **C. Treat Harness markdown as executable host** | No new module | Law ≠ software; no admit/bind/apply composition | **Rejected** |
| **D. New MOD-EXECUTION-HOST composing Runtime + SDK + `/pipelines`** | Clear boundary; multi-product reuse; unblocks Bridge without product orchestration | New Build Order slot / package ownership | **Chosen (proposed)** |

---

## Consequences

### Positive

- Spec-defined gap (T-B1) has a registered home.  
- SPEC-PROD-004 can depend on Host without inventing APIs inside Personal Brain.  
- Multi-product readiness: one Host, many Experience requesters.  
- ADR-0003 preserved: Runtime stays fail-closed primitive host; Host is caller/composer.  
- Human Approval and SoR apply remain gated and auditable.

### Negative / follow-up

- Requires Build Order / MODULE_STATUS registration after acceptance.  
- Existing MVP runners (`runResearchMvp`, ingestion-e2e) must later migrate or wrap Host (open question — not resolved by this ADR).  
- Product ↔ Host human wait/resume auth must be specified in implementation Spec.  
- Implementation Spec + sprint still required after Founder APPROVE.

### Explicitly unchanged

- `/harness/HARNESS_SPECIFICATION.md` remains SoT for execution semantics.  
- `@dyogas/runtime` remains sole admit/state/handoff primitive enforcement host (ADR-0003).  
- `@dyogas/agent-sdk` remains bind/skill/candidate boundary (ADR-0004).  
- Knowledge SoR boundary (ADR-0006) unchanged — Host does not create a parallel SoR.

---

## Non-Goals

- Implementing MOD-EXECUTION-HOST in this ADR change set  
- Rewriting Runtime, Agent SDK, Kernel, or Trust  
- Amending Harness law (amend `/harness` via separate ADR if law gaps appear)  
- New agent contracts or new pipeline topology  
- Product UI, Decision Agent, Decision Model  
- Cloud vendor lock-in / LangGraph-as-law  

---

## Module Ownership

| Concern | Owner |
|---------|-------|
| Execution semantics (law) | `/harness` (Harness Spec) |
| Pipeline topology (declared) | `/pipelines/*` |
| Admit / state / handoff / retry primitives | `@dyogas/runtime` (ADR-0003) |
| Contract bind / skills / candidates | `@dyogas/agent-sdk` (ADR-0004) |
| **Pipeline run driving / stage walker / gate pause / apply authorization orchestration** | **MOD-EXECUTION-HOST (this ADR)** |
| Agent judgment / producers | `/contracts/agents/*` + engines |
| Knowledge / Graph mutation APIs | Knowledge Engine / Graph Engine (existing) |
| Experience request + human surfacing | Personal Brain and future Experience products |

---

## Relationship Matrix

| Artifact | Relationship |
|----------|----------------|
| **Constitution** | Host enforces Art. III / XIII Human Approval and governed multi-agent execution; Art. VIII ADR required for this module registration |
| **Harness** (`/harness`) | **Law.** Host implements Pipeline Engine role; does not amend Harness silently |
| **Runtime** | **Primitives.** Host calls `admitRun` / transitions / seal-handoff; does not fork state machine |
| **SDK** | **Agent-side bind.** Host invokes SDK inside Execute phases; SDK does not admit pipelines |
| **Agents** | **Producers.** Host schedules per contract pin; agents never auto-approve SoR writes |
| **Personal Brain** | **Requester.** Forms Research Request → Brief; requests Host; surfaces Human Approval; consumes Knowledge/Graph outcomes; must not shadow-orchestrate (SPEC-PROD-004; ADR-0009 product layer preserved) |

---

## Approval Status

| Gate | Status |
|------|--------|
| Architecture Review (SPEC-EXECUTION-HOST-001) | **APPROVE** |
| This ADR | **Accepted** |
| Founder Decision Log | `docs/decision-log/DL-EXECUTION-HOST-001.md` — **APPROVED** |
| Implementation / Sprint | **COMPLETE** — MODULE COMPLETE |

---

## References

- `specs/SPEC-EXECUTION-HOST-001.md`  
- `docs/decision-log/DL-EXECUTION-HOST-001.md`  
- `personal-brain/specs/SPEC-PROD-004-HARNESS-BRIDGE.md`  
- `personal-brain/specs/SPEC-PRODUCT-MASTER.md`  
- `/harness/HARNESS_SPECIFICATION.md`  
- ADR-0003, ADR-0004, ADR-0006, ADR-0009  
- `MASTER_ARCHITECTURE.md` §5 B18 · §6.7a  

---

**End of ADR-0010 (Accepted)**
