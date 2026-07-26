# 11  EBranching Standard

**Version:** 2.2.0
**Status:** Binding  EImmutable Standard
**Effective:** 2026-07-22
**Owner:** Chief Engineering Officer (policy) · Every contributor (compliance)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. V, VI · [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md) · [08_CODE_REVIEW.md](./08_CODE_REVIEW.md) · [09_RELEASE.md](./09_RELEASE.md) · [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md)

---

## 1. Purpose

Keep history integrable, reviewable, and releasable  Eone branching model, no shadow workflows. Consistent branching is what makes Code Review, Regression, and Release tractable at scale.

## 2. Definitions

| Term | Definition |
|---|---|
| **Protected branch** | A branch (typically `main`, and any `release/*` branch) that cannot receive direct pushes and requires PR + review + green checks to update. |
| **Topic branch** | A short-lived branch created for one task/item. |
| **Force-push** | Rewriting published history on a shared branch  Eforbidden without an explicit, logged exception. |
| **Hotfix branch** | A branch created to ship an emergency production fix outside the normal release train. |

## 3. Scope

Applies to every git operation in every DYOGAS repository, for every contributor  Ehuman or AI agent.

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Tech Lead** | Setting and maintaining branch protection policy. |
| **Every contributor** | Naming branches correctly and never bypassing protection. |

## 5. Who Owns It

**Tech Lead** owns the policy; every contributor is accountable for compliance.

## 6. Who Approves It

Approvals follow [README.md](./README.md) §2a: Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) each emit review artifacts; **Founder Approval** is business-only after all required Engineering Agents approve. The Founder never replaces an Engineering Agent. Any agent reject returns to the previous stage.


## 7. Required Inputs

A task/backlog item id for any non-trivial change; the correct base branch (`main`, or a release branch per ADR).

## 8. Required Outputs

A correctly-named topic branch and a PR linked to the item id.

## 9. Mandatory Artifacts

| Artifact | Form |
|---|---|
| Branch | Git ref |
| PR | Linked to item id |

## 10. Workflow

1. Contributor identifies the task/item id.
2. Create the topic branch from the correct base using the naming pattern in §12.
3. Push commits per [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md).
4. Open a PR targeting the correct base branch, linked to the item id.
5. Keep the PR small; split by task where the diff grows beyond single-review scope.
6. Merge only through the allowed strategy once Code Review and Regression pass ([08](./08_CODE_REVIEW.md), [09](./09_RELEASE.md)).
7. Delete the topic branch after merge per policy.

## 11. Naming Convention

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<item-id>-<short-slug>` | `feat/ENG-102-rationale-field` |
| Fix | `fix/<item-id>-<short-slug>` | `fix/ENG-118-retry-jitter-seed` |
| Chore/docs | `chore/<item-id>-<short-slug>` | `chore/ENG-140-estimate-guidance` |
| Hotfix | `hotfix/<item-id>-<short-slug>` | `hotfix/ENG-999-idempotency-key` |
| Release | `release/<semver>` (if a release train branch is used) | `release/2.4.0` |

## 12. Decision Rules

| Situation | Rule |
|---|---|
| A PR grows beyond ~400 changed lines with unrelated concerns mixed in | Split by task per [04_TASK_MANAGEMENT.md](./04_TASK_MANAGEMENT.md); do not ship as one giant PR. |
| A shared branch needs history rewritten (e.g., leaked secret) | Requires an explicit, logged exception approved by a human admin; announce before rewriting so collaborators can re-sync. |
| A long-lived fork of `main` starts to diverge significantly | Integrate early via smaller PRs rather than one large late merge; long-lived forks are discouraged. |
| An AI agent needs to push code | Pushes only to non-protected topic branches it was assigned; never to protected branches. |

## 13. Review Checklist

- [ ] Branch name matches the correct pattern for its type.
- [ ] Branch has a linked item id (except trivial exempted chores per team ADR).
- [ ] PR targets the correct base branch.
- [ ] No direct commits to a protected branch in the history.

## 14. Exit Checklist

- [ ] Branch named correctly.
- [ ] PR targets correct base.
- [ ] Protected branch rules never bypassed.

## 15. Examples

**Example 1.** Task `ENG-102-3` creates branch `feat/ENG-102-rationale-field` off `main`, opens PR #341 targeting `main`, links `ENG-102-3` in the description. Compliant.

**Example 2  Ehotfix.** The S0 incident from [07_DEBUGGING.md](./07_DEBUGGING.md) creates `hotfix/ENG-999-idempotency-key` off the current production tag, ships through the emergency Release path, and is later merged forward into `main` to keep history consistent.

## 16. Acceptance Criteria

Branch named correctly; PR targets correct base; protected branch rules never bypassed.

## 17. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Committing to `main` directly | Push bypasses PR flow | Revert; tighten branch protection; incident review |
| Branch without item id for material work | Untraceable branch name like `fix-stuff` | Rename/re-link before merge; reject the PR otherwise |
| Force-push to protected/shared history | History rewritten without exception | Immediate incident review; restore from reflog/backup if possible |
| Parallel branching "standards" per person | Inconsistent naming across the team | Standardize immediately; this document is the only standard |

## 18. Rollback Procedure

If protected-branch history is corrupted by an unauthorized force-push, restore from the last known-good ref (reflog, backup, or CI-cached ref) immediately, lock the branch, and conduct an incident review before re-enabling normal push access.

## 19. Best Practices

1. Prefer small PRs; split by task per [04_TASK_MANAGEMENT.md](./04_TASK_MANAGEMENT.md).
2. Rebase or squash per the team's ADR-chosen strategy consistently  Edo not mix strategies PR to PR.
3. Delete branches after merge to keep the branch list meaningful.
4. Integrate long-running work early and often rather than in one late, risky merge.

## 20. Anti-patterns

- **Mystery branch names**: `fix-stuff`, `wip2`, `final-final`.
- **Shadow protection bypass**: an admin token used to push around branch protection "just this once."
- **Eternal fork**: a branch that diverges from `main` for months before attempting to merge.

## 21. Metrics

| Metric | Definition | Target |
|---|---|---|
| PR size (files/LOC) | Median PR size | Trending toward small |
| Time branch ↁEmerge | Duration from branch creation to merge | Trending down |
| Direct-push attempts | Attempts blocked by protection | 0 successful attempts |
| Hotfix frequency | Hotfix branches per period | Trending down (indicates fewer emergencies) |

## Relation to Lifecycle

Supports Implementation ↁEReview ↁEMerge ([05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md), [08_CODE_REVIEW.md](./08_CODE_REVIEW.md), [09_RELEASE.md](./09_RELEASE.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. V, VI
- [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md)
- [08_CODE_REVIEW.md](./08_CODE_REVIEW.md)
- [09_RELEASE.md](./09_RELEASE.md)
- [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md)

**End of 11  EBranching Standard v2.0.0**
