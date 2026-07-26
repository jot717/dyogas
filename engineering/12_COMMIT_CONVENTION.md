# 12  ECommit Convention

**Version:** 2.2.0
**Status:** Binding  EImmutable Standard
**Effective:** 2026-07-22
**Owner:** Chief Engineering Officer (policy) · Every committer (compliance)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. VII · [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md) · [08_CODE_REVIEW.md](./08_CODE_REVIEW.md) · [11_BRANCHING.md](./11_BRANCHING.md)

---

## 1. Purpose

Make history searchable, reviewable, and automatable (changelog generation, security scans, blame investigations)  Ecommits explain *why*, not just *what*, and never devolve into noise like `wip` or `fix`.

## 2. Definitions

| Term | Definition |
|---|---|
| **Conventional commit** | A commit message following the `<type>(<scope>): <summary>` format defined in §11. |
| **Trailer** | A structured metadata line at the end of a commit body, e.g. `Refs:`, `ADR:`. |
| **`--no-verify`** | A git flag that skips commit hooks  Eforbidden except in a recorded emergency. |

## 3. Scope

Applies to every commit in every DYOGAS repository, including this governance repository (governance-only changes still use `docs:`/`chore:` types).

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Every committer** | Writing compliant messages. |
| **Tech Lead** | Enforcing the convention at review time; approving rare `--no-verify` emergencies after the fact. |

## 5. Who Owns It

**Tech Lead** owns enforcement; every committer owns compliance for their own commits.

## 6. Who Approves It

Approvals follow [README.md](./README.md) §2a: Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) each emit review artifacts; **Founder Approval** is business-only after all required Engineering Agents approve. The Founder never replaces an Engineering Agent. Any agent reject returns to the previous stage.


## 7. Required Inputs

The diff, the item id, and a clear statement of intent for the change.

## 8. Required Outputs

Conventional commits on the branch, each referencing its item id.

## 9. Mandatory Artifacts

| Artifact | Form |
|---|---|
| Commit | Git object |
| Trailers | Optional `Refs:`, `ADR:` as applicable |

## 10. Workflow

1. Stage exactly the logical unit of work for this commit  Enot a bundle of unrelated changes.
2. Confirm no secrets or generated spam are staged.
3. Write the message per the format in §11.
4. Commit; let hooks run (never skip with `--no-verify` outside a recorded emergency).
5. If a hook rejects the message, fix and recommit  Edo not force through.

## 11. Format

```
<type>(<optional-scope>): <short summary>

<body: why, risk, notes>

Refs: <item-id>
ADR: <NNNN>          # when applicable
```

**Types:** `feat` | `fix` | `docs` | `style` | `refactor` | `test` | `chore` | `security` | `perf` | `revert`

**Rules:**

- Imperative summary, ≤72 characters preferred.
- Body explains *why* and trade-offs when non-obvious  Enot a restatement of the diff.
- One logical change per commit when practical.
- No secrets; no generated spam dumps (e.g., accidental lockfile churn with no explanation).
- Governance-only repositories (like this one) still use `docs:` / `chore:` for their changes.

## 12. Decision Rules

| Situation | Rule |
|---|---|
| A commit fixes a security issue | Use type `security`, not `fix`  Edo not hide the nature of the change from changelog automation. |
| A commit is purely a docs/process version bump | Use `docs:` or `chore:`, referencing the item id and, if applicable, the Decision Log entry. |
| Hooks fail due to a legitimate emergency (e.g., production is down and the fix must ship now) | `--no-verify` may be used **only** with a recorded justification in the PR/incident, reviewed post-facto by Tech Lead. |
| A commit touches multiple unrelated concerns | Split into multiple commits (or PRs) before merge. |

## 13. Review Checklist

- [ ] Type is accurate (not `feat` hiding a `security` fix, not `fix` hiding a `feat`).
- [ ] Summary is imperative and ≤72 characters where practical.
- [ ] Body explains why when the reason is non-obvious.
- [ ] `Refs:` trailer present linking the item id.
- [ ] `ADR:` trailer present when the change implements an ADR.
- [ ] No secrets in message or diff.

## 14. Exit Checklist

- [ ] Message matches the convention.
- [ ] Commit passed hooks (or a recorded emergency justifies `--no-verify`).

## 15. Examples

**Compliant:**

```
feat(schemas): add optional rationale_note to human-review-decision

Lets reviewers record why a proposal was flagged, reducing
re-derivation time for Knowledge Review Agent operators.
Additive change; existing payloads remain valid.

Refs: ENG-102-1
```

**Non-compliant (rejected at review):**

```
fix stuff
```

## 16. Acceptance Criteria

Message matches the convention; commit passes hooks when present (no `--no-verify` without a recorded emergency).

## 17. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| `wip`/`fix` with no item ref on material changes | Unreviewable, unsearchable history | Reject at review; require amendment before merge |
| `--no-verify` used to hide a secret or failing hook | Hook bypass with no justification recorded | Treat as a security incident; rotate any exposed secret; review access |
| Misleading type | `feat` commit that is actually hiding `security` debt | Reject; require correct typing; discuss intent with the author |

## 18. Rollback Procedure

If a non-compliant or secret-containing commit reaches a shared branch, follow the [11_BRANCHING.md](./11_BRANCHING.md) history-rewrite exception process: rotate any exposed secret immediately, scrub history with human-admin authorization, notify collaborators to re-sync, and log the incident.

## 19. Best Practices

1. Write the "why" in the body even when the "what" seems obvious from the diff.
2. Keep commits atomic  Eeasier to revert, bisect, and review.
3. Reference the ADR trailer whenever a commit is implementing an accepted architecture decision.
4. Treat the commit message as documentation for your future self debugging six months from now.

## 20. Anti-patterns

- **Noise commits**: `wip`, `asdf`, `final fix v3`.
- **Type laundering**: mislabeling a security fix as a generic `fix` to avoid scrutiny.
- **Giant commit**: one commit containing an entire Sprint's worth of unrelated changes.

## 21. Metrics

| Metric | Definition | Target |
|---|---|---|
| % commits matching convention | Conformant commits ÷ total | Trending toward 100% |
| Hook bypass incidents | `--no-verify` uses without a recorded emergency | 0 |
| Revert clarity | % of reverts where the original commit message made the revert reason obvious | Trending up |

## Relation to Lifecycle

Binds Implementation and Review ([05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md), [08_CODE_REVIEW.md](./08_CODE_REVIEW.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. VII
- [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md)
- [08_CODE_REVIEW.md](./08_CODE_REVIEW.md)
- [11_BRANCHING.md](./11_BRANCHING.md)

**End of 12  ECommit Convention v2.0.0**
