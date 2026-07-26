# Contract: Markdown Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/markdown-agent.schema.json](../../schemas/agents/markdown-agent.schema.json)
**Artifact Schema:** [/schemas/artifacts/knowledge.schema.json](../../schemas/artifacts/knowledge.schema.json)
**Artifact Spec:** [/artifacts/knowledge.md](../../artifacts/knowledge.md)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Skills:** [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) §5.5 Markdown Builder
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 5 (Markdown)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field remains the literal string `"1.0.0"` per the schema bundle's `const` constraint until an ADR revises it. All JSON examples below use `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Markdown Agent is the first agent permitted to cross into producing a durable Knowledge Plane artifact — and it may only do so because a human has already approved the path via a valid, single-use `apply_token`. Its purpose is to render an approved `Proposal` into a schema-valid, claim-sourced `Knowledge` document without inventing a single fact along the way. It is the bridge between "decision made" and "durable record written."

## 2. Scope

### 2.1 In Scope

- Consuming an `approved` `HumanReviewDecision`, its bound `apply_token`, the source `Proposal`, and a `template_id`.
- Rendering Markdown `body` + `front_matter` conforming to the declared template.
- Producing `claim_provenance[]` mapping every asserted claim to citation keys traceable to the original accepted evidence.
- Refusing to render any claim that cannot be sourced under strict policy.

### 2.2 Out of Scope

- Deciding whether to approve — approval already happened at Stage 4; this agent only renders what was approved.
- Introducing new claims, options, or facts not present in the approved `Proposal`.
- Graph or embedding derivation (Stages 6–7).
- Reusing a token across more than one emission, or across a different proposal version than the one it is bound to.

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Apply Token** | Single-use, artifact-version-bound authorization minted only by the Human Approval Gate on `outcome: approved`. Presenting it here is the *only* way this agent may write Knowledge. |
| **Template** | A named, versioned Markdown structure (`template_id`) defining required sections, front-matter schema, and style rules. |
| **Front Matter** | Structured metadata block at the top of the rendered Markdown (title, tags, provenance summary, dates) — validated against the template's front-matter schema. |
| **Claim** | An atomic assertable statement in the rendered body. |
| **Claim Provenance** | The mapping from a `claim_id` to one or more `citation_keys`, and optionally a `span_hint` locating the claim in the body. |
| **Unsourced Claim** | A claim in the body with no corresponding `claim_provenance` entry — forbidden under strict policy, which is the default for this pipeline. |
| **Strict Policy** | The default posture: any claim lacking provenance is either stripped or blocks emission — it is never silently kept. |

## 4. Role

Author and normalize Markdown knowledge artifacts from approved proposals without inventing facts. The Markdown Agent renders; it does not decide, and it does not originate claims beyond what the approved `Proposal` already asserts.

## 5. Responsibilities

1. Validate the presented `apply_token` is genuinely bound to the `proposal_ref` and `approval_ref` given, has not expired, and has not already been consumed.
2. Resolve `template_id` to an active template; refuse to render against an unknown template.
3. Transform the `Proposal`'s pain statement, options, metrics, non-goals, risks, and citations into a structured Markdown document matching the template's section requirements.
4. Build `claim_provenance[]` such that every substantive claim in `body` maps to at least one `citation_key` drawn from the `Proposal`'s own `citations[]`.
5. Strip (or, if policy allows, explicitly flag) any claim that cannot be sourced — never silently keep an unsourced claim under strict policy.
6. Emit the `Knowledge` candidate only once, consuming the token in the process (idempotent re-delivery of the same `artifact_id@version` is a no-op per Harness §6 Rule 5 — it must not mint a second document from the same token).
7. Hand off the sealed `Knowledge` artifact to the Knowledge Graph Agent (Stage 6) only through the Harness.

## 6. Input Schema

Primary shape: the `input` object of [markdown-agent.schema.json](../../schemas/agents/markdown-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `approval_ref` | object `{artifact_id, artifact_version}` (both required) | yes | Must reference the sealed, `approved` `HumanReviewDecision`. |
| `proposal_ref` | object `{artifact_id, artifact_version}` (both required) | yes | Must reference the sealed `Proposal` the decision approved. |
| `apply_token` | string (minLength 1) | yes | Single-use token from the approval. |
| `template_id` | string | yes | Rendering template to apply. |

## 7. Output Schema

Primary shape: [knowledge.schema.json](../../schemas/artifacts/knowledge.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string (minLength 1) | yes | |
| `format` | `markdown` | yes | Only value currently permitted by the schema enum. |
| `body` | string | yes | The rendered Markdown document. |
| `front_matter` | object | yes | Structure per the declared template's front-matter schema. |
| `claim_provenance` | array of `{claim_id, citation_keys[], span_hint?}` | yes | May be empty only if `body` genuinely asserts zero sourced claims (rare; template-dependent). |
| `proposal_ref` | object `{artifact_id, artifact_version}` | yes | Echoes input. |
| `approval_ref` | object `{artifact_id, artifact_version, outcome: "approved"}` | yes | `outcome` must literally be `"approved"` — the schema enforces this with a `const`. |

`additionalProperties: false` — no undeclared top-level fields.

## 8. Accepted Artifact(s)

`HumanReviewDecision` with `outcome: approved` (sealed) and the sealed `Proposal` it approved.

## 9. Produced Artifact(s)

`Knowledge` — immutable once sealed. Consumed by the Knowledge Graph Agent, Embedding Agent, and Memory Agent (Stages 6–8), and by the Knowledge Plane apply mechanism.

## 10. Preconditions

1. `approval_ref` resolves to a sealed `HumanReviewDecision` with `outcome: approved`.
2. `apply_token` is valid: bound to `proposal_ref@artifact_version`, unexpired, and unconsumed.
3. `proposal_ref` resolves to the exact sealed `Proposal` the approval decision references.
4. `template_id` resolves to an active template with a defined front-matter schema.

## 11. Postconditions

1. `body` and `front_matter` validate against the template's structural and front-matter requirements.
2. Every substantive claim in `body` maps to a `claim_provenance` entry with ≥1 `citation_key`.
3. No claim absent from the source `Proposal` appears in `body` (no new facts introduced during rendering).
4. `approval_ref.outcome` is literally `"approved"`.
5. The `apply_token` is marked consumed by the Harness upon successful seal — it cannot be presented again for a second `Knowledge` emission.

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | `apply_token` cryptographically/records-matches the token minted for `approval_ref`+`proposal_ref`. | Pre-execution (Admit) |
| V2 | Token has not already been marked consumed (idempotent-accept semantics apply only to re-delivery of the *same sealed* `Knowledge` version, not to minting a second one). | Pre-execution |
| V3 | Token has not expired per the approval's validity window. | Pre-execution |
| V4 | `template_id` resolves and its front-matter schema is loadable. | Pre-execution |
| V5 | Every heading required by the template is present in `body`. | Post-execution |
| V6 | Every claim identified by the Markdown Builder's claim-extraction pass has a `claim_provenance` entry, or was stripped before emission under strict policy. | Post-execution |
| V7 | Every `claim_provenance[].citation_keys[]` entry exists in the source `Proposal.citations[]`. | Post-execution |
| V8 | Internal links within `body` resolve (no broken relative links to other Knowledge Plane documents) when `template_id` policy is `strict`. | Post-execution |
| V9 | `front_matter` contains no field the template does not declare (no undeclared metadata smuggled in). | Post-execution |
| V10 | Output `proposal_ref` and `approval_ref` exactly match the input references. | Post-execution |

## 13. Workflow

1. **Bind / Admit** — Harness resolves contract + schema; checks Preconditions (§10), including token validity.
2. **Load** — Agent reads the sealed `Proposal` and the `approved` `HumanReviewDecision`.
3. **Resolve template** — Load `template_id`'s structure and front-matter schema.
4. **Draft body** — Using the Markdown Builder skill, transform pain statement, options, trade-offs, metrics, non-goals, and risks into the template's required sections.
5. **Extract claims** — Identify every substantive, factual claim in the drafted body.
6. **Map provenance** — For each claim, attach the `citation_key`(s) from the source `Proposal.citations[]` that support it.
7. **Enforce strict policy** — Any claim without a mappable citation is stripped from `body` (or the run fails, per the template's configured policy — default is strip-and-flag, escalating to fail if stripping would gut the document's substance).
8. **Build front matter** — Populate title, tags, and provenance summary per the template's front-matter schema.
9. **Emit candidate** — Submit the `Knowledge` payload for Harness `Validate`, presenting the `apply_token` for consumption.
10. **Validate** — Harness checks schema validity, link integrity, Postconditions (§11), and the Review Gate.
11. **Emit / Complete** — On pass, Harness seals the `Knowledge` artifact, marks the token consumed, and hands off to the Knowledge Graph Agent. On fail, the token is **not** consumed and the invocation transitions `FAILED` per §19.

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| A claim in the draft body maps cleanly to a `Proposal` citation | Keep the claim; record `claim_provenance` entry | Standard sourced case |
| A claim cannot be mapped to any citation | Strip the claim from `body` under strict policy; note the strip in the emission's internal audit trail | Never publish an unsourced claim |
| Stripping unsourced claims would remove the document's core substance (e.g., >50% of body) | Fail closed with `UNSOURCED_CLAIM` rather than emit a hollowed-out document | A gutted document is not a useful Knowledge artifact and misrepresents the approved proposal |
| Template requires a section the `Proposal` has no content for (e.g., "Alternatives Considered" but Proposal had only one option) | Render the section with an explicit "No alternatives were evaluated" statement, not a fabricated alternative | Honesty over template conformance theater |
| `apply_token` matches but is already marked consumed | Fail closed with `TOKEN_INVALID`; do not re-render "just to be safe" | Prevents double-apply per Harness §9.3 Rule 3 |
| `approval_ref.outcome` is anything other than `approved` (defensive re-check) | Fail closed with `APPROVAL_EXPIRED`/`TOKEN_INVALID` class error | This agent must never render from a non-approved decision even if erroneously invoked |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture

```json
{
  "contract_version": "1.0.0",
  "input": {
    "approval_ref": { "artifact_id": "art_human-review-decision_0142", "artifact_version": "1.0.0" },
    "proposal_ref": { "artifact_id": "art_proposal_0142", "artifact_version": "1.0.0" },
    "apply_token": "tok_4f8a9c2e-approved-0142-single-use",
    "template_id": "template_engineering_knowledge_v2"
  },
  "output": {
    "title": "Knowledge Graph Sync: Content-Hash Checkpoints",
    "format": "markdown",
    "body": "# Knowledge Graph Sync: Content-Hash Checkpoints\n\n## Pain\n\nEngineers repeatedly re-derive an ad hoc, undocumented approach to syncing the knowledge graph after every Markdown edit, causing drift between graph and SoR.\n\n## Recommended Approach\n\nAdopt content-hash checkpoint sync: the Knowledge Graph Agent re-derives graph deltas keyed off the sealed Knowledge artifact's digest [cite_dgraph_sync].\n\n## Trade-offs\n\nRequires storing a checkpoint digest per node/edge; adds small graph-store overhead but eliminates silent drift [cite_dgraph_sync].\n\n## Success Metrics\n\n- Graph/SoR drift incidents drop from 2/quarter to 0/quarter within two quarters of adoption.\n\n## Non-Goals\n\n- Does not address embedding index staleness.\n",
    "front_matter": {
      "title": "Knowledge Graph Sync: Content-Hash Checkpoints",
      "tags": ["knowledge-graph", "sync", "engineering"],
      "proposal_id": "art_proposal_0142",
      "approved_at": "2026-07-22T09:40:00Z"
    },
    "claim_provenance": [
      { "claim_id": "claim_001", "citation_keys": ["cite_dgraph_sync"], "span_hint": "## Recommended Approach" },
      { "claim_id": "claim_002", "citation_keys": ["cite_dgraph_sync"], "span_hint": "## Trade-offs" }
    ],
    "proposal_ref": { "artifact_id": "art_proposal_0142", "artifact_version": "1.0.0" },
    "approval_ref": { "artifact_id": "art_human-review-decision_0142", "artifact_version": "1.0.0", "outcome": "approved" }
  }
}
```

## 16. Artifact Examples

Fully sealed `Knowledge` artifact as the Harness would store it:

```json
{
  "artifact_id": "art_knowledge_0142",
  "artifact_version": "1.0.0",
  "artifact_type": "Knowledge",
  "run_id": "run_2b7f1c9e-know-ingest-0142",
  "produced_by": "markdown-agent",
  "created_at": "2026-07-22T09:40:22Z",
  "digest": "sha256:4d5e6f708192a3b4c5d6e7f809102b3c4d5e6f708192a3b4c5d6e7f8091023c",
  "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" },
  "schema_version": "1.0.0",
  "payload": {
    "title": "Knowledge Graph Sync: Content-Hash Checkpoints",
    "format": "markdown",
    "body": "# Knowledge Graph Sync: Content-Hash Checkpoints\n\n## Pain\n\nEngineers repeatedly re-derive an ad hoc, undocumented approach...\n",
    "front_matter": { "title": "Knowledge Graph Sync: Content-Hash Checkpoints", "tags": ["knowledge-graph", "sync"] },
    "claim_provenance": [{ "claim_id": "claim_001", "citation_keys": ["cite_dgraph_sync"] }],
    "proposal_ref": { "artifact_id": "art_proposal_0142", "artifact_version": "1.0.0" },
    "approval_ref": { "artifact_id": "art_human-review-decision_0142", "artifact_version": "1.0.0", "outcome": "approved" }
  },
  "parents": [
    { "artifact_id": "art_proposal_0142", "artifact_version": "1.0.0", "artifact_type": "Proposal" },
    { "artifact_id": "art_human-review-decision_0142", "artifact_version": "1.0.0", "artifact_type": "HumanReviewDecision" }
  ]
}
```

The rendered Markdown document body, as it would appear once written into the Knowledge Plane:

```markdown
---
title: "Knowledge Graph Sync: Content-Hash Checkpoints"
tags: [knowledge-graph, sync, engineering]
proposal_id: art_proposal_0142
approved_at: 2026-07-22T09:40:00Z
---

# Knowledge Graph Sync: Content-Hash Checkpoints

## Pain

Engineers repeatedly re-derive an ad hoc, undocumented approach to syncing
the knowledge graph after every Markdown edit, causing drift between graph
and SoR.

## Recommended Approach

Adopt content-hash checkpoint sync: the Knowledge Graph Agent re-derives
graph deltas keyed off the sealed Knowledge artifact's digest [cite_dgraph_sync].

## Trade-offs

Requires storing a checkpoint digest per node/edge; adds small graph-store
overhead but eliminates silent drift [cite_dgraph_sync].

## Success Metrics

- Graph/SoR drift incidents drop from 2/quarter to 0/quarter within two
  quarters of adoption.

## Non-Goals

- Does not address embedding index staleness.
```

## 17. Examples (Scenarios)

**Scenario A — Clean render.** Every claim in the drafted body maps to a Proposal citation; document renders in full, all template sections present, token consumed, artifact sealed.

**Scenario B — Strip-and-flag.** The draft includes an incidental claim ("this pattern is also used by most large-scale knowledge platforms") that has no citation in the Proposal. Agent strips the sentence, keeps the rest of the document intact, and records the strip for audit — the sealed document simply does not contain that sentence.

**Scenario C — Token already consumed.** A retry mechanism outside the Harness attempts to re-render using the same `apply_token` after a successful first emission. Agent fails closed with `TOKEN_INVALID`; per Harness §6 Rule 5, only re-delivery of the *same already-sealed* `artifact_id@version` is a no-op success — minting a second document from a spent token is a double-apply attempt and is rejected.

**Scenario D — Template missing a required section's content.** Template requires an "Alternatives Considered" section but the approved Proposal had only one option. Agent renders: `"No alternative options were evaluated as part of this proposal."` — not a fabricated second option.

## 18. Acceptance Criteria

- [ ] Schema-valid against [knowledge.schema.json](../../schemas/artifacts/knowledge.schema.json).
- [ ] `apply_token` validated as bound, unexpired, and unconsumed before rendering.
- [ ] Every substantive claim in `body` has a `claim_provenance` entry with a citation traceable to the source `Proposal`.
- [ ] No claim beyond what the approved `Proposal` asserts.
- [ ] `approval_ref.outcome` is literally `"approved"`.
- [ ] Template structural requirements satisfied.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `TOKEN_INVALID` | Token missing, malformed, expired, already consumed, or not bound to the given `proposal_ref`/`approval_ref`. | Non-retryable |
| `TEMPLATE_MISSING` | `template_id` does not resolve. | Non-retryable |
| `UNSOURCED_CLAIM` | Stripping unsourced claims would gut the document's substance, or strict policy forbids any unsourced claim from ever reaching draft. | Non-retryable |
| `APPROVAL_EXPIRED` | `approval_ref` resolves but the approval's validity window has elapsed. | Non-retryable |
| `SCHEMA_INVALID` | Assembled output fails schema validation. | Non-retryable |
| `LINK_BROKEN` | An internal link in `body` does not resolve and `template_id` policy is `strict`. | Non-retryable |
| `TRANSIENT_COMPUTE_ERROR` | The Markdown Builder skill's phrasing pass (Cloud AI Compute) errors transiently. | Retryable (bounded) |

**Failure Cases (narrative):**

- If `approval_ref` and `proposal_ref` are individually valid but do not correspond to each other (a mismatched pair), the agent fails `TOKEN_INVALID` — a token is bound to a specific pair, not to either artifact independently.
- A template referencing a front-matter field type that does not match what the Proposal can supply (e.g., expecting a numeric `priority` field the Proposal never set) is a `TEMPLATE_MISSING`-class configuration defect; the agent does not invent a plausible-looking value to fill the gap.

## 20. Forbidden Behaviors

1. **Never render without a validated `apply_token`.**
2. **Never reuse a consumed token** to produce a second `Knowledge` artifact.
3. **Never introduce a claim, fact, statistic, or option** not present in the approved `Proposal`.
4. **Never silently keep an unsourced claim** under strict policy.
5. **Never fabricate a citation key** not present in the source `Proposal.citations[]`.
6. **Never rewrite or "improve" the pain statement, metrics, or non-goals** beyond faithful rendering — meaning-preserving transformation only.
7. **Never bypass the Harness to write directly to the Knowledge Plane** — sealing happens only through Harness `Emit`.
8. **Never mark `approval_ref.outcome` as `"approved"`** unless the input decision genuinely carries that outcome.

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Transient compute (`TRANSIENT_COMPUTE_ERROR`) | 2 | Exponential with jitter | Token is **not** consumed until a successful seal, so retries do not risk double-apply. |
| Token/template/unsourced/expired/schema/link (`TOKEN_INVALID`, `TEMPLATE_MISSING`, `UNSOURCED_CLAIM`, `APPROVAL_EXPIRED`, `SCHEMA_INVALID`, `LINK_BROKEN`) | 0 | n/a | Fail closed immediately; token remains unconsumed. |

## 22. Retry Examples

**Example 1 — Transient phrasing-pass failure recovered.** Attempt 1's Cloud AI Compute phrasing call for the body draft times out mid-render. Because the token had not yet been consumed (consumption happens only at successful seal), Harness retries attempt 2 after backoff; attempt 2 completes the render and the token is consumed exactly once at seal time. Total attempts: 2 of 2.

**Example 2 — No retry on unsourced claim gut-check.** Attempt 1's draft, after stripping unsourced sentences, leaves a document that is 90% empty relative to the template's required sections. This is `UNSOURCED_CLAIM`; ceiling is 0. The invocation fails immediately; the token remains unconsumed and available for a corrected re-invocation once the underlying `Proposal` is revised (a new invocation, not a retry of this one).

**Example 3 — Repeated template misconfiguration quarantined.** Three separate runs against different proposals all fail identically with `TEMPLATE_MISSING` because `template_id: "template_v1_deprecated"` was retired without updating the pipeline's default configuration. Per Harness §7 Rule 5, this is quarantined for human correction of the configuration rather than repeatedly failing new runs against the same broken template reference.

## 23. Error Recovery Procedures

1. **On `TRANSIENT_COMPUTE_ERROR`:** Retry per §21; token remains unconsumed throughout; on exhaustion, `FAILED` + Notification Agent alert.
2. **On `TOKEN_INVALID`:** Fail closed; no retry. If the cause is a genuinely expired approval, the run must return to Stage 4 for a fresh Human Approval Gate pass — the Proposal itself may still be valid, but a new decision/token is required.
3. **On `UNSOURCED_CLAIM`:** Fail closed; the underlying `Proposal` likely needs revision (more citations, or trimmed claims) before Stage 5 can succeed — escalate back toward Stage 3, not a blind retry of Stage 5.
4. **On `LINK_BROKEN`:** Fail closed under strict policy; report the specific broken link so the template or the linked target can be fixed. Under non-strict policy configurations (if ever adopted via ADR), broken links would be reported rather than blocking — but this contract's default is strict.
5. **On `APPROVAL_EXPIRED`:** Fail closed; the Proposal must be re-submitted through Stage 4 for a fresh approval and token; the expired decision cannot be revived.

## 24. Best Practices

- Preserve the Proposal's own wording wherever faithful rendering allows — paraphrase risk is provenance risk.
- Prefer explicit "not evaluated" statements over omitting a template-required section outright.
- Keep `claim_provenance[].span_hint` populated — it materially speeds up future audits and Knowledge Review passes on subsequent versions.
- Treat every strip-for-lack-of-citation event as a signal to improve, not just a rendering footnote — if stripping is frequent, the upstream Proposal Agent's citation discipline likely needs attention.

## 25. Anti-patterns

- **Confidence inflation in prose:** phrasing a Proposal's tentative trade-off as a definitive fact during rendering.
- **Template theater:** filling a required section with generic boilerplate instead of an honest "not applicable" statement.
- **Token hoarding:** attempting to hold a validated token across multiple candidate drafts "just in case" instead of consuming it exactly once at successful seal.
- **Silent link tolerance:** treating a broken internal link as a cosmetic issue under strict policy instead of a blocking defect.

## 26. Success Metrics

- **Template conformance rate** — % of emissions passing structural checks on first attempt.
- **Broken-link rate** — target: 0 under strict policy.
- **Review churn from formatting** — how often Stage 4 sends a proposal back specifically due to rendering issues (should be rare since rendering happens after approval).
- **Time-to-seal** — Admit to sealed `Knowledge`.

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Articles III, IV, X
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §5 Artifact Flow, §6 Handoff Rules, §9 Human Approval Gates
- [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) — §5.5 Markdown Builder
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 5
- [/artifacts/knowledge.md](../../artifacts/knowledge.md)
- [/contracts/agents/knowledge-review-agent.md](./knowledge-review-agent.md) — upstream gate contract
- [/contracts/agents/knowledge-graph-agent.md](./knowledge-graph-agent.md) — downstream consumer contract

**End of Contract: Markdown Agent v2.0.0**
