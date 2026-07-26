# ADR-0001: Platform Stack and Schema Validation Strategy

**Status:** Accepted  
**Date:** 2026-07-22  
**Accepted:** 2026-07-23  
**Deciders:** Engineering Agents (Process Mode, all approve 2026-07-23) · Founder business approval GRANTED 2026-07-23  
**Related:** Constitution Art. VIII; MASTER Build Order B4/B5; SPEC-RT-001; SPEC-RT-002; SPEC-ADR-PLANNED-003; Architecture Review TRACE-KERNEL-001

## Context

MOD-KERNEL is the first DYOGAS code module (B5). Choosing language, package layout, test runner, and how `/schemas` JSON Schema validation is enforced in CI locks downstream Runtime, Trust, and Agent SDK. Proceeding without an ADR would invent architecture by accident.

Selection constraints (business): AI-native development, solo-founder capacity, low budget, long-term maintainability, local-first capability.

## Options Considered

1. **Defer stack forever / polyglot ad hoc** — Each module picks its own language. Rejected: violates No Duplicate Systems and single Runtime host assumption.  
2. **Lock stack only inside Kernel PR description** — Rejected: not an ADR; no standing in disputes.  
3. **ADR locking one primary implementation language + JSON Schema validation in CI before protected merge** — Chosen.  
4. **Primary language alternatives (within option 3):**  
   - **Python 3.12+** — Strong for ML scripts; weaker single-binary local packaging for a long-lived Runtime host; split brain with JSON-heavy agent contracts. Rejected for primary platform host.  
   - **Go 1.22+** — Excellent local binaries; thinner AI-agent codegen ecosystem for this repo’s doc/contract-heavy workflow; higher solo-founder ramp. Rejected for primary.  
   - **TypeScript on Node.js LTS** — Best fit for AI-native agents, JSON Schema/`/schemas` alignment, local-first Node tooling, low incremental cost. **Selected.**

## Decision

Before any Kernel (or Runtime) Implementation merges to a protected branch, the following stack is locked:

### 1. Primary Language

- **TypeScript 5.x** with `"strict": true` (exact minor allowed to float within 5.x; lock in `package.json` engines/devDependency ranges at Implementation).

### 2. Runtime

- **Node.js 22 LTS** (Active/Maintenance LTS line current at acceptance; bump only via superseding ADR or explicit Decision Log + ADR amendment process if LTS line ends).

### 3. Package Structure

```
kernel/
  package.json          # name: @dyogas/kernel (or dyogas-kernel until npm scope exists)
  tsconfig.json         # strict; rootDir src; outDir dist
  src/
    index.ts            # public export surface only
    tenancy/ | id/ | clock/ | config/ | log/   # primitives (added by later backlog items)
  tests/                # *.test.ts mirroring src
  README.md             # non-goals + public API notes
```

- Subsequent platform packages (`runtime/`, trust adapters, SDK) SHALL use the same language/runtime and the same `src/` + `tests/` + `dist/` convention unless a superseding ADR says otherwise.
- Public API is **only** what `src/index.ts` (and `package.json` `"exports"`) expose. Internals are not importable by Trust/Runtime.
- Package manager: **npm** (lockfile committed). No requirement for pnpm/yarn unless a later ADR changes it.

### 4. Test Framework

- **Node.js built-in test runner** (`node:test` + `node:assert/strict`) executed via **`tsx`** (or compiled `dist/` + `node --test`) so test deps stay minimal.
- One smoke test required before Kernel scaffold is considered green (BL-K-004).

### 5. Schema Validation Approach

- JSON Schemas under `/schemas` are the contract SoR for artifact/agent shapes.
- Runtime/CI validation library: **Ajv** (JSON Schema draft 2020-12 as used by existing schema `$schema` fields, or the draft declared in each schema file).
- Kernel itself does **not** own product schemas; Kernel may depend on Ajv only if a Kernel-local config schema is introduced later. Platform schema validation for `/schemas` is a **CI + Runtime** concern per this ADR.

### 6. CI Validation Approach

- **GitHub Actions** workflow (repo root `.github/workflows/`):
  1. **schemas:** on changes to `/schemas/**` (and any schema-consuming code paths), run Ajv validation over all `**/*.schema.json` (syntax + `$ref` resolution as configured).
  2. **kernel:** on changes to `kernel/**`, run `npm ci` / `npm test` for `@dyogas/kernel`.
- Protected-branch merges for Kernel/Runtime require these checks green (once workflows land in Implementation).

### 7. Kernel Package Boundary (restated)

- Kernel SHALL NOT import Harness orchestration, `/pipelines`, or `/contracts` agent-runtime packages.
- Enforced by an automated boundary test (SPEC-RT-001 success metric; BL-K-060).

## Consequences

- Kernel Implementation may merge to protected branches only when this ADR is `Accepted` and item DoD is met.  
- Runtime/Trust/SDK inherit TypeScript + Node 22 LTS + npm + `node:test`/`tsx` + Ajv/CI pattern unless superseded.  
- Solo-founder / low-budget: zero paid runtime license; minimal test tooling; AI agents generate TypeScript reliably.  
- Local-first: all Kernel primitives and tests run offline on Node without cloud services.

## Non-Goals

- Choosing Cloud AI Compute vendor  
- Defining Knowledge SoR storage engine (separate ADR — B2)  
- Implementing Kernel code in this ADR file  
- Choosing frontend/UI framework  
- Mandating a monorepo tool beyond npm (Turborepo/Nx deferred)
