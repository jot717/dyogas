# SPEC-PROD-003 — Ask My Brain Human Approval Workflow

**Status:** Accepted (Founder APPROVE 2026-07-23)  
**Module:** MOD-PERSONAL-BRAIN only  
**Parent:** SPEC-PROD-002 / ADR-0009  
**Requirements:** REQ-PB-ASK-01..06  
**Sprint:** SPRINT-PB-ASK-HUMAN-001

## Purpose

Make Ask My Brain a trusted collaborator: retrieve → propose → show evidence → owner approve/edit/reject → optional learning update.

## In Scope

- `AskProposal` persisted in workspace snapshot  
- `POST /api/ask` returns `status: proposed` (not final)  
- Evidence list separate from proposed answer  
- `POST /api/ask/:id/approve` with optional `editedAnswer`, `learn`  
- `POST /api/ask/:id/reject`  
- UI decision gate  
- Real UAT item 9 must PASS  

## Out of Scope

- Kernel / Runtime / Trust / Agent SDK source changes  
- Binary document upload (GAP-04c)  

## Architecture Review

**Verdict:** `no_arch_impact` — product layer only; SoR writes reuse owner-attributed Knowledge path.

## Success Metrics

1. Ask never auto-finalizes an answer without owner decision  
2. Evidence visible before decision  
3. Approve / Edit+Approve / Reject work  
4. Optional learn stores Q&A knowledge with `ask:{proposalId}` provenance  
5. `npm test` green; Playwright real UAT item 9 PASS  
