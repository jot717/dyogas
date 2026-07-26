# Contract: Proposal Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/proposal-agent.schema.json](../../schemas/agents/proposal-agent.schema.json)
**Artifact Schema:** [/schemas/artifacts/proposal.schema.json](../../schemas/artifacts/proposal.schema.json)
**Artifact Spec:** [/artifacts/proposal.md](../../artifacts/proposal.md)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Skills:** [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) §5.10 Citation Builder, §5.12 Proposal Builder
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 3 (Proposal)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field remains the literal string `"1.0.0"` per the schema bundle's `const` constraint until an ADR revises it. All JSON examples below use `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Proposal Agent converts validated evidence into a **decision-ready proposal**: a set of options addressing a stated pain, each with trade-offs, grounded exclusively in accepted sources, carrying measurable success metrics and explicit non-goals. It exists to enforce Constitution Article XII (Every Feature Must Solve a Real Pain Point) mechanically — a proposal without a real pain statement, without evidence, or without success metrics simply cannot be emitted.

It is the last fully-automated stage before a human must decide. Everything the Proposal Agent produces is *prepared for* human approval — never self-approved.

## 2. Scope

### 2.1 In Scope

- Consuming a sealed `ValidationReport` plus a `pain_statement` and optional `constraints`.
- Building ≥1 option, each with a summary and trade-offs, grounded only in `accepted` (or explicitly rubric-permitted `needs_human`-pending) evidence.
- Declaring measurable `success_metrics`, explicit `non_goals`, and citations resolving only to accepted sources.
- Setting `requires_human_approval` correctly for any proposal that would authorize a Knowledge Plane / SoR-affecting path downstream.
- Surfacing `risks` where material.

### 2.2 Out of Scope

- Re-validating or re-scoring sources — it trusts (and is bound by) the `ValidationReport` verdicts as given.
- Approving itself, minting an `apply_token`, or bypassing Human Review.
- Producing Markdown or any rendered knowledge artifact (Stage 5's job).
- Learning-agent lesson proposals with a different evidentiary basis (see [learning-agent.md](./learning-agent.md)); this contract governs `kind: knowledge` and `kind: other` proposals produced from the canonical pipeline.

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Pain Statement** | A concrete description of who hurts, how, and why — the mandatory litmus per Constitution Article XII. |
| **Option** | One candidate course of action: `option_id`, `summary`, `tradeoffs`, optional `recommended` flag. |
| **Non-goal** | An explicit statement of what this proposal does *not* attempt to solve, preventing scope creep at Human Review. |
| **Success Metric** | A measurable criterion by which the proposal's eventual outcome can be judged — not a vague aspiration. |
| **Citation** | A `citation_key` bound to an `evidence_id` (and optional `pointer`) that must trace to an `accepted` entry in the input `ValidationReport`. |
| **`requires_human_approval`** | Boolean flag; when the proposal's adoption would trigger any downstream SoR/Knowledge Plane mutation (which is always true for this pipeline's canonical path), it must be `true`. |
| **Recommendation** | The optional `recommended: true` marker on an option — never mandatory; the agent must not force a pick when evidence is insufficient to prefer one option. |

## 4. Role

Convert validated evidence into decision-ready proposals that address a stated pain, with measurable success criteria, explicit non-goals, and citations to accepted sources only. The Proposal Agent never self-approves SoR writes and never issues an `apply_token`.

## 5. Responsibilities

1. Confirm the input `ValidationReport` reference resolves to a sealed artifact and contains at least one `accepted` result (or an explicit, policy-sanctioned empty-evidence path).
2. Require a non-empty `pain_statement` before doing any option-building work — this is a hard gate, not a formatting nicety.
3. Build ≥1 `options[]` entries, each with real trade-offs (not "no downsides") and grounded only in accepted evidence.
4. Attach `success_metrics[]` that are measurable (quantifiable or unambiguously verifiable), never vague ("improve quality").
5. Attach `non_goals[]` that name what is deliberately out of scope.
6. Build `citations[]` exclusively from `accepted` (or rubric-sanctioned `needs_human` disclosed as such) evidence ids in the `ValidationReport` — never a `rejected` id, never a fabricated one.
7. Set `requires_human_approval: true` whenever the proposal, if adopted, would authorize a Markdown/Graph/Embedding/Memory write in the canonical pipeline (this is the default for `kind: knowledge`).
8. Refuse to force a `recommended: true` option when the evidence does not support a clear preference — absence of a recommendation is a valid, honest output.
9. Hand off the sealed `Proposal` to the Knowledge Review Agent / Human Approval Gate (Stage 4) only through the Harness.

## 6. Input Schema

Primary shape: the `input` object of [proposal-agent.schema.json](../../schemas/agents/proposal-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `validation_report_ref` | object `{artifact_id, artifact_version}` (both required) | yes | Must reference a sealed `ValidationReport`. |
| `pain_statement` | string (minLength 1) | yes | Non-empty; the Article XII litmus. |
| `constraints` | object | no | Free-form (budget, timeline, principle constraints). |

## 7. Output Schema

Primary shape: [proposal.schema.json](../../schemas/artifacts/proposal.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `kind` | `knowledge`\|`lesson`\|`other` | yes | This contract governs `knowledge`/`other`; Learning Agent governs `lesson`. |
| `pain_statement` | string (minLength 1) | yes | Echoed/refined from input, never dropped. |
| `options` | array, minItems 1 | yes | |
| `options[].option_id` | string | yes | |
| `options[].summary` | string | yes | |
| `options[].tradeoffs` | string | yes | |
| `options[].recommended` | boolean | no | Omit or `false` when evidence does not support a pick. |
| `success_metrics` | array of string, minItems 1 | yes | Must be measurable. |
| `non_goals` | array of string | yes | May be empty only when genuinely none apply — rare. |
| `citations` | array of `{citation_key, evidence_id (required), pointer?}` | yes | May be empty **only** under an explicit empty-evidence policy path. |
| `requires_human_approval` | boolean | yes | |
| `validation_report_ref` | object `{artifact_id, artifact_version}` | yes | Echoes input. |
| `risks` | array of string | no | |

`additionalProperties: false` throughout — no undeclared fields such as an ad hoc `notes` or self-assigned `approved` flag.

## 8. Accepted Artifact(s)

`ValidationReport` (sealed), and by reference the accepted sources it points to.

## 9. Produced Artifact(s)

`Proposal` — immutable once sealed. Consumed by the Knowledge Review Agent and the Human Approval Gate (Stage 4), and by the Markdown Agent once approved (Stage 5).

## 10. Preconditions

1. `validation_report_ref` resolves to a sealed `ValidationReport`.
2. At least one `results[]` entry in that report is `accepted`, **or** an explicit empty-evidence policy path is configured for this proposal kind (rare; must be declared in `constraints`).
3. `pain_statement` is present and non-empty.
4. An approval path (Human Approval Gate) is reachable for this run — the Proposal Agent does not run if there is no way to ever reach Stage 4.

## 11. Postconditions

1. Every option has trade-offs; "no trade-offs" is not an acceptable trade-offs value — it signals insufficient analysis.
2. `success_metrics` are measurable statements, not aspirational language.
3. `non_goals` are present and specific.
4. Every `citations[].evidence_id` corresponds to an `accepted` entry in the input `ValidationReport` — never `rejected`, and never an id absent from that report.
5. Constitution/principle violations (Article XII pain litmus, Article X ownership, Article IX security) are absent from the proposal text.
6. `requires_human_approval` is `true` for any proposal whose adoption would authorize downstream SoR mutation.

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | `validation_report_ref` resolves and its digest (if tracked) matches the sealed artifact. | Pre-execution |
| V2 | `pain_statement` length > 0 and is not a placeholder (`"TBD"`, `"N/A"`). | Pre-execution |
| V3 | `options` has ≥1 entry; every entry has non-empty `summary` and `tradeoffs`. | Post-execution |
| V4 | At most one option has `recommended: true`, unless `constraints` explicitly declares a multi-recommend policy. | Post-execution |
| V5 | Every `citations[].evidence_id` exists in the input `ValidationReport.results[]` with `status: accepted`. | Post-execution |
| V6 | No `citations[].evidence_id` maps to a `rejected` result. | Post-execution |
| V7 | `success_metrics` are non-empty and phrased with a verifiable criterion (contains a comparator, threshold, or explicit target where feasible). | Post-execution |
| V8 | `requires_human_approval` is `true` whenever `kind: knowledge`. | Post-execution |
| V9 | `non_goals` is non-empty unless `constraints.allow_empty_non_goals: true` is explicitly set and justified. | Post-execution |
| V10 | Output `validation_report_ref` byte-for-byte matches the input reference. | Post-execution |

## 13. Workflow

1. **Bind / Admit** — Harness resolves contract + schema; checks Preconditions (§10).
2. **Load** — Agent reads the sealed `ValidationReport` and filters to `accepted` results (treating `needs_human` items as not-yet-usable unless `constraints` explicitly allow disclosed provisional use).
3. **Frame the pain** — Confirm/refine `pain_statement`: who hurts, how, why now.
4. **Generate options** — Build ≥1 real options grounded in the accepted evidence set; each option must have genuine trade-offs, not a strawman.
5. **Attach citations** — Every claim backing an option maps to a `citation_key` bound to an accepted `evidence_id` via the Citation Builder skill.
6. **Define success metrics** — Derive measurable, falsifiable metrics tied to the pain statement.
7. **Define non-goals** — Explicitly bound the proposal's scope.
8. **Assess principle fit** — Check the proposal against Constitution Articles IX, X, XII; abort with `PRINCIPLE_VIOLATION` if it fails.
9. **Set approval flag** — Determine `requires_human_approval` based on downstream SoR impact (canonical pipeline: always `true`).
10. **Emit candidate** — Submit `Proposal` payload for Harness `Validate`.
11. **Validate / Emit / Complete** — Harness checks Postconditions (§11) and Review Gate; seals or fails per §19.

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| Evidence set has exactly one clearly superior option | Emit one option with `recommended: true` and remaining alternatives (if any) unmarked | Honest signal when evidence supports a pick |
| Evidence set has multiple defensible options with no clear winner | Emit all options with none marked `recommended` | Forcing a pick without evidence support is a fabricated confidence signal |
| `ValidationReport` has zero `accepted` items and only `needs_human`/`rejected` | Fail closed with `EVIDENCE_MISSING`, do not emit a "placeholder" proposal | A proposal with no usable evidence is not decision-ready |
| A citation's `evidence_id` is `needs_human` in the ValidationReport | Exclude it from `citations[]`, or include only under an explicit disclosed-provisional path documented in `risks` | Never cite unresolved evidence as if it were settled |
| Pain statement describes a hypothetical/speculative pain with no user evidence | Fail closed with `PAIN_MISSING`-class violation (`PRINCIPLE_VIOLATION`) | Article XII forbids speculative platforms without pain evidence |
| Proposal would, if approved, cause an immediate SoR write | `requires_human_approval: true` | Canonical rule — no exceptions in this pipeline |
| `success_metrics` cannot be made measurable given available evidence | Fail closed with `METRICS_MISSING` rather than emit vague metrics | Vague metrics defeat the purpose of Acceptance Criteria downstream |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture

```json
{
  "contract_version": "1.0.0",
  "input": {
    "validation_report_ref": {
      "artifact_id": "art_validation-report_0142",
      "artifact_version": "1.0.0"
    },
    "pain_statement": "Engineers repeatedly re-derive an ad hoc, undocumented approach to syncing the knowledge graph after every Markdown edit, causing drift between graph and SoR and at least two production incidents in the last quarter.",
    "constraints": { "max_options": 3, "timeline": "next_sprint" }
  },
  "output": {
    "kind": "knowledge",
    "pain_statement": "Engineers repeatedly re-derive an ad hoc, undocumented approach to syncing the knowledge graph after every Markdown edit, causing drift between graph and SoR and at least two production incidents in the last quarter.",
    "options": [
      {
        "option_id": "opt_content_hash_checkpoint",
        "summary": "Adopt content-hash checkpoint sync: the Knowledge Graph Agent re-derives graph deltas keyed off the sealed Knowledge artifact's digest, matching the pattern documented in Dgraph's sync design notes.",
        "tradeoffs": "Requires storing a checkpoint digest per node/edge; adds a small amount of graph-store overhead but eliminates silent drift.",
        "recommended": true
      },
      {
        "option_id": "opt_full_rebuild",
        "summary": "Rebuild the entire graph from all sealed Knowledge artifacts on every Markdown change.",
        "tradeoffs": "Simplest to reason about; does not scale as the Knowledge corpus grows, and increases Embedding/Graph stage latency proportionally to corpus size.",
        "recommended": false
      }
    ],
    "success_metrics": [
      "Graph/SoR drift incidents drop from 2/quarter to 0/quarter within two quarters of adoption",
      "Knowledge Graph Agent's consistency_report.ok rate reaches 100% across all GraphUpdate emissions for one full quarter"
    ],
    "non_goals": [
      "This proposal does not address embedding index staleness, which is tracked separately under the Embedding Agent contract",
      "This proposal does not change the Markdown Agent's authoring workflow"
    ],
    "citations": [
      { "citation_key": "cite_dgraph_sync", "evidence_id": "ev_0001", "pointer": "https://github.com/dgraph-io/dgraph/blob/main/docs/design/sync.md" },
      { "citation_key": "cite_local_first", "evidence_id": "ev_0002", "pointer": "https://www.inkandswitch.com/local-first/" }
    ],
    "requires_human_approval": true,
    "validation_report_ref": { "artifact_id": "art_validation-report_0142", "artifact_version": "1.0.0" },
    "risks": [
      "Checkpoint digest scheme requires a one-time migration of existing graph nodes lacking a checkpoint field"
    ]
  }
}
```

## 16. Artifact Examples

Fully sealed `Proposal`:

```json
{
  "artifact_id": "art_proposal_0142",
  "artifact_version": "1.0.0",
  "artifact_type": "Proposal",
  "run_id": "run_2b7f1c9e-know-ingest-0142",
  "produced_by": "proposal-agent",
  "created_at": "2026-07-22T09:31:47Z",
  "digest": "sha256:2b3c4d5e6f708192a3b4c5d6e7f809102b3c4d5e6f708192a3b4c5d6e7f8091",
  "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" },
  "schema_version": "1.0.0",
  "payload": {
    "kind": "knowledge",
    "pain_statement": "Engineers repeatedly re-derive an ad hoc, undocumented approach to syncing the knowledge graph after every Markdown edit, causing drift between graph and SoR and at least two production incidents in the last quarter.",
    "options": [
      { "option_id": "opt_content_hash_checkpoint", "summary": "Adopt content-hash checkpoint sync.", "tradeoffs": "Adds checkpoint storage overhead; eliminates drift.", "recommended": true }
    ],
    "success_metrics": ["Graph/SoR drift incidents drop to 0/quarter within two quarters"],
    "non_goals": ["Does not address embedding index staleness"],
    "citations": [{ "citation_key": "cite_dgraph_sync", "evidence_id": "ev_0001" }],
    "requires_human_approval": true,
    "validation_report_ref": { "artifact_id": "art_validation-report_0142", "artifact_version": "1.0.0" },
    "risks": ["Requires one-time migration of existing graph nodes"]
  },
  "parents": [
    { "artifact_id": "art_validation-report_0142", "artifact_version": "1.0.0", "artifact_type": "ValidationReport" }
  ]
}
```

## 17. Examples (Scenarios)

**Scenario A — Clear recommendation.** Evidence strongly favors one approach; agent emits 2 options, one `recommended: true`, both cited, metrics measurable. Proposal proceeds to Human Review.

**Scenario B — No clear winner.** Evidence supports two roughly equal approaches with genuinely different trade-off profiles (cost vs. latency). Agent emits both options with neither `recommended`, leaving the pick explicitly to the human approver — this is correct behavior, not an incomplete proposal.

**Scenario C — Insufficient evidence.** `ValidationReport` has 4 items, all `rejected` or `needs_human`, zero `accepted`. Agent fails closed with `EVIDENCE_MISSING` rather than emit a proposal built on unusable evidence.

**Scenario D — Speculative pain.** `pain_statement` describes a feature nobody has asked for ("users might someday want X"). Agent fails closed with `PRINCIPLE_VIOLATION` per Constitution Article XII, since no verified pain evidence exists in the brief or evidence set.

## 18. Acceptance Criteria

- [ ] Schema-valid against [proposal.schema.json](../../schemas/artifacts/proposal.schema.json).
- [ ] ≥1 option, each with real trade-offs.
- [ ] ≥1 measurable success metric.
- [ ] Non-goals present (or explicitly, narrowly waived).
- [ ] Every citation resolves to an `accepted` source in the input `ValidationReport`.
- [ ] `requires_human_approval` correctly set.
- [ ] No Constitution/principle violation present.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `PAIN_MISSING` | `pain_statement` absent, empty, or placeholder. | Non-retryable |
| `EVIDENCE_MISSING` | No `accepted` evidence available and no sanctioned empty-evidence path. | Non-retryable |
| `METRICS_MISSING` | Cannot produce ≥1 measurable success metric. | Non-retryable |
| `PRINCIPLE_VIOLATION` | Proposal fails the Article XII pain litmus, or another Constitutional principle. | Non-retryable |
| `FABRICATED_CITATION` | A citation references an `evidence_id` not present or not `accepted` in the input report. | Non-retryable, escalate |
| `APPROVAL_PATH_MISSING` | No reachable Human Approval Gate exists for this run. | Non-retryable |
| `TRANSIENT_COMPUTE_ERROR` | Option/metric drafting compute call times out transiently. | Retryable (bounded) |

**Failure Cases (narrative):**

- A proposal drafted against a `ValidationReport` whose only accepted item has `trust_tier: untrusted`-adjacent low confidence should either be built with disclosed risk in `risks[]`, or, if the rubric-governed threshold disallows building on it at all, fail with `EVIDENCE_MISSING`. The agent does not silently treat low-trust accepted evidence as high-trust.
- If `constraints.max_options` is set lower than the number of genuinely distinct viable options, the agent must select the most representative subset and note the omission in `risks[]`, not silently truncate without disclosure.

## 20. Forbidden Behaviors

1. **Never cite a `rejected` or absent evidence id.**
2. **Never force a `recommended: true`** when evidence does not support a clear preference.
3. **Never fabricate a success metric** that cannot actually be measured against real data.
4. **Never set `requires_human_approval: false`** for a proposal whose adoption would mutate the Knowledge Plane.
5. **Never mint or reference an `apply_token`** — that field does not exist on this agent's output and must never be smuggled into `constraints` or free text.
6. **Never build a proposal around a purely speculative pain** with no evidentiary or user basis.
7. **Never silently drop `non_goals`** to make the proposal look more ambitious.
8. **Never re-score or override the upstream `ValidationReport`'s verdicts** — trust them as given, or fail closed if they are insufficient.

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Transient compute (`TRANSIENT_COMPUTE_ERROR`) | 2 | Exponential with jitter | |
| Principle/citation/pain/metrics/approval-path (`PAIN_MISSING`, `EVIDENCE_MISSING`, `METRICS_MISSING`, `PRINCIPLE_VIOLATION`, `FABRICATED_CITATION`, `APPROVAL_PATH_MISSING`) | 0 | n/a | Fail closed immediately. |

## 22. Retry Examples

**Example 1 — Transient recovery.** Attempt 1's metric-drafting compute call errors with a transient 503. Harness retries attempt 2 after 1.5s backoff; attempt 2 succeeds, producing 2 measurable metrics. Total attempts: 2 of 2 allowed — this was the last available retry; a third failure would move the stage to `FAILED`.

**Example 2 — No retry on fabricated citation.** Attempt 1 assembles a citation pointing to `evidence_id: "ev_0099"`, which does not exist in the input `ValidationReport`. This is `FABRICATED_CITATION`; ceiling is 0; the invocation fails immediately and is escalated, since a citation integrity defect suggests a bug in the citation-assembly logic that a retry cannot fix.

**Example 3 — Evidence-missing across multiple runs.** A caller resubmits the same `validation_report_ref` three times expecting different results after `EVIDENCE_MISSING`. Because the underlying `ValidationReport` has not changed (still zero `accepted` items), each run fails identically. Per Harness §7 Rule 5, this is a candidate for quarantine — the correct remediation is to return to Stage 1/2 with a broader research brief or revised rubric, not to keep retrying Stage 3.

## 23. Error Recovery Procedures

1. **On `TRANSIENT_COMPUTE_ERROR`:** Retry per §21; on exhaustion, `FAILED` + Notification Agent alert.
2. **On `EVIDENCE_MISSING`:** Fail closed; recommend (via Notification/incident path) that the run restart from Stage 1 with a broadened brief, or Stage 2 with a revised rubric — not a blind Stage 3 retry.
3. **On `PRINCIPLE_VIOLATION`:** Fail closed; no retry; the pain statement or proposal framing must be materially revised by a human before resubmission, since this is a judgment failure, not a transient one.
4. **On `FABRICATED_CITATION`:** Fail closed and escalate as a defect — this should never occur under correct citation-building logic; treat as an incident, not routine failure.
5. **On `APPROVAL_PATH_MISSING`:** Fail closed; this indicates a Harness/pipeline configuration gap (no reachable Human Approval Gate), not an agent-level fix — escalate to pipeline operators.

## 24. Best Practices

- Write trade-offs that a skeptical human reviewer would find credible — real downsides, not strawmen.
- Prefer measurable, falsifiable metrics over "improve X" language; state comparator, target, and timeframe where possible.
- Disclose uncertainty in `risks[]` rather than omitting it to make the proposal look cleaner.
- Keep `non_goals` specific enough to prevent scope creep during Human Review discussion.

## 25. Anti-patterns

- **Forced consensus:** always marking exactly one option `recommended: true` regardless of whether evidence actually supports a preference.
- **Metric theater:** metrics that sound quantitative but cannot actually be measured with available instrumentation.
- **Citation laundering:** citing a `needs_human` item as if it were `accepted`.
- **Approval flag gaming:** setting `requires_human_approval: false` to skip friction, when the proposal genuinely authorizes SoR mutation downstream.

## 26. Success Metrics

- **Acceptance/revision rate** at Human Review — proxy for proposal quality.
- **% of proposals with genuinely measurable metrics** (human-audited sample).
- **Principle litmus pass rate** — % passing Article XII check on first pass.
- **Downstream outcome hit rate** — % of approved proposals whose stated success metrics were later verified as achieved.

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Articles III, IX, X, XII
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §9 Human Approval Gates
- [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) — §5.10 Citation Builder, §5.12 Proposal Builder
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 3
- [/artifacts/proposal.md](../../artifacts/proposal.md)
- [/contracts/agents/source-validation-agent.md](./source-validation-agent.md) — upstream producer contract
- [/contracts/agents/knowledge-review-agent.md](./knowledge-review-agent.md) — downstream consumer contract
- [/contracts/agents/learning-agent.md](./learning-agent.md) — sibling producer for `kind: lesson`

**End of Contract: Proposal Agent v2.0.0**
