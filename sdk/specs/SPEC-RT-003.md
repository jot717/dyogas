# Spec: DYOGAS Agent SDK (MOD-AGENT-SDK)

**Spec ID:** SPEC-RT-003  
**Module:** MOD-AGENT-SDK  
**Trace ID:** TRACE-SDK-001  
**Status:** `accepted`  
**Founder Approval (business):** GRANTED — 2026-07-23 (Module Complete command)  
**Build Order:** B8  
**Dependencies:** MOD-RUNTIME, MOD-KERNEL, MOD-TRUST (immutable); `/contracts` + `/harness/SKILL_SPECIFICATION` consumed (not modified)

---

## Pain Statement

**Who:** Engine implementers and Runtime operators binding agents.  
**How it hurts:** Without an SDK, every engine would fork contract pin checks, skill allowlists, and candidate emission — duplicating Runtime concerns or bypassing contract law.  
**Frequency:** Continuous from first agent bind (B8/B9).  
**Current workaround:** None — contracts exist as docs only.  
**Evidence:** MASTER §6.8 `not_started`; Runtime ADR-0003 forbids Agent bind inside Runtime.

---

## Goals

1. Reusable **contract bind** (id + version pin + preconditions).  
2. **Skill/tool allowlist** invocation stubs under contract.  
3. **Memory contract** interfaces for agent-local memory ops (not SoR writes).  
4. **Candidate emission** for Runtime/Harness seal (unsealed candidates only).  
5. Consume Runtime APIs; **never** replace Runtime admit/state machine.

---

## Non-Goals

1. Pipeline orchestration / run state machine (Runtime).  
2. Implementing Research/Knowledge engine skills or LLM prompts.  
3. Editing contracts/schemas/Harness law.  
4. Cloud egress allow (ADR-0002).  
5. Modifying Kernel/Trust/Runtime packages.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Bind without pin | Rejected 100% in tests |
| Skill not on allowlist | Invoke rejected 100% |
| Candidate unsealed | Emitted candidates `sealed=false` |
| No Runtime fork | SDK does not export admitRun/transition |
| Deps | Only kernel + trust + runtime (+ stdlib) |

---

## Interfaces Touched

`/contracts/**` (consumed) · Skill Spec (consumed) · `@dyogas/runtime` · `@dyogas/kernel` · `@dyogas/trust` · future `sdk/**`

## Duplicate Check

No Agent SDK package exists. **No duplicate.**

## Security

Preconditions fail closed; egress still Trust; no SoR mutation from SDK.
