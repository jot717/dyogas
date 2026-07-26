# 10  ERetrospective

**Version:** 2.2.0
**Status:** Binding  EEngineering Process Law
**Effective:** 2026-07-22
**Lifecycle stage:** Retrospective
**Owner:** Engineering Manager / Facilitator · Action owners
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. VII · [02_BACKLOG.md](./02_BACKLOG.md) · [03_SPRINT.md](./03_SPRINT.md) · [07_DEBUGGING.md](./07_DEBUGGING.md) · [09_RELEASE.md](./09_RELEASE.md)

---

## 1. Purpose

Convert delivery evidence into durable process and product improvements  Ewithout blame theater or unlogged "we should..." wishes. Retrospective is the stage that closes the loop from Release back to Backlog, ensuring the lifecycle actually learns.

## 2. Definitions

| Term | Definition |
|---|---|
| **Retro** | The retrospective session/record itself. |
| **Action** | A concrete, owned, dated commitment to change something, filed as a Backlog item. |
| **Theme** | A recurring pattern across incidents/metrics worth naming even if no single action fully resolves it. |
| **Blame theater** | Discussing individual fault instead of systemic cause  Eexplicitly avoided; retros are about the system, not the person. |

## 3. Scope

Runs on a fixed cadence (recommended: end of every Sprint) and additionally after any S0/S1 incident or major release. Applies to the team's own delivery data  Enot a generic brainstorming session with no evidence base.

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Facilitator** | Running the session; keeping it evidence-based and blame-free. |
| **Participants** | Contributing honestly, including AI-agent-observed metrics where relevant. |
| **Action owners** | Executing their assigned action by the due date. |

## 5. Who Owns It

**Engineering Manager / Facilitator** owns running the Retrospective and filing its outputs.

## 6. Who Approves It

Approvals follow [README.md](./README.md) §2a: Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) each emit review artifacts; **Founder Approval** is business-only after all required Engineering Agents approve. The Founder never replaces an Engineering Agent. Any agent reject returns to the previous stage.


## 7. Required Inputs

1. Sprint/release metrics (commitment reliability, defect counts, MTTR, gate-failure themes).
2. Incidents and their RCAs from the period.
3. Gate-failure themes from DoR/DoD, Code Review, and Harness audit trails.

## 8. Required Outputs

A written retro record plus an action list (≤5 concrete actions with owners and due dates, per §12).

## 9. Mandatory Artifacts

| Artifact | Form | Mandatory? |
|---|---|---|
| Retro notes | Team SoR doc/issue | Yes |
| Action Backlog items | Linked into the Single Backlog | Yes |
| Decision Log entries | When process standards change | When applicable |

## 10. Workflow

1. Facilitator gathers the period's metrics and incident RCAs before the session  Eretro is evidence-based, not vibes-based.
2. Session opens by reviewing what went well, what did not, and what surprised the team, grounded in the gathered evidence.
3. Group observations into themes; look explicitly for recurrence (same root cause twice = a systemic theme, not a coincidence).
4. Distill themes into **at most 5** concrete actions, each with a single owner and a due date.
5. File each action as a Backlog item (type `debt`, `chore`, or `security` as appropriate)  Eactions live in the Single Backlog, not in a separate "retro doc" that nobody revisits.
6. Log any material decision (e.g., "we will require an extra regression suite for X going forward") in the Decision Log.
7. If a theme implies a change to an `/engineering` standard itself, route it as a Specification for a process change ([01_SPECIFICATION.md](./01_SPECIFICATION.md)), version-bump the affected document upon acceptance.
8. Learning Agent (or equivalent AI summarizer) may propose lessons/patterns from the data; adoption still requires human review and acceptance  Eit does not auto-write process changes.

## 11. Decision Rules

| Situation | Rule |
|---|---|
| More than 5 candidate actions emerge | Prioritize the top 5 by impact; park the rest explicitly rather than committing to an unrealistic list. |
| A theme recurs from a prior retro with no completed action | Escalate visibly  Edo not simply re-log the same action a third time without addressing why it stalled. |
| A proposed action would waive a Constitution/Harness rule | Rejected outright  Eretros cannot vote to override binding law. |
| An AI agent's summary conflicts with a participant's direct account | Human first-hand account takes precedence; AI summary is a starting draft, not authoritative. |

## 12. Review Checklist

- [ ] Retro is grounded in real metrics/incidents, not just impressions.
- [ ] Discussion stayed systemic, not personal blame.
- [ ] Actions are concrete (not "improve quality" with no measurable signal).
- [ ] Every action has exactly one owner and a due date.

## 13. Exit Checklist

- [ ] Written retro notes exist.
- [ ] ≤5 concrete actions with owners and due dates filed.
- [ ] Actions filed in the Single Backlog.
- [ ] Material decisions recorded in the Decision Log.
- [ ] Learning Agent lessons (if any) reviewed and explicitly accepted or declined by a human.

## 14. Examples

**Example 1.** Sprint 14 retro reviews: commitment reliability 78% (below the 85% baseline), one S2 flake-related incident, zero DoR exceptions. Theme: "estimate bands consistently underweight schema-migration tasks." Action: "Tech Lead adds a schema-migration multiplier to estimate guidance; owner: Tech Lead; due: before Sprint 15 planning." Filed as `ENG-140` (`chore`).

**Example 2  Epost-incident.** After the S0 Harness state-machine incident, retro reviews the RCA. Theme: "idempotency checks are inconsistently applied across retry paths." Action: "audit all retry paths for idempotency-key enforcement; owner: Tech Lead; due: 2 weeks." Filed as `ENG-141` (`security`). Decision Log entry records the systemic gap and the audit commitment.

## 15. Acceptance Criteria

Written retro notes exist; ≤5 concrete actions with owners and due dates; actions filed in the Single Backlog; material decisions in the Decision Log; Learning Agent lessons (if any) explicitly reviewed before adoption.

## 16. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Retro with zero actions, repeatedly | Sessions happen but nothing changes | Escalate to Chief Engineering Officer; investigate whether retros are being run in good faith |
| Actions not filed in Backlog | Actions exist only as meeting notes | File immediately; treat as incomplete retro until filed |
| Using retro to justify skipping tests/approvals | "We're always slow because of testing, let's cut it" proposed as an action | Reject; this would waive Constitution Art. V  Enot a valid retro action |

## 17. Rollback Procedure

If an accepted action is later found to be wrong (e.g., it would have violated a Constitution article had it been implemented), the team reconvenes, withdraws the action with a logged reason, and replaces it with a compliant alternative if the underlying theme still needs addressing.

## 18. Best Practices

1. Ground every discussion point in a metric or a specific incident, not a general feeling.
2. Keep the action list short and real  E3 completed actions beat 8 half-finished ones.
3. Revisit prior retro actions at the start of the next retro to check completion before generating new ones.
4. Separate "systemic process fix" themes from "one-off bad luck"  Eonly the former needs a standing action.

## 19. Anti-patterns

- **Blame theater**: retro devolves into pointing at individuals instead of systems.
- **Wishlist retro**: a long list of "we should"s with no owners or dates, none of which are ever revisited.
- **Retro-as-therapy-only**: venting without ever producing an action, repeatedly.
- **Process override by vote**: using retro consensus to informally waive a binding Constitution/Harness rule.

## 20. Metrics

| Metric | Definition | Target |
|---|---|---|
| Action completion rate | Actions completed by due date ÷ total actions | Trending up |
| Recurrence of same theme | Themes repeating across consecutive retros with no resolution | Trending down |
| Defect/escape trend | Escaped defects per period, tracked over time | Trending down |
| Process amendment lead time | Time from a retro-identified process gap to an accepted `/engineering` amendment | Trending down |

## Stage Handoff

Actions ↁE**Backlog** ([02_BACKLOG.md](./02_BACKLOG.md)). Standard amendments ↁEupdate the relevant `/engineering` document + Decision Log entry (+ ADR if architecture/process topology changes).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. VII
- [02_BACKLOG.md](./02_BACKLOG.md)
- [03_SPRINT.md](./03_SPRINT.md)
- [07_DEBUGGING.md](./07_DEBUGGING.md)
- [09_RELEASE.md](./09_RELEASE.md)

**End of 10  ERetrospective v2.0.0**
