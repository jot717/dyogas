# DYOGAS Agent Contracts

**Version:** 2.0.0
**Status:** Binding — Per-Agent Execution Law
**Effective:** 2026-07-22
**Owner:** Chief Systems Architect
**Layer:** `/contracts` (see [/CONSTITUTION.md](../CONSTITUTION.md) Engineering OS Layout)
**Related:** [/CONSTITUTION.md](../CONSTITUTION.md) · [/harness/HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md) · [/harness/SKILL_SPECIFICATION.md](../harness/SKILL_SPECIFICATION.md) · [/pipelines/knowledge-ingestion.md](../pipelines/knowledge-ingestion.md) · [/artifacts/README.md](../artifacts/README.md) · [/schemas/README.md](../schemas/README.md) · [**SPEC-AGT-000 — Agent Contract Layer**](../specs/SPEC-AGT-000.md)

---

## 0. Agent Contract Layer (Host-bound)

Canonical layer Spec: [`SPEC-AGT-000`](../specs/SPEC-AGT-000.md).

- **Execution Host** binds published contracts during pipeline execution via **Agent SDK** under **Harness** law.
- This tree (`/contracts/agents/*`) plus **`SPEC-AGT-001`…`010`** remain the **per-agent SoR**.
- SPEC-AGT-000 does **not** replace individual contracts and is **not** a new Platform Module.

---

## 1. Purpose

This index is the Single Source of Truth for every **Agent Contract** binding an AI agent to Harness execution in DYOGAS. An Agent Contract is the only mechanism by which an agent is permitted to run: it fixes the agent's role, its input/output shapes, the artifacts it may accept and produce, the conditions under which it succeeds or fails, its retry ceilings, and the behaviors it is forbidden from performing.

Per Constitution Article II (AI-First Development) and Article XIII (Harness-First Execution), **an agent without a published, version-pinned contract in this tree does not execute** — the Harness Pipeline Engine refuses to bind it (see [HARNESS_SPECIFICATION.md §3 Agent Lifecycle](../harness/HARNESS_SPECIFICATION.md)).

This document does not implement agents, prompts, or application code. It is specification only.

---

## 2. Scope

### 2.1 In Scope

- Enumerating every published Agent Contract and its canonical location.
- Declaring how contracts relate to schemas, artifacts, pipelines, and the Harness.
- Declaring the versioning model for contracts versus schema-pinned wire fields.
- Declaring the authority order that governs conflicts between this tree and other layers.

### 2.2 Out of Scope

- Agent implementation, prompts, model selection, or vendor SDKs (never specified here or anywhere in `/contracts`).
- Pipeline stage topology and exit criteria — see [/pipelines](../pipelines).
- Artifact semantic meaning and immutability rules — see [/artifacts](../artifacts).
- Machine-checkable payload shapes — see [/schemas](../schemas).
- Execution states, retry ceilings enforcement, gate semantics, and audit event shape — see [/harness/HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md).

---

## 3. Definitions

| Term | Meaning |
|------|---------|
| **Agent Contract** | A binding markdown document in `/contracts/agents` that fully specifies one agent's obligations. |
| **Harness** | The only production execution path for multi-agent work; binds contracts, schedules stages, enforces gates, retries, and audit (see [HARNESS_SPECIFICATION.md](../harness/HARNESS_SPECIFICATION.md)). |
| **Schema Bundle** | The JSON Schema pair (`input`/`output`) at `/schemas/agents/<agent>.schema.json` that machine-validates a contract's I/O. |
| **Artifact** | An immutable, versioned deliverable exchanged between pipeline stages; sealed by the Harness on acceptance. |
| **Sealed Artifact** | An artifact instance that has passed Review Gates and been assigned an immutable `artifact_id@artifact_version` with content digest. |
| **Envelope** | The common wrapper (`/schemas/common/artifact-envelope.schema.json`) around every sealed artifact's payload — `artifact_id`, `artifact_version`, `artifact_type`, `run_id`, `produced_by`, `created_at`, `digest`, `tenancy`, `schema_version`, `payload`. |
| **Precondition** | A gate that must hold before an agent is admitted to run; failing preconditions is a `REJECTED` invocation, never a retry. |
| **Postcondition** | A property the agent's output must satisfy for the Harness to accept the emission and seal the artifact. |
| **Review Gate** | Automated Harness check applied to every handoff (schema validity, contract postconditions, exit criteria, policy, provenance). |
| **Human Approval Gate** | The mandatory human decision point (canonical: Stage 4, Human Review) that authorizes Knowledge Plane mutation; agents cannot self-approve. |
| **Apply Token** | Single-use, artifact-version-bound authorization issued only on an `approved` Human Review Decision; required to cross the SoR-mutation boundary. |
| **Fail Closed** | Default posture on ambiguity, missing provenance, policy denial, or ownership/tenancy uncertainty: stop, do not guess, do not proceed. |
| **Tenancy** | The `tenant_id` (+ optional `workspace_id`) isolation boundary that no artifact, memory, or handoff may cross. |
| **Contract Version** | The semantic version of this markdown document, tracking completeness and obligations text. |
| **Wire `contract_version`** | The literal JSON field validated by a schema bundle's `const` constraint — distinct from the document's Contract Version (see §4). |

---

## 4. Versioning Model (Read Before Editing Any Contract)

Every contract in this tree carries **Contract Version 2.0.0**. This is the document revision — it reflects that each contract now specifies Purpose, Scope, Definitions, Responsibilities, Workflow, Decision Rules, Examples, Acceptance Criteria, Failure Cases, Forbidden Behaviors, Retry Examples, Error Recovery Procedures, Best Practices, Anti-patterns, and References, in addition to the original baseline (Role, Input/Output Schema, Accepted/Produced Artifact, Preconditions, Postconditions, Failure Conditions, Retry Strategy, Success Metrics).

This is **independent** from the wire-level `contract_version` field that each `/schemas/agents/*.schema.json` bundle pins with a JSON Schema `const`. As of this revision, every schema bundle pins:

```json
{ "contract_version": "1.0.0" }
```

Any payload an agent emits (or that a conformance test constructs) **must** carry the literal string `"contract_version": "1.0.0"` to pass schema validation — even though the governing document you are reading is Contract Version 2.0.0. Do **not** write `"2.0.0"` into a JSON payload; it will fail schema validation because the `const` has not been bumped. The wire field will only become `"2.0.0"` when the schema bundle itself is revised via ADR + Decision Log entry per Harness Specification §13 (Versioning) and Constitution Article VIII — that is a schema change, not a documentation change, and is out of scope for this revision.

Every Agent Contract in this tree restates this distinction explicitly so no engineer conflates "the contract document is 2.0.0" with "the payload's `contract_version` field is 2.0.0."

---

## 5. Canonical Pipeline

Agents in this tree are bound, in canonical order, to the **Knowledge Ingestion** pipeline (see [/pipelines/knowledge-ingestion.md](../pipelines/knowledge-ingestion.md)):

```
Research → Validation → Proposal → Human Review → Markdown → Graph → Embedding → Memory
```

Notification Agent, Learning Agent, Task Agent, and Decision Asset Agent are **supporting agents**: they observe, notify, plan/route, synthesize decision assets, or branch off the canonical pipeline but never replace a numbered stage, and never gain a shortcut around Human Approval.

---

## 6. Contract Index

| # | Stage | Agent | Contract | Schema Bundle | Primary Output Artifact |
|---|-------|-------|----------|----------------|--------------------------|
| 1 | Research | Research Agent | [agents/research-agent.md](./agents/research-agent.md) | [schema](../schemas/agents/research-agent.schema.json) | `ResearchReport` |
| 2 | Validation | Source Validation Agent | [agents/source-validation-agent.md](./agents/source-validation-agent.md) | [schema](../schemas/agents/source-validation-agent.schema.json) | `ValidationReport` |
| 3 | Proposal | Proposal Agent | [agents/proposal-agent.md](./agents/proposal-agent.md) | [schema](../schemas/agents/proposal-agent.schema.json) | `Proposal` |
| 4 | Human Review | Knowledge Review Agent | [agents/knowledge-review-agent.md](./agents/knowledge-review-agent.md) | [schema](../schemas/agents/knowledge-review-agent.schema.json) | `HumanReviewDecision` (pending package) |
| 5 | Markdown | Markdown Agent | [agents/markdown-agent.md](./agents/markdown-agent.md) | [schema](../schemas/agents/markdown-agent.schema.json) | `Knowledge` |
| 6 | Graph | Knowledge Graph Agent | [agents/knowledge-graph-agent.md](./agents/knowledge-graph-agent.md) | [schema](../schemas/agents/knowledge-graph-agent.schema.json) | `GraphUpdate` |
| 7 | Embedding | Embedding Agent | [agents/embedding-agent.md](./agents/embedding-agent.md) | [schema](../schemas/agents/embedding-agent.schema.json) | `EmbeddingJob` |
| 8 | Memory | Memory Agent | [agents/memory-agent.md](./agents/memory-agent.md) | [schema](../schemas/agents/memory-agent.schema.json) | `MemoryUpdate` |
| — | Supporting (cross-cutting) | Learning Agent | [agents/learning-agent.md](./agents/learning-agent.md) | [schema](../schemas/agents/learning-agent.schema.json) | `Proposal` (`kind=lesson`) |
| — | Supporting (cross-cutting) | Notification Agent | [agents/notification-agent.md](./agents/notification-agent.md) | [schema](../schemas/agents/notification-agent.schema.json) | `NotificationReceipt[]` (non-SoR) |
| — | Supporting (meta / planning) | Task Agent | [agents/task-agent.md](./agents/task-agent.md) | [schema](../schemas/agents/task-agent.schema.json) | `TaskPlan` |
| — | Supporting (meta / decision) | Decision Asset Agent | [agents/decision-asset-agent.md](./agents/decision-asset-agent.md) | [schema](../schemas/agents/decision-asset-agent.schema.json) | `DecisionAsset` |

---

## 7. Cross-Cutting Rules (Apply to Every Contract)

1. **Contracts before cognition.** An agent binds to exactly one contract per invocation; the Harness resolves contract + schema version at `Bind` and denies on mismatch (Harness Specification §3).
2. **Artifacts before conversation.** Nothing an agent produces has standing until it validates against `/schemas` and is sealed by the Harness. Chat residue, scratch notes, or "informal" outputs are not artifacts.
3. **No fabrication, ever.** No agent may invent sources, citations, ids, scores, approvals, tokens, or provenance. Fabrication is always a non-retryable, fail-closed condition.
4. **No self-approval.** Only the Human Approval Gate issues `apply_token`s. No agent contract in this tree grants an agent the ability to mint, forge, or bypass a token.
5. **Tenancy is absolute.** No handoff, memory operation, or research query may cross a `tenant_id` boundary. Violation is always non-retryable.
6. **Fail closed on ambiguity.** When policy, ownership, provenance, or SoR-mutation authority is unclear, agents stop and escalate — they do not proceed optimistically.
7. **Immutable history.** Corrections are new artifact versions or compensating artifacts. No contract permits in-place mutation of sealed history.
8. **Retry ceilings are contractual, not aspirational.** The Harness enforces the ceilings each contract declares (default: 3 attempts retryable / 0 non-retryable per Harness Specification §7); agents do not self-retry outside Harness control.

---

## 8. Authority Hierarchy

Per Constitution "Hierarchy of Authority": [CONSTITUTION.md](../CONSTITUTION.md) → Accepted ADRs ([/docs/adr](../docs/adr)) → `/docs` → `/harness` → **`/contracts`** (this tree), `/pipelines`, `/artifacts`, `/schemas` → `/engineering` → Decision Log → issue/PR text and runtime prompts.

Where any contract in this tree appears to conflict with the Harness Specification or the Constitution, the higher layer wins and the contract is defective — file an ADR and correct the contract; do not silently follow the contract text.

---

## 9. Change Control

1. Any change to a contract's Role, I/O shape, Preconditions, Postconditions, Failure Conditions, or Retry Strategy is a **material** change: it requires a Decision Log entry (Constitution Article VII) and, if it alters SoR boundaries or trust topology, an ADR (Constitution Article VIII).
2. Purely editorial additions (Examples, Best Practices, References) that do not change obligations may ship as a minor documentation revision but still require the version bump in the affected contract's header.
3. No contract may reference a schema bundle version it does not pin-compatibly match (Harness Specification §13).

**End of Contracts Index v2.0.0**
