# Spec: DYOGAS Trust Adapters (MOD-TRUST) — Trust & Control Plane

**Spec ID:** SPEC-RT-004  
**Module:** MOD-TRUST  
**Trace ID:** TRACE-TRUST-001  
**Future Backlog ID:** BACKLOG-TRUST-001  
**Requester:** Founder (business sponsor — not Product Owner)  
**Spec Author:** Harness Execution Engine / Chief Architect Agent (draft)  
**Status:** `accepted`  
**Founder Approval (business):** GRANTED — 2026-07-23  
**Build Order:** B6  
**Dependencies:** MOD-KERNEL only (`@dyogas/kernel` — immutable completed dependency). No Runtime, Agent SDK, or Engine dependencies.

---

## Pain Statement

**Who:** Runtime, Agent SDK, and Engine implementers; Security / Trust & Control Owner.  
**How it hurts:** Without shared Trust adapters, every downstream module would invent its own identity checks, secret handling, egress decisions, and audit writes — forking policy, bypassing deny-by-default, and violating Constitution Art. VI / IX–XI and “Trust Visible.” Runtime cannot lawfully admit privileged paths or Cloud AI calls without a single Trust gate.  
**Frequency:** Continuous from first Runtime/Engine Implementation line after Kernel.  
**Current workaround:** None — Kernel explicitly does not perform egress or audit sink; no Trust package exists.  
**Evidence:** MASTER_ARCHITECTURE §6.9 MOD-TRUST (`not_started`); Build Order B6; Kernel MODULE COMPLETE with non-goal “no egress”; `docs/ARCHITECTURE.md` Trust & Control Plane; planned SPEC-ADR-PLANNED-002 (Cloud AI / egress ADR) still not Accepted.

---

## Goals

1. Provide **minimal Trust adapters** for: identity/authZ context (built on Kernel tenancy), **secrets** access interface (redact; no secrets in repo), **egress gate** (deny-by-default), and **append-only audit sink** interface.  
2. Depend only on **MOD-KERNEL**; remain free of Harness pipeline orchestration, agent bind, and SoR mutation.  
3. Enable **MOD-RUNTIME** (and later engines) to call Trust for allow/deny + audit persistence without cycles.  
4. Align with Constitution Art. IX–XI and Product Principle “Trust Visible” (egress/consent must be attributable and auditable).

---

## Non-Goals

1. Choosing Cloud AI Compute **vendor** or implementing a full cloud client (requires Build Order **B3** ADR — SPEC-ADR-PLANNED-002 — before any cloud egress is **allowed**).  
2. Pipeline engine, agent bind, Human Approval UI, Knowledge SoR ownership.  
3. Full enterprise IAM / OIDC product; MVP may use local/dev identity adapters with a clear extension point.  
4. Hosted Engineering Agents (`MOD-ENG-AGENTS`).  
5. Changing Kernel APIs or reopening MOD-KERNEL (immutable).  
6. Implementing Runtime state machine.

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Deny-by-default egress | 100% of egress requests without explicit allow policy are denied in unit tests | Automated Trust tests |
| Audit append integrity | Audit sink rejects in-place mutation / overwrite of prior events in tests | Unit tests on sink interface |
| Secrets never logged raw | Secret values absent from Trust log-field / dump paths in tests | Security tests |
| Kernel-only dependency | Trust package imports `@dyogas/kernel` public API only; no Runtime/Harness/pipeline imports | Package boundary test |
| Runtime linkability | Fixture consumer (Runtime proxy) compiles against Trust public export | Smoke compile/link |

---

## Interfaces Touched

| Surface | Impact |
|---------|--------|
| `/docs/ARCHITECTURE.md` | Consumed (Trust & Control Plane) |
| `/docs/PRODUCT_PRINCIPLES.md` | Consumed (“Trust Visible”) |
| `/CONSTITUTION.md` Art. IX–XI | Constraints (read-only) |
| `kernel/` (`@dyogas/kernel`) | **Dependency only** — consume public API; do not modify |
| Future `trust/**` | Created at Implementation (after Arch Review + Backlog + …) |
| `/harness` Audit / Human Approval sections | Consumed as non-goal boundary (Trust does not own Harness) |
| Planned ADR (SPEC-ADR-PLANNED-002 / B3) | May be required by Architecture Review before cloud egress allow-paths |
| Runtime / Engines | Downstream consumers only |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Spec scope expands into Cloud AI vendor | Non-goal #1; Architecture Review may set `adr_required` for B3 before allow-cloud |
| Trust becomes second orchestrator | Non-goal: no pipeline/Harness orchestration; boundary tests |
| Secret leakage via Kernel log fields | Use Kernel log helpers; Trust redaction tests |
| Premature Runtime coupling | Dependencies = Kernel only |

---

## Open Questions

1. Exact audit event schema (Harness vs Trust-owned) — resolve at Architecture Review / ADR if needed; MVP may define a minimal Trust-local audit record that Runtime can wrap.  
2. Whether local-only “deny all egress” MVP ships before B3 ADR Accept — preferred default until B3 exists.  
3. Identity adapter for solo-founder local-first (file/env vs OS keychain) — Implementation choice under Arch Review / backlog, not Spec lock.

---

## Duplicate Check

No Trust adapter module or package exists. Kernel does not implement egress/audit sink. **No duplicate** (Constitution Art. VI). Consolidates planned SPEC-RT-004 / Build Order B6 only.

---

## Security / Ownership

- Deny-by-default egress and policy checks.  
- No secrets committed to the repository.  
- Append-only audit semantics; no silent privileged bypass.  
- Trust does not mutate Knowledge SoR.  
- Cloud egress allow-paths blocked until B3 Cloud AI / egress ADR is Accepted (Architecture Review to confirm).

---

## Alignment

- **Build Order B6:** Depends on Kernel only — satisfied.  
- **Product Vision / Principles:** Trust Visible; local-first; Cloud AI as compute not owner.  
- **ADR-0001:** Trust Implementation SHALL use Accepted stack (TypeScript / Node 22 / npm / `node:test`+`tsx`).

---

## Engineering Agent Approval Chain (Process Mode)

| Agent | Verdict | Artifact |
|-------|---------|----------|
| Product Owner Agent | approve | `trust/stage/reviews/spec-product-owner-agent.md` |
| Chief Architect Agent | approve | `trust/stage/reviews/spec-chief-architect-agent.md` |
| Tech Lead Agent | approve | `trust/stage/reviews/spec-tech-lead-agent.md` |
| Engineering Manager Agent | approve | `trust/stage/reviews/spec-engineering-manager-agent.md` |
| Architecture Reviewer Agent | approve | `trust/stage/reviews/spec-architecture-reviewer-agent.md` |
| Founder Approval (business) | **GRANTED** — 2026-07-23 | `trust/stage/FOUNDER_APPROVAL_SPEC-RT-004.md` |

**Specification stage:** COMPLETE.  
**Architecture Review:** COMPLETE (`adr_required` → ADR-0002 Accepted).  
**Module:** COMPLETE — see `trust/stage/MODULE_COMPLETE.md`.
