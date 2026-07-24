# @dyogas/personal-brain

MOD-PERSONAL-BRAIN — Personal Second Brain **core + external connection layer**.

**Product SSOT:** [`specs/SPEC-PRODUCT-MASTER.md`](./specs/SPEC-PRODUCT-MASTER.md) (ADR-0009).  
**Bridge contract:** [`specs/SPEC-PROD-004-HARNESS-BRIDGE.md`](./specs/SPEC-PROD-004-HARNESS-BRIDGE.md) — **`accepted`**.  
**Governed entry:** `ExecutionHost.createRun()` → Execution Host → `Runtime.admitRun()` primitives (ADR-0010). Does **not** call Runtime as product orchestrator.

Consumes Execution Host, Knowledge, Graph. Does not modify Kernel, Runtime, Trust, SDK, Harness, Execution Host, or Research **source**.

## Layers

| Layer | Status |
|-------|--------|
| Core (workspace, capture, approval, ask, knowledge pipeline) | Present |
| External connections (Supabase, Gemini, Jina, env) | Present |
| Harness Bridge (SPEC-PROD-004) | Spec `accepted`; sprint planned — not implemented |
| Product UI (HTTP server, browser, dashboard) | **Removed** — ready for a new product layer |

## Scripts

- `npm test` — Personal Brain core tests  
- `npm run build` — TypeScript build  
- `npm run check-env` — environment configuration check  
- `npm run test-external-connections` — live adapter verification  

See `API.md` and `stage/PRODUCT_LAYER_REMOVAL.md`.
