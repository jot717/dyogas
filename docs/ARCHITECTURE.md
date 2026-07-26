# DYOGAS High-Level Architecture

**Version:** 2.1.0
**Status:** Canonical (high-level only)
**Effective:** 2026-07-22
**Owner:** Chief Systems Architect
**Supersedes:** Architecture v2.0.0 (completeness expansion; no plane/boundary changes)
**Related:** [`/CONSTITUTION.md`](../CONSTITUTION.md), [`/harness/HARNESS_SPECIFICATION.md`](../harness/HARNESS_SPECIFICATION.md), [`/docs/PRODUCT_VISION.md`](./PRODUCT_VISION.md), [`/docs/adr/`](./adr/), [`/contracts/`](../contracts/), [`/pipelines/`](../pipelines/), [`/artifacts/`](../artifacts/), [`/schemas/`](../schemas/)

---

## Purpose

This document defines the **system shape** of DYOGAS: the planes it is built from, the hard boundaries between them, and the principles those boundaries encode. It does not define prompts, frameworks, APIs, or runtime code. It exists so that any architecture-class proposal can be checked against a stable shape before an ADR is written, and so that `/harness`, `/contracts`, `/pipelines`, `/artifacts`, and `/schemas` all sit inside a shape that is understood the same way by every contributor.

Execution semantics live in `/harness`. Agent obligations live in `/contracts`. Stage topology lives in `/pipelines`. Deliverable meaning lives in `/artifacts` and `/schemas`. This document is intentionally silent on all of that detail.

Architecture changes that alter planes, trust, or harness topology require an ADR (Constitution Article VIII) **before** this document is updated to describe them as current state.

---

## Definitions

| Term | Definition |
|------|------------|
| **Plane** | A distinct area of responsibility with its own trust characteristics and failure domain (e.g., Knowledge Plane, Cloud AI Compute Layer). |
| **Boundary** | The edge between two planes across which data, control, or trust may cross only under an explicit, documented rule. |
| **Knowledge Plane** | The local-first (or customer-controlled) system of record for user/organization knowledge. |
| **Cloud AI Compute Layer** | The elastic compute plane executing heavy model inference and AI workloads under purpose-bound, minimized, logged I/O. |
| **Trust & Control Plane** | The identity, secrets, policy, and audit-integrity plane that every other plane depends on for authorization and accountability. |
| **Experience Plane** | The human/agent-facing interface layer that surfaces intent, consent, and approvals. |
| **Harness** | The sole orchestrator **law** for pipeline runs, handoffs, retries, gates, and audit — sitting between the Experience Plane and the planes it coordinates. Software implementation of the Pipeline Engine role is **MOD-EXECUTION-HOST** (`@dyogas/execution-host`), composing Runtime + Agent SDK under this law (ADR-0010). |

## Scope

This document covers: the five planes, their responsibilities, the hard boundaries between them, and the Harness-First Principles as they manifest architecturally. It does **not** cover pipeline stage detail, agent I/O fields, artifact schemas, retry codes, state enums, or audit event shapes — those live in the layers listed in Non-Goals below.

## Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Chief Systems Architect (Owner)** | Maintains this document; is the default ADR reviewer for boundary/plane changes. |
| **Any Contributor proposing new capability** | Places the proposal within an existing plane, or explicitly proposes a plane/boundary change via ADR — never invents an implicit sixth plane by building across boundaries without one. |
| **Harness maintainers** | Ensure the Harness's actual coordination behavior matches "sole orchestrator" as described here; any drift is a Harness Specification defect. |
| **Security/Trust & Control Owner** | Owns the Trust & Control Plane's boundary enforcement and its audit sink integrity. |

---

## Architectural Thesis

DYOGAS is a **Harness-first** knowledge platform:

- **Local-first Knowledge Plane** owns user/org truth.
- **Cloud AI Compute Layer** executes heavy, purpose-bound inference.
- **Harness** is the only production path for multi-agent work: contracts → artifacts → pipelines → gates → audit.

```
┌──────────────────────────────────────────────────────────────┐
│                     Experience Plane                         │
│            Clients · Approvals UX · Status surfaces          │
└────────────────────────────┬─────────────────────────────────┘
                              │ intent / approvals
┌────────────────────────────▼─────────────────────────────────┐
│                         HARNESS                               │
│  Pipeline Engine · State Machine · Handoffs · Retry · Audit  │
│  Review Gates · Human Approval · Acceptance Criteria          │
└────────┬─────────────────┬───────────────────┬────────────────┘
         │                 │                   │
         ▼                 ▼                   ▼
┌────────────────┐ ┌───────────────┐ ┌─────────────────────────┐
│ Agent Contracts│ │   Artifacts   │ │ Cloud AI Compute Layer  │
│ /contracts     │ │  (immutable)  │ │ elastic model workloads  │
└────────────────┘ └───────┬───────┘ └─────────────────────────┘
                           │
                           ▼
                 ┌─────────────────────┐
                 │  Knowledge Plane    │
                 │  Local-first SoR    │
                 └──────────┬──────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                  Trust & Control Plane                       │
│         Identity · Secrets · Policy · Audit sinks            │
└──────────────────────────────────────────────────────────────┘
```

Every arrow in this diagram is a governed boundary, not an implementation detail. An arrow that does not exist in this diagram is a data/control flow that must not exist in production without an ADR adding it.

---

## Planes

| Plane | Responsibility | What it must never do |
|-------|-----------------|------------------------|
| **Experience** | Human/agent interfaces; surfaces consent and approval; carries intent into the Harness and approval decisions back out. | Must never mutate the Knowledge Plane directly, bypassing the Harness. |
| **Harness** | Sole orchestrator of pipeline runs, handoffs, retries, gates, audit. | Must never let an agent self-admit to a pipeline or self-approve a Human Approval Gate. |
| **Knowledge** | Local-first system of record for knowledge artifacts. | Must never be written to by anything other than an authorized, Harness-mediated apply. |
| **Cloud AI Compute** | Approved heavy AI workloads; minimized I/O. | Must never receive unscoped, unlogged payloads or become an implicit second system of record. |
| **Trust & Control** | Identity, secrets, policy, audit integrity. | Must never be bypassed by a "temporary" identity or an unaudited privileged path. |

---

## Harness-First Principles (Architecture View)

| Principle | Architectural meaning |
|-----------|------------------------|
| Agent Contract | No agent runs without a published contract |
| Artifact-based Development | Stages exchange immutable artifacts, not chat residue |
| Handoff Protocol | Advancement only via declared producer→consumer handoffs |
| Acceptance Criteria | Exit criteria are machine- and human-checkable |
| Pipeline-driven Execution | Canonical work follows `/pipelines` |
| Review Gates | Automated checks before downstream stages |
| Human Approval | Consequential SoR mutations stop for attributable humans |
| Immutable Deliverables | Accepted artifacts are versioned; mutation creates a new artifact |
| State Machine | Every run and agent invocation has explicit states |
| Retry Policy | Retries are declared, bounded, and audited |
| Audit Trail | Every transition is attributable and replayable for review |

---

## Hard Boundaries

| Boundary | Rule |
|----------|------|
| Knowledge ownership | Customer/local SoR unless ADR says otherwise |
| Execution path | Production multi-agent work through Harness only |
| Compute | Heavy AI in Cloud AI Compute Layer |
| Contracts/schemas | One definition per capability; no forks |
| Change control | Topology/trust/harness changes require ADR |

---

## Workflow — Evaluating an Architecture-Class Proposal

1. **Place it on the diagram.** Which plane(s) does the proposal touch? If it requires an arrow that does not exist above, it is architecture-class.
2. **Check Hard Boundaries.** Does it require crossing a boundary in a way the table above forbids? If yes, it needs an ADR before proceeding, not a workaround.
3. **Check Harness-First Principles.** Does it preserve Agent Contract, Artifact-based Development, Handoff Protocol, Review Gates, Human Approval, Immutable Deliverables, State Machine, Retry Policy, and Audit Trail? A proposal that weakens any of these for convenience is rejected.
4. **File the ADR** (if boundary/topology-changing) per `/docs/adr/README.md`.
5. **Update this document** only after the ADR is accepted, to describe the new shape as current state.
6. **Propagate downstream.** Update `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas` as needed to operationalize the accepted change.

## Decision Rules

1. If a proposal can be fully described using existing planes and boundaries, no ADR is required for the architecture layer (though contract/schema/pipeline changes may still need their own review).
2. If a proposal requires a new plane, a new boundary, or a new cross-plane data flow, an ADR is mandatory before implementation, and this document is not updated until the ADR is accepted.
3. If a proposal would let the Cloud AI Compute Layer become a de facto second Knowledge Plane (e.g., by retaining state beyond the purpose-bound call), it is rejected outright — this is a Hard Boundary violation, not a judgment call.
4. If a proposal would let anything bypass the Harness for production multi-agent work, it is rejected outright per Constitution Article XIII.

## Examples

- **Compliant**: A new agent that scores knowledge quality is placed entirely within the existing Harness → Agent Contracts → Artifacts flow; it reads from and proposes updates to the Knowledge Plane through the standard pipeline. No new plane, no ADR required at the architecture layer.
- **Compliant (ADR required)**: Introducing a secondary, org-hosted Knowledge Plane backend (e.g., for enterprise on-prem deployments) changes the "local-first Knowledge Plane" boundary's implementation options and requires an ADR describing how ownership and revocation are preserved across both backends.
- **Violation**: A "performance optimization" caches full Knowledge Plane content inside the Cloud AI Compute Layer's infrastructure "to avoid re-sending it every call" — this silently turns the Cloud AI Compute Layer into an unauthorized second Knowledge Plane and is rejected.

## Acceptance Criteria

- [ ] Every production data/control flow can be traced onto the diagram in this document without inventing an undocumented arrow.
- [ ] No plane performs a responsibility listed under another plane's "must never do" column.
- [ ] Every accepted ADR that changes a boundary is reflected in this document within the same governance change set that closes the ADR.
- [ ] This document contains zero pipeline-stage-level, contract-field-level, or schema-field-level detail (those belong in lower layers).

## Failure Cases

- Code review discovers a direct Experience-Plane-to-Knowledge-Plane write bypassing the Harness → Critical, revert immediately (Constitution Art. XIII).
- An accepted ADR changes a boundary but this document is never updated → Major, documentation drift (Constitution Art. IV); update immediately.
- A contributor argues informally in a PR thread that "this one case doesn't really need an ADR" for a boundary-crossing change → Major, halt and require the ADR before merge.

## Best Practices

- Keep this document short enough that the diagram remains the primary artifact; push detail down into `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas`.
- When in doubt about whether something is architecture-class, err toward writing the ADR — the cost of an unnecessary ADR is a fraction of the cost of an unreviewed boundary violation.
- Re-draw and re-verify the diagram whenever an ADR changes plane responsibilities, rather than patching prose without checking the diagram still holds.

## Anti-patterns

- Treating this document as a stale onboarding artifact that "everyone already understands" rather than the actual, current-state authority on system shape.
- Adding a new plane informally in a PR description or Slack thread without an ADR, then retrofitting this document to match after the fact.
- Letting `/harness`, `/contracts`, or `/pipelines` documents describe a shape that this document does not corroborate.

---

## Non-Goals (This Document)

- Pipeline stage details → `/pipelines`
- Agent I/O obligations → `/contracts`
- Artifact field definitions → `/artifacts`, `/schemas`
- Retry codes, state enums, audit event shapes → `/harness`
- Tech stack, LangGraph, APIs, application code

---

## References

- [`/CONSTITUTION.md`](../CONSTITUTION.md) — Articles VIII (ADR), X (Local-First Knowledge), XI (Cloud AI Compute), XIII (Harness-First)
- [`/docs/PRODUCT_VISION.md`](./PRODUCT_VISION.md) — the "why" behind these planes
- [`/docs/adr/README.md`](./adr/README.md) — ADR filing process
- [`/harness/HARNESS_SPECIFICATION.md`](../harness/HARNESS_SPECIFICATION.md) — execution law operating inside this shape
- [`/pipelines/knowledge-ingestion.md`](../pipelines/knowledge-ingestion.md) — the canonical pipeline that crosses these planes end-to-end

---

## Evolution

Plane-compatible clarifications (adding Definitions, Examples, Decision Rules, etc. without changing plane responsibilities or boundaries) bump this document's MINOR version. Boundary or plane changes require an ADR plus Constitution Article VIII compliance and bump the MAJOR version.

**End of Architecture v2.1.0**
