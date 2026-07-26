# 06  ETesting

**Version:** 2.2.0
**Status:** Binding  EEngineering Process Law
**Effective:** 2026-07-22
**Lifecycle stage:** Testing
**Owner:** Task Owner (primary) · QA role if designated · Tech Lead (risk classification)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. V · [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md) · [07_DEBUGGING.md](./07_DEBUGGING.md) · [08_CODE_REVIEW.md](./08_CODE_REVIEW.md) · [/schemas](../schemas/README.md) · [/contracts](../contracts/README.md)

---

## 1. Purpose

Prove the change meets Acceptance Criteria and does not violate Constitution Art. V ("Test Before Merge") before Code Review treats the work as reviewable. Testing is evidence, not a formality  Ea green checkmark with no real coverage is a failure of this stage, not a pass.

## 2. Definitions

| Term | Definition |
|---|---|
| **Test evidence** | The concrete record (CI run, coverage report, manual test log) proving the required tests ran and their result. |
| **Risk-based coverage** | Test coverage proportional to the risk the change introduces  Ea docs-only change needs less than a Harness contract change. |
| **Negative/adversarial case** | A test that proves the system correctly rejects, denies, or fails closed on bad/malicious input  Emandatory for security-sensitive paths. |
| **Flake** | A test that fails intermittently for reasons unrelated to the change under test. |
| **Waiver** | A logged, time-boxed, approved exception permitting merge despite missing/failing non-critical test coverage. |

## 3. Scope

Applies to every PR/change set before it is eligible for Code Review. Applies with heightened rigor to contract/schema conformance and to any security-, ownership-, or egress-sensitive path.

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Task Owner** | Certifying test evidence honestly; writing/updating tests. |
| **QA role (if designated)** | Additional coverage review for complex or cross-cutting changes. |
| **Tech Lead** | Classifying risk; approving waivers with Security when the path is security-sensitive. |

## 5. Who Owns It

**Task Owner** owns producing and certifying test evidence. **Tech Lead** owns risk classification and any waiver decision.

## 6. Who Approves It

Approvals follow [README.md](./README.md) §2a: Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) each emit review artifacts; **Founder Approval** is business-only after all required Engineering Agents approve. The Founder never replaces an Engineering Agent. Any agent reject returns to the previous stage.


## 7. Required Inputs

1. The diff and its task acceptance notes.
2. The Spec's success metrics (to confirm tests actually validate the pain is addressed).
3. Harness/contract test obligations when those surfaces change (schema conformance tests, precondition/postcondition tests).

## 8. Required Outputs

1. Pass/fail report.
2. Coverage notes for the risk areas identified.
3. Bug tickets filed for any failure not fixed immediately.

## 9. Mandatory Artifacts

| Artifact | Form | Mandatory? |
|---|---|---|
| CI results | Pipeline runs linked on the PR | Yes |
| Test notes | PR checklist section describing what was tested and how | Yes |
| Failure tickets | Linked defects for unresolved failures | When applicable |

## 10. Workflow

1. Task Owner maps the diff's risk surface: what changed, what could break, what is security/ownership/egress sensitive.
2. Confirm required automated tests exist for every risk area; write missing tests before proceeding.
3. For contract/schema changes: add or update conformance tests validating both the new shape and backward compatibility with prior consumers.
4. For security-sensitive paths: add at least one adversarial/negative case (e.g., malformed payload, unauthorized actor, cross-tenant attempt) in addition to the happy path.
5. Run the full required suite; record pass/fail.
6. Triage any failure: is it a real defect (fix before proceeding) or a flake (quarantine with an owner and a ticket, never silently ignore)?
7. Attach test evidence (CI links, coverage notes) to the PR.
8. If a required test cannot be completed in time, request a waiver per §11  Edo not merge silently without one.
9. Hand off to Code Review once required suites are green or lawfully waived.

## 11. Decision Rules

| Situation | Rule |
|---|---|
| A contract/schema changed but implementation doesn't exist yet | Conformance tests are still required once implementation exists; the PR for the contract/schema change alone must state this explicitly. |
| A test is flaky | Quarantine with an owner and a ticket; do not delete or silently skip it without record. |
| A security-sensitive path has only happy-path tests | Testing stage is incomplete; add at least one negative/adversarial case before proceeding. |
| A test cannot be written in time due to environment limitations | Request a Tech Lead (+ Security if relevant) waiver with an expiration date and Decision Log entry; do not merge without it. |
| Manual verification only, on a protected-branch-bound change | Insufficient  Eautomated coverage is required for protected branches (Constitution Art. V). |

## 12. Review Checklist

- [ ] Required automated tests pass.
- [ ] New/changed risk has coverage: happy path plus relevant negative/adversarial cases for security-sensitive paths.
- [ ] Contract/schema changes include conformance tests.
- [ ] Known failures are documented as blocking or explicitly waived per §6.
- [ ] Flakes are quarantined with an owner, not ignored.
- [ ] Test evidence is attached to the PR, not just asserted in words.

## 13. Exit Checklist

- [ ] Required automated tests pass (or lawful waiver recorded).
- [ ] Coverage for new/changed risk confirmed, including negative/adversarial cases where required.
- [ ] Test evidence attached to the PR.
- [ ] Bug tickets filed for unresolved failures not blocking this PR.

## 14. Examples

**Example 1.** `ENG-102-4` adds a schema conformance test for `human-review-decision.schema.json`'s new optional `rationale_note` field: (a) valid payload with the field passes, (b) valid payload without the field still passes (backward compatibility), (c) payload with `rationale_note` as a non-string type fails validation with `SCHEMA_INVALID`. All three pass; evidence attached as CI run link.

**Example 2  Esecurity-sensitive.** A change to the Knowledge Approval skill's apply-token logic adds tests for: (a) approved checklist ↁEtoken issued (happy path), (b) incomplete checklist ↁEno token (negative), (c) unauthorized approver ↁErejected (adversarial), (d) replaying a spent token ↁE`DOUBLE_APPLY` denied (adversarial). All required per §11.

**Example 3  Ewaiver.** A flaky integration test depending on an external sandbox's uptime cannot be stabilized before a release-blocking deadline. Tech Lead approves a 2-week waiver, logs it in the Decision Log with an expiration date, and files a follow-up ticket to fix the root cause.

## 15. Acceptance Criteria

- Required automated tests pass.
- New/changed risk has coverage (happy path + relevant negative/adversarial cases for security-sensitive paths).
- Known failures documented as blocking or explicitly waived with Approval Rules followed.
- Test evidence attached to the PR.

## 16. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Deleting/weakening tests to go green | A previously-failing test is removed or loosened instead of fixed | Reject; this is a constitutional violation (Art. V); restore and fix the real defect |
| Untested security/ownership/egress paths | No negative case exists for a sensitive change | Block handoff to Code Review until added |
| Fabricated test evidence | Claimed "tested manually" with no verifiable record | Treat as a serious integrity failure; escalate to Tech Lead |
| Silent flake ignoring | A red test is re-run until it happens to pass, with no quarantine ticket | Reject; quarantine properly with an owner |

## 17. Rollback Procedure

If a change is later found to have shipped with fabricated or insufficient test evidence, immediately open a Debugging cycle ([07_DEBUGGING.md](./07_DEBUGGING.md)) to assess real risk, backfill the missing tests, and  Eif the gap caused a defect  Efile an RCA. Repeated fabricated evidence is escalated as a process integrity incident, not just a bug.

## 18. Best Practices

1. Write the negative/adversarial case before you're tempted to skip it  Eit is usually the one that finds the real bug.
2. Treat contract/schema backward-compatibility tests as mandatory, not optional, whenever a schema's `$id`/version does not bump MAJOR.
3. Quarantine flakes visibly with an owner and a deadline; invisible flakes rot into permanently-ignored red builds.
4. Prefer fast, deterministic tests close to the change over slow end-to-end tests as the primary evidence.

## 19. Anti-patterns

- **Green-at-all-costs**: retrying a failing test until it passes instead of understanding why it failed.
- **Coverage theater**: a test that executes code but asserts nothing meaningful.
- **Waiver-as-default**: treating the waiver path as the normal way to ship instead of the logged exception it is meant to be.
- **Security path shortcut**: shipping auth/egress/knowledge-mutation changes with happy-path-only tests.

## 20. Metrics

| Metric | Definition | Target |
|---|---|---|
| Escape defect rate | Defects found post-merge that should have been caught in Testing | Trending down |
| Waiver count | Active/expired waivers per period | Trending down; 0 renewed indefinitely |
| Flake rate | % of test runs failing for reasons unrelated to the change | Trending down |
| Time-to-green | Duration from PR ready-for-test to required suites passing | Trending down |
| % PRs with negative-path tests on critical surfaces | Security/ownership/egress PRs with adversarial coverage ÷ total such PRs | 100% |

## Stage Handoff

Tests green (or lawfully waived) ↁE**Code Review** ([08_CODE_REVIEW.md](./08_CODE_REVIEW.md)). Failures ↁE**Debugging** ([07_DEBUGGING.md](./07_DEBUGGING.md)) or Implementation fix-forward.

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. V
- [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md)
- [07_DEBUGGING.md](./07_DEBUGGING.md)
- [08_CODE_REVIEW.md](./08_CODE_REVIEW.md)
- [/schemas/README.md](../schemas/README.md)
- [/contracts/README.md](../contracts/README.md)

**End of 06  ETesting v2.0.0**
