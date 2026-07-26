# Contract: Memory Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/memory-agent.schema.json](../../schemas/agents/memory-agent.schema.json)
**Artifact Schema:** [/schemas/artifacts/memory-update.schema.json](../../schemas/artifacts/memory-update.schema.json)
**Artifact Spec:** [/artifacts/memory-update.md](../../artifacts/memory-update.md)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Skills:** [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) §5.14 Memory Update
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 8 (Memory)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md) — Article X (Local-First Knowledge Ownership)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field remains the literal string `"1.0.0"` per the schema bundle's `const` constraint until an ADR revises it. All JSON examples below use `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Memory Agent is the last stage of the canonical pipeline and the sole gatekeeper of working-vs-durable memory transactions. Its purpose is to prevent every one of DYOGAS's most dangerous memory failure modes at once: covert per-agent durable stores, unauthorized persistence of material knowledge-linked memory, silent partial forgets, and cross-tenant recall — while still letting a pipeline run leave behind exactly the durable trace it was authorized to leave.

## 2. Scope

### 2.1 In Scope

- Executing exactly one declared `op` (`stage`, `persist`, `forget`, `seal`, `recall`) per invocation, scoped to `source_refs` and a `retention_policy_id`.
- Requiring a valid `apply_token` for any `persist` of material knowledge-linked memory when policy demands one.
- Reporting `result` (`succeeded`, `denied`, `partial`) with full honesty, including incomplete forget accounting.
- Discarding working memory ("staged" but not persisted) at run end unless a `persist`/`seal` op explicitly authorized retention.

### 2.2 Out of Scope

- Creating a parallel Knowledge Plane SoR. Memory Agent transactions never substitute for sealed `Knowledge`, `GraphUpdate`, or `EmbeddingJob` artifacts — it operates alongside them, never instead of them.
- Approving its own persist operations — the `apply_token` it may require comes from the Human Approval Gate, not from itself.
- Cross-tenant recall or persistence of any kind, under any policy configuration this contract recognizes.

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Memory Op** | One of five declared operations: `stage` (working, ephemeral), `persist` (durable write), `forget` (durable delete), `seal` (freeze against further mutation), `recall` (read for reuse). |
| **Working Memory** | Ephemeral, run-scoped context that is discarded at run end unless explicitly persisted. |
| **Durable Memory** | Retained beyond the run, subject to `retention_policy_id`, and — for material knowledge-linked memory — subject to Human Approval Gate authorization via `apply_token`. |
| **Retention Policy** | A named, versioned (`retention_policy_id`) rule set governing how long, where, and under what conditions a memory persists, and how it may eventually be forgotten. |
| **Incomplete Forget** | A `forget` operation that could not remove every targeted `memory_id` (e.g., a replicated store lagging behind) — must be reported explicitly via `incomplete_forget_ids`, never presented as a full success. |
| **Seal (memory)** | Freezing a durable memory record against further mutation, analogous to artifact sealing but scoped to the memory layer. |

## 4. Role

Govern working vs. durable memory transactions. Prevents covert per-agent durable stores and ensures memory persistence follows the same authorization discipline as any other Knowledge Plane mutation.

## 5. Responsibilities

1. Accept exactly one `op` per invocation and execute only that operation — no bundling of, e.g., a `persist` and a `forget` in a single call.
2. Verify tenancy and retention policy resolve before any transaction executes.
3. Require and validate a genuine, unconsumed `apply_token` for any `persist` of material knowledge-linked memory when policy requires one — never persist such memory on a missing or invalid token.
4. Report `result` honestly: `succeeded`, `denied`, or `partial` — never round a partial or denied outcome up to success.
5. For `forget`, attempt removal of every targeted memory id and report any that could not be removed via `incomplete_forget_ids` — never claim a full forget that did not fully happen.
6. Discard all working (`stage`) memory at run end unless a subsequent `persist`/`seal` op explicitly retains it.
7. Refuse any operation that would cross a `tenant_id` boundary, for either read (`recall`) or write (`persist`/`forget`/`seal`).
8. Emit the sealed `MemoryUpdate` as the terminal record of the canonical pipeline for this run, through the Harness only.

## 6. Input Schema

Primary shape: the `input` object of [memory-agent.schema.json](../../schemas/agents/memory-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `op` | `stage`\|`persist`\|`forget`\|`seal`\|`recall` | yes | Exactly one operation per invocation. |
| `source_refs` | array | yes | Artifacts this operation concerns (e.g., sealed `Knowledge`, `EmbeddingJob`, or memory ids for `forget`/`recall`). |
| `retention_policy_id` | string | yes | Governing retention policy. |
| `apply_token` | string | no (required in practice for policy-gated `persist`) | Single-use token bound to the authorizing `HumanReviewDecision`. |

## 7. Output Schema

Primary shape: [memory-update.schema.json](../../schemas/artifacts/memory-update.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `op` | `stage`\|`persist`\|`forget`\|`seal`\|`recall` | yes | Echoes input. |
| `result` | `succeeded`\|`denied`\|`partial` | yes | Must reflect actual outcome. |
| `memory_ids` | array of string | yes | Resulting/affected memory ids; may be empty for a fully `denied` result. |
| `retention_policy_id` | string | yes | Echoes input. |
| `source_refs` | array of `{artifact_id, artifact_version, artifact_type?}` | yes | Echoes input, fully resolved. |
| `denial_reason` | string | no | Present when `result: denied`. |
| `incomplete_forget_ids` | array of string | no | Present when a `forget` op is `partial`. |

`additionalProperties: false` throughout.

## 8. Accepted Artifact(s)

Pipeline context artifacts as declared by the Memory stage — typically sealed `Knowledge` plus completed `EmbeddingJob` (and optionally `GraphUpdate`), or memory ids directly for `forget`/`recall` operations.

## 9. Produced Artifact(s)

`MemoryUpdate` — immutable once sealed. Terminal record for the canonical pipeline run; consumed by the Audit Trail and by future runs' `recall` operations — never a parallel Knowledge SoR.

## 10. Preconditions

1. `op` is one of the five declared values and is permitted by the current stage/policy context (e.g., a `persist` of material knowledge-linked memory is only permitted where the pipeline's Memory stage is configured to allow it).
2. For a `persist` requiring authorization, `apply_token` is present, valid, bound to the correct subject, unexpired, and unconsumed.
3. `retention_policy_id` resolves to an active policy.
4. Tenancy of every `source_refs` entry matches the invocation's tenancy.

## 11. Postconditions

1. `result` is explicit and accurate — `succeeded`, `denied`, or `partial`, never optimistically rounded.
2. `forget` reports every `memory_id` that could not be removed via `incomplete_forget_ids` — a `forget` with any incomplete id is `partial`, not `succeeded`.
3. An audit event is emitted for the transaction regardless of outcome.
4. No duplicate SoR is created in the memory layer — memory never becomes a second canonical record competing with `Knowledge`.
5. `persist` without a valid required token results in `result: denied` with `denial_reason` populated — never a silent partial-persist.

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | `op` is exactly one of the five enum values. | Pre-execution |
| V2 | `retention_policy_id` resolves to an active policy. | Pre-execution |
| V3 | `persist` of material knowledge-linked memory without a valid `apply_token` (when policy requires one) is denied at Admit, not attempted. | Pre-execution |
| V4 | Every `source_refs` entry's tenancy matches the invocation's tenancy — cross-tenant references block admission. | Pre-execution |
| V5 | `forget` targets are enumerated explicitly (no wildcard/blanket forget without a bounded target list). | Pre-execution |
| V6 | Output `result: succeeded` for `forget` requires `incomplete_forget_ids` to be empty or absent. | Post-execution |
| V7 | Output `result: partial` for `forget` requires ≥1 entry in `incomplete_forget_ids`. | Post-execution |
| V8 | Output `result: denied` requires a non-empty `denial_reason`. | Post-execution |
| V9 | `stage` op never produces a `memory_ids` entry that survives past run end unless a subsequent `persist`/`seal` explicitly retains it. | Runtime |
| V10 | `seal` targets an already-existing memory id; sealing a non-existent id is a `denied` result, not a fabricated success. | Post-execution |

## 13. Workflow

1. **Bind / Admit** — Harness resolves contract + schema; checks Preconditions (§10), including token validation for policy-gated `persist`.
2. **Resolve op** — Dispatch to the single declared operation's logic.
3. **`stage`** — Write working memory scoped to the run; no durability guarantee beyond run end.
4. **`persist`** — Verify token (if required) is valid and unconsumed; write durable memory under `retention_policy_id`; mark token consumed on success.
5. **`forget`** — Attempt removal of every targeted memory id; track which succeeded and which did not.
6. **`seal`** — Freeze an existing durable memory record against further mutation; verify existence first.
7. **`recall`** — Read durable memory scoped strictly to the invocation's tenancy; never cross tenants regardless of what a caller requests.
8. **Assemble result** — Determine `result` (`succeeded`/`denied`/`partial`) honestly based on what actually happened.
9. **Emit candidate** — Submit `MemoryUpdate` payload for Harness `Validate`.
10. **Validate** — Harness checks schema validity, Postconditions (§11), Review Gate.
11. **Emit / Complete** — On pass, Harness seals the artifact as the run's terminal Memory-stage record. On fail, invocation transitions `FAILED` per §19.

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| `persist` requires a token and a valid one is presented | Proceed, consume token on success | Standard authorized case |
| `persist` requires a token and none/invalid is presented | `result: denied`, `denial_reason: "apply_token missing or invalid"` | Never persist material knowledge-linked memory without authorization |
| `forget` targets 10 ids, 10 succeed | `result: succeeded`, `incomplete_forget_ids` absent/empty | Clean full forget |
| `forget` targets 10 ids, 8 succeed, 2 lag in a replicated store | `result: partial`, `incomplete_forget_ids: [id_9, id_10]` | Never claim a full forget that did not fully happen |
| `recall` request's tenancy does not match the requester's tenancy | `result: denied`, `denial_reason: "tenancy_violation"` | Absolute isolation |
| `seal` targets a memory id that does not exist | `result: denied`, `denial_reason: "target_not_found"` | Never fabricate a successful seal of nothing |
| `stage` op completes at run end with no follow-up `persist`/`seal` | Working memory discarded; no `MemoryUpdate` claims durability | Default is ephemeral unless explicitly promoted |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture — `persist`

```json
{
  "contract_version": "1.0.0",
  "input": {
    "op": "persist",
    "source_refs": [
      { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0", "artifact_type": "Knowledge" },
      { "artifact_id": "art_embedding-job_0142", "artifact_version": "1.0.0", "artifact_type": "EmbeddingJob" }
    ],
    "retention_policy_id": "retention_policy_default_v2",
    "apply_token": "tok_4f8a9c2e-approved-0142-single-use"
  },
  "output": {
    "op": "persist",
    "result": "succeeded",
    "memory_ids": ["mem_0142_001", "mem_0142_002"],
    "retention_policy_id": "retention_policy_default_v2",
    "source_refs": [
      { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0", "artifact_type": "Knowledge" },
      { "artifact_id": "art_embedding-job_0142", "artifact_version": "1.0.0", "artifact_type": "EmbeddingJob" }
    ]
  }
}
```

### 15.2 Denied Persist (Missing Token)

```json
{
  "op": "persist",
  "result": "denied",
  "memory_ids": [],
  "retention_policy_id": "retention_policy_default_v2",
  "source_refs": [{ "artifact_id": "art_knowledge_0201", "artifact_version": "1.0.0", "artifact_type": "Knowledge" }],
  "denial_reason": "apply_token missing for persist of material knowledge-linked memory under policy retention_policy_default_v2, which requires human-approved authorization."
}
```

### 15.3 Partial Forget

```json
{
  "op": "forget",
  "result": "partial",
  "memory_ids": ["mem_0090_001", "mem_0090_002", "mem_0090_003"],
  "retention_policy_id": "retention_policy_default_v2",
  "source_refs": [{ "artifact_id": "art_memory-forget-request_0090", "artifact_version": "1.0.0", "artifact_type": "MemoryUpdate" }],
  "incomplete_forget_ids": ["mem_0090_004"]
}
```

## 16. Artifact Examples

Fully sealed `MemoryUpdate` for the `persist` example:

```json
{
  "artifact_id": "art_memory-update_0142",
  "artifact_version": "1.0.0",
  "artifact_type": "MemoryUpdate",
  "run_id": "run_2b7f1c9e-know-ingest-0142",
  "produced_by": "memory-agent",
  "created_at": "2026-07-22T09:55:40Z",
  "digest": "sha256:8091023c4d5e6f708192a3b4c5d6e7f809102b3c4d5e6f708192a3b4c5d6e70",
  "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" },
  "schema_version": "1.0.0",
  "payload": {
    "op": "persist",
    "result": "succeeded",
    "memory_ids": ["mem_0142_001", "mem_0142_002"],
    "retention_policy_id": "retention_policy_default_v2",
    "source_refs": [
      { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0", "artifact_type": "Knowledge" },
      { "artifact_id": "art_embedding-job_0142", "artifact_version": "1.0.0", "artifact_type": "EmbeddingJob" }
    ]
  },
  "parents": [
    { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0", "artifact_type": "Knowledge" },
    { "artifact_id": "art_embedding-job_0142", "artifact_version": "1.0.0", "artifact_type": "EmbeddingJob" }
  ]
}
```

## 17. Examples (Scenarios)

**Scenario A — Clean end-of-pipeline persist.** All eight canonical stages completed for this run; Memory Agent persists the sealed `Knowledge` + `EmbeddingJob` context with a valid token from the original Human Approval Gate decision. `result: succeeded`; run reaches terminal `SUCCEEDED`.

**Scenario B — Denied persist, missing token.** A misconfigured caller attempts `persist` without forwarding the `apply_token` from Stage 4's decision. Agent denies at Admit with an explicit `denial_reason` — no partial or "best effort" persist occurs.

**Scenario C — Partial forget.** A user-initiated forget request targets 4 memory ids; 3 are removed immediately, 1 lives in an eventually-consistent replica that has not yet caught up. Agent reports `result: partial` with `incomplete_forget_ids: ["mem_0090_004"]` — this is not treated as a failure requiring immediate retry, but it is never reported as a clean success either.

**Scenario D — Cross-tenant recall attempt.** A `recall` request's resolved context references a memory id belonging to a different tenant than the requester (a defect upstream). Agent denies with `tenancy_violation` rather than returning any content, and this is escalated as a security-relevant incident.

## 18. Acceptance Criteria

- [ ] Schema-valid against [memory-update.schema.json](../../schemas/artifacts/memory-update.schema.json).
- [ ] `result` accurately reflects the actual transaction outcome.
- [ ] `persist` never occurs without required authorization.
- [ ] `forget` never reports `succeeded` with any incomplete id.
- [ ] No cross-tenant read or write ever occurs.
- [ ] Working memory from `stage` never survives run end without an explicit `persist`/`seal`.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `POLICY_DENY` | `retention_policy_id` unresolved, or the requested op is not permitted by current stage/policy context. | Non-retryable |
| `TOKEN_INVALID` | `apply_token` missing, expired, already consumed, or not bound to the persisted subject when required. | Non-retryable |
| `TENANCY_VIOLATION` | Any `source_refs` entry or recall target crosses a tenancy boundary. | Non-retryable, escalate |
| `FORGET_PARTIAL` | A `forget` operation cannot remove every targeted id within this invocation's attempt window. | Retryable (bounded) for the incomplete subset; overall result reported as `partial`, not failed |
| `RETENTION_VIOLATION` | A `persist`/`seal` request would violate the resolved retention policy's constraints (e.g., retention window exceeds policy maximum). | Non-retryable |
| `TRANSIENT_LOCK` | The memory store is locked/contended during a transaction. | Retryable (bounded) |

**Failure Cases (narrative):**

- `FORGET_PARTIAL` is unusual among failure classes in this contract: it is not a hard failure of the invocation. The `MemoryUpdate` still emits successfully with `result: partial` and `incomplete_forget_ids` populated; the "failure" is scoped to the specific ids, and the Harness may schedule a follow-up `forget` invocation targeting only the remaining ids.
- A bypass attempt from another skill or agent trying to write durable memory outside this contract's `persist` path (e.g., a skill attempting a direct store write) must fail closed at the store/policy layer — this contract does not grant that path to anyone.

## 20. Forbidden Behaviors

1. **Never persist material knowledge-linked memory without a valid, required `apply_token`.**
2. **Never report a `forget` as fully `succeeded`** when any targeted id remains.
3. **Never read or write across a `tenant_id` boundary**, for any op.
4. **Never let working (`stage`) memory silently survive past run end** without an explicit `persist`/`seal`.
5. **Never create a second, competing Knowledge SoR** in the memory layer.
6. **Never accept a bypass write attempt from another skill or agent** outside this contract's declared ops.
7. **Never fabricate a `seal` success for a non-existent memory id.**
8. **Never reuse a consumed `apply_token`** for a second `persist`.

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Transient lock (`TRANSIENT_LOCK`) | 3 | Exponential with jitter | |
| Forget partial (`FORGET_PARTIAL`, for the remaining ids only) | 0 (within this invocation) | n/a | Reported as `partial`; a follow-up invocation targets the remainder — this is not a busy-retry within the same call. |
| Policy/token/tenancy/retention (`POLICY_DENY`, `TOKEN_INVALID`, `TENANCY_VIOLATION`, `RETENTION_VIOLATION`) | 0 | n/a | Fail closed immediately. |

## 22. Retry Examples

**Example 1 — Transient lock recovered.** Attempt 1 of a `persist` hits `TRANSIENT_LOCK` because a concurrent `forget` is mutating an overlapping memory namespace. Harness retries attempt 2 after backoff; attempt 2 succeeds once the lock clears. Total attempts: 2 of 3.

**Example 2 — Forget partial, follow-up invocation (not a retry).** A `forget` targeting 4 ids completes with 3 removed and 1 pending replication catch-up. The invocation itself is `SUCCEEDED` with `result: partial` — it is not retried. Separately, a **new** invocation is scheduled ~60 seconds later targeting only `mem_0090_004`; that new attempt succeeds and a second `MemoryUpdate` records the completion of the remainder.

**Example 3 — No retry on token reuse attempt.** A duplicate/replayed request attempts `persist` with an `apply_token` already marked consumed by an earlier successful `persist` in this run. `TOKEN_INVALID` fires immediately with 0 retries — this is treated as a double-apply attempt (Harness §9.3 Rule 3) and is escalated for investigation of the replay source.

## 23. Error Recovery Procedures

1. **On `TRANSIENT_LOCK`:** Retry per §21; on exhaustion, `FAILED` + Notification Agent alert to operators.
2. **On `TOKEN_INVALID`:** Fail closed; if the cause is genuine token expiry, the underlying `Proposal`/`Knowledge` must return through Stage 4 for a fresh approval before persistence can be retried with a new token.
3. **On `TENANCY_VIOLATION`:** Immediate fail-closed, immediate security-relevant incident escalation per Constitution Article IX — never treated as transient.
4. **On `FORGET_PARTIAL`:** Emit the `partial` result; schedule (via Harness policy, not a busy-loop) a follow-up `forget` invocation targeting only `incomplete_forget_ids`; escalate via Notification Agent if the remainder is not resolved within the retention policy's SLA for forget completion.
5. **On `RETENTION_VIOLATION`:** Fail closed; escalate to the retention-policy owner — the request itself must be revised (shorter retention, different policy) rather than retried unmodified.

## 24. Best Practices

- Treat `stage` as the default op for anything not explicitly authorized for durability — ephemeral-by-default is the safe posture.
- Always attempt full `forget` completion before reporting `partial`, and always schedule the remainder rather than treating a partial forget as "close enough."
- Keep `retention_policy_id` resolution strict — never fall back to a default policy silently when the requested one is unresolved.
- Log every `persist`/`forget`/`seal` transaction to the Audit Trail regardless of outcome, including denials.

## 25. Anti-patterns

- **Shadow persistence:** any code path that writes durable memory outside the `persist` op's authorization checks.
- **Forget theater:** reporting `succeeded` on a forget that left recoverable remnants in any store the agent is responsible for.
- **Tenancy shortcuts:** "just this once" cross-tenant recall for debugging or convenience.
- **Token laundering:** presenting a token minted for one proposal/approval pair against a different persist request.

## 26. Success Metrics

- **Unauthorized persist blocked rate** — target: 100%.
- **Forget completeness audits** — % of `forget` operations that reach full completion (including scheduled follow-ups) within policy SLA.
- **Recall precision** — correctness/tenancy-isolation of recall results (target: 0 cross-tenant incidents).
- **Duplicate-SoR incidents** — target: 0.

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Article X (Local-First Knowledge Ownership), Article IX (Security by Default)
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §5 Artifact Flow, §9 Human Approval Gates, §12 Audit Trail
- [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) — §5.14 Memory Update
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 8
- [/artifacts/memory-update.md](../../artifacts/memory-update.md)
- [/contracts/agents/embedding-agent.md](./embedding-agent.md) — upstream producer contract
- [/contracts/agents/knowledge-review-agent.md](./knowledge-review-agent.md) — original authorization source for `apply_token`

**End of Contract: Memory Agent v2.0.0**
