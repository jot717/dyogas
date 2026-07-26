# DYOGAS Product Vision

**Version:** 2.0.0
**Status:** Canonical
**Effective:** 2026-07-22
**Owner:** Product + Architecture
**Supersedes:** Product Vision v1.1.0 (completeness expansion; no thesis changes)
**Related:** [`/CONSTITUTION.md`](../CONSTITUTION.md), [`PRODUCT_PRINCIPLES.md`](./PRODUCT_PRINCIPLES.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`ROADMAP.md`](./ROADMAP.md)

---

## Purpose

This document answers, authoritatively, *why DYOGAS exists*. It is the reference every Proposal, ADR, and roadmap phase is checked against when the question is "should we build this at all," as distinct from "how do we build it" (architecture) or "is this the right moment" (roadmap).

## Definitions

| Term | Definition |
|------|------------|
| **Sovereign knowledge** | Knowledge whose ownership, storage location, and access rights remain under the user's/organization's control, revocable at will. |
| **Elastic intelligence** | AI compute capability that scales on demand without requiring the user to sacrifice ownership of the knowledge it operates on. |
| **North Star** | The long-horizon outcome all roadmap phases and product principles are ultimately in service of. |
| **False choice** | A framing, common among AI products, that forces users to pick between centralizing their knowledge in a vendor's cloud or forgoing frontier AI capability. |

## Scope

This document covers: the one-line vision, the problem DYOGAS exists to solve, the North Star, who DYOGAS serves, the product thesis, and explicit non-goals. It does not cover prioritization mechanics (`PRODUCT_PRINCIPLES.md`), system shape (`ARCHITECTURE.md`), or phase sequencing (`ROADMAP.md`) — those are downstream of this document and must not contradict it.

---

## One-Line Vision

DYOGAS is the AI platform where people and organizations keep ownership of their knowledge locally, and harness world-class cloud AI compute without surrendering the source of truth — executed through a disciplined, Harness-first agent operating system.

---

## Why DYOGAS Exists

Today's AI products force a false choice: centralize knowledge in a vendor cloud, or stay local and lose frontier intelligence. DYOGAS rejects that tradeoff for users who need **sovereign knowledge** and **elastic intelligence**. This is not a compliance afterthought bolted onto a cloud-first product — it is the founding constraint the entire architecture (`ARCHITECTURE.md`) and governance model (`CONSTITUTION.md`) are built around.

---

## North Star

Become the default operating layer for AI-augmented work: knowledge lives under user ownership; agents collaborate under contracts, artifacts, and human gates — not as an opaque autopilot.

---

## Who We Serve

| Segment | Core need | Responsibility DYOGAS takes on |
|---------|-----------|----------------------------------|
| Knowledge workers & creators | AI leverage without surrendering corpora | Local-first storage, revocable cloud use |
| Teams & organizations | Shared intelligence with auditability and policy | Audit Trail, tenancy isolation, policy gates |
| Builders on DYOGAS | Stable contracts, artifacts, and compute boundaries | Versioned contracts/schemas/pipelines that don't move under them |

## Responsibilities

| Role | Responsibility under this Vision |
|------|-------------------------------------|
| **Product Owner** | Rejects proposals that cannot be traced to a segment need above. |
| **Proposal Agent / Proposal Builder** | Cites the specific segment and need a proposal serves (Constitution Art. XII). |
| **Architecture Owner** | Ensures `ARCHITECTURE.md`'s planes remain faithful instruments of this vision — e.g., the Knowledge Plane must actually deliver "sovereign knowledge," not merely claim to. |

---

## Product Thesis

1. Knowledge is local-first.
2. Intelligence is cloud-scale and purpose-bound.
3. Work is Harness-native: pipelines, immutable artifacts, review gates, human approval.
4. Trust is the product.

---

## Workflow — Applying This Vision

1. **Before drafting a Proposal**, check it against "Who We Serve" — name the segment and the specific need.
2. **Before accepting a Proposal**, check it against the Product Thesis — does it preserve local-first knowledge, purpose-bound cloud compute, Harness-native execution, and visible trust?
3. **Before shipping anything user-facing**, check it against "What We Explicitly Are Not" — if it resembles one of those anti-patterns, stop and escalate rather than proceed.
4. **When a roadmap phase is proposed**, verify it moves DYOGAS toward the North Star, not merely toward a shippable-looking milestone.

## Decision Rules

1. A feature that serves no segment listed in "Who We Serve" does not proceed without first amending this document (with Decision Log + human approval) to add that segment — features do not get to redefine who DYOGAS serves by precedent.
2. A feature that requires permanently centralizing user knowledge without revocation violates Product Thesis #1 and is rejected regardless of business upside, mirroring Constitution Article X.
3. A feature whose cloud AI usage is unbounded or not purpose-bound violates Product Thesis #2 and requires redesign before proceeding, mirroring Constitution Article XI.
4. A feature that lets an agent act consequentially without contract, artifact, or gate violates Product Thesis #3 and is rejected per Constitution Article XIII.

## Examples

- **Compliant**: A feature letting teams share an approved knowledge document with audit-visible access logs serves the "Teams & organizations" segment's need for "shared intelligence with auditability" — it proceeds to principles/roadmap evaluation.
- **Violation**: A feature that silently trains a shared model on all users' private knowledge to "improve answers for everyone" violates Product Thesis #1 (local-first) and Article X — it is rejected outright without further roadmap consideration.

## Acceptance Criteria

- [ ] Every shipped feature can be traced to a segment in "Who We Serve" and a clause in the Product Thesis.
- [ ] No feature contradicts any item in "What We Explicitly Are Not."
- [ ] This document's language is consistent with `PRODUCT_PRINCIPLES.md` and `ARCHITECTURE.md` — no contradictory ownership or trust claims across the three.

## Failure Cases

- A feature ships that cannot be mapped to any segment need → Major, treat as an Article XII (real pain point) failure; deprecate or re-justify.
- Marketing or product copy describes DYOGAS as "your AI cloud" in a way that implies centralized ownership, contradicting this Vision → Major, correct immediately — trust language drift is a Product Principle violation ("Trust Visible").

## Best Practices

- Re-read this document before writing any Proposal's pain statement — it is the fastest check against building something DYOGAS should not build.
- When a segment's need evolves, amend this document explicitly rather than letting practice silently drift from stated vision.

## Anti-patterns

- Treating "vision" as marketing copy disconnected from actual proposal review — this document is binding evaluation criteria, not a slogan.
- Justifying a feature by analogy to a competitor's product without checking it against this Vision's specific constraints.

---

## What We Explicitly Are Not

- Not a generic chatbot wrapper
- Not a vendor that monetizes user knowledge by default
- Not a prompt zoo without contracts
- Not an architecture that ships by accident

---

## References

- [`/CONSTITUTION.md`](../CONSTITUTION.md) — Articles X (Local-First Knowledge), XI (Cloud AI Compute), XII (Real Pain Point), XIII (Harness-First)
- [`PRODUCT_PRINCIPLES.md`](./PRODUCT_PRINCIPLES.md) — how this vision becomes prioritization decisions
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — how this vision becomes system shape
- [`ROADMAP.md`](./ROADMAP.md) — how this vision becomes sequenced phases

---

## Versioning

Material vision changes require Decision Log + human approval and a version bump. Additive clarification (Definitions, Examples, Decision Rules) that does not change the one-line vision, North Star, segments, or thesis bumps the MINOR version; any change to those four bumps MAJOR.

**End of Product Vision v2.0.0**
