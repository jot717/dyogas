# DYOGAS Product Principles

**Version:** 2.0.0
**Status:** Canonical
**Effective:** 2026-07-22
**Owner:** Product
**Supersedes:** Product Principles v1.1.0 (completeness expansion; no principle changes)
**Related:** [`PRODUCT_VISION.md`](./PRODUCT_VISION.md), [`/CONSTITUTION.md`](../CONSTITUTION.md), [`ROADMAP.md`](./ROADMAP.md)

---

## Purpose

Principles for discovery, prioritization, and UX. Violations do not ship. Where `PRODUCT_VISION.md` answers "why DYOGAS exists," this document answers "how do we decide what to build next, and what does 'good' look like once we build it." Every Proposal artifact and every roadmap-phase feature is checked against the ten principles and the Prioritization Litmus below before it may proceed to Human Review.

## Definitions

| Term | Definition |
|------|------------|
| **Principle violation** | A feature, UX pattern, or proposal that contradicts one of the ten principles below in substance, regardless of how it is worded. |
| **Litmus question** | One of the five yes/no questions in the Prioritization Litmus; a single "no" is sufficient to stop prioritization. |
| **Vanity metric** | A measurement that looks impressive but does not correlate with real user value delivered (e.g., raw signups vs. completed, trusted jobs). |
| **Principle fit** | The degree to which a proposal actively expresses these principles, not merely avoids violating them. |

## Scope

Applies to every product discovery activity, every Proposal artifact, every UX decision, and every roadmap-phase feature evaluation. Does not apply to purely internal engineering tooling with no user-facing or knowledge-affecting surface (though such tooling still falls under `CONSTITUTION.md` and `/engineering`).

## Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Product Owner** | Applies the Prioritization Litmus to every candidate proposal before it advances; rejects on the first "no." |
| **Proposal Agent / Proposal Builder skill** | Encodes the pain-evidence and metrics requirements these principles imply (Constitution Art. XII); must not produce a proposal that passes schema validation but fails principle review. |
| **Designers / UX owners** | Apply "Trust Visible" and "Ownership Is Sacred" to every consent, sync, and approval surface. |
| **Any Contributor** | Runs the Litmus mentally before investing significant effort in a direction, not just at formal review time. |

---

## Principles

1. **Pain Before Platform** — Verified pain, metrics, non-goals required.
2. **Ownership Is Sacred** — Customer-controlled knowledge by default.
3. **Local Truth, Cloud Muscle** — Never imply DYOGAS owns the corpus.
4. **Trust Visible** — Consent, egress, and approvals are understandable.
5. **Fewer, Sharper Capabilities** — Depth before sprawl.
6. **Agents Under Contract** — Collaborators via Harness — not silent autopilot.
7. **Artifacts Over Chat** — User-visible outcomes are provenance-bearing deliverables.
8. **Measure Real Work Done** — Completed jobs and trusted retention over vanity.
9. **Enterprise-Grade From Day One** — Audit and least privilege designed in.
10. **Say No by Default** — Principle fit beats roadmap pressure.

### Per-Principle Detail

| # | Principle | What compliance looks like | What violation looks like |
|---|-----------|------------------------------|------------------------------|
| 1 | Pain Before Platform | A Proposal cites a specific hurting segment, a metric, and explicit non-goals | A Proposal justified by "this would be a cool platform capability" |
| 2 | Ownership Is Sacred | Default storage/consent design keeps the customer in control, revocably | A feature centralizes knowledge by default with an opt-out buried in settings |
| 3 | Local Truth, Cloud Muscle | Copy and UX never imply DYOGAS is the owner of the user's corpus | Marketing language like "your knowledge, stored with us" without ownership caveats |
| 4 | Trust Visible | A user can see what leaves their device, when, and why, and can revoke it | A sync/consent flow that is technically disclosed but practically incomprehensible |
| 5 | Fewer, Sharper Capabilities | A small number of capabilities done deeply, matched to cataloged skills/contracts | A sprawl of half-finished, overlapping capabilities that duplicate cataloged skills (Constitution Art. VI) |
| 6 | Agents Under Contract | Every agent action traces to a contract and a Harness-recorded invocation | An agent silently makes a consequential decision with no contract or audit trail |
| 7 | Artifacts Over Chat | Outcomes are structured, provenance-bearing artifacts a user or reviewer can inspect | The only record of what happened is an ephemeral chat transcript |
| 8 | Measure Real Work Done | Success metrics track completed, trusted pipeline runs and retained usage | Success metrics track vanity numbers like raw impressions or signups |
| 9 | Enterprise-Grade From Day One | Least privilege and audit trail exist from the first version of a feature | "We'll add security/audit later once we validate the idea" |
| 10 | Say No by Default | A feature with unclear principle fit is rejected until fit is demonstrated | A feature ships because "we already built it" despite unclear fit |

---

## Prioritization Litmus

1. Real evidenced pain?
2. Preserves local-first ownership?
3. Respects cloud compute minimization?
4. Expressible as contract + artifact + pipeline stage without duplicates?
5. Still worth building if a competitor shipped a flashier demo?

Any "no" → do not prioritize.

---

## Workflow — Running the Litmus

1. **Gather the candidate proposal** (or feature idea) with its stated pain, evidence, and intended user segment.
2. **Ask each Litmus question in order**; stop at the first "no" and record why — do not skip ahead hoping a later "yes" compensates.
3. **If all five are "yes,"** proceed to full Proposal Builder assembly (pain statement, options, tradeoffs, success metrics, non-goals, citations) per Constitution Article XII and `/harness/SKILL_SPECIFICATION.md` §5.12.
4. **If the Litmus passes but a specific Principle above is still borderline**, escalate to Product Owner for an explicit principle-fit judgment call, recorded in the Decision Log.
5. **Re-run the Litmus** if the proposal's scope materially changes between drafts — passing the Litmus once does not grandfather a since-expanded scope.

## Decision Rules

1. A single "no" on the Litmus is dispositive — it is not averaged against four "yes" answers.
2. "Would ship faster" or "competitor has it" are not valid overrides for a Litmus "no."
3. Principle 10 ("Say No by Default") means the default disposition for any ambiguous proposal is rejection, not conditional approval pending more information — gather the information first, then decide.
4. A proposal that duplicates an existing cataloged skill/contract/pipeline fails Litmus question 4 regardless of how well-evidenced its pain is; the correct path is to extend the existing capability (Constitution Art. VI).

## Examples

- **Compliant**: A proposal for "org-level knowledge sharing with per-document revocation" cites specific team friction (evidenced pain), keeps the org as the storage owner (local-first), scopes any AI processing to the shared documents only (cloud minimization), maps cleanly onto the existing Knowledge Approval + Memory Update skills (no duplication), and would still matter even without a flashy demo (durable utility) — passes all five.
- **Violation**: A proposal for "auto-summarize everything a user has ever written, always-on, stored centrally for fast access" fails Litmus question 2 (not local-first by default) and question 3 (unbounded cloud compute) — rejected before further evaluation.

## Acceptance Criteria

- [ ] Every accepted Proposal artifact has a recorded Litmus evaluation (even informally, in the Decision Log or proposal notes).
- [ ] No accepted feature violates any of the ten principles in its shipped form.
- [ ] Success metrics for shipped features are traceable to Principle 8 (real work / retention), not vanity counts.

## Failure Cases

- A feature ships whose only success metric is "signups in week 1" with no completed-job or retention signal → Major, redefine metrics before continuing investment (Principle 8).
- A UX flow discloses data egress in a EULA-style wall of text with no plain-language summary → Major, redesign per Principle 4 before shipping.
- Two overlapping features are found solving the same pain with different implementations → Major, consolidate per Principle 5 / Constitution Article VI.

## Best Practices

- Write the Litmus answers down even for small features — it creates a cheap, reusable trail for later disputes about "why did we build this."
- Prefer expanding an existing capability's depth (Principle 5) over adding a new, narrower one that overlaps it.
- Design the "what leaves your device" disclosure before designing the feature's core interaction, not after (Principle 4).

## Anti-patterns

- Running the Litmus only for large features and skipping it for "small" ones that quietly accumulate into scope creep.
- Treating "Say No by Default" as a formality that gets overridden whenever a senior stakeholder is enthusiastic.
- Justifying vanity metrics as "leading indicators" without a demonstrated correlation to real work done.

---

## References

- [`PRODUCT_VISION.md`](./PRODUCT_VISION.md) — the vision these principles operationalize
- [`/CONSTITUTION.md`](../CONSTITUTION.md) — Articles X, XI, XII, XIII underpin Principles 2, 3, 6, 7
- [`/harness/SKILL_SPECIFICATION.md`](../harness/SKILL_SPECIFICATION.md) §5.12 — Proposal Builder, which encodes Principle 1 mechanically
- [`ROADMAP.md`](./ROADMAP.md) — where prioritized proposals enter phase sequencing

---

## Versioning

Changes require Decision Log + human approval and a version bump. Adding Definitions, Examples, or Decision Rules without changing the ten principles or the Litmus bumps MINOR; changing any principle or Litmus question bumps MAJOR.

**End of Product Principles v2.0.0**
