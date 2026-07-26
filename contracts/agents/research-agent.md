# Contract: Research Agent

**Contract Version:** 2.0.0
**Status:** Binding — Harness Execution Law
**Effective:** 2026-07-22
**Schema Bundle:** [/schemas/agents/research-agent.schema.json](../../schemas/agents/research-agent.schema.json)
**Artifact Schema:** [/schemas/artifacts/research-report.schema.json](../../schemas/artifacts/research-report.schema.json)
**Artifact Spec:** [/artifacts/research-report.md](../../artifacts/research-report.md)
**Harness:** [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md)
**Skills:** [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) §5.1–5.4 (YouTube, GitHub, Reddit, Web Research)
**Pipeline:** [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 1 (Research)
**Constitution:** [/CONSTITUTION.md](../../CONSTITUTION.md)

> **Versioning note.** This document is Contract Version 2.0.0. The wire-level `contract_version` field inside every payload validated against the schema bundle above remains the literal string `"1.0.0"` (a JSON Schema `const`) until that schema bundle is itself revised via ADR. Every JSON example in this document therefore uses `"contract_version": "1.0.0"`. See [/contracts/README.md §4](../README.md#4-versioning-model-read-before-editing-any-contract).

---

## 1. Purpose

The Research Agent is the sole entry point of the Knowledge Ingestion pipeline. Its purpose is to convert an open question into a **candidate evidence pack** — a bounded, provenance-complete, non-authoritative collection of material gathered from approved source classes — without ever asserting that the material is true, complete, or fit for use. Truth-assessment is explicitly out of scope; it belongs to the Source Validation Agent (Stage 2).

The Research Agent exists to remove two pains: (1) humans manually trawling YouTube, GitHub, Reddit, and the open web for every knowledge question, and (2) downstream agents receiving unsourced or fabricated "facts" with no way to trace them back to a locus.

## 2. Scope

### 2.1 In Scope

- Accepting a `ResearchBrief` (question, scope, constraints, allowed source classes, budget, run/tenancy context).
- Invoking Web Research, GitHub Research, Reddit Research, and/or YouTube Research skills within policy and budget.
- Normalizing heterogeneous source output into `EvidenceItem` records with resolvable provenance pointers.
- Explicitly declaring `coverage_gaps` and `open_questions` when the brief cannot be fully answered.
- Respecting budget (`max_items`, `max_seconds`) as a hard stop, not a soft target.

### 2.2 Out of Scope

- Judging source credibility, trust tier, or acceptance/rejection — that is the Source Validation Agent's exclusive responsibility.
- Producing a recommendation, proposal, or option set — that is the Proposal Agent's responsibility.
- Any Knowledge Plane write. The Research Agent never touches SoR.
- Deduplication beyond obvious exact-pointer repeats within a single run (cross-run/cross-corpus dedupe is the Duplicate Detection skill, invoked by later stages).
- Fetching from source classes not present in `allowed_source_classes` even if technically reachable.

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Research Brief** | The bootstrap input to Stage 1: `question`, `scope`, `constraints`, `allowed_source_classes`, `budget`, `run_id`, `tenancy`. Not a sealed Knowledge Plane artifact. |
| **Evidence Item** | One unit of candidate evidence: `evidence_id`, `source_class`, optional `title`/`excerpt`, required `provenance.pointer`, optional `signal_tier`. |
| **Source Class** | One of `youtube`, `github`, `reddit`, `web` (evidence item output may additionally carry `other`). |
| **Signal Tier** | Authority labeling on an evidence item: `primary`, `secondary`, `community`, or `unknown`. Community-sourced material (e.g., Reddit) must never be silently upgraded to `primary`. |
| **Provenance Pointer** | A resolvable locator (URL, permalink, SHA/ref, video id) proving where an evidence item came from. Every evidence item requires one. |
| **Coverage Gap** | An explicit statement of what the brief asked for that this report could not supply, and why. |
| **Budget Guard** | The hard `max_items`/`max_seconds` ceiling from the brief; exceeding it stops collection, it does not trigger silent overrun. |
| **Egress Gate** | The policy/consent check that must pass before any external fetch for a given source class. |
| **Fabrication Risk** | Any evidence item whose id, pointer, title, or excerpt was not actually retrieved from the named source. Absolutely forbidden. |

## 4. Role

Discover and collect candidate evidence for a research brief across approved source classes, within budget and policy, and emit it as a schema-valid `ResearchReport`. The Research Agent does **not** assert final truth, does **not** score or rank sources for acceptance, and does **not** authorize any Knowledge Plane write.

## 5. Responsibilities

1. Parse and validate the incoming brief against the input schema before invoking any skill.
2. Resolve `allowed_source_classes` against current policy/consent; drop denied classes with an explicit gap note rather than silently omitting them.
3. Invoke the appropriate Research skill(s) (§5.1–5.4 of the Skill Specification) per source class, respecting `BudgetGuard` and `EgressGate`.
4. Normalize every returned item into the `EvidenceItem` shape, preserving `source_class`, `provenance.pointer`, `retrieved_at`, and an honest `signal_tier`.
5. Track and report `coverage_gaps` (what could not be answered) and `open_questions` (what remains ambiguous even after collection).
6. Never write, imply, or forward a recommendation — that is a downstream concern.
7. Hand off the sealed `ResearchReport` to the Source Validation Agent only through the Harness; never via a side channel.

## 6. Input Schema

Primary shape: the `input` object of [research-agent.schema.json](../../schemas/agents/research-agent.schema.json).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `question` | string (minLength 1) | yes | The research question driving the brief. |
| `scope` | string | yes | Bounding context (e.g., a product area, doc, or ADR topic). |
| `constraints` | object | no | Free-form additional constraints (e.g., locale, recency window). |
| `allowed_source_classes` | array of `youtube`\|`github`\|`reddit`\|`web` | yes | Source classes the agent is permitted to query. |
| `budget` | object `{max_items (int ≥1, required), max_seconds (int ≥1, optional)}` | yes | Hard collection ceiling. |
| `run_id` | string | yes | Harness run identifier; must match the pipeline run context. |
| `tenancy` | object `{tenant_id (required), workspace_id (optional)}` | yes | Isolation boundary; never crossed. |

## 7. Output Schema

Primary shape: [research-report.schema.json](../../schemas/artifacts/research-report.schema.json), returned as the `output` of the schema bundle.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `brief_ref` | object `{brief_id (required), question}` | yes | Traceability back to the originating brief. |
| `evidence_items` | array of `EvidenceItem` | yes | May be empty (`[]`) if genuinely nothing was found — must never be padded with invented items. |
| `evidence_items[].evidence_id` | string | yes | Stable id within this report. |
| `evidence_items[].source_class` | `youtube`\|`github`\|`reddit`\|`web`\|`other` | yes | |
| `evidence_items[].title` | string | no | |
| `evidence_items[].excerpt` | string | no | |
| `evidence_items[].provenance.pointer` | string | yes | Resolvable locator. |
| `evidence_items[].provenance.retrieved_at` | date-time | no | |
| `evidence_items[].signal_tier` | `primary`\|`secondary`\|`community`\|`unknown` | no | Omission is acceptable; fabrication of a tier is not. |
| `coverage_gaps` | array of string | yes | May be empty only if the brief was fully answered. |
| `open_questions` | array of string | yes | May be empty. |

The schema declares `additionalProperties: false` — the agent must not add undeclared fields (e.g., no ad-hoc `notes` or `recommendation` keys).

## 8. Accepted Artifact(s)

| Artifact | When | Notes |
|----------|------|-------|
| None (run bootstrap) | Pipeline Research stage start | The Research Agent is the first producer; it has no upstream sealed artifact. |
| `ResearchBrief` envelope | Standard admission | Delivered by the Harness at `Admit`; not itself a Knowledge Plane SoR artifact. |

## 9. Produced Artifact(s)

`ResearchReport` — immutable once sealed by the Harness at `Emit`. Consumed exclusively by the Source Validation Agent (Stage 2).

## 10. Preconditions

The Harness will not admit the Research Agent unless **all** of the following hold:

1. Contract version and schema bundle version are pin-compatible with the pipeline run's pinned versions (Harness Specification §13).
2. The brief validates against the input schema (§6) with no missing required fields.
3. At least one entry in `allowed_source_classes` has a valid Egress Gate token for this tenancy.
4. `budget.max_items ≥ 1`.
5. `tenancy.tenant_id` resolves to an active tenant.
6. `run_id` matches an active `RUNNING` pipeline run at the Research stage.

If any precondition fails, the invocation is `REJECTED` — not attempted, not retried.

## 11. Postconditions

The Harness will not seal the output unless **all** of the following hold:

1. Output validates against the `ResearchReport` schema with `additionalProperties: false` satisfied.
2. Every `evidence_items[]` entry has a non-empty, resolvable `provenance.pointer`.
3. No evidence item's `evidence_id`, pointer, title, or excerpt was invented — each is traceable to an actual skill invocation result.
4. `coverage_gaps` explicitly lists every part of the brief not answered (denied source class, budget stop, empty results, ambiguous scope).
5. The report contains **no** recommendation, ranking, or acceptance/rejection language — that is exclusively Stage 2/3 territory.
6. `brief_ref.brief_id` matches the brief that was actually processed.

## 12. Validation Rules

| # | Rule | Enforcement point |
|---|------|--------------------|
| V1 | `question` and `scope` are non-empty strings before any skill is invoked. | Pre-execution (Admit) |
| V2 | Every element of `allowed_source_classes` is one of the four enum values; unknown values are stripped and logged as a gap, not passed to a skill. | Pre-execution |
| V3 | `budget.max_items` is a positive integer; if `max_seconds` is present it is also positive. | Pre-execution |
| V4 | Every produced `evidence_items[].source_class` is drawn only from classes actually present in `allowed_source_classes`. | Post-execution (Validate) |
| V5 | Every produced `evidence_items[].provenance.pointer` resolves to a locator format valid for its `source_class` (URL for web/reddit, `owner/repo@ref` or URL for github, video id/URL for youtube). | Post-execution |
| V6 | `signal_tier`, when present, must not label a `reddit`-origin item as `primary` (community source ⇒ `community` or `unknown`, never `primary`). | Post-execution |
| V7 | `coverage_gaps` is present (possibly empty) and every denied/skipped source class or budget stop appears there in plain language. | Post-execution |
| V8 | Total collected items never exceeds `budget.max_items`; total wall-clock collection time never exceeds `budget.max_seconds` when declared. | Runtime (BudgetGuard) |
| V9 | No egress occurs for a source class lacking a current policy/consent token, regardless of `allowed_source_classes` listing it. | Runtime (EgressGate) |
| V10 | Output `evidence_items` array, if non-empty, contains no two items with an identical `evidence_id`. | Post-execution |

## 13. Workflow

1. **Bind** — Harness resolves this contract + schema bundle for the run; denies on version mismatch.
2. **Admit** — Harness checks Preconditions (§10). Reject closed on any failure.
3. **Parse brief** — Agent reads `question`, `scope`, `constraints`, `allowed_source_classes`, `budget`.
4. **Resolve source classes** — For each requested class, check the Egress Gate. Classes without a valid token are dropped and recorded as a coverage gap; if **all** classes are dropped, the run fails closed with `POLICY_DENY` (§19).
5. **Collect** — For each resolved class, invoke the matching skill (Web/GitHub/Reddit/YouTube Research) with the brief and a proportional slice of the remaining budget, tracked by `BudgetGuard`.
6. **Normalize** — Map each skill's native evidence shape into `EvidenceItem`: assign `evidence_id`, carry `source_class`, `title`, `excerpt`, `provenance.pointer`, `provenance.retrieved_at`, and an honest `signal_tier` (default `unknown` if the skill does not supply one).
7. **De-duplicate obvious repeats** — Drop items with an identical `provenance.pointer` seen twice in this run; do not perform cross-run dedupe here.
8. **Assess coverage** — Compare what was found against the brief; populate `coverage_gaps` and `open_questions` honestly, including "budget exhausted before class X was queried" if that occurred.
9. **Emit candidate** — Assemble the `ResearchReport` payload and submit it to the Harness for `Validate`.
10. **Validate** — Harness schema-validates and checks Postconditions (§11) and the Review Gate (schema validity, contract postconditions, exit criteria, provenance presence, no undeclared artifact types).
11. **Emit / Complete** — On pass, Harness seals the artifact (`artifact_id@artifact_version` + digest) and hands off to the Source Validation Agent. On fail, the invocation enters `FAILED` per Failure Conditions (§19).

## 14. Decision Rules

| Condition | Decision | Rationale |
|-----------|----------|-----------|
| A requested source class has no Egress Gate token | Drop that class; add coverage gap; continue with remaining classes | Partial policy denial should not fail the whole run if other classes remain |
| All requested source classes are denied | Fail closed with `POLICY_DENY`, zero egress | No partial collection is possible; do not fabricate a substitute |
| Budget (`max_items`) reached mid-collection with ≥1 item already gathered | Stop collection, emit report with items gathered, note truncation in `coverage_gaps` | Partial success is honest; silent overrun is not permitted |
| Budget reached with zero items gathered | Fail closed with `BUDGET_EXHAUSTED_EMPTY` | An empty, unlabeled report would look like "nothing exists," which is a fabrication risk |
| A skill returns an item without a resolvable pointer | Drop the item, do not include it, note in `coverage_gaps` if it removes meaningful coverage | Never seal an evidence item without provenance |
| A skill returns a partial item (e.g., video metadata but blocked transcript) | Include the item with the fields it does have; do not backfill missing fields with guesses | Partial evidence is still evidence; guessed fields are fabrication |
| Reddit/community item signal tier is ambiguous | Set `signal_tier: community` or `unknown`, never `primary` | Community signal must never be laundered as primary authority |
| Two items share an identical `provenance.pointer` | Keep one, drop the duplicate | Obvious redundancy within a single run adds noise without value |
| Brief scope is broader than what budget can cover | Cover the highest-relevance slice within budget; list the rest under `open_questions` | Budget is a hard ceiling, not something to silently exceed |

## 15. JSON Examples

### 15.1 Schema Conformance Fixture

Matches [research-agent.schema.json](../../schemas/agents/research-agent.schema.json) exactly (`contract_version` + `input` + `output`):

```json
{
  "contract_version": "1.0.0",
  "input": {
    "question": "What are the current best practices for keeping an embedded knowledge graph in sync with a local-first Markdown SoR?",
    "scope": "engineering.knowledge-graph-sync",
    "constraints": { "recency_days": 730, "language": "en" },
    "allowed_source_classes": ["web", "github"],
    "budget": { "max_items": 12, "max_seconds": 90 },
    "run_id": "run_2b7f1c9e-know-ingest-0142",
    "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" }
  },
  "output": {
    "brief_ref": {
      "brief_id": "brief_0142_kg_sync",
      "question": "What are the current best practices for keeping an embedded knowledge graph in sync with a local-first Markdown SoR?"
    },
    "evidence_items": [
      {
        "evidence_id": "ev_0001",
        "source_class": "github",
        "title": "dgraph-io/dgraph — incremental sync design notes",
        "excerpt": "Discusses bidirectional sync between a document store and a graph index using content-hash checkpoints.",
        "provenance": {
          "pointer": "https://github.com/dgraph-io/dgraph/blob/main/docs/design/sync.md",
          "retrieved_at": "2026-07-22T09:14:03Z"
        },
        "signal_tier": "primary"
      },
      {
        "evidence_id": "ev_0002",
        "source_class": "web",
        "title": "Local-first software: 8 ideals",
        "excerpt": "Describes ownership and sync guarantees relevant to keeping derived indexes (graph, embeddings) consistent with a local SoR.",
        "provenance": {
          "pointer": "https://www.inkandswitch.com/local-first/",
          "retrieved_at": "2026-07-22T09:14:41Z"
        },
        "signal_tier": "secondary"
      }
    ],
    "coverage_gaps": [
      "reddit and youtube source classes were not requested in this brief"
    ],
    "open_questions": [
      "No evidence found specifically addressing conflict resolution for concurrent graph-delta writes across multiple local replicas"
    ]
  }
}
```

### 15.2 Degenerate Input (Empty Pack, Fail Closed)

```json
{
  "question": "What is the market share of a proprietary internal tool with no public footprint?",
  "scope": "engineering.internal-tooling",
  "allowed_source_classes": ["web"],
  "budget": { "max_items": 5, "max_seconds": 30 },
  "run_id": "run_9a11-empty-case",
  "tenancy": { "tenant_id": "tenant_dyogas_core" }
}
```

Expected output for this input is a `ResearchReport` with `evidence_items: []` and `coverage_gaps` explicitly stating no public evidence was found — **not** a fabricated citation.

## 16. Artifact Examples

Fully sealed `ResearchReport` artifact as the Harness would store it (envelope per [artifact-envelope.schema.json](../../schemas/common/artifact-envelope.schema.json) + payload per §15.1's `output`):

```json
{
  "artifact_id": "art_research-report_0142",
  "artifact_version": "1.0.0",
  "artifact_type": "ResearchReport",
  "run_id": "run_2b7f1c9e-know-ingest-0142",
  "produced_by": "research-agent",
  "created_at": "2026-07-22T09:15:02Z",
  "digest": "sha256:8f2b6e1c4d9a3701f5e8b2a4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3",
  "tenancy": { "tenant_id": "tenant_dyogas_core", "workspace_id": "ws_eng_default" },
  "schema_version": "1.0.0",
  "payload": {
    "brief_ref": { "brief_id": "brief_0142_kg_sync", "question": "What are the current best practices for keeping an embedded knowledge graph in sync with a local-first Markdown SoR?" },
    "evidence_items": [
      { "evidence_id": "ev_0001", "source_class": "github", "title": "dgraph-io/dgraph — incremental sync design notes", "provenance": { "pointer": "https://github.com/dgraph-io/dgraph/blob/main/docs/design/sync.md", "retrieved_at": "2026-07-22T09:14:03Z" }, "signal_tier": "primary" },
      { "evidence_id": "ev_0002", "source_class": "web", "title": "Local-first software: 8 ideals", "provenance": { "pointer": "https://www.inkandswitch.com/local-first/", "retrieved_at": "2026-07-22T09:14:41Z" }, "signal_tier": "secondary" }
    ],
    "coverage_gaps": ["reddit and youtube source classes were not requested in this brief"],
    "open_questions": ["No evidence found specifically addressing conflict resolution for concurrent graph-delta writes across multiple local replicas"]
  }
}
```

## 17. Examples (Scenarios)

**Scenario A — Happy path, full coverage.** Brief requests `web` + `github` evidence on a well-documented topic with generous budget. Agent collects 8 items across both classes, all with resolvable pointers, `coverage_gaps` empty, one `open_question` about a narrow sub-topic. Report validates; hands off to Source Validation Agent.

**Scenario B — Partial policy denial.** Brief requests `youtube` + `web`, but the tenant has no YouTube Egress Gate token. Agent drops `youtube`, adds `"youtube source class denied by policy: no egress token for this tenancy"` to `coverage_gaps`, proceeds with `web` only, and succeeds with a partial report.

**Scenario C — Total policy denial.** Brief requests only `reddit`, and Reddit egress is denied tenant-wide. Agent performs zero egress and fails closed with `POLICY_DENY` (§19) — it does not emit an empty report disguised as a success, because no source class remained to attempt.

**Scenario D — Budget exhaustion, non-empty.** Brief allows `max_items: 5`; the Web Research skill alone could return 40 relevant items. Agent stops at 5, ranks nothing (ranking is not its job), and notes `"budget exhausted after 5 items; broader web coverage not attempted"` in `coverage_gaps`.

**Scenario E — Budget exhaustion, empty.** Brief allows `max_seconds: 15` and the only reachable source class times out before returning anything. Agent fails closed with `BUDGET_EXHAUSTED_EMPTY` rather than emitting a hollow report that looks like "confirmed nothing exists."

## 18. Acceptance Criteria

An emitted `ResearchReport` is accepted by the Harness only if:

- [ ] Schema-valid against [research-report.schema.json](../../schemas/artifacts/research-report.schema.json) with `additionalProperties: false` satisfied.
- [ ] Every evidence item has a non-fabricated, resolvable provenance pointer.
- [ ] `coverage_gaps` and `open_questions` are both present (each may be `[]` only when genuinely exhaustive).
- [ ] No recommendation, acceptance, rejection, or ranking language is present anywhere in the payload.
- [ ] Budget was respected — item count and elapsed time within declared ceilings.
- [ ] `brief_ref` matches the actual brief processed for this invocation.
- [ ] Tenancy of every provenance pointer and skill invocation matches the run's `tenancy.tenant_id`.

## 19. Failure Conditions / Failure Cases

| Code | Trigger | Class |
|------|---------|-------|
| `BRIEF_INVALID` | Input fails schema validation (missing `question`, empty `allowed_source_classes`, non-positive budget). | Non-retryable |
| `POLICY_DENY` | Every requested source class lacks a valid Egress Gate token. | Non-retryable |
| `BUDGET_EXHAUSTED_EMPTY` | Budget ceiling reached with zero evidence items collected. | Non-retryable |
| `FABRICATION_RISK` | Internal integrity check detects an evidence item without a traceable skill-result origin. | Non-retryable, escalate |
| `EGRESS_VIOLATION` | A fetch was attempted against a denied domain/channel/tenancy boundary. | Non-retryable, escalate |
| `SCHEMA_INVALID` | Assembled output fails schema validation before emission. | Non-retryable |
| `SOURCE_UNAVAILABLE` | A specific source (video, repo, thread, page) could not be reached. | Retryable (bounded) |
| `RATE_LIMIT` | A source class enforced a rate limit mid-collection. | Retryable (bounded, backoff) |
| `TENANCY_UNRESOLVED` | `tenancy.tenant_id` does not resolve to an active tenant at Admit. | Non-retryable |

**Failure Cases (narrative):**

- A malformed brief with `budget.max_items: 0` is rejected at Admit — this is a precondition failure, not an execution failure, and is never retried.
- A GitHub repository referenced by `constraints` returns `404` mid-run: the Research Agent records it as a coverage gap for that specific pointer rather than failing the whole invocation, unless it was the *only* viable source, in which case `BUDGET_EXHAUSTED_EMPTY` applies once budget is exhausted with nothing else collected.
- A skill layer returns a plausible-looking but unresolvable pointer (e.g., a malformed URL): the agent must drop the item rather than "fix" or guess the correct URL — guessing is fabrication.

## 20. Forbidden Behaviors

1. **Never invent an `evidence_id`, `provenance.pointer`, `title`, or `excerpt`** that was not actually returned by a skill invocation.
2. **Never upgrade a `signal_tier`** beyond what the source class supports (a Reddit thread is never `primary`).
3. **Never emit a recommendation, ranking, "best option," or acceptance verdict** — that is the exclusive job of Stage 2 (Validation) and Stage 3 (Proposal).
4. **Never exceed the declared budget** ceilings, even "just this once" to improve coverage.
5. **Never fetch from a source class absent from `allowed_source_classes`**, even if a skill could technically reach it.
6. **Never cross a tenancy boundary** to reuse cached evidence from a different `tenant_id`.
7. **Never pad an empty result set** with placeholder, synthetic, or "illustrative" evidence items to avoid an empty-pack failure.
8. **Never write directly to the Knowledge Plane** or any store other than emitting the `ResearchReport` candidate through the Harness.
9. **Never retry silently outside Harness control** — every retry is a new, audited invocation under the ceilings in §21.

## 21. Retry Strategy

| Class | Max attempts | Backoff | Notes |
|-------|---------------|---------|-------|
| Rate limit / transient fetch (`RATE_LIMIT`, `SOURCE_UNAVAILABLE`) | 3 | Exponential with jitter | Each attempt is a new Harness invocation id under the same stage. |
| Policy / fabrication / schema (`POLICY_DENY`, `FABRICATION_RISK`, `EGRESS_VIOLATION`, `SCHEMA_INVALID`) | 0 | n/a | Fail closed immediately; no busy-retry. |
| Budget exhausted, empty (`BUDGET_EXHAUSTED_EMPTY`) | 0 | n/a | A wider budget requires a new brief/run, not a retry of the same one. |
| Brief invalid (`BRIEF_INVALID`) | 0 | n/a | Precondition failure — `REJECTED`, not attempted. |

## 22. Retry Examples

**Example 1 — Successful retry after rate limit.** Attempt 1 of the Web Research skill hits `RATE_LIMIT` after collecting 2 of 12 requested items. Harness schedules attempt 2 after a 2-second backoff; attempt 2 succeeds and collects the remaining 10. Total attempts: 2 of 3 allowed. Final `ResearchReport` reflects all 12 items; no trace of the failed attempt remains in the sealed artifact (it exists only in the Audit Trail).

**Example 2 — Exhausting retries, stage fails.** Attempts 1, 2, and 3 of a GitHub fetch all return `SOURCE_UNAVAILABLE` (upstream outage). After the 3rd failure, the ceiling for the retryable class is reached; the stage transitions to `FAILED`. Because at least one other source class (`web`) succeeded independently, the Harness's Failure Recovery may still allow the run to proceed with a partial `ResearchReport` if the contract's postconditions treat this as a documented coverage gap rather than a hard block — otherwise the run fails closed and Notification Agent is informed per Harness §8.

**Example 3 — Non-retryable short-circuit.** `POLICY_DENY` fires on attempt 1 because the tenant has zero approved source classes for this brief. There is no attempt 2 — the retry ceiling for this class is 0, and the invocation goes directly to `FAILED` with the reason recorded in the Audit Trail.

**Example 4 — Poison message quarantine.** The same brief is resubmitted three separate runs in a row and fails `BRIEF_INVALID` identically each time (e.g., a caller bug producing `budget.max_items: 0`). Per Harness §7 Rule 5, this repeat identical non-retryable failure is quarantined — the run is isolated and a human must unblock it, rather than the Harness silently accepting repeated `REJECTED` invocations as normal traffic.

## 23. Error Recovery Procedures

1. **On `RATE_LIMIT` / `SOURCE_UNAVAILABLE`:** Harness schedules a bounded retry per §21; agent re-attempts only the affected source class slice, preserving already-collected items from earlier successful classes within the same invocation window where the runtime supports partial carry-forward; otherwise the new invocation starts clean and the Harness reconciles.
2. **On `POLICY_DENY` (partial):** Agent does not retry; it proceeds with remaining allowed classes and documents the denial in `coverage_gaps`. No escalation needed unless zero classes remain.
3. **On `POLICY_DENY` (total):** Agent fails closed; Notification Agent is informed per Harness §8 (Escalate) so a human can address the missing Egress Gate token; the pipeline run enters `FAILED` and requires a new run once policy is corrected.
4. **On `FABRICATION_RISK`:** Immediate fail-closed and escalation — this indicates either a skill defect or an integrity-check bug; both require human incident review before the contract may be trusted again for that source class.
5. **On `BUDGET_EXHAUSTED_EMPTY`:** Fail closed; the caller must resubmit a new brief with a larger budget, broader `allowed_source_classes`, or a narrower/clarified `question` — this is not something a retry of the identical brief will fix.
6. **On `SCHEMA_INVALID` at emission:** Agent must not "patch" the output to force validity by dropping required honesty fields (e.g., silently removing `coverage_gaps` to satisfy a shape check). It fails the invocation; a genuine defect requires a fix to the normalization step, tracked as an engineering task, not a runtime workaround.

## 24. Best Practices

- Always populate `signal_tier` explicitly rather than relying on the schema's optionality — explicit `unknown` is more useful downstream than silence.
- Prefer fewer, well-sourced items over padding toward `max_items`; the Validation stage's job is easier with high-signal packs.
- Record `retrieved_at` timestamps whenever the skill layer provides them — recency matters for the Validation rubric.
- Write `coverage_gaps` and `open_questions` as if a human engineer will read them directly during Human Review — they are often the most-read part of the report.
- Treat every skill's `POLICY_DENY` / `SAFETY_BLOCK` / `DOMAIN_BLOCKED` responses as authoritative; never attempt an alternate route to the same denied content.

## 25. Anti-patterns

- **Silent scope creep:** querying a source class not present in `allowed_source_classes` "because it seemed helpful."
- **False completeness:** presenting a budget-truncated pack without noting the truncation, implying exhaustive coverage.
- **Tier inflation:** marking low-authority community content as `primary` to make the pack look stronger.
- **Recommendation leakage:** including phrases like "this is the best approach" or "sources agree that X is correct" — that is Proposal Agent territory, not Research Agent's.
- **Retry loops disguised as new runs:** repeatedly resubmitting an unmodified failing brief hoping a different result appears, instead of fixing the underlying policy/budget/scope issue.

## 26. Success Metrics

- **Brief coverage ratio** — fraction of brief sub-questions answered with ≥1 evidence item.
- **Provenance resolvability rate** — % of evidence items whose pointer resolves on inspection (target: 100%).
- **Noise/duplicate rate** — duplicate or irrelevant items per report (target: trending toward 0).
- **Time-within-budget rate** — % of invocations completing within declared `max_seconds`.
- **Downstream validation accept rate** — % of this agent's evidence items that Source Validation Agent marks `accepted` (a proxy for research quality, not a target to game).

## 27. References

- [/CONSTITUTION.md](../../CONSTITUTION.md) — Articles II, IV, IX, X, XIII
- [/harness/HARNESS_SPECIFICATION.md](../../harness/HARNESS_SPECIFICATION.md) — §3 Agent Lifecycle, §7 Retry Rules, §8 Failure Recovery
- [/harness/SKILL_SPECIFICATION.md](../../harness/SKILL_SPECIFICATION.md) — §5.1–5.4 Research skills
- [/pipelines/knowledge-ingestion.md](../../pipelines/knowledge-ingestion.md) — Stage 1
- [/artifacts/research-report.md](../../artifacts/research-report.md)
- [/schemas/artifacts/research-report.schema.json](../../schemas/artifacts/research-report.schema.json)
- [/schemas/agents/research-agent.schema.json](../../schemas/agents/research-agent.schema.json)
- [/contracts/agents/source-validation-agent.md](./source-validation-agent.md) — downstream consumer contract

**End of Contract: Research Agent v2.0.0**
