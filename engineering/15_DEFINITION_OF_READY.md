# 15  EDefinition of Ready

**Version:** 2.2.0
**Status:** Binding  EImmutable Gate
**Effective:** 2026-07-22
**Owner:** Chief Engineering Officer · Product Owner
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. III, VIII, XII, XIII · [02_BACKLOG.md](./02_BACKLOG.md) · [03_SPRINT.md](./03_SPRINT.md) · [01_SPECIFICATION.md](./01_SPECIFICATION.md)

---

## 1. Purpose

Prevent unschedulable work from entering Sprints. "Ready" means the team can execute without inventing the problem mid-flight. DoR is the hard gate immediately before Sprint commitment  Ethe mirror image of DoD at the other end of the lifecycle.

## 2. Definitions

| Term | Definition |
|---|---|
| **DoR attestation** | The explicit, recorded confirmation that every applicable DoR checkbox is true for a Backlog item. |
| **Estimate band** | A coarse sizing sufficient to compare against Sprint capacity. |
| **Test approach sketch** | A short statement of what will prove the item done  Enot a full test plan, but enough to know testing is feasible. |

## 3. Scope

Applies to every Backlog item before it may be pulled into Sprint commitment ([03_SPRINT.md](./03_SPRINT.md)).

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Product Owner** | Problem clarity: pain, goals, metrics, spec link. |
| **Tech Lead** | Technical readiness: dependencies, ADR status, estimate, test feasibility. |

## 5. Who Owns It

**Product Owner** owns problem-clarity readiness; **Tech Lead** owns technical readiness.

## 6. Who Approves It

DoR requires **Product Owner Agent** and **Tech Lead Agent** approvals at minimum, plus remaining Engineering Agents per §2a for Sprint-bound items, then **Founder Approval** (business only). The Founder does not act as Product Owner or Tech Lead. See [README.md](./README.md) §2a.


## 7. Required Inputs

Spec, Architecture Review verdict, and known dependencies for the candidate item.

## 8. Required Outputs

A DoR attestation recorded on the Backlog item.

## 9. Mandatory Artifacts

| Artifact | Form |
|---|---|
| DoR checklist | Backlog item field/template, fully checked |

## 10. Workflow

1. Product Owner and Tech Lead review the candidate item against the checklist in §11 before Sprint Planning.
2. Any unmet box is resolved before the item is considered for commitment  Eresolving it might mean returning to [01_SPECIFICATION.md](./01_SPECIFICATION.md) for a missing metric, or to Architecture Review for an unresolved `adr_required` verdict.
3. Once every applicable box is true, Product Owner + Tech Lead jointly record acceptance.
4. The item becomes eligible for Sprint commitment per [03_SPRINT.md](./03_SPRINT.md).

## 11. Quality Gates  EDoR Checklist

**Always**

- [ ] Pain/problem statement clear (features) or defect repro clear (bugs).
- [ ] Goal, non-goals, and success metrics stated.
- [ ] Spec link present and approved.
- [ ] Architecture Review verdict recorded (`no_arch_impact` or ADR path clear).
- [ ] Dependencies identified (including ADR predecessors).
- [ ] Estimate band agreed.
- [ ] Test approach sketched (what will prove done).
- [ ] Owner/skill needs identified.
- [ ] No unresolved Constitution/Harness contradictions.

**When touching agents/harness/knowledge**

- [ ] Contracts/schemas/pipelines impacted are listed.
- [ ] Human Approval implications noted.

**Security-sensitive**

- [ ] Egress/ownership/threat notes present.

## 12. Decision Rules

| Situation | Rule |
|---|---|
| Architecture Review verdict is `adr_required` and the ADR is not yet accepted | Item fails DoR for Implementation commitment; it may still be discussed/estimated but not committed for building. |
| Estimate band is disputed | Tech Lead's technical judgment resolves it; if still disputed, split the item smaller until estimable. |
| Test approach cannot be sketched at all | Item is not ready  Ethis usually signals the Spec itself is too vague; return to Specification. |
| A stakeholder pressures "just commit it, we'll figure it out mid-sprint" | Refuse; committing unready work is the exact failure this gate exists to prevent. |

## 13. Review Checklist

- [ ] Every "Always" box is independently true, not assumed.
- [ ] Conditional sections (agent/harness/knowledge, security) correctly triggered and checked.
- [ ] Both Product Owner and Tech Lead have reviewed, not just one role rubber-stamping for both.

## 14. Exit Checklist

- [ ] All applicable DoR checkboxes true.
- [ ] Product Owner + Tech Lead agree the item may be Sprint-committed.

## 15. Examples

**Example 1 (Ready).** `ENG-102` "Add rationale_note field": pain clear (Knowledge Review Agent operators re-derive rationale manually), goal/non-goals/metrics stated in the accepted Spec, Architecture Review `no_arch_impact`, no dependencies, estimate `S`, test approach: "schema conformance test + UI mock field rendering test," owner identified. All boxes true. Accepted for Sprint 14.

**Example 2 (Not Ready).** `ENG-104` "Improve knowledge review flow": Spec exists but Architecture Review returned `adr_required` for a contract precondition change, and ADR-0033 is still in draft. DoR fails on the Architecture Review box; item stays in Backlog, tracked as blocked-on-ADR, not committed.

## 16. Acceptance Criteria

All applicable DoR checkboxes true; Product Owner + Tech Lead agree the item may be Sprint-committed.

## 17. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Committing non-DoR items to Sprint | An item enters commitment with an unchecked box | Remove from commitment immediately; return to Backlog with the specific gap noted |
| "Ready" without metrics or spec | Item marked ready based on verbal discussion only | Reject; require the written Spec and metrics first |
| Ignoring `adr_required` | Item committed for Implementation despite a pending ADR | Halt; treat as a process incident; revert if implementation began |

## 18. Rollback Procedure

If an item is discovered to have been Sprint-committed without meeting DoR, Product Owner + Tech Lead immediately remove it from the committed set per [03_SPRINT.md](./03_SPRINT.md)'s scope-change rule, log the exception, and return the item to Backlog until the missing box is genuinely satisfied.

## 19. Best Practices

1. Run DoR review continuously during Backlog grooming, not only right before Sprint Planning  Ethis avoids a last-minute rush of unready items.
2. Treat an unresolved `adr_required` verdict as a hard blocker, not a "we'll sort it out" footnote.
3. Sketch the test approach early  Eif you cannot imagine how to prove it done, the Spec probably needs more clarity first.

## 20. Anti-patterns

- **Ready theater**: checking every box without genuinely verifying the underlying clarity.
- **Optimistic estimating**: agreeing to an estimate band without truly understanding the dependencies.
- **ADR-ignoring commitment**: treating a pending ADR as a formality that can be back-filled after the fact.

## 21. Metrics

| Metric | Definition | Target |
|---|---|---|
| % committed items DoR-true | Fully-checked items ÷ total committed | 100% |
| Mid-sprint blocked rate due to unreadiness | Items blocked mid-sprint traceable to a DoR gap | 0 |
| DoR exception count | Logged exceptions per period | Trending toward 0 |

## Relation to Lifecycle

Hard gate between **Backlog** and **Sprint Planning** ([02_BACKLOG.md](./02_BACKLOG.md), [03_SPRINT.md](./03_SPRINT.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. III, VIII, XII, XIII
- [02_BACKLOG.md](./02_BACKLOG.md)
- [03_SPRINT.md](./03_SPRINT.md)
- [01_SPECIFICATION.md](./01_SPECIFICATION.md)

**End of 15  EDefinition of Ready v2.0.0**
