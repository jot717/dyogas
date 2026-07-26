# DYOGAS Master Architecture

**Version:** 1.2.0  
**Status:** Canonical — **Repository Single Source of Truth (SSOT)** · Master Navigation & Module Registry  
**Effective:** 2026-07-22  
**Owner:** Chief Software Architect / Chief Repository Architect  
**Authority class:** Repository SSOT (structure, registries, domain→location map, traceability) — **not** a substitute for Constitution, Harness, or Engineering Process **content**

**Domain content** remains authoritative only in the single location named in **Repository Single Source of Truth (SSOT) → §1 Repository Authority** below.  
**This file** is the sole SSOT for: repository organization, module registration, specification registration, ownership of folders, build/traceability chains, and conflict routing between domains.

---

# Repository Single Source of Truth (SSOT)

This section defines the **governance of the entire repository**: what is authoritative where, who owns each top-level path, what may and may not exist, how work enters, and how conflicts are resolved.

It does **not** restate Constitution articles, Harness execution rules, or Engineering Process stage law. It **points** to exactly one home for each domain and binds the repository to that map.

---

## 1. Repository Authority

Every domain has **exactly one** authoritative location. Secondary documents may **reference** that location; they must not redefine it.

| Domain | Authoritative location (exactly one) | What that location owns |
|--------|--------------------------------------|-------------------------|
| **Repository SSOT** (structure, registries, domain map, module/spec registration, repo traceability) | [`MASTER_ARCHITECTURE.md`](./MASTER_ARCHITECTURE.md) (this file) | Module Registry, Specification Registry, Build Order, Ownership Matrix, Repository Rules |
| **Governance** (supreme engineering law) | [`CONSTITUTION.md`](./CONSTITUTION.md) | Binding Articles; Hierarchy of Authority for legal substance |
| **Architecture** (system planes & hard boundaries) | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Planes, boundaries, architectural thesis (not module registry) |
| **Product intent** | [`docs/PRODUCT_VISION.md`](./docs/PRODUCT_VISION.md) + [`docs/PRODUCT_PRINCIPLES.md`](./docs/PRODUCT_PRINCIPLES.md) | Vision and principles (Vision for “why”; Principles for prioritization litmus) — **Vision is SoR for product north star; Principles is SoR for litmus** |
| **Roadmap** (phase sequencing) | [`docs/ROADMAP.md`](./docs/ROADMAP.md) | Governance/product phase exit criteria |
| **Engineering Process** (lifecycle law) | [`engineering/`](./engineering/) (index: [`engineering/README.md`](./engineering/README.md)) | Spec→Release→Retro process |
| **Specification** (stage: writing/accepting a work spec) | [`engineering/01_SPECIFICATION.md`](./engineering/01_SPECIFICATION.md) | How specifications are authored and architecture-reviewed |
| **Specifications** (platform SPEC catalog / IDs) | [`MASTER_ARCHITECTURE.md`](./MASTER_ARCHITECTURE.md) §7 Specification Registry | Unique SPEC-IDs, module parent, status, deps, priority, sprint |
| **Backlog** | [`engineering/02_BACKLOG.md`](./engineering/02_BACKLOG.md) | Single backlog rules and prioritization |
| **Sprint** | [`engineering/03_SPRINT.md`](./engineering/03_SPRINT.md) | Sprint planning and operating rules |
| **Tasks** | [`engineering/04_TASK_MANAGEMENT.md`](./engineering/04_TASK_MANAGEMENT.md) | Task breakdown rules |
| **Implementation** (process) | [`engineering/05_IMPLEMENTATION.md`](./engineering/05_IMPLEMENTATION.md) | How implementation work is performed under process law |
| **Testing** | [`engineering/06_TESTING.md`](./engineering/06_TESTING.md) | Test obligations and evidence |
| **Debugging** | [`engineering/07_DEBUGGING.md`](./engineering/07_DEBUGGING.md) | Interrupt-path diagnosis rules |
| **Code Review** | [`engineering/08_CODE_REVIEW.md`](./engineering/08_CODE_REVIEW.md) | Review and approval of changes |
| **Release** (incl. regression & merge process) | [`engineering/09_RELEASE.md`](./engineering/09_RELEASE.md) | Regression, merge, release |
| **Retrospective** | [`engineering/10_RETROSPECTIVE.md`](./engineering/10_RETROSPECTIVE.md) | Learning and process actions |
| **Definition of Done** | [`engineering/14_DEFINITION_OF_DONE.md`](./engineering/14_DEFINITION_OF_DONE.md) | Immutable completion gate |
| **Definition of Ready** | [`engineering/15_DEFINITION_OF_READY.md`](./engineering/15_DEFINITION_OF_READY.md) | Immutable sprint-entry gate |
| **Branching** | [`engineering/11_BRANCHING.md`](./engineering/11_BRANCHING.md) | Branch naming and protection |
| **Commit convention** | [`engineering/12_COMMIT_CONVENTION.md`](./engineering/12_COMMIT_CONVENTION.md) | Commit message standard |
| **Documentation process** | [`engineering/13_DOCUMENTATION.md`](./engineering/13_DOCUMENTATION.md) | Docs-with-behavior rules |
| **Decision Log** | [`docs/adr/README.md`](./docs/adr/README.md) → section **Decision Log Entries (Append-Only)** | Append-only material decisions (Art. VII) |
| **ADR** | [`docs/adr/`](./docs/adr/) (process: [`docs/adr/README.md`](./docs/adr/README.md); records: `NNNN-*.md`) | Architecture Decision Records (Art. VIII) |
| **Harness / Execution** | [`harness/HARNESS_SPECIFICATION.md`](./harness/HARNESS_SPECIFICATION.md) | Pipeline engine, state machine, gates, audit |
| **Skills** | [`harness/SKILL_SPECIFICATION.md`](./harness/SKILL_SPECIFICATION.md) | Skill catalog |
| **Agent Contracts** | [`contracts/`](./contracts/) | Per-agent obligations |
| **Pipelines** | [`pipelines/`](./pipelines/) | Stage topology and exit criteria |
| **Artifacts** (deliverable meaning) | [`artifacts/`](./artifacts/) | Immutable artifact semantics |
| **Schemas** (shapes) | [`schemas/`](./schemas/) | JSON Schema SoR for wire shapes |
| **Modules** (registry) | [`MASTER_ARCHITECTURE.md`](./MASTER_ARCHITECTURE.md) §6 | Every `MOD-*` definition |
| **Build Order** | [`MASTER_ARCHITECTURE.md`](./MASTER_ARCHITECTURE.md) §5 | Mandatory implementation sequence |
| **Engineering Agents** | Process Mode: [`engineering/README.md`](./engineering/README.md) §2a; Hosted Mode: Module `MOD-ENG-AGENTS` after B8 | Process Mode is authoritative until Hosted Mode Module Complete |
| **Runtime** | Module `MOD-RUNTIME` in this file §6; admit/state/handoff primitives (ADR-0003) | Runtime primitives host |
| **Kernel** | Module `MOD-KERNEL` — **MVP first code module** (B5); [`kernel/`](./kernel/) | Kernel primitives |
| **Execution Host** | Module `MOD-EXECUTION-HOST` in this file §6; Pipeline Engine implementation (ADR-0010); [`execution-host/`](./execution-host/) | Stage walker under Harness law |
| **Agent SDK** | Module `MOD-AGENT-SDK` in this file §6; SPEC-RT-003 | Contract bind / skill invoke SDK |
| **Trust adapters** | Module `MOD-TRUST` in this file §6; SPEC-RT-004 | Identity, secrets, egress, audit sink |
| **Research Engine** | Module `MOD-RESEARCH` in this file §6; SPEC-ENGIN-001 | Research domain engine |
| **Knowledge Engine** | Module `MOD-KNOWLEDGE` in this file §6; SPEC-ENGIN-002 | Knowledge / memory / embedding engine |
| **Markdown Engine** | Module `MOD-MARKDOWN` in this file §6; SPEC-ENGIN-003 | Markdown domain engine |
| **Graph Engine** | Module `MOD-GRAPH` in this file §6; SPEC-ENGIN-004 | Graph domain engine |
| **Web UI** | Module `MOD-WEB-UI` in this file §6; SPEC-UI-001 | Experience / Web UI |
| **Entry map** (onboarding links only) | [`README.md`](./README.md) | Human/AI entry pointers — **not** law, **not** module registry |

**Rule:** If a domain is not listed, it does not have an authoritative home until it is added to this table in the same change set that introduces it.

---

## 2. Ownership Matrix

| Top-level path | Purpose | Owner | Allowed content | Forbidden content | Authoritative |
|----------------|---------|-------|-----------------|-------------------|---------------|
| `/` (root files) | Constitution, Master Architecture, entry README | Chief Systems Architect / Chief Repository Architect | `CONSTITUTION.md`, `MASTER_ARCHITECTURE.md`, `README.md` only as entry/SSOT/law | Application code; duplicate constitutions; shadow architecture docs | **Yes** for those three files’ declared roles |
| `/docs` | Product intent, plane architecture, roadmap | Product + Architecture | Vision, principles, architecture, roadmap, indexes | Runtime code; second Decision Log; module registry copies | **Yes** for product/plane/roadmap domains |
| `/docs/adr` | ADRs + Decision Log SoR | Chief Systems Architect | ADR process, ADR files, Decision Log entries | Feature specs; sprint boards; agent contracts | **Yes** for ADR & Decision Log |
| `/harness` | Execution law + skills | Chief Systems Architect | Harness Spec, Skill Spec, harness index | Product UI; engineering lifecycle docs; module registry | **Yes** for Harness & Skills |
| `/contracts` | Agent Contracts | Chief Systems Architect | Agent contract markdown + contracts index | Pipeline topology; JSON Schema bodies (live in `/schemas`); app code | **Yes** for Agent Contracts |
| `/pipelines` | Pipeline stage topology | Chief Systems Architect | Pipeline specs + index | Agent role redefinition; process lifecycle | **Yes** for Pipelines |
| `/artifacts` | Artifact meaning | Chief Systems Architect | Artifact specs + index | Schema JSON (→ `/schemas`); runtime stores | **Yes** for Artifact meaning |
| `/schemas` | Machine-checkable shapes | Chief Systems Architect | JSON Schema bundles | Narrative law that contradicts contracts/artifacts; app code | **Yes** for Schemas |
| `/engineering` | Engineering Process law | Chief Engineering Officer | Process docs `01`–`15`, engineering index | Module registry; plane architecture; Harness state machines | **Yes** for Engineering Process domains |
| Future `/kernel` (registered; MVP first) | Kernel implementation + specs | Kernel Owner | Kernel code, tests, SPEC-RT-001, stage reviews | Second harness; unregistered packages | **Yes** for Kernel **code**; registry remains this file |
| `/runtime` (registered) | Runtime implementation | Runtime Owner | Runtime code/tests; SPEC-RT-002 | Bypass of Harness semantics; full pipeline stage walker (→ Execution Host) | **Yes** for Runtime **code** |
| `/sdk` (registered) | Agent SDK | SDK Owner | SDK code + tests for `MOD-AGENT-SDK` | Unbound agent runners; pipeline admit | **Yes** for Agent SDK **code** |
| `/execution-host` (registered) | Pipeline Execution Host | Execution Host Owner | Host code/tests; SPEC-EXECUTION-HOST-001 | Harness law edits; Runtime/SDK source forks; product UI | **Yes** for Execution Host **code** |
| Engine paths (`research/`, `knowledge/`, `markdown/`, `graph/`, …) | Domain engines | Engine Owners | Engine code bound to `MOD-*` + SPECs | Side-channel SoR writes; duplicate engines; shadow orchestration | **Yes** for that engine’s **code** |
| `/web-ui` (registered) | Experience UI | Web UI Owner | UI for approvals/status/browse | Direct Cloud AI Compute; silent SoR mutation | **Yes** for Web UI **code** |
| `/personal-brain` (registered) | Personal Second Brain product | Product Owner | Product module code/tests; product SPECs | Platform Runtime/SDK/Harness rewrites; second orchestrator | **Yes** for Personal Brain **code** |

**Authoritative = Yes** means: for the domain that folder is assigned in §1, that folder (or named file) is the only place that domain’s truth may be defined.

---

## 3. Repository Rules

These rules are **immutable** at repository level unless this SSOT section is amended with Decision Log + human approval (and ADR if topology changes).

1. **One SSOT for repository organization** — `MASTER_ARCHITECTURE.md` is the only registry for modules, SPEC-IDs, build order, folder ownership, and domain→location mapping.  
2. **No duplicated specifications** — A capability has one SPEC-ID and one authoritative spec path; copies are references only.  
3. **No duplicated module definitions** — A capability has one `MOD-*` row in §6; engines do not redefine modules locally.  
4. **Every implementation belongs to exactly one Specification** — Code/PRs must cite a SPEC-ID (or an engineering work-spec that itself cites a SPEC-ID for platform work).  
5. **Every Specification belongs to exactly one Module** — §7 `Module` column is mandatory and singular.  
6. **Every Module belongs to MASTER_ARCHITECTURE** — Unlisted modules do not exist (§7 Module Registration Rules).  
7. **Nothing may bypass Engineering Process** — Delivery must follow `/engineering` stages (DoR/DoD included).  
8. **Nothing may bypass Architecture Review** — Per [`engineering/01_SPECIFICATION.md`](./engineering/01_SPECIFICATION.md); architecture-class changes require ADR.  
9. **Nothing may bypass the Harness** for production multi-agent work — Constitution Art. XIII; Harness Spec.  
10. **Nothing may bypass Human Approval** for consequential SoR / protected production transitions — Constitution Art. III.  
11. **No parallel Constitutions, Harnesses, backlogs, or Decision Logs.**  
12. **No application code in governance folders** (`/docs`, `/harness`, `/contracts`, `/pipelines`, `/artifacts`, `/schemas`, `/engineering`) except schema JSON under `/schemas`.  
13. **Dependencies are acyclic** — §4 Dependency Graph; circular module deps are forbidden.  
14. **Build Order is mandatory** — §5; later modules are not implemented before declared prerequisites.  
15. **README is not law** — [`README.md`](./README.md) may only point; it must not redefine registries or domain authority.

---

## 4. Traceability Rules

### 4.1 Mandatory chain

Every piece of repository work that produces a durable change must be traceable through:

```
MASTER_ARCHITECTURE
    ↓
Module (MOD-*)
    ↓
Specification (SPEC-* and/or engineering work-spec)
    ↓
Architecture Review (verdict; ADR if required)
    ↓
Backlog
    ↓
Sprint
    ↓
Task
    ↓
Implementation
    ↓
Testing
    ↓
Release
```

### 4.2 Artifact → Module rule

Every durable artifact (sealed pipeline artifact, release, ADR, Decision Log entry that creates lasting policy, merged implementation) must trace to **exactly one** parent Module (`MOD-*`) registered in this file.

| Artifact class | Trace field required |
|----------------|----------------------|
| Platform code / PR | `Module` + `SPEC-ID` + Backlog/Task ids |
| Pipeline sealed artifact | `run_id` + producing agent contract + pipeline stage (module via implementing engine) |
| ADR | Links Architecture domain + affected `MOD-*` if any |
| Decision Log entry | Links domain + optional `MOD-*` / `SPEC-ID` |
| Release | Version + SPEC/Module set included |

### 4.3 Completeness

Missing any link in §4.1 for protected-branch merges means the change is **not Done** ([`engineering/14_DEFINITION_OF_DONE.md`](./engineering/14_DEFINITION_OF_DONE.md)).

---

## 5. Conflict Resolution

When two documents disagree, apply this **exact** precedence:

### 5.1 Precedence order (highest wins first)

1. **[`CONSTITUTION.md`](./CONSTITUTION.md)** — supreme law for legal substance (Articles).  
2. **Accepted ADRs** ([`docs/adr/`](./docs/adr/)) — architecture-class decisions within constitutional bounds.  
3. **Domain authoritative document** named in **SSOT §1** for the domain in dispute (e.g. Harness Spec wins on execution semantics; `/engineering` wins on sprint rules).  
4. **Decision Log** — material non-architecture decisions; no standing if absent.  
5. **`MASTER_ARCHITECTURE.md` (this file)** — wins on repository organization, module/SPEC registration, ownership matrix, build order, and domain→location mapping; must be amended if it drifts from (1)–(3).  
6. **Indexes / README / commentary** — lowest; never override (1)–(5).  
7. **Chat, tribal knowledge, PR description alone** — no standing.

### 5.2 Specialization rules

| Conflict type | Winner |
|---------------|--------|
| “Where does domain X live?” / “Is module Y registered?” / “What is SPEC-Z’s parent module?” | **This file (SSOT)** |
| “What does Article X require?” | **Constitution** |
| “What is the plane boundary?” | **`docs/ARCHITECTURE.md`** (after applicable ADR) |
| “How does a pipeline run advance?” | **Harness Specification** |
| “What is DoD?” | **`engineering/14_DEFINITION_OF_DONE.md`** |
| “What fields does ResearchReport have?” | **`/artifacts` + `/schemas`** (schemas win on machine shape if narrative drifts — then fix narrative in same change set) |
| This file vs domain content law | Domain content law wins for substance; **update this file** to restore the map |

### 5.3 Resolution workflow

1. Identify the domain of the dispute using SSOT §1.  
2. Apply §5.1–§5.2.  
3. If this file is stale vs a higher authority, open a PR amending **only** this file (or the domain doc if the domain doc is wrong).  
4. Log material resolutions in the Decision Log; use ADR for architecture-class fixes.

---

## 6. Repository Lifecycle

No work may skip a stage.

```
Idea
  ↓
Architecture Registration   ← Module (± SPEC row) registered in THIS FILE first
  ↓
Specification               ← engineering/01 + SPEC-ID in §7 when platform-scoped
  ↓
Architecture Review         ← engineering/01; ADR if required
  ↓
Backlog                     ← engineering/02
  ↓
Sprint                      ← engineering/03 (DoR)
  ↓
Task                        ← engineering/04
  ↓
Implementation              ← engineering/05 (only after Build Order deps)
  ↓
Testing                     ← engineering/06
  ↓
Code Review                 ← engineering/08
  ↓
Regression → Merge → Release← engineering/09 (DoD)
  ↓
Retrospective               ← engineering/10 (when applicable)
```

**Hard gates:**

- Unregistered module → **stop** (no directories, no packages, no “temporary” engines).  
- Failed Architecture Review / unmet ADR → **stop** before Implementation.  
- Failed DoR → **not** Sprint-committed.  
- Failed DoD → **not** merged/released.  
- Build Order violation → **not** merged to protected branches.

---

## 7. Module Registration Rules

1. **No new module may exist** unless first registered in **§6 Module Registry** of this file.  
2. Registration PR must include: Purpose, Responsibilities, Inputs, Outputs, Dependencies (acyclic), Related Documents, Related Specifications, Current Status, Next Milestone.  
3. Registration must update **§3 Layer Architecture**, **§4 Dependency Graph**, and **§5 Build Order** when the module affects layering or sequence.  
4. Registration requires Decision Log entry; ADR if planes/trust/harness topology change.  
5. Creating a code directory for an unregistered module is a **repository SSOT violation** and must be reverted.  
6. Renaming/retiring a module is an amendment to this file (status `retired`); do not delete history of SPEC-IDs.

---

## 8. Specification Registration Rules

Every Specification in the platform catalog (**§7**) must have:

| Field | Rule |
|-------|------|
| **Unique ID** | `SPEC-*` form; never reused |
| **Parent Module** | Exactly one `MOD-*` |
| **Status** | `accepted` \| `draft` \| `planned` (or future enum amended here) |
| **Dependencies** | Explicit SPEC-IDs or `—` |
| **Priority** | `P0`–`P3` |
| **Target Sprint** | Planning label or real sprint id |

Additional rules:

1. Authoritative **content** of a specification lives in its domain path (contracts, harness, engineering, etc.) — §7 is the **registry**, not a second copy of the full text.  
2. Engineering work-specs (feature RFCs) follow [`engineering/01_SPECIFICATION.md`](./engineering/01_SPECIFICATION.md) and must link a parent Module; platform work must also link a SPEC-ID.  
3. No SPEC may be marked `accepted` without an authoritative content location existing.  
4. Implementation without a SPEC-ID (for platform modules) is forbidden.

---

## 9. Repository Audit Rules

1. **Every commit** that changes behavior, registries, or governance must be attributable and preferably reference Backlog/Task ids ([`engineering/12_COMMIT_CONVENTION.md`](./engineering/12_COMMIT_CONVENTION.md)).  
2. **Every feature** must trace through SSOT §4.1 to a Module in this file.  
3. **Every sprint commitment** must only include DoR-ready items that cite Module (+ SPEC-ID when platform-scoped).  
4. **Every implementation** must belong to one Module and one Specification chain.  
5. **Every release** must list included Module/SPEC set or equivalent changelog trace.  
6. **Audit failure** (cannot trace to MASTER_ARCHITECTURE Module) → treat as non-compliant; block merge or remediate before next related change.  
7. Automated or human audits may use §1–§9 of this SSOT section as the checklist; domain law is audited against the single authoritative file named in §1.

---

## SSOT Acceptance Criteria

- [ ] Every domain in §1 has exactly one authoritative location.  
- [ ] Every top-level folder has an Ownership Matrix row.  
- [ ] Every `MOD-*` appears only in this file’s registry.  
- [ ] Every `SPEC-*` has Unique ID, Parent Module, Status, Dependencies, Priority, Target Sprint.  
- [ ] Conflict resolution §5 is applied when documents disagree.  
- [ ] No merged platform work lacks Module (+ SPEC) traceability.

## SSOT Failure Cases

- Second “master architecture” or second module registry created → Critical; delete/revert; keep this file.  
- Code directory for unregistered module → Critical; revert.  
- Domain redefined in README or chat → No standing; ignore.  
- SPEC without parent Module → Invalid; do not implement.

---

## 0. How to Use This Document

1. **New humans / AI operators** — Read **Repository SSOT (§1–§9)** first, then §1–§3 System Overview; follow links into the single authoritative domain location.  
2. **Implementers** — Obey SSOT §6 lifecycle + §5 Build Order; nothing ships before its dependencies or without Module/SPEC trace.  
3. **Architects** — Register every module in §6 and every specification in §7 **before** work begins (SSOT §7–§8).  
4. **No unregistered modules** — A directory, package, or “engine” that is not in §6 does not exist for DYOGAS (SSOT §7).

---

## 1. System Overview

### 1.1 What DYOGAS Is

DYOGAS is a **Harness-first, local-first knowledge platform** with a **Cloud AI Compute** layer:

- Users and organizations **own** their knowledge (Knowledge Plane SoR).  
- Heavy model work runs as **purpose-bound, minimized, audited** cloud compute.  
- Multi-agent work runs **only** through the Harness: contracts → immutable artifacts → pipelines → review gates → human approval → audit.  
- Product delivery follows a single engineering lifecycle (spec → release → retro).

Product north star: [`docs/PRODUCT_VISION.md`](./docs/PRODUCT_VISION.md)  
Plane shape: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)  
Execution: [`harness/HARNESS_SPECIFICATION.md`](./harness/HARNESS_SPECIFICATION.md)

### 1.2 One Architecture (Governance + Future Runtime)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXPERIENCE / WEB UI                             │
│              Intent · Consent · Approvals · Status · Browse             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                    ENGINEERING PROCESS (how we build)                   │
│         Spec → Backlog → Sprint → Impl → Test → Review → Release        │
│                         /engineering (law)                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ produces & governs change to
┌────────────────────────────────▼────────────────────────────────────────┐
│                         GOVERNANCE KERNEL                               │
│  Constitution · ADRs · Vision/Principles · Decision Log · High-level    │
│  Architecture (planes)                                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ constrains
┌────────────────────────────────▼────────────────────────────────────────┐
│                              HARNESS                                    │
│   Pipeline Engine · State Machine · Handoffs · Retry · Gates · Audit    │
│   Skills catalog                                                        │
└───┬──────────────┬──────────────┬──────────────┬────────────────────────┘
    │              │              │              │
    ▼              ▼              ▼              ▼
 Contracts     Pipelines     Artifacts      Schemas
 (agents)    (stages)     (meaning)      (shapes)
    │              │              │              │
    └──────────────┴──────┬───────┴──────────────┘
                          │ binds
┌─────────────────────────▼───────────────────────────────────────────────┐
│                     RUNTIME PLATFORM (implemented)                        │
│  Kernel · Trust · Runtime (primitives) · Agent SDK                        │
│  **Execution Host** (Pipeline Engine implementation — ADR-0010)           │
└───┬──────────────┬──────────────┬──────────────┬────────────────────────┘
    │              │              │              │
    ▼              ▼              ▼              ▼
 Research      Knowledge     Markdown       Graph
 Engine        Engine        Engine         Engine
 (+ Embedding / Memory capabilities under Knowledge Engine)
    │
    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ Knowledge Plane (local-first SoR)  ·  Cloud AI Compute  ·  Trust&Control│
└─────────────────────────────────────────────────────────────────────────┘
```

**Today’s repository state:** Governance Kernel + Harness + Contracts/Pipelines/Artifacts/Schemas + Engineering Process are **specified**. Runtime Platform, domain Engines, and Web UI are **registered modules** awaiting implementation per §5–§6 — they must not be invented outside this registry.

### 1.3 Canonical Product Pipeline (Knowledge Ingestion)

```
Research → Validation → Proposal → Human Review → Markdown → Graph → Embedding → Memory
```

Authoritative stage law: [`pipelines/knowledge-ingestion.md`](./pipelines/knowledge-ingestion.md)

### 1.4 Analysis Snapshot (Repo Read)

| Finding | Classification | Action in this index |
|---------|----------------|----------------------|
| Constitution / Harness / Engineering / Contracts / Pipelines / Artifacts / Schemas are complete and authoritative in-scope | Healthy | Reference only; do not duplicate |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) = planes; this file = modules + build order | Complementary | Keep both; different jobs |
| Root [`README.md`](./README.md) = OS entry map; this file = master architectural index | Complementary | README points here for architecture navigation |
| Roadmap Phase 0 still lists Decision Log / ADR as unchecked | Stale checklist vs reality | Decision Log + ADR process live in [`docs/adr/README.md`](./docs/adr/README.md); roadmap update is a separate process change (not done here) |
| `engineering/README.md` Decision Log location wording may lag ADR README | Minor drift | Treat [`docs/adr/README.md`](./docs/adr/README.md) Decision Log section as SoR |
| No application code / runtime packages yet | Expected | Modules marked `specified` / `not_started` |
| “Engineering Agents” vs knowledge-pipeline agents | Potential confusion | Separated: Process Mode under `/engineering`; Hosted `MOD-ENG-AGENTS` after B8; product agents under `/contracts` |
| Runtime Spec blocked on hosted Engineering Agents | Bootstrap deadlock | Fixed: Process Mode has no Runtime dependency |
| Dependency graph showed `runtime → trust` inverted | Incorrect | Fixed: `kernel → trust → runtime` |
| B1 Decision Log “not done” while file exists | Stale | Marked DONE in Build Order |
| Solo Founder Mode | Incorrect role collapse | Voided; must not return |

---

## 2. Repository Map

| Path | Responsibility | Authoritative? |
|------|----------------|----------------|
| [`CONSTITUTION.md`](./CONSTITUTION.md) | Supreme engineering law | Yes — law |
| [`MASTER_ARCHITECTURE.md`](./MASTER_ARCHITECTURE.md) | Master navigation, module & specification registries, build order | Yes — **index only** |
| [`README.md`](./README.md) | Human/AI entry point to the Engineering OS | Yes — map |
| [`docs/`](./docs/) | Product vision, principles, high-level plane architecture, roadmap, ADRs, Decision Log | Yes — product & arch shape |
| [`docs/adr/`](./docs/adr/) | ADR process + append-only Decision Log | Yes — Art. VII–VIII |
| [`harness/`](./harness/) | Execution law: pipeline engine, lifecycle, gates, audit, skills | Yes — execution law |
| [`contracts/`](./contracts/) | Published Agent Contracts | Yes — agent law |
| [`pipelines/`](./pipelines/) | Named pipeline stage topology & exit criteria | Yes — topology |
| [`artifacts/`](./artifacts/) | Immutable deliverable semantics | Yes — meaning |
| [`schemas/`](./schemas/) | JSON Schema shapes for envelopes, artifacts, agent I/O | Yes — shapes |
| [`engineering/`](./engineering/) | Delivery lifecycle, DoR/DoD, branching, commits, review, release | Yes — process law |

**Not present yet (registered in §6 only):** `runtime/`, `kernel/`, `sdk/`, `engines/`, `web/`, application packages. Creating them requires §9 registration update **in this file first**, then implementation under `/engineering` process.

---

## 3. Layer Architecture

Layers are ordered from **constraint** (top) to **implementation** (bottom). Lower layers may depend on upper layers; upper layers must not depend on lower implementation details.

| # | Layer | Kind | Status | Authority / Spec Home |
|---|--------|------|--------|------------------------|
| L0 | **Constitution** | Governance | Active | [`CONSTITUTION.md`](./CONSTITUTION.md) |
| L1 | **Product & Plane Architecture** | Governance | Active | [`docs/`](./docs/) especially [`ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| L2 | **Engineering Process** | Governance | Active | [`engineering/`](./engineering/) |
| L3 | **Harness** | Execution governance | Active | [`harness/HARNESS_SPECIFICATION.md`](./harness/HARNESS_SPECIFICATION.md), [`SKILL_SPECIFICATION.md`](./harness/SKILL_SPECIFICATION.md) |
| L4 | **Contract–Pipeline–Artifact–Schema (CPAS)** | Execution governance | Active | [`contracts/`](./contracts/), [`pipelines/`](./pipelines/), [`artifacts/`](./artifacts/), [`schemas/`](./schemas/) |
| L5 | **Kernel** | Runtime platform | Active (Module Complete) | Module `MOD-KERNEL` — OS primitives: config, tenancy, logging hooks, clock, id generation |
| L6 | **Trust & Control Adapters** | Runtime platform | Active (Module Complete) | Module `MOD-TRUST` — identity, secrets, egress gate, audit sink |
| L7 | **Runtime** | Runtime platform | Active (Module Complete) | Module `MOD-RUNTIME` — admit/state/handoff/retry **primitives** (ADR-0003); does not own full pipeline stage walker |
| L8 | **Execution Host** | Runtime platform | Active (Module Complete) | Module `MOD-EXECUTION-HOST` — Pipeline Engine **implementation**; loads `/pipelines`, composes Runtime + SDK under Harness law (ADR-0010) |
| L9 | **Agent SDK** | Runtime platform | Active (Module Complete) | Module `MOD-AGENT-SDK` — bind contracts, invoke skills, emit candidates under Harness |
| L10 | **Research Engine** | Domain engine | Active (Module Complete) | Module `MOD-RESEARCH` — Research/Validation (+ B10 path) |
| L11 | **Knowledge Engine** | Domain engine | Active (Module Complete) | Module `MOD-KNOWLEDGE` — SoR apply, merge, score, memory, embeddings index |
| L12 | **Markdown Engine** | Domain engine | Active (Module Complete) | Module `MOD-MARKDOWN` — Markdown Agent implementation |
| L13 | **Graph Engine** | Domain engine | Active (Module Complete) | Module `MOD-GRAPH` — Knowledge Graph Agent + Graph Update |
| L14 | **Engineering Agents** | Meta / builder agents | Process Mode active; Hosted deferred | Process Mode: `/engineering` §2a. Hosted: `MOD-ENG-AGENTS` (B17 optional) |
| L15 | **Web UI** | Experience | Active (Module Complete) | Module `MOD-WEB-UI` — Experience Plane surfaces |
| L16 | **Personal Second Brain** | Experience / Product | Active (Module Complete) | Module `MOD-PERSONAL-BRAIN` — product requester of Host/Harness; not a second orchestrator |

**Cloud AI Compute** is an external/system plane (see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)), consumed by Runtime and Engines via Trust & Control — not a repo module until an ADR places a client adapter under `MOD-TRUST` or `MOD-RUNTIME`.

---

## 4. Dependency Graph

### 4.1 Rules

1. **No circular dependencies** between modules.  
2. Governance layers do not import runtime code.  
3. Domain Engines depend on Agent SDK + Runtime + Kernel + CPAS specs; they do not redefine Harness law.  
4. Web UI depends on Runtime APIs / approval surfaces; it must not call Cloud AI Compute or mutate Knowledge SoR except through Harness-approved paths.  
5. Process Mode Engineering Agents do not depend on Agent SDK. Hosted `MOD-ENG-AGENTS` may use Agent SDK after B8 but must not bypass product Human Approval for SoR or protected merges.

### 4.2 Directed Dependencies (allowed edges)

```
CONSTITUTION
    └── docs (vision, planes, ADR, Decision Log)
            └── engineering
                    └── (constrains all implementation modules)

CONSTITUTION + docs
    └── harness
            └── contracts
            └── pipelines
            └── artifacts
            └── schemas
                    └── (CPAS jointly constrain runtime)

kernel ──► trust-adapters ──► runtime ──► agent-sdk ──► research-engine
                │                  │            │
                │                  │            ├──► knowledge-engine
                │                  │            ├──► markdown-engine
                │                  │            ├──► graph-engine
                │                  │            └──► eng-agents-hosted (B17 only)
                │                  │
                │                  └──► execution-host ──► (composes) runtime + agent-sdk
                │                              │              + /pipelines (CPAS)
                │                              └──► experience products request Host
                │                                   (e.g. personal-brain — requester only)

engineering-process (Process Mode Engineering Agents)
    └── no dependency on runtime/sdk/engines
        └── may approve specs for kernel/runtime/trust before those modules exist

runtime + trust-adapters + knowledge-engine (read APIs)
    └── web-ui

research-engine ──► (feeds artifacts into) knowledge/markdown/graph engines
                    via Harness pipelines + Execution Host — not direct SoR writes
```

### 4.3 Forbidden Edges (examples)

| Forbidden | Why |
|-----------|-----|
| `web-ui` → Cloud AI Compute directly | Egress must pass Trust & Harness policy |
| `markdown-engine` → Knowledge SoR apply without approval token | Constitution Art. III / XIII |
| `research-engine` → `graph-engine` side channel | Must use sealed artifacts + pipeline handoffs |
| `kernel` → `web-ui` | Inverts layering |
| `eng-agents-hosted` → required before Runtime specs can be approved | Bootstrap deadlock — use Process Mode instead |
| New parallel harness inside an engine | Constitution Art. VI / XIII |
| Process Mode Engineering Agent = Founder | Forbidden role collapse |
| `personal-brain` → multi-agent SoR orchestration bypassing Execution Host | Constitution Art. XIII; ADR-0010 |
| `execution-host` → rewrite Runtime state machine / Harness law | ADR-0003 / ADR-0010; Host composes only |

---

## 5. Build Order

Mandatory sequence. A later item may be **designed** earlier, but **implementation and merge to protected branches** require prior milestones complete (evidenced DoD + any required ADR).

**Exactly one valid build order (no cycles):**

| Step | Milestone | Gate / notes |
|------|-----------|--------------|
| B0 | Governance complete | Constitution, docs, harness, CPAS, engineering present — **DONE** |
| B0.5 | Process Mode Engineering Agents executable | `/engineering` §2a Process Mode — **no Runtime dependency** — **DONE** |
| B1 | Decision Log + ADR process live | [`docs/adr/README.md`](./docs/adr/README.md) — **DONE** |
| B2 | ADR: Knowledge SoR boundary | Art. VIII — **DONE** (ADR-0006 Accepted) |
| B3 | ADR: Cloud AI Compute / egress boundary | Art. VIII — **DONE** (ADR-0002 Accepted — deny-by-default; allow-egress still OOS) |
| B4 | ADR: Schema validation & runtime tech stack | Art. VIII — **DONE** (ADR-0001 Accepted) |
| B5 | **Kernel** (`MOD-KERNEL`) — **MVP first code module** | **DONE** — Module Complete (`MODULE_STATUS.md`) |
| B6 | **Trust adapters** (`MOD-TRUST`) | **DONE** — Module Complete |
| B7 | **Runtime** (`MOD-RUNTIME`) | **DONE** — Module Complete (ADR-0003) |
| B8 | **Agent SDK** (`MOD-AGENT-SDK`) | **DONE** — Module Complete (ADR-0004) |
| B9 | **Research Engine** MVP | **DONE** — Module Complete (ADR-0005) |
| B10 | Validation + Proposal path | **DONE** — under MOD-RESEARCH (`SPEC-ENGIN-001-B10`; `@dyogas/research-engine@0.2.0`) |
| B11 | Human Approval Gate + Notification | **DONE** — `@dyogas/human-gate@0.1.0` (SPEC-PIPE-B11; not a new `MOD-*`) |
| B12 | **Markdown Engine** | **DONE** — Module Complete (ADR-0007; `@dyogas/markdown-engine@0.1.0`) |
| B13 | **Knowledge Engine** | **DONE** — Module Complete (ADR-0006; approval-gated SoR) |
| B14 | **Graph Engine** + Embedding path | **DONE** — Module Complete (`@dyogas/graph-engine@0.1.0`; local-hash embeddings; no durable DB) |
| B15 | Full `knowledge-ingestion` green (non-prod) | **DONE** — `@dyogas/ingestion-e2e@0.1.0` (pipeline package; not a new `MOD-*`) |
| B16 | **Web UI** | **DONE** — Module Complete (`@dyogas/web-ui@0.1.0`; Human Approval console) |
| B17 | **Hosted Engineering Agents** (`MOD-ENG-AGENTS`) | Optional upgrade from Process Mode; depends on Agent SDK (B8) — **deferred (not required for MVP)** |
| B18 | **Execution Host** (`MOD-EXECUTION-HOST`) | **DONE** — Module Complete (`@dyogas/execution-host@0.0.1`; SPEC-EXECUTION-HOST-001; ADR-0010; Pipeline Engine implementation composing Runtime + SDK + `/pipelines`) |

**Hard rules:**

1. No circular dependencies.  
2. No engine implementation before B5–B8.  
3. Process Mode Engineering Agents do **not** depend on B5–B18.  
4. Runtime **Specification** may complete before B5; Runtime **Implementation** may not start before B5+B6 (+ B4 ADR).  
5. No second orchestrator — Experience products **request** Execution Host; they do not reimplement pipeline driving.  
6. Execution Host does **not** replace Runtime primitives or redefine Harness law.

---

## 6. Module Registry

Status values: `active_spec` | `specified` | `not_started` | `in_progress` | `retired`

### 6.1 MOD-CONSTITUTION

| Field | Value |
|-------|-------|
| **Purpose** | Supreme law for all contributors and agents |
| **Responsibilities** | Articles I–XIII; hierarchy of authority; amendment |
| **Inputs** | Amendment PRs, ADRs |
| **Outputs** | Binding constraints on all modules |
| **Dependencies** | None |
| **Related Documents** | [`CONSTITUTION.md`](./CONSTITUTION.md) |
| **Related Specifications** | SPEC-GOV-001 |
| **Current Status** | `active_spec` |
| **Next Milestone** | Keep aligned; no runtime code |

### 6.2 MOD-DOCS

| Field | Value |
|-------|-------|
| **Purpose** | Product intent, plane architecture, roadmap, ADRs, Decision Log |
| **Responsibilities** | Vision, principles, high-level shape, phase gates |
| **Inputs** | Product/architecture decisions |
| **Outputs** | Docs & ADRs that constrain build |
| **Dependencies** | MOD-CONSTITUTION |
| **Related Documents** | [`docs/README.md`](./docs/README.md), [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), [`docs/PRODUCT_VISION.md`](./docs/PRODUCT_VISION.md), [`docs/PRODUCT_PRINCIPLES.md`](./docs/PRODUCT_PRINCIPLES.md), [`docs/ROADMAP.md`](./docs/ROADMAP.md), [`docs/adr/README.md`](./docs/adr/README.md) |
| **Related Specifications** | SPEC-GOV-002 … SPEC-GOV-006 |
| **Current Status** | `active_spec` |
| **Next Milestone** | Keep ADRs / Decision Log current; Cloud AI allow-egress when Founder prioritizes |

### 6.3 MOD-ENGINEERING

| Field | Value |
|-------|-------|
| **Purpose** | Single delivery lifecycle and immutable engineering standards |
| **Responsibilities** | Spec→Retro; DoR/DoD; branching; commits; review; release |
| **Inputs** | Pain evidence, specs, capacity |
| **Outputs** | Released, retrospected change |
| **Dependencies** | MOD-CONSTITUTION, MOD-DOCS |
| **Related Documents** | [`engineering/README.md`](./engineering/README.md) and `01`–`15` |
| **Related Specifications** | SPEC-ENG-001 … SPEC-ENG-015 |
| **Current Status** | `active_spec` |
| **Next Milestone** | Drive Build Order via Process Mode; next consumer work (e.g. Personal Brain Bridge via Execution Host) |

### 6.4 MOD-HARNESS

| Field | Value |
|-------|-------|
| **Purpose** | Sole production execution path for multi-agent work |
| **Responsibilities** | Lifecycle, state machine, handoffs, retry, gates, audit; skills catalog |
| **Inputs** | Pipeline runs, contract binds |
| **Outputs** | Sealed artifacts, audit events, apply tokens |
| **Dependencies** | MOD-CONSTITUTION, MOD-DOCS |
| **Related Documents** | [`harness/HARNESS_SPECIFICATION.md`](./harness/HARNESS_SPECIFICATION.md), [`harness/SKILL_SPECIFICATION.md`](./harness/SKILL_SPECIFICATION.md) |
| **Related Specifications** | SPEC-HAR-001, SPEC-HAR-002 |
| **Current Status** | `active_spec` |
| **Next Milestone** | Maintenance; Human Gate productization remains Experience/Host; Runtime primitives COMPLETE |

### 6.5 MOD-CPAS (Contracts · Pipelines · Artifacts · Schemas)

| Field | Value |
|-------|-------|
| **Purpose** | Bind agents, stages, deliverables, and shapes into one execution surface |
| **Responsibilities** | Agent contracts; pipeline topology; artifact meaning; JSON Schemas |
| **Inputs** | Harness runs; stage I/O |
| **Outputs** | Validated sealed artifacts; contract pins |
| **Dependencies** | MOD-HARNESS |
| **Related Documents** | [`contracts/`](./contracts/), [`pipelines/`](./pipelines/), [`artifacts/`](./artifacts/), [`schemas/`](./schemas/) |
| **Related Specifications** | SPEC-AGT-000 (Agent Contract Layer), SPEC-AGT-001…010, SPEC-PIP-001, SPEC-ART-*, SPEC-SCH-001 |
| **Current Status** | `active_spec` |
| **Next Milestone** | Maintain contracts under SPEC-AGT-000 Host-bind model; schema wire bumps only via ADR + Decision Log |

### 6.6 MOD-KERNEL

| Field | Value |
|-------|-------|
| **Purpose** | Minimal platform primitives shared by all runtime code |
| **Responsibilities** | Tenancy context, ids, time, config loading, structured log fields (not product logic) |
| **Inputs** | Process env / config |
| **Outputs** | Primitive APIs for Runtime |
| **Dependencies** | MOD-CONSTITUTION (policy), MOD-DOCS (tenancy concepts); **no** Runtime/SDK dependency |
| **Related Documents** | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) Trust & Knowledge planes; [`kernel/`](./kernel/) when present |
| **Related Specifications** | SPEC-RT-001 |
| **Current Status** | `active_spec` (Module Complete — see [`kernel/MODULE_STATUS.md`](./kernel/MODULE_STATUS.md)) |
| **Next Milestone** | Maintenance; OOS-K-* only via new Spec |

### 6.7 MOD-RUNTIME

| Field | Value |
|-------|-------|
| **Purpose** | Process host for Harness-compatible **primitives**: admit, state transitions, handoff seal/accept, retry |
| **Responsibilities** | Enforce legal transitions; tenancy-bound ExecutionContext; audit emit via Trust sink; **not** full pipeline stage walker |
| **Inputs** | Admit requests; sealed artifact candidates |
| **Outputs** | Run state; sealed ArtifactRef; audit events |
| **Dependencies** | MOD-KERNEL, MOD-HARNESS (spec), MOD-CPAS (spec), MOD-TRUST |
| **Related Documents** | [`harness/HARNESS_SPECIFICATION.md`](./harness/HARNESS_SPECIFICATION.md); [`runtime/`](./runtime/); ADR-0003 |
| **Related Specifications** | SPEC-RT-002 |
| **Current Status** | `active_spec` (Module Complete — see [`runtime/MODULE_STATUS.md`](./runtime/MODULE_STATUS.md); ADR-0003) |
| **Next Milestone** | Maintenance; optional WAITING_HUMAN enrichment only via ADR (GAP-EH-001) |

### 6.7a MOD-EXECUTION-HOST

| Field | Value |
|-------|-------|
| **Purpose** | Pipeline Execution Host — software implementation of the Harness **Pipeline Engine** role |
| **Responsibilities** | Load version-pinned `/pipelines`; compose Runtime + Agent SDK; drive stages; Host-level Human Gate overlay; lineage; audit on Trust sink; authorize Knowledge/Graph apply after token |
| **Inputs** | Product run requests (e.g. ResearchBrief bootstrap); Human decisions |
| **Outputs** | Run status; lineage snapshot; apply authorization; audit events |
| **Dependencies** | MOD-RUNTIME, MOD-AGENT-SDK, MOD-KERNEL, MOD-TRUST, MOD-HARNESS (law), MOD-CPAS (`/pipelines`, contracts) |
| **Related Documents** | [`execution-host/`](./execution-host/); [`specs/SPEC-EXECUTION-HOST-001.md`](./specs/SPEC-EXECUTION-HOST-001.md); ADR-0010; DL-EXECUTION-HOST-001 |
| **Related Specifications** | SPEC-EXECUTION-HOST-001 |
| **Current Status** | `active_spec` (**MODULE COMPLETE** — `@dyogas/execution-host@0.0.1`; SPRINT-EXECUTION-HOST-001 COMPLETE) |
| **Next Milestone** | Consumers (Personal Brain Bridge); B18 MASTER sync complete; wrap MVP runners (GAP-EH-003) |

### 6.8 MOD-AGENT-SDK

| Field | Value |
|-------|-------|
| **Purpose** | Library for binding Agent Contracts and invoking allowed skills |
| **Responsibilities** | Contract pin, precondition checks, skill allowlist, candidate emission |
| **Inputs** | Contract id/version; stage context |
| **Outputs** | Candidate artifacts for Harness seal |
| **Dependencies** | MOD-RUNTIME, MOD-CPAS |
| **Related Documents** | [`contracts/README.md`](./contracts/README.md), [`harness/SKILL_SPECIFICATION.md`](./harness/SKILL_SPECIFICATION.md) |
| **Related Specifications** | SPEC-RT-003 |
| **Current Status** | `active_spec` (Module Complete — see [`sdk/MODULE_STATUS.md`](./sdk/MODULE_STATUS.md); ADR-0004) |
| **Next Milestone** | Maintenance; real skill handlers remain engine-owned (OOS-S-001) |

### 6.9 MOD-TRUST

| Field | Value |
|-------|-------|
| **Purpose** | Trust & Control plane adapters: identity, secrets, egress, audit sink |
| **Responsibilities** | Deny-by-default policy checks; redact; append-only audit storage interface |
| **Inputs** | AuthN/Z context; egress requests; audit events |
| **Outputs** | Allow/deny; audit persistence |
| **Dependencies** | MOD-KERNEL; constrained by Constitution Art. IX–XI |
| **Related Documents** | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md), Harness § Audit / Human Approval |
| **Related Specifications** | SPEC-RT-004 |
| **Current Status** | `active_spec` (Module Complete — see [`trust/MODULE_STATUS.md`](./trust/MODULE_STATUS.md); ADR-0002) |
| **Next Milestone** | Maintenance; cloud allow-egress / durable audit per OOS-T-* |

### 6.10 MOD-RESEARCH

| Field | Value |
|-------|-------|
| **Purpose** | Domain engine for evidence gathering and source validation |
| **Responsibilities** | Implement Research & Source Validation agents; YouTube/GitHub/Reddit/Web research skills; summarization as used in research |
| **Inputs** | ResearchBrief; ValidationRubric |
| **Outputs** | ResearchReport; ValidationReport |
| **Dependencies** | MOD-AGENT-SDK, MOD-TRUST, MOD-CPAS |
| **Related Documents** | [`contracts/agents/research-agent.md`](./contracts/agents/research-agent.md), [`contracts/agents/source-validation-agent.md`](./contracts/agents/source-validation-agent.md), Skill Spec §5.1–5.4, 5.9 |
| **Related Specifications** | SPEC-ENGIN-001 |
| **Current Status** | `active_spec` (Module Complete — see [`research/MODULE_STATUS.md`](./research/MODULE_STATUS.md); ADR-0005; B10 Validation+Proposal COMPLETE) |
| **Next Milestone** | Live collectors per OOS-RE-001; consumers B11+ |

### 6.11 MOD-KNOWLEDGE

| Field | Value |
|-------|-------|
| **Purpose** | Local-first knowledge SoR services, merge/score, memory, embedding jobs |
| **Responsibilities** | Knowledge apply; Duplicate/Conflict/Merge/Scoring/Approval/Memory skills; Embedding Agent job execution; Memory Agent |
| **Inputs** | Approved Knowledge; MemoryOps; Embedding profiles |
| **Outputs** | SoR versions; MemoryUpdate; EmbeddingJob |
| **Dependencies** | MOD-AGENT-SDK, MOD-TRUST, MOD-RUNTIME, MOD-CPAS |
| **Related Documents** | Knowledge / Memory / Embedding / Review contracts; artifacts `knowledge`, `memory-update`, `embedding-job` |
| **Related Specifications** | SPEC-ENGIN-002 |
| **Current Status** | `active_spec` (Module Complete — see [`knowledge/MODULE_STATUS.md`](./knowledge/MODULE_STATUS.md); ADR-0006) |
| **Next Milestone** | Embedding / memory enrichment via Spec; consumers B12/B14/B16 |

### 6.12 MOD-MARKDOWN

| Field | Value |
|-------|-------|
| **Purpose** | Produce review-ready Markdown knowledge bodies |
| **Responsibilities** | Markdown Agent + Markdown Builder / Citation Builder integration |
| **Inputs** | Approved Proposal + apply token |
| **Outputs** | Knowledge artifact |
| **Dependencies** | MOD-AGENT-SDK, MOD-CPAS |
| **Related Documents** | [`contracts/agents/markdown-agent.md`](./contracts/agents/markdown-agent.md), Skill Spec Markdown Builder / Citation Builder |
| **Related Specifications** | SPEC-ENGIN-003 |
| **Current Status** | `active_spec` (Module Complete — see [`markdown/MODULE_STATUS.md`](./markdown/MODULE_STATUS.md); ADR-0007) |
| **Next Milestone** | Maintenance; apply-token / template enrichment via Spec; consumers B14+ |

### 6.13 MOD-GRAPH

| Field | Value |
|-------|-------|
| **Purpose** | Maintain knowledge graph deltas from sealed Knowledge |
| **Responsibilities** | Knowledge Graph Agent; GraphUpdate propose/apply |
| **Inputs** | Sealed Knowledge |
| **Outputs** | GraphUpdate |
| **Dependencies** | MOD-AGENT-SDK, MOD-KNOWLEDGE (read), MOD-CPAS |
| **Related Documents** | [`contracts/agents/knowledge-graph-agent.md`](./contracts/agents/knowledge-graph-agent.md), [`artifacts/graph-update.md`](./artifacts/graph-update.md) |
| **Related Specifications** | SPEC-ENGIN-004 |
| **Current Status** | `active_spec` (Module Complete — see [`graph/MODULE_STATUS.md`](./graph/MODULE_STATUS.md); Architecture Review `no_arch_impact`) |
| **Next Milestone** | Durable graph DB / cloud embeddings (deferred); consumers B15+ |

### 6.14 MOD-ENG-AGENTS

| Field | Value |
|-------|-------|
| **Purpose** | Optional **Hosted Mode** hosting of Engineering Agent roles on Agent SDK (upgrade from Process Mode) |
| **Responsibilities** | Same five roles as `/engineering` §2a; produce review artifacts; never replace Founder business approval; never collapse into Founder |
| **Inputs** | Engineering work products (specs, PRs, checklists) |
| **Outputs** | Review artifacts (approve/reject) |
| **Dependencies** | **Hosted Mode only:** MOD-AGENT-SDK, MOD-ENGINEERING. **Process Mode:** none (lives under `/engineering` law; not this module) |
| **Related Documents** | [`engineering/README.md`](./engineering/README.md) §2a |
| **Related Specifications** | SPEC-ENGIN-005 |
| **Current Status** | Process Mode **active** via `/engineering`; Hosted Mode `not_started` |
| **Next Milestone** | Hosted contracts after B8 (B17); Process Mode used for all MVP approvals until then |

### 6.15 MOD-WEB-UI

| Field | Value |
|-------|-------|
| **Purpose** | Experience Plane: approvals UX, run status, knowledge browse |
| **Responsibilities** | Surface consent, Human Approval Gate, notifications; never silent SoR writes |
| **Inputs** | Runtime status APIs; pending HumanReviewDecision |
| **Outputs** | User decisions; display of sealed artifacts |
| **Dependencies** | MOD-RUNTIME, MOD-TRUST, MOD-KNOWLEDGE (read) |
| **Related Documents** | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) Experience Plane; Harness §9 |
| **Related Specifications** | SPEC-UI-001 |
| **Current Status** | `active_spec` (Module Complete — see [`web-ui/MODULE_STATUS.md`](./web-ui/MODULE_STATUS.md)) |
| **Next Milestone** | Knowledge browse / richer UX via new Spec; Personal Brain may consume |

### 6.16 MOD-PERSONAL-BRAIN

| Field | Value |
|-------|-------|
| **Purpose** | Product layer: Personal Second Brain — workspace, capture, personal knowledge flow, Ask My Brain |
| **Responsibilities** | User workspace ownership/boundary; text/URL capture; orchestrate Knowledge→Graph→Embedding for personal items; grounded personal retrieval |
| **Inputs** | Capture text/URL; Ask queries; Kernel tenancy + Trust identity |
| **Outputs** | Applied personal knowledge refs; retrieval answers with citations |
| **Dependencies** | MOD-KERNEL, MOD-TRUST, MOD-KNOWLEDGE, MOD-GRAPH (consume only); **MOD-EXECUTION-HOST** (request governed pipelines — requester only); may use research-engine helpers without rebuilding Research |
| **Related Documents** | [`docs/PRODUCT_VISION.md`](./docs/PRODUCT_VISION.md); [`personal-brain/`](./personal-brain/); ADR-0009; SPEC-PROD-004 |
| **Related Specifications** | SPEC-PRODUCT-MASTER, SPEC-PROD-004-HARNESS-BRIDGE (and archived PROD-001…003) |
| **Current Status** | `active_spec` (Module Complete — core+connections; UI removed; Bridge Spec approved; design sprint COMPLETE) |
| **Next Milestone** | `SPRINT-PB-BRIDGE-CODING-001` (**APPROVED** · `DL-PB-BRIDGE-CODING-001`) — implement Research Request → `ExecutionHost.createRun()` → Research Agent → ResearchReport; consume Host only; no shadow orchestration |

### 6.17 Supporting agent modules (catalogued under CPAS; implemented inside engines)

These are **not** separate top-level engines**; they are contract identities implemented by the engines above:

| Agent | Implementing module |
|-------|---------------------|
| Research, Source Validation | MOD-RESEARCH |
| Proposal, Knowledge Review, Learning, Notification | MOD-RESEARCH / MOD-KNOWLEDGE / MOD-RUNTIME (notification) as appropriate per contract |
| Markdown | MOD-MARKDOWN |
| Knowledge Graph | MOD-GRAPH |
| Embedding, Memory | MOD-KNOWLEDGE / MOD-GRAPH (embedding path) |
| Personal capture / Ask My Brain | MOD-PERSONAL-BRAIN (product orchestration; SoR remains MOD-KNOWLEDGE) |

---

## 7. Specification Registry

Priority: `P0` (blocking platform) · `P1` (canonical path) · `P2` (adjacent) · `P3` (later)

Status: `accepted` | `draft` | `planned`

Target Sprint: planning labels until real sprints exist — `S0-gov` (current), `S1-adr`, `S2-kernel`, `S3-runtime`, `S4-research`, `S5-approve`, `S6-knowledge`, `S7-ui`

| ID | Module | Title | Priority | Status | Dependencies | Target Sprint |
|----|--------|-------|----------|--------|--------------|---------------|
| SPEC-GOV-001 | MOD-CONSTITUTION | Engineering Constitution | P0 | accepted | — | S0-gov |
| SPEC-GOV-002 | MOD-DOCS | High-Level Architecture (planes) | P0 | accepted | SPEC-GOV-001 | S0-gov |
| SPEC-GOV-003 | MOD-DOCS | Product Vision | P0 | accepted | SPEC-GOV-001 | S0-gov |
| SPEC-GOV-004 | MOD-DOCS | Product Principles | P0 | accepted | SPEC-GOV-003 | S0-gov |
| SPEC-GOV-005 | MOD-DOCS | Roadmap | P0 | accepted | SPEC-GOV-002 | S0-gov |
| SPEC-GOV-006 | MOD-DOCS | ADR Process & Decision Log | P0 | accepted | SPEC-GOV-001 | S0-gov |
| SPEC-HAR-001 | MOD-HARNESS | Harness Specification | P0 | accepted | SPEC-GOV-001, SPEC-GOV-002 | S0-gov |
| SPEC-HAR-002 | MOD-HARNESS | Skill Specification | P0 | accepted | SPEC-HAR-001 | S0-gov |
| SPEC-PIP-001 | MOD-CPAS | Pipeline: Knowledge Ingestion | P0 | accepted | SPEC-HAR-001, SPEC-AGT-* | S0-gov |
| SPEC-AGT-000 | MOD-CPAS | Agent Contract Layer (Host-bound canonical model) | P0 | accepted | SPEC-HAR-001, SPEC-PIP-001, SPEC-EXECUTION-HOST-001, ADR-0010, ADR-0004 | SPRINT-AGT-000 |
| SPEC-AGT-001 | MOD-CPAS | Contract: Research Agent | P0 | accepted | SPEC-HAR-001, SPEC-SCH-001 | S0-gov |
| SPEC-AGT-002 | MOD-CPAS | Contract: Source Validation Agent | P0 | accepted | SPEC-AGT-001 | S0-gov |
| SPEC-AGT-003 | MOD-CPAS | Contract: Proposal Agent | P0 | accepted | SPEC-AGT-002 | S0-gov |
| SPEC-AGT-004 | MOD-CPAS | Contract: Knowledge Review Agent | P0 | accepted | SPEC-AGT-003 | S0-gov |
| SPEC-AGT-005 | MOD-CPAS | Contract: Markdown Agent | P0 | accepted | SPEC-AGT-004 | S0-gov |
| SPEC-AGT-006 | MOD-CPAS | Contract: Knowledge Graph Agent | P1 | accepted | SPEC-AGT-005 | S0-gov |
| SPEC-AGT-007 | MOD-CPAS | Contract: Embedding Agent | P1 | accepted | SPEC-AGT-005 | S0-gov |
| SPEC-AGT-008 | MOD-CPAS | Contract: Memory Agent | P1 | accepted | SPEC-AGT-005 | S0-gov |
| SPEC-AGT-009 | MOD-CPAS | Contract: Learning Agent | P2 | accepted | SPEC-AGT-003 | S0-gov |
| SPEC-AGT-010 | MOD-CPAS | Contract: Notification Agent | P1 | accepted | SPEC-HAR-001 | S0-gov |
| SPEC-ART-001…008 | MOD-CPAS | Artifact specs (8 types) | P0 | accepted | SPEC-HAR-001 | S0-gov |
| SPEC-SCH-001 | MOD-CPAS | Schema bundle (envelope + artifacts + agents) | P0 | accepted | SPEC-ART-* | S0-gov |
| SPEC-ENG-001…015 | MOD-ENGINEERING | Engineering process docs 01–15 + index | P0 | accepted | SPEC-GOV-001 | S0-gov |
| SPEC-DEV-ORCH-001 | MOD-ENGINEERING | Development Orchestrator Agent (Development Harness tooling at `tools/dev-orch/` — **not** a new Platform Module / no `MOD-DEV-ORCH`) | P1 | accepted | SPEC-ENG-001…015, START_DEVELOPMENT, DL-DEV-ORCH-001, DL-DEV-ORCH-002 | SPRINT-DEV-ORCH-001 (Phase 1 COMPLETE); **SPRINT-DEV-ORCH-002** (Phase 2 **COMPLETE** — exit PASS, 63 tests) |
| SPEC-ADR-PLANNED-001 | MOD-DOCS | ADR: Knowledge SoR boundary | P0 | planned | SPEC-GOV-002 | S1-adr |
| SPEC-ADR-PLANNED-002 | MOD-DOCS | ADR: Cloud AI Compute / egress | P0 | planned | SPEC-GOV-002 | S1-adr |
| SPEC-ADR-PLANNED-003 | MOD-DOCS | ADR: Runtime & schema validation stack | P0 | planned | SPEC-SCH-001 | S1-adr |
| SPEC-RT-001 | MOD-KERNEL | Kernel design & acceptance tests | P0 | draft | SPEC-GOV-002 | S2-kernel |
| SPEC-RT-002 | MOD-RUNTIME | Runtime / Harness enforcement | P0 | draft | SPEC-RT-001, SPEC-HAR-001 | S3-runtime |
| SPEC-RT-003 | MOD-AGENT-SDK | Agent SDK | P0 | planned | SPEC-RT-002, SPEC-AGT-001 | S3-runtime |
| SPEC-RT-004 | MOD-TRUST | Trust adapters | P0 | planned | SPEC-RT-001, SPEC-ADR-PLANNED-002 | S2-kernel |
| SPEC-ENGIN-001 | MOD-RESEARCH | Research Engine implementation spec | P1 | planned | SPEC-RT-003, SPEC-AGT-001/002 | S4-research |
| SPEC-ENGIN-002 | MOD-KNOWLEDGE | Knowledge Engine implementation spec | P1 | planned | SPEC-RT-003, SPEC-ADR-PLANNED-001 | S6-knowledge |
| SPEC-ENGIN-003 | MOD-MARKDOWN | Markdown Engine implementation spec | P1 | planned | SPEC-RT-003, SPEC-AGT-005 | S5-approve |
| SPEC-ENGIN-004 | MOD-GRAPH | Graph Engine implementation spec | P1 | planned | SPEC-ENGIN-002, SPEC-AGT-006 | S6-knowledge |
| SPEC-ENGIN-005 | MOD-ENG-AGENTS | Hosted Engineering Agents (optional) | P2 | planned | SPEC-RT-003 | B17 after S3 |
| SPEC-UI-001 | MOD-WEB-UI | Web UI / Experience MVP | P1 | planned | SPEC-RT-002, Human Approval path | S7-ui |
| SPEC-EXECUTION-HOST-001 | MOD-EXECUTION-HOST | Pipeline Execution Host | P0 | accepted | SPEC-RT-002, SPEC-RT-003, SPEC-HAR-001, SPEC-PIP-001, ADR-0010 | SPRINT-EXECUTION-HOST-001 |
| SPEC-PROD-001 | MOD-PERSONAL-BRAIN | Personal Second Brain MVP (archived product Spec) | P1 | accepted | SPEC-ENGIN-002, SPEC-ENGIN-004, ADR-0009 | S8-product |

Artifact specification IDs map 1:1 to files under [`artifacts/`](./artifacts/) (`research-report` … `memory-update`). Agent IDs map to [`contracts/agents/`](./contracts/agents/).

---

## 8. Engineering Traceability

Every product or platform **Feature** must leave a chain that a new engineer can follow without asking:

```
Pain / Feature intent
    → Specification          (engineering/01 + product links)
    → Architecture Review    (01 + ADR if required)
    → Backlog item           (engineering/02)  [id: BACKLOG-…]
    → Sprint commitment      (engineering/03)  [id: SPRINT-…]
    → Tasks                  (engineering/04)  [id: TASK-…]
    → Implementation         (engineering/05)  [branch feat/…]
    → Testing                (engineering/06)
    → Code Review            (engineering/08)
    → Regression → Merge     (engineering/09)
    → Release                (engineering/09)  [version tag]
    → Retrospective          (engineering/10)
```

### 8.1 Mandatory cross-links on the Backlog item

| Field | Points to |
|-------|-----------|
| Spec link | Spec record / RFC |
| SPEC-ID | Row in §7 when platform-scoped |
| Module | `MOD-*` from §6 |
| ADR | If Architecture Review = `adr_required` |
| DoR attestation | [`engineering/15_DEFINITION_OF_READY.md`](./engineering/15_DEFINITION_OF_READY.md) |
| DoD attestation on PR | [`engineering/14_DEFINITION_OF_DONE.md`](./engineering/14_DEFINITION_OF_DONE.md) |
| Contracts/schemas touched | Paths under `/contracts` `/schemas` |
| Pipeline stages touched | [`pipelines/knowledge-ingestion.md`](./pipelines/knowledge-ingestion.md) stages |
| Decision Log | `DL-…` in [`docs/adr/README.md`](./docs/adr/README.md) when material |

### 8.2 Traceability rule

If any link in the chain is missing for a change that reaches protected `main`, the change is **not Done** — regardless of demo success (`engineering/14`).

---

## 9. Future Expansion

### 9.1 Adding a Module

1. Confirm no duplicate in §6 (Constitution Art. VI).  
2. Propose: purpose, dependencies (acyclic), related docs/specs, status `planned`.  
3. File Decision Log entry; file ADR if planes/trust/harness topology change.  
4. **Update this file (§3, §4, §5, §6, §7) in the same change set** before any code directory is created.  
5. Add contracts/schemas/pipelines/artifacts only through their existing amendment processes.  
6. Implement only at the Build Order step that lists the module.

### 9.2 Adding a Specification

1. Assign next `SPEC-*` id in §7.  
2. Set Module, Priority, Dependencies, Target Sprint.  
3. Author the spec in the correct authoritative path (do not put law in this index).  
4. Link Backlog item ↔ SPEC-ID.

### 9.3 Adding an Agent

1. Add Agent Contract under `/contracts` + schema under `/schemas/agents`.  
2. Register SPEC-AGT-* here.  
3. Assign implementing engine module in §6.16.  
4. Wire into a pipeline stage via `/pipelines` amendment if it participates in production flow.  
5. Never run unbound agents (Constitution Art. II / XIII).

### 9.4 Explicit non-goals for expansion

- Do not create a second harness, second backlog, or second constitution.  
- Do not register vanity modules without a pain link ([`docs/PRODUCT_PRINCIPLES.md`](./docs/PRODUCT_PRINCIPLES.md)).  
- Do not place implementation specs that contradict Harness or Contracts — fix the index or amend law via proper process.

---

## 10. Quick Navigation (by job)

| I need to… | Go here |
|------------|---------|
| Know the law | [`CONSTITUTION.md`](./CONSTITUTION.md) |
| Understand planes | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| Run / design agent execution | [`harness/HARNESS_SPECIFICATION.md`](./harness/HARNESS_SPECIFICATION.md) |
| See allowed skills | [`harness/SKILL_SPECIFICATION.md`](./harness/SKILL_SPECIFICATION.md) |
| Bind an agent | [`contracts/`](./contracts/) |
| Follow knowledge pipeline | [`pipelines/knowledge-ingestion.md`](./pipelines/knowledge-ingestion.md) |
| Interpret an artifact | [`artifacts/`](./artifacts/) + [`schemas/`](./schemas/) |
| Ship a change | [`engineering/README.md`](./engineering/README.md) |
| Log a decision | [`docs/adr/README.md`](./docs/adr/README.md) |
| See build order / modules / **repository SSOT** | **This file** — SSOT §1–§9, then §§5–7 |
| Onboard to the repo | [`README.md`](./README.md) then **this file (SSOT first)** |

---

## 11. Amendment of This Index

1. PR updating `MASTER_ARCHITECTURE.md`  
2. Decision Log entry for material registry/build-order/**SSOT** changes  
3. ADR if dependency graph or layer meaning changes system topology  
4. Human approval (Chief Software Architect / Chief Repository Architect)  
5. Version bump (semver): MAJOR = layer/build-order/SSOT break; MINOR = new module/spec row or SSOT domain row; PATCH = clarification  

**End of Master Architecture v1.2.0**
