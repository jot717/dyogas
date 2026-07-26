# Development Harness Entry

**Path:** [`engineering/START_DEVELOPMENT.md`](./START_DEVELOPMENT.md)  
**Status:** Binding — Canonical Development Harness entry  
**Owner:** Engineering Manager Agent (process custodianship) · Founder (business authority only)  
**Related:** [`README.md`](./README.md) · [`/CONSTITUTION.md`](../CONSTITUTION.md) · [`/MASTER_ARCHITECTURE.md`](../MASTER_ARCHITECTURE.md) · [`SPEC-DEV-ORCH-001`](../specs/SPEC-DEV-ORCH-001.md) (Development Orchestrator Agent — Process Mode) · [`docs/DEV-ORCH-RUNBOOK.md`](../docs/DEV-ORCH-RUNBOOK.md)

---

## Purpose

Single canonical entry point for all development work.

Every development cycle starts here.

Every human and every AI agent **must** begin with this document before performing any development work.

This file is an **index and bootstrap** only. It does **not** replace the Constitution, Engineering Process stage law, Harness Spec, or Architecture SoRs — it points to them.

---

## Section 1 — Development Rules

- Development is document-driven.
- Canonical documents are the only source of truth.
- Never use previous chat history as authority.
- Never use assumptions.
- Never bypass the Development Harness.
- Never implement outside an approved Sprint.
- Never use archived or superseded documents.
- Select **Planning Mode** or **Implementation Mode** per Section 5 — never both in one execution cycle.

---

## Section 2 — Load Order

Load canonical documents **in this order** before any development work:

1. [`CONSTITUTION.md`](../CONSTITUTION.md)
2. [`engineering/README.md`](./README.md)
3. All Engineering Stage documents referenced by [`engineering/README.md`](./README.md) Document Map (§5)
4. [`MASTER_ARCHITECTURE.md`](../MASTER_ARCHITECTURE.md)
5. [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
6. [`harness/HARNESS_SPECIFICATION.md`](../harness/HARNESS_SPECIFICATION.md)
7. [`harness/SKILL_SPECIFICATION.md`](../harness/SKILL_SPECIFICATION.md)
8. All **ACTIVE** Specifications (module/`specs/`, `specs/`, product specs — **not** `archive/`)
9. All **ACTIVE** ADRs under [`docs/adr/`](../docs/adr/)
10. All **ACTIVE** Decision Logs under [`docs/decision-log/`](../docs/decision-log/)
11. Every [`MODULE_STATUS.md`](../) in the repository
12. Current Sprint (module or root `sprints/` — status not COMPLETE unless continuing exit hygiene)
13. Current Task Registry (matching sprint)

---

## Section 3 — Verification

Before any work begins, verify:

- Architecture consistency
- Active document consistency
- Current Sprint status
- Current Task Registry status
- Module dependency consistency

**If conflicts exist:**

```text
STOP
```

Generate an Architecture Conflict Report.

**No implementation.**

---

## Section 4 — Development Harness Lifecycle

Follow the Engineering Process in [`engineering/README.md`](./README.md) (§4 Development Lifecycle and stage documents 01–15).

Do not restate stage law here. Bootstrap view only:

```text
PLAN
        ↓
SPECIFICATION
        ↓
ARCHITECTURE REVIEW
        ↓
BACKLOG
        ↓
SPRINT
        ↓
TASK REGISTRY
        ↓
IMPLEMENTATION
        ↓
TEST
        ↓
DEBUG
        ↓
ACCEPTANCE
        ↓
MODULE COMPLETE
```

Stage details, DoR/DoD, branching, commits, and review artifacts: see [`engineering/README.md`](./README.md) and linked stage files.

Mode selection for **Planning** vs **Implementation** is defined in Section 5 (does not replace stage documents).

---

## Section 5 — Development Mode Selection and Implementation Gate

### 5.1 Planning Mode

**Enter Planning Mode when:**

- No ACTIVE approved Sprint exists, **or**
- No executable Task Registry exists

**Planning flow:**

```text
Decision
        ↓
Specification
        ↓
Architecture Review
        ↓
Backlog
        ↓
Sprint
        ↓
Task Registry
```

**Stop** after planning artifacts are complete. Do **not** write product/platform code in Planning Mode.

---

### 5.2 Implementation Mode

**Enter Implementation Mode only when ALL conditions are true:**

- Active approved Sprint exists
- Task Registry exists
- Current task status is `READY_FOR_EXECUTION`
- Required approvals are complete
- Architecture verification passed (Section 3)

**Then:**

Continue from the current Sprint and Task Registry.

Implementation may begin (subject to the Implementation Gate in §5.3).

---

### 5.3 Implementation Gate

**Before writing code**, verify:

- Task ID exists
- Task belongs to the approved Sprint
- Acceptance Criteria exist
- Test Requirement exists
- Scope is inside the approved Spec

**If any condition fails:**

```text
STOP
```

Create a **Process Conflict Report**.

**No code.**

---

### 5.4 Mode separation

**Planning Mode** and **Implementation Mode** are **mutually exclusive**.

A single execution cycle **MUST NOT**:

- create new planning artifacts, **and**
- implement code

at the same time.

---

### 5.5 Approval interpretation

Existing **approved Decision Log** + **approved Sprint authorization** are **sufficient** for execution.

Do **not** request duplicate approval.

**Additional approval required only when:**

- new architecture impact
- new module
- new scope
- Runtime / SDK / Harness boundary change

---

## Section 6 — Platform Principles

Canonical control / product boundaries (implementation detail lives in Harness Spec §2.1a, ADR-0010, MASTER):

```text
Experience Products
        ↓
ExecutionHost.createRun()
        ↓
Execution Host
        ↓
Runtime
        ↓
SDK
        ↓
Agents
        ↓
Human Approval
        ↓
Knowledge
        ↓
Graph
        ↓
Decision Model
```

| Boundary | Rule |
|----------|------|
| **Execution Host** | Pipeline Engine implementation |
| **Runtime** | Execution primitives |
| **SDK** | Binds agents |
| **Harness** | Defines execution law |
| **Products** | Never orchestrate pipelines |

Decision Model remains a **future** product boundary unless an ACTIVE Spec authorizes otherwise (see product SSOT).

---

## Section 7 — Completion

Future development sessions may begin simply with:

```text
Read engineering/START_DEVELOPMENT.md
Continue.
```

Then obey: Load Order → Verification → **Mode Selection (Section 5)** → Lifecycle.  
Do not skip to Implementation unless Implementation Mode conditions and the Implementation Gate both pass.

---

**End of Development Harness Entry**
