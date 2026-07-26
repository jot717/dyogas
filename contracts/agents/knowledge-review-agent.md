# Contract: Knowledge Review Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/knowledge-review-agent.schema.json](../../schemas/agents/knowledge-review-agent.schema.json)
**Artifact Schema:** [/schemas/artifacts/human-review-decision.schema.json](../../schemas/artifacts/human-review-decision.schema.json)
**Artifact Spec:** [/artifacts/human-review-decision.md](../../artifacts/human-review-decision.md)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Skills:** [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) §5.13 Knowledge Approval
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 4 (Human Review)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field remains the literal string `"1.0.0"` per the schema bundle's `const` constraint until an ADR revises it. All JSON examples below use `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Knowledge Review Agent exists to make the Human Approval Gate fast and safe **without ever becoming the approval itself**. It assembles a complete, checklist-driven review package — findings, conflict/duplicate flags, and open questions — so that a human approver can decide `approved` / `rejected` / `request_changes` / `escalated` quickly and correctly. This agent is the mechanical enforcement of Constitution Article III (Human Approval Workflow): it may prepare everything up to the approval boundary, and it may not cross it.

## 2. Scope

### 2.1 In Scope

- Consuming a sealed `Proposal` (and, when configured, a draft `Knowledge` candidate) plus a `checklist_id`.
- Running/aggregating automated checks: checklist completeness, duplicate detection, conflict detection, citation resolvability, principle checks.
- Producing a `HumanReviewDecision` **candidate** with `outcome: pending`, populated `review_findings[]`, and no `approver`/`apply_token`.
- Flagging critical or unresolved conflicts so a human sees them prominently.

### 2.2 Out of Scope

- Setting `outcome` to anything other than `pending`. Only a human approver, acting through the Harness's Human Approval Gate, may set `approved`, `rejected`, `request_changes`, `expired`, or `escalated`.
- Minting, forging, or reusing an `apply_token`. This agent's output must never contain one.
- Rewriting or merging proposal/knowledge content (it reviews, it does not author).
- Any Knowledge Plane write.

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Checklist** | A named, versioned (`checklist_id`) set of required review items that must each be addressed (satisfied, waived-with-reason, or flagged) before a package is ready for human decision. |
| **Review Finding** | One structured item: `code`, `severity` (`low`\|`medium`\|`high`\|`critical`), `message`. |
| **Pending Package** | This agent's sole legitimate output shape: a `HumanReviewDecision` candidate with `outcome: pending`. |
| **Human Approval Gate** | The Harness mechanism (Harness Specification §9) that alone can transform a pending package into a final outcome, attributable to a human `actor_id`. |
| **Apply Token** | Single-use, artifact-version-bound authorization created only by the Human Approval Gate on `approved`; this agent never creates one. |
| **Critical Conflict** | A conflict finding whose severity is `critical` — must block a clean "ready to approve" signal and be surfaced prominently, never silently downgraded. |

## 4. Role

Package automated review findings for knowledge/proposal packages and support the Human Approval Gate. This agent does **not** issue apply tokens and does **not** decide the outcome — it only prepares the decision surface.

## 5. Responsibilities

1. Verify the input `Proposal` (and optional draft `Knowledge`) references resolve to sealed artifacts.
2. Resolve the `checklist_id` to an active checklist; refuse to proceed on an unknown checklist.
3. Run every checklist item against the subject artifact(s): citation resolvability, non-goal presence, metric measurability (cross-checking Proposal Agent's own postconditions as a second line of defense), duplicate/conflict detection where detectors are available.
4. Populate `review_findings[]` with every issue found, each carrying an honest `severity`.
5. Leave `outcome: pending`, omit `approver`, omit `apply_token` — always, without exception.
6. Never suppress or downgrade a `critical` finding to make a package look more approvable.
7. Hand off the pending package to the Human Approval Gate only through the Harness; humans act on it from there.

## 6. Input Schema

Primary shape: the `input` object of [knowledge-review-agent.schema.json](../../schemas/agents/knowledge-review-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `proposal_ref` | object `{artifact_id, artifact_version}` (both required) | yes | Must reference a sealed `Proposal`. |
| `checklist_id` | string | yes | Identifier of the review checklist to apply. |

## 7. Output Schema

The agent's output feeds the `review_findings` (and `subject_refs`, `checklist_id`, `outcome: pending`) portion of [human-review-decision.schema.json](../../schemas/artifacts/human-review-decision.schema.json). This agent must never populate `approver` or `apply_token`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `subject_refs` | array, minItems 1, each `{artifact_id, artifact_version, artifact_type}` | yes | Typically the `Proposal`, optionally a draft `Knowledge`. |
| `outcome` | must be `pending` from this agent | yes | Any other value from this agent is a contract violation. |
| `checklist_id` | string | yes | Echoes input. |
| `review_findings` | array of `{code, severity, message}` | yes | May be empty only if the checklist genuinely found zero issues. |
| `approver` | **must be absent** | — | Forbidden from this agent. |
| `apply_token` | **must be absent** | — | Forbidden from this agent. |
| `change_requests` | array of string | no | May be pre-populated with mechanical suggestions; final `request_changes` outcome is still a human decision. |

`additionalProperties: false` on the schema — no undeclared fields.

## 8. Accepted Artifact(s)

`Proposal` (sealed, primary); optional draft `Knowledge` reference when the pipeline configuration reviews a pre-rendered draft ahead of Stage 5.

## 9. Produced Artifact(s)

`HumanReviewDecision` **candidate package** (`outcome: pending`) — not itself the final sealed decision. The Harness seals the *final* `HumanReviewDecision` only once a human actor completes the gate (see [Harness Specification §9](../../harness/HARNESS_SPECIFICATION.md)).

## 10. Preconditions

1. `proposal_ref` resolves to a sealed `Proposal`.
2. `checklist_id` resolves to an active checklist.
3. Approver policy for this run/tenant is resolvable (so the Harness knows who is eligible to act on the pending package once produced).
4. Tenancy of the input artifact matches the invocation's tenancy.

## 11. Postconditions

1. Checklist coverage is complete: every checklist item is addressed with a finding, a pass, or an explicit blocker — no silent omissions.
2. Conflicts/duplicates are flagged when detectors are available and return a result (including `detection_incomplete` from Conflict Detection, which itself must be surfaced as a finding, not treated as "no conflicts").
3. `outcome` remains `pending`.
4. No `apply_token` is present under any circumstance.

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | `proposal_ref` resolves to a sealed, schema-valid `Proposal`. | Pre-execution |
| V2 | `checklist_id` exists in the active checklist registry. | Pre-execution |
| V3 | `outcome` in the emitted package equals `pending` — hard assertion, fails closed if violated. | Post-execution |
| V4 | `approver` and `apply_token` keys are absent from the emitted package. | Post-execution |
| V5 | Every checklist item has a corresponding finding, explicit pass, or documented blocker in `review_findings`. | Post-execution |
| V6 | Every `citations[].evidence_id` in the subject `Proposal` is re-checked for resolvability; unresolvable ones produce a `high` or `critical` finding. | Post-execution |
| V7 | A `detection_incomplete` result from Conflict/Duplicate Detection produces an explicit finding — never silently treated as "clean." | Post-execution |
| V8 | `subject_refs` includes every artifact actually reviewed, and only those. | Post-execution |

## 13. Workflow

1. **Bind / Admit** — Harness resolves contract + schema; checks Preconditions (§10).
2. **Load** — Agent reads the sealed `Proposal` (and optional draft `Knowledge`).
3. **Resolve checklist** — Load the `checklist_id` definition.
4. **Run checks** — For each checklist item: citation resolvability (re-verify against the linked `ValidationReport`), non-goal presence, metric measurability, principle fit, duplicate detection (against existing Knowledge Plane corpus), conflict detection (against existing high-trust knowledge units).
5. **Assemble findings** — Populate `review_findings[]` with `code`, `severity`, `message` for every issue, pass, or blocker.
6. **Assemble subject_refs** — List every artifact actually reviewed.
7. **Emit pending package** — `outcome: pending`, no `approver`, no `apply_token`.
8. **Validate** — Harness checks schema validity and Postconditions (§11).
9. **Hand off to Human Approval Gate** — The pending package is presented to eligible human approvers. This agent's invocation reaches terminal `SUCCEEDED` once the package is validated and delivered — it does not wait synchronously for the human decision; the pipeline run instead enters `WAITING_HUMAN` (Harness Specification §4.1) until a human acts.

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| All checklist items pass, no conflicts/duplicates detected | Emit pending package with `review_findings` showing all-clear passes | A clean package still requires human sign-off — this agent never auto-approves |
| A citation fails to resolve on re-check | Add a `high` or `critical` finding depending on checklist severity mapping | Broken citations are a serious defect a human must see before deciding |
| Conflict Detection returns `detection_incomplete` | Add an explicit finding stating detection was incomplete and why | Silence must never be read as "no conflicts" |
| A duplicate of existing Knowledge Plane content is detected | Add a finding identifying the duplicate candidate and its canonical id | Protects Single Source of Truth (Constitution Article VI) |
| Checklist itself is missing an item definition the agent cannot evaluate | Add a `medium`+ finding stating the gap; do not silently skip it | Checklist gaps are themselves review-relevant information |
| A prior `request_changes` cycle produced a revised `Proposal` version | Treat as a fresh review pass against the new version; do not carry forward stale findings verbatim without re-verifying them | Findings must reflect the artifact actually being reviewed now |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture

```json
{
  "contract_version": "1.0.0",
  "input": {
    "proposal_ref": {
      "artifact_id": "art_proposal_0142",
      "artifact_version": "1.0.0"
    },
    "checklist_id": "checklist_knowledge_review_v2"
  },
  "output": {
    "subject_refs": [
      { "artifact_id": "art_proposal_0142", "artifact_version": "1.0.0", "artifact_type": "Proposal" }
    ],
    "outcome": "pending",
    "checklist_id": "checklist_knowledge_review_v2",
    "review_findings": [
      { "code": "CITATIONS_RESOLVED", "severity": "low", "message": "All 2 citations resolve to accepted evidence in art_validation-report_0142." },
      { "code": "NO_DUPLICATE_FOUND", "severity": "low", "message": "Duplicate Detection scan against existing Knowledge corpus found no near-duplicate above threshold 0.86." },
      { "code": "METRICS_MEASURABLE", "severity": "low", "message": "Both success metrics have explicit thresholds and timeframes." }
    ],
    "change_requests": []
  }
}
```

### 15.2 Findings With a Critical Conflict

```json
{
  "subject_refs": [
    { "artifact_id": "art_proposal_0201", "artifact_version": "1.0.0", "artifact_type": "Proposal" }
  ],
  "outcome": "pending",
  "checklist_id": "checklist_knowledge_review_v2",
  "review_findings": [
    { "code": "CONFLICT_WITH_EXISTING_KNOWLEDGE", "severity": "critical", "message": "Proposed option 'opt_disable_vector_clocks' directly contradicts accepted knowledge unit kn_00391 on graph conflict resolution; requires explicit human adjudication before approval." }
  ],
  "change_requests": [
    "Reconcile with kn_00391 or explicitly supersede it with a documented rationale before this proposal can be approved."
  ]
}
```

## 16. Artifact Examples

Fully sealed pending package (the artifact that reaches `WAITING_HUMAN`; note this is **not yet** the final `HumanReviewDecision` — the Harness seals the final decision once a human acts, per §9 below):

```json
{
  "artifact_id": "art_human-review-decision_0142",
  "artifact_version": "0.1.0-pending",
  "artifact_type": "HumanReviewDecision",
  "run_id": "run_2b7f1c9e-know-ingest-0142",
  "produced_by": "knowledge-review-agent",
  "created_at": "2026-07-22T09:35:12Z",
  "digest": "sha256:3c4d5e6f708192a3b4c5d6e7f809102b3c4d5e6f708192a3b4c5d6e7f809102",
  "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" },
  "schema_version": "1.0.0",
  "payload": {
    "subject_refs": [{ "artifact_id": "art_proposal_0142", "artifact_version": "1.0.0", "artifact_type": "Proposal" }],
    "outcome": "pending",
    "checklist_id": "checklist_knowledge_review_v2",
    "review_findings": [
      { "code": "CITATIONS_RESOLVED", "severity": "low", "message": "All citations resolve." }
    ]
  },
  "parents": [
    { "artifact_id": "art_proposal_0142", "artifact_version": "1.0.0", "artifact_type": "Proposal" }
  ]
}
```

> Once a human actor decides, the Harness seals the **final** `HumanReviewDecision` (a distinct, later artifact version) carrying `outcome: approved` + `approver` + `apply_token`, per the [Human Review Decision artifact spec](../../artifacts/human-review-decision.md). That sealing action is performed by the Harness's Human Approval Gate, not by this agent.

## 17. Examples (Scenarios)

**Scenario A — Clean pending package.** Proposal passes every checklist item; findings are all `low` severity passes; package reaches `WAITING_HUMAN` quickly, human approves within SLA.

**Scenario B — Critical conflict surfaced.** Duplicate/Conflict Detection finds the proposal contradicts existing high-trust knowledge. Agent emits a `critical` finding and a `change_requests` entry. The package is still `pending` — the agent does not decide to reject on the conflict's behalf; the human sees the critical flag prominently and may `reject` or `request_changes`.

**Scenario C — Checklist gap.** The checklist references an item (`"check_license_compat"`) that this run's tooling cannot evaluate (no license detector wired up for this proposal kind). Agent adds a `medium` finding stating the gap explicitly rather than silently omitting the item — a human approver decides whether to proceed or wait for the capability.

**Scenario D — Re-review after `request_changes`.** A prior cycle returned `request_changes`; the Proposal Agent emitted `art_proposal_0142` version `1.1.0` addressing the feedback. This agent runs a **fresh** review pass against `1.1.0`, not a diff of old findings — some previously-flagged items may now pass, and new ones could appear.

## 18. Acceptance Criteria

- [ ] Schema-valid contribution to [human-review-decision.schema.json](../../schemas/artifacts/human-review-decision.schema.json).
- [ ] `outcome` is always `pending` from this agent.
- [ ] `approver` and `apply_token` are always absent from this agent's output.
- [ ] Checklist coverage is complete — every item addressed.
- [ ] Critical/high findings are never downgraded or omitted.
- [ ] `subject_refs` accurately lists every reviewed artifact.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `CHECKLIST_INCOMPLETE` | The agent cannot evaluate one or more checklist items and cannot even produce an explicit gap finding (tooling/data failure). | Non-retryable |
| `INPUT_DIGEST_MISMATCH` | `proposal_ref` no longer matches the currently-sealed `Proposal` (superseded). | Non-retryable |
| `UNRESOLVED_CRITICAL_CONFLICT` | A critical conflict is detected and the checklist policy requires the run to halt (rather than merely flag) pending human triage. | Non-retryable, escalate |
| `POLICY_DENY` | Tenancy/approver-policy resolution fails at Admit. | Non-retryable |
| `OUTCOME_INTEGRITY_VIOLATION` | Internal defect where the assembled package would carry a non-`pending` outcome, an `approver`, or an `apply_token`. | Non-retryable, escalate (critical — must never ship) |
| `TRANSIENT_COMPUTE_ERROR` | A detector (duplicate/conflict) call times out transiently. | Retryable (bounded) |

**Failure Cases (narrative):**

- If the duplicate-detection index is stale (`INDEX_STALE` per the Duplicate Detection skill), the checklist policy determines whether that is a `warn`-and-continue finding or a hard `CHECKLIST_INCOMPLETE` failure; either way, it must be visible, never silently ignored.
- `OUTCOME_INTEGRITY_VIOLATION` is treated as a critical engineering defect, not a normal runtime failure — any occurrence must trigger an incident review before this agent is trusted again, since it represents a near-miss on the Human Approval boundary.

## 20. Forbidden Behaviors

1. **Never set `outcome` to anything other than `pending`.**
2. **Never populate `approver`.**
3. **Never populate, forge, or forward an `apply_token`.**
4. **Never downgrade a `critical` finding's severity** to make a package look cleaner.
5. **Never silently skip a checklist item** — every item produces a finding, pass, or explicit gap.
6. **Never rewrite the subject `Proposal` or draft `Knowledge`** — this agent reviews, it does not author or merge.
7. **Never treat `detection_incomplete` as equivalent to "no conflicts found."**
8. **Never act on behalf of a human approver**, including inferring "the human would probably approve this."

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Transient compute (`TRANSIENT_COMPUTE_ERROR`) | 2 | Exponential with jitter | |
| Critical conflict / policy (`UNRESOLVED_CRITICAL_CONFLICT`, `POLICY_DENY`, `CHECKLIST_INCOMPLETE`, `INPUT_DIGEST_MISMATCH`, `OUTCOME_INTEGRITY_VIOLATION`) | 0 | n/a | Fail closed / escalate to human, never busy-retried. |

## 22. Retry Examples

**Example 1 — Detector timeout recovered.** Attempt 1's Duplicate Detection call times out. Harness retries attempt 2 after a 1-second backoff; attempt 2 succeeds and returns zero duplicates. Package emits cleanly. Total attempts: 2 of 2.

**Example 2 — Digest mismatch after concurrent edit.** Between Stage 3 sealing `art_proposal_0142@1.0.0` and this agent's Admit, a `request_changes` cycle from a different run segment produced `art_proposal_0142@1.1.0`. The stale reference fails `INPUT_DIGEST_MISMATCH` on attempt 1 with 0 retries; per Harness §8 (Rebase), the review is restarted against the current version.

**Example 3 — Critical conflict, no retry, human-bound.** A `critical` conflict finding triggers `UNRESOLVED_CRITICAL_CONFLICT`. There is no attempt 2 — the invocation enters `WAITING_HUMAN` (per Harness §4.1's human-bound retry class) with the conflict prominently surfaced, rather than looping automated attempts hoping the conflict resolves itself.

## 23. Error Recovery Procedures

1. **On `TRANSIENT_COMPUTE_ERROR`:** Retry per §21; on exhaustion, `FAILED` + Notification Agent alert to reviewers/on-call.
2. **On `INPUT_DIGEST_MISMATCH`:** Restart the review against the current `Proposal` version (Rebase); do not attempt to review a superseded reference.
3. **On `UNRESOLVED_CRITICAL_CONFLICT`:** Route directly to `WAITING_HUMAN` with the finding surfaced at top severity; Notification Agent alerts approvers immediately given the critical severity (per its own contract's SLA for critical events).
4. **On `CHECKLIST_INCOMPLETE` (tooling failure, not a policy gap):** Fail closed and escalate to engineering — a checklist that cannot be evaluated at all is a platform defect, not a routine review outcome.
5. **On `OUTCOME_INTEGRITY_VIOLATION`:** Immediate fail-closed, immediate human incident escalation, and this agent's outputs for the affected run are quarantined pending root-cause — this failure mode indicates a near-breach of the Human Approval boundary and must never be treated as routine.

## 24. Best Practices

- Write `review_findings[].message` so a human can act on it without opening the underlying artifacts first.
- Surface `detection_incomplete` and other "we don't know" states as visibly as outright conflicts — false confidence is as dangerous as a missed conflict.
- Keep `change_requests` specific and actionable so a `request_changes` outcome (if the human chooses it) gives the next Proposal Agent run clear direction.
- Re-run detectors fresh on every review pass rather than reusing stale results from a prior proposal version.

## 25. Anti-patterns

- **Rubber-stamp packaging:** emitting an all-clear `review_findings` set without genuinely running the checklist's detectors.
- **Severity softening:** recording a real conflict as `medium` instead of `critical` to reduce approver friction.
- **Silent gap-filling:** treating an unevaluated checklist item as passed by default.
- **Approval creep:** any code path, however well-intentioned, that would let this agent set `outcome` to anything but `pending`.

## 26. Success Metrics

- **Defect escape rate post-apply** — issues found in production Knowledge that this review stage should have caught (target: trending to 0).
- **Escalation-upheld rate** — % of `critical` findings a human ultimately agreed were material.
- **Review turnaround time** — Admit to pending-package-ready.
- **Duplicate introduction rate** — % of approved Knowledge later found to duplicate existing content.

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Article III (Human Approval Workflow), Article VI (No Duplicate Systems)
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §9 Human Approval Gates, §10 Review Gates
- [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) — §5.7 Duplicate Detection, §5.8 Conflict Detection, §5.13 Knowledge Approval
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 4
- [/artifacts/human-review-decision.md](../../artifacts/human-review-decision.md)
- [/contracts/agents/proposal-agent.md](./proposal-agent.md) — upstream producer contract
- [/contracts/agents/markdown-agent.md](./markdown-agent.md) — downstream consumer contract

**End of Contract: Knowledge Review Agent v2.0.0**
