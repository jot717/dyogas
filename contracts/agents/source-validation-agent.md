# Contract: Source Validation Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/source-validation-agent.schema.json](../../schemas/agents/source-validation-agent.schema.json)
**Artifact Schema:** [/schemas/artifacts/validation-report.schema.json](../../schemas/artifacts/validation-report.schema.json)
**Artifact Spec:** [/artifacts/validation-report.md](../../artifacts/validation-report.md)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 2 (Validation)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field remains the literal string `"1.0.0"` per the schema bundle's `const` constraint until an ADR revises it. All JSON examples below use `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Source Validation Agent is the pipeline's credibility gate. It exists to separate "material was found" (Research Agent's job) from "material may be trusted" (this agent's job) — a distinction the Constitution's fail-closed posture depends on. Its purpose is to turn a `ResearchReport` into a `ValidationReport` in which every single piece of candidate evidence carries an explicit, rationale-backed status and trust tier, so that no unvetted claim can silently flow into a Proposal.

It removes the pain of humans manually re-checking every source for credibility, recency, and safety before a proposal can be trusted — while refusing to let automation quietly launder low-quality evidence into high-confidence "facts."

## 2. Scope

### 2.1 In Scope

- Consuming exactly one sealed `ResearchReport` and a resolved validation rubric.
- Assigning every evidence item a status (`accepted` | `rejected` | `needs_human`) and a `trust_tier` (`high` | `medium` | `low` | `untrusted`).
- Recording a rationale for every non-`accepted` status and, ideally, for `accepted` too.
- Flagging safety, staleness, conflict, or authority risks via `risk_flags`.
- Escalating high-impact ambiguity to `needs_human` rather than guessing.

### 2.2 Out of Scope

- Collecting new evidence (that is Stage 1's job; this agent never invokes Research skills directly).
- Producing options, recommendations, or a pain-statement response (Stage 3's job).
- Approving or rejecting a Proposal or authorizing any SoR mutation (Stage 4's job).
- Merging, deduplicating, or rewriting evidence content — validation judges fitness, it does not transform text.

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Validation Rubric** | A named, versioned scoring/judgment standard (`rubric_id`) the agent applies uniformly across all evidence items in a report. |
| **Status** | The per-item verdict: `accepted` (usable downstream), `rejected` (not usable, with rationale), `needs_human` (ambiguous, escalated). |
| **Trust Tier** | Independent credibility rating on the accepted-or-not axis: `high`, `medium`, `low`, `untrusted`. An item can be `accepted` with `trust_tier: low` if the rubric allows low-confidence-but-usable material with disclosure. |
| **Risk Flag** | A short machine-readable tag surfacing a specific concern (e.g., `stale`, `conflicting_claim`, `unverified_author`, `paywalled_excerpt`) attached to a result. |
| **High-impact ambiguity** | A case where the cost of a wrong accept/reject decision is asymmetric or significant (e.g., safety-relevant, contradicts an existing high-trust knowledge unit, or would gate a consequential proposal) — must route to `needs_human`, never a coin-flip accept. |
| **Full Coverage** | Every `evidence_id` present in the input `ResearchReport` has exactly one corresponding entry in `results[]` — no silent drops. |

## 4. Role

Judge the credibility, provenance fitness, and safety of every candidate source in a sealed `ResearchReport` against a declared rubric, and emit a `ValidationReport` with full per-item coverage. This agent separates acceptance from recommendation: it never proposes what to do with accepted evidence.

## 5. Responsibilities

1. Verify the input `ResearchReport` reference (`artifact_id`, `artifact_version`, `digest`) matches the actually-sealed upstream artifact before reading it.
2. Resolve the `rubric_id` to an active rubric; refuse to run with an unresolved or unknown rubric.
3. Evaluate **every** `evidence_id` from the input report — zero silent omissions.
4. Assign `status`, `rationale`, and `trust_tier` per item; attach `risk_flags` where applicable.
5. Escalate items to `needs_human` rather than force an accept/reject when the rubric cannot resolve the case confidently.
6. Never promote a `rejected` item to `accepted` in a later pass without a new rubric run producing a new `ValidationReport` version.
7. Hand off the sealed `ValidationReport` to the Proposal Agent (Stage 3) only through the Harness.

## 6. Input Schema

Primary shape: the `input` object of [source-validation-agent.schema.json](../../schemas/agents/source-validation-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `research_report_ref` | object `{artifact_id, artifact_version, digest}` (all required) | yes | Must reference a sealed `ResearchReport`. |
| `rubric_id` | string | yes | Identifier of the validation rubric to apply. |

## 7. Output Schema

Primary shape: [validation-report.schema.json](../../schemas/artifacts/validation-report.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `research_report_ref` | object `{artifact_id, artifact_version, digest}` | yes | Echoes the validated input reference exactly. |
| `rubric_id` | string | yes | Echoes the rubric applied. |
| `results` | array, minItems 1 | yes | One entry per evidence item in the input report. |
| `results[].evidence_id` | string | yes | Must match an id present in the input report. |
| `results[].status` | `accepted`\|`rejected`\|`needs_human` | yes | |
| `results[].rationale` | string | yes | Required for every entry, regardless of status. |
| `results[].trust_tier` | `high`\|`medium`\|`low`\|`untrusted` | yes | |
| `results[].risk_flags` | array of string | no | |

`additionalProperties: false` at both the report and result level — no undeclared fields.

## 8. Accepted Artifact(s)

`ResearchReport` (sealed) — the sole accepted primary artifact for this stage.

## 9. Produced Artifact(s)

`ValidationReport` — immutable once sealed. Consumed exclusively by the Proposal Agent (Stage 3).

## 10. Preconditions

1. `research_report_ref.digest` matches the actually-sealed `ResearchReport`'s digest — a mismatch means stale or tampered input and blocks admission.
2. `rubric_id` resolves to a known, active rubric.
3. Tenancy of the input artifact matches the invocation's tenancy context.
4. The input report validates against its own schema (defense in depth — the agent does not trust an unvalidated upstream artifact).

## 11. Postconditions

1. `results[]` has exactly one entry per `evidence_id` present in the input `ResearchReport.evidence_items[]` — full coverage, no more, no fewer.
2. Every entry not marked `accepted` has a non-empty `rationale`.
3. No item is marked `accepted` without provenance already present on the input evidence item (the agent never invents provenance to justify an accept).
4. Any item the rubric flags as high-impact-ambiguous carries `status: needs_human`, never a forced `accepted`/`rejected`.
5. `research_report_ref` and `rubric_id` in the output exactly echo the input.

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | `research_report_ref.digest` equals the digest of the artifact resolved from `artifact_id`+`artifact_version`. | Pre-execution (Admit) |
| V2 | `rubric_id` exists in the active rubric registry. | Pre-execution |
| V3 | Every `evidence_id` from the input report appears exactly once in `results[]`. | Post-execution (Validate) |
| V4 | No `evidence_id` appears in `results[]` that was not present in the input report (no fabricated coverage). | Post-execution |
| V5 | Every `rejected` or `needs_human` entry has a `rationale` of non-trivial length (not a placeholder like `"n/a"`). | Post-execution |
| V6 | An item with a `community` signal tier from the Research stage cannot be assigned `trust_tier: high` without an explicit rubric rule permitting it, and if permitted, the rationale must state why. | Post-execution |
| V7 | An item lacking a resolvable `provenance.pointer` (should not occur given Stage 1's contract, but checked defensively) is forced to `status: rejected`, `trust_tier: untrusted`. | Post-execution |
| V8 | `risk_flags`, when present, are drawn from the rubric's declared flag vocabulary — no ad hoc flag strings. | Post-execution |
| V9 | The output's `research_report_ref` and `rubric_id` byte-for-byte match the input. | Post-execution |

## 13. Workflow

1. **Bind** — Harness resolves contract + schema bundle; denies on mismatch.
2. **Admit** — Preconditions (§10) checked: digest match, rubric resolution, tenancy match.
3. **Load** — Agent reads the sealed `ResearchReport` payload by `artifact_id@artifact_version`.
4. **Apply rubric** — For each `evidence_item`, the agent evaluates: source-class trust baseline, signal tier, recency (if the rubric scores it), safety flags, and — critically — cross-references against any known conflicting or superseding high-trust knowledge if the rubric requires it.
5. **Assign verdicts** — Each item receives `status`, `trust_tier`, `rationale`, and optional `risk_flags`.
6. **Escalate ambiguity** — Any item meeting the rubric's "high-impact ambiguous" criteria is set to `needs_human` rather than forced to a binary verdict.
7. **Assemble** — Build the `results[]` array ensuring full coverage (§11.1) before emission.
8. **Emit candidate** — Submit `ValidationReport` payload for Harness `Validate`.
9. **Validate** — Harness checks schema validity, Postconditions (§11), and the Review Gate.
10. **Emit / Complete** — On pass, artifact is sealed and handed to the Proposal Agent. On fail, invocation transitions `FAILED` per §19.

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| Item has strong primary-source provenance, recent, no conflicts | `accepted`, `trust_tier: high` | Rubric baseline case |
| Item is community-sourced (Reddit) but corroborated by an accepted primary source in the same report | `accepted`, `trust_tier: medium`, `risk_flags: ["community_origin"]` | Corroboration raises usability without pretending it is primary |
| Item is community-sourced and uncorroborated | `needs_human` or `rejected` per rubric threshold, `trust_tier: low`/`untrusted` | Uncorroborated community claims are asymmetric risk |
| Item directly contradicts an existing accepted high-trust knowledge unit | `needs_human`, `risk_flags: ["conflicting_claim"]` | Contradiction with SoR is always high-impact ambiguity |
| Item's provenance pointer cannot be independently re-resolved by this agent (defensive re-check) | `rejected`, `trust_tier: untrusted` | Never accept unverifiable provenance, even if Stage 1 supplied a pointer |
| Item is safety-relevant (e.g., security guidance, medical/financial claim class per rubric) and only medium-confidence | `needs_human` | Asymmetric downside requires a human, never an automatic accept |
| Rubric is silent on a specific edge case not covered by its vocabulary | `needs_human`, `risk_flags: ["rubric_gap"]` | Silence in the rubric is not license to guess |
| Item was already `rejected` in an earlier `ValidationReport` version for the same evidence, with no new information | `rejected` (consistent), unless rubric or evidence changed | No flip-flopping without a materially different basis |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture

```json
{
  "contract_version": "1.0.0",
  "input": {
    "research_report_ref": {
      "artifact_id": "art_research-report_0142",
      "artifact_version": "1.0.0",
      "digest": "sha256:8f2b6e1c4d9a3701f5e8b2a4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3"
    },
    "rubric_id": "rubric_engineering_v3"
  },
  "output": {
    "research_report_ref": {
      "artifact_id": "art_research-report_0142",
      "artifact_version": "1.0.0",
      "digest": "sha256:8f2b6e1c4d9a3701f5e8b2a4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3"
    },
    "rubric_id": "rubric_engineering_v3",
    "results": [
      {
        "evidence_id": "ev_0001",
        "status": "accepted",
        "rationale": "Primary-source design documentation from the project's own repository, current as of the latest default-branch commit; no conflicting claims found.",
        "trust_tier": "high",
        "risk_flags": []
      },
      {
        "evidence_id": "ev_0002",
        "status": "accepted",
        "rationale": "Well-established secondary reference on local-first principles; widely cited, no safety or conflict concerns for this engineering topic.",
        "trust_tier": "medium",
        "risk_flags": ["secondary_source"]
      }
    ]
  }
}
```

### 15.2 Escalation Example

```json
{
  "evidence_id": "ev_0007",
  "status": "needs_human",
  "rationale": "Claims that eventual-consistency graph sync is safe without vector clocks, which directly contradicts the accepted high-trust knowledge unit kn_00391 on conflict resolution. Asymmetric risk if wrongly accepted.",
  "trust_tier": "low",
  "risk_flags": ["conflicting_claim", "safety_relevant"]
}
```

## 16. Artifact Examples

Fully sealed `ValidationReport`:

```json
{
  "artifact_id": "art_validation-report_0142",
  "artifact_version": "1.0.0",
  "artifact_type": "ValidationReport",
  "run_id": "run_2b7f1c9e-know-ingest-0142",
  "produced_by": "source-validation-agent",
  "created_at": "2026-07-22T09:22:10Z",
  "digest": "sha256:1a2b3c4d5e6f7089a1b2c3d4e5f60718a2b3c4d5e6f7089a1b2c3d4e5f60718",
  "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" },
  "schema_version": "1.0.0",
  "payload": {
    "research_report_ref": { "artifact_id": "art_research-report_0142", "artifact_version": "1.0.0", "digest": "sha256:8f2b6e1c4d9a3701f5e8b2a4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3" },
    "rubric_id": "rubric_engineering_v3",
    "results": [
      { "evidence_id": "ev_0001", "status": "accepted", "rationale": "Primary-source design documentation, current, no conflicts.", "trust_tier": "high", "risk_flags": [] },
      { "evidence_id": "ev_0002", "status": "accepted", "rationale": "Well-established secondary reference, no conflicts.", "trust_tier": "medium", "risk_flags": ["secondary_source"] }
    ]
  },
  "parents": [
    { "artifact_id": "art_research-report_0142", "artifact_version": "1.0.0", "artifact_type": "ResearchReport" }
  ]
}
```

## 17. Examples (Scenarios)

**Scenario A — Clean accept.** A `ResearchReport` with 6 items, all primary/secondary, no conflicts. All 6 become `accepted` with `trust_tier` reflecting source class; `ValidationReport` proceeds to Proposal Agent without delay.

**Scenario B — Mixed report.** 10 items: 6 `accepted`, 2 `rejected` (one paywalled with unverifiable excerpt, one stale beyond the rubric's recency window), 2 `needs_human` (conflicting claims). Report still validates — `needs_human` is a legitimate terminal status for this stage, not a failure; it is Proposal Agent's/Human Review's job to decide how to proceed with an evidence base that includes escalations.

**Scenario C — Digest mismatch.** The caller passes a `research_report_ref` whose `digest` does not match the currently-sealed artifact at that `artifact_id@artifact_version` (e.g., stale cache). Agent refuses to run: `INPUT_DIGEST_MISMATCH`, fail closed, no partial validation attempted.

**Scenario D — Unknown rubric.** `rubric_id: "rubric_deprecated_v1"` no longer resolves because it was retired. Agent fails closed with `RUBRIC_MISSING` rather than silently falling back to a default rubric, which would change the meaning of every downstream trust decision without an audit trail explaining why.

## 18. Acceptance Criteria

- [ ] Schema-valid against [validation-report.schema.json](../../schemas/artifacts/validation-report.schema.json).
- [ ] `results[]` has exactly one entry per input `evidence_id` — verified by set-equality check, not just count.
- [ ] Every non-`accepted` entry has a substantive `rationale`.
- [ ] No `accepted` entry lacks upstream provenance.
- [ ] High-impact ambiguous items are `needs_human`, never forced.
- [ ] `research_report_ref` and `rubric_id` exactly echo the input.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `RUBRIC_MISSING` | `rubric_id` does not resolve to an active rubric. | Non-retryable |
| `PROVENANCE_MISSING` | An input evidence item lacks a provenance pointer (defensive re-check catching an upstream contract violation). | Non-retryable |
| `INPUT_DIGEST_MISMATCH` | `research_report_ref.digest` does not match the currently-sealed artifact. | Non-retryable |
| `SCHEMA_INVALID` | Assembled output fails schema validation. | Non-retryable |
| `POLICY_DENY` | Tenancy or policy check fails at Admit. | Non-retryable |
| `INCOMPLETE_COVERAGE` | Internal check finds `results[]` does not cover every input `evidence_id` before emission. | Non-retryable |
| `TRANSIENT_COMPUTE_ERROR` | A scoring/model call used to apply the rubric times out or errors transiently. | Retryable (bounded) |

**Failure Cases (narrative):**

- A rubric with a broken flag vocabulary reference causes the agent to be unable to classify a `risk_flags` case correctly; rather than inventing a flag string, the agent halts with `RUBRIC_MISSING`-class failure and reports the specific gap for engineering follow-up.
- If the underlying compute used to apply the rubric (e.g., a Cloud AI Compute Layer call for claim-conflict detection) times out, that is `TRANSIENT_COMPUTE_ERROR` and retried per §21 — it is not treated as evidence being untrustworthy.

## 20. Forbidden Behaviors

1. **Never silently drop an evidence item** from coverage — every input id must appear in `results[]`.
2. **Never accept an item without provenance**, regardless of how confident the rubric scoring seems.
3. **Never force a binary verdict on high-impact ambiguity** — escalate to `needs_human`.
4. **Never flip a previously `rejected` verdict to `accepted`** within the same report version, or across versions without a materially new basis documented in the rationale.
5. **Never invent a `risk_flags` value** outside the rubric's declared vocabulary.
6. **Never re-score using a different rubric than the one declared in `rubric_id`**, even if it seems "better."
7. **Never let a `community` signal tier item silently become `trust_tier: high`** without an explicit, stated corroboration rationale.
8. **Never mutate or reinterpret the input `ResearchReport`'s content** — validation judges, it does not edit.

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Transient compute (`TRANSIENT_COMPUTE_ERROR`) | 3 | Exponential with jitter | New invocation id per attempt. |
| Rubric/provenance/digest/schema/policy (`RUBRIC_MISSING`, `PROVENANCE_MISSING`, `INPUT_DIGEST_MISMATCH`, `SCHEMA_INVALID`, `POLICY_DENY`, `INCOMPLETE_COVERAGE`) | 0 | n/a | Fail closed immediately. |

## 22. Retry Examples

**Example 1 — Transient scoring timeout recovered.** Attempt 1's conflict-detection call (used to check item 7 against SoR) times out after 30s. Harness retries attempt 2 after a 1-second backoff; the call succeeds and item 7 is scored `needs_human` due to a genuine detected conflict. Total attempts: 2 of 3.

**Example 2 — Digest mismatch, no retry.** The Proposal stage caller passes a `research_report_ref.digest` that is one version behind the currently-sealed artifact (the Research Agent's report was superseded by a rebase). The agent fails immediately with `INPUT_DIGEST_MISMATCH` — attempt count stays at 1; per Harness §8 (Rebase), the run should restart Stage 2 with the current input version rather than retry the stale reference.

**Example 3 — Repeated rubric failure quarantined.** Three consecutive runs reference `rubric_id: "rubric_typo_v9"`, which does not exist. Each run fails identically with `RUBRIC_MISSING` on the first attempt (0 retries allowed for this class). Per Harness §7 Rule 5, this identical repeat failure is quarantined pending human correction of the caller's rubric configuration.

## 23. Error Recovery Procedures

1. **On `TRANSIENT_COMPUTE_ERROR`:** Retry per §21; if all 3 attempts exhaust, stage fails `FAILED`, and Notification Agent alerts on-call per Harness §8 (Escalate).
2. **On `INPUT_DIGEST_MISMATCH`:** Do not retry the same reference. Harness applies the Rebase failure mode: cancel the stale run segment and restart Stage 2 against the current `ResearchReport` version.
3. **On `RUBRIC_MISSING`:** Fail closed; escalate to engineering/config owners via Notification Agent; no fallback rubric is substituted.
4. **On `INCOMPLETE_COVERAGE` (internal defect):** Treat as a contract violation of this agent's own postconditions; do not emit; log for immediate engineering triage — this should never occur under correct implementation and indicates a bug, not a transient condition.
5. **On repeated `needs_human` escalations exceeding a rubric-defined threshold for one report:** This is not itself a failure — the `ValidationReport` still validates and proceeds. The Human Review stage downstream will see a heavier escalation load and should be notified of unusually high ambiguity via Notification Agent so reviewers can prepare.

## 24. Best Practices

- Write rationales assuming a human reviewer at Stage 4 will read them without the original source open — make the reasoning self-contained.
- Prefer `needs_human` over a low-confidence forced verdict whenever the rubric is genuinely silent or conflicted.
- Keep `risk_flags` from the rubric's controlled vocabulary consistent across reports so downstream analytics (Success Metrics) remain comparable.
- Re-verify provenance defensively even though Stage 1's contract requires it — defense in depth costs little and catches upstream regressions early.

## 25. Anti-patterns

- **Rubber-stamping:** marking everything `accepted` with `trust_tier: high` regardless of source quality, to speed the pipeline through.
- **Verdict laundering:** relabeling a `community` source as `secondary` or `primary` to avoid friction at Human Review.
- **Coverage padding:** inventing a `results[]` entry for an `evidence_id` that never existed in the input, to make the report "look complete."
- **Rubric drift:** quietly applying a newer or different rubric than the one declared, because it "gives better results."
- **Silent re-litigation:** flipping a prior rejection without documenting what materially changed.

## 26. Success Metrics

- **Accept/reject precision vs. human audit** — sampled agreement rate with human spot-checks.
- **False-accept rate on high-impact items** — target: 0.
- **Rubric coverage rate** — % of items the rubric could classify without falling to `rubric_gap`.
- **Escalation-to-resolution time** — how quickly `needs_human` items get addressed downstream.
- **SLA time-to-report** — wall-clock time from Admit to sealed `ValidationReport`.

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Articles II, III, IV, IX, XIII
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §6 Handoff Rules, §7 Retry Rules, §8 Failure Recovery
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 2
- [/artifacts/validation-report.md](../../artifacts/validation-report.md)
- [/schemas/artifacts/validation-report.schema.json](../../schemas/artifacts/validation-report.schema.json)
- [/contracts/agents/research-agent.md](./research-agent.md) — upstream producer contract
- [/contracts/agents/proposal-agent.md](./proposal-agent.md) — downstream consumer contract

**End of Contract: Source Validation Agent v2.0.0**
