# Spec: DYOGAS Knowledge Engine (MOD-KNOWLEDGE)

**Spec ID:** SPEC-ENGIN-002  
**Module:** MOD-KNOWLEDGE (Knowledge Engine — Knowledge SoR layer)  
**Trace ID:** TRACE-KNOWLEDGE-001  
**Status:** `accepted`  
**Founder Approval (business):** GRANTED — 2026-07-23 (Module Complete command)  
**Build Order:** B13-class path after Human Approval; MVP proceeds with approval-gated SoR  
**Dependencies:** Kernel, Trust, Runtime, Agent SDK, Research Engine (immutable)

---

## Pain Statement

**Who:** Users needing durable, versioned, provenance-linked knowledge after research.  
**How it hurts:** Research produces handoffs but nothing is the Knowledge Source of Record — approved knowledge cannot be stored, versioned, or handed to Markdown/Graph.  
**Frequency:** Every post-approval knowledge-ingestion path.  
**Current workaround:** None in-platform.  
**Evidence:** MASTER §6.11; Research ADR-0005 forbids SoR writes in Research.

---

## Goals

1. Knowledge artifact lifecycle (draft → approved → SoR version).  
2. Knowledge item creation with versioning.  
3. Provenance tracking + evidence linking.  
4. Approval state management — **no SoR write without Human Approval `approved`**.  
5. Retrieval contract for future Graph Engine (no graph DB).  
6. Markdown Engine handoff contract (no Markdown rendering UI).

---

## Non-Goals

1. Graph database / Knowledge Graph Engine implementation.  
2. Web UI / Human Approval screens.  
3. Embedding job execution (later).  
4. Live Cloud AI.  
5. Modifying completed modules or governance law.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Reject SoR apply without approval | 100% in tests |
| Version bump on apply | Monotonic version per knowledge id |
| Evidence links retained | Linked evidence ids on SoR item |
| Graph retrieval contract | Emitted without graph DB |
| Markdown handoff | Emitted; `rendered: false` |

## Duplicate Check

No Knowledge Engine package. **No duplicate.**
