# Contract: Embedding Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/embedding-agent.schema.json](../../schemas/agents/embedding-agent.schema.json)
**Artifact Schema:** [/schemas/artifacts/embedding-job.schema.json](../../schemas/artifacts/embedding-job.schema.json)
**Artifact Spec:** [/artifacts/embedding-job.md](../../artifacts/embedding-job.md)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 7 (Embedding)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md) — Article XI (Cloud AI Compute Layer)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field remains the literal string `"1.0.0"` per the schema bundle's `const` constraint until an ADR revises it. All JSON examples below use `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Embedding Agent produces vector index jobs for approved knowledge so it can be retrieved semantically — without ever letting the index become a shadow source of truth. Its purpose is purely derivational and purely an index: every chunk is traceable to a sealed source artifact, every embedding call is policy-authorized Cloud AI Compute, and staleness is always explicit via `invalidations[]` rather than silently tolerated.

## 2. Scope

### 2.1 In Scope

- Consuming one or more sealed source artifacts (`Knowledge` primarily; `GraphUpdate` optionally) and an embedding `profile_id`.
- Producing a deterministic `chunk_map[]` per profile.
- Recording job `status` honestly (`queued`, `succeeded`, `failed`, `partial`).
- Emitting `invalidations[]` for vectors that are now stale because their source changed.

### 2.2 Out of Scope

- Any claim that the embedding index is itself a system of record — it is never treated as one.
- Approving or authorizing the Knowledge that is being embedded (that happened upstream).
- Retrieval-time ranking or answer synthesis — this contract governs job production only.
- Embedding content that has not been sealed (no embedding of drafts, candidates, or unsealed artifacts).

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Embedding Profile** | A named, versioned (`profile_id`) specification of model, chunking strategy, and dimensionality used to produce vectors. |
| **Chunk Map** | `chunk_map[]` — the deterministic mapping of `{chunk_id, source_artifact_id, span, vector_id?}` produced for a given profile and source set. |
| **Vector Id** | The identifier of a produced embedding vector in the index store; absent until the embedding call actually succeeds for that chunk. |
| **Invalidation** | `{vector_id, reason}` — an explicit notice that a previously produced vector is now stale (source superseded, profile retired) and should not be trusted for retrieval. |
| **Cloud AI Compute Layer** | The only approved execution venue for the heavy embedding model calls this agent depends on (Constitution Article XI). |
| **Status: partial** | Some chunks succeeded, some did not; the job must enumerate exactly which via `chunk_map` entries with/without `vector_id` plus explicit failure accounting — never a bare "mostly worked." |

## 4. Role

Produce embedding jobs for approved knowledge units. Vectors are indexes — never a system of record. This agent never asserts that an embedding is more authoritative than the sealed source it was derived from.

## 5. Responsibilities

1. Confirm every `source_refs[]` entry resolves to a sealed artifact with matching tenancy before requesting any embedding compute.
2. Resolve `profile_id` to an authorized, active profile; refuse an unauthorized or unknown profile.
3. Chunk source content deterministically per the profile's chunking strategy — the same source + profile must always yield the same `chunk_map` shape.
4. Invoke the Cloud AI Compute Layer only for authorized profiles and only after the Egress Gate for embedding compute has cleared.
5. Record `status` honestly, including `partial` when some but not all chunks succeeded.
6. Emit `invalidations[]` whenever this job supersedes vectors produced from an earlier version of the same source (or a retired profile).
7. Never embed unsealed, draft, or candidate content.
8. Hand off the sealed `EmbeddingJob` to the Memory Agent (Stage 8) only through the Harness.

## 6. Input Schema

Primary shape: the `input` object of [embedding-agent.schema.json](../../schemas/agents/embedding-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `source_refs` | array, minItems 1 | yes | Typically `{artifact_id, artifact_version, artifact_type}` entries referencing sealed `Knowledge` (primary) and optionally `GraphUpdate`. |
| `profile_id` | string | yes | Embedding profile to apply. |

## 7. Output Schema

Primary shape: [embedding-job.schema.json](../../schemas/artifacts/embedding-job.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `source_refs` | array, minItems 1, each `{artifact_id, artifact_version, artifact_type}` | yes | Echoes input, fully resolved. |
| `profile_id` | string | yes | Echoes input. |
| `chunk_map` | array of `{chunk_id, source_artifact_id, span, vector_id?}` | yes | May be empty only if `status: failed` and zero chunks were even attempted. |
| `status` | `queued`\|`succeeded`\|`failed`\|`partial` | yes | Must reflect actual outcome, never optimistically rounded up. |
| `invalidations` | array of `{vector_id, reason}` | yes | May be empty when nothing superseded. |

`additionalProperties: false` throughout.

## 8. Accepted Artifact(s)

`Knowledge` (primary, sealed); optional sealed `GraphUpdate`.

## 9. Produced Artifact(s)

`EmbeddingJob` — immutable once sealed. Consumed by the Memory Agent (Stage 8) and the retrieval/index subsystem (not the Knowledge Plane SoR).

## 10. Preconditions

1. Every `source_refs[]` entry resolves to a sealed artifact matching the invocation's tenancy.
2. `profile_id` resolves to an authorized, active profile for this tenant.
3. Egress policy allows Cloud AI Compute Layer calls for this profile and tenant.

## 11. Postconditions

1. `chunk_map` is deterministic given the same `source_refs` + `profile_id` (re-running produces the same chunk boundaries, modulo new `vector_id`s if re-embedded).
2. Model/profile provenance is recorded for every chunk (traceable to `profile_id`).
3. Stale vectors from a superseded source or retired profile are listed in `invalidations[]` — never silently left dangling.
4. No content SoR claim appears anywhere in the job's metadata — the index is explicitly non-authoritative.
5. `status` accurately reflects what happened; `partial` is used whenever some but not all chunks succeeded.

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | Every `source_refs[]` entry resolves to a sealed artifact; unresolvable entries block admission. | Pre-execution |
| V2 | `profile_id` is authorized for this tenant (not merely "exists" — must be explicitly granted). | Pre-execution |
| V3 | Chunking is deterministic: identical input source + profile yields identical `span` boundaries across runs. | Post-execution |
| V4 | Every `chunk_map[].source_artifact_id` corresponds to an entry in `source_refs`. | Post-execution |
| V5 | A chunk with a `vector_id` implies the embedding call for that chunk actually succeeded; a chunk without one implies it did not (yet, or permanently for a `failed` job). | Post-execution |
| V6 | `status: succeeded` requires every `chunk_map` entry to carry a `vector_id`. | Post-execution |
| V7 | `status: partial` requires at least one entry with a `vector_id` and at least one without. | Post-execution |
| V8 | `status: failed` requires zero entries with a `vector_id`. | Post-execution |
| V9 | Re-embedding a source whose prior version had vectors produces `invalidations[]` entries for those prior `vector_id`s with reason `"source_superseded"` (or equivalent). | Post-execution |
| V10 | No embedding call is made against an unsealed or non-`Knowledge`/`GraphUpdate` artifact type. | Runtime (EgressGate + type check) |

## 13. Workflow

1. **Bind / Admit** — Harness resolves contract + schema; checks Preconditions (§10).
2. **Resolve sources** — Load every `source_refs[]` entry; verify sealed status and tenancy.
3. **Resolve profile** — Load `profile_id`'s model/chunking specification; verify authorization and Egress Gate clearance.
4. **Chunk** — Deterministically split each source's content per the profile's chunking strategy, assigning stable `chunk_id`s and `span`s.
5. **Check for prior vectors** — If any source supersedes a previously-embedded version, or the profile itself was retired/replaced, identify the stale `vector_id`s to invalidate.
6. **Embed** — Invoke the Cloud AI Compute Layer per chunk, respecting budget/rate limits; record `vector_id` for each chunk that succeeds.
7. **Determine status** — All succeeded ⇒ `succeeded`; some succeeded ⇒ `partial`; none succeeded ⇒ `failed`.
8. **Assemble invalidations** — Populate `invalidations[]` for any superseded vectors.
9. **Emit candidate** — Submit `EmbeddingJob` payload for Harness `Validate`.
10. **Validate** — Harness checks schema validity, Postconditions (§11), Review Gate (including Egress/Policy Gate).
11. **Emit / Complete** — On pass, Harness seals the artifact and hands off to the Memory Agent. On fail, invocation transitions `FAILED` per §19.

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| All chunks embed successfully | `status: succeeded` | Clean outcome |
| Some chunks embed, others hit a transient compute error after retries exhausted | `status: partial`, missing chunks lack `vector_id`, job still emitted (not failed outright) | Partial success is more useful than an all-or-nothing failure, as long as it is explicit |
| Zero chunks embed (e.g., total Egress denial mid-run) | `status: failed` | No partial claim when nothing succeeded |
| Source artifact was previously embedded under an older version | Invalidate the old `vector_id`s explicitly | Prevents stale vectors from silently persisting in the retrieval index |
| Profile is retired mid-flight (deprecated between Admit and Emit) | Fail closed with `PROFILE_UNAUTHORIZED` rather than complete with a soon-to-be-invalid profile | Avoid producing vectors under a profile about to be decommissioned without a clear invalidation plan |
| A chunk boundary would split a claim's `claim_provenance` span awkwardly | Prefer chunk boundaries that respect claim/section boundaries per the profile's chunking strategy | Keeps retrieval chunks semantically coherent, and provenance traceable |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture

```json
{
  "contract_version": "1.0.0",
  "input": {
    "source_refs": [
      { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0", "artifact_type": "Knowledge" }
    ],
    "profile_id": "embedding_profile_text-embed-v3_1024d"
  },
  "output": {
    "source_refs": [
      { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0", "artifact_type": "Knowledge" }
    ],
    "profile_id": "embedding_profile_text-embed-v3_1024d",
    "chunk_map": [
      { "chunk_id": "chunk_0001", "source_artifact_id": "art_knowledge_0142", "span": "## Pain", "vector_id": "vec_9a1b2c3d" },
      { "chunk_id": "chunk_0002", "source_artifact_id": "art_knowledge_0142", "span": "## Recommended Approach", "vector_id": "vec_9a1b2c3e" }
    ],
    "status": "succeeded",
    "invalidations": []
  }
}
```

### 15.2 Partial Status With Invalidation

```json
{
  "source_refs": [
    { "artifact_id": "art_knowledge_0142", "artifact_version": "2.0.0", "artifact_type": "Knowledge" }
  ],
  "profile_id": "embedding_profile_text-embed-v3_1024d",
  "chunk_map": [
    { "chunk_id": "chunk_0101", "source_artifact_id": "art_knowledge_0142", "span": "## Pain", "vector_id": "vec_b1c2d3e4" },
    { "chunk_id": "chunk_0102", "source_artifact_id": "art_knowledge_0142", "span": "## Trade-offs" }
  ],
  "status": "partial",
  "invalidations": [
    { "vector_id": "vec_9a1b2c3d", "reason": "source_superseded: art_knowledge_0142 updated from version 1.0.0 to 2.0.0" }
  ]
}
```

## 16. Artifact Examples

Fully sealed `EmbeddingJob`:

```json
{
  "artifact_id": "art_embedding-job_0142",
  "artifact_version": "1.0.0",
  "artifact_type": "EmbeddingJob",
  "run_id": "run_2b7f1c9e-know-ingest-0142",
  "produced_by": "embedding-agent",
  "created_at": "2026-07-22T09:50:14Z",
  "digest": "sha256:6f708192a3b4c5d6e7f809102b3c4d5e6f708192a3b4c5d6e7f8091023c4d5e",
  "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" },
  "schema_version": "1.0.0",
  "payload": {
    "source_refs": [{ "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0", "artifact_type": "Knowledge" }],
    "profile_id": "embedding_profile_text-embed-v3_1024d",
    "chunk_map": [{ "chunk_id": "chunk_0001", "source_artifact_id": "art_knowledge_0142", "span": "## Pain", "vector_id": "vec_9a1b2c3d" }],
    "status": "succeeded",
    "invalidations": []
  },
  "parents": [
    { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0", "artifact_type": "Knowledge" }
  ]
}
```

## 17. Examples (Scenarios)

**Scenario A — Clean embed.** New `Knowledge` sealed for the first time; all chunks embed successfully; `status: succeeded`; no invalidations.

**Scenario B — Re-embed after Knowledge revision.** `Knowledge` is revised to version `2.0.0`. Agent re-chunks the new version, embeds successfully, and invalidates the vectors produced from version `1.0.0` (§15.2 example).

**Scenario C — Partial due to transient outage.** The Cloud AI Compute Layer experiences a partial outage mid-job; 8 of 10 chunks embed before retries against the remaining 2 exhaust. Job emits `status: partial` with the 8 successful chunks carrying `vector_id`s and the 2 failed ones present in `chunk_map` without one.

**Scenario D — Profile retirement.** `profile_id` is deprecated between Admit and Emit. Agent fails closed with `PROFILE_UNAUTHORIZED` rather than completing under a profile about to be decommissioned, avoiding vectors that would need immediate re-invalidation.

## 18. Acceptance Criteria

- [ ] Schema-valid against [embedding-job.schema.json](../../schemas/artifacts/embedding-job.schema.json).
- [ ] `chunk_map` deterministic for a given source + profile.
- [ ] `status` accurately reflects actual per-chunk outcomes.
- [ ] Superseded vectors always appear in `invalidations[]`.
- [ ] No unsealed content was ever embedded.
- [ ] Egress/policy constraints respected throughout.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `PROFILE_UNAUTHORIZED` | `profile_id` unresolved, unauthorized for tenant, or retired mid-flight. | Non-retryable |
| `EGRESS_DENY` | Cloud AI Compute Layer egress denied by policy for this tenant/profile. | Non-retryable |
| `SOURCE_MISSING` | A `source_refs[]` entry does not resolve to a sealed artifact. | Non-retryable |
| `CHUNK_MAP_MISMATCH` | Internal check finds a `chunk_map` entry referencing a `source_artifact_id` absent from `source_refs`. | Non-retryable, escalate (internal defect) |
| `TENANCY_VIOLATION` | Any resolved source or profile crosses a tenancy boundary. | Non-retryable, escalate |
| `RATE_LIMIT` | Cloud AI Compute Layer enforces a rate limit mid-job. | Retryable (bounded) |
| `COMPUTE_TIMEOUT` | An individual chunk's embedding call times out. | Retryable (bounded) |

**Failure Cases (narrative):**

- If a subset of chunks fail `COMPUTE_TIMEOUT` after exhausting per-chunk retries, the job does not fail outright — it emits `status: partial` as long as at least one chunk succeeded; a fully-failed job (`status: failed`) is reserved for the case where zero chunks succeeded.
- `CHUNK_MAP_MISMATCH` should never occur under correct implementation; any occurrence is treated as an engineering defect requiring incident review, not a normal runtime condition.

## 20. Forbidden Behaviors

1. **Never embed unsealed, draft, or candidate content.**
2. **Never claim `status: succeeded`** when any chunk actually failed.
3. **Never omit an `invalidations[]` entry** for a vector that a new job genuinely supersedes.
4. **Never treat the embedding index as a system of record** or imply it in any metadata field.
5. **Never call the Cloud AI Compute Layer for a profile lacking explicit tenant authorization.**
6. **Never cross a tenancy boundary** to reuse or reference another tenant's vectors.
7. **Never silently retry past the declared ceiling** or bypass Harness-controlled retry accounting.

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Rate limit / compute timeout (`RATE_LIMIT`, `COMPUTE_TIMEOUT`) | 3 | Exponential with jitter | Per-chunk retry accounting; job-level status reflects final per-chunk outcome. |
| Profile/egress/tenancy/source (`PROFILE_UNAUTHORIZED`, `EGRESS_DENY`, `SOURCE_MISSING`, `TENANCY_VIOLATION`, `CHUNK_MAP_MISMATCH`) | 0 | n/a | Fail closed immediately. |

## 22. Retry Examples

**Example 1 — Rate limit recovered mid-job.** Chunks 1–5 embed successfully; chunk 6 hits `RATE_LIMIT` on attempt 1. Harness retries chunk 6's embedding call (attempt 2) after a 3-second backoff; it succeeds. Chunks 7–10 proceed normally. Final job: `status: succeeded`, all 10 chunks carry `vector_id`s. Total attempts for chunk 6: 2 of 3.

**Example 2 — Partial after exhausted retries on one chunk.** Chunk 6 hits `COMPUTE_TIMEOUT` on attempts 1, 2, and 3 (3 of 3 exhausted) due to an oversized span exceeding the model's context window. The job does not fail outright: chunks 1–5 and 7–10 (9 total) succeeded, so the job emits `status: partial` with chunk 6 present in `chunk_map` without a `vector_id`, and the oversized-span issue is reported for the chunking strategy to be revised.

**Example 3 — No retry on tenancy violation.** A `source_refs[]` entry unexpectedly resolves to an artifact belonging to a different `tenant_id` than the invocation's tenancy (a Harness/config defect upstream). `TENANCY_VIOLATION` fires on attempt 1 with 0 retries; the invocation fails closed and escalates as a security-relevant incident per Constitution Article IX — this is never treated as a transient condition worth retrying.

## 23. Error Recovery Procedures

1. **On `RATE_LIMIT` / `COMPUTE_TIMEOUT` (per chunk):** Retry per §21; chunks that exhaust retries are left without a `vector_id` and the overall job status reflects `partial` (if others succeeded) or `failed` (if none did).
2. **On `PROFILE_UNAUTHORIZED`:** Fail closed; escalate to the profile/config owner — no fallback profile is silently substituted.
3. **On `EGRESS_DENY`:** Fail closed; Notification Agent alerts the policy/tenant owner so the Egress Gate can be corrected before resubmission.
4. **On `SOURCE_MISSING`:** Fail closed; the caller must supply a valid, sealed source reference — no retry will fix a reference to a non-existent or unsealed artifact.
5. **On a `partial` job:** No automatic re-queue of the failed chunks within this invocation. A follow-up `EmbeddingJob` invocation targeting the same source with the same profile is the correct remediation path, and it should naturally recompute the same `chunk_map` deterministically (§12 V3), retrying only what previously failed.
6. **On `TENANCY_VIOLATION` or `CHUNK_MAP_MISMATCH`:** Immediate fail-closed, immediate escalation, and quarantine of the affected profile/source pairing pending root-cause, since both indicate defects rather than expected runtime variance.

## 24. Best Practices

- Chunk along semantic/section boundaries (respecting `claim_provenance` spans from the source `Knowledge`) rather than fixed character counts, to keep retrieval results coherent.
- Always compute and emit `invalidations[]` proactively on re-embed — do not wait for a downstream consumer to notice staleness.
- Keep embedding profiles narrowly scoped (one model + chunking strategy per profile id) so re-runs are genuinely deterministic.
- Treat `status: partial` as actionable telemetry, not a hidden failure — surface it so a follow-up job can be scheduled.

## 25. Anti-patterns

- **Status rounding:** reporting `succeeded` when some chunks silently lack a `vector_id`.
- **Invalidation neglect:** re-embedding a superseded source without invalidating the old vectors, leaving stale results retrievable indefinitely.
- **Profile sprawl:** creating ad hoc, undocumented profile variants instead of registering a new named, versioned profile.
- **SoR creep:** any documentation, metadata, or downstream code path that starts treating the vector index as authoritative over the sealed `Knowledge`.

## 26. Success Metrics

- **Job success rate** — % of jobs reaching `succeeded` without exhausting retries.
- **Staleness window** — time between a source change and its vectors being invalidated.
- **Retrieval evaluation quality** — sampled relevance of retrieved chunks against known queries.
- **Egress incidents** — target: 0.

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Article XI (Cloud AI Compute Layer), Article IX (Security by Default)
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §7 Retry Rules, §10 Review Gates
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 7
- [/artifacts/embedding-job.md](../../artifacts/embedding-job.md)
- [/contracts/agents/knowledge-graph-agent.md](./knowledge-graph-agent.md) — upstream producer contract (optional dependency)
- [/contracts/agents/markdown-agent.md](./markdown-agent.md) — upstream producer contract (primary source)
- [/contracts/agents/memory-agent.md](./memory-agent.md) — downstream consumer contract

**End of Contract: Embedding Agent v2.0.0**
