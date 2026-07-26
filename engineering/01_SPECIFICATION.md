# 01 —Specification & Architecture Review

**Version:** 2.2.0
**Status:** Binding —Engineering Process Law
**Effective:** 2026-07-22
**Lifecycle stage(s):** Specification —Architecture Review
**Owner:** Product Owner Agent (Specification content) · Chief Architect Agent (Architecture Review verdict)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. IV, VI, VIII, XII  [/docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)  [/docs/adr](../docs/adr)  [02_BACKLOG.md](./02_BACKLOG.md)  [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md)  [13_DOCUMENTATION.md](./13_DOCUMENTATION.md)

This document has two parts covering two lifecycle stages that always run in sequence: **A. Specification** and **B. Architecture Review**. No item advances to Backlog without both parts complete.

---

## A. Specification

### A.1 Purpose

Translate a real, evidenced pain point into a precise, testable, documented intent **before** any implementation work is scheduled. A Specification exists so that Implementation never has to guess what "correct" means, and so Constitution Art. XII ("every feature must solve a real pain point") is enforced at the earliest possible point —before a single line of design is drawn.

### A.2 Definitions

| Term | Definition |
|---|---|
| **Pain statement** | A concrete description of who is hurt, how, how often, and what they currently do instead (the workaround). |
| **Spec** | The written Specification document: problem, goals, non-goals, success metrics, interfaces touched, risks, open questions. |
| **Interface impact list** | The enumerated set of `/contracts`, `/pipelines`, `/artifacts`, `/schemas`, or `/docs` surfaces the proposed work would touch. |
| **Non-goal** | An explicit statement of what this Spec will **not** attempt, to prevent silent scope inflation later. |
| **Success metric** | A measurable, falsifiable signal that proves the pain was actually reduced (not a vanity metric). |
| **Spec Author** | Whoever drafts the Spec —a human Product Owner, Tech Lead, or an AI agent operating under Human Approval before the Spec is accepted. |

### A.3 Scope

**In scope:** any change to product behavior, agent behavior, contracts, pipelines, artifacts, schemas, harness rules, or public interfaces that is non-trivial (i.e., not a pure typo/formatting fix). **Out of scope:** the Architecture Review verdict process itself (Part B), and pure editorial fixes to existing docs with no behavior change (those still require review per [13_DOCUMENTATION.md](./13_DOCUMENTATION.md) but not a full Spec).

### A.4 Responsibilities

| Role | Responsible for |
|---|---|
| **Requester** | Surfacing the pain with evidence; may be any human or an AI agent's proposal artifact (e.g., Proposal Agent output) subject to Human Approval before it becomes a Spec. |
| **Spec Author** | Drafting the Spec document to the template in A.9. |
| **Product Owner** | Approving product intent, success metrics, non-goals. |
| **Tech Lead** | Acknowledging technical feasibility and flagging interface impact. |
| **Chief Systems Architect** | Consulted when the Interface Impact List suggests boundary/trust/topology change (feeds Part B). |

### A.5 Who Owns It

**Product Owner Agent** owns Specification content readiness for the approval chain. The **Spec Author** (human requester or AI under process) owns drafting quality. Acceptance requires the full Engineering Agent chain, then Founder business approval — the Founder does not act as Product Owner.

### A.6 Who Approves It

**AI-Native Engineering Agent Approval** (see [README.md](./README.md) §2a):

1. **Product Owner Agent** — product completeness  
2. **Chief Architect Agent** — system architecture fit  
3. **Tech Lead Agent** — technical feasibility  
4. **Engineering Manager Agent** — process compliance  
5. **Architecture Reviewer Agent** — standards & quality  
6. **Founder Approval** — business decision only (after all Engineering Agents approve)

Each Engineering Agent must emit a review artifact (`approve` | `reject`). Any reject returns work to Specification drafting (previous stage). The Founder never replaces an Engineering Agent and never approves to skip a rejected agent.


### A.7 Required Inputs

1. Pain statement: who hurts, how, frequency, current workaround.
2. Requester identity (attributable —not "the team thinks").
3. Links to related `/docs`, `/contracts`, `/pipelines`, `/artifacts` that might already solve this (duplicate check, Constitution Art. VI).
4. Prior Decision Log / ADR references if this area has history.
5. Alignment check against `/docs/PRODUCT_PRINCIPLES.md` and `/docs/PRODUCT_VISION.md`.

### A.8 Required Outputs

1. An accepted Specification document (see template A.9).
2. A trace id linking to the future Backlog candidate.
3. An Interface Impact List (feeds Architecture Review).

### A.9 Mandatory Artifacts

| Artifact | Location / form | Mandatory? |
|---|---|---|
| Spec record | Issue/RFC labeled `spec` in the team's single tracker (tool selection is a Decision Log entry, not a `/engineering` concern) | Yes |
| Pain evidence | Attached or linked in the Spec (user quotes, incident count, support ticket ids, usage data) | Yes |
| Interface impact list | Explicit list of `/contracts`, `/schemas`, `/pipelines`, `/docs` files potentially touched | Yes |
| Duplicate-check note | One line confirming no existing capability already solves this, or naming the migration ADR if consolidating | Yes |

**Specification template (minimum fields):**

```markdown
# Spec: <short title>

Requester: <name/role>            Spec Author: <name/role>
Status: draft | accepted | rejected

## Pain Statement
Who: ...
How it hurts: ...
Frequency: ...
Current workaround: ...

## Goals
1. ...

## Non-Goals
1. ...

## Success Metrics
- Metric: ... | Target: ... | Measurement method: ...

## Interfaces Touched
- /contracts/agents/<...>.md
- /schemas/artifacts/<...>.schema.json

## Risks
- ...

## Open Questions
- ...

## Duplicate Check
No existing capability covers this because ... | OR | Consolidates with <item/ADR>.
```

### A.10 Workflow

1. **Requester** surfaces the pain with evidence (support ticket, usage log, direct observation, or an AI agent's Proposal artifact per [`/artifacts/proposal.md`](../artifacts/proposal.md)).
2. **Spec Author** drafts the Spec using the template in A.9, running the duplicate check against `/contracts`, `/pipelines`, `/artifacts`, `/schemas` first.
3. **Spec Author** states measurable Success Metrics and explicit Non-Goals —a Spec without both is incomplete, not "good enough."
4. **Spec Author** enumerates the Interface Impact List.
5. **Tech Lead** reviews for feasibility and confirms/expands the Interface Impact List.
6. **Product Owner** reviews pain evidence against `/docs/PRODUCT_PRINCIPLES.md`; rejects if the pain is not real or not evidenced (Constitution Art. XII).
7. Engineering Agent Approval Chain runs (PO → Chief Architect → Tech Lead → EM → Architecture Reviewer); each emits a review artifact.
8. On full Engineering Agent approval, **Founder Approval** (business only) may set Status: `accepted`.
9. Accepted Spec + Interface Impact List moves to **Architecture Review (Part B)**.
10. Any Engineering Agent `reject` returns to Spec drafting — Founder must not override.

### A.11 Decision Rules

| Situation | Rule |
|---|---|
| Pain has no evidence, only opinion | Reject; return to Requester for evidence gathering. |
| Interface Impact List is empty and touches only UI copy/docs | Skip Architecture Review Part B; go directly to Backlog with `no_arch_impact` auto-recorded. |
| Two Specs address the same pain differently | Product Owner picks one lineage; the other is closed with a link, not silently duplicated. |
| An AI agent proposes the Spec | Treat identically to a human draft; acceptance still requires human Product Owner sign-off. |
| Success metric is "users will love it" | Reject —not measurable. Require a falsifiable metric (e.g., "support tickets tagged X drop 50% within 2 sprints of release"). |

### A.12 Review Checklist

- [ ] Pain statement names who, how, frequency, and current workaround.
- [ ] Success metrics are measurable and falsifiable.
- [ ] Non-goals are explicit.
- [ ] Duplicate check performed against `/contracts`, `/pipelines`, `/artifacts`, `/schemas`.
- [ ] Interface Impact List is complete to the reviewer's knowledge.
- [ ] No fabricated requirements (nothing asserted that the Requester/Spec Author cannot support with evidence).
- [ ] Security/ownership/egress impacts flagged if plausible.

### A.13 Exit Checklist

- [ ] Product Owner Agent review artifact = `approve`
- [ ] Chief Architect Agent review artifact = `approve`
- [ ] Tech Lead Agent review artifact = `approve`
- [ ] Engineering Manager Agent review artifact = `approve`
- [ ] Architecture Reviewer Agent review artifact = `approve`
- [ ] Founder Approval recorded (business only)
- [ ] Spec Status: `accepted`
- [ ] Trace id exists for the future Backlog item
- [ ] Interface Impact List attached for Architecture Review


### A.14 Examples

**Example 1 (accepted).** Pain: "Knowledge Review Agent operators cannot see why a proposal was auto-flagged `needs_review`; they re-derive it manually, costing ~10 min/proposal, ~40 proposals/week." Success metric: "median time-to-decision on flagged proposals drops from 10 min to 2 min within 2 sprints of shipping a rationale field in the review UI mock spec." Non-goal: "does not change the scoring rubric itself." Interface impact: `/artifacts/human-review-decision.md`, `/schemas/artifacts/human-review-decision.schema.json`. Accepted.

**Example 2 (rejected).** Pain: "It would be cool if agents had a dashboard." No named sufferer, no frequency, no workaround, no metric. Rejected at A.10 step 6 for lack of evidence (Constitution Art. XII).

### A.15 Acceptance Criteria

- Written spec accepted with Status: `accepted`.
- Success metrics and non-goals are explicit and testable.
- DoR checklist tracking has started (linked, not yet complete —full DoR is enforced at Backlog?Sprint per [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md)).
- Architecture Review is triggered whenever the Interface Impact List is non-empty.

### A.16 Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| No pain evidence | Spec says "would be nice" with no data | Reject at review; do not accept |
| Spec contradicts Constitution/Harness/contracts | e.g., proposes agent self-approval | Reject; cite the violated Article |
| Duplicate of existing SoR capability, no migration ADR | Same capability already exists under a contract | Reject; require a migration ADR if consolidation is intended |
| Unmeasurable "success" | "Users will be happier" | Reject; require falsifiable metric |
| Spec accepted then silently rewritten mid-sprint | Discovery invalidates original pain/scope | Must re-open Spec approval (see [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md) Spec drift) |

### A.17 Rollback Procedure

If a Spec is discovered to be wrong or evidence-fabricated **after** acceptance but **before** Sprint commitment: Product Owner sets Status back to `draft`, removes it from Backlog priority, and logs why in the Decision Log. If already Sprint-committed, follow [03_SPRINT.md](./03_SPRINT.md) scope-change rules —do not silently abandon an item without a log entry.

### A.18 Best Practices

1. Write the pain statement before you have any idea of the solution —this prevents solution-shaped bias.
2. Keep the Spec to one page; move implementation detail to Task Breakdown.
3. State non-goals even when they feel obvious —they are what prevents scope creep three weeks later.
4. Reuse existing artifact/contract vocabulary rather than inventing new terms.

### A.19 Anti-patterns

- **Solution masquerading as pain**: "We need a caching layer" is a solution; "search latency causes 20% of users to abandon" is a pain.
- **Metric laundering**: picking a metric you already know will look good regardless of whether the pain is fixed.
- **Spec-by-committee paralysis**: Specification is not the place to design the implementation; keep it at intent-level.

### A.20 Metrics

| Metric | Definition | Target |
|---|---|---|
| Time-to-approved-spec | Days from pain surfaced to Status: `accepted` | Trending down, no fixed SLA |
| % specs rejected at Architecture Review | Rejected/adr_required  total | Trending down as Spec Authors learn boundary awareness |
| % specs that churn >30% after Sprint commitment | Scope-change log entries  total accepted | < 10% |
| Principle-litmus fail rate | Specs rejected for lacking real pain evidence  total submitted | Trending down |

---

## B. Architecture Review

### B.1 Purpose

Decide whether an accepted Specification changes system boundaries, trust boundaries, Harness topology, contracts, or schemas —and if so, require an ADR **before** the item can be committed to a Sprint. This is the enforcement point for Constitution Art. VIII.

### B.2 Definitions

| Term | Definition |
|---|---|
| **Verdict** | The Architecture Review outcome: `no_arch_impact`, `adr_required`, or `rejected`. |
| **Boundary change** | Any change to who owns data, what trusts what, where compute executes, or how planes communicate. |
| **Topology change** | Any change to the shape of the Harness pipeline graph, agent roles, or contract surface. |

### B.3 Scope

Applies to every accepted Specification with a non-empty Interface Impact List. Specs touching only prose/UI-copy with an empty Interface Impact List are exempt and auto-recorded `no_arch_impact`.

### B.4 Responsibilities

| Role | Responsible for |
|---|---|
| **Chief Systems Architect (or delegate)** | Rendering the verdict; owning the review record. |
| **Tech Lead** | Supplying implementation-level detail needed for the verdict. |
| **Security reviewer (as needed)** | Flagging trust-boundary or egress concerns. |

### B.5 Who Owns It

**Chief Systems Architect** (or an explicitly named delegate —delegation itself is a Decision Log entry, not informal).

### B.6 Who Approves It

Architecture Review verdict is rendered by the **Chief Architect Agent** and independently reviewed by the **Architecture Reviewer Agent**, with remaining Engineering Agents as required by §2a for material items. **Founder Approval** is business-only after Engineering Agents approve. The Founder is not the Architecture Reviewer.

A `rejected` verdict returns to Specification. An `adr_required` verdict blocks Implementation until the ADR is accepted through the Engineering Agent chain (+ Founder business approval when material).


### B.7 Required Inputs

1. Accepted Specification (Part A).
2. Interface Impact List.
3. `/docs/ARCHITECTURE.md`, `/harness/HARNESS_SPECIFICATION.md`, `/contracts`, `/schemas` as reference material.

### B.8 Required Outputs

An Architecture Review record: verdict, rationale, and —if `adr_required` —the ADR number and its current status.

### B.9 Mandatory Artifacts

| Artifact | Form |
|---|---|
| Review record | ADR comment thread or a review issue linked from the Spec |
| ADR (if `adr_required`) | New file under `/docs/adr/NNNN-*.md`, drafted per that directory's template |
| Decision Log entry | Required for any verdict other than a trivial `no_arch_impact` |

### B.10 Workflow

1. Chief Systems Architect (or delegate) receives the accepted Spec + Interface Impact List.
2. Checks each impacted surface against the boundary/topology/trust criteria in B.2.
3. Checks specifically: does this change local-first knowledge ownership (Constitution Art. X)? Does this change the Cloud AI Compute trust boundary (Art. XI)? Does this introduce a duplicate system (Art. VI)?
4. Renders one of three verdicts:
   - `no_arch_impact` —proceed to Backlog directly.
   - `adr_required` —an ADR must be drafted and accepted before Implementation may start; the item may still enter Backlog and even Sprint planning discussion, but cannot be committed for Implementation until the ADR is accepted.
   - `rejected` —architecture-level objection; item returns to Specification for rework or is closed.
5. Records the verdict and rationale in the review record.
6. Logs a Decision Log entry for any verdict that is not a trivial `no_arch_impact` on a low-risk item.
7. If `adr_required`, drafts or assigns the ADR, which follows `/docs/adr` process to `accepted`.

### B.11 Decision Rules

| Situation | Rule |
|---|---|
| Impact list touches a contract's I/O shape | `adr_required` at minimum if it changes an existing agent's obligations; new agents always require an ADR per Constitution Art. VIII topology clause. |
| Impact list touches only a pipeline's non-authoritative internal detail | May qualify `no_arch_impact` if no trust/topology change —Architect discretion, but must state rationale. |
| Uncertain whether it is boundary-changing | Default to `adr_required` —fail closed on ambiguity (Harness Spec 1, belief 7). |
| ADR already exists covering this exact change | Reference it; no new ADR needed, but review record must cite it. |

### B.12 Review Checklist

- [ ] Every impacted surface in the Interface Impact List has been individually assessed.
- [ ] Local-first ownership boundary explicitly checked.
- [ ] Cloud AI Compute trust boundary explicitly checked.
- [ ] Duplicate-system check performed (Art. VI).
- [ ] Verdict rationale is written, not just the verdict label.

### B.13 Exit Checklist

- [ ] Verdict recorded: `no_arch_impact` | `adr_required` | `rejected`.
- [ ] If `adr_required`: ADR drafted and its path linked, with a tracked path to acceptance before Implementation.
- [ ] Decision Log entry filed for material verdicts.
- [ ] Spec updated with the verdict and ADR link if applicable.

### B.14 Examples

**Example 1 —`no_arch_impact`.** A Spec adds a new field `rationale_note` to the human-review-decision artifact's optional metadata, already permitted by the existing schema's additive-extension policy. No new trust boundary. Verdict: `no_arch_impact`.

**Example 2 —`adr_required`.** A Spec proposes letting the Embedding Agent call a third-party managed vector database outside DYOGAS's current Cloud AI Compute boundary. This is a trust-boundary expansion under Constitution Art. XI. Verdict: `adr_required`; ADR-0032 drafted, reviewed, accepted; only then does the item proceed to Backlog prioritization for Implementation.

**Example 3 —`rejected`.** A Spec proposes a second, parallel "fast-path" Knowledge Review that bypasses Human Approval for "trusted" sources. This directly violates Constitution Art. III. Verdict: `rejected`.

### B.15 Acceptance Criteria

- Verdict is one of the three defined values, with rationale.
- If `adr_required`, the ADR path is scheduled and tracked before the item can be marked Implementation-ready.
- Decision Log entry exists for material verdicts.

### B.16 Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Spec proceeds to Implementation while `adr_required` unmet | Someone started coding anyway | Stop work; revert if merged; treat as process incident; ADR must complete first |
| Silent topology change discovered later | A PR quietly added a new agent role with no contract | Immediate incident review; retroactive ADR; possible revert |
| Verdict rendered without rationale | Review record just says "adr_required" | Reject the review record; require rationale before it counts as complete |

### B.17 Rollback Procedure

If a verdict is found to be wrong after Backlog entry (e.g., `no_arch_impact` should have been `adr_required`): re-open Architecture Review immediately, freeze the item's progression past its current stage, log the correction in the Decision Log, and require the ADR before further advancement.

### B.18 Best Practices

1. Assess the Interface Impact List surface-by-surface; do not render a single verdict for a bundle of unrelated changes —split the Spec if it bundles unrelated boundary changes.
2. When in doubt, choose `adr_required` —the cost of an unnecessary ADR is far lower than an unreviewed boundary change.
3. Write rationale for humans unfamiliar with the change, not just for yourself.

### B.19 Anti-patterns

- **Rubber-stamp `no_arch_impact`**: rendering the easy verdict to unblock a team under deadline pressure.
- **ADR-as-formality**: drafting an ADR with no real alternatives analysis just to check a box.
- **Verdict shopping**: resubmitting the same Spec with different wording hoping for a different verdict without addressing the actual boundary concern.

### B.20 Metrics

| Metric | Definition | Target |
|---|---|---|
| % specs with Architecture Review completed before sprint commit | Reviewed  total impacted specs | 100% |
| ADR lead time | Days from `adr_required` verdict to ADR `accepted` | Trending down, tracked per ADR |
| Escaped architecture defects | Boundary/trust violations discovered post-release that should have been caught here | 0 |

---

## Stage Handoff

`Specification` (accepted) + `Architecture Review` (verdict recorded, ADR path resolved or in progress) —**Backlog** ([02_BACKLOG.md](./02_BACKLOG.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md) —Art. IV (Documentation First), Art. VI (No Duplicate Systems), Art. VIII (ADR Required), Art. X (Local-First Ownership), Art. XI (Cloud AI Compute), Art. XII (Real Pain Point)
- [/docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- [/docs/adr](../docs/adr)
- [/docs/PRODUCT_PRINCIPLES.md](../docs/PRODUCT_PRINCIPLES.md)
- [02_BACKLOG.md](./02_BACKLOG.md)
- [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md)

**End of 01 —Specification & Architecture Review v2.0.0**
