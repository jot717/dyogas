# SPEC-PROD-002 — Personal Brain Product MVP (Enrichment)

**Status:** Accepted (Harness Execution Engine command 2026-07-23)  
**Module:** MOD-PERSONAL-BRAIN only  
**Parent:** SPEC-PROD-001 / ADR-0009  
**Package:** `@dyogas/personal-brain@0.2.0`

## Purpose

Productize Personal Brain for human testing: persistence, real URL extraction (Jina), Gemini processing, approval flow, markdown-first knowledge, Graph link, Ask, and local UI via `npm run dev`.

## In Scope

- File-backed persistence (+ optional Supabase sync when configured)
- Capture: text, URL (Jina), document placeholder
- Pipeline: extract → summarize (Gemini) → pending → owner approve → Knowledge → Markdown → Graph
- Ask: retrieval + Gemini grounded answer with citations
- UI: dashboard, capture, knowledge browse, ask
- `npm run dev` local product server

## Out of Scope

- Kernel / Runtime / Trust source changes  
- New `MOD-*`  
- Live YouTube (optional key unused)  
- Enterprise IAM  

## Architecture Review

**Verdict:** `no_arch_impact` — product layer adapters; SoR writes remain via Knowledge Engine; externals are product-scoped under existing Founder-provisioned credentials (connection verification PASS).

## Success Metrics

1. Capture URL → pending → approve → persisted markdown knowledge  
2. Ask returns cited answer  
3. `npm test` green; `npm run dev` serves UI  
4. No Kernel/Runtime edits  
