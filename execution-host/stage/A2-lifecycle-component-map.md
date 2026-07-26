# T-A2 — Lifecycle → Component Map

**Sprint:** SPRINT-EXECUTION-HOST-001  
**Task:** T-A2  
**Trace:** TRACE-EXEC-HOST-001  
**Refs:** SPEC-EXECUTION-HOST-001 §5

---

## Traceability: Spec lifecycle → Host components

| Spec §5 step | Host component (planned) | Delegates to |
|--------------|--------------------------|--------------|
| 1. REQUEST | Public API `createRun` / request types (`src/api.ts`) | Caller (Experience product) |
| 2. CREATE / PIN | Pipeline loader + pin store (`src/pipeline/` — Group C) | `/pipelines` definitions |
| 3. ADMIT RUN | Runtime adapter (`src/adapters/runtime.ts` — Group E) | `admitRun` → `startRun` |
| 4a. Bind agent | SDK adapter (`src/adapters/sdk.ts` — Group F) | `bindContract` |
| 4b. Admit stage | Runtime adapter | Runtime admit/transition helpers |
| 4c. Execute | SDK adapter | `invokeSkill` / tools / `emitCandidate` |
| 4d. Validate candidate | Stage executor (`src/executor/` — Group D) | Schema/Exit Criteria (existing) |
| 4e. Review Gate | Stage executor | Harness semantics via Runtime fail-closed |
| 4f. Seal + Handoff | Runtime adapter | `sealArtifact` / `acceptHandoff` |
| 5. HUMAN GATE | Human gate controller (`src/gate/` — Group H) | Host wait + human resume; **not** agent identity |
| 6. APPLY | Apply orchestrator stub (Group H/G) | Existing Knowledge Engine APIs only |
| 7. GRAPH+ | Stage loop continues | Existing Graph Engine APIs only |
| 8. COMPLETE | Runtime adapter | `succeed` / failure paths |
| 9. AUDIT CLOSE | Audit integration (`src/audit/` — Group I) | Trust audit sink via Runtime |

---

## Phase 1 materialization

| Component | Phase 1 status |
|-----------|----------------|
| Package + public API skeleton | **Created** (Group B) |
| Loader / executor / adapters / gate / audit | **Not implemented** (later groups) |

Human Gate and apply-token steps are **mandatory** in the map above — must not be dropped in later groups.

**End of T-A2**
