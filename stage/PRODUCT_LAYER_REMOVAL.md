# PRODUCT_LAYER_REMOVAL — MOD-PERSONAL-BRAIN

**Date:** 2026-07-23  
**Type:** Controlled deletion (not reset, not archive)  
**Authority:** Harness Execution Engine  

---

## Classification (pre-deletion)

### DYOGAS Core (DO NOT MODIFY)

`kernel/`, `trust/`, `runtime/`, `sdk/`, `research/`, `knowledge/`, `graph/` (+ embedding via graph-engine). **Unchanged.**

### Personal Brain Core (KEEP)

| Path | Role |
|------|------|
| `src/workspace.ts` | Workspace logic |
| `src/capture.ts` | Capture normalization |
| `src/ask.ts` | Ask foundation |
| `src/brain.ts` | Brain service |
| `src/index-store.ts` | Personal index |
| `src/knowledge/markdown-artifact.ts` | Knowledge markdown pipeline |
| `src/persist/file-store.ts` | Persistence |
| `src/product/app.ts` | Core service: capture → approve → ask proposals → learn |
| `tests/brain.test.ts`, `tests/product.test.ts` | Core tests |
| `specs/SPEC-PROD-001..003.md` | Specs |
| `contracts/` / `schemas/` (repo root) | Platform contracts/schemas (untouched) |
| `supabase/migrations/` | Schema for optional sync |

### External Connection Layer (KEEP)

| Path | Role |
|------|------|
| `src/external/gemini.ts` | Gemini adapter |
| `src/external/jina.ts` | Jina Reader adapter |
| `src/external/supabase.ts` | Supabase adapter |
| `src/env.ts` | Environment configuration |
| `scripts/check-env.ts` | Env validation |
| `scripts/test-external-connections.ts` | Live connection tests |
| `docs/ENV_SETUP.md`, `EXTERNAL_*` | Connection docs |
| `.env.example` | Env template |

### Product UI Layer (DELETE)

| Path | Role |
|------|------|
| `ui/index.html`, `ui/app.js`, `ui/styles.css` | Browser UI / dashboard / login |
| `src/product/server.ts` | HTTP web routes + static serving |
| `scripts/dev.ts` | Product server entry |
| `scripts/acceptance-audit.ts` | UI/HTTP acceptance demo |
| `scripts/acceptance-restart.ts` | HTTP restart demo |
| `scripts/smoke-human-test.ts` | HTTP product smoke |
| `scripts/real-user-acceptance.ts` | Playwright browser UAT |
| `docs/LOCAL_PRODUCT_TEST.md` | Product UX test guide |
| `playwright` (devDependency) | Browser automation for deleted UI |

---

## Removed

- Entire `ui/` frontend (login, dashboard, capture/knowledge/ask presentation)
- HTTP product server (`server.ts`) and `npm run dev` / `start`
- Demo / browser acceptance scripts (audit, restart, smoke, real-uat)
- Playwright dependency
- `startServer` export from package public API
- Stale `dist/product/server.*` artifacts

## Preserved

- All DYOGAS Core packages (unmodified)
- Personal Brain workspace / capture / ask / approval / knowledge pipeline
- `PersonalBrainProduct` core service (`src/product/app.ts`)
- Supabase, Gemini, Jina adapters + env + connection tests
- Core unit tests (`tests/**`)
- Specs, API.md (library surface), supabase migration

## Validation results

| Suite | Result | Notes |
|-------|--------|-------|
| DYOGAS Core (`kernel`, `trust`, `runtime`, `sdk`, `research`, `knowledge`, `graph`) | **PASS** | All package tests green; none modified |
| Personal Brain Core (`npm test`) | **PASS** | 9/9 |
| Personal Brain Build (`npm run build`) | **PASS** | |
| Env check (`npm run check-env`) | **PASS** | 6/6 required keys |
| External connections (live) | **PARTIAL** | Supabase **PASS**, Jina **PASS**, Gemini **FAIL** HTTP 429 `RESOURCE_EXHAUSTED` (quota) — adapters preserved; not a deletion regression |
| Product UI | **REMOVED** | `ui/` absent; `server.ts` absent |

## Post-state

Ready for a **new product layer** to consume `@dyogas/personal-brain` core + adapters without the deleted UX assumptions.
