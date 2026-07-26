# Contract: Knowledge Graph Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/knowledge-graph-agent.schema.json](../../schemas/agents/knowledge-graph-agent.schema.json)
**Artifact Schema:** [/schemas/artifacts/graph-update.schema.json](../../schemas/artifacts/graph-update.schema.json)
**Artifact Spec:** [/artifacts/graph-update.md](../../artifacts/graph-update.md)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Skills:** [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) §5.8 Conflict Detection
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 6 (Graph)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field remains the literal string `"1.0.0"` per the schema bundle's `const` constraint until an ADR revises it. All JSON examples below use `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Knowledge Graph Agent derives a structured graph representation from sealed Markdown `Knowledge`, so relationships between concepts, entities, and decisions become machine-traversable without ever becoming a second, competing source of truth. Its purpose is strictly derivational: the graph is provenance-linked to the text it came from, and every node and edge must be traceable back to a specific Knowledge span.

## 2. Scope

### 2.1 In Scope

- Consuming a sealed `Knowledge` artifact (plus an `ontology_profile_id` and `mode`).
- Extracting nodes and edges consistent with the declared ontology profile.
- Attaching provenance to every node and edge.
- Running a consistency check and reporting `ok`/`issues[]` honestly.
- Operating in `propose` mode (default, non-mutating) or `apply` mode (mutating, authorization-gated).

### 2.2 Out of Scope

- Originating new facts not present in the source `Knowledge` — the graph is derived, not generative.
- Substituting for the text SoR. The graph never becomes the canonical record; `Knowledge` remains canonical.
- Resolving `apply`-mode authorization itself — that is a Harness/Human Approval concern this agent must check, not grant.
- Cross-tenant graph merges of any kind.

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Ontology Profile** | A named, versioned (`ontology_profile_id`) schema of allowed node types, edge relations, and structural constraints. |
| **Node** | `{node_id, label, types[], provenance[]}` — a graph vertex derived from Knowledge content. |
| **Edge** | `{edge_id, from, to, relation, provenance[]}` (provenance minItems 1 — mandatory, unlike nodes where it is present but not minItems-constrained in the same way) — a directed relationship between two nodes. |
| **Consistency Report** | `{ok: boolean, issues: string[]}` — an honest self-check of the emitted graph delta against the ontology profile and existing graph state. |
| **Mode: propose** | Non-mutating: the delta is computed and emitted for review but not written into the live graph store. |
| **Mode: apply** | Mutating: the delta is written into the live graph store, and requires authorization per the pipeline's policy for graph mutation. |
| **Identity Collision** | Two candidate nodes that plausibly refer to the same real-world entity/concept but were extracted with different `node_id`s — must be resolved deterministically or escalated, never guessed silently. |

## 4. Role

Propose or apply graph deltas derived from approved `Knowledge`, preserving schema and provenance. The graph is not a text SoR substitute — `Knowledge` remains the canonical record; the graph is a derived index over it.

## 5. Responsibilities

1. Confirm `knowledge_ref` resolves to a sealed `Knowledge` artifact and tenancy matches.
2. Resolve `ontology_profile_id` to an active profile; refuse to run against an unknown profile.
3. Extract nodes and edges strictly consistent with the profile's declared types and relations.
4. Attach provenance (pointers back into the source `Knowledge`'s spans/claims) to every node and every edge — edges require at least one provenance entry by schema; this agent additionally attaches provenance to nodes as a matter of contract discipline even where the schema does not hard-require a minimum count.
5. Detect and either deterministically resolve or escalate identity collisions — never silently merge or silently duplicate.
6. Run a consistency check against the ontology profile and existing graph state; report honestly via `consistency_report`.
7. Respect `mode`: only mutate the live graph store when `mode: apply` **and** the invocation carries the required authorization for mutation.
8. Hand off the sealed `GraphUpdate` to the Embedding Agent (Stage 7) only through the Harness.

## 6. Input Schema

Primary shape: the `input` object of [knowledge-graph-agent.schema.json](../../schemas/agents/knowledge-graph-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `knowledge_ref` | object `{artifact_id, artifact_version}` (both required) | yes | Must reference a sealed `Knowledge` artifact. |
| `ontology_profile_id` | string | yes | Identifier of the ontology profile to apply. |
| `mode` | `propose`\|`apply` | no | Defaults to `propose` when omitted; treat absence as non-mutating. |

## 7. Output Schema

Primary shape: [graph-update.schema.json](../../schemas/artifacts/graph-update.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `knowledge_ref` | object `{artifact_id, artifact_version}` | yes | Echoes input. |
| `ontology_profile_id` | string | yes | Echoes input. |
| `nodes` | array of `{node_id, label, types[]?, provenance[]?}` | yes | May be empty if the Knowledge content yields no extractable entities under the profile. |
| `edges` | array of `{edge_id, from, to, relation, provenance[] minItems 1}` | yes | Every edge requires ≥1 provenance entry — schema-enforced. |
| `consistency_report` | object `{ok: boolean, issues: string[]}` | yes | `issues` may be empty only if `ok: true`. |
| `mode` | `propose`\|`apply` | yes | Echoes the mode actually executed. |

`additionalProperties: false` throughout.

## 8. Accepted Artifact(s)

`Knowledge` (sealed) — the sole primary accepted artifact for this stage.

## 9. Produced Artifact(s)

`GraphUpdate` — immutable once sealed. Consumed by the Embedding Agent (optional dependency) and the Knowledge Plane graph subsystem.

## 10. Preconditions

1. `knowledge_ref` resolves to a sealed `Knowledge` artifact with matching tenancy.
2. `ontology_profile_id` resolves to an active profile.
3. If `mode: apply` is requested, a valid mutation-authorization token/policy grant is present for this run — otherwise the agent must run in `propose` mode regardless of what was requested (fail closed on the mode, not on the whole invocation, unless policy requires a hard fail).

## 11. Postconditions

1. Every node and edge carries provenance pointing to a real span/claim in the source `Knowledge`.
2. Zero schema violations against the declared ontology profile on emit.
3. Identity collisions are either deterministically resolved per documented rules, or escalated — never silently guessed.
4. `consistency_report` is present and honest: `ok: false` whenever any issue exists, with every issue listed in `issues[]`.
5. `mode` in the output matches what was actually executed (never claim `apply` if authorization was missing and the agent fell back to `propose`).

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | `knowledge_ref` resolves to a sealed, schema-valid `Knowledge` artifact. | Pre-execution |
| V2 | `ontology_profile_id` exists in the active profile registry. | Pre-execution |
| V3 | `mode: apply` requires a present, valid mutation-authorization grant; absent grant forces `mode: propose` in the output, with the discrepancy recorded in `consistency_report.issues`. | Pre-execution / Post-execution |
| V4 | Every `nodes[].types` value is drawn from the ontology profile's declared type vocabulary. | Post-execution |
| V5 | Every `edges[].relation` value is drawn from the ontology profile's declared relation vocabulary. | Post-execution |
| V6 | Every `edges[]` entry has `provenance` with ≥1 entry (schema-enforced `minItems: 1`). | Post-execution |
| V7 | Every `edges[].from` and `edges[].to` references a `node_id` present in `nodes[]` (no dangling edges). | Post-execution |
| V8 | No two `nodes[]` entries share an identical `node_id`. | Post-execution |
| V9 | `consistency_report.ok` is `false` whenever `issues` is non-empty, and vice versa when genuinely clean. | Post-execution |
| V10 | Output `knowledge_ref` and `ontology_profile_id` exactly match the input. | Post-execution |

## 13. Workflow

1. **Bind / Admit** — Harness resolves contract + schema; checks Preconditions (§10), including mutation-authorization for `apply` mode.
2. **Load** — Agent reads the sealed `Knowledge` artifact's `body`, `front_matter`, and `claim_provenance`.
3. **Resolve ontology** — Load `ontology_profile_id`'s node type and edge relation vocabulary.
4. **Extract** — Identify candidate nodes (entities/concepts) and edges (relations) strictly within the ontology's vocabulary, each anchored to a specific claim/span in the source `Knowledge`.
5. **Resolve identity** — Check candidate nodes against existing graph state for the same tenancy; deterministically merge exact matches, escalate ambiguous matches as `consistency_report` issues rather than guessing.
6. **Attach provenance** — Every node and edge gets provenance pointers into the source `Knowledge`.
7. **Consistency check** — Validate the full candidate delta against the ontology profile's structural constraints (dangling edges, type mismatches, duplicate ids) and existing graph state.
8. **Determine effective mode** — If `mode: apply` was requested and authorization is present, proceed to apply; otherwise fall back to `propose` and record why.
9. **Emit candidate** — Submit `GraphUpdate` payload for Harness `Validate`.
10. **Validate** — Harness checks schema validity, Postconditions (§11), Review Gate.
11. **Emit / Complete** — On pass (and if `mode: apply` with authorization), Harness seals the artifact and applies the delta to the live graph store; then hands off to the Embedding Agent. In `propose` mode, the sealed artifact is emitted for review without a live store mutation. On fail, invocation transitions `FAILED` per §19.

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| A candidate node exactly matches an existing node by canonical identity key (per ontology profile rules) | Merge deterministically; do not create a duplicate | Protects graph SoT consistency |
| A candidate node plausibly but not certainly matches an existing node | Do not merge; add a `consistency_report` issue flagging the ambiguous identity for human/engineering resolution | Guessing risks silent data corruption |
| An edge's `relation` is not in the ontology profile's vocabulary | Drop the edge; add an issue explaining the unsupported relation | Never emit a schema-violating edge |
| `mode: apply` requested but no authorization grant present | Execute as `propose`, set output `mode: propose`, record the discrepancy in `issues` | Never silently mutate the live store without authorization, and never silently claim to have applied when it did not |
| A node/edge cannot be traced to any real span in the source `Knowledge` | Drop it; this should not occur under correct extraction — if it does, treat as an internal defect, not a valid emission | Provenance is non-negotiable |
| Consistency check finds zero issues | `consistency_report.ok: true`, `issues: []` | Honest clean report |
| Consistency check finds ≥1 issue, regardless of severity | `consistency_report.ok: false`, all issues listed | Never round a non-clean check up to "ok" |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture

```json
{
  "contract_version": "1.0.0",
  "input": {
    "knowledge_ref": { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0" },
    "ontology_profile_id": "ontology_engineering_v1",
    "mode": "propose"
  },
  "output": {
    "knowledge_ref": { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0" },
    "ontology_profile_id": "ontology_engineering_v1",
    "nodes": [
      { "node_id": "node_kg_sync", "label": "Knowledge Graph Sync", "types": ["Concept"], "provenance": ["art_knowledge_0142#claim_001"] },
      { "node_id": "node_checkpoint_pattern", "label": "Content-Hash Checkpoint Pattern", "types": ["Pattern"], "provenance": ["art_knowledge_0142#claim_001"] }
    ],
    "edges": [
      { "edge_id": "edge_0001", "from": "node_kg_sync", "to": "node_checkpoint_pattern", "relation": "implemented_by", "provenance": ["art_knowledge_0142#claim_001"] }
    ],
    "consistency_report": { "ok": true, "issues": [] },
    "mode": "propose"
  }
}
```

### 15.2 Consistency Issue Example

```json
{
  "knowledge_ref": { "artifact_id": "art_knowledge_0201", "artifact_version": "1.0.0" },
  "ontology_profile_id": "ontology_engineering_v1",
  "nodes": [
    { "node_id": "node_vector_clock", "label": "Vector Clock", "types": ["Concept"], "provenance": ["art_knowledge_0201#claim_004"] }
  ],
  "edges": [],
  "consistency_report": {
    "ok": false,
    "issues": [
      "Candidate node 'node_vector_clock' plausibly matches existing node 'node_vc_legacy_007' (label similarity 0.91) but canonical identity key differs; not merged automatically — requires human/engineering resolution."
    ]
  },
  "mode": "propose"
}
```

## 16. Artifact Examples

Fully sealed `GraphUpdate`:

```json
{
  "artifact_id": "art_graph-update_0142",
  "artifact_version": "1.0.0",
  "artifact_type": "GraphUpdate",
  "run_id": "run_2b7f1c9e-know-ingest-0142",
  "produced_by": "knowledge-graph-agent",
  "created_at": "2026-07-22T09:45:30Z",
  "digest": "sha256:5e6f708192a3b4c5d6e7f809102b3c4d5e6f708192a3b4c5d6e7f8091023c4d",
  "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" },
  "schema_version": "1.0.0",
  "payload": {
    "knowledge_ref": { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0" },
    "ontology_profile_id": "ontology_engineering_v1",
    "nodes": [{ "node_id": "node_kg_sync", "label": "Knowledge Graph Sync", "types": ["Concept"], "provenance": ["art_knowledge_0142#claim_001"] }],
    "edges": [{ "edge_id": "edge_0001", "from": "node_kg_sync", "to": "node_checkpoint_pattern", "relation": "implemented_by", "provenance": ["art_knowledge_0142#claim_001"] }],
    "consistency_report": { "ok": true, "issues": [] },
    "mode": "propose"
  },
  "parents": [
    { "artifact_id": "art_knowledge_0142", "artifact_version": "1.0.0", "artifact_type": "Knowledge" }
  ]
}
```

## 17. Examples (Scenarios)

**Scenario A — Clean propose.** New Knowledge introduces two genuinely new concepts with a clear relation; both extracted, provenance attached, no collisions, `consistency_report.ok: true`.

**Scenario B — Deterministic merge.** Knowledge references a concept ("Vector Clock") already canonically present in the graph with an exact identity-key match. Agent merges into the existing node rather than creating `node_vector_clock_2`, and the edge attaches to the existing canonical node.

**Scenario C — Ambiguous identity, escalated.** A near-duplicate label with a different identity key appears (§15.2 example). Agent does not guess; it reports the ambiguity and proceeds with the rest of the delta that is unambiguous.

**Scenario D — Apply mode without authorization.** Caller requests `mode: apply` but the run lacks a mutation-authorization grant. Agent computes the delta, executes it as `propose`, sets output `mode: "propose"`, and records `"apply mode requested but no mutation-authorization grant present; executed as propose"` in `consistency_report.issues`. This is a successful, honest emission — not a failure.

## 18. Acceptance Criteria

- [ ] Schema-valid against [graph-update.schema.json](../../schemas/artifacts/graph-update.schema.json).
- [ ] Every node/edge traceable to real `Knowledge` provenance.
- [ ] Zero ontology schema violations.
- [ ] Identity collisions resolved deterministically or escalated — never guessed.
- [ ] `consistency_report` honestly reflects the actual state (no false `ok: true`).
- [ ] Output `mode` matches what was actually executed.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `SCHEMA_PROFILE_MISSING` | `ontology_profile_id` does not resolve. | Non-retryable |
| `PROVENANCE_GAP` | A node/edge cannot be traced to a real span in the source `Knowledge`. | Non-retryable, escalate (internal defect) |
| `IDENTITY_COLLISION_UNRESOLVED` | Policy requires a hard fail (rather than a flagged issue) on unresolved ambiguous identity for this ontology profile. | Non-retryable, escalate |
| `TOKEN_INVALID` | `mode: apply` requested with a malformed/expired authorization token. | Non-retryable |
| `TENANCY_VIOLATION` | Extraction or graph-store lookup would cross a tenancy boundary. | Non-retryable, escalate |
| `TRANSIENT_STORE_LOCK` | The live graph store is locked/contended during an `apply`-mode write. | Retryable (bounded) |
| `SCHEMA_INVALID` | Assembled output fails schema validation. | Non-retryable |

**Failure Cases (narrative):**

- If the ontology profile itself is internally inconsistent (declares a relation whose domain/range types don't exist), the agent fails `SCHEMA_PROFILE_MISSING`-class rather than attempting to "interpret" the broken profile.
- A `TRANSIENT_STORE_LOCK` during `apply` mode must never partially write a delta — either the whole delta applies atomically or none of it does; a partial write is treated as equivalent to a failure requiring the Harness's Compensate failure mode (Harness §8), not a silent partial success.

## 20. Forbidden Behaviors

1. **Never emit a node or edge without traceable provenance.**
2. **Never silently merge two ambiguous identities** — deterministic rule or escalation only.
3. **Never claim `mode: apply` in the output when authorization was absent** and execution actually fell back to `propose`.
4. **Never round an inconsistent state up to `consistency_report.ok: true`.**
5. **Never treat the graph as an alternate SoR** — never allow a graph write without a corresponding sealed `Knowledge` origin.
6. **Never write across a tenancy boundary**, including reusing another tenant's canonical node ids.
7. **Never partially apply a graph delta** in `apply` mode — atomic apply or no apply.

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Transient store lock (`TRANSIENT_STORE_LOCK`) | 3 | Exponential with jitter | |
| Schema/provenance/collision/tenancy/token (`SCHEMA_PROFILE_MISSING`, `PROVENANCE_GAP`, `IDENTITY_COLLISION_UNRESOLVED`, `TOKEN_INVALID`, `TENANCY_VIOLATION`, `SCHEMA_INVALID`) | 0 | n/a | Fail or escalate immediately. |

## 22. Retry Examples

**Example 1 — Store contention recovered.** Attempt 1 of an `apply`-mode write hits `TRANSIENT_STORE_LOCK` because a concurrent run is applying a different delta to overlapping nodes. Harness retries attempt 2 after backoff; the earlier delta has since committed, and attempt 2's write succeeds cleanly against the updated base state. Total attempts: 2 of 3.

**Example 2 — Persistent contention exhausts retries.** Attempts 1, 2, and 3 all hit `TRANSIENT_STORE_LOCK` due to a stuck lock held by a hung process. After the 3rd failure, the stage transitions to `FAILED`; Notification Agent alerts on-call per Harness §8 (Escalate), since a stuck lock requires operator intervention, not further automated retries.

**Example 3 — No retry on unresolved collision policy.** An ontology profile configured with `identity_collision_policy: strict` encounters an ambiguous match and, per that profile's policy, must hard-fail rather than merely flag. `IDENTITY_COLLISION_UNRESOLVED` fires on attempt 1 with 0 retries allowed; the run escalates to a human for identity adjudication before Stage 6 can be re-attempted.

## 23. Error Recovery Procedures

1. **On `TRANSIENT_STORE_LOCK`:** Retry per §21; on exhaustion, `FAILED` + Notification Agent escalation to operators.
2. **On `PROVENANCE_GAP`:** Treat as an internal defect in the extraction logic; fail closed and open an engineering incident — this should never occur given correct implementation against a valid `Knowledge` artifact.
3. **On `IDENTITY_COLLISION_UNRESOLVED`:** Escalate to a human identity adjudicator; the run remains blocked at this stage until the ambiguity is resolved and a corrected re-invocation (new run or new invocation) proceeds.
4. **On `TENANCY_VIOLATION`:** Immediate fail-closed and security-relevant incident escalation per Constitution Article IX.
5. **On a detected partial `apply`-mode write (mid-transaction failure):** Harness applies the Compensate failure mode — emit a compensating `GraphUpdate` that reverts the partial change; never leave the live graph store in an inconsistent intermediate state.

## 24. Best Practices

- Prefer `propose` mode by default in any pipeline configuration; reserve `apply` for runs with an explicit, auditable mutation grant.
- Keep the ontology profile's vocabulary tight — fewer, well-defined relation types produce a more useful, less noisy graph.
- Record collision-resolution rules explicitly per ontology profile so merges are reproducible, not agent-specific judgment calls.
- Treat every `consistency_report.issues` entry as something a human or engineer should be able to act on directly.

## 25. Anti-patterns

- **Optimistic merging:** merging ambiguous identities because it "looks right" rather than following a deterministic rule.
- **Mode spoofing:** reporting `mode: apply` in output when execution silently fell back to `propose`.
- **Report grade inflation:** marking `consistency_report.ok: true` while quietly omitting a known issue.
- **Graph-as-SoR drift:** allowing any workflow to treat the graph as authoritative over the Markdown `Knowledge` it was derived from.

## 26. Success Metrics

- **Schema violation rate** — target: 0 at emission.
- **Orphan rate** — nodes/edges with unresolved provenance or dangling references (target: 0).
- **Collision mishandle rate** — ambiguous identities merged incorrectly, caught by later audit (target: 0).
- **Sync lag** — time between a `Knowledge` version sealing and its corresponding `GraphUpdate` being available.

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Articles I, VI, IX, X
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §5 Artifact Flow, §8 Failure Recovery
- [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) — §5.8 Conflict Detection
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 6
- [/artifacts/graph-update.md](../../artifacts/graph-update.md)
- [/contracts/agents/markdown-agent.md](./markdown-agent.md) — upstream producer contract
- [/contracts/agents/embedding-agent.md](./embedding-agent.md) — downstream consumer contract

**End of Contract: Knowledge Graph Agent v2.0.0**
