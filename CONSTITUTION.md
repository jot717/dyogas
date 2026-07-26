# DYOGAS Engineering Constitution

**Version:** 2.0.0
**Status:** Binding — Root Governance
**Effective:** 2026-07-22
**Owner:** Chief Systems Architect
**Scope:** All humans, AI agents, contractors, vendors, and automated systems that read, write, plan, propose, review, approve, or operate any part of DYOGAS
**Supersedes:** Constitution v1.2.0
**Related:** [/README.md](./README.md), [/docs/README.md](./docs/README.md), [/docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md), [/harness/HARNESS_SPECIFICATION.md](./harness/HARNESS_SPECIFICATION.md), [/harness/SKILL_SPECIFICATION.md](./harness/SKILL_SPECIFICATION.md), [/contracts](./contracts), [/pipelines](./pipelines), [/artifacts](./artifacts), [/schemas](./schemas), [/engineering](./engineering), [/docs/adr](./docs/adr)

---

## Preamble

DYOGAS is built to become a durable, multi-billion-dollar AI platform. Speed without discipline destroys platforms; discipline without speed loses markets. This Constitution exists to make both possible at once by turning judgment calls into standing law wherever a judgment call would otherwise be repeated, litigated, or quietly bypassed under deadline pressure.

This Constitution is the **highest engineering law** and the root of the DYOGAS Engineering Operating System (the "Engineering OS"). When any guideline, harness rule, contract, schema, pipeline spec, prompt, ticket, chat instruction, or local convention conflicts with this document, **this document wins**, without exception and without a "just this once."

DYOGAS executes through a **Harness-first** model: agents act only under published contracts; work moves between stages as immutable artifacts, never as ephemeral chat residue; pipelines enforce ordered stages and exit criteria; automated Review Gates check machine-verifiable conditions; humans approve consequential transitions that automated gates cannot or must not approve alone.

This v2.0.0 revision is a **completeness rewrite**. It preserves every Article and every normative rule from v1.2.0 unchanged in substance. It adds, for every Article and for the document as a whole: precise Definitions, explicit Scope, named Responsibilities, a Decision Workflow, Decision Rules, worked Examples, testable Acceptance Criteria, enumerated Failure Cases, Best Practices, Anti-patterns, and cross-References — so that compliance can be checked mechanically, not just argued about.

Amendments require an Architecture Decision Record (ADR), explicit human approval from a named approver role, and a version bump of this file. Nothing in this Constitution may be waived by convenience, deadline, seniority, or AI-agent inference. Ambiguity resolves in favor of the more conservative, more auditable, more reversible interpretation.

---

## How to Read This Constitution

1. **Articles are law.** Each Article's numbered statements are binding rules. The prose around them (Definitions, Examples, etc.) is explanatory and enforcement scaffolding — it clarifies the law, it does not create new law and it does not weaken the numbered statements.
2. **Silence is not permission.** If this Constitution does not explicitly permit an action that touches governance, security, knowledge ownership, or the Harness, treat it as denied until a human with authority says otherwise, ideally recorded in the Decision Log or an ADR.
3. **Every Article is independently enforceable.** Compliance with Article IX does not excuse a violation of Article X. Agents and humans must satisfy all applicable Articles simultaneously.
4. **This document assumes good faith adversarial reading.** Read every rule as if someone is looking for the narrowest technically-compliant way to violate its spirit, and close that gap in your own behavior before an auditor has to close it for you.

---

## Global Definitions

These definitions apply across the entire Constitution unless an Article states a narrower meaning.

| Term | Definition |
|------|------------|
| **DYOGAS** | The overall platform: a Harness-first, local-first-knowledge, Cloud-AI-Compute Engineering Operating System and the product built on top of it. |
| **Engineering OS** | This repository: the governance, docs, harness, contracts, pipelines, artifacts, schemas, and engineering-process layers that define how DYOGAS is built and operated. |
| **Harness** | The single production execution path for multi-agent work, specified in `/harness/HARNESS_SPECIFICATION.md`. Owns the Pipeline Engine, Agent Lifecycle, State Machine, Handoff Protocol, Retry Policy, Failure Recovery, Human Approval Gates, and Audit Trail. |
| **Agent** | Any AI system — model-backed, rule-backed, or hybrid — that is bound to a published Agent Contract under `/contracts` and invoked by the Harness. An unbound AI process is not an "Agent" under this Constitution; it is an unauthorized system and may not touch DYOGAS production surfaces. |
| **Agent Contract** | A binding specification under `/contracts/agents/*.md` defining an agent's role, input/output schemas, preconditions, postconditions, failure conditions, and retry strategy. |
| **Artifact** | A structured, schema-validated deliverable produced by a pipeline stage. Becomes **immutable** once sealed by the Harness (assigned `artifact_id`, `artifact_version`, and content `digest`). Defined in `/artifacts`, shaped in `/schemas/artifacts`. |
| **Pipeline** | A named, versioned sequence of Stages with declared producers, consumers, input/output artifacts, and Exit Criteria, defined under `/pipelines`. |
| **Stage** | One named step in a Pipeline with a single producer agent (or human gate), a single primary consumer, and explicit Exit Criteria. |
| **Handoff** | The Harness-mediated transfer of a sealed artifact from a producing Stage to a consuming Stage, per the Handoff Protocol in the Harness Specification. |
| **Review Gate** | An automated, machine-checkable check the Harness runs before allowing a handoff to proceed (schema validity, contract postconditions, Exit Criteria, policy/egress constraints, provenance completeness). |
| **Human Approval Gate** | A checkpoint that requires an attributable human decision (`approved`, `rejected`, `request_changes`, `expired`, `escalated`) before a pipeline may proceed, as specified in Harness Specification §9. |
| **Knowledge Plane** | The local-first (or customer-controlled) system of record for user/organization knowledge, as defined in `/docs/ARCHITECTURE.md`. |
| **System of Record (SoR)** | The single authoritative store for a given category of data or knowledge. Every category has exactly one SoR at any time. |
| **Cloud AI Compute Layer** | The elastic compute plane that executes heavy model inference and AI workloads under purpose-bound, minimized, logged I/O, as defined in `/docs/ARCHITECTURE.md`. |
| **Decision Log** | The append-only record of material product, engineering, and operational decisions required by Article VII. |
| **ADR (Architecture Decision Record)** | An immutable, numbered record under `/docs/adr` documenting an architecture-class decision: context, options considered, decision, and consequences. |
| **Material change** | A change that alters system boundaries, trust model, data ownership, a shared contract/schema/pipeline, security posture, or product commitments visible to users or approvers. Contrast with a purely cosmetic or clarifying change. |
| **Fail closed** | On ambiguity, missing authorization, or detected risk, the system stops and denies the action rather than proceeding optimistically. |
| **Tenancy** | The isolation boundary between distinct customers/organizations/workspaces; a construct that must never be crossed without explicit, policy-defined authorization. |
| **Provenance** | Traceable evidence of where an artifact's claims, values, or content originated, sufficient to verify or dispute the claim later. |

---

## Engineering OS Layout (Single Source Map)

| Layer | Path | Authority | Primary Content |
|-------|------|-----------|------------------|
| Root governance | `/CONSTITUTION.md` | Supreme | This document |
| Product & high-level architecture | `/docs` | Product intent, system shape | Vision, principles, architecture, roadmap |
| Architecture decisions | `/docs/adr` | Accepted ADRs, immutable | Numbered ADRs |
| Execution law | `/harness` | Pipeline engine, lifecycle, gates, audit | Harness Specification, Skill Specification |
| Agent contracts | `/contracts` | Per-agent I/O and obligations | One contract per agent |
| Pipeline specs | `/pipelines` | Stage topology and exit criteria | Canonical pipelines |
| Artifact specs | `/artifacts` | Deliverable meaning and immutability rules | One spec per artifact type |
| Schemas | `/schemas` | Machine-checkable shapes for artifacts and contracts | JSON Schemas |
| Engineering process | `/engineering` | Lifecycle, DoR/DoD, branching, commits, review, release | Numbered process documents |

No parallel "shadow" constitutions, harnesses, contracts, pipelines, artifact specs, schemas, or engineering processes are permitted anywhere in this repository or in any connected system. Discovering one is a **Critical** severity finding under Enforcement below, regardless of who created it or why.

---

## Global Scope

This Constitution binds:

1. **Every human** who commits code, writes documentation, approves a pull request, operates infrastructure, or makes a product/architecture decision for DYOGAS.
2. **Every AI agent** invoked through the Harness, without exception for model vendor, hosting location, or capability tier.
3. **Every automated system** — CI pipelines, bots, schedulers, migration scripts — that can mutate a System of Record, a contract, a schema, or this governance layer.
4. **Every contractor and vendor** engaged to build, extend, or operate any part of DYOGAS, whose engagement terms must reference and not contradict this Constitution.
5. **Every repository, environment, and deployment** that claims to implement DYOGAS, including forks and internal experiments intended to graduate to production.

This Constitution does **not** by itself specify: application code structure, programming languages, cloud vendor selection, UI design, or model selection. Those decisions are downstream and must comply with — but are not enumerated by — this document.

---

## Global Responsibilities

| Role | Responsibility under this Constitution |
|------|------------------------------------------|
| **Chief Systems Architect (Owner)** | Maintains this document; is the default approver for amendments unless delegated; escalation point for interpretation disputes. |
| **Human Approvers** (per Human Approval Gate policy) | Exercise the non-delegable human judgment required by Articles III and XIII; may not be an AI agent; must be identifiable and attributable. |
| **Agent Contract Owners** | Ensure their agent's contract stays compliant with this Constitution and the Harness Specification; propose amendments when their agent's obligations conflict with current law. |
| **Any Contributor (human or agent)** | Reads the authoritative source before acting; raises a Decision Log entry or ADR when a material choice is made; refuses to act when a required approval, contract, or schema is missing. |
| **Reviewers (Code Review, Architecture Review)** | Block merges that violate any Article; do not accept "we'll fix governance later" as a merge justification. |
| **Security/Trust & Control Owner** | Owns Article IX and Article XI enforcement; approves and time-boxes security exceptions. |
| **Product Owner** | Owns Article XII pain-evidence gate; rejects speculative features lacking evidence. |

---

## Article I — Single Source of Truth

1. Every domain of knowledge has exactly one authoritative location (see layout above).
2. Product intent lives in `/docs`. Execution semantics live in `/harness`. Agent obligations live in `/contracts`. Artifact meaning lives in `/artifacts` + `/schemas`.
3. Duplicate or conflicting sources must be resolved immediately — never left to tribal knowledge.
4. AI agents and developers must read the authoritative source before acting and must not invent parallel docs, schemas, or policies.

### Definitions

- **Authoritative location**: the one path in the Engineering OS Layout table where a fact is allowed to live as law. A comment, chat message, or slide deck stating the same fact is a *reference*, never the source.
- **Tribal knowledge**: any rule, convention, or exception that exists only in a person's memory, an unpinned chat thread, or an informal channel message, and is not written into an authoritative location.

### Scope

Applies to every piece of durable knowledge about how DYOGAS is governed, built, or operated — governance rules, architecture decisions, contracts, schemas, pipeline topology, artifact semantics, and engineering process.

### Responsibilities

- **Any Contributor**: before writing a new doc, schema, or policy, must search the existing authoritative locations for an existing definition.
- **Reviewers**: must reject PRs that introduce a second definition of something already defined elsewhere, redirecting the author to update the existing authoritative source instead.

### Decision Rules

1. If two documents describe the same capability differently, the document in the layer with higher authority (per Hierarchy of Authority) wins; the lower-authority document must be corrected in the same change set that discovers the conflict.
2. If two documents at the *same* layer conflict, the conflict is a Major-severity finding and must be resolved before either document is trusted further.
3. New knowledge that does not fit an existing authoritative location requires either (a) extending the correct existing document, or (b) an ADR proposing a new location — never an ad hoc new file created outside the layout without governance review.

### Examples

- **Compliant**: A new retry behavior for an agent is added to that agent's Contract file and, if it changes Harness-wide retry semantics, also to `/harness/HARNESS_SPECIFICATION.md` §7 in the same change set.
- **Violation**: An engineer adds a "quick reference" markdown file in a random folder repeating the Harness state machine from memory, which drifts from `/harness/HARNESS_SPECIFICATION.md` within a month.

### Acceptance Criteria

- [ ] Every fact about governance, architecture, contracts, pipelines, artifacts, or schemas exists in exactly one authoritative file.
- [ ] No two authoritative files assert contradictory rules for the same capability.
- [ ] Every cross-reference to a fact links to its authoritative location rather than restating it in full.

### Failure Cases

- A second "Harness" doc appears in `/engineering` describing a different state machine → Critical, revert immediately.
- Two contracts disagree on an agent's retry ceiling → Major, block merge until unified.
- A README restates Constitution Articles instead of linking to them, and later drifts from the actual Articles → Minor, fix on discovery.

### Best Practices

- Link, don't copy. Cross-reference the authoritative file rather than summarizing its content where the summary could go stale.
- When updating an authoritative file, grep the repository for other files that reference the same concept and check they remain consistent.

### Anti-patterns

- "I'll just note this in the PR description" for a rule that should live in a contract or the Harness Specification.
- Maintaining a personal or team wiki page that duplicates governance content "for convenience."

### References

`/docs/README.md`, `/harness/HARNESS_SPECIFICATION.md`, `/contracts/README.md`, `/schemas/README.md`

---

## Article II — AI-First Development

1. AI agents are first-class contributors under the same law as humans.
2. Agents may run only when bound to a published **Agent Contract** and invoked by the Harness.
3. Agent output is not accepted until Acceptance Criteria, Review Gates, and Human Approval (where required) pass.
4. Prompts and automation encode these articles — they do not bypass the Harness.

### Definitions

- **First-class contributor**: an agent's work product is subject to the exact same acceptance bar as a human's — no separate, looser standard "because it's just an AI draft."
- **Bound**: an agent's runtime identity is resolved to exactly one Agent Contract version at invocation time; an agent running without a resolvable, matching contract is not bound and must not execute.

### Scope

Applies to every AI agent invocation anywhere in the Harness — research, validation, proposal drafting, markdown generation, graph updates, embeddings, memory writes, and notifications.

### Responsibilities

- **Harness**: refuses to admit any invocation that cannot resolve to a published, version-compatible Agent Contract (Harness Specification §3 "Bind").
- **Agent Contract Owners**: keep contracts current with actual agent capability; an agent must not be given capabilities its contract does not declare.
- **Reviewers**: verify that new agent capability is matched by a contract update in the same change set.

### Decision Rules

1. No contract, no execution — this is non-negotiable and has zero exceptions, including for "read-only" or "just draft" agent runs against production surfaces.
2. A contract version mismatch between the agent runtime and the pinned pipeline run is treated as a Bind failure (`REJECTED`), not a warning.
3. Prompts, system messages, and orchestration code must reference Harness state and contract obligations rather than re-implement them.

### Examples

- **Compliant**: A new "Fact-Check Agent" is proposed; before it ever runs, `/contracts/agents/fact-check-agent.md` and its schema bundle are published and reviewed.
- **Violation**: An engineer wires an LLM call directly into a pipeline script "just for this one urgent fix," bypassing contract binding.

### Acceptance Criteria

- [ ] Every agent invocation in logs/audit trail resolves to exactly one Agent Contract id + version.
- [ ] No agent output reaches a downstream stage without passing that stage's Acceptance Criteria.
- [ ] Human Approval Gate outcomes are present wherever the pipeline spec requires them.

### Failure Cases

- An agent is invoked ad hoc from a debugging script against a real Knowledge Plane artifact → Critical, revert and incident review.
- A contract exists but is stale relative to the agent's actual behavior (scope creep) → Major, block further use until contract updated.

### Best Practices

- Treat "which contract binds this call" as a mandatory field in any orchestration code review, the same way a type signature is mandatory in typed code.
- Version-pin contracts per pipeline run so upgrades don't silently change in-flight behavior.

### Anti-patterns

- "Shadow agents" run outside the Harness for convenience, prototyping, or speed, that later get promoted to production without ever getting a contract.
- Treating AI-authored artifacts as needing a lower review bar than human-authored ones.

### References

`/contracts/README.md`, `/harness/HARNESS_SPECIFICATION.md` §3–§4

---

## Article III — Human Approval Workflow

1. Humans retain final authority over protected merges, production releases, security exceptions, constitutional amendments, and **Harness Human Approval Gates** that mutate knowledge SoR.
2. Material changes require an explicit, attributable approval record.
3. AI may prepare everything up to the approval boundary; it may not cross it.
4. "LGTM by default" is forbidden.

### Definitions

- **Attributable approval**: an approval record that names a specific, identifiable human (from Trust & Control identity), a timestamp, and the exact artifact/version being approved. A shared account or bot identity cannot produce an attributable approval.
- **Approval boundary**: the point past which only a human decision (`approved`/`rejected`/`request_changes`/`expired`/`escalated`) may move a pipeline run forward. Everything before that point may be AI-prepared.
- **LGTM by default**: approving without reading, without checking the checklist, or because "the agent said it was fine."

### Scope

Applies to: protected-branch merges, production releases, security policy exceptions, Constitution/Harness/contract amendments, and every Human Approval Gate defined in `/harness/HARNESS_SPECIFICATION.md` §9 and referenced from pipeline specs (e.g., Stage 4 of `knowledge-ingestion`).

### Responsibilities

- **Human Approvers**: must review the actual checklist/Acceptance Criteria for the artifact under review before deciding; may not delegate the decision to an agent.
- **Agents**: may build the approval package (summaries, risk notes, diffs) but must set `requires_human_approval` and stop; they must never emit an `approved` decision themselves.
- **Harness**: must reject any approval record whose actor field resolves to an agent identity.

### Decision Rules

1. If the checklist for a Human Approval Gate is incomplete, no approval may be recorded, regardless of urgency.
2. `request_changes` returns control to the appropriate prior stage with a new artifact version; it does not fast-track a partial fix on the sealed artifact.
3. An expired approval window fails closed — the pipeline does not proceed on "probably would have been approved."
4. Escalation requires a named higher-authority approver; escalation itself must be logged.

### Examples

- **Compliant**: A Proposal reaches Human Review; a named approver reviews pain statement, evidence, and metrics, then records `approved` with an apply token bound to that Proposal's exact version.
- **Violation**: A release is merged to `main` because "the on-call engineer said it looked fine in Slack" with no named, attributable review of the actual diff.

### Acceptance Criteria

- [ ] Every Human Approval Gate decision has a named human actor, timestamp, and decision outcome recorded in the Audit Trail.
- [ ] No `approved` outcome exists without a completed checklist.
- [ ] No agent identity appears as the actor on an `approved`/`rejected` decision.

### Failure Cases

- A production release ships without a recorded human approval → Critical, halt and roll back if feasible.
- An approval is recorded by an automation account rather than a named human → Critical, void the approval and re-run the gate.
- Approver approves without reading the diff (discovered via post-hoc review) → Major, retrain/re-assign approver, re-review the change.

### Best Practices

- Make the approval package small enough for a human to actually read (Article IV documentation-first helps here).
- Require the approver to restate, in their own words, what they are approving — this surfaces LGTM-by-default quickly.

### Anti-patterns

- Auto-approval bots that rubber-stamp based on CI-green status alone for consequential changes.
- "Batch approving" a pile of unrelated changes in one click without reviewing each individually.

### References

`/harness/HARNESS_SPECIFICATION.md` §9, `/pipelines/knowledge-ingestion.md` Stage 4, `/engineering/08_CODE_REVIEW.md`, `/engineering/09_RELEASE.md`

---

## Article IV — Documentation First

1. No feature, contract, pipeline, or public interface ships without documentation of purpose, owners, interfaces, and failure modes.
2. Docs and schemas update in the same change set as the behavior they describe.
3. Undocumented behavior is incomplete behavior.
4. Specs precede implementation for non-trivial work.

### Definitions

- **Ships**: becomes reachable by any real invocation path (production, staging, or any environment other than a throwaway local experiment never intended to run again).
- **Same change set**: the same commit, PR, or atomic release unit — not "documentation to follow in a subsequent PR."

### Scope

Applies to all contracts, pipelines, artifacts, schemas, harness behavior, and any interface exposed to other agents, other teams, or end users.

### Responsibilities

- **Author of the change**: writes or updates the doc as part of the same change.
- **Reviewers**: block merge if documentation is missing, stale, or contradicts the actual behavior being introduced.

### Decision Rules

1. If a PR changes behavior described in an authoritative doc, that doc must be updated in the same PR, or the PR is incomplete.
2. "Trivial" work (typo fixes, comments, non-behavioral refactors) is exempt from new documentation requirements but must not silently change documented behavior.
3. Specs for non-trivial work must exist and be reviewed before implementation begins (see `/engineering/01_SPECIFICATION.md`).

### Examples

- **Compliant**: A new Agent Contract's retry ceiling changes from 3 to 5; the contract file, and if applicable the Harness default-ceiling note, are updated in the same PR as the runtime config change.
- **Violation**: A schema field is renamed in code/config but the JSON Schema file and artifact spec still show the old name for two weeks.

### Acceptance Criteria

- [ ] Every merged change that alters documented behavior includes the corresponding doc update.
- [ ] No authoritative doc contradicts current runtime behavior of the surface it describes.
- [ ] Non-trivial work has a reviewed spec predating its implementation.

### Failure Cases

- A contract's documented output schema no longer matches the actual schema file → Major, block merge until reconciled.
- A pipeline stage's Exit Criteria in the spec don't match what the Harness actually enforces → Major, treat as a Harness Specification bug and fix immediately.

### Best Practices

- Treat documentation diffs as first-class review targets, not an afterthought scrolled past.
- Prefer small, precise doc edits tied 1:1 to the behavior change over large rewrites that are hard to review.

### Anti-patterns

- "Doc debt" tickets that are never prioritized because the code already "works."
- Writing documentation that describes intended future behavior as if it were current behavior.

### References

`/engineering/01_SPECIFICATION.md`, `/engineering/13_DOCUMENTATION.md`, `/engineering/14_DEFINITION_OF_DONE.md`

---

## Article V — Test Before Merge

1. No change merges without automated tests covering the risk introduced — including contract/schema conformance tests when those surfaces change.
2. Failing tests block merge. Weakening tests to green the pipeline is a constitutional violation.
3. Critical paths require regression coverage; security-sensitive paths require adversarial and negative cases.
4. Manual-only verification is insufficient for protected branches.

### Definitions

- **Risk introduced**: the set of behaviors a change could plausibly break, including behaviors outside the immediately touched lines (blast radius).
- **Weakening tests**: deleting, skipping, loosening assertions on, or marking-as-expected-failure a test specifically to make a red pipeline green, without fixing the underlying defect.

### Scope

Applies to all merges into protected branches, and specifically to any change to `/contracts`, `/pipelines`, `/artifacts`, `/schemas`, and `/harness` where conformance tests are the primary defense against silent drift.

### Responsibilities

- **Author**: writes tests proportional to risk, including negative/adversarial cases for security-sensitive paths.
- **CI System**: is the enforcement mechanism; must not be bypassable by force-push or admin override without a logged, time-boxed exception.
- **Reviewers**: verify tests actually exercise the changed risk, not just achieve coverage percentage theater.

### Decision Rules

1. A merge with any failing required test is blocked, full stop — "it's flaky" requires fixing the flake, not merging around it.
2. Any test modification that reduces assertion strength must be justified in the PR description and reviewed as carefully as the production code change.
3. Schema changes require conformance tests proving both old-valid and new-valid payloads behave as intended, and that invalid payloads are rejected.

### Examples

- **Compliant**: A change to `research-agent.md`'s retry ceiling ships with a test asserting the Harness enforces exactly the new ceiling and rejects a 4th retryable attempt.
- **Violation**: A failing schema validation test is commented out with `// TODO fix later` and the PR merges anyway.

### Acceptance Criteria

- [ ] CI is green with no skipped/disabled tests relevant to the change.
- [ ] Contract/schema changes have corresponding conformance tests.
- [ ] Security-sensitive changes include at least one adversarial/negative test case.

### Failure Cases

- A flaky test is silenced via `skip` rather than fixed → Major.
- A merge occurs via admin override with failing required checks and no logged exception → Critical.

### Best Practices

- Write the negative/adversarial test first for security-sensitive paths — it clarifies the actual threat model.
- Track test-weakening as its own reviewable diff category, not buried inside a large PR.

### Anti-patterns

- Coverage-percentage-driven testing that hits lines without asserting meaningful behavior.
- "We'll add tests in a follow-up" for protected-branch merges.

### References

`/engineering/06_TESTING.md`, `/engineering/14_DEFINITION_OF_DONE.md`, `/schemas/README.md`

---

## Article VI — No Duplicate Systems

1. One capability, one system of record.
2. Parallel implementations "for now" are forbidden unless an ADR defines a time-boxed migration with owner and end date.
3. Before building, search contracts, pipelines, artifacts, and schemas for an existing unit.
4. Consolidation of accidental duplicates equals new feature priority.

### Definitions

- **Capability**: a distinct unit of functionality addressable by a name (e.g., "citation building," "duplicate detection," "memory persistence").
- **Parallel implementation**: a second, independently-evolving implementation of a capability that already has an authoritative owner.
- **Time-boxed migration**: a migration with a concrete end date and named owner recorded in an ADR, after which the old implementation must be retired.

### Scope

Applies to agents, skills, schemas, pipelines, and any reusable component (per `/harness/SKILL_SPECIFICATION.md` §7 registry).

### Responsibilities

- **Any Contributor proposing new capability**: must search `/contracts`, `/pipelines`, `/artifacts`, `/schemas`, and `/harness/SKILL_SPECIFICATION.md` for an existing owner before building.
- **Architecture Review**: rejects proposals that duplicate an existing capability without an ADR-approved migration plan.

### Decision Rules

1. If an existing capability covers 80%+ of the need, extend it via amendment rather than fork it.
2. Any duplicate discovered post hoc becomes a tracked consolidation item with the same priority as a new feature request — not a "someday" backlog item.
3. A time-boxed migration without a recorded end date is treated as a permanent, unauthorized duplicate.

### Examples

- **Compliant**: A team needing "web research" checks `/harness/SKILL_SPECIFICATION.md`, finds Web Research already defined, and extends its budget parameters via amendment instead of writing a new skill.
- **Violation**: Two different agents each implement their own ad hoc citation formatting instead of using the Citation Builder skill.

### Acceptance Criteria

- [ ] No two components in `/contracts`, `/pipelines`, `/artifacts`, `/schemas`, or the skill catalog implement the same capability independently.
- [ ] Every in-flight migration has an ADR with an owner and end date.

### Failure Cases

- Two agents independently reimplement duplicate detection with different thresholds and no shared owner → Major, consolidate.
- A "temporary" second pipeline for knowledge ingestion still exists a year later with no ADR → Critical, treat as unauthorized shadow system.

### Best Practices

- Maintain the skill/component registries (`/harness/SKILL_SPECIFICATION.md` §7) as the first stop before building anything reusable.
- When consolidating, migrate consumers before deleting the old implementation, and record the cutover in the Decision Log.

### Anti-patterns

- "It's just a quick local helper" that quietly becomes the de facto second implementation of a cataloged skill.
- Forking a contract to add one field instead of amending the shared contract.

### References

`/harness/SKILL_SPECIFICATION.md` §6–§7, `/contracts/README.md`, `/pipelines/README.md`

---

## Article VII — Decision Log Required

1. Every material product, engineering, or operational decision is recorded in the Decision Log.
2. Entries include: date, decision, context, alternatives, owner, consequences.
3. Unlogged decisions have no standing in disputes.
4. AI agents must append or propose Decision Log entries for material choices they influence.

### Definitions

- **Material decision**: any decision that changes user-facing behavior, system boundaries, risk posture, resource commitments, or that a reasonable stakeholder would want to know happened. See also "Material change" in Global Definitions.
- **Decision Log**: the append-only, chronologically ordered record referenced by this Article. It is distinct from an ADR: ADRs are for architecture-class decisions and are heavier-weight; the Decision Log captures the broader set of material decisions, including product and process decisions that don't rise to ADR weight.
- **Standing in disputes**: if a decision is not in the Decision Log, no party may later claim it was "decided" as an authoritative fact when a disagreement arises.

### Scope

Applies to product prioritization calls, scope cuts, non-obvious engineering tradeoffs, operational incident resolutions with lasting policy effect, and any agent-influenced choice materially shaping a downstream artifact or approval.

### Responsibilities

- **Decision owner**: writes the entry at decision time, not retroactively from memory weeks later.
- **Agents**: when producing a Proposal or similar artifact that materially shapes a decision, must include enough structured context (alternatives, consequences) that a human can transcribe or directly link it into the Decision Log.

### Decision Rules

1. If a decision cannot be traced to a Decision Log entry (or a linked ADR for architecture-class decisions), treat it as **not decided** — re-open the question rather than assume prior intent.
2. Entries are append-only; correcting a mistaken entry means adding a new entry that supersedes it, not editing history.
3. Every entry must name an accountable owner — "the team decided" without a name is insufficient.

### Examples

- **Compliant**: "2026-07-20 — Decision: cap Research Agent budget at 50 fetches/run. Context: cost spike in staging. Alternatives: per-tenant budget (deferred), unlimited with alerting (rejected — no hard ceiling). Owner: @architect. Consequences: some briefs may return partial coverage; documented in contract." 
- **Violation**: A budget cap silently appears in a config file with no Decision Log entry explaining why.

### Acceptance Criteria

- [ ] Every material decision referenced in a dispute or retro has a corresponding Decision Log entry.
- [ ] Entries contain all five required fields (date, decision, context, alternatives, owner, consequences).
- [ ] Agent-influenced material decisions have a traceable entry or entry proposal.

### Failure Cases

- A retrospective surfaces a "decision" nobody can find in the log → treat the original choice as unauthorized; re-decide explicitly.
- An entry omits alternatives considered, making it impossible to evaluate later whether the decision still holds → Minor, backfill if possible.

### Best Practices

- Log the decision at the moment it's made, inside the PR/proposal that implements it, rather than in a separate ceremony.
- Prefer short, structured entries over long narrative ones — optimize for future skimmability.

### Anti-patterns

- Treating the Decision Log as optional documentation rather than as evidence with standing in disputes.
- Logging decisions so vaguely ("we decided to improve performance") that they carry no information.

### References

`/engineering/10_RETROSPECTIVE.md`, `/docs/adr/README.md` (canonical Decision Log SoR + ADR process)

---

## Article VIII — ADR Required for Architecture Changes

1. Changes to system boundaries, data ownership, trust model, harness topology, deployment topology, or shared contracts/schemas require an ADR before implementation.
2. ADRs are immutable once accepted; supersession only via a new ADR.
3. Implementation without a required ADR is revertible by default.

### Definitions

- **System boundary**: the edge between two planes (e.g., Knowledge Plane vs. Cloud AI Compute Layer) or between DYOGAS and an external system.
- **Trust model**: who/what is trusted to do what, under what identity, with what privileges.
- **Harness topology**: the set of stages, gates, and transition rules that make up the Harness's execution semantics.
- **Revertible by default**: absent an accepted ADR, any reviewer or architect may request a revert of the implementation without needing further justification; the burden of proof is on keeping the change, not removing it.

### Scope

Applies to: new planes or removal of planes; new trust boundaries or egress paths; new/changed pipeline topology; new/changed shared contract or schema semantics (not just additive, backward-compatible fields); deployment topology changes (e.g., introducing a new hosting environment for the Knowledge Plane).

### Responsibilities

- **Proposer**: drafts the ADR with context, options, decision, and consequences before writing implementation code.
- **Architecture Review**: is the accepting body; must record acceptance explicitly, not implicitly via a merged PR alone.
- **Any Contributor**: may flag undocumented architecture-class changes for revert.

### Decision Rules

1. If in doubt whether a change is "architecture-class," treat it as requiring an ADR — the cost of an unnecessary ADR is far lower than the cost of an unreviewed boundary change.
2. Additive, backward-compatible schema fields with no semantic boundary shift do not require an ADR, but should still get a Decision Log entry if material.
3. An ADR that is rejected does not get resubmitted verbatim; a materially different proposal gets a new ADR number.

### Examples

- **Compliant**: Before introducing a second Knowledge Plane storage backend, an ADR is written comparing options, and only after acceptance does implementation begin.
- **Violation**: A "small" change quietly moves Cloud AI Compute I/O logging from mandatory to optional to unblock a demo, with no ADR.

### Acceptance Criteria

- [ ] Every merged change to a system boundary, trust model, harness topology, or shared contract/schema semantics links to an accepted ADR.
- [ ] No accepted ADR has been edited in place; changes are via superseding ADRs only.
- [ ] Implementations lacking a required ADR are flagged and reverted or retroactively ratified via ADR before continuing.

### Failure Cases

- A pipeline stage is added that changes Knowledge Plane write semantics, with no ADR → Critical, revert until ADR exists.
- An accepted ADR is edited after acceptance to "fix a typo" that actually changes its decision → Critical, treat as tampering; restore original, file a superseding ADR if a real change is needed.

### Best Practices

- Write the ADR's "options considered" section honestly, including the option you didn't pick and why.
- Number ADRs sequentially and never reuse a number, even for a rejected ADR.

### Anti-patterns

- Writing the ADR after the implementation is already merged, as a formality.
- Treating ADR acceptance as achieved by silence/no-objection rather than explicit sign-off.

### References

`/docs/adr/README.md`, `/docs/ARCHITECTURE.md`

---

## Article IX — Security by Default

1. Deny by default. Least privilege. Encrypt sensitive data in transit and at rest.
2. Secrets never enter source control, logs, exported prompts, or client bundles.
3. Threat modeling is required for auth, egress, plugins, and knowledge-touching surfaces.
4. Security exceptions require human approval, Decision Log entry, and expiration/revisit date.

### Definitions

- **Deny by default**: absent an explicit grant, an action, credential, or data flow is denied.
- **Least privilege**: every identity (human, agent, or service) holds the minimum set of privileges needed for its declared role, and no more.
- **Sensitive data**: credentials, personal data, proprietary knowledge content, and anything a threat model identifies as high-impact if disclosed.
- **Security exception**: a deliberate, time-boxed deviation from a security default, e.g., a temporarily widened egress allowlist.

### Scope

Applies to all authentication/authorization surfaces, all external egress (including Cloud AI Compute calls and research skills), all plugin/extension points, and any surface that reads or writes Knowledge Plane content.

### Responsibilities

- **Security/Trust & Control Owner**: owns the threat modeling process and the exception approval path.
- **Any Contributor**: must not commit secrets; must run/request threat modeling for new auth, egress, plugin, or knowledge-touching surfaces before shipping.
- **Harness/EgressGate**: fails closed on missing or ambiguous policy tokens (per `/harness/SKILL_SPECIFICATION.md` §3.4 and skill-level error handling).

### Decision Rules

1. A secret found in source control, logs, prompts, or a client bundle is treated as **compromised immediately** — rotate first, investigate second.
2. A new egress path (new source class, new external API) requires a threat model note before it is enabled, even in a research skill.
3. A security exception without an expiration/revisit date is invalid and must be closed or reissued with a date.

### Examples

- **Compliant**: A new "Web Research" domain allowlist is threat-modeled for SSRF/redirect risk before being enabled, with `DOMAIN_BLOCKED`/`ROBOTS_OR_TOS_BLOCK` failure modes documented.
- **Violation**: An API key is pasted directly into a debug log statement "temporarily" and merged.

### Acceptance Criteria

- [ ] No secret material exists in git history, logs, exported prompts, or client bundles.
- [ ] Every auth, egress, plugin, and knowledge-touching surface has a documented threat model.
- [ ] Every active security exception has a Decision Log entry with an expiration/revisit date, and none are past that date without re-approval.

### Failure Cases

- A leaked secret is discovered in an old commit → Critical, rotate immediately, scrub history per policy, incident review.
- A security exception silently persists past its expiration date with no re-approval → Major, close or formally re-approve immediately.

### Best Practices

- Default all new egress and write paths to `POLICY_DENY` until explicitly allow-listed, mirroring the skill error-handling conventions already catalogued (`POLICY_DENY`, `EGRESS_VIOLATION`, `TENANCY_VIOLATION`).
- Prefer expiring, narrowly-scoped credentials over long-lived broad ones.

### Anti-patterns

- "We'll threat-model it after launch."
- Granting broad admin-equivalent scopes to an agent because narrow scoping is "annoying to configure."

### References

`/harness/SKILL_SPECIFICATION.md` §2–§3, `/docs/ARCHITECTURE.md` (Trust & Control Plane)

---

## Article X — Local-First Knowledge Ownership

1. User and organization knowledge is owned by the user/organization.
2. Local (or customer-controlled) storage is the knowledge SoR unless an ADR states otherwise.
3. Sync, backup, and collaboration preserve ownership, provenance, and revocation.
4. Exfiltration or permanent centralization without explicit informed consent is prohibited.

### Definitions

- **Local-first**: the system of record for knowledge resides under the user's or organization's control by default, with cloud systems acting on it only under explicit, revocable authorization.
- **Revocation**: the ability for the owner to withdraw a prior grant (e.g., sync, sharing, cloud processing) and have that grant's effects unwound to the extent technically possible.
- **Exfiltration**: any transfer of knowledge content to a system outside the owner's control that was not explicitly, informedly consented to.

### Scope

Applies to all Knowledge Plane content: research findings, proposals, approved knowledge documents, graph data, embeddings, and memory.

### Responsibilities

- **Memory Agent / Knowledge Graph Agent / Embedding Agent**: must not persist SoR-linked content to a centralized store without an authorization path that traces back to owner consent (per Knowledge Approval / Memory Update skills).
- **Any Contributor proposing a new storage backend**: must confirm local-first compliance or file an ADR justifying the exception.

### Decision Rules

1. If a proposed feature requires permanently centralizing user knowledge without a clear, revocable consent mechanism, it is rejected regardless of product upside.
2. Sync/backup features must preserve provenance metadata; stripping provenance during sync is a violation even if functionally convenient.
3. Revocation requests must be honorable within the bounds of the retention policy in effect at time of storage — the system must document, not silently ignore, cases where full unwind is impossible (e.g., due to backups already taken under prior consent terms).

### Examples

- **Compliant**: A "cloud sync" feature is opt-in, clearly discloses what leaves the device, and supports revocation that deletes the cloud copy and records the deletion in the Audit Trail.
- **Violation**: An analytics pipeline silently uploads full document contents to a central store "to improve the product" without disclosure.

### Acceptance Criteria

- [ ] Every feature that moves knowledge content off local/customer-controlled storage has an explicit consent mechanism.
- [ ] Revocation of consent has a defined, testable effect on stored copies.
- [ ] No ADR-less exception exists where local-first storage has been silently replaced by centralized storage.

### Failure Cases

- A feature centralizes knowledge by default with an easy-to-miss opt-out instead of opt-in consent → Critical, treat as exfiltration risk, halt and redesign.
- Backup logic drops provenance fields to save storage → Major, restore provenance handling before further backups are taken.

### Best Practices

- Make consent and revocation states visible and understandable to the end user (ties to Product Principle "Trust Visible").
- Default new storage/sync features to local-first and require an explicit ADR to do otherwise.

### Anti-patterns

- "Everyone centralizes telemetry, so it's fine to centralize knowledge content too."
- Treating consent as a one-time checkbox rather than a revocable, ongoing state.

### References

`/docs/PRODUCT_VISION.md`, `/docs/PRODUCT_PRINCIPLES.md`, `/harness/SKILL_SPECIFICATION.md` §5.14 (Memory Update)

---

## Article XI — Cloud AI Compute Layer

1. Heavy model inference and elastic AI compute run in the Cloud AI Compute Layer.
2. Local/knowledge plane owns truth; cloud executes approved, minimized, purpose-bound compute.
3. Cloud I/O is logged and deletable per policy.
4. Trust-boundary expansions require an ADR.

### Definitions

- **Purpose-bound compute**: a cloud compute invocation whose input is scoped to exactly what the declared task needs — not an unbounded dump of the user's full corpus "just in case."
- **Minimized I/O**: only the data necessary for the specific inference is sent to the Cloud AI Compute Layer; the response is used for the declared purpose and not silently repurposed.

### Scope

Applies to every call from any agent or skill to a cloud-hosted model or elastic compute resource, especially Summarization, Knowledge Scoring, and any heavy-inference skill under `/harness/SKILL_SPECIFICATION.md`.

### Responsibilities

- **Skill/agent implementers**: scope cloud calls to the minimum necessary payload and declared purpose.
- **Trust & Control**: maintains logging and deletion policy for cloud I/O and audits for scope creep.

### Decision Rules

1. A cloud compute call whose input scope exceeds its declared purpose is treated as a policy violation, not an optimization.
2. Cloud I/O logs must be deletable per policy; a cloud integration that cannot support deletion cannot be used for knowledge-bearing payloads without an ADR-approved exception.
3. Expanding what may flow to the Cloud AI Compute Layer (new data category, new destination) is a trust-boundary expansion requiring an ADR.

### Examples

- **Compliant**: Summarization sends only the relevant source excerpt to the Cloud AI Compute Layer for the declared summary objective, logs the call, and supports deletion of that log entry on request.
- **Violation**: An agent sends a user's entire knowledge corpus to a cloud model "to give it more context" for a narrow summarization task.

### Acceptance Criteria

- [ ] Every cloud compute call is logged with purpose, scope, and deletion status.
- [ ] No cloud call's input scope exceeds what its declared task requires.
- [ ] Any new data category or destination for cloud compute has an accepted ADR.

### Failure Cases

- A skill silently expands its cloud payload scope during an "optimization" pass with no ADR → Critical, revert and require ADR.
- Cloud I/O logs cannot be deleted on request due to vendor limitations discovered post-launch → Major, treat as unresolved risk until an ADR authorizes a mitigation or exception.

### Best Practices

- Default to the smallest reasonable context window sent to cloud compute; expand only with justified need.
- Periodically audit cloud call logs for scope creep relative to declared purpose.

### Anti-patterns

- "More context always helps the model" used to justify unscoped data transfer.
- Treating cloud compute logging as optional telemetry rather than an audit requirement.

### References

`/docs/ARCHITECTURE.md` (Cloud AI Compute plane), `/harness/SKILL_SPECIFICATION.md` §5.9 (Summarization)

---

## Article XII — Every Feature Must Solve a Real Pain Point

1. Features remove verified pain — not showcase technology.
2. Proposals state who hurts, how, success metrics, and non-goals.
3. Speculative platforms and vanity surfaces without pain evidence are rejected.
4. If the pain is not real, the feature is not built.

### Definitions

- **Verified pain**: a documented, evidenced problem experienced by an identifiable user segment, not an assumed or imagined one.
- **Vanity surface**: a feature built primarily to demonstrate a capability or impress, without a measurable user outcome it improves.

### Scope

Applies to every product proposal, and specifically to the `Proposal` artifact produced in the `knowledge-ingestion` pipeline and any other product-facing feature proposal.

### Responsibilities

- **Proposal Agent / Proposal Builder skill**: must fail (`PAIN_MISSING`, `EVIDENCE_MISSING`, `METRICS_MISSING`) rather than produce a proposal lacking these fields.
- **Product Owner**: is the accountable rejector of proposals that fail the pain litmus in `/docs/PRODUCT_PRINCIPLES.md`.

### Decision Rules

1. A proposal without a stated pain, affected segment, and success metric is incomplete and cannot proceed to Human Review.
2. "Competitor has it" is not, by itself, pain evidence.
3. Non-goals must be explicit — a proposal that could silently scope-creep into adjacent territory must declare what it is *not* doing.

### Examples

- **Compliant**: A proposal to add duplicate-detection thresholds cites specific instances of near-duplicate knowledge causing reviewer confusion, with a metric (reduction in duplicate-flagged review time).
- **Violation**: A proposal to add a flashy graph visualization feature with no cited user complaint, no metric, and "because it looks impressive in demos" as the justification.

### Acceptance Criteria

- [ ] Every accepted proposal states pain, affected segment, success metrics, and non-goals.
- [ ] No proposal lacking evidence reaches a Human Approval Gate.

### Failure Cases

- A proposal ships to Human Review missing success metrics → the Proposal Builder skill should have failed closed (`METRICS_MISSING`); if it didn't, treat as a skill defect, Major.
- A feature is greenlit based solely on internal enthusiasm with no user evidence → Major, retroactively require pain evidence or deprecate.

### Best Practices

- Prefer proposals with a small number of well-evidenced options over many speculative ones (see Product Principles "Fewer, Sharper Capabilities").
- Write the non-goals section as carefully as the goals section — it prevents scope creep later.

### Anti-patterns

- Building a feature because it is technically interesting rather than because it removes evidenced pain.
- Treating internal dogfooding anecdotes as sufficient evidence without broader validation for consequential investment.

### References

`/docs/PRODUCT_VISION.md`, `/docs/PRODUCT_PRINCIPLES.md`, `/harness/SKILL_SPECIFICATION.md` §5.12 (Proposal Builder), `/artifacts/proposal.md`

---

## Article XIII — Harness-First Execution

1. All multi-step agent work runs under the Harness: **Pipeline-driven Execution**, **Artifact-based Development**, **Handoff Protocol**, **Acceptance Criteria**, **Review Gates**, **State Machine**, **Retry Policy**, and **Audit Trail**.
2. Agents do not freestyle side channels. Work enters as inputs, exits as **immutable deliverables** (artifacts), and advances only via declared handoffs.
3. Retry, failure recovery, and human gates follow `/harness/HARNESS_SPECIFICATION.md`.
4. Bypassing the Harness for production knowledge mutation is a critical violation.

### Definitions

- **Multi-step agent work**: any task requiring more than one agent invocation, or any single invocation that would mutate a System of Record.
- **Side channel**: any path by which an agent influences a System of Record, another agent, or a human decision outside the Harness's pipelines, artifacts, and gates (e.g., direct database writes, unaudited direct messages that carry decision-making weight).
- **Freestyle**: improvised sequencing or improvised artifact shapes not declared in `/pipelines`, `/contracts`, or `/schemas`.

### Scope

Applies to all production knowledge mutation and to any agent orchestration intended to reach production, regardless of how it starts (prototype, spike, hotfix).

### Responsibilities

- **Harness**: is the sole admitting authority for pipeline runs (Harness Specification §3, "Agents never self-admit to a pipeline. Only the Harness admits.").
- **Any Contributor**: must route production multi-agent work through a declared pipeline; must escalate rather than route around a missing pipeline capability.

### Decision Rules

1. If a needed pipeline stage or artifact type does not exist, the correct action is to propose an amendment to `/pipelines` or `/artifacts` — not to hand-wire a bypass "just this once."
2. A hotfix that must mutate the Knowledge Plane under time pressure still requires Human Approval Gate compliance; urgency does not waive Article III or Article XIII.
3. Any artifact reaching the Knowledge Plane must have traversed the Handoff Protocol and, where required, a Human Approval Gate.

### Examples

- **Compliant**: An urgent knowledge correction still goes through Research → Validation → Proposal → Human Review → Markdown → Graph → Embedding → Memory, potentially with an expedited (but still attributable) human review.
- **Violation**: An engineer directly edits a Knowledge Plane record via a database console to "fix it fast," bypassing Proposal and Human Review entirely.

### Acceptance Criteria

- [ ] Every production Knowledge Plane mutation traces back to a Harness-recorded pipeline run and, where applicable, a Human Approval Gate decision.
- [ ] No agent-to-agent handoff exists outside a declared pipeline stage transition.
- [ ] Audit Trail reconstructs the full path from input to Knowledge Plane apply for any mutation.

### Failure Cases

- A direct write to the Knowledge Plane bypassing the pipeline is discovered → Critical, revert, incident review, and audit for further undisclosed bypasses.
- An agent invents an ad hoc "helper artifact" not defined in `/artifacts` to pass data to another agent → Major, replace with a declared artifact type or reject the flow.

### Best Practices

- When facing pressure to bypass the Harness for speed, treat that pressure as a signal that the pipeline itself may need an amendment (e.g., an expedited-review path), not a reason to go around it.
- Keep pipeline and artifact catalogs easy to search so "just this once" bypasses are less tempting than finding the right existing path.

### Anti-patterns

- "It's just a small internal tool, it doesn't need the full pipeline" for anything that touches the Knowledge Plane.
- Building a second, informal approval channel (e.g., a Slack thumbs-up) that substitutes for the Human Approval Gate.

### References

`/harness/HARNESS_SPECIFICATION.md` (all sections), `/pipelines/knowledge-ingestion.md`, `/artifacts/README.md`

---

## Amendment Workflow

Amendments to this Constitution — any change to an Article's numbered statements, the Enforcement table, or the Hierarchy of Authority — follow this exact workflow. Purely editorial changes (typo fixes, link repair, formatting) are exempt from steps 2–4 but still require step 5 (version bump, patch-level) and a Decision Log note.

1. **Draft.** The proposer drafts the amendment as a PR against this file, stating which Article(s) change and why.
2. **ADR.** If the amendment changes system boundaries, trust model, or Harness topology (per Article VIII), an ADR is filed and linked from the PR. Amendments that are purely governance-process clarifications (e.g., adding worked Examples without changing the numbered rule) do not require a new ADR but must still cite this workflow.
3. **Decision Log entry.** The proposer records a Decision Log entry: date, decision, context, alternatives, owner, consequences.
4. **Human approval.** A named human approver (default: Chief Systems Architect, or delegate recorded in the Decision Log) reviews and approves the PR. No AI agent may approve a Constitutional amendment.
5. **Version bump.** The `Version` field in the front matter is incremented: MAJOR for changes to any Article's binding statements or the Hierarchy of Authority; MINOR for new expansion sections (Definitions, Examples, etc.) on an existing Article that don't change its binding statements; PATCH for editorial fixes.
6. **Effective date update.** The `Effective` field is updated to the merge date.
7. **Announcement.** The amendment is referenced from the Decision Log and, if it changes cross-cutting behavior, from `/README.md` and `/docs/README.md` so downstream readers are not surprised by drift.

Amendments take effect only after the designated human approver merges the change and the version field is incremented. An amendment merged without a completed workflow is invalid and must be reverted upon discovery.

---

## Enforcement

| Severity | Example | Response |
|----------|---------|----------|
| **Critical** | Secret leak; SoR write bypassing Human Approval Gate; ownership violation; unauthorized architecture-boundary change; agent running without a contract against production | Immediate revert; human incident review; Decision Log entry documenting root cause and remediation |
| **Major** | Missing ADR; contract/schema drift; duplicate pipeline/skill; approval recorded without complete checklist; test weakened to pass | Block merge / fix-forward within SLA agreed by the accountable owner; Decision Log entry |
| **Minor** | Stale cross-links; incomplete Decision Log entry; cosmetic doc drift | Remediate before or alongside the next related change |

### Enforcement Workflow

1. **Detect** — via review, CI, audit trail inspection, or incident report.
2. **Classify** — assign severity using the table above; when in doubt, classify up (more severe), not down.
3. **Contain** — for Critical findings, revert or fail closed immediately, before root-causing.
4. **Root-cause** — determine how the violation occurred and whether it is isolated or systemic.
5. **Remediate** — fix the violation and, where the violation reveals a gap in this Constitution or the Harness Specification, propose an amendment.
6. **Record** — log the finding, response, and remediation in the Decision Log.

### Acceptance Criteria for Constitutional Compliance (Repository-Wide)

- [ ] Every Article's Acceptance Criteria (above) are independently satisfied.
- [ ] No open Critical-severity finding exists unremediated.
- [ ] Every Major-severity finding has a tracked fix-forward with an owner and SLA.
- [ ] The Decision Log and ADR set are internally consistent with current repository state.

---

## Hierarchy of Authority

1. This Constitution (`/CONSTITUTION.md`)
2. Accepted ADRs (`/docs/adr`)
3. `/docs` product & high-level architecture
4. `/harness` execution law
5. `/contracts`, `/pipelines`, `/artifacts`, `/schemas`
6. `/engineering` process law (DoR/DoD, lifecycle, release)
7. Decision Log
8. Issue/PR descriptions and runtime prompts

Lower layers may not contradict higher layers. A lower layer that appears to require contradicting a higher layer is a signal that the higher layer needs an amendment — proposed through the normal workflow, never worked around silently at the lower layer.

---

## References

- [`/README.md`](./README.md) — repository entry point and layer map
- [`/docs/README.md`](./docs/README.md) — documentation index
- [`/docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — system shape and planes
- [`/docs/PRODUCT_VISION.md`](./docs/PRODUCT_VISION.md) — why DYOGAS exists
- [`/docs/PRODUCT_PRINCIPLES.md`](./docs/PRODUCT_PRINCIPLES.md) — product decision principles
- [`/docs/adr/README.md`](./docs/adr/README.md) — ADR process
- [`/harness/HARNESS_SPECIFICATION.md`](./harness/HARNESS_SPECIFICATION.md) — execution law
- [`/harness/SKILL_SPECIFICATION.md`](./harness/SKILL_SPECIFICATION.md) — skill catalog
- [`/contracts/README.md`](./contracts/README.md) — agent contract index
- [`/pipelines/README.md`](./pipelines/README.md) — pipeline index
- [`/artifacts/README.md`](./artifacts/README.md) — artifact index
- [`/schemas/README.md`](./schemas/README.md) — schema index
- [`/engineering/README.md`](./engineering/README.md) — engineering process index

---

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.0.0 | — | Initial Articles I–XIII established |
| 1.2.0 | 2026-07-22 | Prior binding revision |
| 2.0.0 | 2026-07-22 | Completeness rewrite: added Definitions, Scope, Responsibilities, Decision Rules, Examples, Acceptance Criteria, Failure Cases, Best Practices, Anti-patterns, References for every Article; added explicit Amendment Workflow and Enforcement Workflow; preserved all binding statements from v1.2.0 unchanged |

**End of Constitution v2.0.0**
