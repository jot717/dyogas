# ADR-0009: Personal Second Brain Product Layer Boundary

**Status:** Accepted  
**Date:** 2026-07-23  
**Accepted:** 2026-07-23  
**Deciders:** Engineering Agents (Process Mode) · Founder (Harness Execution Engine command)  
**Related:** Art. VIII, X, XIII; MASTER §6; SPEC-PROD-001; ADR-0006; ADR-0004

## Context

MVP-PIPELINE is complete. Phase 1 product direction is **Personal Second Brain**. Risk: product code rewriting platform modules, bypassing Knowledge SoR approval, or inventing a second Harness.

## Options

1. **Extend Research Engine for personal capture** — Rejected (user rule: do not rebuild Research; wrong product boundary).  
2. **Modify Kernel/Runtime/Trust for workspace primitives** — Rejected (immutable platform; product must consume).  
3. **New product module MOD-PERSONAL-BRAIN consuming Knowledge + Graph** — Chosen.

## Decision

1. Register **MOD-PERSONAL-BRAIN** as Experience/Product layer module.  
2. Workspace ownership maps to Kernel tenancy; personal boundary = tenant + owner id.  
3. Capture constructs a Knowledge handoff and applies via Knowledge Engine with **owner-attributed** Human Approval (`approved` by workspace owner) — never silent SoR write.  
4. Graph + local-hash Embedding remain MOD-GRAPH responsibilities; Personal Brain only indexes results for Ask.  
5. Ask My Brain MVP is **extractive / similarity grounded** — no cloud LLM required.  
6. SHALL NOT modify Kernel, Runtime, Trust, or Research Engine implementations.

## Consequences

Product layer unblocked. Persistence and live URL fetch remain future Specs/OOS.

## Non-Goals

Org multi-tenant product · Hosted ENG-AGENTS · Live collectors · Kernel changes
