# @dyogas/personal-brain

MOD-PERSONAL-BRAIN — Personal Second Brain **core + external connection layer** (SPEC-PROD-001 / ADR-0009).

Consumes Knowledge + Graph. Does not modify Kernel, Runtime, Trust, or Research.

## Layers

| Layer | Status |
|-------|--------|
| Core (workspace, capture, approval, ask, knowledge pipeline) | Present |
| External connections (Supabase, Gemini, Jina, env) | Present |
| Product UI (HTTP server, browser, dashboard) | **Removed** — ready for a new product layer |

## Scripts

- `npm test` — Personal Brain core tests  
- `npm run build` — TypeScript build  
- `npm run check-env` — environment configuration check  
- `npm run test-external-connections` — live adapter verification  

See `API.md` and `stage/PRODUCT_LAYER_REMOVAL.md`.
