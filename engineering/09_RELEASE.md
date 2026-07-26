# 09  ERegression, Merge & Release

**Version:** 2.2.0
**Status:** Binding  EEngineering Process Law
**Effective:** 2026-07-22
**Lifecycle stages:** Regression · Merge · Release
**Owner:** Engineering Manager Agent / Release process · Product Owner Agent (readiness) · Founder (production business go/no-go only)
**Approvers:** Engineering Agents (Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer) → Founder Approval (business only)
**Operating Mode:** AI-Native Engineering Agent Approval — see [README.md](./README.md) §2a. Engineering Agents approve independently; Founder Approval is business-only and never replaces an Engineering Agent.
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) Art. III, V, VI · [08_CODE_REVIEW.md](./08_CODE_REVIEW.md) · [11_BRANCHING.md](./11_BRANCHING.md) · [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md) · [10_RETROSPECTIVE.md](./10_RETROSPECTIVE.md) · [/harness/HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md)

This document has three parts covering three sequential lifecycle stages: **A. Regression**, **B. Merge**, **C. Release**.

---

## A. Regression

### A.1 Purpose

Verify the change set does not break critical paths beyond unit/component scope before merge to protected branches. Regression is the last automated safety net before integration.

### A.2 Definitions

| Term | Definition |
|---|---|
| **Regression suite** | A test suite exercising critical paths broader than the unit under change, selected by a risk map. |
| **Risk map** | The declared mapping of change type/surface to which regression suites are required. |
| **Critical path** | A user- or agent-facing flow whose failure has outsized impact (e.g., the canonical knowledge-ingestion pipeline). |

### A.3 Scope

Applies to every PR approved at Code Review before it merges to a protected branch. High-risk labels (Harness, contract, schema, security) always require the full relevant regression suite; low-risk docs-only changes may be exempt per the risk map.

### A.4 Responsibilities

| Role | Responsible for |
|---|---|
| **Task Owner** | Triggering and triaging regression results for their PR. |
| **Release Engineer** | Maintaining the risk map; running full regression for release trains. |
| **Tech Lead** | Requiring extra suites for unusually risky changes. |

### A.5 Who Owns It

**Task Owner** owns triaging results for their own PR; **Release Engineer** owns the risk map and release-train-wide regression runs.

### A.6 Who Approves It

**Tech Lead Agent** and **Architecture Reviewer Agent** may require additional regression suites. Engineering Agents approve regression readiness via review artifacts. Founder does not perform engineering regression approval. See [README.md](./README.md) §2a.


### A.7 Required Inputs

Approved PR; required CI green; regression suite selection based on the risk map.

### A.8 Required Outputs

A regression report: which suites ran, pass/fail per suite, triage notes for any failure.

### A.9 Mandatory Artifacts

| Artifact | Form |
|---|---|
| CI run ids | Linked on the PR |
| Regression report | Attached to the PR or release train record |

### A.10 Workflow

1. Release Engineer/Tech Lead confirms which regression suites the risk map requires for this PR's surface area.
2. Task Owner triggers the required suites.
3. Any failure is triaged: real regression (block, return to Implementation) vs. known flake with an owner and ticket (does not block, but is tracked).
4. Evidence (run ids, report) is linked on the PR.
5. Once required suites pass (or all failures are lawfully triaged as known flakes), the PR proceeds to Merge.

### A.11 Decision Rules

| Situation | Rule |
|---|---|
| Change touches the canonical knowledge-ingestion pipeline stages | Full pipeline regression suite is mandatory, no exceptions. |
| Change is docs-only with an empty Interface Impact List | Regression suite may be skipped per the risk map. |
| A regression failure is ambiguous (real vs. flake) | Default to treating it as real until proven otherwise  Efail closed. |

### A.12 Review Checklist

- [ ] Correct suites selected per the risk map for this change's surface.
- [ ] All failures triaged explicitly (blocking vs. known flake with owner).
- [ ] Evidence linked, not just asserted.

### A.13 Exit Checklist

- [ ] Required regression suites pass.
- [ ] Failures triaged (block vs. known flake with owner).
- [ ] Evidence linked on the PR.

### A.14 Examples

**Example.** A PR changes the Embedding Agent's contract precondition. Risk map requires the full knowledge-ingestion regression suite (Research ↁEValidation ↁEProposal ↁEHuman Review ↁEMarkdown ↁEGraph ↁEEmbedding ↁEMemory smoke path). Suite runs; one unrelated flaky test in the Graph stage is already tracked as `FLAKE-19`; all else passes. PR proceeds to Merge with the flake noted, not re-litigated.

### A.15 Acceptance Criteria

Required regression suites pass; failures triaged; evidence linked.

### A.16 Failure Cases

| Failure | Response |
|---|---|
| Ignoring red critical-path regression | Block merge; return to Implementation/Debugging |
| Suite selection skipped entirely for a high-risk change | Treat as a process violation; re-run before Merge |

### A.17 Rollback Procedure

If a regression gap is discovered post-merge, open a Debugging cycle, backfill the missing suite run against the merged state, and add the missed suite to the risk map if the gap was a risk-map defect.

### A.18 Best Practices

Keep the risk map current as new critical paths are added; review it whenever a new pipeline or contract ships.

### A.19 Anti-patterns

**Suite dodging**: relabeling a high-risk change as low-risk to skip regression.

### A.20 Metrics

| Metric | Definition | Target |
|---|---|---|
| Regression catch rate | Real regressions caught here vs. escaping to production | Trending toward catching the majority here |
| Duration | Time to complete required regression suites | Trending down without sacrificing coverage |
| Flake rate | % of regression failures that are known flakes | Trending down |

---

## B. Merge

### B.1 Purpose

Integrate only DoD-complete work into protected branches via the prescribed strategy  Enever force-pushing shared history without an explicit, logged executive exception.

### B.2 Definitions

| Term | Definition |
|---|---|
| **Merge strategy** | The team's chosen method (merge commit, squash, rebase) fixed by ADR/team-tooling decision, applied consistently. |
| **Merger with rights** | A human authorized to merge to the protected branch; unattended bots require an explicit policy ADR to merge autonomously. |

### B.3 Scope

Applies to every PR that has passed Code Review and Regression.

### B.4 Responsibilities

| Role | Responsible for |
|---|---|
| **Merger with rights** | Executing the merge correctly and only when gates are green. |
| **Task Owner** | Updating the Backlog item state post-merge. |

### B.5 Who Owns It

The **Merger with rights** (a human) owns the merge action itself.

### B.6 Who Approves It

Merge to protected branches requires Engineering Agent approvals per §2a (at minimum Tech Lead Agent + Architecture Reviewer Agent + Engineering Manager Agent process compliance). Founder does not replace code/merge engineering review. Founder business approval applies only when release policy requires it after agents approve.


### B.7 Required Inputs

Approved PR; reviews and regression green; no active merge freeze (unless hotfix exception).

### B.8 Required Outputs

A merge commit on the protected branch; updated Backlog item state (`done` / `released-pending`).

### B.9 Mandatory Artifacts

| Artifact | Form |
|---|---|
| Merge record | Merge commit + item state update |

### B.10 Workflow

1. Confirm DoD is met ([14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)).
2. Confirm reviews and regression are green.
3. Confirm no active merge freeze applies (unless this is a declared hotfix exception).
4. Merge via the allowed strategy per [11_BRANCHING.md](./11_BRANCHING.md).
5. Delete the branch when policy specifies.
6. Update the Backlog item's state.

### B.11 Decision Rules

| Situation | Rule |
|---|---|
| Merge freeze is active (e.g., pending release stabilization) | Only hotfix exceptions merge, with Incident Commander sign-off. |
| An unattended bot attempts to merge | Denied unless a specific policy ADR authorizes it for a narrow, low-risk class of change. |
| DoD is incomplete | Merge is blocked regardless of deadline pressure. |

### B.12 Review Checklist

- [ ] DoD fully met.
- [ ] Protected branch rules enforced (no `--no-verify`, no forged approvals).
- [ ] Correct merge strategy used.

### B.13 Exit Checklist

- [ ] Merged via allowed strategy.
- [ ] Branch deleted when policy says so.
- [ ] Backlog item updated.

### B.14 Examples

**Example.** `ENG-102`'s final PR passes Code Review and Regression; DoD checklist is fully checked; a human Merger with rights squash-merges per the team's ADR-selected strategy, deletes the branch, and sets the Backlog item to `released-pending` awaiting the next Release train.

### B.15 Acceptance Criteria

Merged via allowed strategy; branch deleted per policy; Backlog item updated.

### B.16 Failure Cases

| Failure | Response |
|---|---|
| `--no-verify` used to bypass hooks | Revert; incident review; re-merge properly |
| Forged approvals | Immediate incident review; access audit |
| Direct push to protected branch | Revert; fix branch protection configuration |

### B.17 Rollback Procedure

Revert the merge commit cleanly (never force-push over shared history); restore the Backlog item to its pre-merge state; re-open the PR path.

### B.18 Best Practices

Keep merge strategy consistent across the repo; document it once in the team-tooling ADR rather than debating it per PR.

### B.19 Anti-patterns

**Merge-and-pray**: merging with a known but "probably fine" gap in DoD.

### B.20 Metrics

| Metric | Definition | Target |
|---|---|---|
| Merge lead time | Time from approval to merge | Trending down |
| Revert rate | Merges later reverted ÷ total merges | Trending down |

---

## C. Release

### C.1 Purpose

Ship a known artifact version to an environment with auditability, a rollback plan, and Human Approval for production (Constitution Art. III).

### C.2 Definitions

| Term | Definition |
|---|---|
| **Release candidate** | A specific commit/tag/version proposed for deployment. |
| **Rollback plan** | A stated, concrete procedure to revert the environment to its last known-good state. |
| **Release train** | A batched, scheduled release; hotfixes are the exception path outside the train. |

### C.3 Scope

Applies to every deployment to a shared or production environment.

### C.4 Responsibilities

| Role | Responsible for |
|---|---|
| **Release Engineer** | Executing the release, verifying health checks. |
| **Product Owner** | Production go/no-go decision. |
| **On-call** | Monitoring post-deploy and executing rollback if needed. |

### C.5 Who Owns It

**Release Engineer** owns release execution; **Product Owner** owns the production go/no-go decision.

### C.6 Who Approves It

Production release: all required **Engineering Agents** must approve readiness (review artifacts). **Founder Approval** is the final **business** go/no-go only — never a substitute for Engineering Agent verdicts. Emergency hotfix: Engineering Agents still record post-facto review artifacts; Founder records business acceptance. AI cannot alone approve production.


### C.7 Required Inputs

1. Release candidate identity (commit SHA/tag/version).
2. Draft changelog/release notes.
3. A stated rollback plan.
4. Security/ownership checks for the candidate.

### C.8 Required Outputs

1. Version tag / release record.
2. Release notes.
3. Post-deploy verification result.

### C.9 Mandatory Artifacts

| Artifact | Form | Mandatory? |
|---|---|---|
| Release record | Tag + notes + Decision/approval log for production | Yes |
| Rollback plan | Embedded in the release record | Yes |

### C.10 Workflow

1. Release Engineer identifies the release candidate by immutable commit SHA.
2. Draft changelog/release notes from merged PR descriptions.
3. State the rollback plan concretely (e.g., "redeploy tag v2.3.1; no destructive migration in this release, so rollback is a plain redeploy").
4. Run security/ownership checks appropriate to the candidate's changes.
5. For production: obtain Human Approval (Product Owner + Tech Lead/Release Engineer) and record it.
6. Deploy to the target environment with the recorded version.
7. Run smoke/health checks; confirm pass.
8. Complete audit/notification steps.
9. Monitor post-deploy per the on-call rotation; execute the rollback plan immediately if health checks regress.

### C.11 Decision Rules

| Situation | Rule |
|---|---|
| Release includes a Harness/SoR-affecting change | Requires explicit approval beyond the default production sign-off; treat as higher scrutiny. |
| A known Sev-1 is open | Do not ship; fix or explicitly, jointly waive with a Decision Log entry and expiration. |
| Emergency hotfix needed outside the release train | Incident Commander authorizes; post-facto review is mandatory within SLA, never optional. |
| Schema/contract changes are undocumented at release time | Block release; documentation is part of DoD, not a follow-up. |

### C.12 Review Checklist

- [ ] Release candidate identified by immutable commit SHA.
- [ ] Rollback plan is concrete and specific to this release's changes.
- [ ] No undocumented schema/contract breaks.
- [ ] Feature flags default-off for high-risk changes where applicable.
- [ ] Harness/SoR changes have explicit approval beyond default sign-off.

### C.13 Exit Checklist

- [ ] Deployed to target environment with recorded version.
- [ ] Smoke/health checks pass.
- [ ] Audit/notification complete.
- [ ] Production: human approval recorded.

### C.14 Examples

**Example 1 (normal train).** Release `v2.4.0` bundles `ENG-102`, `ENG-107`, `ENG-109`. Release notes drafted from PR descriptions. Rollback plan: "redeploy `v2.3.2`; no data migration in this release." Product Owner + Release Engineer approve; deployed; smoke checks green; Decision Log entry recorded for the production approval.

**Example 2 (emergency hotfix).** The S0 incident from [07_DEBUGGING.md](./07_DEBUGGING.md) Example 2 requires an out-of-train hotfix. Incident Commander authorizes deployment of the idempotency-key fix immediately; rollback plan: "redeploy prior tag; the fix is additive and safe to roll back." Post-facto review completed within 48h, confirming the emergency authorization was justified and documenting lessons for Retrospective.

### C.15 Acceptance Criteria

Deployed to target environment with recorded version; smoke/health checks pass; audit/notification complete; production human approval recorded.

### C.16 Failure Cases

| Failure | Symptom | Response |
|---|---|---|
| Untagged "mystery" prod deploys | No traceable commit/tag for what's running | Immediate incident review; establish traceability before further releases |
| Missing rollback plan | Release record has no stated rollback | Block release until stated |
| Shipping with known Sev-1 | Release proceeds despite an open critical defect | Block; fix or lawfully waive with Decision Log + expiration |
| Constitution/Harness bypass in release tooling | Automation quietly skips the approval step | Immediate incident review; fix the tooling; treat as a Critical severity per Constitution Enforcement table |

### C.17 Rollback Procedure

Execute the stated rollback plan immediately upon health-check regression or confirmed defect: redeploy the last known-good tag, verify health checks return to baseline, notify stakeholders, and open a Debugging cycle to root-cause before attempting the release again.

### C.18 Best Practices

1. Write the rollback plan before deploying, not after something breaks.
2. Keep release notes traceable to real merged PRs, not hand-wavy summaries.
3. Default high-risk changes to feature-flagged and off, enabling a fast kill switch independent of full rollback.
4. Treat every production release as an opportunity to rehearse the rollback plan mentally, even if it is never needed.

### C.19 Anti-patterns

- **YOLO deploy**: shipping to production without a rollback plan because "it's a small change."
- **Approval theater**: recording a human approval that was never actually reviewed.
- **Hotfix normalization**: routinely using the emergency path to avoid the regular release train's rigor.

### C.20 Metrics

| Metric | Definition | Target |
|---|---|---|
| Release frequency | Releases per period | Team-baseline; trending toward smaller, more frequent releases |
| Failed deploy rate | Deploys requiring rollback ÷ total deploys | Trending down |
| MTTR rollback | Time from failure detection to successful rollback completion | Trending down |
| % prod releases with approval records | Complete records ÷ total prod releases | 100% |
| Change fail rate | Deploys causing a production incident ÷ total deploys | Trending down |

---

## Stage Handoff

Release complete ↁE**Retrospective** ([10_RETROSPECTIVE.md](./10_RETROSPECTIVE.md)) on cadence or after major incidents.

## References

- [/CONSTITUTION.md](../CONSTITUTION.md)  EArt. III, V, VI
- [/harness/HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md)
- [08_CODE_REVIEW.md](./08_CODE_REVIEW.md)
- [11_BRANCHING.md](./11_BRANCHING.md)
- [14_DEFINITION_OF_DONE.md](./14_DEFINITION_OF_DONE.md)
- [10_RETROSPECTIVE.md](./10_RETROSPECTIVE.md)

**End of 09  ERegression, Merge & Release v2.0.0**
