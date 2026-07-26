# 08  ECode Review

**Version:** 2.2.0
**Status:** Binding  EEngineering Process Law
**Effective:** 2026-07-22
**Lifecycle stage:** Code Review
**Owner:** Reviewer(s) (human) · Author · Code Owner for protected paths
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. II, III, V, IX · [06_TESTING.md](./06_TESTING.md) · [09_RELEASE.md](./09_RELEASE.md) · [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md) · [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)

---

## 1. Purpose

Enforce constitutional, Harness, and quality standards through attributable human review. AI may assist; AI may not be the sole approver on protected paths (Constitution Art. III). Code Review is where the organization's standards are actually checked against a real diff, not assumed.

## 2. Definitions

| Term | Definition |
|---|---|
| **Self-review** | The author's own pass over the diff before requesting review, checking it against the task's acceptance notes. |
| **Code Owner** | A designated approver required for changes to specific protected paths (e.g., `/harness`, `/contracts`, `/CONSTITUTION.md`). |
| **LGTM by default** | Approving without having actually read the diff  Eforbidden (Constitution Art. III). |
| **Request changes** | A review verdict requiring specific, addressable fixes before re-review. |
| **Advisory AI review** | AI-generated review comments, which inform but never substitute for required human approval. |

## 3. Scope

Applies to every PR before it may proceed to Regression/Merge. Applies with maximum rigor to changes touching `/CONSTITUTION.md`, `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas`, and `/engineering` itself.

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Author** | Self-review; responding to feedback; not self-approving. |
| **Reviewer(s)** | Actually reading the diff against the Review Checklist below. |
| **Code Owner** | Approving changes to their owned protected paths specifically. |

## 5. Who Owns It

**Reviewers** own the review verdict for a given PR. **Code Owners** own approval authority for their declared protected paths.

## 6. Who Approves It

Code Review approvals are issued by **Engineering Agents** (at minimum Tech Lead Agent and Architecture Reviewer Agent; others as required by risk). The **Founder does not perform engineering reviews** and does not replace reviewers. Founder Approval applies only as business go/no-go when the stage requires it after Engineering Agents approve. See [README.md](./README.md) §2a.


## 7. Required Inputs

1. An opened PR with CI/required tests green (or a lawful, linked waiver).
2. A description stating intent, risk, test evidence, and doc/schema impact.
3. Confirmation the author completed self-review.

## 8. Required Outputs

1. An explicit verdict: approve, request changes, or reject.
2. Review comments and the decisions reached from them.

## 9. Mandatory Artifacts

| Artifact | Form | Mandatory? |
|---|---|---|
| PR + reviews | Git host review records | Yes |
| Follow-up issues | Linked ids for anything deferred, not silently dropped | When applicable |

## 10. Workflow

1. Author opens the PR only after Testing has produced green (or lawfully waived) evidence.
2. Author completes self-review, checking the diff against the task's acceptance notes and the DoD checklist.
3. Author writes a PR description: intent, risk, test evidence, doc/schema impact, and any Spec-drift notes.
4. Reviewer(s) are requested; Code Owners are automatically or manually included for protected paths.
5. Reviewer(s) actually read the diff  Enot just the description  Eagainst the Review Checklist (§12).
6. Reviewer(s) render a verdict: **approve**, **request changes** (with specific, addressable items), or **reject** (fundamental issue; return to Implementation/Specification).
7. Author addresses feedback; re-requests review after material changes.
8. All review conversations are resolved or explicitly tracked as follow-up items with ids before merge eligibility.
9. Once required approvals are obtained and the DoD checklist is satisfied, the PR is labeled ready-to-merge or ready-for-regression as applicable.

## 11. Decision Rules

| Situation | Rule |
|---|---|
| PR touches `/CONSTITUTION.md`, `/harness`, or `/contracts` | Requires the designated Code Owner's explicit approval in addition to any other required reviewer. |
| Author is also the only available reviewer | Escalate for an additional reviewer; author cannot be the sole approval. |
| AI review flags a security concern | Treated as a signal requiring human investigation, never auto-resolved or auto-dismissed by another AI pass. |
| Reviewer wants to approve "to unblock" without reading fully | Forbidden; if time-constrained, explicitly request changes or ask for scope reduction instead of rubber-stamping. |
| A review comment is not addressed and not tracked | PR cannot merge; either fix it or open a tracked follow-up with an id and link it. |

## 12. Review Checklist

- [ ] **Correctness** vs. the Spec and task acceptance notes.
- [ ] **Security by default**; no secret leakage; least-privilege respected.
- [ ] **No duplicate systems** introduced; no Harness bypass.
- [ ] **Contracts/schemas/docs** updated in the same change set as behavior.
- [ ] **Tests adequate** for the risk introduced, including negative/adversarial cases where required.
- [ ] **Commit/PR hygiene** per [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md).
- [ ] **Local-first ownership & egress** respected when the change touches knowledge-plane or external calls.

## 13. Exit Checklist

- [ ] Required approvals obtained (including Code Owners where applicable).
- [ ] All review conversations resolved or tracked as follow-ups with ids.
- [ ] DoD checklist satisfied for the PR's scope ([14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)).
- [ ] PR labeled ready-to-merge / ready-for-regression as applicable.

## 14. Examples

**Example 1.** PR for `ENG-102-3` (UI mock field rendering) receives one reviewer approval after the reviewer confirms: field renders per Spec, no schema drift, test coverage for the new field's presence/absence, and PR description matches the actual diff. Approved.

**Example 2  ECode Owner required.** PR modifying `/contracts/agents/knowledge-review-agent.md` to add a new precondition automatically requires the Contracts Code Owner's sign-off in addition to the assigned reviewer, because it touches a protected path.

**Example 3  Erequest changes.** A reviewer finds the PR added a new field to an artifact schema but did not bump the schema's version or update `/artifacts/human-review-decision.md` prose. Verdict: request changes, with the two specific missing items listed.

## 15. Acceptance Criteria

- Required approvals obtained.
- All review conversations resolved or tracked as follow-ups with ids.
- DoD checklist satisfied for the PR scope.
- Label ready-to-merge / ready-for-regression applied as applicable.

## 16. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Merge without required approvals | Branch protection misconfigured or bypassed | Revert; fix branch protection; incident review |
| Rubber-stamp of failing CI | Approval given while required checks are red | Reject the approval; re-review properly |
| Ignoring security/ownership findings | A flagged concern is approved anyway with no resolution | Escalate; do not merge until resolved or explicitly, jointly waived with a Decision Log entry |
| Review that never reads the diff | Approval given within seconds of a large diff, no substantive comments | Treat as a review-quality incident; require re-review |

## 17. Rollback Procedure

If a merged PR is later found to have been approved without genuine review (e.g., a real defect a careful review would have caught), revert or fix-forward per severity, open an RCA via [07_DEBUGGING.md](./07_DEBUGGING.md) if it caused a production issue, and raise the review-quality gap at the next Retrospective.

## 18. Best Practices

1. Read the diff top to bottom before reading the description  Ethe description can bias you toward what the author wants you to see.
2. Ask "what would break this?" for every changed function/contract, not just "does this look right?"
3. Prefer several small, specific comments over one vague "looks messy" comment.
4. Use AI review as a first pass to catch mechanical issues, freeing human attention for judgment calls  Enever as a substitute for the human read.

## 19. Anti-patterns

- **LGTM by default**: approving without reading.
- **Approval fatigue**: rubber-stamping late-Sprint PRs to hit a deadline.
- **Nitpick-only review**: commenting only on style while missing correctness/security issues.
- **AI-as-approver**: treating an AI-generated "looks good" as satisfying the human-approval requirement.

## 20. Metrics

| Metric | Definition | Target |
|---|---|---|
| Time-to-first-review | Duration from PR ready to first substantive review | Trending down |
| Iterations per PR | Review round-trips before approval | Team-baseline; extreme outliers investigated |
| % PRs reverted post-merge | Reverts ÷ merges | Trending down |
| Security findings caught in review vs. production | Ratio favoring review | Trending toward review catching the majority |

## Stage Handoff

Approved PR ↁE**Regression** then **Merge** ([09_RELEASE.md](./09_RELEASE.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. II, III, V, IX
- [06_TESTING.md](./06_TESTING.md)
- [09_RELEASE.md](./09_RELEASE.md)
- [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md)
- [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)

**End of 08  ECode Review v2.0.0**
