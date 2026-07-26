# TASK REGISTRY

**Registry ID:** TASK-REGISTRY-DEV-ORCH-002  
**Sprint:** [`SPRINT-DEV-ORCH-002`](../sprints/SPRINT-DEV-ORCH-002.md)  
**Spec:** [`SPEC-DEV-ORCH-001`](../specs/SPEC-DEV-ORCH-001.md) (`accepted`)  
**Auth:** [`DL-DEV-ORCH-002`](../docs/decision-log/DL-DEV-ORCH-002.md) **APPROVED**  
**Created:** 2026-07-25  
**Mode:** **Implementation Mode** — `tools/dev-orch/` only  
**Backlog:** [`BACKLOG-DEV-ORCH-002`](../docs/backlog/BACKLOG-DEV-ORCH-002.md)  
**Plan:** [`PHASE2-IMPLEMENTATION-PLAN`](../docs/dev-orch/PHASE2-IMPLEMENTATION-PLAN.md)  
**Forbidden:** `MOD-DEV-ORCH`; Runtime / SDK / Execution Host / Product / Harness law edits; product agent execution; B17 Hosted ENG-AGENTS  

**Current executable task:** **P2-02**

---

## Execution Order

```text
P2-01 → P2-02 → P2-03 → P2-04 → P2-05 → P2-06 → P2-07 → P2-08 → P2-09 → P2-10
```

---

### P2-01 — Package scaffold `tools/dev-orch/`

| Field | Content |
|-------|---------|
| **Task ID** | P2-01 |
| **Objective** | Create `tools/dev-orch/` Node 22 package skeleton (package.json, src layout, test runner, README pointing to Spec/Runbook/DL-002). No platform package dependencies. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | None |
| **Expected output** | `tools/dev-orch/package.json`, `src/`, `tests/`, README |
| **Acceptance Criteria** | Package installs; `npm test` runnable (may be empty suite); name does not imply Platform Module; no `@dyogas/runtime\|agent-sdk\|execution-host` deps |
| **Test Requirement** | `npm ci` succeeds; dependency audit shows zero forbidden packages |
| **Status** | **DONE** (2026-07-25) |
| **Evidence** | `docs/dev-orch/P2-01-package-scaffold.md` · `tools/dev-orch/**` · tests 3 pass · build OK |

---

### P2-02 — Task Registry parser

| Field | Content |
|-------|---------|
| **Task ID** | P2-02 |
| **Objective** | Parse `TASK-REGISTRY-*.md` into a typed model: Task ID, Objective, Dependencies, AC, Test Requirement, Expected output, Status, Evidence, Process/current executable pointer. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | P2-01 |
| **Expected output** | Parser module under `tools/dev-orch/src/` + fixtures |
| **Acceptance Criteria** | Loads `TASK-REGISTRY-DEV-ORCH-001` and at least one other real registry without field loss for status/deps/id |
| **Test Requirement** | Fixture round-trip / field extraction tests |
| **Status** | **READY_FOR_EXECUTION** |

---

### P2-03 — Planner selector

| Field | Content |
|-------|---------|
| **Task ID** | P2-03 |
| **Objective** | Select next `READY_FOR_EXECUTION` task per Runbook §3.2; enforce fail-closed §3.3 (no READY, unmet deps, skip DONE/BLOCKED/IN_PROGRESS unless resume). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | P2-02 |
| **Expected output** | Planner module + selection result type (selected \| STOP + reason) |
| **Acceptance Criteria** | Correct selection on fixture registries; each fail-closed condition returns STOP, never a bad selection |
| **Test Requirement** | Selection matrix + fail-closed matrix |
| **Status** | **PENDING** |

---

### P2-04 — Execution Package generator

| Field | Content |
|-------|---------|
| **Task ID** | P2-04 |
| **Objective** | Emit Execution Package with all Runbook §4.1 required fields to `docs/dev-orch/execution-packages/` (or stdout in dry-run). |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | P2-03 |
| **Expected output** | Package emitter module |
| **Acceptance Criteria** | All 12 §4.1 fields present; missing field = hard failure; golden field-parity vs `PREPARED-PB-BRIDGE-T-C1.md` for same task inputs |
| **Test Requirement** | Required-field completeness test + golden comparison |
| **Status** | **PENDING** |

---

### P2-05 — Gate validator

| Field | Content |
|-------|---------|
| **Task ID** | P2-05 |
| **Objective** | Encode START_DEVELOPMENT §5.2 Mode, §5.3 Implementation Gate, §5.4 no Planning+code mix, §5.5 approval interpretation; Spec §6–§7 allow/deny. |
| **Owner role** | Architecture Reviewer Agent |
| **Dependencies** | P2-01 (parallelizable after scaffold; must pass before CLI apply) |
| **Expected output** | Gate validator module |
| **Acceptance Criteria** | Rejects missing Task ID / Sprint / AC / Test Requirement when Gate applies; rejects mixed Planning+code cycle; allows DL-002 + Sprint-authorized tool scope |
| **Test Requirement** | Negative tests for each gate failure mode |
| **Status** | **PENDING** |

---

### P2-06 — Verifier engine

| Field | Content |
|-------|---------|
| **Task ID** | P2-06 |
| **Objective** | Automate Verifier checks V-1…V-8 (Runbook §6). Any fail → BLOCKED / not DONE. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | P2-04, P2-05 |
| **Expected output** | Verifier module returning per-check PASS/FAIL |
| **Acceptance Criteria** | One pass fixture and one fail fixture per V-1…V-8; aggregate fail never marks DONE |
| **Test Requirement** | 8×(pass+fail) minimum coverage |
| **Status** | **PENDING** |

---

### P2-07 — Evidence collector + Registry writer

| Field | Content |
|-------|---------|
| **Task ID** | P2-07 |
| **Objective** | Collect/link evidence paths (Runbook §7); write registry status transitions READY→IN_PROGRESS→DONE\|BLOCKED with evidence links and Process pointer update (Runbook §8). Refuse GAP closure and inventing tasks. |
| **Owner role** | Tech Lead Agent |
| **Dependencies** | P2-06 |
| **Expected output** | Evidence + writer modules; write allowlist enforcement |
| **Acceptance Criteria** | Legal transitions only; idempotent where specified; refuses illegal writes outside allowlist (`tasks/`, `docs/dev-orch/`, named stage evidence) |
| **Test Requirement** | Transition matrix; allowlist reject tests; no-mutation under dry-run (shared with P2-08) |
| **Status** | **PENDING** |

---

### P2-08 — CLI dry-run / apply

| Field | Content |
|-------|---------|
| **Task ID** | P2-08 |
| **Objective** | Ship operator CLI: default **dry-run** (plan/package/verify report only); explicit `--apply` (or equivalent) required for registry/evidence writes. |
| **Owner role** | Engineering Manager Agent |
| **Dependencies** | P2-03, P2-04, P2-05, P2-06, P2-07 |
| **Expected output** | CLI entrypoint + usage docs in package README |
| **Acceptance Criteria** | Default invocation writes zero files; apply performs authorized writes only after gates+verifier as designed |
| **Test Requirement** | Integration: dry-run no FS change; apply on temp fixture registry |
| **Status** | **PENDING** |

---

### P2-09 — CI + boundary tests

| Field | Content |
|-------|---------|
| **Task ID** | P2-09 |
| **Objective** | Add `dev-orch` CI job (Node 22: `npm ci` → `npm test` → `npm run build`) with `tools/dev-orch/**` path filters; boundary test forbidding platform imports. |
| **Owner role** | Engineering Manager Agent |
| **Dependencies** | P2-01…P2-08 (suite must exist) |
| **Expected output** | `.github/workflows/ci.yml` job + `tests/boundary.test.*` |
| **Acceptance Criteria** | CI job present; boundary fails if forbidden import added; SAC-8 evidenced |
| **Test Requirement** | Boundary unit test; workflow path includes `tools/dev-orch/**` |
| **Status** | **PENDING** |

---

### P2-10 — Sprint Exit

| Field | Content |
|-------|---------|
| **Task ID** | P2-10 |
| **Objective** | File exit evidence for SAC-1…SAC-9; confirm AR addendum if needed; update backlog/MASTER sprint status; attest no platform module / no Runtime/SDK/Host/product edits. |
| **Owner role** | Engineering Manager Agent |
| **Dependencies** | P2-09 |
| **Expected output** | `docs/architecture-reviews/SPRINT-DEV-ORCH-002-EXIT.md` (or `docs/dev-orch/` exit note) |
| **Acceptance Criteria** | Exit template filled; all SAC PASS or explicit BLOCKED with reason; Platform Module = NO |
| **Test Requirement** | Exit fields present; link to test run evidence |
| **Status** | **PENDING** |

---

## Acceptance Criteria (Sprint-level)

| ID | Criterion | Mapped tasks |
|----|-----------|--------------|
| SAC-1 | `tools/dev-orch/` present; no `MOD-DEV-ORCH` | P2-01, P2-10 |
| SAC-2 | Registry parser works on real markdown | P2-02 |
| SAC-3 | Planner READY + fail-closed | P2-03 |
| SAC-4 | Execution Package §4.1 complete | P2-04 |
| SAC-5 | Gate validator | P2-05 |
| SAC-6 | Verifier V-1…V-8 | P2-06 |
| SAC-7 | Writer + dry-run default | P2-07, P2-08 |
| SAC-8 | Boundary + CI | P2-09 |
| SAC-9 | Build vs run harness separation | All + P2-10 |

---

## Test Plan (registry)

| ID | Test | Pass rule |
|----|------|-----------|
| TP-1 | Parser fixtures | Real registries parse; required fields present |
| TP-2 | Planner selection | Matches Process pointer / dependency order |
| TP-3 | Planner fail-closed | Each §3.3 condition → STOP |
| TP-4 | Package fields | All §4.1 fields; missing → error |
| TP-5 | Package golden | Field parity vs PREPARED-PB-BRIDGE-T-C1 |
| TP-6 | Gate negatives | Mode / Gate / no-mix rejects |
| TP-7 | Verifier matrix | Pass+fail per V-1…V-8 |
| TP-8 | Writer transitions | Only legal status paths |
| TP-9 | Dry-run | Default CLI: zero filesystem mutations |
| TP-10 | Boundary | Forbidden imports/paths rejected |
| TP-11 | CI | `dev-orch` job runs test+build |

---

## Registry Summary

| Metric | Value |
|--------|-------|
| Tasks | **10** (P2-01…P2-10) |
| Code location | `tools/dev-orch/` only |
| Platform Module | **Forbidden** |
| Current executable | **P2-02** |
| Phase 2 code | **Authorized** by DL-DEV-ORCH-002 |
| P2-01 | **DONE** (2026-07-25) |

---

**End of TASK-REGISTRY-DEV-ORCH-002**
