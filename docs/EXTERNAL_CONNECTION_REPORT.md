# External Connection Report — MOD-PERSONAL-BRAIN

**Generated:** 2026-07-23T04:50:24.910Z  
**Overall:** **FAIL**  
**Script:** `npm run test-external-connections`  
**Note:** Secret values are never recorded in this report.

| Service | Test result | Timestamp | Error summary |
|---------|-------------|-----------|---------------|
| Supabase | PASS | 2026-07-23T04:50:24.910Z | — |
| Gemini | FAIL | 2026-07-23T04:50:24.910Z | HTTP 429 RESOURCE_EXHAUSTED |
| Jina Reader | PASS | 2026-07-23T04:50:24.910Z | — |

## Notes

- Supabase: `GET {SUPABASE_URL}/auth/v1/health` (URL normalized; strips trailing `/rest/v1`).
- Gemini: minimal `generateContent` with `GEMINI_MODEL` (default `gemini-3.5-flash`).
- Jina: Reader fetch of `https://example.com` with Bearer auth.
