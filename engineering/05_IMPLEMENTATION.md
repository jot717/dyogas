# 05  EImplementation

**Version:** 2.2.0
**Status:** Binding  EEngineering Process Law
**Effective:** 2026-07-22
**Lifecycle stage:** Implementation
**Owner:** Task Owner (implementer: human or AI agent under contract) · Tech Lead (escalations)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. II, IV, V, VI, IX, XIII · [04_TASK_MANAGEMENT.md](./04_TASK_MANAGEMENT.md) · [11_BRANCHING.md](./11_BRANCHING.md) · [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md) · [06_TESTING.md](./06_TESTING.md) · [/contracts](../contracts/README.md) · [/harness/HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md)

---

## 1. Purpose

Produce correct, minimal, contract-aligned change sets on compliant branches  Ewithout expanding scope, bypassing the Harness, or skipping documentation and tests. Implementation is where a task graph becomes a real, reviewable diff.

## 2. Definitions

| Term | Definition |
|---|---|
| **Change set** | The full diff for a task, including code (if any), docs, schema, and contract updates in the same commit lineage. |
| **Spec drift** | A discovery during Implementation that invalidates or materially changes the original Spec's scope, pain, or approach. |
| **Scope creep** | Implementation growing beyond the task's acceptance notes without a logged Spec-drift re-approval. |
| **Harness bypass** | Any "temporary" path that mutates Knowledge Plane SoR or invokes an agent outside its published contract  Eforbidden absolutely (Constitution Art. XIII). |

## 3. Scope

Applies to every task from an accepted task graph, whether executed by a human engineer or an AI agent operating under an Agent Contract. This document governs the process; it does not itself contain application code.

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Task Owner** | Executing the task within scope; keeping docs/tests in the same change set. |
| **Tech Lead** | Adjudicating spec-drift escalations; unblocking cross-task dependencies. |
| **AI agent implementers** | Operating strictly within their published Agent Contract; never self-admitting to a Harness pipeline. |

## 5. Who Owns It

**Task Owner** owns delivery of the assigned task. **Tech Lead** owns escalation handling and cross-task sequencing decisions.

## 6. Who Approves It

Approvals follow [README.md](./README.md) §2a: Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) each emit review artifacts; **Founder Approval** is business-only after all required Engineering Agents approve. The Founder never replaces an Engineering Agent. Any agent reject returns to the previous stage.


## 7. Required Inputs

1. Accepted task + Spec + any ADR links.
2. Relevant `/contracts`, `/schemas`, `/pipelines`.
3. [11_BRANCHING.md](./11_BRANCHING.md) and [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md).
4. Constitution and Harness Specification bound to the implementer.

## 8. Required Outputs

1. Commits on a correctly-named feature/fix branch.
2. Updated governance surfaces (`/contracts`, `/schemas`, `/pipelines`, `/artifacts`, `/docs`, `/engineering`) if behavior touching them changed.
3. Notes for testers and reviewers (what changed, why, how to verify).

## 9. Mandatory Artifacts

| Artifact | Form | Mandatory? |
|---|---|---|
| Branch + commits | Git | Yes |
| Change summary | PR draft body (may start during implementation) | Yes |
| Spec drift log | Comment/entry if discovery forces a Spec change | When applicable |

## 10. Workflow

1. Task Owner creates or checks out the correctly-named branch per [11_BRANCHING.md](./11_BRANCHING.md).
2. Task Owner re-reads the task's acceptance notes before writing anything.
3. Implement strictly within the task's declared scope.
4. Update `/contracts`, `/schemas`, `/pipelines`, `/artifacts`, `/docs`, or `/engineering` **in the same change set** whenever behavior touching them changes (Constitution Art. IV)  Enever "docs in a follow-up PR" for binding surfaces.
5. Add or update unit/component tests for the risk introduced (Constitution Art. V)  Esee [06_TESTING.md](./06_TESTING.md) for full test obligations.
6. Commit using [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md), referencing the task/item id.
7. If a discovery invalidates the Spec's scope or pain claim, **stop**, log the Spec drift, and route to Product Owner (+ Architect if boundary-affecting) for re-approval before continuing.
8. Self-review the diff against the task's acceptance notes and the DoD checklist ([14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)) before marking Implementation complete.
9. Open the PR (draft or ready) with a description stating intent, risk, and doc/schema impact.
10. Hand off to Testing.

## 11. Decision Rules

| Situation | Rule |
|---|---|
| A change touches an Agent Contract's I/O shape | Contract file **and** schema **must** update in the same PR; no follow-up promise. |
| Implementer discovers the task is bigger than scoped | Re-split via [04_TASK_MANAGEMENT.md](./04_TASK_MANAGEMENT.md) rather than silently expanding one PR. |
| A "quick fix" seems to need Harness bypass to ship fast | Refuse; this is a fail-closed situation (Constitution Art. XIII); escalate to Tech Lead for the correct path. |
| Spec drift is discovered mid-implementation | Halt further coding on the drifted portion; log drift; get Product Owner (+ Architect if needed) re-approval before resuming. |
| Secrets are accidentally staged | Remove before commit; if already committed, follow immediate rotation + history-scrub procedure, never "just don't push it." |

## 12. Review Checklist

- [ ] Diff matches the task's acceptance notes  Eno unrelated changes bundled in.
- [ ] Docs/schemas/contracts updated in the same change set when behavior changed.
- [ ] Tests added/updated for the risk introduced.
- [ ] Commit messages follow [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md).
- [ ] No secrets in the diff or commit history.
- [ ] No Harness/SoR bypass path introduced, even "temporarily."
- [ ] No duplicate system introduced where an existing contract/pipeline/artifact already covers the capability.

## 13. Exit Checklist

- [ ] Code (when present) fulfills the task's acceptance notes.
- [ ] Docs/schemas/contracts updated in the same change set.
- [ ] Unit/component tests added/updated for risk introduced.
- [ ] Ready for Testing handoff (local/pipeline checks green as applicable).
- [ ] No secrets committed.

## 14. Examples

**Example 1.** Task `ENG-102-1` (schema update) implements the additive `rationale_note` field in `/schemas/artifacts/human-review-decision.schema.json`, bumps the schema's minor version, and includes a fixture test confirming old payloads without the field still validate (backward compatibility). Commit: `feat(schemas): add optional rationale_note to human-review-decision\n\nRefs: ENG-102-1`.

**Example 2  Espec drift.** While implementing `ENG-104`, the Task Owner discovers the real fix requires changing the Knowledge Review Agent's contract preconditions, not just the UI mock. This is a boundary-relevant discovery. Task Owner halts, logs the drift in the item, and routes to Product Owner + Chief Systems Architect. Architecture Review is re-triggered on the new scope before implementation resumes.

## 15. Acceptance Criteria

- Code (when present) fulfills task acceptance notes.
- Docs/schemas/contracts updated in the same change set when behavior changes.
- Unit/component tests added/updated for risk introduced.
- No secrets committed.
- Ready for Testing stage handoff.

## 16. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Out-of-scope feature creep | PR does far more than the task described | Split the PR; return extra scope to Task Breakdown |
| Secret leak | API key or credential committed | Immediate rotation, history scrub, incident review per Constitution Art. IX |
| Skipping test/docs tasks | PR ships code with no corresponding test/docs task closed | Block at Code Review; return to Implementation |
| Implementing against a rejected/pending ADR | Code proceeds despite `adr_required` unmet | Halt immediately; revert if merged; treat as process incident |
| Direct commit to protected default branch | History shows a push, not a PR | Revert per [11_BRANCHING.md](./11_BRANCHING.md); review branch protection config |

## 17. Rollback Procedure

If Implementation is found to have bypassed a gate (Harness, ADR, secret hygiene) after the fact: revert the offending commits/PR immediately, restore the branch to its last known-good state, open an incident review, and re-do the work through the correct path. Sealed artifacts are never edited in place  Ecorrections ship as new versions (Harness Spec §5).

## 18. Best Practices

1. Keep PRs small and scoped to one task; it is far easier to review, test, and revert.
2. Update docs/schemas alongside code, not after  E"I'll document it later" is how drift starts.
3. Write the PR description before finishing the diff; it forces clarity on intent and risk.
4. When an AI agent implements a task, still name a human escalation contact on the PR.

## 19. Anti-patterns

- **Silent scope creep**: "while I was in there" refactors bundled into an unrelated task's PR.
- **Docs-later promise**: shipping behavior change with a comment "will document in follow-up."
- **Temporary bypass**: any code comment containing "temporary" or "just for now" next to a Harness/SoR bypass.
- **Test theater**: adding a test that asserts nothing meaningful just to satisfy a checklist.

## 20. Metrics

| Metric | Definition | Target |
|---|---|---|
| Cycle time task ↁEPR open | Time from task start to PR opened | Trending down |
| Reopen rate | PRs reopened after being closed/merged due to defects | Trending down |
| Scope-creep incidents | PRs flagged for out-of-scope changes at review | Trending down |
| Secret-scan incidents | Secrets caught in diffs or history | 0 |

## Stage Handoff

Implementation complete ↁE**Testing** ([06_TESTING.md](./06_TESTING.md)). Debugging interrupts use [07_DEBUGGING.md](./07_DEBUGGING.md) and return here or to Testing.

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. II, IV, V, VI, IX, XIII
- [/harness/HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md)
- [/contracts/README.md](../contracts/README.md)
- [04_TASK_MANAGEMENT.md](./04_TASK_MANAGEMENT.md)
- [11_BRANCHING.md](./11_BRANCHING.md)
- [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md)
- [06_TESTING.md](./06_TESTING.md)

**End of 05  EImplementation v2.0.0**
