# TASK REGISTRY  EEXECUTION HOST

**Registry ID:** TASK-REGISTRY-EXECUTION-HOST-001  
**Created:** 2026-07-23  
**Mode:** Development Harness  ETask Registry (sprint initialization only)  
**Sprint:** [`/sprints/SPRINT-EXECUTION-HOST-001.md`](../sprints/SPRINT-EXECUTION-HOST-001.md)  
**Trace:** `TRACE-EXEC-HOST-001`  
**Auth:** Founder Approved · Spec `SPEC-EXECUTION-HOST-001` · DL-EXECUTION-HOST-001 · ADR-0010  
**Initial status for all tasks:** `READY_FOR_EXECUTION`  
**Forbidden in this creation step:** Implementation; Runtime/SDK/Harness edits; marking DONE/IMPLEMENTED

---

## Task Field Schema

Each task includes:

| Field | Meaning |
|-------|---------|
| **ID** | Stable task id |
| **Description** | What must be achieved |
| **Dependencies** | Prerequisite task ids |
| **Acceptance Criteria** | Measurable done checks |
| **Test Requirement** | How verification is proven |
| **Risk** | Primary failure / boundary risk |
| **Status** | `READY_FOR_EXECUTION` until pulled |

**Status vocabulary:** `READY_FOR_EXECUTION` ↁE`IN_PROGRESS` ↁE`DONE` | `BLOCKED`.

---

## Execution Order (recommended)

```text
T-A1 ↁET-A2 ↁET-A3 ↁET-A4
T-B1 ↁET-B2 ↁET-B3
T-C1 ↁET-C2 ↁET-C3
T-E1 ↁET-E2 ↁET-E3          (∥ C after A)
T-F1 ↁET-F2 ↁET-F3          (∥ C/E after A)
T-D1 ↁET-D2 ↁET-D3 ↁET-D4  (after C2 + E2 + F2)
T-G1 ↁET-G2 ↁET-G3
T-H1 ↁET-H2 ↁET-H3
T-I1 ↁET-I2
T-J1 ↁET-J2 ↁET-J3 ↁET-J4
T-K1 ↁET-K2
```

Lifecycle mapping: Groups A–I = IMPLEMENTATION prep/build · J = TEST (+ DEBUG as needed) · K = ACCEPTANCE.

---

## A. Architecture foundation

### T-A1

| Field | Content |
|-------|---------|
| **ID** | T-A1 |
| **Description** | Confirm Host vs Runtime vs Harness vs SDK one-sentence boundaries against SPEC-EXECUTION-HOST-001 + ADR-0010 + ADR-0003/0004; record consume-only public surfaces inventory. |
| **Dependencies** | None (sprint start) |
| **Acceptance Criteria** | Written boundary matrix; lists Runtime/SDK APIs Host may call; zero proposals to edit Runtime/SDK/Harness sources. |
| **Test Requirement** | Document review checklist signed in stage note (peer Architecture/Tech Lead). |
| **Risk** | Silent boundary drift into Runtime rewrite. |
| **Status** | DONE |

### T-A2

| Field | Content |
|-------|---------|
| **ID** | T-A2 |
| **Description** | Map MVP lifecycle REQUEST→CREATE/PIN→ADMIT→STAGE LOOP→HUMAN GATE→APPLY→COMPLETE to concrete Host components (loader, executor, adapters, gate, audit). |
| **Dependencies** | T-A1 |
| **Acceptance Criteria** | Component map covers Spec §5 lifecycle; each step owned by Host or delegated to Runtime/SDK/engines. |
| **Test Requirement** | Traceability table Spec section ↁEcomponent present in stage artifact. |
| **Risk** | Missing Human Gate or apply-token step in MVP design. |
| **Status** | DONE |

### T-A3

| Field | Content |
|-------|---------|
| **ID** | T-A3 |
| **Description** | Pin MVP pipeline to `knowledge-ingestion` only; document version-pinning rule and fail-closed behavior for unknown pipelines. |
| **Dependencies** | T-A1 |
| **Acceptance Criteria** | Explicit pin statement; no personal/parallel topology; unknown `pipeline_id` rejected. |
| **Test Requirement** | Later covered by T-C3 / T-J2; design note must state expected reject reason codes. |
| **Risk** | Accidental second pipeline topology. |
| **Status** | DONE |

### T-A4

| Field | Content |
|-------|---------|
| **ID** | T-A4 |
| **Description** | Record open gaps (MVP runner wrap vs migrate; human actor auth into resume; Build Order slot)  Eescalate, do not invent. |
| **Dependencies** | T-A2, T-A3 |
| **Acceptance Criteria** | Gap register with owner/escalation; no invented schemas/contracts/law. |
| **Test Requirement** | Gaps appear in Acceptance residual risks (T-K2). |
| **Risk** | Implementation invents APIs to close gaps. |
| **Status** | DONE |

---

## B. Package / module creation

### T-B1

| Field | Content |
|-------|---------|
| **ID** | T-B1 |
| **Description** | Choose package/module name for MOD-EXECUTION-HOST (prefer new package; not Runtime expansion); document MODULE_STATUS / Build Order registration plan. |
| **Dependencies** | T-A1 |
| **Acceptance Criteria** | Name + path decided; rationale cites ADR-0010; registration plan does not edit Kernel/Runtime/SDK. |
| **Test Requirement** | Package path exists after T-B2; name matches ADR/sprint references or recorded alias. |
| **Risk** | Expanding Runtime package contrary to ADR. |
| **Status** | DONE |

### T-B2

| Field | Content |
|-------|---------|
| **ID** | T-B2 |
| **Description** | Scaffold Host package (manifest, tsconfig/build, public entrypoints stubs, README boundary). |
| **Dependencies** | T-B1 |
| **Acceptance Criteria** | Package builds empty/stub; depends only on allowed workspace packages; README states SHALL NOT list from Spec. |
| **Test Requirement** | `build`/`typecheck` smoke for package succeeds. |
| **Risk** | Accidental dependency on engine internals / private paths. |
| **Status** | DONE |

### T-B3

| Field | Content |
|-------|---------|
| **ID** | T-B3 |
| **Description** | Define Host public request surface (conceptual API): create/pin run, pause hooks, resume human decision, get status/lineage  Epresentation-agnostic. |
| **Dependencies** | T-B2, T-A2 |
| **Acceptance Criteria** | API surface documented; Personal Brain is caller profile only; no UI; no new artifact schema types. |
| **Test Requirement** | Contract tests (T-J1) assert types/signatures against documented surface. |
| **Risk** | Product-specific API leak into Host. |
| **Status** | DONE |

---

## C. Pipeline definition loader

### T-C1

| Field | Content |
|-------|---------|
| **ID** | T-C1 |
| **Description** | Implement loader that reads declared `knowledge-ingestion` topology from existing `/pipelines` sources (markdown/structured as already used by platform). |
| **Dependencies** | T-B2, T-A3 |
| **Acceptance Criteria** | Loader returns ordered stages + exit/gate metadata needed by executor; no topology invention. |
| **Test Requirement** | Unit test: load `knowledge-ingestion` yields expected stage order (fixture from pipeline doc). |
| **Risk** | Hardcoding a divergent stage list. |
| **Status** | DONE |

### T-C2

| Field | Content |
|-------|---------|
| **ID** | T-C2 |
| **Description** | Implement version pin at CREATE: store `pipeline_id` + `pipeline_version` on run context. |
| **Dependencies** | T-C1 |
| **Acceptance Criteria** | Pin immutable for run lifetime; mismatch/missing version fails closed. |
| **Test Requirement** | Unit test: pin recorded; mutation attempt rejected or impossible. |
| **Risk** | Unpinned runs break audit reconstructability. |
| **Status** | DONE |

### T-C3

| Field | Content |
|-------|---------|
| **ID** | T-C3 |
| **Description** | Reject unknown / unsupported pipeline ids with typed error. |
| **Dependencies** | T-C2 |
| **Acceptance Criteria** | Non-`knowledge-ingestion` (MVP) denied; error typed and auditable. |
| **Test Requirement** | Unit test: unknown pipeline ↁEfail closed. |
| **Risk** | Silent fallback to ad-hoc topology. |
| **Status** | DONE |

---

## D. Stage executor

### T-D1

| Field | Content |
|-------|---------|
| **ID** | T-D1 |
| **Description** | Implement ordered stage loop skeleton: for each stage, invoke bind ↁEadmit ↁEexecute ↁEvalidate hooks (adapters injectable). |
| **Dependencies** | T-C2, T-E2, T-F2 |
| **Acceptance Criteria** | Stages run in loader order; illegal skip of required stage impossible in happy path. |
| **Test Requirement** | Unit/integration test with fake adapters asserts call order. |
| **Risk** | Out-of-order execution / skipped Human Gate stage. |
| **Status** | DONE |

### T-D2

| Field | Content |
|-------|---------|
| **ID** | T-D2 |
| **Description** | Enforce Exit Criteria / Review Gate check points using Harness semantics via Runtime helpers where available; fail closed on gate fail. |
| **Dependencies** | T-D1 |
| **Acceptance Criteria** | Review Gate failure stops progression; no SoR apply after failed gate. |
| **Test Requirement** | Test: simulated Review Gate fail ↁEterminal/failed path; no apply called. |
| **Risk** | Soft-fail continuing to Knowledge write. |
| **Status** | DONE |

### T-D3

| Field | Content |
|-------|---------|
| **ID** | T-D3 |
| **Description** | Integrate seal + handoff between stages via Runtime adapter only. |
| **Dependencies** | T-D1, T-E3 |
| **Acceptance Criteria** | Unsealed handoff refused; sealed handoff records digest/version refs. |
| **Test Requirement** | Test: unsealed candidate rejected; sealed accepted. |
| **Risk** | Host reimplements handoff validation diverging from Runtime. |
| **Status** | DONE |

### T-D4

| Field | Content |
|-------|---------|
| **ID** | T-D4 |
| **Description** | Wire Human Gate stage to pause executor (delegate to Group H) before apply stages. |
| **Dependencies** | T-D2, T-H1 |
| **Acceptance Criteria** | Executor enters wait state; cannot reach Knowledge apply without resume `approved` + token rules. |
| **Test Requirement** | Test: pause before apply; resume reject blocks apply. |
| **Risk** | Auto-continue past Human Gate. |
| **Status** | DONE |

---

## E. Runtime adapter

### T-E1

| Field | Content |
|-------|---------|
| **ID** | T-E1 |
| **Description** | Inventory and bind to existing Runtime public APIs (`admitRun`, `startRun`, transitions, handoff/seal helpers)  Econsume only. |
| **Dependencies** | T-A1, T-B2 |
| **Acceptance Criteria** | Adapter interface lists exact Runtime symbols used; no Runtime source files modified. |
| **Test Requirement** | Compile-time dependency check; diff policy: zero Runtime path edits in sprint PR. |
| **Risk** | Temptation to patch Runtime for missing helpers. |
| **Status** | DONE |

### T-E2

| Field | Content |
|-------|---------|
| **ID** | T-E2 |
| **Description** | Implement Runtime adapter methods for admit/start/transition used by Host create + stage loop. |
| **Dependencies** | T-E1 |
| **Acceptance Criteria** | Adapter forwards to Runtime; maps errors to Host typed failures; tenancy context passed through. |
| **Test Requirement** | Unit tests with Runtime mock/fake verifying call args. |
| **Risk** | Swallowing admit denials. |
| **Status** | DONE |

### T-E3

| Field | Content |
|-------|---------|
| **ID** | T-E3 |
| **Description** | Implement seal/acceptHandoff adapter paths; refuse illegal transitions (rely on Runtime fail-closed). |
| **Dependencies** | T-E2 |
| **Acceptance Criteria** | Host does not invent transition names outside Runtime/Harness; illegal path surfaces as failure. |
| **Test Requirement** | Test: illegal transition ↁEHost failure; no forced state write. |
| **Risk** | Host-side state machine fork. |
| **Status** | DONE |

---

## F. SDK adapter

### T-F1

| Field | Content |
|-------|---------|
| **ID** | T-F1 |
| **Description** | Inventory Agent SDK public bind/skill/candidate APIs for stage Execute  Econsume only. |
| **Dependencies** | T-A1, T-B2 |
| **Acceptance Criteria** | Symbol list documented; no SDK source edits; no admit via SDK. |
| **Test Requirement** | Diff policy: zero SDK path edits; adapter unit tests mock SDK. |
| **Risk** | Using SDK as orchestrator. |
| **Status** | DONE |

### T-F2

| Field | Content |
|-------|---------|
| **ID** | T-F2 |
| **Description** | Implement SDK adapter: `bindContract` for stage producer + allowlisted invoke/emit. |
| **Dependencies** | T-F1 |
| **Acceptance Criteria** | Bind uses existing `/contracts` pins only; allowlist enforced; unknown skill denied. |
| **Test Requirement** | Test: allowlisted skill ok; unknown skill fail closed. |
| **Risk** | Unbounded tool use. |
| **Status** | DONE |

### T-F3

| Field | Content |
|-------|---------|
| **ID** | T-F3 |
| **Description** | Map stage ↁEcontract pin for `knowledge-ingestion` stages using existing contract ids (document + adapter config). |
| **Dependencies** | T-F2, T-C1 |
| **Acceptance Criteria** | Stage→contract table complete for MVP stages Host will execute; missing contract = BLOCKED gap, not new contract file. |
| **Test Requirement** | Table reviewed; executor test uses table. |
| **Risk** | Creating new agent contracts to fill gaps. |
| **Status** | DONE |

---

## G. Artifact lineage

### T-G1

| Field | Content |
|-------|---------|
| **ID** | T-G1 |
| **Description** | Define lineage propagator: correlation id from ResearchBrief onto run + descendant artifact refs. |
| **Dependencies** | T-B3, T-D1 |
| **Acceptance Criteria** | Correlation present on run context and sealed stage refs; no new schema types. |
| **Test Requirement** | Unit test: correlation propagates Brief ↁErun ↁEfake sealed Report ref. |
| **Risk** | Orphan artifacts without correlation. |
| **Status** | DONE |

### T-G2

| Field | Content |
|-------|---------|
| **ID** | T-G2 |
| **Description** | Enforce trusted-path ref chain recording: Brief ↁEReport ↁE(Validation) ↁEProposal ↁEapproval ↁEKnowledge ↁEGraphUpdate. |
| **Dependencies** | T-G1, T-H2 |
| **Acceptance Criteria** | Host status/lineage API returns chain refs when present; Knowledge apply blocked if approval ref missing. |
| **Test Requirement** | Test: missing approval ref ↁEapply denied. |
| **Risk** | Partial SoR write without lineage. |
| **Status** | DONE |

### T-G3

| Field | Content |
|-------|---------|
| **ID** | T-G3 |
| **Description** | Tenancy check on handoff/lineage: reject cross-tenant artifact attachment. |
| **Dependencies** | T-G1, T-E3 |
| **Acceptance Criteria** | Cross-tenant handoff fails closed. |
| **Test Requirement** | Test: mismatched tenant_id ↁEreject. |
| **Risk** | Cross-tenant leakage. |
| **Status** | DONE |

---

## H. Human approval pause/resume

### T-H1

| Field | Content |
|-------|---------|
| **ID** | T-H1 |
| **Description** | Implement pause contract: enter WAITING_HUMAN / GATE_HUMAN semantics; expose wait state to callers. |
| **Dependencies** | T-E2, T-D1 |
| **Acceptance Criteria** | Run pauses before Knowledge apply; agent cannot set approved. |
| **Test Requirement** | Test: pause state observable; agent-identity approve attempt rejected. |
| **Risk** | Auto-approve under urgency. |
| **Status** | DONE |

### T-H2

| Field | Content |
|-------|---------|
| **ID** | T-H2 |
| **Description** | Implement resume contract for outcomes: `approved` \| `rejected` \| `request_changes` \| `expired` \| `escalated` (Harness §9); attributable human actor required. |
| **Dependencies** | T-H1 |
| **Acceptance Criteria** | Each outcome typed; only human/owner actor accepted; rejected/expired/etc. do not mint apply token. |
| **Test Requirement** | Table-driven tests per outcome. |
| **Risk** | Treating `request_changes` as approve. |
| **Status** | DONE |

### T-H3

| Field | Content |
|-------|---------|
| **ID** | T-H3 |
| **Description** | Apply-token rule: mint/require only after `approved`; single-use; bound to artifact version; invoke Knowledge/Graph **only** via existing engine paths. |
| **Dependencies** | T-H2, T-G2 |
| **Acceptance Criteria** | No apply without token; token reuse denied; engines called only after authorization. |
| **Test Requirement** | Tests: approve→token→apply once; reuse fails; reject→no token. |
| **Risk** | Side-channel SoR write. |
| **Status** | DONE |

---

## I. Audit integration

### T-I1

| Field | Content |
|-------|---------|
| **ID** | T-I1 |
| **Description** | Integrate audit sink for run lifecycle events (admitted, started, succeeded, failed, cancelled) via existing Trust/Runtime patterns. |
| **Dependencies** | T-E2, T-B2 |
| **Acceptance Criteria** | Events emitted with run_id, tenant, pipeline pin; no custom parallel audit store inventing trust bypass. |
| **Test Requirement** | Test with mock sink asserts required event classes fired. |
| **Risk** | Silent runs without audit. |
| **Status** | DONE |

### T-I2

| Field | Content |
|-------|---------|
| **ID** | T-I2 |
| **Description** | Emit stage, gate, handoff, and human-decision audit events including identity fields where required. |
| **Dependencies** | T-I1, T-D3, T-H2 |
| **Acceptance Criteria** | Reconstructable trail for “what ran, pins, approvals E Spec §9 coverage checklist marked. |
| **Test Requirement** | Integration-style test: one fake run produces required event set. |
| **Risk** | Missing human decision attribution in audit. |
| **Status** | DONE |

---

## J. Tests

### T-J1

| Field | Content |
|-------|---------|
| **ID** | T-J1 |
| **Description** | Unit tests for loader, adapters, lineage propagator, pause/resume, token rules. |
| **Dependencies** | T-C3, T-E3, T-F3, T-G3, T-H3, T-I2 |
| **Acceptance Criteria** | Unit suite green; covers EXCLUDE regressions (no Runtime import of private paths). |
| **Test Requirement** | CI/package test command PASS. |
| **Risk** | Tests only happy-path stubs without fail-closed cases. |
| **Status** | DONE |

### T-J2

| Field | Content |
|-------|---------|
| **ID** | T-J2 |
| **Description** | Boundary tests: unknown pipeline; illegal handoff; cross-tenant; agent auto-approve attempt. |
| **Dependencies** | T-J1 |
| **Acceptance Criteria** | All boundary cases fail closed with typed reasons. |
| **Test Requirement** | Dedicated boundary test file PASS. |
| **Risk** | Soft failures. |
| **Status** | DONE |

### T-J3

| Field | Content |
|-------|---------|
| **ID** | T-J3 |
| **Description** | Host-level happy-path test with fakes: Brief ↁEstages ↁEHuman approve ↁEauthorized apply hooks invoked once ↁEGraphUpdate ref recorded. |
| **Dependencies** | T-J1, T-D4, T-H3 |
| **Acceptance Criteria** | End-to-end Host coordination PASS with fakes; no Personal Brain UI. |
| **Test Requirement** | E2E-host test PASS. |
| **Risk** | Depending on live cloud/LLM for MVP proof. |
| **Status** | DONE |

### T-J4

| Field | Content |
|-------|---------|
| **ID** | T-J4 |
| **Description** | DEBUG pass: triage failures from T-J1–J3; fix Host-only; re-run until green or BLOCKED with gap register update. |
| **Dependencies** | T-J2, T-J3 |
| **Acceptance Criteria** | No open test failures without BLOCKED rationale; zero Runtime/SDK patches used as “fix E |
| **Test Requirement** | Final test run evidence captured for T-K1. |
| **Risk** | “Fix Eleaks into Runtime/SDK. |
| **Status** | DONE |

---

## K. Acceptance documentation

### T-K1

| Field | Content |
|-------|---------|
| **ID** | T-K1 |
| **Description** | Write sprint acceptance evidence pack: DoD checklist, test evidence, boundary proof (no Runtime/SDK/Harness edits). |
| **Dependencies** | T-J4 |
| **Acceptance Criteria** | Stage doc lists DoD-1..9 pass/fail; links test logs; git path allowlist proof. |
| **Test Requirement** | Evidence reviewed in Acceptance gate. |
| **Risk** | Claiming PASS without Human Gate proof. |
| **Status** | DONE |

### T-K2

| Field | Content |
|-------|---------|
| **ID** | T-K2 |
| **Description** | Residual risks + go/no-go for Personal Brain Harness Bridge follow-up; update gap register from T-A4. |
| **Dependencies** | T-K1, T-A4 |
| **Acceptance Criteria** | Explicit go/no-go; lists what Bridge may consume next; no scope expansion into UI/Decision Agent. |
| **Test Requirement** | Document complete; sprint status can move to Acceptance Complete only if DoD met. |
| **Risk** | Premature Bridge implementation against incomplete Host. |
| **Status** | DONE |

---

## Summary Counts

| Group | Tasks |
|-------|-------|
| A Architecture foundation | T-A1..A4 (4) |
| B Package/module creation | T-B1..B3 (3) |
| C Pipeline definition loader | T-C1..C3 (3) |
| D Stage executor | T-D1..D4 (4) |
| E Runtime adapter | T-E1..E3 (3) |
| F SDK adapter | T-F1..F3 (3) |
| G Artifact lineage | T-G1..G3 (3) |
| H Human approval pause/resume | T-H1..H3 (3) |
| I Audit integration | T-I1..I2 (2) |
| J Tests | T-J1..J4 (4) |
| K Acceptance documentation | T-K1..K2 (2) |
| **Total** | **34** |

All tasks: **`READY_FOR_EXECUTION`**. Implementation not started by this registry.

---

**End of TASK-REGISTRY-EXECUTION-HOST-001**
