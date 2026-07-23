# Tech Lead — Implementation Approach (gated)

**Agent:** Tech Lead  
**Input:** PO requirements + Chief Architect boundaries

## Approach

1. **API**
   - `POST /api/ask` → returns `{ proposalId, answer, evidence[], status: "proposed" }` (breaking change from immediate final answer — version UI together)
   - `POST /api/ask/:id/approve` body `{ editedAnswer?: string, learn?: boolean }`
   - `POST /api/ask/:id/reject`
2. **Product core** (`PersonalBrainProduct`)
   - Store proposals in snapshot; `ask()` stops at propose
   - Approve path optional `learn` → enqueue knowledge (pending or approved per PO) with provenance `ask:{proposalId}`
3. **UI**
   - Ask view: Question → Propose → Evidence list → Answer textarea (editable) → Approve / Reject → Learn checkbox
4. **Fallback UX**
   - Extractive fallback wrapped as proposal text (no raw YAML dump as primary UX)

## Components affected

- `src/product/app.ts`, `server.ts`
- `ui/index.html`, `ui/app.js`, `ui/styles.css`
- `tests/**` + `scripts/real-user-acceptance.ts` (assert Approve/Edit/Reject/Learn)
- SPEC-PROD-002 or SPEC-PROD-003

## Testing strategy

- Unit: propose → approve/edit/reject; learn writes knowledge; reject writes nothing  
- Integration: HTTP ask decision endpoints  
- Real UAT Playwright: item 9 must PASS with controls visible and decision persisted  
- Regression: capture approve path unchanged  

## Tech Lead Decision

**APPROVE** approach. **No code until Founder Approval.**
