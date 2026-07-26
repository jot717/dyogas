# DYOGAS Skill Specification

**Version:** 2.0.0
**Status:** Canonical (specification only — not implementation)
**Effective:** 2026-07-22
**Owner:** Chief Systems Architect
**Layer:** `/harness` (execution)
**Supersedes:** Skill Specification v1.1.0 (completeness rewrite; every skill expanded, no thinning of prior content)
**Related:** [`/CONSTITUTION.md`](../CONSTITUTION.md), [`HARNESS_SPECIFICATION.md`](./HARNESS_SPECIFICATION.md), [`/contracts`](../contracts), [`/docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md), [`/pipelines`](../pipelines), [`/artifacts`](../artifacts), [`/schemas`](../schemas)

---

## 1. Purpose

This document is the **Single Source of Truth** for DYOGAS skills: reusable, testable capability units that agents invoke **inside** Harness-bound contract executions.

Skills are **not** agents and **not** orchestrators. Agents own role boundaries via `/contracts`; the Harness owns pipelines, handoffs, retries, and gates (`HARNESS_SPECIFICATION.md`); skills own bounded procedures with declared I/O, dependencies, and tests.

This document does **not** implement connectors, prompts, libraries, or runtime code. Every skill below is specified to the level of completeness required for a future implementation to be built and tested directly against this document without further interpretation, and for a reviewer to accept or reject that implementation using only the Acceptance Criteria and Test Cases stated here.

## Global Definitions

| Term | Definition |
|------|------------|
| **Skill** | A named, reusable, testable capability unit with declared Purpose, Input, Output, Dependencies, Error Handling, and Test Cases, invoked inside a contracted agent's Execute phase (`HARNESS_SPECIFICATION.md` §3.1). |
| **Reusable component** | A shared logical data shape or interface (e.g., `EvidenceItem`, `ApplyToken`) referenced by multiple skills, defined once in §7's registry. |
| **Partial success** | A skill outcome where some but not all of the requested work completed, explicitly labeled as such in the output — never presented as if it were complete. |
| **Fail closed (skill sense)** | A skill that, on ambiguity about trust, ownership, provenance, or policy, returns an explicit denial/error rather than guessing or proceeding. |
| **Fabrication** | A skill inventing a source, citation, score, identifier, or merge resolution that was not actually derived from real input data. Absolutely forbidden for every skill in this catalog. |

## Scope

This document covers every skill in the Catalog Index (§4) that any current or future DYOGAS agent may invoke. It does not cover agent-level role boundaries (`/contracts`), pipeline-level stage sequencing (`/pipelines`), or artifact-level field semantics (`/artifacts`, `/schemas`) — those layers reference skills but are not defined by this document.

## Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Chief Systems Architect (Owner)** | Maintains this catalog; approves new skills and amendments to existing ones. |
| **Agent Contract Owners** | Declare, per contract, exactly which skills their agent may invoke (`HARNESS_SPECIFICATION.md` §3.1 Execute phase rule: undeclared skill use is a contract violation). |
| **Future skill implementers** | Build strictly to the Purpose/Input/Output/Dependencies/Error Handling/Test Cases stated per skill; treat every listed Test Case as a mandatory acceptance obligation, not a suggestion. |
| **Any Contributor proposing new capability** | Searches this catalog first (Constitution Article VI); extends an existing skill's scope via amendment rather than duplicating it. |

---

## 2. Skill Law (Binding)

| Rule | Implication |
|------|-------------|
| Single Source of Truth | One skill per named capability; no shadow forks |
| Documentation first | Behavior changes update this catalog in the same change set |
| Test before merge | No skill implementation merges without its declared test cases passing |
| Security by default | Egress, credentials, and writes fail closed without policy clearance |
| Local-first ownership | Skills persist knowledge only via Knowledge Plane / Memory Agent paths |
| Cloud AI Compute | Heavy model steps run purpose-bound through the Cloud AI Compute Layer |
| No fabrication | Skills must not invent sources, citations, scores, or merge resolutions |
| Human approval | Skills that mutate SoR stop at proposal/pending unless Knowledge Approval (or equivalent human gate) completes |

**Authority hierarchy:** Constitution → ADRs → `/docs` → Harness Specification → Agent Contracts → this Skill Specification → Decision Log → runtime config.

Skills must not write Knowledge Plane SoR without Human Approval Gate completion.

### 2.1 Decision Rules

1. A skill that could technically bypass Knowledge Approval to write SoR faster must never do so, regardless of urgency — see Constitution Article XIII and `HARNESS_SPECIFICATION.md` §9.
2. A skill discovered to duplicate an already-cataloged skill's capability is a Constitution Article VI violation and must be consolidated, not maintained in parallel.
3. When a skill's declared Error Handling table does not cover an error actually observed in production, that is treated as an incomplete specification requiring an amendment — not a reason for the implementation to invent undocumented behavior.

### 2.2 Examples

- **Compliant**: A new "PDF Research" capability is proposed; the author first checks this catalog, finds Web Research already covers document fetch/parse broadly, and instead proposes an amendment adding PDF-specific `SourceClassAdapter` handling to Web Research rather than creating "PDF Research" as a fourteenth-plus skill.
- **Violation**: A team implements its own inline duplicate-detection logic inside the Markdown Agent instead of invoking the cataloged Duplicate Detection skill, because "it was faster to just write it there."

### 2.3 Acceptance Criteria

- [ ] Every skill invoked anywhere in production maps to exactly one entry in this catalog.
- [ ] No skill implementation exists that lacks a corresponding catalog entry.
- [ ] No two catalog entries describe overlapping capability without an explicit note distinguishing their scopes.

### 2.4 Failure Cases

- A skill silently writes to the Knowledge Plane without a completed Knowledge Approval → Critical, revert immediately, incident review (Constitution Article XIII).
- Two agents each maintain their own citation-formatting logic instead of both using Citation Builder → Major, consolidate.

### 2.5 Best Practices

- Treat "no fabrication" as the single most important rule in this table — every skill's Error Handling table exists largely to make fabrication structurally impossible, not merely discouraged.
- When a skill's scope feels like it's growing to cover a new source type or output shape, check whether that growth still fits the skill's stated Purpose before proceeding, or whether it should be its own catalog entry.

### 2.6 Anti-patterns

- "We'll add proper error handling once we see what actually breaks in production" — the Error Handling table must be designed before implementation, not backfilled.
- Treating Human Approval as a UI checkbox rather than a genuine gate that can result in `rejected`.

---

## 3. Shared Contract

Every skill in this catalog is specified using the same seven-part shared contract, so that any two skills can be compared, tested, and composed consistently.

### 3.1 Identity

- Stable **skill name** as catalogued (exact spelling).
- One **Purpose**; scope expansion requires amendment.

### 3.2 I/O

- Inputs/outputs are structured artifacts with provenance fields where facts are asserted.
- Partial success must be explicit (what completed, what did not).

### 3.3 Dependencies

- Dependencies list other skills, agent roles, planes, and external source classes — not vendor SDKs.
- Circular runtime dependencies are forbidden unless an ADR defines an orchestration break.

### 3.4 Error Handling

- Errors are machine-readable: `code`, `severity`, `retryable`, `human_summary`, `partial_result?`.
- Prefer fail closed on trust, ownership, and provenance defects.

### 3.5 Test Cases

- Listed tests are **acceptance obligations** for any future implementation.
- Include happy path, policy denial, empty/degenerate input, and at least one adversarial/negative case where relevant.

### 3.6 Reusable Components

- Logical building blocks shared across skills (interfaces/concepts only).
- New components require catalog update; do not embed one-off duplicates.

### 3.7 Typical Agent Consumers

| Skill family | Primary agents |
|--------------|----------------|
| Research skills | Research Agent → Source Validation Agent |
| Markdown / merge / detect / score / cite | Markdown Agent, Knowledge Review Agent, Knowledge Graph Agent |
| Proposal / approval | Proposal Agent, Knowledge Review Agent |
| Memory update | Memory Agent, Learning Agent (propose), Notification Agent (status) |

### 3.8 Workflow — Specifying or Amending a Skill

1. **Check the catalog** (§4) for an existing owner of the capability.
2. **Draft using the shared contract** (§3.1–§3.6) plus the expansion sections required by this document (Definitions, Scope, Responsibilities, Workflow, Decision Rules, Examples, Acceptance Criteria, Failure Cases, Best Practices, Anti-patterns, References).
3. **List every Test Case** the future implementation must satisfy, including happy path, policy denial, degenerate input, and adversarial cases.
4. **Add or reuse Reusable Components** (§7); never fork a component that already exists.
5. **Submit as an amendment** per §9 — Decision Log entry always, ADR if trust/egress/SoR boundaries change, human approval always.

### 3.9 Decision Rules (Shared Contract)

1. A skill specification missing any of the seven shared-contract parts is incomplete and must not be treated as catalog-ready.
2. Two skills may share a Reusable Component but must not share an implementation identity — each skill's Purpose remains singular and non-overlapping with any other cataloged skill.

### 3.10 References

`HARNESS_SPECIFICATION.md` §15 (Skills Under the Harness), `/contracts/README.md`

---

## 4. Skill Catalog Index

| # | Skill | Primary job |
|---|--------|-------------|
| 1 | YouTube Research | Collect candidate evidence from YouTube |
| 2 | GitHub Research | Collect candidate evidence from GitHub |
| 3 | Reddit Research | Collect candidate evidence from Reddit |
| 4 | Web Research | Collect candidate evidence from the open web |
| 5 | Markdown Builder | Produce review-ready Markdown artifacts |
| 6 | Knowledge Merge | Merge knowledge deltas into a coherent candidate SoR update |
| 7 | Duplicate Detection | Find near/exact duplicate knowledge units |
| 8 | Conflict Detection | Find contradictory claims across units |
| 9 | Summarization | Produce faithful summaries with provenance |
| 10 | Citation Builder | Build structured citations from validated sources |
| 11 | Knowledge Scoring | Score knowledge quality / fitness for use |
| 12 | Proposal Builder | Assemble decision-ready proposal artifacts |
| 13 | Knowledge Approval | Gate SoR mutation behind review + human approval |
| 14 | Memory Update | Apply authorized working → durable memory transactions |

---

## 5. Catalog

### 5.1 YouTube Research

| Field | Specification |
|-------|----------------|
| **Purpose** | Gather candidate video/channel evidence for a research brief from YouTube within policy and budget — without asserting final truth. |
| **Input** | Research brief; query set; allow/deny channel lists; language/region constraints; depth/time/result budget; consent/policy token for egress. |
| **Output** | Evidence items: video ids/urls, titles, channel provenance, timestamps/transcripts or captions when allowed, relevance notes, coverage gaps. |
| **Dependencies** | Orchestration policy/consent; Trust & Control egress; optional Summarization for long transcripts; feeds Source Validation Agent / Citation Builder later. |
| **Error Handling** | `POLICY_DENY` (non-retryable); `QUOTA_EXCEEDED` / `RATE_LIMIT` (retryable with backoff); `SOURCE_UNAVAILABLE`; `TRANSCRIPT_BLOCKED` (partial OK if video metadata remains); `BUDGET_EXHAUSTED`; never fabricate video ids. |
| **Test Cases** | Valid brief returns items with resolvable video provenance; deny-list channels excluded; budget hard-stop; policy deny yields zero egress; missing transcript yields partial item + flag; empty query set fails closed; adversarial title-only spam does not invent citations. |
| **Reusable Components** | `ResearchBrief`, `EvidenceItem`, `ProvenancePointer`, `BudgetGuard`, `EgressGate`, `SourceClassAdapter` (youtube). |

**Definitions:** *Channel allow/deny list* — an explicit policy set restricting which YouTube channels may be queried or excluded; absent an allow list, all non-denied public channels are in scope. *Transcript* — machine or human-generated caption text associated with a video, distinct from video metadata (title, channel, publish date), which may remain available even when a transcript is blocked.

**Scope:** Applies only to YouTube as a source class. Does not cover other video platforms (would require a new `SourceClassAdapter` and, if substantially different in shape, its own catalog amendment) and does not cover any claim-truth assessment (that is Source Validation Agent's job downstream).

**Responsibilities:** The invoking Research Agent declares the budget and policy token; the skill enforces `BudgetGuard` and `EgressGate` internally and must never silently exceed either.

**Workflow:** (1) Validate the `ResearchBrief` and budget are non-empty; (2) resolve the query set against allow/deny channel lists; (3) for each in-scope candidate, fetch metadata and, if permitted, transcript/captions; (4) attach a `ProvenancePointer` to every item; (5) stop when budget is exhausted or the query set is exhausted, whichever first; (6) return the evidence pack with explicit `coverage_gaps` for anything not covered.

**Decision Rules:** 1. A channel on the deny list is excluded even if it would otherwise be the most relevant result — deny-list takes precedence over relevance. 2. If a transcript is blocked but metadata is retrievable, the item is returned as partial (not omitted, not treated as a full failure). 3. If the budget is exhausted with zero results collected, the skill returns an explicit empty pack with gaps stated, not a fabricated near-miss result.

**Examples:** *Compliant* — A brief asking about "recent developments in on-device embedding models" with a budget of 20 fetches returns 14 video items with resolvable urls/timestamps and explicitly lists 6 unused budget units plus a gap note for a language it couldn't cover. *Violation* — The skill returns a video id that was never actually resolved from a real API response, invented to "fill out" the requested count — this is fabrication and is a hard failure regardless of how plausible the invented id looks.

**Acceptance Criteria:** Every returned item resolves to a real, checkable video/channel; deny-listed channels never appear; budget is never exceeded; empty results are explicit, not silently omitted from the pack.

**Failure Cases:** A deny-listed channel appears in output due to a filter bug → Major, fix filter, audit any downstream artifacts derived from that item. A fabricated video id is discovered in production output → Critical, treat as a fabrication incident per Constitution Article IX/XII-adjacent trust violation; halt the skill pending root-cause fix.

**Best Practices:** Prefer resolving full metadata before attempting transcript fetch, so a transcript failure still yields a usable partial item. Log the exact query set actually executed, not just the brief, for reproducibility.

**Anti-patterns:** Treating "the video looks like it exists based on the title pattern" as sufficient to include it without actually resolving it. Silently dropping deny-listed-adjacent channels without recording why.

**References:** `HARNESS_SPECIFICATION.md` §15, Source Validation Agent contract, `/artifacts/research-report.md`.

---

### 5.2 GitHub Research

| Field | Specification |
|-------|----------------|
| **Purpose** | Gather candidate evidence from GitHub (repos, issues, PRs, releases, READMEs) for a research brief within policy and budget. |
| **Input** | Research brief; query/repo scope; visibility rules (public/allowed private); path/file filters; budget; policy token. |
| **Output** | Evidence items: canonical URLs/SHAs/refs, repo metadata, excerpt pointers, license hints when available, relevance notes, gaps. |
| **Dependencies** | EgressGate; BudgetGuard; optional Summarization for long files; Source Validation; license awareness for downstream use. |
| **Error Handling** | `POLICY_DENY`; `AUTH_REQUIRED` / `FORBIDDEN` (no cross-tenant scrape); `RATE_LIMIT`; `REF_NOT_FOUND`; `BINARY_SKIPPED` (partial); `BUDGET_EXHAUSTED`; no invented commits/SHAs. |
| **Test Cases** | Scoped repo search returns SHA/ref provenance; private repo without grant fails closed; binary files skipped with reason; rate limit surfaces retryable error; license field null vs present distinguished; deny path filters honored. |
| **Reusable Components** | `ResearchBrief`, `EvidenceItem`, `ProvenancePointer`, `BudgetGuard`, `EgressGate`, `SourceClassAdapter` (github), `LicenseHint`. |

**Definitions:** *Ref* — a Git reference (branch, tag, or commit SHA) pinning the exact state of a repository an evidence item was drawn from. *License hint* — a best-effort, non-authoritative signal about a repository's declared license, distinguished from a legally-verified license determination.

**Scope:** Applies to GitHub as a source class, including repos, issues, PRs, releases, and README/doc content within a repo. Does not perform legal license clearance (only hints) and does not cover other Git-hosting platforms without a catalog amendment.

**Responsibilities:** The invoking agent supplies visibility rules; the skill must never scrape a private repository without an explicit, verifiable grant, and must treat `AUTH_REQUIRED`/`FORBIDDEN` as hard stops, not something to retry past.

**Workflow:** (1) Resolve scope (specific repos/orgs or a search query) against visibility rules; (2) for each in-scope result, pin an exact `ref` (SHA preferred over a mutable branch name); (3) apply path/file filters, skipping binaries with an explicit reason; (4) attach `LicenseHint` when a license file or manifest field is present; (5) stop at budget exhaustion; (6) report gaps for anything filtered out or inaccessible.

**Decision Rules:** 1. A private repository without an explicit grant is always `FORBIDDEN`, non-retryable, regardless of how public-seeming its content might be via other means. 2. A binary file is always skipped, never partially parsed as text, and always reported with `BINARY_SKIPPED` plus the file path. 3. `LicenseHint` is `null` when no license signal exists — the skill must never infer or guess a license from repository popularity, language, or naming convention.

**Examples:** *Compliant* — A scoped search across three public repos returns evidence items each pinned to a specific commit SHA, with one binary asset explicitly skipped and reported, and license hints present for two of the three repos (the third has no manifest license field, correctly reported as `null`). *Violation* — The skill attempts to fetch content from a private repository using credentials that happen to be configured for an unrelated purpose, without an explicit grant tied to this research brief — this is a `FORBIDDEN` case that must fail closed, not proceed because access was technically possible.

**Acceptance Criteria:** Every item pins a resolvable `ref`; no private-repo access without an explicit grant; every binary skip is reported, not silently dropped; license field is `null` or a real hint, never guessed.

**Failure Cases:** A private repo is accessed without a proper grant due to overly broad service credentials → Critical, revoke/scope credentials immediately, incident review for cross-tenant exposure risk. A `LicenseHint` is fabricated from repository name heuristics → Critical fabrication incident.

**Best Practices:** Always prefer commit SHA over branch name for `ref` pinning, since branches are mutable and would silently change the meaning of "what was researched" over time. Report rate-limit backoff windows transparently so the calling agent's retry policy (per `HARNESS_SPECIFICATION.md` §7) can plan accordingly.

**Anti-patterns:** Pinning to a mutable branch name and treating it as if it were immutable provenance. Attempting a "read-only peek" at a private repo to see if it's interesting before confirming a grant exists.

**References:** `HARNESS_SPECIFICATION.md` §6 (Handoff Rules, tenancy), Source Validation Agent contract.

---

### 5.3 Reddit Research

| Field | Specification |
|-------|----------------|
| **Purpose** | Gather candidate discussion evidence from Reddit (posts/comments) for a research brief, labeled as community signal — not authoritative fact. |
| **Input** | Research brief; subreddit allow/deny; query; time window; budget; policy token; NSFW/safety policy. |
| **Output** | Evidence items: permalinks, subreddit, author handles as available, scores/dates when provided by source, excerpts, **signal_tier=`community`**, gaps. |
| **Dependencies** | EgressGate; BudgetGuard; Source Validation (must not launder community signal as primary authority without flags); optional Summarization for threads. |
| **Error Handling** | `POLICY_DENY`; `SUBREDDIT_BLOCKED`; `RATE_LIMIT`; `THREAD_DELETED` / `SOURCE_UNAVAILABLE`; `SAFETY_BLOCK`; `BUDGET_EXHAUSTED`; never invent usernames or permalinks. |
| **Test Cases** | Items marked `community` signal tier; deny-list subs excluded; deleted thread → unavailable not fabricated; safety block fails closed; budget stop; brief without query fails. |
| **Reusable Components** | `ResearchBrief`, `EvidenceItem`, `SignalTier`, `BudgetGuard`, `EgressGate`, `SourceClassAdapter` (reddit), `SafetyFilter`. |

**Definitions:** *Signal tier* — a categorical label (`community`, `primary`, etc., defined by `SignalTier`) indicating the authority level of a piece of evidence; Reddit evidence is always `community` tier by definition of this skill, never elevated to `primary` regardless of upvote count or apparent expertise of the commenter. *Safety block* — a hard stop triggered by `SafetyFilter` for NSFW or otherwise policy-restricted content, independent of subreddit allow/deny configuration.

**Scope:** Applies to Reddit posts and comments only. Explicitly does not assert factual authority — downstream consumers (Source Validation, Knowledge Scoring) must treat `signal_tier=community` as a hard ceiling on trust weighting, never overridden by this skill's own output.

**Responsibilities:** The invoking agent supplies subreddit allow/deny and safety policy; the skill enforces `SafetyFilter` unconditionally, even if a subreddit is otherwise allow-listed.

**Workflow:** (1) Validate query and time window are present; (2) resolve subreddit scope against allow/deny; (3) apply `SafetyFilter` to every candidate before inclusion; (4) for surviving candidates, capture permalink, author handle (if public and available), score/date as provided by the source, and an excerpt; (5) tag every item `signal_tier=community`; (6) stop at budget exhaustion; (7) report deleted/unavailable threads explicitly rather than omitting them silently when they were a expected match.

**Decision Rules:** 1. `SafetyFilter` always overrides allow-list status — an allow-listed subreddit does not exempt individual NSFW/unsafe content from being blocked. 2. A deleted thread that was expected to match is reported as `SOURCE_UNAVAILABLE`/`THREAD_DELETED`, never silently skipped without a gap note, so downstream consumers know coverage was attempted. 3. Usernames and permalinks are only ever included if directly resolved from a real response; a deleted/anonymized author is reported as such, never backfilled with a guessed handle.

**Examples:** *Compliant* — A query about "common failure modes reported by users of X" returns 8 community-tier items with real permalinks, explicitly notes 2 threads were deleted since indexing, and includes zero fabricated usernames. *Violation* — Downstream, an agent treats a highly-upvoted Reddit comment as if it were validated fact without the `community` signal tier being respected — this is a downstream Source Validation failure, but the Reddit Research skill itself must ensure the tier is present and correctly set so such downstream errors are at least detectable and reviewable.

**Acceptance Criteria:** Every item carries `signal_tier=community`; every deleted/unavailable expected match is reported explicitly; no safety-blocked content is ever returned regardless of allow-list status; budget respected.

**Failure Cases:** A safety-blocked item is returned because a subreddit-level allow-list check ran without also running `SafetyFilter` → Critical, fix immediately, audit for any other bypasses of `SafetyFilter`. `signal_tier` is missing from an item due to a schema regression → Major, block release until fixed, since downstream trust weighting depends on it.

**Best Practices:** Always run `SafetyFilter` as the very first per-item check, before any other processing, so unsafe content never even reaches excerpt-capture logic. Preserve the "as provided by source" caveat on scores/dates since Reddit's own scores can be noisy, time-decayed, or vote-fuzzed.

**Anti-patterns:** Allowing a "trusted subreddit" designation to silently imply primary-tier signal. Guessing at a deleted comment's likely content from context to "fill the gap."

**References:** `SignalTier` (§7), Source Validation Agent contract, Knowledge Scoring skill (§5.11).

---

### 5.4 Web Research

| Field | Specification |
|-------|----------------|
| **Purpose** | Gather candidate evidence from the open web (general search + fetch) within policy, robots/legal constraints, and budget. |
| **Input** | Research brief; query set; domain allow/deny; content-type limits; fetch depth; budget; policy token. |
| **Output** | Evidence items: canonical URLs, titles, fetch timestamps, excerpts/snapshots refs when allowed, MIME/type, relevance notes, gaps. |
| **Dependencies** | EgressGate; BudgetGuard; SafetyFilter; optional Summarization; Source Validation; Duplicate Detection useful before pack finalize. |
| **Error Handling** | `POLICY_DENY`; `DOMAIN_BLOCKED`; `FETCH_FAILED` / `TIMEOUT` (retryable per policy); `ROBOTS_OR_TOS_BLOCK`; `PAYWALL_OR_AUTH`; `BUDGET_EXHAUSTED`; no invented URLs. |
| **Test Cases** | Allow-list honored; deny domain never fetched; timeout yields retryable error without fake content; empty results return empty pack + gaps (not error unless brief requires min hits); content-type filter skips binaries; redirect to denied domain fails closed. |
| **Reusable Components** | `ResearchBrief`, `EvidenceItem`, `ProvenancePointer`, `BudgetGuard`, `EgressGate`, `SourceClassAdapter` (web), `SafetyFilter`, `FetchSnapshotRef`. |

**Definitions:** *Robots/ToS block* — a hard stop respecting a site's `robots.txt` directives or explicit terms-of-service restriction on automated access, independent of technical fetchability. *Fetch snapshot ref* — a pointer to a captured copy of fetched content at a specific timestamp, distinct from the live URL which may change or disappear later.

**Scope:** Applies to general open-web search and fetch. Does not apply to sites better served by a dedicated `SourceClassAdapter` (YouTube, GitHub, Reddit) — those take precedence when the brief's intent clearly targets one of those platforms.

**Responsibilities:** The invoking agent supplies domain allow/deny and content-type limits; the skill enforces `ROBOTS_OR_TOS_BLOCK` unconditionally, even for allow-listed domains, since allow-listing is a relevance/scope decision, not a legal-access override.

**Workflow:** (1) Validate query set and budget; (2) resolve candidate URLs via search, filtering against domain allow/deny; (3) for each candidate, check `robots.txt`/ToS before fetch; (4) fetch and check content-type against limits, skipping disallowed binaries; (5) follow redirects but re-check the *final* domain against allow/deny (a redirect to a denied domain fails closed even if the origin URL was allowed); (6) capture a `FetchSnapshotRef` and timestamp; (7) stop at budget exhaustion; (8) report gaps explicitly, and return an explicit empty pack (not an error) if zero results are found and the brief did not require a minimum hit count.

**Decision Rules:** 1. A redirect chain ending on a denied domain fails closed regardless of the originating URL's allow-list status. 2. A robots/ToS block is treated identically to a hard `POLICY_DENY` — no retry, no workaround fetch method. 3. A timeout never produces fabricated placeholder content; it produces an explicit `TIMEOUT` error, retryable per the calling agent's contract-declared retry policy.

**Examples:** *Compliant* — A query for public documentation returns 5 items, explicitly skips 2 candidates blocked by `robots.txt`, and reports one `TIMEOUT` as retryable rather than inventing a summary of the unreachable page. *Violation* — A redirect from an allow-listed short-link domain lands on a denied domain, and the skill fetches and returns content anyway because "the original URL was allowed" — this is a policy violation and must fail closed on the final resolved domain.

**Acceptance Criteria:** No fetch occurs against a robots/ToS-blocked or denied (including via redirect) domain; every returned item has a real, resolvable URL and timestamp; empty results are explicit, not errors, unless the brief specifies a minimum-hit requirement.

**Failure Cases:** A denied domain is fetched via a redirect loophole → Critical, patch redirect-domain re-check immediately, audit historical fetches for the same gap. A timeout is silently converted into a fabricated "likely content" excerpt by an overly helpful implementation → Critical fabrication incident.

**Best Practices:** Always re-validate the domain allow/deny list against the *final* resolved URL after following redirects, not just the initial query result URL. Snapshot fetched content with a timestamp so later disputes about "what did this page say when we researched it" are answerable even if the live page has since changed.

**Anti-patterns:** Treating allow-listing as a one-time check against the initial URL rather than the final fetch target. Returning a "best guess" summary when a fetch fails instead of an explicit error.

**References:** `SafetyFilter` (§7), Duplicate Detection (§5.7), Source Validation Agent contract.

---

### 5.5 Markdown Builder

| Field | Specification |
|-------|----------------|
| **Purpose** | Transform structured content intent into review-ready Markdown that conforms to templates and house style without inventing facts. |
| **Input** | Content intent or outline; claims/excerpts with provenance; template id; front-matter schema; link policy; locale. |
| **Output** | Markdown artifact(s); front matter; heading map; link check report; change summary; unresolved-claim list. |
| **Dependencies** | Markdown Agent as consumer; Citation Builder for reference sections; Knowledge Review before SoR write; Cloud AI Compute optional for phrasing only. |
| **Error Handling** | `TEMPLATE_MISSING`; `SCHEMA_INVALID`; `UNSOURCED_CLAIM` (fail or strip per policy — never silently keep); `LINK_BROKEN` (report; fail if policy=`strict`); `SCOPE_VIOLATION` on canonical doc rewrite without grant. |
| **Test Cases** | Template conformance; unsourced claim blocked in strict mode; stable heading ids; internal links validated; meaning-preserving rewrite (golden fixtures); refuses destructive rewrite without scope flag. |
| **Reusable Components** | `MarkdownTemplate`, `FrontMatterSchema`, `ClaimWithProvenance`, `LinkChecker`, `DiffFriendlyWriter`, `StyleRules`. |

**Definitions:** *Unsourced claim* — an assertion of fact in the intended content that has no attached `ClaimWithProvenance` pointer; distinct from stylistic or structural prose which needs no citation. *Scope violation* — an attempt to rewrite a canonical document's meaning-bearing content beyond what the invoking agent's contract/task explicitly grants (e.g., rewriting an unrelated section "while we're in there").

**Scope:** Applies to producing or revising Markdown artifacts within DYOGAS's own template/front-matter conventions. Does not apply to arbitrary document formats outside Markdown, and does not itself decide whether content is *true* — that is upstream Source Validation's and downstream Knowledge Review's job; this skill only ensures claims are traceable, not that they are correct.

**Responsibilities:** The invoking agent supplies the template id and link policy; the skill enforces `UNSOURCED_CLAIM` handling exactly per the declared policy (`strict` = fail/strip; a looser mode must be explicitly configured and is never the silent default).

**Workflow:** (1) Validate template id resolves to a known `MarkdownTemplate`; (2) validate front matter against `FrontMatterSchema`; (3) render structural sections while attaching every factual claim to its `ClaimWithProvenance`; (4) run `LinkChecker` on all internal/external links; (5) if any claim lacks provenance, apply policy (strip and flag, or fail, per `strict`/non-strict); (6) if the task requests modifying an existing canonical document, verify a scope grant exists before touching content outside the declared section; (7) produce the change summary and unresolved-claim list alongside the Markdown output.

**Decision Rules:** 1. Under `strict` link policy, any `LINK_BROKEN` result fails the whole build, not just that link's paragraph. 2. An unsourced claim is never silently kept in the final output under any policy — it is either sourced, stripped-and-flagged, or the build fails; "leave it in and hope" is never a valid path. 3. A rewrite request without an explicit scope grant may only touch the specifically requested section; touching adjacent sections without a grant is a `SCOPE_VIOLATION` and fails the build.

**Examples:** *Compliant* — A request to update a single FAQ answer with a newly validated fact produces a diff touching only that answer's paragraph, cites the fact via `ClaimWithProvenance`, and leaves every other section byte-identical, confirmed against a golden fixture diff. *Violation* — While fixing one broken link, the builder also "cleans up" unrelated prose in a different section of a canonical document with no scope grant for that section — this is rejected as a `SCOPE_VIOLATION` even though the unrelated edit might have been objectively an improvement.

**Acceptance Criteria:** Output conforms to the declared template and front-matter schema; zero unsourced claims survive under `strict` policy; every internal link resolves; rewrites touch only granted scope; heading ids remain stable across revisions unless a heading's text itself changes.

**Failure Cases:** An unsourced claim ships to a Knowledge artifact undetected → Major, treat as a Markdown Builder Error Handling defect; strip the claim retroactively and re-review. A rewrite silently alters meaning in a fixture-tested "meaning-preserving" pass → Critical, this breaks the core faithfulness guarantee of the skill; halt use pending fix.

**Best Practices:** Maintain golden fixture pairs (before/after) for common rewrite patterns to continuously verify meaning-preservation. Keep heading ids derived deterministically from heading text so cross-document links remain stable across minor edits.

**Anti-patterns:** "Improving" prose beyond the requested scope during an otherwise narrow edit. Treating `strict` mode as optional once a deadline looms.

**References:** Citation Builder (§5.10), Markdown Agent contract, `/artifacts/knowledge.md`.

---

### 5.6 Knowledge Merge

| Field | Specification |
|-------|----------------|
| **Purpose** | Merge multiple knowledge candidates/deltas into a single coherent **candidate** SoR update, preserving provenance and surfacing unresolved conflicts — without silent overwrite. |
| **Input** | Base artifact/version; incoming deltas; merge strategy (`union`, `prefer_base`, `prefer_incoming`, `manual_markers`); conflict policy. |
| **Output** | Merged candidate; merge map (what came from where); residual conflicts; duplicate notes; requires_review flag (always true for SoR-bound merges). |
| **Dependencies** | Duplicate Detection; Conflict Detection; Knowledge Review Agent; Knowledge Approval before apply; Memory Update not used as bypass. |
| **Error Handling** | `BASE_NOT_FOUND`; `VERSION_CONFLICT`; `UNRESOLVED_CRITICAL_CONFLICT` (fail closed if policy=`strict`); `STRATEGY_INVALID`; never drop provenance to "make merge clean." |
| **Test Cases** | Non-overlapping sections union correctly; overlapping contradictory claims produce conflict markers; prefer_base/incoming honored; provenance retained per span; version mismatch fails; empty deltas no-op with explicit result. |
| **Reusable Components** | `KnowledgeDelta`, `MergeMap`, `ConflictMarker`, `ProvenanceSpan`, `VersionRef`, `ReviewRequiredFlag`. |

**Definitions:** *Merge map* — a structured record of exactly which output span came from which input (base or which delta), enabling full traceability of a merged candidate's provenance. *Manual markers* strategy — a merge mode that inserts explicit, human-visible conflict markers into the candidate rather than auto-resolving, used when neither `prefer_base` nor `prefer_incoming` is appropriate.

**Scope:** Applies to merging structured knowledge deltas into a single candidate. Always produces a candidate requiring downstream review — this skill never itself authorizes an SoR apply; that requires Knowledge Approval (§5.13) regardless of how clean the merge appears.

**Responsibilities:** The invoking agent supplies the base version and strategy; the skill enforces `VERSION_CONFLICT` if the declared base does not match the actual current head version, protecting against merging against stale state.

**Workflow:** (1) Resolve `base` by `VersionRef`; if not found, fail `BASE_NOT_FOUND`; (2) validate the base version matches what the caller believes is current head — mismatch is `VERSION_CONFLICT`; (3) for each `KnowledgeDelta`, determine overlap with base and with other deltas; (4) apply the declared `strategy` per span — union non-overlapping spans automatically, apply `prefer_base`/`prefer_incoming`/`manual_markers` to overlapping spans per policy; (5) run (or accept upstream results from) Duplicate Detection and Conflict Detection to annotate the candidate; (6) build the `MergeMap` recording provenance per span; (7) set `requires_review=true` unconditionally for any SoR-bound merge; (8) if `conflict_policy=strict` and any critical conflict remains unresolved, fail `UNRESOLVED_CRITICAL_CONFLICT` rather than emitting a candidate that looks resolved but isn't.

**Decision Rules:** 1. `requires_review` is never `false` for a merge whose output is intended for the Knowledge Plane — this flag is not a configurable convenience toggle. 2. An unresolved critical conflict under `strict` policy always fails the merge rather than picking a side silently. 3. Provenance is preserved per span even when a span is dropped by `prefer_base`/`prefer_incoming` — the dropped span's provenance is retained in the `MergeMap` as "considered but not selected," never simply discarded from the record.

**Examples:** *Compliant* — Two deltas correcting different, non-overlapping paragraphs of a knowledge document union cleanly, with the `MergeMap` showing exactly which paragraph came from which delta, and `requires_review=true` is set for the downstream Knowledge Review Agent. *Violation* — A merge is implemented to auto-resolve a direct factual contradiction between base and an incoming delta using `prefer_incoming` without flagging it as a conflict at all — this hides a real disagreement from human reviewers and must instead be surfaced via `ConflictMarker` even under a preference strategy, at minimum as an annotated resolution rather than a silent one.

**Acceptance Criteria:** Every output span traces to a source in the `MergeMap`; no critical conflict is silently resolved without an explicit, visible `ConflictMarker` or annotation; `requires_review` is always `true` for SoR-bound merges; version mismatches always fail rather than merging against assumed-stale state.

**Failure Cases:** A merge silently drops a delta's content with no trace in the `MergeMap` → Major, treat as a provenance-integrity defect; reprocess from source deltas. `requires_review` is found `false` on a merge that reached the Knowledge Plane → Critical, this indicates a Constitution Article XIII bypass; halt and investigate how the SoR apply proceeded without review.

**Best Practices:** Even when using `prefer_base`/`prefer_incoming`, always annotate what was overridden so a reviewer can see the road not taken. Keep `MergeMap` granular (per-span, not per-document) so partial review/rollback is possible later.

**Anti-patterns**: Treating a "clean" merge (no detected conflicts) as equivalent to "does not need review" — it still needs review, just a lighter one. Using a preference strategy to quietly paper over an actual, unexamined contradiction.

**References:** Duplicate Detection (§5.7), Conflict Detection (§5.8), Knowledge Approval (§5.13).

---

### 5.7 Duplicate Detection

| Field | Specification |
|-------|----------------|
| **Purpose** | Identify exact and near-duplicate knowledge units or evidence items to protect Single Source of Truth and reduce noise. |
| **Input** | Candidate set; corpus scope/ids; similarity profile (exact, lexical, embedding); thresholds; tenancy. |
| **Output** | Duplicate clusters; pairwise scores; recommended canonical id per cluster; false-positive risk flags. |
| **Dependencies** | Knowledge Plane read; optional Embedding Agent / embeddings index; Knowledge Review / Knowledge Merge consumers. |
| **Error Handling** | `SCOPE_EMPTY`; `PROFILE_UNKNOWN`; `INDEX_STALE` (warn or fail per policy); `TENANCY_VIOLATION` fail closed; do not auto-delete duplicates. |
| **Test Cases** | Exact hash/text duplicates clustered; near-duplicates above threshold clustered; below threshold not clustered; cross-tenant compare denied; stale index warning path; recommended canonical deterministic given ties broken by rule. |
| **Reusable Components** | `SimilarityProfile`, `DuplicateCluster`, `CanonicalPicker`, `TenancyScope`, `EmbeddingQuery` (capability), `LexicalFingerprint`. |

**Definitions:** *Similarity profile* — the specific method (`exact` hash match, `lexical` fingerprinting, or `embedding` vector similarity) and its threshold used to judge duplication; different profiles may cluster the same input set differently, and the profile used must always be reported alongside results. *False-positive risk flag* — an explicit signal that a clustering decision is close to the threshold boundary and warrants human attention before any consolidation action is taken.

**Scope:** Applies to identifying duplication; never performs deletion or consolidation itself — this skill only detects and recommends, per its Error Handling rule "do not auto-delete duplicates." Consolidation actions are a downstream human/Knowledge Merge concern.

**Responsibilities:** The invoking agent supplies `TenancyScope`; the skill must refuse (fail closed) any comparison that would cross tenant boundaries, even if the content happens to be superficially similar.

**Workflow:** (1) Validate candidate set/scope is non-empty; (2) validate the requested `SimilarityProfile` is recognized; (3) restrict all comparisons to within a single `TenancyScope`; (4) compute pairwise similarity per the profile; (5) cluster items exceeding threshold, applying `CanonicalPicker`'s deterministic tie-break rule (e.g., earliest creation timestamp, or highest provenance-strength score) when multiple items in a cluster could serve as canonical; (6) flag clusters near the threshold boundary as false-positive risk; (7) check embedding index freshness if using an `embedding` profile, warning or failing per policy on `INDEX_STALE`.

**Decision Rules:** 1. Cross-tenant comparison is always denied, never merely warned about — `TENANCY_VIOLATION` is a hard fail. 2. Canonical selection ties are always broken by the same deterministic rule for a given profile configuration, so re-running detection on unchanged input yields the same canonical pick every time. 3. A stale embedding index either warns (with the staleness explicitly reported) or fails, per policy — it never silently serves results as if the index were current.

**Examples:** *Compliant* — Running exact-hash detection across a corpus scope finds three byte-identical knowledge units, clusters them, and deterministically recommends the earliest-created one as canonical, explicitly reporting the tie-break rule used. *Violation* — A near-duplicate detection run compares content across two different tenants' workspaces because a scope filter defaulted to "all" instead of the caller's specific tenant — this must be rejected outright as `TENANCY_VIOLATION`, not merely logged as a warning.

**Acceptance Criteria:** No cross-tenant comparison ever occurs; every cluster has a deterministic, explained canonical recommendation; near-threshold clusters are flagged for human attention; stale-index runs are explicitly labeled as such.

**Failure Cases:** A cross-tenant comparison slips through due to a scope-resolution bug → Critical, this is a tenancy/privacy incident; halt the skill, audit for exposure, incident review per Constitution Article IX/X. An auto-consolidation script is found treating this skill's recommendation as authorization to delete → Critical, since this skill's output must never be treated as delete-authorization; retrain/fix the consuming automation immediately.

**Best Practices:** Always report the `SimilarityProfile` and threshold used alongside results so downstream reviewers understand exactly what "duplicate" means in this run. Keep false-positive risk flagging conservative — better to flag a borderline case for human review than to silently cluster it.

**Anti-patterns:** Treating a high similarity score as authorization for automatic deletion. Comparing across tenancy scopes "just to check" even without intending to act on the result.

**References:** `SimilarityProfile`/`TenancyScope` (§7), Knowledge Merge (§5.6), Knowledge Review Agent contract.

---

### 5.8 Conflict Detection

| Field | Specification |
|-------|----------------|
| **Purpose** | Detect contradictory claims across knowledge units or evidence so merges and reviews cannot silently encode inconsistency. |
| **Input** | Claim set or artifacts; ontology/claim schema; severity rubric; known exception list. |
| **Output** | Conflict graph/list; severity; involved claim ids; suggested resolution types (`needs_human`, `superseded_by`, `context_differs`); non-conflicts explicitly cleared when checked. |
| **Dependencies** | Knowledge Graph Agent (optional consistency queries); Knowledge Review; Knowledge Merge; Source Validation for trust tiers. |
| **Error Handling** | `CLAIM_SCHEMA_INVALID`; `INSUFFICIENT_STRUCTURE` (cannot detect — return `detection_incomplete`, not "no conflicts"); `RUBRIC_MISSING`; never auto-resolve critical conflicts. |
| **Test Cases** | Direct negation detected; compatible contextual variants not flagged; trust-tier asymmetry flagged for human; unstructured free text yields `detection_incomplete`; exception list suppresses known non-conflicts only. |
| **Reusable Components** | `Claim`, `ConflictRecord`, `SeverityRubric`, `ResolutionHint`, `DetectionCompleteness`, `TrustTierRef`. |

**Definitions:** *Detection completeness* — an explicit signal distinguishing "checked and found no conflicts" from "could not check thoroughly due to insufficient structure" — these are never conflated, since the latter must not be presented to a reviewer as a clean bill of health. *Trust-tier asymmetry* — a situation where two conflicting claims carry different `TrustTierRef` levels (e.g., one `community`-tier, one `primary`-tier), which the skill flags for human judgment rather than mechanically resolving by tier alone.

**Scope:** Applies to detecting contradiction across structured claims. Does not resolve conflicts itself beyond suggesting a `ResolutionHint` type — actual resolution is always a human or a downstream Knowledge Merge/Review decision, per the Error Handling rule "never auto-resolve critical conflicts."

**Responsibilities:** The invoking agent supplies the `SeverityRubric`; the skill must fail `RUBRIC_MISSING` rather than inventing its own severity heuristic when none is supplied.

**Workflow:** (1) Validate claims conform to the declared claim schema; if not, fail `CLAIM_SCHEMA_INVALID`; (2) if input is unstructured free text that cannot be decomposed into checkable claims, return `detection_incomplete` rather than a false "no conflicts" result; (3) for each claim pair within scope, evaluate direct negation, contextual compatibility, and trust-tier relationship; (4) apply the known exception list only to suppress previously human-reviewed, confirmed non-conflicts — never to suppress a novel case that merely resembles an exception; (5) assign severity per the rubric; (6) for trust-tier-asymmetric conflicts, always suggest `needs_human` regardless of tier direction; (7) explicitly mark cleared (checked, non-conflicting) pairs so reviewers can distinguish "verified compatible" from "not compared."

**Decision Rules:** 1. `detection_incomplete` is returned whenever claim structure is insufficient to compare — it is never coerced into a false "no conflicts found." 2. The exception list only suppresses exact, previously-reviewed matches; a novel claim pair that merely resembles an exception entry is still evaluated fresh. 3. A critical-severity conflict is never auto-resolved by this skill under any rubric configuration — the most it does is suggest a `ResolutionHint`.

**Examples:** *Compliant* — Two claims directly negating each other ("Feature X ships in v2" vs. "Feature X was cut before v2") are detected as a direct negation, assigned high severity per the rubric, and suggested `needs_human`, while a third claim stating the same fact in different phrasing is correctly cleared as compatible, not flagged. *Violation* — A conflict-detection run on largely unstructured prose notes is reported as "0 conflicts found," implying a clean bill of health, when the correct behavior was `detection_incomplete` because the input could not be meaningfully decomposed into comparable claims — this is a misleading-completeness failure.

**Acceptance Criteria:** Every claim pair is either explicitly cleared, flagged as a conflict with severity and a `ResolutionHint`, or marked as part of a `detection_incomplete` result — no claim pair is silently unaccounted for. No critical conflict is ever auto-resolved.

**Failure Cases:** A direct negation is missed due to a claim-schema normalization bug (e.g., different phrasing not recognized as the same claim subject) → Major, fix normalization, re-run detection across affected corpus. `detection_incomplete` cases are reported as "no conflicts" by a misconfigured caller → Major, correct the caller's interpretation logic and treat this as a completeness-signal defect requiring immediate documentation update.

**Best Practices:** Always report cleared pairs alongside conflicts, not just conflicts — this makes coverage auditable. Treat trust-tier asymmetry as inherently review-worthy, since even a technically correct higher-tier claim benefits from a human sanity check against a large volume of lower-tier disagreement.

**Anti-patterns:** Conflating "we didn't check" with "we checked and it's fine." Auto-resolving a conflict silently because "the rubric clearly favors one side" — the rubric informs severity, not final resolution authority.

**References:** `Claim`/`TrustTierRef` (§7), Knowledge Merge (§5.6), Source Validation Agent contract.

---

### 5.9 Summarization

| Field | Specification |
|-------|----------------|
| **Purpose** | Produce faithful, purpose-bound summaries of source material without adding unsupported facts. |
| **Input** | Source text/artifact refs; summary objective; length/format constraints; faithfulness policy; audience. |
| **Output** | Summary; source map (summary spans → source pointers); omitted-topics list; confidence/limitations. |
| **Dependencies** | Cloud AI Compute for heavy summarization; EgressGate; EvidenceItem / Knowledge Plane reads; used by research skills and Markdown Builder. |
| **Error Handling** | `SOURCE_EMPTY`; `EGRESS_DENY`; `CONTEXT_TOO_LARGE` (chunk strategy or fail); `FAITHFULNESS_FAIL` if unsupported sentences detected by checker; partial chunk summaries labeled. |
| **Test Cases** | Summary contains no entities absent from source (fixture); source map coverage; length constraints honored; egress deny; oversized input chunked with labels; objective "bullets only" format respected. |
| **Reusable Components** | `SummaryObjective`, `SourceMap`, `FaithfulnessChecker`, `Chunker`, `EgressGate`, `LimitationsBlock`. |

**Definitions:** *Faithfulness* — the property that every factual assertion in the summary is directly traceable to the source material via the `SourceMap`, with zero invented entities, numbers, or claims. *Purpose-bound* (in this skill's context) — the summary's scope and the data sent to the Cloud AI Compute Layer are both limited to exactly what the declared `SummaryObjective` requires, per Constitution Article XI.

**Scope:** Applies to producing summaries of any source text/artifact within DYOGAS. Does not apply to translation, paraphrase-for-style-only tasks, or generative content creation beyond faithful compression of existing source material.

**Responsibilities:** The invoking agent supplies the `SummaryObjective` and `EgressGate` token; the skill must scope its Cloud AI Compute payload to only the source material relevant to the objective, never the caller's full available context "just in case," per Constitution Article XI.

**Workflow:** (1) Validate source is non-empty; if empty, fail `SOURCE_EMPTY`; (2) validate `EgressGate` token is present and valid for the required Cloud AI Compute call, else `EGRESS_DENY`; (3) if source exceeds context limits, apply `Chunker` and process per-chunk, explicitly labeling any chunk-level partial summaries; if chunking is disallowed by policy, fail `CONTEXT_TOO_LARGE` instead; (4) generate the summary bound to `SummaryObjective`, length/format constraints, and audience; (5) run `FaithfulnessChecker` against the generated summary and source; on any unsupported sentence, either regenerate to remove it or fail `FAITHFULNESS_FAIL` per policy — never ship an unchecked summary; (6) build `SourceMap` covering every summary span; (7) list explicitly omitted topics and a `LimitationsBlock`.

**Decision Rules:** 1. `FaithfulnessChecker` failure always blocks output under strict faithfulness policy — a "mostly faithful" summary is not shippable. 2. Chunked summaries are always labeled as chunk-derived; a caller must not present a chunked-and-concatenated summary as if it were a single coherent pass without that label. 3. The Cloud AI Compute payload is scoped to the objective-relevant source only — sending unrelated context "to help the model" is a Constitution Article XI violation even if it might technically improve output quality.

**Examples:** *Compliant* — A summarization of a 40-page research report bound to the objective "extract only claims relevant to on-device inference latency" produces a summary whose every sentence maps to a specific page/paragraph in `SourceMap`, explicitly lists three unrelated chapters as omitted-by-objective, and passes `FaithfulnessChecker` with zero unsupported sentences. *Violation* — A summary includes a specific statistic that sounds plausible and source-adjacent but does not actually appear anywhere in the source material — this is a faithfulness failure and must be caught by `FaithfulnessChecker` before shipping; if it ships anyway, it is a Critical fabrication incident.

**Acceptance Criteria:** Every summary sentence maps to at least one `SourceMap` entry; no summary ships without passing `FaithfulnessChecker`; Cloud AI Compute payloads are scoped to declared objective; chunked outputs are labeled.

**Failure Cases:** A fabricated statistic ships in a "faithful" summary due to a `FaithfulnessChecker` false negative → Critical fabrication incident; halt skill use pending checker fix, retroactively flag and re-review any summaries produced during the affected window. An oversized source is summarized without chunk labeling, producing an incoherent blend presented as single-pass → Major, relabel and reprocess.

**Best Practices:** Keep `SummaryObjective` narrow and explicit — vague objectives make both generation and faithfulness-checking harder and noisier. Prefer failing `CONTEXT_TOO_LARGE` over silently truncating source material without disclosure.

**Anti-patterns:** Sending a caller's entire available corpus to Cloud AI Compute "for better context" when the objective only needs a narrow excerpt. Treating faithfulness checking as an optional quality pass rather than a mandatory gate.

**References:** `/CONSTITUTION.md` Article XI (Cloud AI Compute Layer), Markdown Builder (§5.5), Web/GitHub/YouTube/Reddit Research skills (§5.1–§5.4).

---

### 5.10 Citation Builder

| Field | Specification |
|-------|----------------|
| **Purpose** | Build structured, resolvable citations from validated sources for artifacts, proposals, and evidence packs. |
| **Input** | Accepted/validated source records; citation style profile; required fields policy; locale. |
| **Output** | Citation list; in-text keys/anchors; bibliography block (Markdown-ready); unresolved-field report. |
| **Dependencies** | Source Validation Agent outputs; Markdown Builder; Proposal Builder; rejects unvalidated sources unless style=`draft_unverified` explicitly set. |
| **Error Handling** | `SOURCE_NOT_VALIDATED`; `REQUIRED_FIELD_MISSING`; `STYLE_UNKNOWN`; `UNRESOLVABLE_POINTER`; never invent authors, dates, or DOIs. |
| **Test Cases** | Validated source → complete citation; missing author handled per style (placeholder vs fail); unvalidated source rejected in default mode; stable citation keys; Markdown bibliography renders required fields. |
| **Reusable Components** | `CitationStyleProfile`, `CitationRecord`, `InTextKey`, `BibliographyBlock`, `ValidatedSourceRef`. |

**Definitions:** *Validated source* — a source record that has passed through Source Validation Agent's process and carries a `ValidatedSourceRef`; distinct from a raw `EvidenceItem` that has not yet been validated. *Draft unverified* style — an explicit, non-default citation mode that permits citing not-yet-validated sources, clearly labeled as such, for early draft review purposes only.

**Scope:** Applies to building citations from already-validated sources by default. Does not perform source validation itself (that is Source Validation Agent's job) and does not fabricate any missing bibliographic field under any style.

**Responsibilities:** The invoking agent supplies the `CitationStyleProfile`; the skill enforces `SOURCE_NOT_VALIDATED` rejection by default, only permitting unvalidated sources when `style=draft_unverified` is explicitly and deliberately set — never as a fallback for convenience.

**Workflow:** (1) Validate the requested style is recognized, else `STYLE_UNKNOWN`; (2) for each source, confirm it carries a `ValidatedSourceRef` unless `draft_unverified` mode is active, else `SOURCE_NOT_VALIDATED`; (3) check required fields per style/locale; for a missing field, apply the style's declared handling (placeholder text vs. hard fail) — never silently invent the missing value; (4) generate a stable `InTextKey` per source, deterministic across repeated builds for the same source; (5) assemble the `BibliographyBlock` in Markdown-ready form; (6) report any `UNRESOLVABLE_POINTER` (a citation pointer that cannot be dereferenced back to its source) explicitly, never dropped silently.

**Decision Rules:** 1. An unvalidated source is rejected by default; `draft_unverified` is an explicit opt-in the caller must set, never inferred. 2. A missing required field is handled exactly per the style's declared policy — placeholder or fail — never invented as a plausible-looking value. 3. `InTextKey` generation is deterministic: rebuilding a bibliography for the same source set and style produces the same keys, so citations remain stable across document revisions.

**Examples:** *Compliant* — Ten validated sources are cited in a Proposal's evidence section, each with a deterministic key, a complete bibliography entry, and zero placeholder fields since all required metadata was present. *Violation* — A source is missing a publication date, and the citation builder invents a plausible-looking date "based on surrounding context" instead of using the style's declared missing-field policy (placeholder like "n.d." or a hard fail) — this is fabrication and a Critical violation regardless of how minor the invented field seems.

**Acceptance Criteria:** No citation exists for an unvalidated source outside `draft_unverified` mode; no missing field is ever filled with an invented value; every `InTextKey` is stable and unique within the bibliography; every citation resolves back to its source.

**Failure Cases:** A citation ships with a fabricated author name for a source with missing metadata → Critical fabrication incident; retract the citation, re-review the artifact it appeared in. `draft_unverified` mode is used as a silent default fallback when validation simply wasn't run yet → Major, this defeats the purpose of the default rejection; fix the caller to either validate first or explicitly and visibly opt into draft mode.

**Best Practices:** Make `draft_unverified` mode visually unmistakable in any rendered output (e.g., a clear "UNVERIFIED DRAFT SOURCE" marker) so it can never be mistaken for a fully validated citation. Keep citation key generation logic simple and documented so it is trivially reproducible for debugging.

**Anti-patterns:** Treating a plausible placeholder as "good enough" for a missing bibliographic field. Using `draft_unverified` mode routinely rather than as a deliberate, rare, clearly-labeled exception.

**References:** Source Validation Agent contract, Proposal Builder (§5.12), Markdown Builder (§5.5).

---

### 5.11 Knowledge Scoring

| Field | Specification |
|-------|----------------|
| **Purpose** | Score knowledge artifacts or evidence for quality and fitness-for-use (freshness, provenance strength, clarity, conflict status, duplication risk) — not popularity vanity. |
| **Input** | Target artifact/evidence; scoring rubric id; intended use context; optional peer corpus stats. |
| **Output** | Scorecard: dimension scores, composite, grade/tier, rationales, blocking flags (`unfit_for_sofr`, `needs_review`). |
| **Dependencies** | Duplicate Detection / Conflict Detection outputs when available; Source Validation trust tiers; Knowledge Review consumer. |
| **Error Handling** | `RUBRIC_MISSING`; `TARGET_NOT_FOUND`; `CONTEXT_UNSPECIFIED` when rubric requires use-context; do not score fabricated dimensions. |
| **Test Cases** | Same artifact+rubric → deterministic score; missing provenance lowers provenance dimension; open critical conflict sets blocking flag; unknown rubric fails; scorecard includes rationales for each dimension. |
| **Reusable Components** | `ScoringRubric`, `Scorecard`, `DimensionScore`, `BlockingFlag`, `UseContext`. |

**Definitions:** *Fitness-for-use* — a score reflecting whether an artifact is suitable for a specific intended use (e.g., "fit to cite in a customer-facing document" vs. "fit only for internal exploratory notes"), distinct from a context-free "quality" score with no stated purpose. *Blocking flag* — a scorecard signal (`unfit_for_sor`, `needs_review`) that a downstream consumer (e.g., Knowledge Merge, Knowledge Review) must treat as a hard stop, not merely a low number to note and proceed past.

**Scope:** Applies to scoring existing artifacts/evidence against a declared rubric and use context. Does not itself decide whether an artifact may enter the Knowledge Plane — it informs, but does not replace, Knowledge Review and Knowledge Approval.

**Responsibilities:** The invoking agent supplies the `ScoringRubric` id and, when the rubric requires it, a `UseContext`; the skill must fail `CONTEXT_UNSPECIFIED` rather than scoring against an assumed-default context when the rubric declares context-dependence.

**Workflow:** (1) Resolve the target artifact/evidence; if not found, fail `TARGET_NOT_FOUND`; (2) resolve the rubric id; if unknown, fail `RUBRIC_MISSING`; (3) if the rubric requires `UseContext` and none is supplied, fail `CONTEXT_UNSPECIFIED`; (4) compute each `DimensionScore` (freshness, provenance strength, clarity, conflict status, duplication risk, and any rubric-specific dimensions) using only real, derivable signals — pulling conflict/duplication signals from Conflict Detection/Duplicate Detection outputs when available rather than re-deriving them independently and possibly inconsistently; (5) compute the composite score and grade/tier per the rubric's declared aggregation; (6) set `unfit_for_sor` if any dimension crosses a rubric-declared hard floor (e.g., unresolved critical conflict); set `needs_review` for borderline cases; (7) attach a rationale per dimension.

**Decision Rules:** 1. Scoring never invents a dimension not defined in the rubric — "we also think it seems important" is not a valid scoring dimension absent rubric definition. 2. An open critical conflict (per Conflict Detection) always sets `unfit_for_sor`, regardless of how high other dimensions score — a composite score cannot "average away" a critical conflict. 3. Given the same artifact, rubric, and context, the score is deterministic — re-running scoring without any change to inputs must not produce a different result.

**Examples:** *Compliant* — A knowledge artifact with strong provenance and no detected conflicts scores highly across all dimensions for a "cite in customer-facing document" use context, with each `DimensionScore` accompanied by a specific rationale (e.g., "provenance: 3 independently validated primary sources"). *Violation* — An artifact with a known open critical conflict (per Conflict Detection) receives a high composite score because its other dimensions (freshness, clarity) are strong, and no `unfit_for_sor` flag is set — this is a scoring defect; the composite must never mask a hard-floor violation.

**Acceptance Criteria:** Every dimension score has a stated rationale; `unfit_for_sor` is set whenever a rubric-declared hard floor is crossed, regardless of composite score; scoring is deterministic for unchanged inputs; no dimension exists outside the declared rubric.

**Failure Cases:** `unfit_for_sor` fails to trigger despite an open critical conflict due to an aggregation bug that lets composite score overwhelm the hard floor check → Critical, fix aggregation logic immediately, re-score any artifacts scored during the affected window. Two identical scoring runs on unchanged input produce different composite scores due to a non-deterministic dimension calculation → Major, fix and add a determinism regression test.

**Best Practices:** Always compute hard-floor blocking flags *before* computing the composite score, and never let composite aggregation logic have the power to override a blocking flag. Keep rationales specific and inspectable rather than generic ("provenance: good") so reviewers can actually evaluate the scoring's own credibility.

**Anti-patterns:** Treating a high composite score as sufficient justification to skip Knowledge Review. Adding ad hoc "bonus" dimensions not defined in the rubric to nudge a favored artifact's score upward.

**References:** Conflict Detection (§5.8), Duplicate Detection (§5.7), Knowledge Review Agent contract.

---

### 5.12 Proposal Builder

| Field | Specification |
|-------|----------------|
| **Purpose** | Assemble decision-ready proposal artifacts from pain statement, validated evidence, and constraints — enforcing measurable success criteria and non-goals. |
| **Input** | Pain statement; validated evidence/citations; constraints; options hints; success metric requirements; non-goals; approval policy. |
| **Output** | Proposal document structure: options, trade-offs, recommendation (optional), risks, metrics, required approvals, citation anchors. |
| **Dependencies** | Citation Builder; Knowledge Scoring (optional gate); Proposal Agent; Markdown Builder for rendering; Constitution pain litmus. |
| **Error Handling** | `PAIN_MISSING`; `EVIDENCE_MISSING`; `METRICS_MISSING` (fail if required); `PRINCIPLE_VIOLATION`; `APPROVAL_PATH_MISSING` for consequential proposals. |
| **Test Cases** | Pain+evidence → proposal with ≥1 option and metrics; missing pain fails; principle violation fails; recommendation absent when evidence insufficient (no forced pick); citations resolve; non-goals present. |
| **Reusable Components** | `PainStatement`, `ProposalOption`, `TradeoffMatrix`, `SuccessMetric`, `ApprovalRequirement`, `NonGoalList`. |

**Definitions:** *Pain statement* — a structured description of who hurts, how, and how severely, required as the foundation of every proposal per Constitution Article XII. *Principle violation* — a proposal whose content, as assembled, contradicts one or more of the ten principles in `/docs/PRODUCT_PRINCIPLES.md` (e.g., implying permanent centralization of user knowledge), detected and blocked at build time rather than left for a human reviewer to catch unaided.

**Scope:** Applies to assembling the structured decision-ready document. Does not itself decide whether the proposal should be approved — that is the Human Approval Gate's job (`HARNESS_SPECIFICATION.md` §9) — but it does refuse to assemble a proposal that is structurally incomplete or that structurally violates a known principle.

**Responsibilities:** The invoking Proposal Agent supplies the pain statement and evidence; the skill enforces `PAIN_MISSING`/`EVIDENCE_MISSING`/`METRICS_MISSING` rather than assembling an incomplete proposal "to keep things moving."

**Workflow:** (1) Validate a `PainStatement` is present and non-empty, else `PAIN_MISSING`; (2) validate evidence/citations are present and, per Citation Builder rules, validated (or explicitly `draft_unverified`), else `EVIDENCE_MISSING`; (3) validate at least one `SuccessMetric` is present when the approval policy requires metrics, else `METRICS_MISSING`; (4) assemble one or more `ProposalOption`s with a `TradeoffMatrix`; a `recommendation` is optional and must be omitted, not forced, when evidence is insufficient to support confidently favoring one option; (5) require a non-empty `NonGoalList`; (6) run a principle-fit check against `/docs/PRODUCT_PRINCIPLES.md`'s ten principles and Prioritization Litmus; on any detected violation, fail `PRINCIPLE_VIOLATION` rather than assembling anyway with a warning; (7) set `ApprovalRequirement` (which Human Approval Gate(s) apply) — for any proposal that would authorize an SoR mutation, `APPROVAL_PATH_MISSING` is a hard fail if no approval path is resolvable.

**Decision Rules:** 1. A proposal without a stated pain never proceeds to assembly, regardless of how strong its evidence or options otherwise are. 2. A recommendation is only included when evidence genuinely supports confidently favoring an option — the skill must never force a pick to make the proposal feel more "decisive." 3. A detected principle violation always fails the build; it is never downgraded to a warning that a human might overlook.

**Examples:** *Compliant* — A proposal citing specific team friction (pain), three validated sources (evidence), two `ProposalOption`s with an honest trade-off matrix, no forced recommendation since evidence is genuinely mixed, a `SuccessMetric` tied to reduced review time, and an explicit `NonGoalList` — assembles successfully and routes to Human Review with `ApprovalRequirement` correctly set. *Violation*: A proposal is assembled with a vague pain statement like "would be nice to have" with no affected segment or metric — this must fail `PAIN_MISSING`/`METRICS_MISSING` rather than being assembled and left for a human reviewer to catch, per Constitution Article XII's requirement that the Proposal Builder itself enforce this.

**Acceptance Criteria:** Every assembled proposal has a non-empty pain statement, at least one validated evidence citation, required metrics when policy demands them, a non-empty non-goals list, and a resolvable approval path for any SoR-authorizing proposal. No proposal with a detected principle violation is assembled.

**Failure Cases:** A proposal without metrics is assembled and reaches Human Review because the metrics-required check was misconfigured as optional → Major, fix the check, recall the proposal for revision before continuing review. A recommendation is force-included despite genuinely insufficient evidence, biasing the human reviewer → Major, correct the proposal and add a regression test for "insufficient evidence → no forced recommendation."

**Best Practices:** Treat every Error Handling code in this skill's table as a mechanical enforcement of a specific Constitution Article XII/Product Principles requirement — trace each back explicitly so future amendments preserve that traceability. Keep the principle-fit check's failure messages specific enough that the proposing agent can actually fix the issue rather than just knowing "something's wrong."

**Anti-patterns:** Assembling a proposal now and "letting the human catch structural gaps" instead of failing closed at build time. Padding a thin evidence base with a confident-sounding recommendation to make the proposal feel more finished.

**References:** `/CONSTITUTION.md` Article XII, `/docs/PRODUCT_PRINCIPLES.md`, Citation Builder (§5.10), Knowledge Approval (§5.13), `/artifacts/proposal.md`.

---

### 5.13 Knowledge Approval

| Field | Specification |
|-------|----------------|
| **Purpose** | Enforce the human approval workflow for Knowledge Plane SoR mutations: package review state, collect verdicts, and only then authorize apply. |
| **Input** | Candidate delta/merge result; review checklist results; approver set/policy; timeout/escalation rules; artifact refs. |
| **Output** | Approval record: `pending` / `approved` / `rejected` / `expired` / `escalated`; approver identities; timestamps; conditions; apply-token only on `approved`. |
| **Dependencies** | Knowledge Review Agent; Trust & Control identity; Notification Agent for approval requests; Decision Log for material approvals; blocks Memory Update / graph/embed apply without token when policy requires. |
| **Error Handling** | `APPROVER_UNAUTHORIZED`; `CHECKLIST_INCOMPLETE`; `CONFLICT_UNRESOLVED`; `TIMEOUT_EXPIRED`; `DOUBLE_APPLY` prevented; never issue apply-token on reject/expire. |
| **Test Cases** | Incomplete checklist → no token; authorized approver approve → token; unauthorized approver rejected; timeout → expired + notify; reject clears token path; replay apply with spent token fails. |
| **Reusable Components** | `ApprovalRecord`, `ApplyToken`, `ApproverPolicy`, `ChecklistGate`, `EscalationRule`, `DecisionLogRef`. |

**Definitions:** *Apply token* — see `HARNESS_SPECIFICATION.md` §9.4/§9.5; this skill is the mechanism that issues and validates them. *Checklist gate* — the structured set of review items (schema validity, provenance completeness, conflict status, principle-fit) that must be fully addressed before an `approved` outcome can even be recorded, distinct from the approver's own subjective judgment on top of the checklist.

**Scope:** Applies specifically to the human-approval mechanics for Knowledge Plane SoR mutation proposals — this is the operational implementation of `HARNESS_SPECIFICATION.md` §9's Human Approval Gate for the knowledge-ingestion pipeline's Stage 4 and any equivalent gate elsewhere. It does not perform the review content itself (that is Knowledge Review Agent's job) — it packages, gates, and records the decision.

**Responsibilities:** The invoking agent (typically Knowledge Review Agent) supplies checklist results and the candidate; the skill enforces `CHECKLIST_INCOMPLETE` as a hard block on `approved`, and `APPROVER_UNAUTHORIZED` as a hard block regardless of how senior or well-intentioned an unauthorized approver is.

**Workflow:** (1) Validate the checklist is fully populated (`ChecklistGate`); an incomplete checklist blocks any `approved` recording attempt, returning `CHECKLIST_INCOMPLETE` rather than allowing a partial approval; (2) validate the approver's identity against `ApproverPolicy` — an unauthorized approver's decision is rejected with `APPROVER_UNAUTHORIZED`, and this rejection itself does not consume or affect the gate's open state; (3) if a critical conflict remains unresolved (per Conflict Detection/Knowledge Merge output) and policy requires resolution before approval, block with `CONFLICT_UNRESOLVED`; (4) record the outcome (`approved`/`rejected`/`request_changes`/`escalated`) with approver identity and timestamp; (5) on `approved`, issue exactly one `ApplyToken` bound to the candidate's exact `artifact_id@version`; (6) on `rejected` or `expired`, guarantee no `ApplyToken` is issued; (7) on token spend (by Memory Update, Graph, or Embedding apply steps), atomically mark it spent and reject any subsequent reuse attempt with `DOUBLE_APPLY` prevention; (8) log material approvals to the Decision Log via `DecisionLogRef`.

**Decision Rules:** 1. `CHECKLIST_INCOMPLETE` always blocks `approved`, with zero exceptions for urgency. 2. An unauthorized approver's attempted decision never advances the gate state — the gate remains open awaiting an authorized approver, and the unauthorized attempt is itself logged as a security-relevant event. 3. A spent `ApplyToken` can never be spent again — the second attempt always fails with `DOUBLE_APPLY`, and this is treated as a security-relevant event worth investigating even if it turns out to be a benign retry bug rather than malicious reuse.

**Examples:** *Compliant* — A Proposal candidate with a fully completed checklist is approved by an authorized approver named in `ApproverPolicy`; a single `ApplyToken` is issued bound to `Proposal@1.0.0`, later spent exactly once by the Markdown stage's downstream apply, and the approval is logged to the Decision Log with full context. *Violation* — An approver outside the `ApproverPolicy` set (e.g., a contractor without approval authority) submits an `approved` decision under time pressure; the skill must reject this with `APPROVER_UNAUTHORIZED` and keep the gate open, never treating the rejection itself as equivalent to a `rejected` outcome (which would incorrectly fail the whole pipeline run rather than simply waiting for a properly authorized approver).

**Acceptance Criteria:** No `approved` outcome exists with an incomplete checklist or an unauthorized approver. No `ApplyToken` is ever issued on `rejected`/`expired`. No `ApplyToken` is ever spent twice. Every material approval has a `DecisionLogRef`.

**Failure Cases:** An `ApplyToken` is found spent twice due to a race condition in the spend-marking logic → Critical, this is exactly the `DOUBLE_APPLY` scenario this skill exists to prevent; halt affected downstream applies, investigate for actual duplicate Knowledge Plane mutation damage, incident review. `APPROVER_UNAUTHORIZED` is not enforced because `ApproverPolicy` was misconfigured with an overly broad approver set → Major, tighten policy immediately, audit approvals made during the misconfigured window.

**Best Practices:** Make the checklist granular enough that "incomplete" is unambiguous — a checklist with vague items invites approvers to mark things complete without genuinely verifying them. Treat every `APPROVER_UNAUTHORIZED` and `DOUBLE_APPLY` event as worth a security review, even when the immediate cause looks benign.

**Anti-patterns:** Allowing a "temporary" broadened `ApproverPolicy` during an incident that never gets narrowed back afterward. Treating token spend-marking as a best-effort operation rather than an atomic, race-condition-safe one.

**References:** `HARNESS_SPECIFICATION.md` §9, `/CONSTITUTION.md` Article III, Knowledge Review Agent contract, `/artifacts/human-review-decision.md`.

---

### 5.14 Memory Update

| Field | Specification |
|-------|----------------|
| **Purpose** | Apply authorized memory transactions (`stage`, `persist`, `recall` prep, `forget`, `seal`) so durable memory remains local-first and non-duplicative of SoR. |
| **Input** | Memory op; payload/refs; tenancy/scope; retention policy; approval/apply token when persisting material knowledge-linked memory. |
| **Output** | Transaction result; resulting memory ids/metadata; forget confirmation; policy denial details. |
| **Dependencies** | Memory Agent; Knowledge Plane; Knowledge Approval when op persists SoR-linked material; Trust & Control audit; Notification on failure of critical forget/persist. |
| **Error Handling** | `POLICY_DENY`; `TOKEN_MISSING` / `TOKEN_INVALID`; `TENANCY_VIOLATION`; `FORGET_PARTIAL` (must report incomplete ids); `RETENTION_VIOLATION`; bypass attempts from other skills fail closed. |
| **Test Cases** | Persist without token denied when required; persist with valid token audited; forget removes declared ids and reports missing ids; cross-tenant recall denied; seal prevents further mutation; staging discarded at run end if not persisted. |
| **Reusable Components** | `MemoryOp`, `MemoryTransactionResult`, `RetentionPolicy`, `ApplyToken`, `TenancyScope`, `AuditEvent`. |

**Definitions:** *Stage* (memory op) — a transient, working-memory write scoped to the current run, discarded by default at `HARNESS_SPECIFICATION.md` §3.1's Release phase unless explicitly persisted. *Seal* (memory op) — an operation that marks a memory record as immutable going forward, preventing any further mutation, used once a memory's content is considered final. *Forget* — an operation that removes declared memory ids, honoring Constitution Article X's revocation requirement; must report any ids it could not fully remove rather than claiming complete success.

**Scope:** Applies to the lifecycle of durable and working memory records. Does not itself decide *what* should be remembered (that is upstream agent/skill logic) — it enforces *how* memory transactions are authorized, scoped, and audited, ensuring memory never becomes an unauthorized shadow SoR.

**Responsibilities:** The invoking agent supplies the `MemoryOp` and, for SoR-linked persist operations, an `ApplyToken`; the skill enforces `TOKEN_MISSING`/`TOKEN_INVALID` as a hard block whenever policy requires a token for the requested persistence.

**Workflow:** (1) Validate `MemoryOp` type and `TenancyScope`; a scope mismatch is `TENANCY_VIOLATION`, non-retryable; (2) for `persist` operations linked to knowledge-affecting material, validate an `ApplyToken` is present, unspent, and bound to the correct artifact — absent or invalid, fail `TOKEN_MISSING`/`TOKEN_INVALID`; (3) for `stage` operations, write to transient working memory only, with no SoR implications; (4) for `forget` operations, attempt removal of every declared id, and explicitly report any that could not be removed (`FORGET_PARTIAL`) rather than claiming full success; (5) for `seal` operations, mark the target immutable and reject any subsequent mutation attempt against it; (6) check every operation against `RetentionPolicy`, failing `RETENTION_VIOLATION` for anything that would exceed policy (e.g., persisting beyond an agreed retention window); (7) emit an `AuditEvent` for every transaction, success or denial; (8) at run end, discard any `stage`d (transient) memory that was never explicitly persisted, per `HARNESS_SPECIFICATION.md` §3.1's Release phase default.

**Decision Rules:** 1. Any attempt by another skill to bypass this skill's authorization path to write durable, SoR-linked memory directly fails closed — there is no alternate persistence route. 2. `forget` never reports success unless every declared id was actually confirmed removed; partial removal is always explicitly reported, never rounded up to "done." 3. A `seal`ed memory record rejects all further mutation attempts, including well-intentioned "just fixing a typo" edits — correcting sealed memory requires a new record, mirroring artifact immutability (`HARNESS_SPECIFICATION.md` §5).

**Examples:** *Compliant* — A `persist` operation for a knowledge-linked memory record presents a valid `ApplyToken` bound to the exact artifact it derives from; the transaction is authorized, audited, and the token is marked spent, consistent with Knowledge Approval's single-use guarantee. *Violation* — A `forget` operation is requested for five memory ids tied to a user's revocation request, but the backing store only successfully removes four due to a replication lag on the fifth; the skill must report `FORGET_PARTIAL` naming the fifth id explicitly, not report "forget complete" — reporting complete success here would be a Constitution Article X violation (revocation not actually honored) compounded by a false audit record.

**Acceptance Criteria:** No SoR-linked `persist` occurs without a valid, correctly-bound `ApplyToken` when policy requires one. Every `forget` operation's result explicitly accounts for every declared id, success or failure. Every `seal`ed record rejects further mutation. Transient `stage`d memory is confirmed absent after run Release unless explicitly persisted.

**Failure Cases:** A `persist` operation succeeds despite a missing token due to a validation-order bug → Critical, this is exactly the SoR-bypass scenario Constitution Article XIII/X exist to prevent; halt the skill, audit for unauthorized persisted memory, incident review. A `forget` operation reports full success while an id actually remains in a backup snapshot outside this skill's direct control → Major, disclose the limitation explicitly in the `MemoryTransactionResult`'s `RetentionPolicy` details rather than silently reporting success, and escalate to Trust & Control for a policy-level fix (e.g., backup retention alignment).

**Best Practices:** Always check token validity before any persistence side effect begins, never after, so a failed check never leaves a partial write behind. Make `FORGET_PARTIAL` reporting detailed enough (exact ids, exact reason) that a human can decide whether to retry, escalate, or accept a documented limitation.

**Anti-patterns:** Treating "eventually consistent removal" as equivalent to "removed now" in a `forget` confirmation. Allowing any skill or agent a "back door" persistence path that skips token validation for convenience.

**References:** `/CONSTITUTION.md` Article X, `HARNESS_SPECIFICATION.md` §3.1 (Release phase), §5 (Artifact Flow immutability), Knowledge Approval (§5.13), `/artifacts/memory-update.md`.

---

## 6. Cross-Skill Composition (Non-Implementing)

Illustrative pipeline only — Orchestration owns sequencing:

1. **YouTube / GitHub / Reddit / Web Research** → evidence items
2. **Duplicate Detection** (optional pack hygiene) → **Summarization** as needed
3. **Citation Builder** after validation
4. **Knowledge Scoring** / **Conflict Detection** inform review
5. **Proposal Builder** and/or **Markdown Builder**
6. **Knowledge Merge** → **Knowledge Approval**
7. **Memory Update** for authorized durable context

Skills do not freestyle alternate SoR write paths.

### 6.1 Decision Rules

1. The composition order above reflects typical usage, not a mandated fixed sequence — a pipeline spec (`/pipelines`) may invoke a subset of skills in an order suited to its stage topology, but it may never invoke Knowledge Merge or Memory Update's `persist` path without Knowledge Approval sitting between candidate assembly and SoR apply.
2. No pipeline may substitute a custom, uncatalogued step in place of a step in this composition without first cataloguing that step as its own skill or an amendment to an existing one.

### 6.2 Examples

- **Compliant**: The `knowledge-ingestion` pipeline (`/pipelines/knowledge-ingestion.md`) maps its eight stages onto this composition: Research (Stage 1) uses Web/GitHub/YouTube/Reddit Research; Validation (Stage 2) uses Conflict/Duplicate Detection and Source Validation; Proposal (Stage 3) uses Proposal Builder and Citation Builder; Human Review (Stage 4) uses Knowledge Approval; Markdown (Stage 5) uses Markdown Builder; Graph/Embedding (Stages 6–7) use their respective agents; Memory (Stage 8) uses Memory Update.

### 6.3 References

`/pipelines/knowledge-ingestion.md`, `HARNESS_SPECIFICATION.md` §2.4

---

## 7. Shared Reusable Component Registry

Logical components referenced above (single definitions; skills reuse — do not fork):

| Component | Role |
|-----------|------|
| `ResearchBrief` | Normalized research intent + budget + constraints |
| `EvidenceItem` | Candidate evidence with provenance |
| `ProvenancePointer` | Resolvable pointer to source locus |
| `BudgetGuard` | Hard stops for time/count/cost |
| `EgressGate` | Consent/policy check before external I/O |
| `SourceClassAdapter` | Per-source-class fetch/normalize boundary |
| `SafetyFilter` | Safety/NSFW/malware class blocks |
| `SignalTier` | Authority labeling (e.g. community vs primary) |
| `Claim` / `ClaimWithProvenance` | Atomic assertable unit |
| `ConflictRecord` / `ConflictMarker` | Explicit contradiction encoding |
| `SimilarityProfile` / `DuplicateCluster` | Dedupe configuration + results |
| `MarkdownTemplate` / `FrontMatterSchema` | Doc structure contracts |
| `CitationRecord` / `CitationStyleProfile` | Citation contracts |
| `ScoringRubric` / `Scorecard` | Quality fitness contracts |
| `PainStatement` / `ProposalOption` | Proposal contracts |
| `ApprovalRecord` / `ApplyToken` | Human approval gate |
| `KnowledgeDelta` / `MergeMap` / `VersionRef` | Merge contracts |
| `MemoryOp` / `RetentionPolicy` | Memory lifecycle contracts |
| `FaithfulnessChecker` / `Chunker` / `SourceMap` | Summarization integrity |
| `TenancyScope` / `AuditEvent` | Isolation and audit |

New components require a Decision Log entry and a version bump of this document.

### 7.1 Decision Rules

1. A skill needing a new shared data shape checks this registry first; if a close match exists, it extends that component's definition (via amendment) rather than defining a lookalike locally.
2. A component's definition, once in this registry, is shared verbatim across every skill that references it — no skill may locally redefine a registered component's shape.

### 7.2 Examples

- **Compliant**: Both Duplicate Detection and Knowledge Scoring reference the same `TenancyScope` definition, so a tenancy-enforcement fix in one skill's understanding of the concept is automatically consistent with the other's.
- **Violation**: A new skill defines its own "EvidencePointer" shape that is functionally identical to `ProvenancePointer` but named differently, causing downstream consumers to need special-case handling — this is a Constitution Article VI duplication and must be consolidated into `ProvenancePointer`.

### 7.3 Acceptance Criteria

- [ ] No two components in this registry are functionally redundant with each other.
- [ ] Every skill's declared Reusable Components list references only components that appear in this registry (or are pending an amendment adding them).

### 7.4 Failure Cases

- Two components with overlapping purpose (e.g., a duplicate `SourcePointer` alongside `ProvenancePointer`) are discovered in use across different skills → Major, consolidate under one name with a Decision Log entry.

### 7.5 Best Practices

- Review this registry whenever specifying a new skill, before drafting that skill's Reusable Components list.

### 7.6 Anti-patterns

- Defining a skill-local "shortcut" version of a registered component to avoid touching the shared definition.

---

## 8. Non-Goals

- Connector implementations, API keys, scrapers, or SDK code
- Prompt text or model vendor selection
- Mock product features presented as roadmap commitments
- Skills beyond this catalog (require Decision Log + amendment)

---

## 9. Amendment

Skill purpose, I/O, dependencies, error codes, tests, or reusable components change only via:

1. Version bump of this document
2. Decision Log entry
3. ADR if trust, egress, or SoR boundaries change
4. Human approval (Constitution Art. III)

### 9.1 Decision Rules

1. Adding a new skill, changing an existing skill's Purpose, or removing/renaming a Reusable Component is a MAJOR version bump.
2. Adding Definitions, Examples, Decision Rules, Failure Cases, Best Practices, or Anti-patterns to an existing skill without changing its Purpose/Input/Output/Dependencies/Error Handling/Test Cases/Reusable Components is a MINOR version bump.
3. Editorial fixes (typos, link repair) are PATCH version bumps and do not require an ADR or Decision Log entry, only a note in Version History.

---

## Global Acceptance Criteria (Repository-Wide, Skill Layer)

- [ ] Every skill in §5 has all seven shared-contract parts (§3.1–§3.6) plus the full expansion sections (Definitions, Scope, Responsibilities, Workflow, Decision Rules, Examples, Acceptance Criteria, Failure Cases, Best Practices, Anti-patterns, References).
- [ ] No skill's Test Cases table omits a happy path, a policy-denial case, a degenerate/empty-input case, or (where relevant) an adversarial case.
- [ ] No skill's Error Handling table permits fabrication under any error condition.
- [ ] Every Reusable Component referenced by any skill appears in the §7 registry.

## Global Failure Cases (Repository-Wide, Skill Layer)

- A skill implementation ships without covering one of its own catalogued Test Cases → Major, block release until covered.
- A skill is found writing to the Knowledge Plane SoR without passing through Knowledge Approval → Critical, per Constitution Article XIII; halt and incident review.

## Global Best Practices

- Treat every skill's Error Handling table as the primary defense against fabrication, tenancy violations, and unauthorized SoR writes — design it before implementation, not after.
- When two skills seem to need similar logic, check §7's registry and §6's composition model before writing new code.

## Global Anti-patterns

- Building a skill's implementation first and writing the specification to match afterward.
- Treating this catalog as aspirational documentation rather than binding, testable specification.

## References

- [`/CONSTITUTION.md`](../CONSTITUTION.md) — Articles II, VI, IX, X, XI, XII, XIII underpin nearly every rule in this document
- [`HARNESS_SPECIFICATION.md`](./HARNESS_SPECIFICATION.md) §15 — how skills relate to the Harness's execution law
- [`/contracts/README.md`](../contracts/README.md) — agents that declare which skills they may invoke
- [`/pipelines/knowledge-ingestion.md`](../pipelines/knowledge-ingestion.md) — the canonical composition of these skills end-to-end
- [`/artifacts/README.md`](../artifacts/README.md), [`/schemas/README.md`](../schemas/README.md) — artifact shapes these skills read and produce

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 1.1.0 | 2026-07-22 | Prior binding revision |
| 2.0.0 | 2026-07-22 | Completeness rewrite: every skill expanded with Definitions, Scope, Responsibilities, Workflow, Decision Rules, concrete Examples, Acceptance Criteria, Failure Cases, Best Practices, Anti-patterns, and References; global cross-cutting sections added; all prior Purpose/Input/Output/Dependencies/Error Handling/Test Cases/Reusable Components preserved unchanged |

**End of Skill Specification v2.0.0**
