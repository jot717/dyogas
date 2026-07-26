# 13  EDocumentation Standard

**Version:** 2.2.0
**Status:** Binding  EImmutable Standard
**Effective:** 2026-07-22
**Owner:** Chief Engineering Officer (policy) · Chief Systems Architect (system docs) · Change author (per-change compliance)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. IV · [01_SPECIFICATION.md](./01_SPECIFICATION.md) · [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md) · [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)

---

## 1. Purpose

Keep the Engineering OS and product intent truthful: documentation is part of the product, updated with behavior, not after it (Constitution Art. IV). This document defines what "documented" means and where each kind of truth lives.

## 2. Definitions

| Term | Definition |
|---|---|
| **Binding surface** | A document whose content is enforceable process/architecture law: `/CONSTITUTION.md`, `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas`, `/engineering`. |
| **Orphan doc** | A document describing behavior that no longer exists, or behavior that exists but is undocumented  Eboth are failures. |
| **Doc-code drift** | The gap between what a binding surface says and what the system/process actually does. |
| **Doc Owner** | The role accountable for a given layer's accuracy (see Layer table in §9). |

## 3. Scope

Applies to any change affecting user-visible behavior, contracts, schemas, harness rules, process, or public interfaces, and to any new durable decision requiring a Decision Log entry or ADR.

## 4. Responsibilities

| Role | Responsible for |
|---|---|
| **Change author** | Updating the relevant docs in the same change set as the behavior change. |
| **Doc Owner (per layer)** | Long-term accuracy of their layer. |
| **Reviewers** | Rejecting PRs that change behavior without updating the corresponding docs. |

## 5. Who Owns It

**Change author** owns the immediate update; the **Doc Owner per layer** (see §9) owns ongoing accuracy.

## 6. Who Approves It

Approvals follow [README.md](./README.md) §2a: Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) each emit review artifacts; **Founder Approval** is business-only after all required Engineering Agents approve. The Founder never replaces an Engineering Agent. Any agent reject returns to the previous stage.


## 7. Required Inputs

The diff of behavior being introduced/changed, and the Single Source of Truth map (Constitution's Engineering OS Layout).

## 8. Required Outputs

Updated markdown/schemas/ADRs/process docs, committed in the same change set as the behavior they describe.

## 9. Mandatory Artifacts  ELayer Map

| Layer | Path | Doc Owner |
|---|---|---|
| Root law | `/CONSTITUTION.md` | Chief Systems Architect |
| Product/architecture | `/docs` | Product Owner + Architect |
| Execution | `/harness` | Chief Systems Architect |
| Contracts/pipelines/artifacts/schemas | respective roots | Contract/Pipeline/Artifact/Schema Owners per surface |
| Process | `/engineering` | Chief Engineering Officer |
| ADRs | `/docs/adr` | Chief Systems Architect |
| Decision Log | `/docs/adr/README.md` ↁEsection **Decision Log Entries (Append-Only)** (Constitution Art. VII SoR until a relocating ADR) | Chief Engineering Officer (process); named owner per entry |

## 10. Workflow

1. Change author identifies which binding surface(s) their behavior change touches, using the Layer Map (§9).
2. Update those surfaces **in the same PR** as the behavior change  Enever "docs in a follow-up."
3. Confirm cross-links between the changed doc and its siblings remain valid.
4. If the change is binding-surface-significant (not editorial), bump the document's version per its own header convention.
5. Reviewer checks doc updates against the Review Checklist (§13) as part of Code Review.
6. For AI-generated docs on binding surfaces, a human explicitly accepts the content before merge  Eit is not auto-accepted because it "looks right."
7. If the change is a new durable decision (not just a doc edit), also file a Decision Log entry, and an ADR if architecture-impacting.

## 11. Decision Rules

| Situation | Rule |
|---|---|
| Code changes an Agent Contract's behavior but the PR doesn't touch `/contracts` | Reject the PR at Code Review; docs are not optional for behavior changes (Constitution Art. IV). |
| A Spec precedes non-trivial implementation | Required  ESpecs precede implementation, not the reverse, except for genuinely trivial fixes. |
| Two docs describe the same capability differently | Treat as doc-code drift; resolve immediately by consolidating to the Single Source of Truth. |
| A mock/planned feature is described as if shipped | Forbidden  Emock features must be clearly labeled as such, never presented as shipped capability. |

## 12. Review Checklist

- [ ] Every binding surface touched by the behavior change is updated in this same change set.
- [ ] Cross-links to sibling docs are valid.
- [ ] Version bumped when the binding doc's substantive content changed.
- [ ] No orphaned prose describing removed behavior.
- [ ] AI-generated docs on binding surfaces carry explicit human acceptance.
- [ ] No mock feature presented as shipped capability.

## 13. Exit Checklist

- [ ] Authoritative layer updated (no orphan README lies).
- [ ] Cross-links valid.
- [ ] Version bumped when binding docs change.
- [ ] Update landed in the same change set as the code/process change.

## 14. Examples

**Example 1 (compliant).** `ENG-102`'s PR updates `/schemas/artifacts/human-review-decision.schema.json` **and** `/artifacts/human-review-decision.md` prose **and** bumps the schema's minor version, all in the same PR that adds the `rationale_note` field.

**Example 2 (drift, rejected).** A PR changes the Embedding Agent's retry ceiling in code/config but does not touch `/contracts/agents/embedding-agent.md`. Reviewer rejects per §11 rule 1; author must update the contract in the same PR.

## 15. Acceptance Criteria

Authoritative layer updated; cross-links valid; version bumped when binding docs change; update lands in the same change set as the behavior it describes.

## 16. Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Code merges with stale contracts/schemas | Behavior and doc disagree | Treat as a defect; fix docs immediately; consider blocking further merges to that surface until resolved |
| Parallel conflicting guides | Two docs give different instructions for the same process | Consolidate to one; deprecate/redirect the other explicitly |
| "Docs later" on protected merges | PR merges with a promise to document afterward | Reject the PR; docs are part of DoD, not a follow-up |

## 17. Rollback Procedure

If doc-code drift is discovered post-merge, file it as a `docs`-type Backlog item with `S2` urgency (or higher if it affects a security/ownership-relevant surface), fix the drift in a dedicated PR, and note the gap at the next Retrospective if it reveals a systemic review gap.

## 18. Best Practices

1. Update docs in the same commit as the code, not the same PR-but-later-commit  Ereviewers should see them together.
2. Prefer linking to the Single Source of Truth over restating it elsewhere.
3. Write for a new engineer with zero tribal knowledge  Ethat is the actual bar for "documented."
4. Keep version headers current; a document claiming v1.0.0 while its content has clearly evolved is itself a drift signal.

## 19. Anti-patterns

- **Docs-as-afterthought**: "I'll write the docs once this stabilizes"  Eit never stabilizes on schedule.
- **Copy-paste drift**: duplicating explanation across multiple docs that then diverge over time.
- **Mock-as-shipped**: describing a planned feature without labeling it as unshipped/mock.
- **Version amnesia**: substantive changes with no version bump, making it impossible to know what changed when.

## 20. Metrics

| Metric | Definition | Target |
|---|---|---|
| Doc-code drift incidents | Discovered drift cases per period | Trending down |
| Broken link rate | Cross-links resolving to nonexistent files/sections | 0 |
| Time-to-update binding docs after behavior change | Should be ~0 (same change set) | 0 exceptions |

## Relation to Lifecycle

Gates Specification, Implementation, Review, Release, Retrospective ([01_SPECIFICATION.md](./01_SPECIFICATION.md), [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md), [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)).

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. IV
- [01_SPECIFICATION.md](./01_SPECIFICATION.md)
- [05_IMPLEMENTATION.md](./05_IMPLEMENTATION.md)
- [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)

**End of 13  EDocumentation Standard v2.0.0**
