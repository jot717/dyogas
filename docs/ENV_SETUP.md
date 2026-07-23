# Environment Setup — MOD-PERSONAL-BRAIN

**Related:** [`EXTERNAL_DEPENDENCY_SETUP.md`](./EXTERNAL_DEPENDENCY_SETUP.md)  
**Files:** `.env.example` (committed) · `.env.local` (gitignored, empty until you fill)

---

## 1. Required accounts

| Service | Account |
|---------|---------|
| **Supabase** | [supabase.com](https://supabase.com) — project for Auth, DB, Storage, pgvector |
| **Google Gemini** | [Google AI Studio](https://aistudio.google.com) / Google Cloud — Gemini API key |
| **Jina** | [jina.ai](https://jina.ai) — Reader API |
| **Google Cloud** (optional) | Cloud project with **YouTube Data API v3** enabled |

---

## 2. Where each key is obtained

| Variable | Where to get it |
|----------|-----------------|
| `NODE_ENV` | Set locally (`development` for MVP local work) |
| `SUPABASE_URL` | Supabase → Project Settings → API → **Project URL** |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → **`anon` `public`** key |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API → **`service_role`** key (server-only) |
| `GEMINI_API_KEY` | Google AI Studio → Get API key (or Google Cloud Gemini API credentials) |
| `GEMINI_MODEL` | Model id string; MVP default `gemini-3.5-flash` (`gemini-2.5-flash` is unavailable to many new API keys) |
| `JINA_API_KEY` | Jina dashboard → Reader / API keys |
| `YOUTUBE_API_KEY` | Google Cloud Console → APIs & Services → Credentials → API key (YouTube Data API v3) |

---

## 3. Required for MVP (external mode)

Fill these in `personal-brain/.env.local` before enabling cloud integrations:

| Variable | Required for MVP |
|----------|------------------|
| `NODE_ENV` | **Yes** |
| `SUPABASE_URL` | **Yes** |
| `SUPABASE_ANON_KEY` | **Yes** |
| `SUPABASE_SERVICE_KEY` | **Yes** |
| `GEMINI_API_KEY` | **Yes** |
| `JINA_API_KEY` | **Yes** |

---

## 4. Optional

| Variable | Notes |
|----------|--------|
| `GEMINI_MODEL` | Defaults to `gemini-3.5-flash` (preferred MVP; `gemini-2.5-flash` often 404 for new keys) |
| `YOUTUBE_API_KEY` | Optional capture source; leave empty if unused |

---

## 5. Local steps

1. Copy names from `.env.example` (already mirrored in `.env.local`).  
2. Paste **real values only into `.env.local`** — never into `.env.example` or git.  
3. Run validation:

```bash
cd personal-brain
npm run check-env
```

4. Expect **FAIL** until secrets are filled; the script must **not** print secret values.

---

## 6. Security

- `.env.local` is gitignored (repo root + `personal-brain/.gitignore`).  
- Never commit `SUPABASE_SERVICE_KEY` or `GEMINI_API_KEY`.  
- Browser clients must not receive `SUPABASE_SERVICE_KEY`.

---

## 7. Validation command

```bash
npm run check-env
```

Exit code `0` = all **required** vars non-empty.  
Exit code `1` = one or more required vars missing/empty.
