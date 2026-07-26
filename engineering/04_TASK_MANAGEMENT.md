# 04  ETask Management

**Version:** 2.2.0
**Status:** Binding  EEngineering Process Law
**Effective:** 2026-07-22
**Lifecycle stage:** Task Breakdown
**Owner:** Tech Lead (breakdown quality) · Task Owner (execution)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. IV, V · [03_SPRINT.md](./03_SPRINT.md) · [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md) · [11_BRANCHING.md](./11_BRANCHING.md) · [/contracts](../contracts/README.md) · [/schemas](../schemas/README.md)

---

## 1. Purpose

Decompose committed Sprint items into owned, sequenced, reviewable tasks that map explicitly to contracts, schemas, tests, and documentation  Epreventing monolithic "implement everything" tickets that cannot be reviewed or tested in bounded time.

## 2. Definitions

| Term | Definition |
|---|---|
| **Task** | The smallest independently-reviewable unit of work under a parent Backlog item, with a single owner and clear acceptance notes. |
| **Task graph** | The set of tasks under an item plus their dependency (blocks/blocked-by) relationships. |
| **Acceptance notes** | Task-level, testable statements of what "this task is done" means  Enarrower than the item's Spec acceptance criteria. |
| **Orphan task** | A task with no parent Backlog item  Eforbidden. |
| **Mega-task** | A task sized to require multiple unrelated PRs, no tests, and no docs  Ean anti-pattern, not a valid task. |

## 3. Scope

Applies to every Sprint-committed item before Implementation begins. Trivial single-commit chores may have a task graph of exactly one task  Ethe process still applies, just at minimal size.

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Tech Lead** | Breakdown quality: coverage, sizing, dependency ordering. |
| **Task Owner** | Executing the assigned task and flagging discovered dependencies. |
| **Product Owner** | Available for scope clarification, not for task-level sizing decisions. |

## 5. Who Owns It

**Tech Lead** owns breakdown quality and acceptance of the task graph. Individual **Task Owners** own execution of their assigned tasks.

## 6. Who Approves It

Approvals follow [README.md](./README.md) §2a: Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) each emit review artifacts; **Founder Approval** is business-only after all required Engineering Agents approve. The Founder never replaces an Engineering Agent. Any agent reject returns to the previous stage.


## 7. Required Inputs

1. The Sprint-committed item and its Specification.
2. Relevant `/contracts`, `/schemas`, `/pipelines`, and `/engineering` standards touched.
3. The Interface Impact List from Architecture Review.

## 8. Required Outputs

A task graph under the parent item: each task with an owner, an estimate band, and acceptance notes.

## 9. Mandatory Artifacts

| Artifact | Form | Mandatory? |
|---|---|---|
| Task records | Sub-issues or checklist items with stable ids | Yes |
| Dependency notes | Explicit blocks/blocked-by links | Yes when dependencies exist |
| Coverage map | Explicit note of which task covers implementation, which covers tests, which covers docs/schema/contract updates | Yes |

## 10. Workflow

1. Tech Lead (or Task Owner drafting for Tech Lead review) takes the Sprint-committed item and its Spec.
2. Break the item into tasks covering, at minimum: **implement**, **test**, **docs/schema/contract updates** (when interfaces change), and **review prep** (PR description, demo notes).
3. Order tasks by dependency; mark blocks/blocked-by explicitly.
4. Size each task to fit comfortably within a single PR per [11_BRANCHING.md](./11_BRANCHING.md)'s small-PR preference; split further if not.
5. Assign an owner and estimate band to each task.
6. Write acceptance notes per task  Etestable, not vague ("returns 400 with `SCHEMA_INVALID` on malformed payload," not "handles errors").
7. Tech Lead reviews the graph for completeness (Constitution Art. IV/V coverage) and accepts it.
8. Task graph is published; Implementation may begin on unblocked tasks.

## 11. Decision Rules

| Situation | Rule |
|---|---|
| An item's Interface Impact List includes a contract change | A dedicated task must exist for the contract/schema update  Eit cannot be "folded into" the implementation task silently. |
| A task has no test task alongside it and introduces risk | Breakdown is incomplete; Tech Lead must add the test task before acceptance. |
| A task turns out to be a mega-task once execution starts | Task Owner flags it to Tech Lead; it is split before continuing, not pushed through as one giant PR. |
| Two tasks have a circular dependency | Tech Lead resolves by merging or resequencing before acceptance; circular blocks are not shipped as-is. |
| An AI agent proposes the full task graph | Treated as a draft; human Tech Lead/Product Owner must approve material splits before Implementation starts. |

## 12. Review Checklist

- [ ] Tasks cover implement, test, docs/schema/contract updates (when applicable), and review prep.
- [ ] Dependencies are ordered and explicit.
- [ ] Each task has an owner, estimate band, and acceptance notes.
- [ ] No task lacks a parent Backlog item.
- [ ] No mega-task (unreviewable size, no tests, no docs) survives to acceptance.
- [ ] Harness/contract-touching tasks are called out explicitly, not buried in a generic "implementation" task.

## 13. Exit Checklist

- [ ] Task graph accepted by Tech Lead.
- [ ] Every task has owner + estimate band + acceptance notes.
- [ ] Dependency order recorded.
- [ ] No orphan tasks remain.

## 14. Examples

**Example 1.** Item `ENG-102` "Add rationale_note field to human-review-decision artifact" breaks into:
1. `ENG-102-1`  Eupdate `/schemas/artifacts/human-review-decision.schema.json` to add optional `rationale_note` (owner: Tech Lead, estimate `XS`).
2. `ENG-102-2`  Eupdate `/artifacts/human-review-decision.md` spec prose to document the field (owner: Doc Owner, estimate `XS`, blocked-by `ENG-102-1`).
3. `ENG-102-3`  Eimplement the mock UI field rendering per Spec (owner: Implementer, estimate `S`, blocked-by `ENG-102-1`).
4. `ENG-102-4`  Eschema conformance test for the new field (owner: Implementer, estimate `XS`, blocked-by `ENG-102-1`).
5. `ENG-102-5`  EPR description + demo notes for review (owner: Implementer, estimate `XS`, blocked-by 102-3, 102-4).

**Example 2  Erejected mega-task.** A Task Owner proposes a single task "implement embedding pipeline v2" with no sub-tasks, no listed tests, no docs task. Tech Lead rejects the breakdown and requires it be split into at least: contract update, schema update, pipeline stage update, test task, docs task, per the Review Checklist.

## 15. Acceptance Criteria

- Tasks cover implement, test, docs/schema/contract updates, and review prep.
- Dependencies ordered.
- Each task has owner, estimate band, and acceptance notes.
- No task without a parent Backlog item.

## 16. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| "Mega-task" with no tests/docs | One giant task, no sub-breakdown | Tech Lead rejects; requires split before Implementation starts |
| Orphan tasks | Task exists with no parent item | Close or re-parent immediately |
| Work starting before breakdown acceptance on high-risk items | Implementer starts coding from an unreviewed graph | Halt; Tech Lead reviews and accepts retroactively; flag as process incident if repeated |

## 17. Rollback Procedure

If a task graph is found deficient after Implementation has started (e.g., a required contract-update task was missed), Tech Lead adds the missing task immediately, re-sequences dependent work, and notes the gap for the Retrospective if it caused rework.

## 18. Best Practices

1. Default to smaller tasks; splitting later is cheap, un-splitting a mega-task mid-flight is expensive.
2. Write acceptance notes as if handing the task to someone who has never seen the Spec.
3. Always pair an implementation task with its test task in the same breakdown pass  Edo not add tests as an afterthought.
4. Call out Harness/contract/schema-touching tasks by name so reviewers know to apply extra scrutiny.

## 19. Anti-patterns

- **Mega-task**: one task covering an entire feature with no internal structure.
- **Test-as-afterthought**: breakdown lists "implement" tasks only, tests appear informally later or not at all.
- **Orphan task**: work tracked with no link to a parent Backlog item, invisible to prioritization.
- **Silent contract change**: a schema/contract update folded into a generic task instead of being named and reviewed explicitly.

## 20. Metrics

| Metric | Definition | Target |
|---|---|---|
| Avg tasks per item | Task count ÷ item count | Team-baseline tracked, not a fixed number |
| % items with explicit test task | Items with ≥1 test task ÷ total items with risk | 100% for risk-bearing items |
| Rework from poor breakdown | Tasks added after Implementation started due to a missed breakdown gap | Trending down |
| PR size correlation | Median PR size (files/LOC) vs. task estimate band | Small variance  Elarge drift indicates broken breakdown |

## Stage Handoff

Accepted tasks ↁE**Implementation** ([05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. IV, V
- [03_SPRINT.md](./03_SPRINT.md)
- [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md)
- [11_BRANCHING.md](./11_BRANCHING.md)
- [/contracts/README.md](../contracts/README.md)
- [/schemas/README.md](../schemas/README.md)

**End of 04  ETask Management v2.0.0**
