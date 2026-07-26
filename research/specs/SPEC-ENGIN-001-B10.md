# SPEC-ENGIN-001-B10 — Research Engine: Validation + Proposal Path

**Status:** Accepted (Founder autonomous Build Orchestrator command 2026-07-23)  
**Module:** MOD-RESEARCH (enhancement — no new `MOD-*`)  
**Build Order:** B10  
**Parent:** SPEC-ENGIN-001 / ADR-0005  

## Purpose

Implement pipeline stages 2–3 (Source Validation + Proposal) inside MOD-RESEARCH without SoR writes, UI, or live network collectors.

## In Scope

- Rubric-based validation of Research evidence → `ValidationReport` candidate
- Proposal builder from accepted evidence → `Proposal` candidate with `requires_human_approval: true`
- Composable API after `runResearchMvp` (or equivalent evidence set)
- Audit events via Trust

## Out of Scope

- Live collectors (OOS-RE-001)
- Human Approval UI (B11 / MOD-WEB-UI)
- Markdown / Graph / SoR apply
- Second Harness

## Architecture Review

**Verdict:** `no_arch_impact` — capabilities already assigned to MOD-RESEARCH in MASTER §6.10 / §6.16.

## Success Metrics

1. Full coverage of evidence ids in validation results  
2. Rejected evidence never cited in proposal  
3. Empty pain_statement refused  
4. Proposal always `requires_human_approval: true` for knowledge path  
5. Existing Research MVP tests remain green  
