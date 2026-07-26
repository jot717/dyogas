# Spec: DYOGAS Research Engine (MOD-RESEARCH)

**Spec ID:** SPEC-ENGIN-001  
**Module:** MOD-RESEARCH (Research Engine)  
**Trace ID:** TRACE-RESEARCH-001  
**Status:** `accepted`  
**Founder Approval (business):** GRANTED — 2026-07-23 (Module Complete command)  
**Build Order:** B9  
**Dependencies:** `@dyogas/kernel`, `@dyogas/trust`, `@dyogas/runtime`, `@dyogas/agent-sdk` (immutable); Research Agent contract consumed

---

## Pain Statement

**Who:** Users/operators seeking evidence-backed answers before Knowledge SoR writes.  
**How it hurts:** Platform primitives exist but no engine turns a research question into tracked evidence + approval/knowledge handoffs — first user-value path is missing.  
**Frequency:** Every knowledge-ingestion Stage 1 attempt.  
**Current workaround:** Manual research outside DYOGAS.  
**Evidence:** MASTER §6.10 code not started; OOS-S-001 deferred real skills to engines.

---

## Goals

1. Research **task creation** from a brief (question, scope, source classes, budget).  
2. **Source collection abstraction** with pluggable adapters (MVP: mocks).  
3. **Source metadata** + **evidence tracking**.  
4. **Research artifact** candidate generation via Agent SDK.  
5. **Human approval handoff** record (no UI).  
6. **Knowledge handoff contract** payload for downstream Knowledge Engine (no SoR write).  
7. Execute under Runtime admit + Trust audit + Kernel tenancy.

---

## Non-Goals

1. Web UI / Human Approval screens (MOD-WEB-UI).  
2. Knowledge SoR mutation (MOD-KNOWLEDGE).  
3. Live YouTube/GitHub/Reddit/Web network fetch (mock adapters until OOS-T-002 allow + engine enrichment).  
4. Rebuilding Runtime or Agent SDK.  
5. Editing Constitution, Harness, MASTER, completed modules.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Task create | Brief → task id with tenancy |
| Mock collect | ≥1 evidence item with provenance metadata |
| Artifact | Unsealed research-report candidate via SDK |
| Approval handoff | Pending human-review record emitted (no auto-approve) |
| Knowledge handoff | Contract payload without SoR write |
| No UI | Package exports no HTTP/UI server |

---

## Duplicate Check

No Research Engine package. **No duplicate.** Activates OOS-S-001 for mock/stub handlers in-engine.
