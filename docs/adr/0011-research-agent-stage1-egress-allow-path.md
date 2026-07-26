# ADR-0011: Research Agent Stage-1 External Source Egress Allow-Path

**Status:** Accepted  
**Date:** 2026-07-26  
**Accepted:** 2026-07-26  
**Deciders:** Architecture Review [`ARCH-RESEARCH-AGENT-EGRESS-001`](../architecture-reviews/ARCH-RESEARCH-AGENT-EGRESS-001.md) **APPROVE** · Founder business acceptance via FULL Band B execution directive 2026-07-26  
**Supersedes:** [ADR-0002](./0002-cloud-ai-egress-boundary.md) **only for** the narrow Research Stage-1 source-fetch allow-path defined below; ADR-0002 deny-default remains the law for all other egress until separately authorized  
**Related:** Constitution Art. VIII, XI; ADR-0002; ADR-0005; SPEC-RT-004; `contracts/agents/research-agent.md` v2.0.0; `DL-RESEARCH-AGENT-EGRESS-001`; `SPRINT-RESEARCH-AGENT-MVP-001` Band B (RA-05, RA-07); TRACE-RESEARCH-AGENT-EGRESS-001

---

## Context

ADR-0002 established **deny-by-default** egress through MOD-TRUST and required a superseding ADR before any allow-path. Research Agent Band A (`SPRINT-RESEARCH-AGENT-MVP-001`) completed offline governed collection (pluggable collectors, budget, provenance, evidence). Band B tasks **RA-05** and **RA-07** were **BLOCKED** on OOS-RE-001 / OOS-T-002 because live Web / GitHub / Reddit collection needs Trust-mediated egress.

This ADR authorizes that allow-path.
## Options Considered

1. **Keep ADR-0002 deny-all indefinitely; never live-collect** — Rejected for Band B product need; Stage-1 remains mock-only forever.
2. **Allow unrestricted research/` network from any collector** — Rejected: violates Art. XI, Trust Visible, and ADR-0002 rule that all egress pass Trust.
3. **Allow cloud LLM summarization + source fetch in one ADR** — Deferred: expands blast radius; Stage-1 Research Agent contract collects evidence, does not summarize via LLM.
4. **Narrow Stage-1 allow-path: `web` + `github` + `reddit` via MOD-TRUST only; fail-closed; rollback R1–R6** — Chosen (this proposal).

## Decision

### D1 — Scope of supersession

This ADR authorizes a **single, narrow egress allow-path**:

- **Caller:** `@dyogas/research-engine` (MOD-RESEARCH) live `SourceCollector` adapters only
- **Purpose:** Research Agent Stage-1 candidate evidence collection for `knowledge-ingestion`
- **Not authorized:** Runtime/SDK/Execution Host redesign; new MOD; `agents/research-agent/` fork; cloud LLM Stage-1 summarization; YouTube (unless a later ADR adds it); product-layer direct network bypassing Trust

ADR-0002 remains binding for every other egress class. Default policy outside this allow-path stays **deny**.

### D2 — Research Agent external source access policy

1. Every live fetch SHALL obtain a MOD-TRUST egress grant for `(tenant_id, source_class, destination_class)` before any network I/O.
2. No module MAY open sockets, HTTP clients, or vendor SDKs for research collection except through Trust-approved adapters.
3. Denied grant → drop that source class, record a coverage gap; if all classes denied → fail closed (`POLICY_DENY`); never fabricate substitute evidence.
4. Secrets (API keys) SHALL load via Trust secrets interface / env — never committed to the repository.

### D3 — Allowed sources (MVP)

| Source class | Allowed | Notes |
|--------------|---------|-------|
| `web` | **Yes** | HTTPS fetch of public URLs within policy |
| `github` | **Yes** | Public repository metadata/content; no private-token expansion without a later ADR |
| `reddit` | **Yes** | Community sources; `signal_tier` MUST NOT be silently upgraded to `primary` |
| `youtube` | **No** (this ADR) | Optional future ADR |
| Other / unlisted | **No** | Fail closed |

`allowed_source_classes` on the brief remains a further intersect: collectors MUST NOT query classes outside the brief allowlist even if this ADR lists them.

### D4 — Provenance requirements

| ID | Requirement |
|----|-------------|
| P1 | Every emitted `evidence_items[].provenance.pointer` MUST be non-empty and resolvable for its `source_class` |
| P2 | Pointer, title, excerpt, and `evidence_id` MUST trace to an actual retrieval in this run — fabrication forbidden |
| P3 | `retrieved_at` SHOULD record collection time |
| P4 | Items lacking resolvable provenance MUST be refused/dropped with an explicit coverage gap (fail closed) |
| P5 | Live adapter identity MUST be distinct from `mock-source-v1` / `fixture-source-v1` |

### D5 — Evidence generation requirements

| ID | Requirement |
|----|-------------|
| E1 | Every live `execute()` run MUST emit machine-readable `CollectionRunEvidence` (kind `research-collection-run-evidence`) |
| E2 | Evidence MUST record: collector adapter id, allowed classes, budget outcome, coverage gaps, per-item pointers |
| E3 | Harness task evidence under `docs/eng-agent/production/` MUST be produced by the verification path for RA-05 / RA-07 |
| E4 | Trust MUST append audit events for allow and deny decisions (Trust Visible) |
| E5 | Hand-authored markdown alone is insufficient to claim PASS |

### D6 — Independent verification requirements

| ID | Requirement |
|----|-------------|
| V1 | Verifier trusts observed exit codes, on-disk evidence, and provenance — never agent self-report |
| V2 | Negative cases required: egress deny → no fabricated items; missing provenance → fail; mock adapter id on a claimed live PASS → **FAIL** |
| V3 | RA-07 MUST demonstrate a live collect (non-mock adapter) end-to-end or remain BLOCKED — mock MUST NOT substitute |
| V4 | Regression suites for `research`, `personal-brain`, `tools/eng-agent`, `tools/dev-orch` MUST remain green |

### D7 — Rollback controls (binding)

On **any** of the following, live collectors MUST revert to offline mock/fixture default; Band A guards remain; RA-05 / RA-07 return to **BLOCKED**; this allow-path is treated as inactive until a new Accepted ADR or Founder re-authorization:

| ID | Condition |
|----|-----------|
| **R1** | This ADR is Rejected, withdrawn, or superseded without replacement allow-path |
| **R2** | Trust egress gate bypassed or research code performs direct network I/O |
| **R3** | Fabricated evidence or mock/fixture substituted for a claimed live PASS |
| **R4** | Runtime / Agent SDK / Execution Host modified without a separate Decision / ADR |
| **R5** | Secrets committed to the repository |
| **R6** | Founder issues explicit rollback / deny directive |

### D8 — Fail-closed preservation

Deny-default outside this allow-path is unchanged. Missing Trust grant, empty provenance, disallowed source class, budget overrun without gap declaration, and verification failure all **fail closed** — never silent success.

## Consequences

- RA-05 / RA-07 may become READY under `SPRINT-RESEARCH-AGENT-MVP-001`.
- Trust SHALL evaluate the Stage-1 allow-path predicates (purpose + source class + https destination).
- MOD-RESEARCH MAY implement live collectors for `web` / `github` / `reddit` via Trust only.
- ADR-0002 status: **Superseded by ADR-0011** for this scoped allow-path; deny-default remains elsewhere.
- Cloud AI vendor selection and Stage-1 LLM summarization remain future ADRs.

## Non-Goals

- YouTube / private GitHub / cloud LLM Stage-1 summarization  
- Runtime, Agent SDK, or Execution Host redesign  
- New Platform Module or `agents/research-agent/` tree  
- Knowledge Plane SoR writes from Stage 1  

---

**End of ADR-0011**
