# 07  EDebugging

**Version:** 2.2.0
**Status:** Binding  EEngineering Process Law
**Effective:** 2026-07-22
**Lifecycle stage:** Debugging (interrupt path)
**Owner:** On-call / Task Owner · Incident Commander for Sev-0/Sev-1
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. V, IX, XIII · [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md) · [06_TESTING.md](./06_TESTING.md) · [09_RELEASE.md](./09_RELEASE.md) · [/harness/HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md) §8

---

## 1. Purpose

Restore correctness through evidence-based diagnosis without bypassing gates, widening scope, or normalizing "fix forward into unrelated refactors." Debugging is an interrupt path that any of Implementation, Testing, Code Review, or a production incident may enter  Eit always returns work through Testing and Code Review before Merge.

## 2. Definitions

| Term | Definition |
|---|---|
| **Severity** | `S0` (critical, production down or SoR integrity at risk), `S1` (major, significant user/agent impact), `S2` (moderate), `S3` (minor). |
| **RCA** | Root Cause Analysis  Ea written account of what broke, why, and how it was fixed, scaled to severity. |
| **Repro** | A reliable way to reproduce the failure before attempting a fix. |
| **Fix-forward scope creep** | Using a debugging session as cover to perform an unrelated refactor  Eforbidden. |
| **Incident Commander** | The human accountable for coordinating an S0/S1 incident response. |

## 3. Scope

Applies whenever a reproducible failure signal appears: a failing test, a CI failure, a Code Review finding serious enough to require re-diagnosis, a production incident, or a Harness audit-trail anomaly (e.g., an illegal state transition per Harness Spec §4).

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **On-call / Task Owner** | Diagnosing and fixing S2/S3 issues within the normal workflow. |
| **Incident Commander** | Coordinating S0/S1 response, including comms and emergency hotfix authorization. |
| **Tech Lead** | Approving any scope expansion beyond the minimal fix. |

## 5. Who Owns It

**On-call/Task Owner** owns S2/S3 debugging. **Incident Commander** owns S0/S1 incident response end-to-end.

## 6. Who Approves It

Approvals follow [README.md](./README.md) §2a: Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) each emit review artifacts; **Founder Approval** is business-only after all required Engineering Agents approve. The Founder never replaces an Engineering Agent. Any agent reject returns to the previous stage.


## 7. Required Inputs

1. Failure logs, Harness audit-trail references, and repro steps.
2. Recent diffs, configuration, and Harness run ids if the failure is pipeline-related.
3. Severity classification.

## 8. Required Outputs

1. RCA note  Ebrief for S2/S3, formal for S0/S1.
2. Fix commits plus a regression test.
3. Follow-up items filed for anything discovered but not fixed in this cycle  Enever silently dropped.

## 9. Mandatory Artifacts

| Artifact | Form | Mandatory? |
|---|---|---|
| RCA | Incident doc (S0/S1) or PR comment (S2/S3) | Yes |
| Regression test | In the same change set when feasible | Yes unless technically infeasible, with reason stated |
| Follow-up Backlog items | Linked, not left as informal notes | Yes when scope was intentionally deferred |

## 10. Workflow

1. Classify severity (`S0`–`S3`) based on production impact and SoR integrity risk.
2. Establish a reliable repro **before** attempting any fix  Especulative rewrites without repro are forbidden.
3. Gather evidence: logs, recent diffs, Harness audit-trail entries, run ids.
4. Diagnose root cause; state it with the supporting evidence, not a guess.
5. Scope the fix to the root cause plus a minimal regression test  Eresist "while I'm in here" expansion.
6. If scope expansion seems warranted (e.g., the root cause reveals a systemic issue), get Tech Lead approval explicitly before proceeding beyond the minimal fix.
7. Verify the fix: re-run the repro, run the regression test, confirm the original failure signal is gone.
8. Write the RCA at the severity-appropriate depth.
9. File follow-up Backlog items for anything discovered but intentionally deferred.
10. For S0/S1 production fixes: route through the emergency Release path with post-facto review recorded.
11. Return the verified fix to Testing/Code Review (or directly to the emergency Release path for S0/S1, per [09_RELEASE.md](./09_RELEASE.md)).

## 11. Decision Rules

| Situation | Rule |
|---|---|
| No repro can be established | Do not ship a speculative fix; escalate for more evidence-gathering (add logging/telemetry as its own minimal, tested change if needed). |
| Root cause implicates a Harness state-machine violation | Cross-reference Harness Spec §4/§8 explicitly; this is not treated as an ordinary application bug. |
| Fix requires touching unrelated code "while I'm here" | Split into a separate task; the debugging fix ships alone. |
| Production is actively degraded (S0) | Incident Commander may authorize emergency hotfix path per [09_RELEASE.md](./09_RELEASE.md) with mandatory post-facto review within SLA. |
| Root cause is unclear after reasonable investigation time | Escalate severity/visibility rather than merging a guess; document the investigation dead-ends in the RCA. |

## 12. Review Checklist

- [ ] Repro established before the fix was written.
- [ ] Root cause stated with supporting evidence, not conjecture.
- [ ] Fix is scoped to the cause; no unrelated changes bundled in.
- [ ] Regression test added in the same change set (or reason given if infeasible).
- [ ] No secrets exposed in logs, RCA notes, or debugging artifacts.
- [ ] Fix does not disable or weaken any gate.

## 13. Exit Checklist

- [ ] Root cause stated with evidence.
- [ ] Fix limited to cause plus minimal regression test.
- [ ] Verification re-run passes.
- [ ] Incident notes filed for S0/S1.

## 14. Examples

**Example 1 (S2).** A regression test for retry backoff jitter fails intermittently in CI. Repro: run the test 50x locally, fails ~1/10. Root cause: jitter calculation used a shared, non-seeded RNG causing rare boundary collisions. Fix: seed RNG per test invocation; add an assertion covering the boundary case. Verified: 200 local runs, 0 failures. RCA: PR comment, 4 sentences.

**Example 2 (S0).** A Harness pipeline run enters an illegal state transition (`SUCCEEDED` ↁE`RUNNING`) discovered via audit-trail anomaly detection, risking duplicate SoR writes. Incident Commander declares S0. Repro established via replaying the audit log. Root cause: a retry path re-admitted an already-succeeded invocation due to a missing idempotency check. Emergency hotfix ships within SLA with a targeted idempotency-key check and a regression test; formal incident doc filed; post-facto review scheduled within 48h per [09_RELEASE.md](./09_RELEASE.md).

## 15. Acceptance Criteria

- Root cause stated with evidence.
- Fix limited to cause plus minimal regression test.
- Verification re-run passes.
- Incident notes exist for S0/S1.

## 16. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| "Fix" by deleting tests or skipping review | The failing test disappears instead of the bug | Reject; restore the test; find the real fix |
| Unreproducible changes merged "just in case" | A speculative diff ships with no confirmed root cause | Revert; require proper repro before re-attempting |
| Cross-tenant data used unlawfully for repro | Debugging pulls another tenant's data to reproduce an issue | Immediate incident review; this is a Constitution Art. IX/tenancy violation regardless of intent |

## 17. Rollback Procedure

If a debugging fix is later found to be wrong or incomplete: revert the fix, re-open the Debugging cycle with the new evidence, and do not attempt a second speculative patch without a fresh, confirmed repro. For S0/S1, rollback of the hotfix itself follows the emergency Release rollback plan recorded at hotfix time.

## 18. Best Practices

1. Always reproduce before you fix  Ea fix for an unreproduced bug is a guess wearing a diff.
2. Write the RCA while the context is fresh, not days later from memory.
3. Keep the fix and the regression test in the same commit/PR whenever feasible.
4. For Harness-related failures, check the state machine and audit trail rules first  Emost "weird" failures are illegal-transition symptoms, not application logic bugs.

## 19. Anti-patterns

- **Shotgun debugging**: changing multiple unrelated things hoping one fixes it, with no isolated repro.
- **Silent scope creep**: turning a bug fix into an uncoordinated refactor.
- **RCA-as-afterthought**: closing the incident without ever writing down the root cause.
- **Repeat-root-cause blindness**: fixing the same class of bug repeatedly without ever addressing the systemic cause (a Retrospective theme, see [10_RETROSPECTIVE.md](./10_RETROSPECTIVE.md)).

## 20. Metrics

| Metric | Definition | Target |
|---|---|---|
| MTTD / MTTR | Mean time to detect / mean time to resolve | Trending down |
| % incidents with RCA | Incidents with a filed RCA ÷ total | 100% for S0/S1 |
| Recurrence of same root cause | Repeat incidents sharing a root cause | Trending down |
| Hotfix escape rate | Hotfixes that themselves needed a follow-up fix | Trending down |

## Stage Handoff

Verified fix ↁEresume **Testing** / **Code Review**. Production incidents ↁEemergency **Release** path ([09_RELEASE.md](./09_RELEASE.md)) then **Retrospective** ([10_RETROSPECTIVE.md](./10_RETROSPECTIVE.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. V, IX, XIII
- [/harness/HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md)  E§4 (State Machine), §8 (Failure Recovery)
- [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md)
- [06_TESTING.md](./06_TESTING.md)
- [09_RELEASE.md](./09_RELEASE.md)
- [10_RETROSPECTIVE.md](./10_RETROSPECTIVE.md)

**End of 07  EDebugging v2.0.0**
