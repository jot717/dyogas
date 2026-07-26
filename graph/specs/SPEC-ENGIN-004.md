# Spec: DYOGAS Graph Engine (MOD-GRAPH)

**Spec ID:** SPEC-ENGIN-004  
**Module:** MOD-GRAPH (Graph Engine + local embedding path)  
**Trace ID:** TRACE-GRAPH-001  
**Status:** `accepted`  
**Founder Approval (business):** GRANTED — 2026-07-23 (B14 Build Order / Module Complete command)  
**Build Order:** B14  
**Dependencies:** Kernel, Trust, Runtime, Agent SDK, Knowledge Engine (read) — immutable

---

## Pain Statement

**Who:** Pipeline stages after Knowledge SoR apply.  
**How it hurts:** Applied Knowledge has a retrieval contract but no GraphUpdate / EmbeddingJob candidates — Stage 6–7 cannot proceed without inventing a graph DB or cloud vendor SDK.  
**Frequency:** Every knowledge-ingestion run past Human Approval.  
**Current workaround:** None in-platform.  
**Evidence:** MASTER §6.13; OOS-KN-001/003; contracts knowledge-graph-agent + embedding-agent.

---

## Goals

1. Derive `GraphUpdate` deltas (nodes/edges + consistency_report) from applied Knowledge or Knowledge `GraphRetrievalContract` + sealed fields.  
2. Bind Agent SDK `knowledge-graph-agent`; emit **unsealed** GraphUpdate candidates.  
3. Local deterministic embedding path (hash-based float arrays) + unsealed `EmbeddingJob` candidate via `embedding-agent` bind.  
4. Runtime admit + Trust audit; optional in-memory graph store for authorized `apply` (process lifetime only).  
5. Fail closed: drafts refused; `apply` without mutation grant → `propose`.

---

## Non-Goals

1. Durable / production graph database materialization (still deferred).  
2. Cloud embedding vendor SDKs (OOS-KN-003 / OOS-T-002).  
3. Knowledge SoR mutation / UI / Markdown Engine.  
4. Modifying Constitution, Harness, Engineering law, or MASTER dependencies.

---

## Architecture Review

**Verdict:** `no_arch_impact` — capabilities already assigned to MOD-GRAPH in MASTER §6.13 / §6.16; uses existing agent/artifact contracts; no new plane; no SoR ownership change. Optional ADR-0008 not required for MVP boundary.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| GraphUpdate from applied Knowledge | Deterministic nodes/edges with provenance |
| Unsealed candidates | `sealed: false` for GraphUpdate + EmbeddingJob |
| Apply without auth | Falls back to propose + issue recorded |
| Local embedding | Deterministic vectors; no cloud SDK imports |
| Boundary | Only kernel/trust/runtime/sdk/knowledge-engine |

## Duplicate Check

No Graph Engine package. **No duplicate.**
