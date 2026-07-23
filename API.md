# API — Personal Brain Core

Library API (no HTTP product surface).

## Foundation

- `createPersonalBrain({ ownerUserId, displayName })`
- `brain.capture({ kind: "text"|"url", ... }, actorUserId)`
- `brain.ask(query, actorUserId)`
- `brain.list(actorUserId)`
- `normalizeCapture`, `createWorkspace`, `askMyBrain`

## Product core service (persisted workspace)

- `PersonalBrainProduct.openOrCreate({ userId, displayName })`
- `capture` → pending → `approve` / `reject`
- `ask` → `AskProposal` (`status: proposed`) → `approveAsk` / `rejectAsk` (optional `learn`)
- `listKnowledge` / `searchKnowledge` / `listPending`
- `buildMarkdownArtifact`, `loadEnv`

## External adapters

- `src/external/gemini.ts`
- `src/external/jina.ts`
- `src/external/supabase.ts`

HTTP/UI product routes were removed. See `stage/PRODUCT_LAYER_REMOVAL.md`.
