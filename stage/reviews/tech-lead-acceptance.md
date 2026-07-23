# Tech Lead Agent — Approach

**Agent:** Tech Lead  
**Verdict:** **approve**

## Approach

1. `PersonalBrainProduct.search(query)` — keyword filter on title/markdown/tags  
2. `GET /api/knowledge?q=` — optional query param  
3. Knowledge UI: search input filters list  
4. Empty-state strings in `ui/app.js` for dash/knowledge/ask  
5. `scripts/acceptance-restart.ts` — capture/approve → kill N/A for external server; instead spawn ephemeral server on free port, write data, kill process, restart, assert knowledge  

## Testing

- Unit: search filter  
- Integration: API `?q=`  
- Smoke: restart persistence script  
- Regression: existing `npm test` + `acceptance-audit.ts`
