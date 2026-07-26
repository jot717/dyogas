# 02  EBacklog

**Version:** 2.2.0
**Status:** Binding  EEngineering Process Law
**Effective:** 2026-07-22
**Lifecycle stage:** Backlog
**Owner:** Product Owner (priority) · Engineering Manager / Tech Lead (capacity & risk)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. VI, VII, XII · [01_SPECIFICATION.md](./01_SPECIFICATION.md) · [03_SPRINT.md](./03_SPRINT.md) · [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md) · [/docs/ROADMAP.md](../docs/ROADMAP.md)

---

## 1. Purpose

Maintain a **single, prioritized inventory** of ready-enough work that advances DYOGAS's roadmap without shadow lists, personal spreadsheets, or vanity items. The Backlog is where accepted Specifications become sequenced, comparable units of work. It exists so that "what should we build next" has one authoritative answer.

## 2. Definitions

| Term | Definition |
|---|---|
| **Backlog item** | A tracked unit of work with a type, priority, estimate band, and links to its Spec and Architecture Review verdict. |
| **Single Backlog** | The one authoritative tracker for prioritized work (Constitution Art. I)  Eno parallel spreadsheets, chat pins, or personal TODO lists count as authoritative. |
| **Type** | One of `feature`, `fix`, `chore`, `docs`, `debt`, `security`. |
| **Estimate band** | A coarse sizing (e.g., XS/S/M/L/XL or story points) sufficient for capacity planning  Enot a commitment to exact hours. |
| **Aging** | How long an item has sat in the Backlog without movement; used to detect starvation, especially of security items. |
| **Priority rationale** | A short, explicit note on the item stating why it ranks where it ranks. |

## 3. Scope

Every accepted Specification with a recorded Architecture Review verdict enters the Backlog. Purely internal chores below a triviality threshold (defined by team ADR, e.g., "typo fixes") may skip full Spec but still enter the Backlog as `chore` for visibility  Ethey do not get a private, untracked existence.

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Product Owner** | Setting and defending priority order; ensuring `feature` items have a pain/metric link. |
| **Tech Lead / Engineering Manager** | Flagging capacity and risk; blocking items that lack DoR or a pending required ADR. |
| **Requester/Spec Author** | Ensuring the item's Spec and Architecture Review links are attached before it can be prioritized for a Sprint. |
| **AI agents** | May propose backlog items (e.g., via a Proposal artifact) but may not set final priority  Ethat is a human decision (Constitution Art. III). |

## 5. Who Owns It

**Product Owner** owns the Backlog's priority order and content authority. **Tech Lead** co-owns readiness gating.

## 6. Who Approves It

Approvals follow [README.md](./README.md) §2a: Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) each emit review artifacts; **Founder Approval** is business-only after all required Engineering Agents approve. The Founder never replaces an Engineering Agent. Any agent reject returns to the previous stage.


## 7. Required Inputs

1. Accepted Specification + Architecture Review record (from [01_SPECIFICATION.md](./01_SPECIFICATION.md)).
2. Roadmap phase constraints from `/docs/ROADMAP.md`.
3. Current capacity and risk signals (open incidents, on-call load, security SLA status).

## 8. Required Outputs

A Backlog item with: priority rank, type, estimate band, links to Spec/Architecture Review, and dependency/ADR-predecessor links.

## 9. Mandatory Artifacts

| Artifact | Form | Mandatory? |
|---|---|---|
| Backlog item | Single tracker SoR entry (tool chosen by team-tooling ADR; law binds regardless of tool) | Yes |
| Priority rationale | Short field/comment on the item | Yes |
| Dependency/ADR-predecessor links | Explicit links, not prose references buried in a comment thread | Yes when applicable |

## 10. Workflow

1. Spec Author or Product Owner creates the Backlog item immediately after Architecture Review renders a verdict.
2. Item is labeled with its **type** (`feature` | `fix` | `chore` | `docs` | `debt` | `security`).
3. If verdict was `adr_required`, the item is linked to the ADR and marked blocked-until-ADR-accepted for Implementation purposes (it may still be discussed/estimated).
4. Product Owner assigns an initial priority rank with a one-line rationale.
5. Tech Lead reviews capacity implications and flags risk (e.g., "requires the one engineer who understands the Embedding Agent, currently on leave").
6. Backlog is groomed on a regular cadence (recommended weekly): re-rank, check aging, check security SLA compliance, close stale/duplicate items.
7. Items are pulled into Sprint Planning only when they meet [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md) in full.

## 11. Decision Rules

| Situation | Rule |
|---|---|
| Two items solve overlapping pain | Product Owner merges or explicitly sequences them; no silent duplicate ranking. |
| A `security` item ages past policy SLA | Escalate automatically; Tech Lead cannot deprioritize below the SLA floor without a Decision Log exception. |
| An item has no pain/metric link and type is `feature` | Block from ranking until [01_SPECIFICATION.md](./01_SPECIFICATION.md) is completed properly. |
| Roadmap phase constraint conflicts with a high-priority item | Product Owner decides trade-off explicitly; log the decision if material. |
| AI agent proposes a reorder | Treated as a proposal only; Product Owner must explicitly accept before rank changes. |

## 12. Review Checklist

- [ ] Item has exactly one authoritative entry (no duplicate in a second tracker).
- [ ] Type is set and correct.
- [ ] `feature` items link a pain statement and success metric.
- [ ] Dependencies and ADR predecessors are linked, not just mentioned in text.
- [ ] Priority rationale is present and specific (not "high" with no reason).

## 13. Exit Checklist

- [ ] Item ranked in the Single Backlog with a stated rationale.
- [ ] Type labeled.
- [ ] Dependencies/ADR predecessors linked.
- [ ] DoR evaluation has at least been started (full pass required before Sprint pull, see [15](./15_DEFINITION_OF_READY.md)).

## 14. Examples

**Example 1.** `ENG-102` "Add rationale_note field to human-review-decision artifact"  Etype `feature`, pain-linked to Spec `SPEC-77`, Architecture Review `no_arch_impact`, estimate `S`, priority rank 4, rationale: "unblocks Knowledge Review Agent operator efficiency work committed for this quarter."

**Example 2.** `ENG-118` "Rotate Cloud AI Compute API keys quarterly"  Etype `security`, no pain-link required (security items are exempt from the pain-metric requirement per policy, but still need a stated risk rationale), aging tracked against the 90-day SLA.

## 15. Acceptance Criteria

- Item ranked in the Single Backlog.
- Type labeled.
- Dependencies and ADR predecessors linked.
- Candidate for Sprint only if DoR is fully met ([15](./15_DEFINITION_OF_READY.md)).

## 16. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Multiple authoritative backlogs | Two teams rank work in different tools | Consolidate into one immediately (Constitution Art. VI); log the consolidation decision |
| Implementation started from untracked work | Code changes reference no Backlog id | Halt; retroactively file the item; treat as process incident if repeated |
| Feature without pain link | `feature` item has no Spec | Reject ranking; return to Specification |
| Security item starved | Aging exceeds SLA with no exception logged | Escalate to Tech Lead/CEO delegate immediately |

## 17. Rollback Procedure

If an item is discovered to have been prioritized incorrectly (e.g., duplicate, invalid pain claim), Product Owner immediately re-ranks or closes it, links the reason, and  Eif the item had already progressed to Sprint  Efollows the [03_SPRINT.md](./03_SPRINT.md) scope-change procedure to remove it cleanly rather than abandoning it silently.

## 18. Best Practices

1. Groom the Backlog on a fixed cadence; stale items rot into false priorities.
2. Write priority rationale for a stranger, not for yourself  Eit should make sense six months later.
3. Keep `security` and `debt` items visible in the same list as `feature` work; do not maintain a separate "someday" list.
4. Close items that are no longer worth doing  Ean honest "won't do" beats an eternal low-priority zombie item.

## 19. Anti-patterns

- **Shadow spreadsheet**: a manager's private prioritization list that quietly overrides the Single Backlog.
- **Priority inflation**: everything marked "high" until the label is meaningless.
- **Silent reprioritization**: reordering the top of the backlog in a meeting with no rationale recorded.
- **Feature laundering**: labeling a feature as `chore` to skip the pain-link requirement.

## 20. Metrics

| Metric | Definition | Target |
|---|---|---|
| Aging of top-N items | Days since creation for the top 10 ranked items | Trending down / stable |
| % sprint candidates failing DoR | Items rejected at Sprint pull for DoR failure ÷ total candidates | < 10% |
| Duplicate-item rate | Items closed as duplicates ÷ total created | Trending down |
| Security SLA breaches | Security items exceeding policy age with no logged exception | 0 |

## Stage Handoff

Prioritized, DoR-track-started items ↁE**Sprint Planning** ([03_SPRINT.md](./03_SPRINT.md)), which enforces full [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md) compliance before commitment.

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. I, VI, VII, XII
- [/docs/ROADMAP.md](../docs/ROADMAP.md)
- [01_SPECIFICATION.md](./01_SPECIFICATION.md)
- [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md)

**End of 02  EBacklog v2.0.0**
