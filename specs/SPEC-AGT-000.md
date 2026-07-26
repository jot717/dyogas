# SPEC-AGT-000 — Agent Contract Layer

**Spec ID:** SPEC-AGT-000  
**Title:** Agent Contract Layer — Canonical Contract Model (Host-bound)  
**Status:** `accepted`  
**Module:** **MOD-CPAS** (existing — **not** a new Platform Module)  
**Trace ID:** TRACE-AGT-LAYER-001  
**Requester:** Founder (business) via [`DL-AGENT-CONTRACT-LAYER-001`](../docs/decision-log/DL-AGENT-CONTRACT-LAYER-001.md)  
**Spec Author:** Development Harness Agent (Process Mode)  
**Related:** Constitution Art. I, II, III, VI, XIII · [`contracts/README.md`](../contracts/README.md) · `SPEC-AGT-001`…`010` · SPEC-HAR-001 · SPEC-PIP-001 · SPEC-EXECUTION-HOST-001 · SPEC-RT-002 · SPEC-RT-003 · ADR-0003 · ADR-0004 · ADR-0010  

**Non-modification:** This SPEC does **not** authorize changes to Runtime, SDK, Harness, or Execution Host **implementation**. It does **not** create a new `MOD-*`.

**Duplicate check:** Does **not** replace `SPEC-AGT-001`…`010` or `/contracts/agents/*`. Does **not** invent a second contract tree. Umbrella / layer Spec only.

---

## Pain Statement

| Field | Content |
|-------|---------|
| **Who** | Platform engineers, Execution Host consumers, Experience products binding agents |
| **How it hurts** | After Host MODULE COMPLETE, agent binding can be misread as a new module, a product-local contract system, or Runtime-first orchestration — duplicating CPAS and drifting from Host→SDK bind |
| **Frequency** | Every pipeline stage that binds an agent; every new Spec/Sprint touching agents |
| **Current workaround** | Tribal reading of `contracts/README` + per-agent SPECs without a Host-era layer Spec |
| **Evidence** | Conflict Report for invented `SPEC-AGENT-CONTRACT-001`; DL-AGENT-CONTRACT-LAYER-001 APPROVED |

---

## 1. Purpose

Define the **Agent Contract Layer**: the canonical **contract model** that **Execution Host** binds (via Agent SDK) during pipeline execution.

This layer:

1. Sits under existing **MOD-CPAS** (Contracts · Pipelines · Artifacts · Schemas).  
2. **Consumes** Execution Host, Runtime, SDK, and Harness — it does not replace them.  
3. Points to existing per-agent law (`SPEC-AGT-001`…`010`, `/contracts/agents/*`).  
4. Makes the Host-era bind path unambiguous for all future work.

---

## 2. Goals

1. Document the canonical agent bind path under Execution Host.  
2. Affirm `/contracts` + `SPEC-AGT-001`…`010` as the only per-agent SoR.  
3. Affirm cross-cutting contract rules (fail closed, no self-approval, tenancy, no fabrication).  
4. Forbid new Platform Modules and parallel contract systems under this Spec’s scope.

## 3. Non-Goals

| Non-goal | Reason |
|----------|--------|
| New Platform Module | Mission + Art. VI |
| New agent / new contract files | Separate Spec + change control |
| Runtime / SDK / Harness / Host code changes | Mission |
| New pipeline topology | SPEC-PIP-001 / ADR-0010 |
| Decision Agent / UI | Future / product |
| Replacing individual `SPEC-AGT-001`…`010` | This Spec is umbrella only |

---

## 4. Architecture Position

**Not a new module.** Capability documentation under **MOD-CPAS**.

```text
Experience Products
        ↓
ExecutionHost.createRun()
        ↓
Execution Host          ← Pipeline Engine (binds contracts per stage)
        ↓
Runtime                 ← primitives (admit, transitions, handoff)
        ↓
SDK                     ← bindContract / skills / candidates
        ↓
Agents                  ← published contracts only (this Layer’s SoR)
        ↓
Human Approval
        ↓
Knowledge → Graph
```

| Layer | Role relative to Agent Contract Layer |
|-------|----------------------------------------|
| **Harness** | Execution **law** (lifecycle, gates, audit) |
| **Execution Host** | **Binds** contracts during stage execution (via SDK) |
| **Runtime** | Primitives only — not contract SoR |
| **SDK** | Performs bind / skill invoke / candidate emit (ADR-0004) |
| **Agent Contract Layer (this Spec)** | Canonical **model** + index of what may be bound |
| **Per-agent contracts** | Individual obligations (`SPEC-AGT-001`…`010`) |

---

## 5. Canonical Contract Model

### 5.1 What may be bound

Only agents with a published contract under [`/contracts/agents`](../contracts/agents/) and a registered `SPEC-AGT-*` (001–010 today) may execute. Unbound AI processes are unauthorized (Constitution; Harness §3).

### 5.2 Who binds

**Execution Host** drives stages and **must** bind the stage’s producer via **Agent SDK** `bindContract` (and related SDK surfaces) under Harness Agent Lifecycle (Bind → Admit → Execute → Validate → Emit → Complete).

Products **must not** bind agents to orchestrate pipelines.

### 5.3 Version pin

At run create, Host pins pipeline + contract/schema versions per Harness §13 and Host CreateRun semantics. Wire `contract_version` remains schema-`const` (today `"1.0.0"`) independent of markdown Contract Version 2.0.0 — see [`contracts/README.md`](../contracts/README.md) §4.

### 5.4 Pipeline association

Canonical association remains **Knowledge Ingestion** ([`pipelines/knowledge-ingestion.md`](../pipelines/knowledge-ingestion.md)):

```text
Research → Validation → Proposal → Human Review → Markdown → Graph → Embedding → Memory
```

Supporting agents (Notification, Learning) never replace stages or bypass Human Approval.

### 5.5 Artifact lineage (trusted path)

```text
ResearchBrief → ResearchReport → ValidationReport → Proposal
  → HumanReviewDecision → Knowledge → GraphUpdate
```

(Plus Embedding/Memory stages per pipeline.) Agents emit **candidates**; Host/Runtime seal under Harness — SDK never self-seals as authoritative (ADR-0004).

### 5.6 Cross-cutting rules (normative by reference)

All rules in [`contracts/README.md`](../contracts/README.md) §7 apply: contracts before cognition; artifacts before conversation; no fabrication; no self-approval; tenancy absolute; fail closed; immutable history; retry ceilings contractual.

---

## 6. Interface Impact

### Consumes

| Surface | Use |
|---------|-----|
| Execution Host | Stage driver that binds contracts |
| Runtime | Admit / transitions / handoff primitives |
| Agent SDK | bindContract, skills, candidates |
| Harness Spec | Lifecycle, gates, audit law |
| `/contracts`, `/schemas/agents` | Per-agent SoR |
| `/pipelines/knowledge-ingestion` | Topology |
| `/artifacts`, `/schemas/artifacts` | Lineage shapes |

### Does not create

| Forbidden | Statement |
|-----------|-----------|
| New `MOD-*` | Layer ≠ module |
| Parallel `/contracts` tree | Art. VI |
| New orchestrator | Art. XIII |
| New approval semantics | Harness §9 only |

**Architecture impact:** `no_arch_impact` (ADR not required).

---

## 7. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Spec accepted + MASTER registry row | Yes | MASTER §7 |
| Single bind narrative (Host→SDK→contract) documented | Yes | This Spec §4–§5 |
| Zero new Platform Module | Yes | No MOD registration |
| Per-agent SPECs unchanged by this Spec | Yes | No obligatory edits to 001–010 |

---

## 8. Acceptance Criteria

| # | Criterion |
|---|-----------|
| AC-1 | Spec states Agent Contract Layer is **not** a new Platform Module (`MOD-CPAS` only). |
| AC-2 | Spec states Host binds contracts via SDK during pipeline execution. |
| AC-3 | Spec consumes Host, Runtime, SDK, Harness without authorizing their rewrite. |
| AC-4 | Spec preserves `SPEC-AGT-001`…`010` + `/contracts/agents/*` as per-agent SoR. |
| AC-5 | Spec forbids product/agent self-orchestration and Human Approval bypass. |
| AC-6 | Spec references existing `knowledge-ingestion` topology only (no new topology). |
| AC-7 | Architecture Review = `no_arch_impact`; ADR not required for this Spec as scoped. |
| AC-8 | Implementation is **not** claimed complete by Spec acceptance alone. |

---

## 9. Risks & Open Questions

| Risk | Mitigation |
|------|------------|
| Readers treat this Spec as replacing per-agent contracts | Explicit Non-Goals + Duplicate check |
| Future new agent without ADR | Change control via contracts README §9 + Art. VIII |
| Naming collision (`SPEC-AGENT-CONTRACT-*`) | Rejected; only `SPEC-AGT-*` |

---

## 10. Status / Next

| State | Action |
|-------|--------|
| Now | Spec **`accepted`**. DL APPROVED. Architecture Review `no_arch_impact`. |
| Next | Sprint `SPRINT-AGT-000` — **documentation / registry hygiene only**; **no implementation** until Founder authorizes coding. |

---

**End of SPEC-AGT-000**
