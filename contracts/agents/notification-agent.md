# Contract: Notification Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/notification-agent.schema.json](../../schemas/agents/notification-agent.schema.json)
**Artifact Schema:** None (this agent produces `NotificationReceipt[]`, not a Knowledge Plane SoR artifact — see §9)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Supporting agent (cross-cutting; observes every stage, does not replace one)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field remains the literal string `"1.0.0"` per the schema bundle's `const` constraint until an ADR revises it. All JSON examples below use `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Notification Agent is the Harness's only sanctioned voice to humans and external systems about run status, gate state, and failures. Its purpose is to deliver permissioned, low-noise, accurately-severity-labeled notifications — especially for Human Approval Gate events, where a missed or delayed notification directly threatens Constitution Article III's promise that consequential transitions get attributable human attention.

## 2. Scope

### 2.1 In Scope

- Consuming a Harness-originated `NotificationEvent` (`event_type`, `severity`, `audience`, `run_id`, optional `artifact_refs`, optional `channel_hints`).
- Resolving audience and channel authorization, applying redaction policy.
- Delivering, suppressing (with reason), or failing per channel, and reporting an honest receipt for each.
- Prioritizing critical/approval-blocking events for fastest delivery.

### 2.2 Out of Scope

- Inventing events. Every notification traces to a real Harness-emitted event; this agent never originates event content on its own initiative.
- Any Knowledge Plane write — this agent's output is operational signaling, never a Knowledge artifact.
- Approving, rejecting, or otherwise acting on behalf of a human — it only informs.
- Redacting so aggressively that a critical event becomes actionable-content-free (an empty "something happened" alert is a policy failure, not a safe default).

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Notification Event** | The Harness-authenticated input describing what happened: `event_type`, `severity`, `audience`, `run_id`, optional `artifact_refs` (by id only, never inline sensitive payload), optional `channel_hints`. |
| **Receipt** | `{channel, status, detail?}` — the per-channel outcome: `delivered`, `suppressed`, or `failed`. |
| **Audience** | The list of recipient identities/groups authorized to receive this event. |
| **Channel** | A delivery mechanism (e.g., email, chat webhook, in-app) resolved from `channel_hints` and audience preferences, filtered by authorization. |
| **Redaction Policy** | The rule set determining what content may leave the Harness/Knowledge boundary onto a given channel — sensitive payload is stripped, references remain as ids only. |
| **Suppression** | A deliberate, policy-driven non-delivery (e.g., duplicate-event debouncing, audience opted out) — always recorded with a `detail` reason, never a silent drop. |

## 4. Role

Deliver permissioned, low-noise notifications for run status, gates, and failures. Does not invent events, does not act on behalf of humans, and never leaks sensitive payload onto an insecure channel.

## 5. Responsibilities

1. Verify the event source is the authenticated Harness — never accept or synthesize an event from any other origin.
2. Resolve `audience` against current authorization; drop unauthorized recipients from delivery, not from the receipt record (report them as suppressed with reason).
3. Resolve `channel_hints` to actual channels, respecting per-recipient channel preferences and policy.
4. Apply redaction policy to any content derived from `artifact_refs` before it reaches a channel — reference by id, never inline sensitive fields.
5. Prioritize `critical` and Human-Approval-Gate-related events for fastest delivery and least suppression tolerance.
6. Report an honest `receipt` per channel: `delivered`, `suppressed` (with reason), or `failed` (with reason) — never silently drop a channel from the receipt set.
7. Escalate (retry harder, widen channels) when a critical approval-blocking event's initial delivery attempts fail.

## 6. Input Schema

Primary shape: the `input` object of [notification-agent.schema.json](../../schemas/agents/notification-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `event_type` | string | yes | Harness-defined event name (e.g., `human_approval_requested`, `stage_failed`, `run_succeeded`). |
| `severity` | `low`\|`medium`\|`high`\|`critical` | yes | |
| `audience` | array of string | yes | Recipient identities/groups. |
| `run_id` | string | yes | Originating pipeline run. |
| `artifact_refs` | array | no | Referenced by id only. |
| `channel_hints` | array of string | no | Preferred channels; not a guarantee if policy overrides. |

## 7. Output Schema

Primary shape: the `output` object of [notification-agent.schema.json](../../schemas/agents/notification-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `receipts` | array, each `{channel, status, detail?}` | yes | One entry per channel actually considered for delivery. |
| `receipts[].channel` | string | yes | |
| `receipts[].status` | `delivered`\|`suppressed`\|`failed` | yes | |
| `receipts[].detail` | string | no | Reason, especially required in practice for `suppressed`/`failed`. |

This output is **not** validated against `/schemas/artifacts` and is **not** enveloped as a Knowledge Plane artifact — see §9.

## 8. Accepted Artifact(s)

Harness events (`human_approval_requested`, `stage_failed`, `run_succeeded`, and similarly-defined event types); may reference sealed artifacts by id only, never by inline content.

## 9. Produced Artifact(s)

**None for the Knowledge Plane.** This agent's `NotificationReceipt[]` output is an operational side-channel record, audited by the Harness, but it is explicitly not one of the eight `artifact_type` values in the [common artifact envelope](../../schemas/common/artifact-envelope.schema.json) (`ResearchReport`, `ValidationReport`, `Proposal`, `HumanReviewDecision`, `Knowledge`, `GraphUpdate`, `EmbeddingJob`, `MemoryUpdate`). Receipts are retained in the Audit Trail (Harness Specification §12), not sealed as a pipeline-stage deliverable.

## 10. Preconditions

1. Event source is authenticated as the Harness (never a freestanding call).
2. `audience` and requested channels resolve against current authorization policy.
3. Redaction policy is loaded and applicable to any `artifact_refs`-derived content.

## 11. Postconditions

1. Every audience/channel combination considered results in an explicit receipt: `delivered`, `suppressed`, or `failed` — never an unaccounted-for silent gap.
2. No sensitive payload appears on an insecure or unauthorized channel.
3. Critical events tied to a pending Human Approval Gate are never silently dropped without an escalation path being attempted.

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | Event source authentication check passes before any processing. | Pre-execution |
| V2 | Every `audience` entry is checked against authorization; unauthorized entries are excluded from delivery and recorded as `suppressed` with reason `unauthorized_recipient`. | Pre-execution / Post-execution |
| V3 | `artifact_refs` are never expanded into full artifact content on an unapproved channel — only ids and, where policy allows, minimal safe metadata. | Runtime |
| V4 | `severity: critical` events receive at least one delivery attempt on a high-reliability channel before any suppression is considered. | Runtime |
| V5 | Every channel actually attempted has exactly one corresponding `receipts[]` entry. | Post-execution |
| V6 | `status: suppressed` and `status: failed` entries carry a non-empty `detail`. | Post-execution |
| V7 | No receipt entry exists for a channel that was never actually attempted (no fabricated delivery claims). | Post-execution |

## 13. Workflow

1. **Bind / Admit** — Harness resolves contract + schema; checks event authentication (§10).
2. **Resolve audience** — Filter `audience` against authorization; record unauthorized entries for suppression accounting.
3. **Resolve channels** — Map `channel_hints` + recipient preferences + policy to a concrete channel list.
4. **Apply redaction** — Strip or summarize any `artifact_refs`-derived content per redaction policy before composing the message.
5. **Prioritize by severity** — For `critical` (and Human-Approval-Gate-related) events, select the fastest, most reliable channel(s) first.
6. **Deliver** — Attempt delivery per channel.
7. **Record receipts** — For each channel attempted: `delivered`, `suppressed` (with reason), or `failed` (with reason).
8. **Escalate on critical delivery failure** — If a `critical`/approval-blocking event fails on all attempted channels, widen to a fallback channel or alert an operator path per policy, rather than accepting silent failure.
9. **Emit** — Submit the `receipts[]` output. Harness records the full set in the Audit Trail.

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| Recipient is authorized and channel is available | `delivered` | Standard case |
| Recipient is not authorized for this event type/severity | `suppressed`, `detail: "unauthorized_recipient"` | Never deliver to an unauthorized audience member |
| Duplicate event within a debounce window (same `run_id` + `event_type`) | `suppressed`, `detail: "debounced_duplicate"` | Reduces noise without hiding the underlying event (the first delivery already occurred) |
| Channel transport error | `failed`, `detail` describing the transport error | Honest accounting; feeds retry policy |
| `severity: critical` and primary channel fails | Attempt fallback channel(s) before finalizing as `failed` | Critical events, especially approval-blocking ones, must not go unnoticed on a single channel outage |
| Redaction policy would strip so much content that the message becomes meaningless for a `critical` event | Escalate to a safe-but-informative summary rather than a content-free "something happened" — never suppress the whole event silently | An uninformative critical alert is nearly as bad as no alert |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture

```json
{
  "contract_version": "1.0.0",
  "input": {
    "event_type": "human_approval_requested",
    "severity": "high",
    "audience": ["approver_group_knowledge_eng"],
    "run_id": "run_2b7f1c9e-know-ingest-0142",
    "artifact_refs": [
      { "artifact_id": "art_proposal_0142", "artifact_version": "1.0.0", "artifact_type": "Proposal" }
    ],
    "channel_hints": ["chat_webhook", "email"]
  },
  "output": {
    "receipts": [
      { "channel": "chat_webhook", "status": "delivered", "detail": "Delivered to #knowledge-review at 2026-07-22T09:33:01Z" },
      { "channel": "email", "status": "suppressed", "detail": "unauthorized_recipient: audience member has not opted into email for this event_type" }
    ]
  }
}
```

### 15.2 Critical Event, Escalated Fallback

```json
{
  "receipts": [
    { "channel": "chat_webhook", "status": "failed", "detail": "transport_error: webhook endpoint returned 503 after 3 attempts" },
    { "channel": "sms_fallback", "status": "delivered", "detail": "Escalated to SMS fallback channel per critical-severity policy after primary channel failure" }
  ]
}
```

## 16. Artifact Examples

Because this agent's output is not a Knowledge Plane artifact, there is no sealed envelope to show. Instead, the canonical record is the **Audit Trail event** the Harness attaches to the run (Harness Specification §12):

```json
{
  "event_id": "evt_7a8b9c0d",
  "timestamp": "2026-07-22T09:33:02Z",
  "run_id": "run_2b7f1c9e-know-ingest-0142",
  "stage": "human_review",
  "agent": "notification-agent",
  "invocation_id": "inv_0142_notify_01",
  "from_state": "RUNNING",
  "to_state": "SUCCEEDED",
  "artifact_refs": [{ "artifact_id": "art_proposal_0142", "artifact_version": "1.0.0", "artifact_type": "Proposal" }],
  "decision": "notified",
  "actor": "agent",
  "severity": "high",
  "details_digest": "sha256:8091023c4d5e6f708192a3b4c5d6e7f809102b3c4d5e6f708192a3b4c5d6e70"
}
```

## 17. Examples (Scenarios)

**Scenario A — Clean approval notification.** A Human Approval Gate opens; audience is the eligible approver group; chat webhook delivers successfully; receipt recorded; approvers see the pending package promptly.

**Scenario B — Partial suppression.** Some audience members have not opted into a given channel for this `event_type`. Their entries are `suppressed` with `unauthorized_recipient`/`opted_out` detail — not silently dropped from the receipt set.

**Scenario C — Critical failure escalation.** A `stage_failed` event at `severity: critical` fails on the primary chat channel due to an outage. Agent escalates to an SMS fallback channel per policy and records both the `failed` primary attempt and the `delivered` fallback attempt.

**Scenario D — Debounced duplicate.** The Harness emits the same `stage_failed` event twice within a 30-second debounce window due to a retry-loop edge case upstream. The second event's channel entries are recorded `suppressed` with `debounced_duplicate` — the first notification already informed the audience.

## 18. Acceptance Criteria

- [ ] Every considered channel has exactly one receipt.
- [ ] No sensitive payload appears on an unauthorized/insecure channel.
- [ ] `critical` and approval-blocking events attempt at least one high-reliability channel, with fallback on failure.
- [ ] `suppressed`/`failed` receipts carry a substantive `detail`.
- [ ] No event content was invented — every notification traces to a real Harness event.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `UNAUTHENTICATED_EVENT` | Event source is not the authenticated Harness. | Non-retryable |
| `CHANNEL_DENIED` | All resolved channels are denied by policy for this event/audience combination. | Non-retryable |
| `REDACTION_FAIL` | Redaction policy cannot be applied (missing rule, malformed policy) and unredacted content would otherwise be sent. | Non-retryable, fail closed on that channel |
| `AUDIENCE_UNKNOWN` | `audience` entries do not resolve to any known identity/group. | Non-retryable |
| `TRANSIENT_CHANNEL_ERROR` | A specific channel's transport fails transiently (timeout, 5xx). | Retryable (bounded), then escalate |

**Failure Cases (narrative):**

- `REDACTION_FAIL` on one channel does not necessarily fail the whole invocation — other channels with successfully-applied redaction may still deliver; the failed channel's receipt records `failed` with `detail: "redaction_fail"`, and if that was the *only* viable channel for a critical event, the invocation escalates per §23.
- `AUDIENCE_UNKNOWN` for a subset of `audience` entries does not block delivery to the remainder; only the unresolvable entries are excluded, and this is reported per-entry where the receipt model supports it (channel-level, since receipts are keyed by channel, not by individual recipient — the detail field carries recipient-level nuance).

## 20. Forbidden Behaviors

1. **Never invent or embellish an event** — content must trace to the actual Harness-emitted event.
2. **Never send unredacted sensitive payload** on any channel, regardless of urgency.
3. **Never silently drop a channel from the receipt set** — every attempted channel gets a receipt.
4. **Never act on behalf of a human** (e.g., auto-acknowledging an approval request).
5. **Never suppress a critical/approval-blocking event without attempting an escalation path.**
6. **Never accept an event from an unauthenticated or non-Harness source.**
7. **Never deliver to a recipient outside the resolved, authorized `audience`.**

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Transient channel (`TRANSIENT_CHANNEL_ERROR`) | 5 | Exponential with jitter | Higher ceiling than most agents — notification delivery reliability matters disproportionately for approval-critical events. |
| Auth/redaction/deny (`UNAUTHENTICATED_EVENT`, `CHANNEL_DENIED`, `REDACTION_FAIL`, `AUDIENCE_UNKNOWN`) | 0 | n/a | Fail closed immediately on that channel/event. |

## 22. Retry Examples

**Example 1 — Channel flakiness recovered.** Attempts 1–3 of a chat webhook delivery fail with transient 502s. Attempt 4 succeeds after cumulative backoff. Total attempts: 4 of 5 allowed. Receipt records `delivered` with the successful attempt's timestamp; the Audit Trail separately records all 4 attempts.

**Example 2 — All channel retries exhausted, fallback escalation.** All 5 attempts on the primary chat webhook fail for a `critical` `human_approval_requested` event. Per §14's decision rule, the agent escalates to a fallback SMS channel rather than reporting a bare `failed` — the fallback delivery succeeds on its first attempt. Final receipts: primary channel `failed` (5 attempts exhausted), fallback channel `delivered` (1 attempt).

**Example 3 — No retry on denied channel.** A `channel_hints` entry requests a channel that policy has denied outright for this tenant (e.g., an unapproved third-party integration). `CHANNEL_DENIED` fires immediately with 0 retries for that channel; other resolved channels proceed normally and are unaffected.

## 23. Error Recovery Procedures

1. **On `TRANSIENT_CHANNEL_ERROR`:** Retry per §21; on exhaustion, escalate to a fallback channel if one exists for this severity tier; if no fallback exists and the event was critical/approval-blocking, this is treated as an incident requiring operator attention (the pipeline's Human Approval Gate may otherwise silently stall with no one aware).
2. **On `UNAUTHENTICATED_EVENT`:** Fail closed immediately; this indicates either a Harness defect or a spoofing attempt — treat as a security-relevant incident per Constitution Article IX.
3. **On `CHANNEL_DENIED` (all channels):** Fail closed for this event; escalate to the audience's channel-policy owner so authorized channels can be configured before the next event of this type.
4. **On `REDACTION_FAIL`:** Do not send unredacted content under any circumstance; fail that channel closed and escalate to the redaction-policy owner; attempt any remaining channels with working redaction independently.
5. **On `AUDIENCE_UNKNOWN` (all entries):** Fail closed; escalate to identity/audience-configuration owners — this typically indicates a stale or misconfigured audience group reference upstream.

## 24. Best Practices

- Reserve the highest retry ceiling and fallback escalation specifically for `critical` and approval-blocking event types — routine `low`/`medium` events do not need the same reliability investment.
- Keep `detail` fields specific enough that an on-call engineer can act without needing to reconstruct context from the Audit Trail alone.
- Debounce duplicates deliberately and visibly (`suppressed` with reason) rather than either spamming recipients or silently eating events.
- Treat redaction as a first-class step, not an afterthought bolted onto message composition.

## 25. Anti-patterns

- **Alert fatigue by omission:** suppressing so many low-severity events without disclosure that recipients stop trusting the channel, or so few that critical events get lost in noise.
- **Over-redaction:** stripping a critical event down to a content-free "something happened," defeating the purpose of the alert.
- **Fallback neglect:** never configuring or attempting a fallback channel for critical events, leaving a single point of failure.
- **Silent gaps:** any receipt set that does not account for every channel actually attempted.

## 26. Success Metrics

- **Delivery success rate**, especially for `critical`/approval-blocking events (target: as close to 100% as fallback design allows).
- **Time-to-notify** for approval-critical events (SLA-bound).
- **Noise ratio** — suppressed/low-value notifications relative to total (should trend toward meaningful signal).
- **Sensitive-leak incidents** — target: 0, always.

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Articles III, IX
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §9 Human Approval Gates, §12 Audit Trail
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Cross-Cutting Gates
- [/contracts/agents/knowledge-review-agent.md](./knowledge-review-agent.md) — primary source of critical approval events
- [/contracts/agents/memory-agent.md](./memory-agent.md) — sibling supporting-agent contract

**End of Contract: Notification Agent v2.0.0**
