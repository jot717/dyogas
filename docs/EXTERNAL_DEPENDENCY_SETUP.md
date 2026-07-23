# External Dependency Setup — MOD-PERSONAL-BRAIN

**Document ID:** SETUP-PB-EXT-001  
**Module:** MOD-PERSONAL-BRAIN  
**Sprint:** SPRINT-PB-MVP-001 (MVP Implementation)  
**Status:** Setup plan (documentation only — **no application code**)  
**Date:** 2026-07-23  
**Related:** [`../stage/GAP_ANALYSIS.md`](../stage/GAP_ANALYSIS.md) · [`../stage/SPRINT-MVP-IMPL.md`](../stage/SPRINT-MVP-IMPL.md) · ADR-0002 (deny-by-default egress) · ADR-0009

---

## 1. Purpose

Define accounts, secrets, environment variables, local setup, and security rules for **external services** required to productize Personal Brain beyond in-memory / local-hash CORE.

This document does **not** authorize Implementation. Enabling live network/AI calls from DYOGAS code requires an **Accepted superseding ADR to ADR-0002** (Trust allow-egress) before product code may call these APIs. Until then, keys may be provisioned for Founder dry-runs only.

---

## 2. Service map (MVP)

| Service | Role in Personal Brain | MVP required? |
|---------|------------------------|---------------|
| **Supabase** | Auth, Postgres DB, Storage (documents), **pgvector** embeddings | **Yes** (persistence + auth + vectors) |
| **OpenAI API** | Extraction, embeddings, Ask My Brain generation | **Yes** (AI pipeline) |
| **Jina Reader API** | URL → clean text extraction | **Yes** (real URL capture) |
| **Google YouTube Data API** | Optional video/metadata capture source | **Optional** (stretch) |

Platform rule reminder: product adapters under `personal-brain/` must still route egress through **Trust policy** once Implementation lands (no bypass of MOD-TRUST).

---

## 3. Required accounts

### 3.1 Supabase

| Step | Action |
|------|--------|
| 1 | Create account at [https://supabase.com](https://supabase.com) |
| 2 | Create a **new project** (e.g. `dyogas-personal-brain-dev`) |
| 3 | Choose region closest to Founder (note region for latency/compliance) |
| 4 | Wait for project provisioning; open **Project Settings → API** and **Database** |
| 5 | Enable **Authentication** providers for MVP: **Email** (password or magic link). Defer Google/GitHub OAuth to future |
| 6 | Open **Database → Extensions** and enable **`vector`** (pgvector) |
| 7 | Open **Storage** and plan a private bucket (create in Implementation; name reserved below) |

**MVP schema intent (plan only — do not apply from this doc):**

- `profiles` — maps auth user → Personal Brain owner / workspace
- `workspaces` — workspace metadata + ownership
- `knowledge_artifacts` — persisted knowledge bodies + provenance (logical SoR mirror; platform Knowledge Engine remains apply API in-process until adapter lands)
- `pending_captures` — draft queue pre-approval
- `embeddings` — `vector` column (dimension must match chosen OpenAI embedding model)

Exact DDL belongs in a later Implementation migration under `personal-brain/` — not in this setup doc.

### 3.2 OpenAI

| Step | Action |
|------|--------|
| 1 | Create / use account at [https://platform.openai.com](https://platform.openai.com) |
| 2 | Add billing (API calls fail without quota) |
| 3 | Create an API key under **API keys** (project-scoped if available) |
| 4 | Prefer a **dedicated project** named `dyogas-personal-brain` for spend isolation |
| 5 | Note organization ID if using org-level keys |

**MVP model intent (plan):**

| Use | Suggested model (configurable via env) |
|-----|----------------------------------------|
| Extraction / summarization | `gpt-4o-mini` (cost-efficient MVP) |
| Embeddings | `text-embedding-3-small` |
| Ask My Brain | `gpt-4o-mini` with **retrieval-grounded** prompts only (cite artifact ids) |

### 3.3 Jina Reader API

| Step | Action |
|------|--------|
| 1 | Create account / obtain access at [https://jina.ai](https://jina.ai) (Reader API) |
| 2 | Create an API key for Reader |
| 3 | Confirm rate limits for MVP (solo Founder traffic) |

**MVP use:** `URL capture` → Jina Reader → clean markdown/text → Personal Brain pending pipeline (not silent SoR write).

### 3.4 Google Cloud / YouTube Data API (optional)

| Step | Action |
|------|--------|
| 1 | Create / select Google Cloud project |
| 2 | Enable **YouTube Data API v3** |
| 3 | Create **API key** restricted to YouTube Data API v3 |
| 4 | (Later) OAuth client only if uploading/private user data — **not required for public metadata MVP** |

**MVP use (optional):** paste YouTube URL → fetch title/description/channel metadata → treat as capture source. Full transcript fetch may need additional APIs/services — **future**.

---

## 4. API keys & secrets inventory

| Secret | Where issued | Store in | Never commit |
|--------|--------------|----------|--------------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL | `.env.local` / secret manager | Yes |
| `SUPABASE_ANON_KEY` | Supabase → `anon` `public` key | `.env.local` (browser-safe **only** with RLS) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → `service_role` | **Server-only** secret store | **Critical** — yes |
| `SUPABASE_DB_URL` | Database → Connection string (URI) | Server-only (migrations) | Yes |
| `OPENAI_API_KEY` | OpenAI dashboard | Server-only | Yes |
| `OPENAI_ORG_ID` | Optional | Server-only | Yes |
| `JINA_API_KEY` | Jina dashboard | Server-only | Yes |
| `YOUTUBE_API_KEY` | Google Cloud | Server-only | Yes |
| `PERSONAL_BRAIN_SESSION_SECRET` | Generate locally (`openssl rand -hex 32`) | Server-only | Yes |

**Recommended file layout (when Implementation starts):**

```text
personal-brain/
  .env.example          # committed — names only, no values
  .env.local            # gitignored — real values
```

Do **not** put secrets in `MASTER_ARCHITECTURE`, Specs, or chat logs.

---

## 5. Environment variables (canonical names)

### 5.1 Feature flags

| Variable | Example | Meaning |
|----------|---------|---------|
| `PERSONAL_BRAIN_EXTERNAL_ENABLED` | `false` | Master switch; `false` = local/file fallbacks only |
| `PERSONAL_BRAIN_USE_SUPABASE` | `false` | Persist/auth via Supabase when true |
| `PERSONAL_BRAIN_USE_OPENAI` | `false` | Extraction / embed / ask via OpenAI when true |
| `PERSONAL_BRAIN_USE_JINA` | `false` | URL fetch via Jina when true |
| `PERSONAL_BRAIN_USE_YOUTUBE` | `false` | Optional YouTube metadata when true |

### 5.2 Runtime / product

| Variable | Example | Required when |
|----------|---------|----------------|
| `PERSONAL_BRAIN_DATA_DIR` | `./.data/personal-brain` | Local file fallback |
| `PERSONAL_BRAIN_PORT` | `8787` | HTTP product server |
| `PERSONAL_BRAIN_SESSION_SECRET` | *(random)* | Any cookie session |
| `PERSONAL_BRAIN_PUBLIC_URL` | `http://127.0.0.1:8787` | Auth redirects / CORS |

### 5.3 Supabase

| Variable | Example | Notes |
|----------|---------|-------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Project URL |
| `SUPABASE_ANON_KEY` | `eyJ...` | Client + RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Server only; bypasses RLS — treat as root |
| `SUPABASE_DB_URL` | `postgresql://postgres:...@db....supabase.co:5432/postgres` | Migrations / pgvector admin |
| `SUPABASE_STORAGE_BUCKET` | `personal-brain-docs` | Private bucket name |
| `SUPABASE_JWT_SECRET` | *(from settings)* | Only if verifying JWTs outside Supabase SDK |

### 5.4 OpenAI

| Variable | Example | Notes |
|----------|---------|-------|
| `OPENAI_API_KEY` | `sk-...` | Server only |
| `OPENAI_ORG_ID` | `org-...` | Optional |
| `OPENAI_EXTRACT_MODEL` | `gpt-4o-mini` | Extraction / summarize |
| `OPENAI_EMBED_MODEL` | `text-embedding-3-small` | Must match pgvector dimensions |
| `OPENAI_ASK_MODEL` | `gpt-4o-mini` | Ask My Brain |
| `OPENAI_EMBED_DIMENSIONS` | `1536` | Align DB `vector(n)` |

### 5.5 Jina

| Variable | Example | Notes |
|----------|---------|-------|
| `JINA_API_KEY` | `jina_...` | Reader auth |
| `JINA_READER_BASE_URL` | `https://r.jina.ai` | Confirm current docs at Implementation time |

### 5.6 YouTube (optional)

| Variable | Example | Notes |
|----------|---------|-------|
| `YOUTUBE_API_KEY` | `AIza...` | Restrict by API + IP/referrer when possible |
| `YOUTUBE_API_BASE_URL` | `https://www.googleapis.com/youtube/v3` | |

---

## 6. Local development setup (accounts ready, code not written)

### 6.1 Prerequisites

- Node.js **22+** (platform standard)
- Git
- Optional: Supabase CLI (`npm i -g supabase`) for local emulators later
- Optional: Docker (local Postgres + pgvector if not using hosted Supabase)

### 6.2 Founder checklist (before Implementation)

1. Create Supabase project; enable **Email Auth** + **`vector` extension**.  
2. Create OpenAI project + API key; set soft spend limit.  
3. Create Jina Reader API key.  
4. (Optional) Enable YouTube Data API v3 + restricted key.  
5. Copy env **names** into a private password manager entry `dyogas/personal-brain/dev`.  
6. Create empty gitignored `.env.local` template locally (values only on Founder machine).  
7. Confirm ADR-0002 supersession plan with Founder (**allow-list hosts**):  
   - `*.supabase.co`  
   - `api.openai.com`  
   - `r.jina.ai` (or current Jina Reader host)  
   - `www.googleapis.com` (if YouTube enabled)

### 6.3 Suggested local topology (MVP)

```text
Browser (Personal Brain UI)
    → personal-brain HTTP server (Node)
        → Trust egress gate (when allow ADR Accepted)
            → OpenAI / Jina / YouTube
        → Supabase (Auth + DB + Storage + pgvector)
        → @dyogas/knowledge-engine / graph-engine (in-process apply path)
```

### 6.4 Local without paid APIs (fallback mode)

Keep `PERSONAL_BRAIN_EXTERNAL_ENABLED=false`:

- Auth: demo local login (CORE sprint plan)
- DB: file under `PERSONAL_BRAIN_DATA_DIR`
- Embeddings: existing local-hash Graph path
- URL: metadata-only (no Jina)
- Ask: extractive Ask My Brain (CORE)

This preserves offline / CI testability without secrets.

---

## 7. Security rules

### 7.1 Non-negotiables

1. **No secrets in git** — enforce `.gitignore` for `.env.local`, `*.pem`, service role keys.  
2. **Service role key never shipped to browser** — only Node server / trusted workers.  
3. **Anon key only with RLS enabled** on all user tables before any client read/write.  
4. **Egress deny-by-default** until superseding ADR to ADR-0002 is Accepted.  
5. **Minimize payload to cloud AI** — send extract/summary prompts with user content under consent; do not upload entire private corpora unnecessarily.  
6. **Knowledge SoR mutation** remains approval-gated (ADR-0006); external extractors MUST land in **pending** queue, not silent apply.  
7. **Audit** — log external call purpose, model/host, tenant/workspace id (not raw secrets) via Trust audit sink when Implementation lands.  
8. **Storage bucket private** — documents not public; signed URLs short-lived.  
9. **YouTube key restriction** — API restriction + application restriction (IP or HTTP referrer).  
10. **Spend caps** — OpenAI monthly budget alert; Supabase plan awareness.

### 7.2 Row Level Security (Supabase) — policy intent

| Table / object | Policy intent |
|----------------|---------------|
| `workspaces` | User can CRUD only rows where `owner_id = auth.uid()` |
| `knowledge_artifacts` | Select/insert/update only within owned workspaces |
| `pending_captures` | Same ownership boundary |
| `embeddings` | Same; no cross-tenant vector reads |
| Storage objects | Path prefix `workspace_id/user_id/...`; deny cross-prefix |

Exact SQL policies are Implementation artifacts.

### 7.3 Data classes allowed to leave the machine (MVP proposal for future ADR)

| Data class | Supabase | OpenAI | Jina | YouTube |
|------------|----------|--------|------|---------|
| Account email / auth | Yes | No | No | No |
| Capture text / doc text | Yes (DB) | Yes (process) | N/A | N/A |
| URL string | Yes | Optional | Yes (fetch target) | Yes (video id) |
| Embeddings | Yes (pgvector) | Produced by API | No | No |
| Raw service keys | Never in DB | N/A | N/A | N/A |

---

## 8. MVP vs future integrations

### 8.1 MVP (this productization track)

| Include | Exclude |
|---------|---------|
| Supabase Auth (email), DB, private Storage, pgvector | Enterprise SSO / OIDC product |
| OpenAI extract + embed + grounded ask | Fine-tuned custom models |
| Jina Reader for URL text | Full browser automation / JS-heavy sites guarantee |
| Optional YouTube **public metadata** | Private playlist OAuth, full transcript pipeline |
| Feature flags + local fallbacks | Always-on cloud with no offline mode |
| Pending → Human Approval before SoR | Autopilot SoR writes |

### 8.2 Future (post-MVP)

| Integration | Trigger |
|-------------|---------|
| Google/GitHub OAuth via Supabase | User demand |
| Cloud LLM allow ADR + vendor contract | Founder commercial decision |
| Multi-region Supabase / backups | Production SLA |
| Alternative embed hosts (open models) | Cost / sovereignty push |
| Transcript providers for YouTube | Capture quality |
| Composio / other MCP tool brokers | Agent skill expansion |
| Production secrets manager (1Password/Vault/AWS SM) | Team ops |

---

## 9. Governance checklist before writing application code

| # | Gate | Owner |
|---|------|-------|
| 1 | Accounts + keys created in password manager | Founder |
| 2 | `.env.example` names agreed (this doc §5) | Product MVP Implementation Agent |
| 3 | SPEC-PROD-002 references external adapters + flags | Harness / Spec |
| 4 | **Superseding ADR to ADR-0002** lists allow hosts + data classes | Founder + Architecture |
| 5 | RLS + private bucket designed | Implementation (after ADR) |
| 6 | CI uses **mocks/fallbacks** — no real keys in GitHub Actions | Engineering |

**Stop condition:** Do not implement live OpenAI/Jina/YouTube/Supabase clients in `personal-brain` until items **3–4** are Accepted.

---

## 10. Quick reference — Founder “create these now”

1. Supabase project + Email Auth + `vector` extension  
2. OpenAI API key + spend limit  
3. Jina Reader API key  
4. (Optional) Google Cloud project + YouTube Data API key  
5. Password manager entry with all secrets  
6. Calendar note: schedule **allow-egress ADR** before Implementation Wave that hits the network  

---

**End of SETUP-PB-EXT-001** — documentation only; no application code in this change.
