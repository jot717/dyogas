# T-A1 — Boundary Matrix & Consume-Only Surfaces

**Sprint:** SPRINT-EXECUTION-HOST-001  
**Task:** T-A1  
**Trace:** TRACE-EXEC-HOST-001  
**Refs:** SPEC-EXECUTION-HOST-001 · ADR-0010 · ADR-0003 · ADR-0004

---

## One-sentence boundaries

| Layer | Boundary |
|-------|----------|
| **Harness** (`/harness`) | Execution **law** — states, gates, handoff, retry, audit semantics. Host obeys; does not amend. |
| **Runtime** (`@dyogas/runtime`) | Admit / state / handoff / retry **primitives** — sole fail-closed transition enforcer (ADR-0003). |
| **Agent SDK** (`@dyogas/agent-sdk`) | Contract **bind** + allowlisted skills/tools + candidate emit (ADR-0004). Does not admit pipelines. |
| **Execution Host** (`@dyogas/execution-host`) | Pipeline Engine **implementation** — loads `/pipelines`, drives stages, pauses for Human Approval, authorizes apply orchestration by composing Runtime + SDK. |
| **Agents** (`/contracts`) | Stage producers under pinned contracts. Never auto-approve SoR writes. |
| **Experience products** | **Requesters** (e.g. Personal Brain) — not multi-agent orchestrators. |

---

## Host SHALL / SHALL NOT (Phase 1 confirmation)

| SHALL | SHALL NOT |
|-------|-----------|
| Compose Runtime + SDK + `/pipelines` | Replace Runtime or redefine Harness |
| Fail closed on unknown pipelines / illegal handoffs | Edit Runtime/SDK/Harness sources |
| Pause for Human Approval before SoR apply | Create agent contracts or artifact schemas |
| Emit audit via existing Trust/Runtime patterns | Embed Product UI or Decision Agent |

---

## Consume-only public surfaces (inventory)

### `@dyogas/runtime` (from `runtime/src/index.ts`)

| Symbol | Host use (later groups) |
|--------|-------------------------|
| `admitRun` / `startRun` / `transition` / `succeed` / `handleFailure` / `resumeAfterRetry` | Run admit + lifecycle |
| `createExecutionContext` / `ExecutionContext` / `RuntimeError` | Tenancy-bound context |
| `sealArtifact` / `acceptHandoff` / `ArtifactRef` / `HandoffError` | Stage handoffs |
| `assertLegalTransition` / `canTransition` / `RunState` / `IllegalTransitionError` | Respect Runtime legality |
| `classifyError` / `shouldRetry` / `DEFAULT_RETRY` / `RetryExhaustedError` | Retry policy composition |

**Not for Host:** embedding a second state machine; patching Runtime to add states.

### `@dyogas/agent-sdk` (from `sdk/src/index.ts`)

| Symbol | Host use (later groups) |
|--------|-------------------------|
| `bindContract` / `BindRequest` / `AgentContractBinding` / `ContractBindError` | Stage bind |
| `invokeSkill` / `SkillHandler` / `SkillError` | Allowlisted execute |
| `emitCandidate` / `CandidateArtifact` / `CandidateError` | Stage candidate emit |
| `ToolRegistry` / `ToolDefinition` / `ToolError` | Allowlisted tools if stage requires |
| `createAgentMemory` / `AgentMemory` / `MemoryRecord` | Only if contract requires — not Host SoR |

**Not for Host:** admitting runs via SDK; inventing contracts.

### Other allowed (declare as deps when needed)

| Package | Role |
|---------|------|
| `@dyogas/kernel` | Tenancy types/context propagation (via Runtime context) |
| `@dyogas/trust` | Audit sink patterns (via Runtime admit) |
| `/pipelines` | Definition source (loader Group C — read, do not invent topology) |

### Forbidden Phase 1+ edits

- `runtime/**` sources  
- `sdk/**` sources  
- `harness/HARNESS_SPECIFICATION.md`  
- `contracts/agents/**` (new)  
- `artifacts/**` / `schemas/**` (new types)

---

## Proposal check

**Zero proposals** in this sprint Phase 1 to modify Runtime, SDK, or Harness law. Gaps → [`A4-gap-register.md`](./A4-gap-register.md).

**End of T-A1**
