# SPEC-PROD-001 — Personal Second Brain (MOD-PERSONAL-BRAIN)

**Status:** Accepted (Founder command — Harness Execution Engine 2026-07-23)  
**Module:** MOD-PERSONAL-BRAIN  
**Phase:** Product Layer — Personal Second Brain MVP  
**Package:** `@dyogas/personal-brain`  

## 1. Purpose

Provide the first **product layer** above the completed DYOGAS platform so a person can own a workspace, capture personal knowledge, index it through Knowledge → Graph → Embedding, and ask grounded questions over *their* knowledge — without modifying Kernel, Runtime, Trust, or rebuilding Research.

## 2. In Scope (MVP)

1. **User Workspace** — owner identity, personal knowledge boundary, workspace context bound to Kernel tenancy.  
2. **Capture** — text input; URL input as metadata abstraction (no live fetch); source metadata retained.  
3. **Personal Knowledge Flow** — Capture → Knowledge Engine apply (owner-attributed Human Approval) → Graph Engine → local Embedding → Retrieval index.  
4. **Ask My Brain (foundation)** — query personal index; retrieve related artifacts; return extractive grounded answers with citations.

## 3. Out of Scope

- Modifying Kernel / Runtime / Trust / Research Engine source  
- Live URL/network fetch or Research collectors  
- Cloud LLM answer generation  
- Multi-user org workspaces / IAM product  
- Durable disk SoR (memory OK for MVP; persistence later Spec)  
- Replacing MOD-WEB-UI (may integrate later)

## 4. Dependencies

MOD-KERNEL (consume), MOD-TRUST (consume), MOD-KNOWLEDGE (consume), MOD-GRAPH (consume).  
Optional type/helper consume of `@dyogas/research-engine` `KnowledgeHandoffContract` / `buildKnowledgeHandoff` — **no Research rebuild**.

## 5. Architecture Review

**Verdict:** `adr_required` — new registered `MOD-*` product module. See ADR-0009.

## 6. Success Metrics

1. Workspace enforces owner + tenant boundary.  
2. Text and URL captures apply to Knowledge SoR only with owner approval attribution.  
3. Capture path invokes Graph + Embedding without product-layer SoR writes.  
4. `ask` returns answers citing only retrieved personal knowledge ids.  
5. Automated tests green; no edits under `kernel/`, `runtime/`, `trust/`, `research/`.
