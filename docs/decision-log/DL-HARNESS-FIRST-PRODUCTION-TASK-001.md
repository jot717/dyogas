# Decision

**ID:** DL-HARNESS-FIRST-PRODUCTION-TASK-001  
**Date:** 2026-07-26  
**Owner:** Founder (business authority)  
**Mode:** Development Harness — Planning Mode  
**Status:** **APPROVED**  
**Decision:** **APPROVED** (Founder READY_FOR_EXECUTION directive for HFP-01 — 2026-07-26)  
**Implementation authorization:** **YES** (HFP-01 only)  
**Approved:** 2026-07-26  
**Trace:** `TRACE-HARNESS-FIRST-PRODUCTION-001`  
**Selected gap:** `GAP-BR-012`

---

## Subject

Authorize the Development Harness to execute its first non-fixture production engineering task:
enforce fail-closed ambient Kernel tenant alignment in Personal Brain `createBridgeRun`
(GAP-BR-012), without changing Runtime, Agent SDK, Execution Host, or pipeline topology.

## Repository audit decision

Independent SSOT audit overturned the earlier provisional pick of `GAP-BR-001`.

| Candidate | Verdict |
|-----------|---------|
| **GAP-BR-012** | **Selected.** Genuinely OPEN product obligation: fail-closed ambient Kernel tenancy before `createRun`. No Spec/ADR required. No Host rewrite. One function + existing C-02 tests. |
| GAP-BR-001 | **Rejected.** Registry Decision Required: Spec (+ ADR if shared schema topology) **before any new schema file**. Not an autonomous coding-first task. |
| ResearchReport body consume | **Deferred.** Valid follow-through after GAP-BR-019 CLOSED, but larger surface and same product-path authorization needs. |
| Coding-agent forbidden-path enforcement in `tools/eng-agent/` | **Rejected for this sprint.** Real gap, but it is Harness hardening — this sprint must not create another Harness feature. |
| GAP-BR-002/003/004/005/008 | **Stale as code work.** Defaults/stamp already shipped; residual is PO ratification. |
| Fixtures (`CA-TITLE`, `AE-FIX1`, `title-case.ts`) | **Rejected.** Not production work. |

Selected production slice:

```text
Research Request.tenant_id
        ↓
Kernel requireTenant() (ambient)
        ↓
fail closed if unbound or ≠ request tenant
        ↓
ExecutionHost.createRun(...)
```

## Proposed scope

Allowed implementation paths after approval:

- `personal-brain/src/bridge/create-run.ts`
- `personal-brain/tests/bridge-create-run.test.ts`
- `docs/eng-agent/` execution evidence

Read-only sources:

- `personal-brain/stage/bridge/GAP-REGISTRY-PB-HARNESS-BRIDGE-001.md` (GAP-BR-012)
- `personal-brain/stage/bridge/A3-tenancy-owner-binding.md`
- `personal-brain/stage/bridge/B3-host-tenancy-audit-flow.md`
- `personal-brain/specs/SPEC-PROD-004-HARNESS-BRIDGE.md`
- `@dyogas/kernel` public API (`requireTenant`, `TenancyError`)

## Coding Agent write-scope exception (required)

The Coding Agent instruction builder currently hardcodes `personal-brain/` as a
forbidden prompt path. That was appropriate for Harness self-build sprints; it blocks
this first production product task.

Founder approval of this Decision **also** authorizes a **scoped production exception**
for this sprint only:

| Exception | Bound |
|-----------|-------|
| Allowed Coding Agent write prefixes | `personal-brain/src/bridge/` · `personal-brain/tests/` |
| Required adapter behavior | Execution Package `allowedPaths` for those prefixes must not be contradicted by the generic `personal-brain/` forbid for this task |
| Minimal enablement patch (if needed) | Prefer `allowedPaths` win over generic forbidden for the approved prefixes only — **not** a new Harness capability sprint |
| Still forbidden | `runtime/` · `sdk/` · `execution-host/` · other `personal-brain/` trees · platform `*/src/` outside the bridge allowlist |

This exception is production enablement of the completed Harness, not authorization to
build new Harness features.

## Acceptance boundary

1. Before Host `createRun`, `createBridgeRun` reads ambient Kernel tenancy via `requireTenant()`.
2. Unbound ambient tenancy → fail closed (`PersonalBrainError`); Host is not called.
3. Ambient tenant ≠ `CreateRunRequest.tenant_id` / request identity tenant → fail closed; Host is not called.
4. Matching ambient + request tenant → existing happy path unchanged.
5. Existing identity↔bootstrap consistency check remains.
6. Unit/integration tests cover unbound, mismatch, and match cases; existing C-02 suite stays green after necessary ambient setup updates.
7. No Runtime, SDK, Execution Host, schema, contract, or pipeline edits.
8. Independent Harness evidence records live Cursor Agent invocation, changed files, tests, and verifier PASS.
9. GAP-BR-012 status change requires separate evidence-backed review after PASS (not silent registry rewrite during coding).

## Explicit non-scope

- New `MOD-*`
- Hosted `MOD-ENG-AGENTS`
- Runtime / Agent SDK / Execution Host changes
- Host-side `tenant_id ≡ Runtime ctx` assert (explicitly deferred by GAP-BR-012)
- New Harness features beyond the scoped write-path exception above
- Schema / artifact invention
- Closing GAP-BR-012 without verified evidence

## Architecture impact

**Expected:** `no_arch_impact` — product fail-closed consume of existing Kernel API; Host
assert remains deferred. Architecture Reviewer confirms before Implementation Mode.

## Approval gate

Implementation remains prohibited until all are true:

1. Founder changes this Decision to **APPROVED** (including the scoped Coding Agent write exception).
2. Architecture Review records `no_arch_impact` (or documents required amendment).
3. Sprint status changes to **READY_FOR_EXECUTION**.
4. Task `HFP-01` changes from **PENDING** to **READY_FOR_EXECUTION**.
5. DEV-ORCH / Coding instruction package uses the exact approved allowlist.

## Implementation authorization

**YES for HFP-01** under Founder READY_FOR_EXECUTION directive (2026-07-26).

| Item | Authorized? |
|------|-------------|
| Decision Log / Sprint / Task Registry authoring | **Yes** |
| Production PB bridge tenancy fail-closed code (`HFP-01`) | **Yes** |
| Scoped Coding Agent write exception for `personal-brain/src/bridge/` + tests | **Yes** |
| Runtime / Agent SDK / Execution Host / other product trees | **No** |
| GAP-BR-012 status change in GAP registry | **No** — separate evidence-backed review |

```text
PENDING_FOUNDER_APPROVAL
        ↓ Founder READY_FOR_EXECUTION (2026-07-26)
APPROVED_FOR_EXECUTION
        ↓ HFP-01 DONE
COMPLETE
```

## Related

| Item | Reference |
|------|-----------|
| Gap registry | `personal-brain/stage/bridge/GAP-REGISTRY-PB-HARNESS-BRIDGE-001.md` |
| Product Spec | `personal-brain/specs/SPEC-PROD-004-HARNESS-BRIDGE.md` |
| Design obligation | `personal-brain/stage/bridge/B3-host-tenancy-audit-flow.md` |
| Prior coding auth | `docs/decision-log/DL-PB-BRIDGE-CODING-001.md` |
| Sprint | `sprints/SPRINT-HARNESS-FIRST-PRODUCTION-TASK-001.md` |
| Task Registry | `tasks/TASK-REGISTRY-HARNESS-FIRST-PRODUCTION-TASK-001.md` |

---

**End of DL-HARNESS-FIRST-PRODUCTION-TASK-001**
