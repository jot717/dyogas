# Architecture Decision Records

**Version:** 2.1.0
**Status:** Canonical Process — Binding
**Effective:** 2026-07-22
**Owner:** Chief Systems Architect
**Related:** [`/CONSTITUTION.md`](../../CONSTITUTION.md) Articles VII–VIII, [`/docs/ARCHITECTURE.md`](../ARCHITECTURE.md), [`/docs/ROADMAP.md`](../ROADMAP.md)

---

## Purpose

ADRs are the immutable, numbered record of every architecture-class decision DYOGAS makes: why it was made, what alternatives were considered, and what its consequences are. They exist so that "why did we do it this way" never depends on someone's memory, and so that architecture changes cannot be smuggled into the codebase without review (Constitution Article VIII).

## Definitions

| Term | Definition |
|------|------------|
| **ADR** | Architecture Decision Record: an immutable, numbered markdown file under `/docs/adr` documenting one architecture-class decision. |
| **Architecture-class change** | A change to system boundaries, data ownership, trust model, harness topology, deployment topology, or shared contracts/schemas (Constitution Article VIII, Scope). |
| **Accepted** | The ADR status once a named human approver has signed off; from this point the ADR is immutable. |
| **Superseded** | The status an ADR receives when a later ADR replaces its decision; the original text is never edited, only its status line and a forward link are added. |
| **Proposed** | The status of a drafted, not-yet-accepted ADR; implementation must not begin while an ADR is only Proposed. |

## Scope

Applies to every decision matching the Constitution Article VIII definition of architecture-class change. Does not apply to routine engineering decisions covered by the Decision Log (Constitution Article VII) unless they also cross an architecture boundary.

## Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Proposer** | Drafts the ADR using the template below before writing implementation code; requests review from Architecture Review. |
| **Architecture Review (Accepting Body)** | Reviews context, options, and consequences; records explicit acceptance or rejection — never accepts by silence. |
| **Chief Systems Architect** | Default reviewer/approver; assigns the next sequential ADR number; ensures no ADR is edited post-acceptance. |
| **Any Contributor** | May propose an ADR; may flag an architecture-class change that lacks a required ADR for revert per Constitution Article VIII. |

---

## Naming and Numbering

- File naming: `NNNN-title.md` (e.g. `0001-knowledge-sor-boundary.md`), zero-padded to four digits, assigned sequentially and never reused — including for rejected ADRs.
- One ADR = one decision. Do not bundle multiple unrelated architecture decisions into a single ADR file.
- Title is a short, descriptive slug in kebab-case reflecting the decision, not the ticket number or team name.

## ADR Template (Required Sections)

Every ADR must contain, at minimum:

```markdown
# ADR-NNNN: <Decision title>

**Status:** Proposed | Accepted | Rejected | Superseded by ADR-XXXX
**Date:** YYYY-MM-DD
**Deciders:** <named human approver(s)>
**Related:** <links to CONSTITUTION.md articles, ARCHITECTURE.md sections, other ADRs>

## Context

What problem or forcing function makes this decision necessary now?

## Options Considered

1. Option A — description, pros, cons
2. Option B — description, pros, cons
3. Option C (if applicable)

## Decision

Which option was chosen, stated unambiguously.

## Consequences

What becomes easier, what becomes harder, what follow-up work (contract/schema/pipeline/doc updates) this requires.

## Non-Goals

What this decision explicitly does not resolve or authorize.
```

---

## Workflow — Filing an ADR

1. **Identify the trigger.** Confirm the change is architecture-class per Constitution Article VIII (system boundary, ownership, trust model, harness topology, deployment topology, or shared contract/schema semantics).
2. **Draft using the template** above, filling in Context and at least two genuinely considered Options — a single-option "decision" with no alternatives considered is incomplete.
3. **Number it.** Request the next sequential number from the Chief Systems Architect (or an automated counter if one exists) — never guess or reuse a number.
4. **Submit for review** as a PR against `/docs/adr`, status `Proposed`.
5. **Architecture Review evaluates** Context, Options, Decision, and Consequences; requests changes or accepts explicitly.
6. **On acceptance**, the status line changes to `Accepted`, the PR merges, and the ADR becomes immutable from that point forward.
7. **Propagate.** Update `/docs/ARCHITECTURE.md` (if it changes system shape), `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas` as needed in follow-up changes referencing this ADR's number.
8. **If circumstances change later**, file a **new** ADR that supersedes the old one; update the old ADR's status line to `Superseded by ADR-XXXX` and nothing else in its body.

## Decision Rules

1. Implementation of an architecture-class change must not begin while its ADR is `Proposed` — only after `Accepted`.
2. An ADR with only one option listed is returned for revision; genuine alternatives (including "do nothing") must be represented even if quickly dismissed.
3. A rejected ADR keeps its number and status `Rejected` permanently; it is not deleted and not resubmitted verbatim under a new number without materially changed content.
4. Accepted ADRs are never edited in place, including for typo fixes that could change meaning; only non-substantive formatting fixes (e.g., broken markdown link syntax) are permitted, and only if they cannot alter the decision's meaning.

## Examples

- **Compliant**: `ADR-0001` proposes the Knowledge SoR boundary, lists "fully local," "fully cloud," and "local-first with revocable sync" as options, decides on the third with named consequences (sync feature must support revocation), and is accepted before any sync feature implementation begins.
- **Violation**: A pull request quietly changes which plane owns embeddings storage, with the justification "documented in the PR description" instead of an ADR — this is reverted per Constitution Article VIII until a proper ADR exists.

## Acceptance Criteria

- [ ] Every ADR file matches the `NNNN-title.md` naming convention and contains all required template sections.
- [ ] No ADR number is reused, including for rejected ADRs.
- [ ] No `Accepted` ADR has been modified in its Context/Options/Decision/Consequences sections after acceptance.
- [ ] Every superseded ADR's status line points to the correct superseding ADR number.
- [ ] Every architecture-class change in the repository's history can be traced to an `Accepted` ADR.

## Failure Cases

- An architecture-class change ships with no ADR at all → Critical, revert per Constitution Article VIII until an ADR is filed and accepted.
- An accepted ADR is edited to change its Decision section months later without a superseding ADR → Critical, treat as tampering; restore original text and file a proper superseding ADR if the decision genuinely needs to change.
- Two ADRs are filed with the same number due to a coordination gap → Major, renumber the later one and fix all references immediately.

## Best Practices

- Write the Context section assuming the reader has none of today's shared context — future readers (including future AI agents) will not have it.
- List the option you almost chose, and say why you didn't — this is often the most valuable part of the record for future re-evaluation.
- Link every ADR back to the specific Constitution Article(s) and `ARCHITECTURE.md` section(s) it operationalizes.

## Anti-patterns

- Writing the ADR after the implementation is already merged, as a rubber-stamp formality.
- Treating ADR acceptance as achieved by a PR simply going unreviewed for a while and then auto-merging.
- Bundling several unrelated boundary decisions into one ADR to save process overhead.

---

## Decision Log — Single Source of Truth

**Canonical location:** this file, section **Decision Log Entries (Append-Only)** below.  
**Authority:** Constitution Article VII.  
**Owner:** Chief Engineering Officer (process) · each entry has a named decision owner.

Until a future ADR relocates the Decision Log to another Single Source (e.g., an issue tracker), **this section is the only authoritative Decision Log**. Parallel chat pins, personal notes, and spreadsheet trackers have no standing in disputes.

### Decision Log vs ADR

| | Decision Log | ADR |
|---|---|---|
| Weight | Material product, process, engineering, operational decisions | Architecture-class boundary/trust/harness/schema semantics |
| Mutability | Append-only; supersede with a new entry | Immutable once Accepted; supersede with a new ADR |
| When required | Every material decision (Art. VII) | Every architecture-class change (Art. VIII) |
| May coexist | Yes — an ADR acceptance should also get a short Decision Log pointer entry |

### Required Entry Fields

Every entry MUST include:

1. **ID** — `DL-YYYYMMDD-NN` (UTC date + sequential number for that day)  
2. **Date** — ISO-8601 date  
3. **Decision** — one unambiguous sentence stating what was decided  
4. **Context** — why the decision was needed now  
5. **Alternatives** — at least one alternative considered (including “do nothing” when applicable)  
6. **Owner** — named human accountable  
7. **Consequences** — what changes operationally  
8. **Links** — related issue/PR/ADR/spec paths  
9. **Supersedes** — prior `DL-…` id if replacing an earlier entry (else `none`)

### Entry Template

```markdown
### DL-YYYYMMDD-NN — <short title>

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Decision | … |
| Context | … |
| Alternatives | 1) … 2) … |
| Owner | @name |
| Consequences | … |
| Links | … |
| Supersedes | none \| DL-… |
```

### Decision Log Workflow

1. At decision time (not weeks later), the owner drafts the entry in a PR that also implements or records the decision.  
2. Peer or role approver (PO/Tech Lead/Architect as appropriate to the decision class) acknowledges in the PR.  
3. Entry is appended to **Decision Log Entries (Append-Only)** — never edit prior entries except to fix non-semantic formatting.  
4. If the decision was wrong, append a new entry with `Supersedes: DL-…` stating the replacement decision.  
5. AI agents may propose draft entries; humans own and approve them for standing.

### Decision Log Decision Rules

1. Unlogged material decisions have **no standing** — re-decide explicitly.  
2. “The team decided” without a named Owner is invalid.  
3. Architecture-class decisions still need an ADR; the Decision Log entry then links the ADR id.  
4. Waivers of DoR/DoD/security defaults MUST appear here with an expiration or revisit date.

---

## Decision Log Entries (Append-Only)

> Newest entries at the **bottom**. Do not reorder. Do not rewrite history.

### DL-20260722-01 — Establish Decision Log SoR in ADR process doc

| Field | Value |
|-------|-------|
| Date | 2026-07-22 |
| Decision | The canonical Decision Log Single Source of Truth is `/docs/adr/README.md` (this file), section “Decision Log Entries (Append-Only)”, until a future ADR relocates it. |
| Context | Completeness rewrite of the Engineering OS required a concrete, non-placeholder Decision Log location so Article VII is operable for new engineers without asking. |
| Alternatives | 1) Create `/docs/DECISION_LOG.md` as a new file (rejected for this change set — no new files in the completeness pass; also unnecessary while this SoR is explicit). 2) Defer location to a future tooling ADR with no interim SoR (rejected — leaves Art. VII inoperable). 3) Use this file (chosen). |
| Owner | Chief Engineering Officer |
| Consequences | All material decisions must append here; engineering docs that previously said “location per ADR” now resolve to this path; a future ADR may move the log but must supersede this entry. |
| Links | `/CONSTITUTION.md` Art. VII; `/engineering/13_DOCUMENTATION.md`; this README |
| Supersedes | none |

### DL-20260722-02 — Adopt Solo Founder Mode for Engineering Process

| Field | Value |
|-------|-------|
| Date | 2026-07-22 |
| Decision | DYOGAS Engineering Process operates in Solo Founder Mode: Founder = Product Owner = Chief Architect = Tech Lead = Engineering Manager = Architecture Reviewer = Final Approver; a single Founder Approval satisfies all role-mapped human approval gates; stages must not block on non-existent organizational roles. |
| Context | Single Founder develops and governs DYOGAS; Runtime Specification (SPEC-RT-002) was blocked solely on missing Product Owner and Tech Lead roles that do not exist. |
| Alternatives | 1) Remain blocked forever on multi-role approvals (rejected). 2) Invent fictional second approvers (rejected — violates attributable approval). 3) Solo Founder Mode role mapping (chosen). |
| Owner | Founder |
| Consequences | `/engineering/README.md` §2a binding; all `/engineering` stage Approvers lines map to Founder; SPEC-RT-002 accepted via Founder Approval; Quality Gates (tests/checklists) remain required. |
| Links | `/engineering/README.md` §2a; `/engineering/01_SPECIFICATION.md`; `runtime/specs/SPEC-RT-002.md` |
| Supersedes | none |

### DL-20260722-03 — Void Solo Founder Mode; adopt Engineering Agent Approval

| Field | Value |
|-------|-------|
| Date | 2026-07-22 |
| Decision | Solo Founder Mode is void. DYOGAS Engineering Process uses AI-native Engineering Agents (Product Owner, Chief Architect, Tech Lead, Engineering Manager, Architecture Reviewer) with independent review artifacts. Founder Approval is business-only after all Engineering Agents approve. Founder never replaces an Engineering Agent. |
| Context | Solo Founder Mode incorrectly mapped Founder onto engineering roles; DYOGAS is an AI-native Engineering OS, not a one-person role system. |
| Alternatives | 1) Keep Solo Founder Mode (rejected — architecturally incorrect). 2) Human multi-role staff (not current operating model). 3) Engineering Agent chain + Founder business approval (chosen). |
| Owner | Founder (business decision recording this process correction) |
| Consequences | `/engineering/README.md` v2.2.0 §2a; all stage Approvers updated; SPEC-RT-002 Founder-as-PO/TechLead acceptance invalidated and returned to Engineering Agent review. |
| Links | `/engineering/README.md` §2a; `runtime/specs/SPEC-RT-002.md` |
| Supersedes | DL-20260722-02 |

### DL-20260722-04 — Fix Engineering Agent ↔ Runtime bootstrap deadlock

| Field | Value |
|-------|-------|
| Date | 2026-07-22 |
| Decision | Introduce Process Mode for Engineering Agents (executable under `/engineering` with no Runtime/SDK dependency). Hosted Mode (`MOD-ENG-AGENTS`) remains optional after Agent SDK (B17). Fix build order to `kernel → trust → runtime → agent-sdk → …`. MVP first code module is MOD-KERNEL (B5). Runtime Specification may complete before Kernel exists; Runtime Implementation may not. |
| Context | Engineering Process required Engineering Agent approvals while MASTER placed Engineering Agents after Runtime — circular bootstrap blocked MVP. |
| Alternatives | 1) Founder replaces agents (rejected — Solo Founder void). 2) Skip approvals until Runtime exists (rejected — process violation). 3) Process Mode bootstrap (chosen). |
| Owner | Founder (business record of architecture consistency fix) |
| Consequences | `engineering/README.md` v2.3.0; `MASTER_ARCHITECTURE.md` v1.2.0 Build Order/deps; Roadmap Phase 0 Decision Log/ADR checked; Kernel SPEC authored as MVP entry. |
| Links | `/engineering/README.md` §2a Bootstrap; `/MASTER_ARCHITECTURE.md` §5; `kernel/specs/SPEC-RT-001.md` |
| Supersedes | none (complements DL-20260722-03) |

### DL-20260722-05 — Architecture Review SPEC-RT-001: adr_required

| Field | Value |
|-------|-------|
| Date | 2026-07-22 |
| Decision | Architecture Review for MOD-KERNEL / SPEC-RT-001 renders verdict `adr_required`. ADR-0001 (platform stack and schema validation) drafted as `Proposed`. Kernel Implementation merge blocked until ADR-0001 is Accepted. Backlog not entered in this command. |
| Context | MVP B5 Kernel Architecture Review; first code module would otherwise lock stack without Art. VIII ADR. |
| Alternatives | 1) `no_arch_impact` (rejected — stack lock is architecture-class). 2) `rejected` (rejected — Kernel scope is sound). 3) `adr_required` + ADR-0001 Proposed (chosen). |
| Owner | Founder (business approval of Architecture Review completion) |
| Consequences | `kernel/stage/ARCHITECTURE_REVIEW.md` COMPLETE; next stage Backlog when commanded; Implementation waits on ADR-0001. |
| Links | `kernel/stage/ARCHITECTURE_REVIEW.md`; `docs/adr/0001-platform-stack-and-schema-validation.md`; SPEC-RT-001 |
| Supersedes | none |

### DL-20260723-01 — Accept ADR-0001 platform stack

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | ADR-0001 is Accepted: TypeScript 5.x strict, Node.js 22 LTS, npm package layout (`src`/`tests`/`dist`), `node:test`+`tsx`, Ajv for `/schemas`, GitHub Actions schema+kernel CI, Kernel no harness/pipelines/agent-runtime imports. |
| Context | Founder business APPROVE after Engineering Agents approved the filled acceptance revision; unlocks MOD-KERNEL Implementation. |
| Alternatives | 1) Reject and revise language (not chosen). 2) Accept incomplete shell (rejected earlier). 3) Accept filled ADR-0001 (chosen). |
| Owner | Founder (business) |
| Consequences | Kernel/Runtime protected merges may proceed under this stack; Decision fields immutable except via superseding ADR. |
| Links | `docs/adr/0001-platform-stack-and-schema-validation.md`; `kernel/stage/FOUNDER_APPROVAL_ADR-0001.md`; SPEC-RT-001 |
| Supersedes | none |

### DL-20260723-02 — Architecture Review SPEC-RT-004: adr_required; Accept ADR-0002

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Architecture Review for MOD-TRUST / SPEC-RT-004 is `adr_required`. ADR-0002 (Cloud AI Compute / egress boundary) is Accepted: deny-by-default Trust egress; no cloud vendor; no direct module egress; allow-cloud requires superseding ADR. |
| Context | B6 Trust adapters; Art. XI control point; Founder commanded Module Complete including ADR resolution. |
| Alternatives | 1) no_arch_impact (rejected — first Trust/egress control point). 2) Block Trust until vendor chosen (rejected). 3) adr_required + ADR-0002 deny-by-default (chosen). |
| Owner | Founder (business) |
| Consequences | Trust MVP Implementation unblocked under deny-all; cloud allow still blocked. |
| Links | `trust/stage/ARCHITECTURE_REVIEW.md`; `docs/adr/0002-cloud-ai-egress-boundary.md`; SPEC-RT-004 |
| Supersedes | none |

### DL-20260723-03 — Accept ADR-0003; MOD-RUNTIME Architecture Review

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Architecture Review SPEC-RT-002 is `adr_required`. ADR-0003 Accepted: Runtime is sole Harness-enforcement host; no law fork; Kernel+Trust deps; no Agent SDK in Runtime. |
| Context | B7 unblocked; Kernel+Trust COMPLETE; Founder Module Complete command. |
| Alternatives | 1) no_arch_impact (rejected — first Runtime host). 2) Runtime embeds agents (rejected). 3) ADR-0003 enforce-not-fork (chosen). |
| Owner | Founder (business) |
| Consequences | MOD-RUNTIME Implementation may proceed. |
| Links | `docs/adr/0003-runtime-harness-host.md`; `runtime/stage/ARCHITECTURE_REVIEW.md`; SPEC-RT-002 |
| Supersedes | none |

### DL-20260723-04 — Accept ADR-0004; MOD-AGENT-SDK

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Architecture Review SPEC-RT-003 is `adr_required`. ADR-0004 Accepted: Agent SDK binds contracts/skills/candidates; does not replace Runtime host. |
| Context | B8; Runtime COMPLETE; Founder Module Complete command. |
| Alternatives | 1) Bind in Runtime (rejected). 2) Per-engine bind (rejected). 3) ADR-0004 SDK boundary (chosen). |
| Owner | Founder (business) |
| Consequences | `@dyogas/agent-sdk` Implementation may proceed. |
| Links | `docs/adr/0004-agent-sdk-boundary.md`; SPEC-RT-003 |
| Supersedes | none |

### DL-20260723-05 — Accept ADR-0005; MOD-RESEARCH

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Architecture Review SPEC-ENGIN-001 is `adr_required`. ADR-0005 Accepted: Research Engine produces evidence and handoffs; no SoR/UI; mock sources OK under ADR-0002 deny-default. |
| Context | B9 first user-value engine; platform modules COMPLETE. |
| Alternatives | 1) Engine owns SoR (rejected). 2) Bypass Runtime (rejected). 3) ADR-0005 boundary (chosen). |
| Owner | Founder (business) |
| Consequences | `@dyogas/research-engine` Implementation may proceed. |
| Links | `docs/adr/0005-research-engine-boundary.md`; SPEC-ENGIN-001 |
| Supersedes | none |

### DL-20260723-06 — Accept ADR-0006; MOD-KNOWLEDGE

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Architecture Review SPEC-ENGIN-002 is `adr_required`. ADR-0006 Accepted: Knowledge Engine is sole SoR writer; apply requires Human Approval `approved`; no graph DB/UI. |
| Context | First Knowledge SoR code module; Research handoffs ready. |
| Alternatives | 1) Research writes SoR (rejected). 2) Open SoR (rejected). 3) ADR-0006 (chosen). |
| Owner | Founder (business) |
| Consequences | `@dyogas/knowledge-engine` Implementation may proceed. |
| Links | `docs/adr/0006-knowledge-sor-boundary.md`; SPEC-ENGIN-002 |
| Supersedes | none |

### DL-20260723-07 — B10 Validation+Proposal; B11 Human Gate (no_arch_impact)

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Architecture Review SPEC-ENGIN-001-B10 and SPEC-PIPE-B11 are `no_arch_impact`. B10 lands as Research enhancement; B11 as `@dyogas/human-gate` pipeline package (not a new `MOD-*`). Founder APPROVE via autonomous Build Orchestrator command. |
| Context | MVP-CORE PASS; Orchestrator executing remaining Build Order. |
| Alternatives | 1) New MOD-PROPOSAL-ENGINE (rejected — unregistered). 2) Enhancement under MOD-RESEARCH + pipeline package (chosen). |
| Owner | Founder (business) |
| Consequences | Research `@0.2.0`; human-gate `@0.1.0`; continue B12+. |
| Links | `research/specs/SPEC-ENGIN-001-B10.md`; `human-gate/specs/SPEC-PIPE-B11.md` |
| Supersedes | none |

### DL-20260723-08 — Accept ADR-0007; MOD-MARKDOWN

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Architecture Review SPEC-ENGIN-003 is `adr_required`. ADR-0007 Accepted: Markdown Engine consumes Knowledge handoff; emits unsealed `knowledge/markdown` candidates only; no SoR/UI/graph DB. |
| Context | B12 Markdown Engine after Knowledge handoff contract (`rendered: false`). |
| Alternatives | 1) Engine writes SoR (rejected). 2) Bypass SDK/Runtime (rejected). 3) ADR-0007 boundary (chosen). |
| Owner | Founder (business) |
| Consequences | `@dyogas/markdown-engine` Implementation may proceed / Module Complete. |
| Links | `docs/adr/0007-markdown-engine-boundary.md`; SPEC-ENGIN-003 |
| Supersedes | none |

### DL-20260723-09 — MOD-GRAPH + B15 + MOD-WEB-UI; MVP-PIPELINE COMPLETE

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | SPEC-ENGIN-004 Architecture Review `no_arch_impact` (in-memory graph + local-hash embeddings). SPEC-UI-001 `no_arch_impact`. B15 ingestion-e2e green. Founder APPROVE via autonomous Build Orchestrator. Claim **MVP-PIPELINE COMPLETE** (B17 Hosted ENG-AGENTS optional/deferred). |
| Context | Remaining Build Order after MVP-CORE executed without unregistered `MOD-*`. |
| Alternatives | 1) Durable graph DB in MVP (rejected — OOS-KN-001). 2) Cloud embeddings (rejected — OOS-KN-003). 3) Local-hash + in-memory deltas (chosen). |
| Owner | Founder (business) |
| Consequences | `@dyogas/graph-engine@0.1.0`, `@dyogas/web-ui@0.1.0`, `@dyogas/ingestion-e2e@0.1.0`; Build Order cursor DONE through B16. |
| Links | `graph/specs/SPEC-ENGIN-004.md`; `web-ui/specs/SPEC-UI-001.md`; `ingestion-e2e/` |
| Supersedes | none |

### DL-20260723-10 — Accept ADR-0009; MOD-PERSONAL-BRAIN Module Complete

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Architecture Review SPEC-PROD-001 is `adr_required`. ADR-0009 Accepted: Personal Second Brain is a product layer consuming Knowledge+Graph; owner-attributed capture approval; no Kernel/Runtime/Trust/Research source changes. |
| Context | Phase 1 product direction after MVP-PIPELINE COMPLETE. |
| Alternatives | 1) Extend Research for personal capture (rejected). 2) Modify Kernel for workspace (rejected). 3) MOD-PERSONAL-BRAIN product module (chosen). |
| Owner | Founder (business) |
| Consequences | `@dyogas/personal-brain@0.1.0` Module Complete. |
| Links | `docs/adr/0009-personal-brain-product-layer.md`; SPEC-PROD-001 |
| Supersedes | none |

### DL-20260723-11 — SPEC-PROD-002 Personal Brain Product MVP (human testing)

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | SPEC-PROD-002 Accepted; Arch Review `no_arch_impact`. Ship `@dyogas/personal-brain@0.2.0` with file persistence, Jina/Gemini adapters, approval UI, markdown artifacts, Graph link, `npm run dev`. |
| Context | External connection verification PASS; Gemini model `gemini-3.5-flash`. |
| Owner | Founder (business) via Harness Execution Engine |
| Consequences | Human-testing stage ready at http://127.0.0.1:8787 |
| Links | `personal-brain/specs/SPEC-PROD-002.md`; `personal-brain/docs/LOCAL_PRODUCT_TEST.md` |
| Supersedes | none |

### DL-20260723-12 — MOD-PERSONAL-BRAIN Product MVP Acceptance Complete

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Close Product MVP Acceptance for MOD-PERSONAL-BRAIN after live audit PASS, agent review chain + Founder APPROVE, and implementation of REQ-PB-A1..A3 (search, empty states, process-restart proof). Defer GAP-04c binary upload. |
| Context | Engine Complete → Product MVP Acceptance Complete via DYOGAS Engineering Process Phase 1–3. |
| Alternatives | 1) Block MVP on binary upload (rejected). 2) Ship without search/restart proof (rejected). 3) Accept with deferred GAP-04c (chosen). |
| Owner | Founder (business) via Harness Execution Engine |
| Consequences | `MODULE_STATUS.md` Product MVP Acceptance Complete; Kernel/Runtime/Trust/Agent SDK unmodified. |
| Links | `personal-brain/stage/ACCEPTANCE_AUDIT.md`; `personal-brain/stage/reviews/`; `personal-brain/stage/RETRO.md` |
| Supersedes | none |

### DL-20260723-13 — Reject prior automated acceptance; require Ask human workflow (SPEC-PROD-003)

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Founder rejects prior automated Product MVP Acceptance PASS. Real UAT FAIL on Ask human approval. Founder APPROVE SPRINT-PB-ASK-HUMAN-001 / SPEC-PROD-003: Ask propose→evidence→approve/edit/reject→optional learn. After implementation, real browser UAT item 9 PASS restores Human Product Acceptance. |
| Context | Engineering smoke ≠ human product acceptance; Constitution human-approval for consequential AI outputs. |
| Alternatives | 1) Keep auto-final Ask answers (rejected). 2) Product-layer AskProposal workflow (chosen). 3) Modify Trust/Kernel (rejected). |
| Owner | Founder (business) via Harness Execution Engine |
| Consequences | `@dyogas/personal-brain` Ask API returns `status: proposed`; decision endpoints; UI gate; real-uat PASS. |
| Links | `personal-brain/specs/SPEC-PROD-003.md`; `personal-brain/stage/REAL_ACCEPTANCE_REPORT.md` |
| Supersedes | DL-20260723-12 acceptance claim (revoked then restored after SPEC-PROD-003) |

### DL-20260723-14 — Controlled deletion of Personal Brain Product UI layer

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Delete Personal Brain Product UI layer only (HTTP server, browser UI, demo/UAT presentation scripts). Preserve Personal Brain core services and external connection adapters. Do not modify Kernel/Trust/Runtime/SDK/Research/Knowledge/Graph. |
| Context | Clear slate for a new product presentation layer on preserved core + connections. |
| Alternatives | 1) Full module reset (rejected). 2) Archive/move only (rejected). 3) Controlled product-UI deletion (chosen). |
| Owner | Founder (business) via Harness Execution Engine |
| Consequences | `@dyogas/personal-brain` is core+connection library; `stage/PRODUCT_LAYER_REMOVAL.md`; ready for new product layer. |
| Links | `personal-brain/stage/PRODUCT_LAYER_REMOVAL.md` |
| Supersedes | none |

### DL-20260723-15 — Founder APPROVE Personal Brain Harness Bridge (SPEC-PROD-004)

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Founder APPROVED Personal Brain Harness Bridge. Architecture Review APPROVE / `no_arch_impact`. Authorize creation of SPRINT-PB-HARNESS-BRIDGE-001. Personal Brain consumes existing Execution Harness (`knowledge-ingestion`); no UI, Decision Agent, Runtime/SDK rewrite, or new pipeline topology. |
| Context | SPEC-PRODUCT-MASTER + SPEC-PROD-004-HARNESS-BRIDGE; TRACE-PB-BRIDGE-001. |
| Owner | Founder (business) |
| Consequences | Spec may proceed to `accepted` and sprint planning; implementation not started by this entry. |
| Links | `docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md`; `personal-brain/specs/SPEC-PROD-004-HARNESS-BRIDGE.md` |
| Supersedes | none |

### DL-20260723-16 — MOD-EXECUTION-HOST Module Complete; ADR-0010 Accepted; B18

| Field | Value |
|-------|-------|
| Date | 2026-07-23 |
| Decision | Founder APPROVED path complete: SPEC-EXECUTION-HOST-001 + ADR-0010 Accepted. SPRINT-EXECUTION-HOST-001 COMPLETE. Register **MOD-EXECUTION-HOST** / Build Order **B18 DONE** in MASTER_ARCHITECTURE. Package `@dyogas/execution-host@0.0.1` is Pipeline Engine implementation composing Runtime + SDK under Harness law. |
| Context | TRACE-EXEC-HOST-001; Architecture Sync after Module Complete. |
| Owner | Founder (business) · Chief Systems Architect (registry) |
| Consequences | Experience products request Host; no second orchestrator; Runtime remains primitives host (ADR-0003). |
| Links | `docs/decision-log/DL-EXECUTION-HOST-001.md`; `docs/adr/0010-pipeline-execution-host.md`; `execution-host/stage/MODULE_COMPLETE.md`; `MASTER_ARCHITECTURE.md` |
| Supersedes | none |

---

## References

- [`/CONSTITUTION.md`](../../CONSTITUTION.md) Article VII — Decision Log Required; Article VIII — ADR Required for Architecture Changes
- [`/docs/ARCHITECTURE.md`](../ARCHITECTURE.md) — the document ADRs ultimately update
- [`/docs/ROADMAP.md`](../ROADMAP.md) Phase 0/Phase 2 — where ADR process maturity and boundary ADRs are exit criteria
- [`/engineering/10_RETROSPECTIVE.md`](../../engineering/10_RETROSPECTIVE.md) — retro actions that become material decisions
- [`/engineering/14_DEFINITION_OF_DONE.md`](../../engineering/14_DEFINITION_OF_DONE.md) — DoD waivers must log here

**End of ADR Process & Decision Log v2.1.0**
