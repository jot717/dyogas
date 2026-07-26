# 03  ESprint

**Version:** 2.2.0
**Status:** Binding  EEngineering Process Law
**Effective:** 2026-07-22
**Lifecycle stage:** Sprint Planning + Sprint operating rules
**Owner:** Engineering Manager / Scrum Lead role (process) · Product Owner (scope) · Tech Lead (technical risk)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. III, V, XIII · [02_BACKLOG.md](./02_BACKLOG.md) · [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md) · [04_TASK_MANAGEMENT.md](./04_TASK_MANAGEMENT.md) · [07_DEBUGGING.md](./07_DEBUGGING.md) · [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)

---

## 1. Purpose

Commit a time-boxed, capacity-honest set of DoR-ready Backlog items with a clear, measurable Sprint goal  Eand protect the Constitution and Harness from "just squeeze it in" scope inflation. A Sprint is the unit of accountable delivery between Backlog and Task Breakdown.

## 2. Definitions

| Term | Definition |
|---|---|
| **Sprint** | A fixed time-box (recommended 1 E weeks; length is a team-tooling ADR choice, not a `/engineering` law) during which a committed set of items is executed. |
| **Sprint goal** | One or two sentences describing the outcome the Sprint delivers, from which committed items derive. |
| **Commitment reliability** | % of committed items actually delivered by Sprint end. |
| **Scope-change** | Any mid-sprint addition or removal from the committed set; always logged, never silent. |
| **Capacity** | The realistic available engineering time after accounting for on-call, holidays, and existing support load. |
| **Single Board** | The one authoritative Sprint board; no private tracking boards. |

## 3. Scope

Applies to every Backlog item pulled into a time-boxed commitment. Does not apply to purely exploratory spikes with no committed deliverable (those are time-boxed separately and tracked as a `chore`/`debt` item, not disguised as a full Sprint commitment).

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Product Owner** | Setting/protecting scope; approving the Sprint goal. |
| **Tech Lead** | Assessing technical risk and capacity feasibility. |
| **Engineering Manager / Scrum Lead** | Facilitating planning; tracking the Single Board; escalating blockers within 24h. |
| **Task Owners** | Delivering their committed items; raising scope-change requests through the proper channel, not silently. |

## 5. Who Owns It

**Engineering Manager / Scrum Lead** owns the process; **Product Owner** owns scope; **Tech Lead** owns technical risk sign-off.

## 6. Who Approves It

**Engineering Agents** run the approval chain for Sprint commitment (product completeness, capacity/process, technical risk, standards). **Founder Approval** is business-only after all Engineering Agents approve. The Founder does not act as Product Owner or Tech Lead. Any agent reject returns to Backlog refinement. See [README.md](./README.md) §2a.


## 7. Required Inputs

1. DoR-ready Backlog items ([15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md) fully passed).
2. Known velocity/capacity, including holidays and on-call load.
3. Open incidents or release freezes that constrain capacity.

## 8. Required Outputs

1. Published Sprint goal.
2. Frozen committed item set with owners assigned.
3. Scope-change log (created empty; populated only if mid-sprint changes occur).

## 9. Mandatory Artifacts

| Artifact | Form | Mandatory? |
|---|---|---|
| Sprint record | Sprint board entry + goal statement | Yes |
| Commitment list | Linked Backlog ids | Yes |
| Scope-change entries | Decision Log entry when material | When applicable |

## 10. Workflow

1. Engineering Manager/Scrum Lead convenes Sprint Planning with the DoR-ready portion of the Backlog.
2. Product Owner proposes candidate items in priority order.
3. Tech Lead checks each candidate against team capacity, flags technical risk, and confirms no unresolved required ADR blocks it.
4. Every candidate is checked against the full [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md) checklist  Eitems failing DoR are **not** committed, no exceptions without a logged waiver.
5. Product Owner drafts the Sprint goal from the committed set; it must be a coherent outcome statement, not just "do these 14 tickets."
6. Owners are assigned at item or task level.
7. Product Owner and Tech Lead jointly sign off; the committed set is frozen and published on the Single Board.
8. Success metrics for the Sprint goal are stated explicitly (what will be true when the Sprint is a success).

## 11. Sprint Operating Rules

1. Daily progress is visible on the Single Board  Eno private status tracking that hides blockers.
2. Blockers escalate within 24 hours of being identified; silence is not an acceptable blocker-management strategy.
3. Debugging interrupts follow [07_DEBUGGING.md](./07_DEBUGGING.md) and do not bypass gates.
4. Nothing merges without satisfying [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md), regardless of Sprint deadline pressure.
5. Mid-sprint scope changes require the Decision Rule in §12 and are logged, never silent.

## 12. Decision Rules

| Situation | Rule |
|---|---|
| An item fails DoR at planning time | Excluded from commitment; returned to Backlog with the specific gap noted. |
| A P0 incident consumes unplanned capacity mid-sprint | Product Owner + Tech Lead remove equivalent committed scope and log the change; the Sprint goal may be re-stated if materially affected. |
| A stakeholder requests a "quick add" mid-sprint | Requires the same joint approval as any scope-change; "quick" is not an exception category. |
| Team consistently misses commitment reliability target | Raised at Retrospective ([10_RETROSPECTIVE.md](./10_RETROSPECTIVE.md)) as a capacity-estimation theme, not silently absorbed. |
| An AI agent is assigned a task-level owner role | Permitted, provided a human Task Owner/escalation contact is also named for that item. |

## 13. Review Checklist

- [ ] Every committed item independently passes DoR  Enot "close enough."
- [ ] Sprint goal is a coherent outcome statement with success metrics.
- [ ] Owners assigned at item or task level.
- [ ] Test/review capacity reserved  Ethe plan is not 100% coding time with zero slack for review/testing.
- [ ] No Harness-bypass "spike straight to prod" items snuck into the commitment.

## 14. Exit Checklist

- [ ] Sprint goal published on the Single Board.
- [ ] Committed set frozen; changes only via the logged scope-change rule.
- [ ] Product Owner + Tech Lead joint sign-off recorded.
- [ ] Success metrics for the Sprint goal stated.

## 15. Examples

**Example 1.** Sprint 14 goal: "Reduce Knowledge Review Agent operator decision time on flagged proposals by shipping the rationale field and its UI mock spec." Committed items: `ENG-102`, `ENG-104`, `ENG-107` (3 items, estimate total `M+M+S`, capacity for the 2-week sprint is `L`). Success metric: rationale field ships behind the review checklist by Sprint end; median time-to-decision measured for one week post-release.

**Example 2  Escope change.** Mid-Sprint 14, `ENG-104` is blocked by a discovered ADR requirement (Architecture Review had mis-verdicted). Product Owner and Tech Lead remove `ENG-104` from commitment, backfill with the equal-sized `ENG-109` from Backlog (already DoR-ready), and log the swap in the Decision Log with the reason.

## 16. Acceptance Criteria

- Sprint goal published.
- Committed set frozen (changes via explicit scope-change rule only).
- Owners assigned at item or task level.
- Success metrics for the sprint goal stated.

## 17. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Committing non-DoR work | Item enters sprint with an unchecked DoR box | Remove from commitment immediately; log why it slipped through |
| Silent scope inflation | New items appear on the board mid-sprint with no log entry | Treat as process incident; require retroactive logging and a Retrospective theme |
| Sprint goal absent or unmeasurable | Board just lists tickets, no stated outcome | Reject the plan; Product Owner must restate the goal |
| Parallel "private sprint" lists | A sub-team tracks its own board outside the Single Board | Consolidate immediately (Constitution Art. VI) |

## 18. Rollback Procedure

If a Sprint's committed set is found to violate DoR or capacity reality after commitment, Product Owner + Tech Lead reconvene, remove the offending item(s) with a logged reason, and re-state the Sprint goal if the removal is material. The Sprint is not silently abandoned  Eits final state (met/partially met/failed) is always recorded for the Retrospective.

## 19. Best Practices

1. Reserve explicit test/review capacity in the plan  Edo not treat it as slack that "should" exist.
2. State the Sprint goal before finalizing the item list, then check the items actually serve it.
3. Escalate blockers same-day; a 24-hour SLA is a ceiling, not a target.
4. Keep the committed set small enough that mid-sprint fires do not require heroics to protect it.

## 20. Anti-patterns

- **Commitment theater**: publishing a Sprint goal that no committed item actually serves.
- **Capacity denial**: planning at 100% utilization with no room for review, testing, or interrupts.
- **Silent swap**: removing one item and adding another without logging either change.
- **Sprint-as-todo-list**: treating the Sprint as an unordered bucket instead of a goal-directed commitment.

## 21. Metrics

| Metric | Definition | Target |
|---|---|---|
| Commitment reliability | % of committed items delivered ÷ committed | Trending toward team-agreed target (commonly 80 E0%) |
| Spillover rate | Items not completed and carried to next Sprint ÷ committed | Trending down |
| DoR exceptions | Items committed despite an unmet DoR box | 0 |
| Scope-change count | Logged mid-sprint changes per Sprint | Visible and trending toward team-agreed low baseline |
| Escaped defects per sprint | Defects found after Sprint items were marked done | Trending down |

## Stage Handoff

Committed items ↁE**Task Breakdown** ([04_TASK_MANAGEMENT.md](./04_TASK_MANAGEMENT.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. III, V, XIII
- [02_BACKLOG.md](./02_BACKLOG.md)
- [15_DEFINITION_OF_READY.md](./15_DEFINITION_OF_READY.md)
- [07_DEBUGGING.md](./07_DEBUGGING.md)
- [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)
- [10_RETROSPECTIVE.md](./10_RETROSPECTIVE.md)

**End of 03  ESprint v2.0.0**
