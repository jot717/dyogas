# Chief Architect — Real UAT Ask Human Workflow

**Agent:** Chief Architect  
**Input:** PO REQ-PB-ASK-01..06  
**Architecture impact:** `product_layer_only` (expected)

## Boundary review

| Boundary | Impact | Notes |
|----------|--------|-------|
| Kernel | **None** | No change |
| Runtime | **None** | No change |
| Trust | **None** (preferred) | Reuse existing owner-attributed approval pattern already used for capture; do not invent new Trust APIs unless SoR write path requires it |
| Agent SDK | **None** | Stay in personal-brain product orchestration |
| Knowledge / Markdown / Graph | **Consumer only** | Learning update may create Knowledge via existing personal-brain approve path |
| personal-brain product | **Yes** | New Ask session model + UI + API |

## Data model (proposed)

- `AskSession` / `AskProposal`: `{ id, workspaceId, question, proposedAnswer, evidence[], status: proposed|approved|edited|rejected, createdAt }`  
- Persist under existing file snapshot (same trust/tenancy model as pending captures)  
- Learning: create pending capture or direct knowledge only after owner Approve + opt-in learn

## Trust

Owner attribution on Approve/Edit-Approve must mirror capture approve (workspace owner). No anonymous SoR writes.

## Architect Decision

**APPROVE** product-layer design direction.  
**Constraint:** Kernel / Runtime / Trust / Agent SDK remain immutable unless Architecture Reviewer later escalates.  
**Do not implement until Founder Approval.**
