# RA-08 — Sprint Exit

**Sprint:** SPRINT-RESEARCH-AGENT-MVP-001  
**Auth:** DL-RESEARCH-AGENT-MVP-001 **APPROVED**  
**Date:** 2026-07-26  
**Exit:** **PASS** (Band A)  
**Band B:** **BLOCKED** (allow-egress ADR — not claimed)

---

## Sprint summary

Band A of the Research Agent MVP is complete under the existing **MOD-RESEARCH**
module (`research/`). No new `agents/research-agent/` tree and no new MOD were created.

Governed collection now enforces: pluggable `SourceCollector`, hard `max_items` /
`max_seconds` stops, resolvable provenance, source-class allowlist, explicit
coverage gaps, and runtime `CollectionRunEvidence`.

## Completed tasks

| Task | Result |
|------|--------|
| RA-01 | DONE — `docs/research-agent/RA-01-mvp-spec.md` |
| RA-02 | DONE — execution packages under `docs/dev-orch/execution-packages/` |
| RA-03 | DONE — `research/src/collection.ts` + execute path |
| RA-04 | DONE — `CollectionRunEvidence` from `execute()` |
| RA-06 | DONE — independent verification tests |
| RA-08 | DONE — this exit |

## Blocked tasks

| Task | Blocker |
|------|---------|
| RA-05 | OOS-RE-001 / OOS-T-002 — Accepted ADR superseding ADR-0002 required |
| RA-07 | OOS-RE-001 — live-source autonomous E2E; mock must not substitute |

## Test evidence

| Package | npm test | npm run build |
|---------|----------|---------------|
| `research` | 21 pass / 0 fail | PASS |
| `personal-brain` | 48 pass / 0 fail | PASS |
| `tools/eng-agent` | 52 pass / 0 fail / 1 skipped (live Cursor e2e — no API key) | PASS |
| `tools/dev-orch` | 64 pass / 0 fail | PASS |

## Boundary confirmation

- Zero Runtime / Agent SDK / Execution Host source changes for this sprint
- Zero new MOD / `agents/research-agent/` tree
- No external network access introduced
- Contract `research-agent` remains v2.0.0 (read-only)

## Known limitations

1. **Band B blocked** until Trust allow-egress ADR Accepted.
2. **CURSOR_API_KEY** was absent; Coding Agent work for RA-03…RA-06 ran **in-session**
   under Founder APPROVED directive (same pattern as HFP-01). Resolution mechanism itself
   is verified; live `@cursor/sdk` Agent.prompt was not used this sprint.
3. Default collector remains mock when none is injected — fixture collector proves
   substitutability offline (SAC-3).

## SAC checklist

| SAC | Result |
|-----|--------|
| SAC-1 | PASS |
| SAC-2 | PASS |
| SAC-3 | PASS |
| SAC-4 | PASS |
| SAC-5 | PASS |
| SAC-6 | PASS |
| SAC-7 | PASS |
| SAC-8 | PASS |
| SAC-9 | PASS |
| SAC-10 | PASS |
| SAC-11 | PASS (Band B explicitly BLOCKED) |

```text
SPRINT-RESEARCH-AGENT-MVP-001 EXIT: PASS (Band A)
RA-01..RA-04, RA-06, RA-08: DONE
RA-05, RA-07: BLOCKED (allow-egress ADR)
Forbidden scope changes: 0
```

---

**End of RA-08**
