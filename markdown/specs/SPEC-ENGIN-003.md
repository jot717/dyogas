# Spec: DYOGAS Markdown Engine (MOD-MARKDOWN)

**Spec ID:** SPEC-ENGIN-003  
**Module:** MOD-MARKDOWN (Markdown Engine)  
**Trace ID:** TRACE-MARKDOWN-001  
**Status:** `accepted`  
**Founder Approval (business):** GRANTED — 2026-07-23 (Module Complete command)  
**Build Order:** B12  
**Dependencies:** Kernel, Trust, Runtime, Agent SDK, Knowledge Engine (immutable)

---

## Pain Statement

**Who:** Operators needing review-ready Markdown after Knowledge approval.  
**How it hurts:** Knowledge emits a markdown handoff (`rendered: false`) but nothing binds the Markdown Agent or emits an unsealed knowledge/markdown candidate with citations.  
**Frequency:** Every knowledge-ingestion Stage 5 path.  
**Current workaround:** None in-platform.  
**Evidence:** MASTER §6.12; ADR-0006 defers Markdown implementation to this module.

---

## Goals

1. Consume Knowledge `MarkdownHandoffContract` (or equivalent `{title, body, knowledgeId, tenantId, version}`).  
2. Produce review-ready Markdown body with a Citations section.  
3. `bindContract` `markdown-agent` + `emitCandidate` with `artifactType: knowledge/markdown` — **unsealed only**.  
4. Execute under Runtime admit/start/succeed + Trust audit + Kernel tenancy.  
5. No SoR writes, no UI, no graph DB.

---

## Non-Goals

1. Knowledge SoR mutation (MOD-KNOWLEDGE / ADR-0006).  
2. Web UI / Human Approval screens.  
3. Graph database / Graph Engine.  
4. Sealing candidates (Harness/Runtime seal path).  
5. Modifying Constitution, Harness, Engineering Process law, or MASTER dependency graph.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Tenancy required | Fail closed without Kernel tenant |
| Review-ready body | Title + body + `## Citations` |
| Candidate | `sealed: false`, `artifactType: knowledge/markdown`, `producedBy: markdown-agent` |
| No SoR / UI | Package exports none |

## Duplicate Check

No Markdown Engine package. **No duplicate.**
