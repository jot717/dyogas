# DYOGAS Documentation Index

**Version:** 2.0.0
**Status:** Canonical Map — Product Intent & High-Level Architecture
**Effective:** 2026-07-22
**Owner:** Product + Architecture
**Related:** [`/CONSTITUTION.md`](../CONSTITUTION.md), [`/harness/`](../harness/), [`/engineering/`](../engineering/)

---

## Purpose

`/docs` is the authoritative home for **why DYOGAS exists, what it will and will not become, its high-level system shape, and how its governance evolves over time via ADRs.** It is deliberately silent on execution mechanics (that is `/harness`), agent obligations (`/contracts`), and implementation (application code does not live in this repository at all).

This index exists so that any reader — human or agent — can find the right document in one hop instead of guessing.

## Definitions

| Term | Definition |
|------|------------|
| **Product intent** | The reasoning behind what DYOGAS is for and who it serves, independent of how it is executed technically. |
| **High-level architecture** | The system's plane structure and hard boundaries, without stage-level, contract-level, or schema-level detail. |
| **ADR** | Architecture Decision Record — an immutable, numbered decision record under `/docs/adr`. |
| **Canonical** | The single authoritative version of a document; superseding it requires the amendment workflow defined in the document itself and in `CONSTITUTION.md`. |

## Scope

Applies to vision, product principles, roadmap phasing, high-level architecture, and the ADR process. Does **not** cover: pipeline stage mechanics, agent contract fields, artifact schemas, or engineering process steps — those are covered by `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas`, and `/engineering` respectively.

---

## Document Map

| Document | Role |
|----------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | High-level system shape (Harness-first): planes, boundaries, non-goals |
| [PRODUCT_VISION.md](./PRODUCT_VISION.md) | Why DYOGAS exists, who it serves, what it is not |
| [PRODUCT_PRINCIPLES.md](./PRODUCT_PRINCIPLES.md) | Product decision principles and the prioritization litmus |
| [ROADMAP.md](./ROADMAP.md) | Governance phases and their exit criteria |
| [adr/](./adr/) | Architecture Decision Records — immutable, numbered, accepted decisions |

## Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Product + Architecture (Owner)** | Keeps this index and the documents it maps current; approves changes to vision/principles/roadmap. |
| **Any Contributor** | Reads `ARCHITECTURE.md` and `PRODUCT_VISION.md` before proposing a feature or architecture-class change. |
| **ADR authors** | File under `/docs/adr` following the process in `adr/README.md`; never edit an accepted ADR in place. |

---

## Workflow — Using This Layer

1. **Understand why** something should exist → read `PRODUCT_VISION.md` and `PRODUCT_PRINCIPLES.md`.
2. **Understand where** something fits → read `ARCHITECTURE.md` for plane/boundary placement.
3. **Understand when** something is in scope → read `ROADMAP.md` for current phase exit criteria.
4. **Record a boundary-class decision** → file an ADR per `adr/README.md`, then reflect any resulting high-level shape change in `ARCHITECTURE.md`.
5. **Escalate a conflict** between vision/principles/architecture/roadmap → resolve per `CONSTITUTION.md` Hierarchy of Authority; ADRs outrank `docs/` narrative documents.

## Decision Rules

1. A proposal that cannot be justified by `PRODUCT_VISION.md` or `PRODUCT_PRINCIPLES.md` does not proceed past Roadmap phase gating, regardless of technical merit.
2. A high-level architecture change (new plane, new boundary) requires an ADR **before** `ARCHITECTURE.md` is updated to describe it as current state.
3. Roadmap phase advancement requires all listed exit criteria to be checked, not "mostly done."

## Examples

- **Compliant**: A proposal to add a new "Cloud AI Compute" workload type is first checked against `PRODUCT_PRINCIPLES.md` ("Local Truth, Cloud Muscle"), then, if it changes trust boundaries, gets an ADR before `ARCHITECTURE.md` reflects it.
- **Violation**: `ARCHITECTURE.md` is edited to describe a new plane that was never proposed via ADR — this is reverted per Constitution Article VIII.

## Acceptance Criteria

- [ ] Every document in the Document Map exists, is versioned, and links back to `CONSTITUTION.md`.
- [ ] `ARCHITECTURE.md` never describes a plane/boundary that lacks a corresponding accepted ADR (where the boundary is non-trivial).
- [ ] `ROADMAP.md` phase exit criteria are checkable, not aspirational prose.

## Failure Cases

- `PRODUCT_VISION.md` and `PRODUCT_PRINCIPLES.md` contradict each other on ownership language → Major, reconcile immediately.
- An ADR is accepted but `ARCHITECTURE.md` is never updated to reflect it → Major, treat as documentation drift under Constitution Article IV.

## Best Practices

- Keep `docs/` narrative documents short and durable; push volatile detail down into `/harness`, `/contracts`, `/pipelines` where it belongs.
- Cross-link every `docs/` document back to `CONSTITUTION.md` and forward to the execution-layer document that operationalizes it.

## Anti-patterns

- Using `docs/` to describe implementation detail "temporarily" until a proper spec is written elsewhere.
- Treating the Roadmap as a fixed calendar rather than an exit-criteria-gated sequence.

---

## Non-Goals (This Layer)

- Pipeline stage mechanics → `/pipelines`
- Agent I/O obligations → `/contracts`
- Artifact field definitions and schemas → `/artifacts`, `/schemas`
- Retry codes, state machine, audit event shapes → `/harness`
- Engineering lifecycle steps → `/engineering`
- Application code, tech stack, UI, model vendor selection

## References

Root law: [`/CONSTITUTION.md`](../CONSTITUTION.md)
Execution law: [`/harness/`](../harness/)
Engineering process: [`/engineering/`](../engineering/)
Contracts/Pipelines/Artifacts/Schemas: [`/contracts/`](../contracts/) · [`/pipelines/`](../pipelines/) · [`/artifacts/`](../artifacts/) · [`/schemas/`](../schemas/)

**End of Documentation Index v2.0.0**
