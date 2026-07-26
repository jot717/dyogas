# Contract: Learning Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/learning-agent.schema.json](../../schemas/agents/learning-agent.schema.json)
**Artifact Schema:** [/schemas/artifacts/proposal.schema.json](../../schemas/artifacts/proposal.schema.json) (`kind: "lesson"`)
**Artifact Spec:** [/artifacts/proposal.md](../../artifacts/proposal.md)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Supporting agent (cross-cutting; feeds Stage 4 Human Review as a `Proposal` producer alongside the Proposal Agent)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field remains the literal string `"1.0.0"` per the schema bundle's `const` constraint until an ADR revises it. All JSON examples below use `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Learning Agent turns run outcomes, human corrections, and evaluation results into durable, evidence-backed **lessons** — without ever letting an agent silently rewrite its own behavior, prompts-as-law, or policy. Its purpose is to close the feedback loop from "what happened" to "what should change" while keeping every adoption decision behind the same Human Approval Gate every other knowledge change goes through.

## 2. Scope

### 2.1 In Scope

- Consuming outcome/feedback bundles (run audit summaries, human corrections, eval results) as `evidence_refs`.
- Producing a `kind: "lesson"` `Proposal` grounded in that evidence, with the same rigor (metrics, non-goals, citations) as a Stage 3 knowledge proposal.
- Routing its evidence bundle through source validation before drafting a lesson, so `validation_report_ref` is never fabricated.
- Refusing to draft a lesson when evidence is privacy-blocked or insufficient.

### 2.2 Out of Scope

- Auto-applying any behavioral change, prompt edit, or policy change. This agent proposes only.
- Bypassing Knowledge Review or Human Approval for lesson adoption — lessons follow the identical Stage 4 gate as any other `Proposal`.
- Collecting new evidence itself (it consumes `evidence_refs` already gathered elsewhere; it does not invoke Research skills directly).
- Producing `kind: "knowledge"` or `kind: "other"` proposals — that is the Proposal Agent's contract.

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Learning Objective** | The scoped question this invocation is trying to answer, e.g., "why did Stage 6 identity-collision escalations spike last week?" |
| **Evidence Ref** | A reference to run audit summaries, human corrections, or eval results supplied as the input evidence bundle — not raw, unvetted text. |
| **Lesson** | A `Proposal` with `kind: "lesson"` — same schema shape as a knowledge proposal, same evidentiary and approval discipline, different subject matter (behavioral/process change rather than a knowledge unit). |
| **Auto-apply Attempt** | Any code path, however indirect, that would let a lesson change behavior, prompts, or policy without passing through Knowledge Review and Human Approval — always forbidden. |
| **Privacy/Policy Block** | A determination that using specific outcome data (e.g., containing PII, confidential customer content) for learning purposes is not permitted under current policy. |

## 4. Role

Propose durable lessons from outcomes and feedback. Does not silently mutate policy, prompts-as-law, or the Knowledge Plane SoR. Every lesson is a `Proposal` awaiting the same human approval any other proposal requires.

## 5. Responsibilities

1. Scope the `learning_objective` precisely before evaluating evidence — a vague objective produces an unfocused, unverifiable lesson.
2. Verify every `evidence_refs[]` entry is real (resolvable) and permitted for learning use under current privacy/policy rules.
3. Route the evidence bundle through a validation pass (reusing the Source Validation Agent's rubric-based judgment, per §10) to obtain a genuine `ValidationReport` before drafting — the output `Proposal` schema requires `validation_report_ref`, and this agent must never fabricate that reference.
4. Draft the lesson `Proposal` with the same rigor as a Stage 3 proposal: real trade-offs, measurable success metrics, explicit non-goals, citations to validated evidence only.
5. Set `kind: "lesson"` and `requires_human_approval: true` — always; no lesson adopts itself.
6. Refuse to draft anything if the evidence is privacy-blocked, insufficient, or would require an auto-apply mechanism to be useful.
7. Hand off the sealed lesson `Proposal` to the Knowledge Review Agent / Human Approval Gate only through the Harness — the identical downstream path as any other proposal.

## 6. Input Schema

Primary shape: the `input` object of [learning-agent.schema.json](../../schemas/agents/learning-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `learning_objective` | string | yes | The scoped question driving this learning pass. |
| `evidence_refs` | array, minItems 1 | yes | References to outcome/feedback material (audit summaries, corrections, eval results). |

## 7. Output Schema

Primary shape: [proposal.schema.json](../../schemas/artifacts/proposal.schema.json), with `kind` fixed to `"lesson"` by this contract's convention.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `kind` | must be `"lesson"` | yes | This agent's sole permitted value for this field. |
| `pain_statement` | string (minLength 1) | yes | The operational pain the lesson addresses (e.g., a recurring failure class). |
| `options` | array, minItems 1 | yes | Candidate lesson adoptions, each with `option_id`, `summary`, `tradeoffs`, optional `recommended`. |
| `success_metrics` | array, minItems 1 | yes | Measurable — e.g., "recurrence of failure class X drops by Y% within Z runs." |
| `non_goals` | array of string | yes | What this lesson explicitly does not attempt to fix. |
| `citations` | array of `{citation_key, evidence_id, pointer?}` | yes | Must trace to the validated evidence bundle, never fabricated. |
| `requires_human_approval` | must be `true` | yes | Always — no exceptions for this agent. |
| `validation_report_ref` | object `{artifact_id, artifact_version}` | yes | Must reference a real `ValidationReport` produced over this evidence bundle (§10). |
| `risks` | array of string | no | |

`additionalProperties: false` — identical schema discipline to the Proposal Agent's output.

## 8. Accepted Artifact(s)

Run audit summaries, human corrections, and eval results — supplied as artifact refs in `evidence_refs`. Never raw, unvetted free text presented as ground truth.

## 9. Produced Artifact(s)

`Proposal` (`kind: "lesson"`) for review through the identical Stage 4 gate as any other proposal — or an explicit failure with an empty lesson set when evidence is insufficient. Never a direct behavioral/policy mutation.

## 10. Preconditions

1. `learning_objective` is present and scoped (not a blanket "make things better").
2. Every `evidence_refs[]` entry resolves to real material.
3. Privacy/policy review permits using this evidence bundle for learning purposes.
4. A `ValidationReport` exists (or can be produced by routing the evidence bundle through the Source Validation Agent's rubric) covering the evidence this lesson will cite — the agent must not proceed to draft without this reference resolvable.
5. No mechanism in this invocation's execution path can auto-apply a behavioral, prompt, or policy change.

## 11. Postconditions

1. Every citation in the lesson `Proposal` traces to an entry in the validated evidence bundle referenced by `validation_report_ref`.
2. `requires_human_approval` is `true`.
3. The adoption path for this lesson requires Knowledge Review Agent processing and Human Approval — identical to any other proposal; no shortcut exists.
4. No Constitution violation (privacy, ownership, security) is present in the lesson content.
5. `kind` is `"lesson"`.

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | `learning_objective` is non-empty and specific enough to be falsifiable. | Pre-execution |
| V2 | Every `evidence_refs[]` entry resolves; unresolvable entries block admission. | Pre-execution |
| V3 | A privacy/policy check clears the evidence bundle before any drafting occurs. | Pre-execution |
| V4 | `validation_report_ref` resolves to a real, sealed `ValidationReport` whose validated evidence set is the basis for this lesson's citations. | Pre-execution / Post-execution |
| V5 | `kind` is literally `"lesson"`. | Post-execution |
| V6 | `requires_human_approval` is literally `true`. | Post-execution |
| V7 | Every `citations[].evidence_id` corresponds to an `accepted` entry in the referenced `ValidationReport`. | Post-execution |
| V8 | `success_metrics` are measurable statements tied to a concrete, observable failure class or outcome. | Post-execution |
| V9 | No code path in this invocation writes to prompts, policy, or agent configuration directly. | Runtime (defense in depth) |

## 13. Workflow

1. **Bind / Admit** — Harness resolves contract + schema; checks Preconditions (§10).
2. **Scope objective** — Confirm `learning_objective` is specific and falsifiable; refine if the raw input is too broad, or fail closed if it cannot be scoped meaningfully.
3. **Resolve evidence** — Load every `evidence_refs[]` entry; verify resolvability and privacy/policy clearance.
4. **Validate evidence** — Route the evidence bundle through the Source Validation Agent's rubric-based judgment (reusing its contract and rubric machinery) to produce a genuine `ValidationReport` covering this evidence; obtain `validation_report_ref`.
5. **Draft lesson** — Using only `accepted` items from that `ValidationReport`, build `options[]` (candidate adoptions), `success_metrics[]`, `non_goals[]`, and `citations[]` with the same rigor as a Stage 3 proposal.
6. **Set flags** — `kind: "lesson"`, `requires_human_approval: true`.
7. **Emit candidate** — Submit the lesson `Proposal` payload for Harness `Validate`.
8. **Validate** — Harness checks schema validity, Postconditions (§11), Review Gate.
9. **Emit / Complete** — On pass, artifact is sealed and handed to the Knowledge Review Agent / Human Approval Gate — identical downstream path to a Stage 3 proposal. On fail, invocation transitions `FAILED` per §19.

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| Evidence bundle clearly supports one lesson with measurable impact | Draft it with `recommended: true` on the corresponding option | Standard case |
| Evidence is suggestive but not conclusive | Draft the lesson with explicit uncertainty in `risks[]`, without forcing a `recommended` pick | Honest signal, matches Proposal Agent discipline |
| Evidence bundle is privacy-blocked | Fail closed with `PRIVACY_BLOCK`, emit nothing | Never learn from data policy forbids using |
| Evidence is insufficient to support any falsifiable lesson | Fail closed with `INSUFFICIENT_EVIDENCE`, reject with an empty lesson set | An unfounded lesson is worse than no lesson |
| A prior lesson on the same failure class already exists and was rejected with no new evidence | Do not redraft an identical lesson; fail closed or note the prior rejection in context | Avoid re-litigating without new basis |
| Drafting logic finds a shortcut that would apply the lesson without Human Approval | Refuse; treat as `AUTO_APPLY_ATTEMPT` and fail closed immediately | Absolute rule — no exceptions |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture

```json
{
  "contract_version": "1.0.0",
  "input": {
    "learning_objective": "Determine why Knowledge Graph Agent identity-collision escalations increased from 1/week to 6/week over the last month.",
    "evidence_refs": [
      { "artifact_id": "art_audit-summary_0301", "artifact_version": "1.0.0", "artifact_type": "AuditSummary" },
      { "artifact_id": "art_human-correction_0044", "artifact_version": "1.0.0", "artifact_type": "HumanCorrection" }
    ]
  },
  "output": {
    "kind": "lesson",
    "pain_statement": "Knowledge Graph Agent identity-collision escalations rose 6x in one month, consuming disproportionate human-adjudication time and delaying Stage 6 completion for affected runs.",
    "options": [
      {
        "option_id": "opt_tighten_identity_key",
        "summary": "Tighten the ontology profile's canonical identity-key rules to reduce ambiguous matches, based on the pattern observed across 6 escalated cases.",
        "tradeoffs": "May increase the rate of legitimate distinct entities being flagged as near-duplicates initially, requiring a brief tuning period.",
        "recommended": true
      }
    ],
    "success_metrics": [
      "Identity-collision escalations return to ≤1/week within four weeks of adoption"
    ],
    "non_goals": [
      "Does not change the Embedding Agent's chunking strategy"
    ],
    "citations": [
      { "citation_key": "cite_audit_0301", "evidence_id": "ev_audit_0301_01" }
    ],
    "requires_human_approval": true,
    "validation_report_ref": { "artifact_id": "art_validation-report_0301", "artifact_version": "1.0.0" },
    "risks": [
      "Root cause may be a recent ontology profile change rather than the identity-key rules themselves; recommend monitoring after adoption."
    ]
  }
}
```

## 16. Artifact Examples

Fully sealed lesson `Proposal`:

```json
{
  "artifact_id": "art_proposal_0301_lesson",
  "artifact_version": "1.0.0",
  "artifact_type": "Proposal",
  "run_id": "run_9f3e2d1c-learning-0301",
  "produced_by": "learning-agent",
  "created_at": "2026-07-22T10:02:55Z",
  "digest": "sha256:708192a3b4c5d6e7f809102b3c4d5e6f708192a3b4c5d6e7f8091023c4d5e6f",
  "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" },
  "schema_version": "1.0.0",
  "payload": {
    "kind": "lesson",
    "pain_statement": "Knowledge Graph Agent identity-collision escalations rose 6x in one month.",
    "options": [{ "option_id": "opt_tighten_identity_key", "summary": "Tighten canonical identity-key rules.", "tradeoffs": "Initial tuning period needed.", "recommended": true }],
    "success_metrics": ["Escalations return to ≤1/week within four weeks"],
    "non_goals": ["Does not change Embedding Agent chunking"],
    "citations": [{ "citation_key": "cite_audit_0301", "evidence_id": "ev_audit_0301_01" }],
    "requires_human_approval": true,
    "validation_report_ref": { "artifact_id": "art_validation-report_0301", "artifact_version": "1.0.0" },
    "risks": ["Root cause may be an ontology profile change, not the identity-key rules"]
  },
  "parents": [
    { "artifact_id": "art_validation-report_0301", "artifact_version": "1.0.0", "artifact_type": "ValidationReport" }
  ]
}
```

## 17. Examples (Scenarios)

**Scenario A — Clear lesson.** Evidence strongly supports one root cause and one remedial option; lesson drafted with a `recommended` option, measurable metric, proceeds to Human Review identically to a knowledge proposal.

**Scenario B — Privacy block.** `evidence_refs` includes a human correction log containing customer PII not cleared for learning-purpose reuse under current policy. Agent fails closed with `PRIVACY_BLOCK` before any drafting occurs — it does not attempt to redact and proceed unilaterally.

**Scenario C — Insufficient evidence.** Only one weak, uncorroborated data point exists for a suspected pattern. Agent fails closed with `INSUFFICIENT_EVIDENCE` rather than draft a speculative lesson.

**Scenario D — Auto-apply temptation refused.** A hypothetical shortcut would let the lesson directly adjust an ontology profile's threshold config without Human Approval. Agent refuses this path outright — `AUTO_APPLY_ATTEMPT` — and instead drafts the lesson as a normal `Proposal` awaiting Stage 4 approval like any other change.

## 18. Acceptance Criteria

- [ ] Schema-valid against [proposal.schema.json](../../schemas/artifacts/proposal.schema.json) with `kind: "lesson"`.
- [ ] `validation_report_ref` resolves to a genuine `ValidationReport`, never fabricated.
- [ ] Every citation traces to `accepted` evidence in that report.
- [ ] `requires_human_approval` is `true`.
- [ ] No auto-apply mechanism present anywhere in the execution path.
- [ ] Privacy/policy clearance obtained before drafting.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `INSUFFICIENT_EVIDENCE` | Evidence bundle cannot support a falsifiable lesson. | Non-retryable |
| `PRIVACY_BLOCK` | Policy disallows using the evidence bundle for learning. | Non-retryable |
| `AUTO_APPLY_ATTEMPT` | Any code path in this invocation would apply the lesson without Human Approval. | Non-retryable, escalate (critical) |
| `POLICY_DENY` | Tenancy/approver-policy resolution fails at Admit. | Non-retryable |
| `VALIDATION_REPORT_UNAVAILABLE` | Evidence bundle cannot be routed to a validation pass (rubric unresolved, upstream Source Validation Agent failure). | Non-retryable |
| `TRANSIENT_COMPUTE_ERROR` | Drafting compute call errors transiently. | Retryable (bounded) |

**Failure Cases (narrative):**

- If `evidence_refs` mixes clearable and non-clearable material, the agent must fail `PRIVACY_BLOCK` for the whole bundle unless it can cleanly exclude the blocked material and still meet the falsifiability bar with what remains — partial evidence use must be explicit, never a silent drop.
- `AUTO_APPLY_ATTEMPT` is treated with the same severity as a Human Approval boundary breach anywhere else in the system — it is a critical, escalated failure, not routine.

## 20. Forbidden Behaviors

1. **Never auto-apply a behavioral, prompt, or policy change.**
2. **Never fabricate a `validation_report_ref`** — it must point to a real, sealed `ValidationReport`.
3. **Never use privacy-blocked evidence**, even partially, without explicit exclusion and disclosure.
4. **Never set `requires_human_approval` to anything other than `true`.**
5. **Never cite evidence that was not `accepted`** in the referenced `ValidationReport`.
6. **Never bypass Knowledge Review** — lessons take the identical Stage 4 path as knowledge proposals.
7. **Never re-draft an already-rejected lesson** on identical evidence without new material justifying reconsideration.

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Transient compute (`TRANSIENT_COMPUTE_ERROR`) | 2 | Exponential with jitter | |
| Privacy/auto-apply/insufficient-evidence/policy/validation-unavailable (`PRIVACY_BLOCK`, `AUTO_APPLY_ATTEMPT`, `INSUFFICIENT_EVIDENCE`, `POLICY_DENY`, `VALIDATION_REPORT_UNAVAILABLE`) | 0 | n/a | Fail closed immediately. |

## 22. Retry Examples

**Example 1 — Transient drafting error recovered.** Attempt 1's option-drafting compute call errors transiently. Harness retries attempt 2 after backoff; attempt 2 succeeds, producing a complete lesson draft. Total attempts: 2 of 2.

**Example 2 — No retry on privacy block.** Attempt 1 detects PII in one of the `evidence_refs` entries not cleared for learning use. `PRIVACY_BLOCK` fires immediately with 0 retries; this cannot be resolved by retrying the identical invocation — it requires either a policy exception (with Decision Log entry per Constitution Article IX) or a revised evidence bundle excluding the blocked material.

**Example 3 — Repeated insufficient-evidence quarantine.** A recurring cron-style learning objective is resubmitted weekly and fails `INSUFFICIENT_EVIDENCE` three weeks in a row because the underlying failure class simply has not recurred enough to support a lesson yet. Per Harness §7 Rule 5, if this becomes an identical repeat failure pattern, it should be quarantined/paused rather than run on a fixed schedule indefinitely — a human should decide whether to lower the evidence bar, broaden the objective, or stop the periodic run.

## 23. Error Recovery Procedures

1. **On `TRANSIENT_COMPUTE_ERROR`:** Retry per §21; on exhaustion, `FAILED` + Notification Agent alert.
2. **On `PRIVACY_BLOCK`:** Fail closed; escalate to the policy owner for an explicit, logged exception decision, or await a revised evidence bundle excluding blocked material.
3. **On `AUTO_APPLY_ATTEMPT`:** Immediate fail-closed, immediate critical escalation, and incident review of the code path that produced the attempt — this must never be treated as routine.
4. **On `VALIDATION_REPORT_UNAVAILABLE`:** Fail closed; the evidence bundle must first successfully pass through a validation rubric pass before a lesson can be drafted — escalate to whoever owns the evidence-validation routing if this fails repeatedly.
5. **On `INSUFFICIENT_EVIDENCE`:** Fail closed with an empty lesson set; this is a valid, honest terminal outcome, not necessarily an error requiring escalation, unless it repeats identically per Harness quarantine rules.

## 24. Best Practices

- Scope `learning_objective` to a single falsifiable question per invocation rather than a broad "improve everything" mandate.
- Route evidence through the same rigor as Stage 2 validation — a lesson is only as trustworthy as the evidence backing it.
- Disclose uncertainty in `risks[]` generously; lessons about system behavior are often less clear-cut than knowledge proposals.
- Prefer fewer, well-evidenced lessons over frequent, thin ones — noise erodes trust in the learning loop.

## 25. Anti-patterns

- **Silent auto-tuning:** any mechanism that nudges configuration based on outcomes without going through this contract and Human Approval.
- **Evidence laundering:** treating a `needs_human` or `rejected` evidence item as usable for a lesson's citations.
- **Objective creep:** starting from a narrow objective and drafting a sweeping, loosely-evidenced lesson.
- **Approval erosion:** treating repeated lesson rejections as a reason to eventually skip Human Review "since it always gets approved anyway."

## 26. Success Metrics

- **Lessons accepted that measurably improve defined evals** — the primary signal of learning-loop value.
- **Recurrence of the targeted failure class** after adoption (should trend down).
- **False lesson rate** — accepted lessons later found not to have addressed the real root cause.
- **Time from evidence availability to lesson proposal** — learning-loop latency.

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Articles II, III, VII, IX
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §9 Human Approval Gates
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md)
- [/artifacts/proposal.md](../../artifacts/proposal.md)
- [/contracts/agents/proposal-agent.md](./proposal-agent.md) — sibling contract for `kind: "knowledge"`/`"other"`
- [/contracts/agents/source-validation-agent.md](./source-validation-agent.md) — reused for evidence validation
- [/contracts/agents/knowledge-review-agent.md](./knowledge-review-agent.md) — downstream consumer contract

**End of Contract: Learning Agent v2.0.0**
