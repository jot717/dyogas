# 14  EDefinition of Done

**Version:** 2.2.0
**Status:** Binding  EImmutable Gate
**Effective:** 2026-07-22
**Owner:** Chief Engineering Officer
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. IV, V, IX · [06_TESTING.md](./06_TESTING.md) · [08_CODE_REVIEW.md](./08_CODE_REVIEW.md) · [09_RELEASE.md](./09_RELEASE.md) · [11_BRANCHING.md](./11_BRANCHING.md) · [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md)

---

## 1. Purpose

Define the non-negotiable completion bar for any Backlog item or PR claiming "done." If DoD fails, the work is not done  Eregardless of demo pressure, deadline pressure, or how close it looks. DoD is the hard gate immediately before Merge.

## 2. Definitions

| Term | Definition |
|---|---|
| **DoD attestation** | The explicit, recorded confirmation that every applicable DoD checkbox is true for a given PR/item scope. |
| **Scope of the claim** | Whether "done" is being claimed for a task, a story/item, or a full release  EDoD applies at whichever scope is being claimed. |
| **Sev-1/Sev-2** | Open severity classifications from [07_DEBUGGING.md](./07_DEBUGGING.md); a known Sev-1/Sev-2 for the change under review blocks Done. |

## 3. Scope

Applies to every Backlog item or PR before it can merge to a protected branch or be marked "done" in the Single Backlog.

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Author** | Certifying the checklist honestly. |
| **Reviewer** | Verifying the certification against the actual diff/evidence. |
| **Merger** | Enforcing that DoD is complete before executing the merge. |

## 5. Who Owns It

**Chief Engineering Officer** owns this gate's definition; **Author** certifies, **Reviewer** verifies, **Merger** enforces per PR.

## 6. Who Approves It

DoD attestation is verified by **Engineering Manager Agent** and **Architecture Reviewer Agent** (and Tech Lead Agent for technical risk). Waivers require Engineering Agent approvals then Founder business approval + Decision Log. AI implementing agents cannot self-certify DoD. The Founder does not replace Engineering Agents. See [README.md](./README.md) §2a.


## 7. Required Inputs

The PR/item scope, test evidence, and the doc diff.

## 8. Required Outputs

A DoD attestation recorded on the PR/item.

## 9. Mandatory Artifacts

| Artifact | Form |
|---|---|
| DoD checklist | PR template section, fully checked |

## 10. Workflow

1. Author self-certifies against the checklist in §11 before requesting final merge eligibility.
2. Reviewer independently verifies each checked box against real evidence (not just trusting the checkmark) as part of [08_CODE_REVIEW.md](./08_CODE_REVIEW.md).
3. If any box is false and not lawfully waived, the PR is not Done  Ereturn to the appropriate stage (Implementation, Testing, or Documentation).
4. If a waiver is needed, route to Tech Lead (+ Security if relevant); record it with an expiration date in the Decision Log.
5. Merger confirms the full checklist (including any waiver) before executing the merge per [09_RELEASE.md](./09_RELEASE.md).

## 11. Quality Gates  EDoD Checklist

**Always**

- [ ] Meets the accepted Spec/acceptance notes for the claimed scope.
- [ ] Tests added/updated for the risk introduced; required CI green (or lawful waiver logged).
- [ ] Code Review approvals satisfied.
- [ ] No known Sev-1/Sev-2 open for this change.
- [ ] No secrets committed.
- [ ] Commits/PR follow [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md) / [11_BRANCHING.md](./11_BRANCHING.md).

**When behavior or interfaces change**

- [ ] `/docs`, `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas`, and/or `/engineering` updated as applicable.
- [ ] ADR completed if Architecture Review required it.
- [ ] Decision Log updated for material decisions.

**When Harness / agents / knowledge SoR touched**

- [ ] Contracts/schemas respected; no bypass of Human Approval semantics.
- [ ] Audit/logging expectations considered.

**Security / ownership / egress**

- [ ] Threat notes reviewed for sensitive paths.
- [ ] Local-first ownership not violated.

## 12. Decision Rules

| Situation | Rule |
|---|---|
| One checklist box is false but the item is deadline-critical | Not Done; deadline pressure is not a valid waiver reason on its own  Eescalate through the proper waiver path with real justification (e.g., external dependency genuinely unavailable). |
| A waiver from a prior sprint is still active for the same recurring gap | Flag at Retrospective; renewing the same waiver indefinitely is itself a failure condition (see §14). |
| An AI agent completed all visible work | A human must still certify/verify; AI completion does not substitute for human DoD certification on protected merges. |

## 13. Review Checklist

- [ ] Every "Always" box is independently verified by the reviewer, not just trusted from the author's checkmark.
- [ ] Applicable conditional sections (interface change, Harness/agent, security) are correctly triggered and checked.
- [ ] Any waiver present has a Tech Lead (+Security) approval, Decision Log link, and expiration date.

## 14. Exit Checklist

- [ ] Every applicable DoD checkbox is true.
- [ ] Recorded on the PR/item.

## 15. Examples

**Example 1 (Done).** `ENG-102-1` PR: meets acceptance notes, schema conformance tests pass, one reviewer approval obtained, no open Sev-1/2, no secrets, commit follows convention, `/schemas` and `/artifacts` updated in the same PR, Decision Log entry filed noting the additive schema change. All boxes true. Merged.

**Example 2 (not Done, correctly blocked).** `ENG-104` PR has passing tests and review approval but the accompanying `/contracts/agents/knowledge-review-agent.md` update is missing. Reviewer marks DoD incomplete; PR is returned to Implementation to add the contract update before it can merge.

## 16. Acceptance Criteria

Every applicable DoD checkbox is true and recorded on the PR/item.

## 17. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Closing items "done" with failing CI | Item marked done, red pipeline | Reopen; block merge; fix before re-claiming Done |
| Docs deferred | "Will document later" promise instead of an update | Reject; require the update now |
| Rubber-stamp DoD | Reviewer checks all boxes without verifying evidence | Treat as a review-quality failure; re-verify properly |

## 18. Rollback Procedure

If an item is discovered to have been merged while falsely marked Done, revert or fix-forward per severity, backfill the missing checklist items (tests, docs, approvals) retroactively, and log the gap for Retrospective if the false certification reveals a systemic review issue.

## 19. Best Practices

1. Treat the checklist as a verification tool, not a formality to click through.
2. Keep waivers rare, visible, and expiring  Enever quietly permanent.
3. When in doubt about whether a box applies, apply it  Eerr toward the stricter reading.

## 20. Anti-patterns

- **Checklist theater**: checking every box without doing the underlying work.
- **Waiver-as-policy**: treating a "temporary" waiver as the new normal.
- **Deadline override**: treating a ship date as grounds to skip DoD instead of adjusting scope or date.

## 21. Metrics

| Metric | Definition | Target |
|---|---|---|
| % merges with complete DoD | Complete ÷ total merges | 100% |
| Waiver rate | Waivers issued per period | Trending down |
| Post-merge revert correlated with DoD gaps | Reverts traceable to a DoD checklist item that was actually false | 0 |

## Relation to Lifecycle

Hard gate before **Merge** ([09_RELEASE.md](./09_RELEASE.md)); verified in **Code Review** ([08_CODE_REVIEW.md](./08_CODE_REVIEW.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. IV, V, IX
- [06_TESTING.md](./06_TESTING.md)
- [08_CODE_REVIEW.md](./08_CODE_REVIEW.md)
- [09_RELEASE.md](./09_RELEASE.md)
- [11_BRANCHING.md](./11_BRANCHING.md)
- [12_COMMIT_CONVENTION.md](./12_COMMIT_CONVENTION.md)

**End of 14  EDefinition of Done v2.0.0**
