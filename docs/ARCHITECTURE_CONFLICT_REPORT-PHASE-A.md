# Architecture Conflict Report

**Mode:** Development Harness — Step 2 Architecture Verification  
**Authorization:** Founder APPROVED (mission start)  
**Date:** 2026-07-24  
**Trace:** `TRACE-PHASE-A-ARCH-VERIFY-001`  
**Verdict:** **CONFLICT — STOP**

**Rule applied:** Mission Step 2 — if any canonical document conflicts with the stated architecture diagram, **STOP**. Do not implement. Do not open Phase A Specification / Backlog / Sprint / Task Registry until Founder resolves conflicts.

---

## 1. Architecture under verification (mission Step 2)

```text
External World
        ↓
Research
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
        ↓
Products
```

---

## 2. Canonical sources loaded (Step 1)

| # | Document | Status used |
|---|----------|-------------|
| 1 | `CONSTITUTION.md` | Binding |
| 2 | `engineering/README.md` + stages 01–04 (Spec→Tasks) | Binding process |
| 3 | `harness/HARNESS_SPECIFICATION.md` §2.1a | Binding execution law |
| 4 | `harness/SKILL_SPECIFICATION.md` | Binding |
| 5 | `MASTER_ARCHITECTURE.md` | Architecture SSOT |
| 6 | `docs/ARCHITECTURE.md` | Planes |
| 7 | `specs/SPEC-EXECUTION-HOST-001.md` | accepted / Host MODULE COMPLETE |
| 8 | `docs/adr/0010-pipeline-execution-host.md` | Accepted |
| 9 | `docs/decision-log/DL-EXECUTION-HOST-001.md` | APPROVED |
| 10 | `personal-brain/specs/SPEC-PRODUCT-MASTER.md` | Product SSOT |
| 11 | `personal-brain/specs/SPEC-PROD-004-HARNESS-BRIDGE.md` | Bridge (draft on disk) |
| 12 | Module statuses: Host / Runtime / SDK / Personal Brain | MODULE COMPLETE (Host/Runtime/SDK); PB Bridge not implemented |
| 13 | `pipelines/knowledge-ingestion.md` | Canonical topology |
| 14 | `docs/ROADMAP.md` | Governance phases 0–5 only |

---

## 3. Conflict inventory

### CONFLICT-A — Execution stack order (CRITICAL)

| Mission diagram | Canonical (`HARNESS_SPECIFICATION.md` §2.1a; ADR-0010; MASTER) |
|-----------------|------------------------------------------------------------------|
| Research → Execution Host → Runtime → SDK → Agents | **Experience Product → Execution Host → Runtime → SDK → Agents** |

**Why conflict:** Research is a **pipeline stage / engine producer**, not a platform layer *above* Execution Host. Agents (including Research Agent) run **under** Host → Runtime → SDK.

**Doc quote (normative):** Harness §2.1a canonical control flow places Experience Product first; Host implements Pipeline Engine; Runtime = primitives; SDK = bind only.

---

### CONFLICT-B — Mixed product loop vs execution stack (CRITICAL)

| Mission diagram | Canonical |
|-----------------|-----------|
| Single vertical chain ending in Products | Docs maintain **two** diagrams that must not be merged |

1. **Execution stack (Harness §2.1a):** Product → Host → Runtime → SDK → Agents  
2. **Product meaning loop (`SPEC-PRODUCT-MASTER` §3):** External World → AI Understanding → Human Confirmation → Verified Personal Knowledge → Knowledge Graph → Decision Model (future)  
3. **Pipeline topology (`knowledge-ingestion`):** Research → Validation → Proposal → Human Review → Markdown → Graph → Embedding → Memory  

The mission diagram collapses (1)+(2)+(3) into one chain and places **Products at the bottom**. Canonical: Experience Products are **requesters at the top** of the execution stack (Art. XIII / ADR-0010).

---

### CONFLICT-C — Pipeline stages omitted / mis-ordered (MAJOR)

| Mission | Canonical `knowledge-ingestion` v2.0.0 |
|---------|----------------------------------------|
| Research → … → Agents → Human Approval → Knowledge → Graph | Research → **Validation** → **Proposal** → Human Review → **Markdown** → Graph → **Embedding** → **Memory** |

Missing mandatory stages: Validation, Proposal, Markdown, Embedding, Memory.  
“Knowledge” is produced after Human Approval via Markdown/Knowledge apply path — not as a free-floating layer between HA and Graph alone.

---

### CONFLICT-D — Decision Model as current platform stage (MAJOR)

| Mission | Canonical |
|---------|-----------|
| Decision Model as a required stage in the live stack | `SPEC-PRODUCT-MASTER`: Decision Model = **Future**; ADR-0010 / Host OOS; no Decision Agent in production contracts |

Phase A “using ONLY existing platform modules” **cannot** include Decision Model as an executable stage without inventing forbidden modules/contracts.

---

### CONFLICT-E — “Platform Roadmap Phase A” not in SoR (MAJOR)

| Mission | Canonical |
|---------|-----------|
| “Phase A of the DYOGAS Platform Roadmap” | `docs/ROADMAP.md` defines Phases **0–5** only. **No “Phase A”** document or section found. MASTER Build Order uses **B0–B18** (B18 Host DONE). |

Without a Founder-accepted definition of “Phase A” in an authoritative location, Spec authors would invent scope — forbidden under Development Harness (“Never use assumptions”).

---

### CONFLICT-F — External World as stack layer (MINOR / clarifying)

| Mission | Canonical |
|---------|-----------|
| External World as first platform layer | Product-loop **input concept** (SPEC-PRODUCT-MASTER); not in Harness §2.1a control flow |

Compatible as **product narrative**, incompatible as **execution-stack layer**.

---

## 4. What DOES align (non-conflicts)

| Claim | Status |
|-------|--------|
| Execution Host is first-class Pipeline Engine implementation | **ALIGNED** (ADR-0010, MODULE COMPLETE) |
| Runtime = primitives; SDK never orchestrates | **ALIGNED** |
| Human Approval mandatory before trusted SoR | **ALIGNED** (Constitution Art. III; Harness §9; Stage 4) |
| Knowledge then Graph on trusted path | **ALIGNED** (lineage; Host authorize + engines) |
| No new Platform Modules / no HA bypass / no topology rewrite for Phase A intent | **ALIGNED** with Constitution + ADR-0010 constraints |

---

## 5. Module readiness (context only — not Phase A authorization)

| Module | Status |
|--------|--------|
| Execution Host | MODULE COMPLETE |
| Runtime | MODULE COMPLETE |
| SDK | MODULE COMPLETE |
| Knowledge Engine | MODULE COMPLETE |
| Graph Engine | MODULE COMPLETE |
| Research Engine | MODULE COMPLETE (MVP runners still parallel — GAP-EH-003) |
| Personal Brain Bridge | Spec draft / implementation **not started** |
| Decision Model | **Future** — not a Phase A module |

---

## 6. STOP gate — blocked outputs

Per mission Step 2, the following are **NOT produced** until Founder resolves conflicts:

| # | Artifact | Status |
|---|----------|--------|
| 1 | Architecture Verification / Conflict Report | **THIS DOCUMENT** |
| 2 | Phase A Specification | **BLOCKED** |
| 3 | Architecture Review (Phase A) | **BLOCKED** |
| 4 | Backlog | **BLOCKED** |
| 5 | Sprint | **BLOCKED** |
| 6 | Task Registry | **BLOCKED** |

**No code. No sprint. No implementation.**

---

## 7. Resolution options for Founder (choose one; do not invent)

### Option R1 — Adopt dual-diagram canonical (recommended by existing docs)

Keep **two** normative diagrams:

**A. Execution stack**

```text
Experience Product (e.g. Personal Brain)
        ↓  createRun / resumeHuman
Execution Host
        ↓
Runtime
        ↓
SDK
        ↓
Agents
```

**B. Pipeline (External → Knowledge executable path)**

```text
ResearchBrief (from External / product intent)
        ↓
Research → Validation → Proposal → Human Review
        ↓
Markdown → Graph → Embedding → Memory
```

**C. Product meaning loop** (SPEC-PRODUCT-MASTER; Decision Model future)

```text
External World → AI Understanding → Human Confirmation
→ Verified Knowledge → Graph → Decision Model (future)
```

Define **Phase A** explicitly as: first complete **Host-driven `knowledge-ingestion` run** to Knowledge (+ Graph) using existing modules only — **excluding** Decision Model and new platform modules.

### Option R2 — Amend Constitution / Harness / MASTER / Product Master

If Founder insists the single mission diagram is law, require **ADR + Constitution/Harness/MASTER/SPEC-PRODUCT-MASTER amendments** before any Phase A Spec. That is a material topology/narrative change — not Process Mode assumption.

### Option R3 — Author “Platform Roadmap Phase A” SoR

Add an authoritative Phase A definition (e.g. under `docs/ROADMAP.md` or MASTER) that maps to Option R1 or R2, then re-run Step 2.

---

## 8. Repository alignment verdict

| Question | Answer |
|----------|--------|
| Does current platform architecture match the mission Step 2 diagram? | **NO** |
| May Phase A Spec / Sprint proceed? | **NO — STOP** |
| Immediate next action | Founder selects **R1 / R2 / R3** (or hybrid) in writing |

---

**End of Architecture Conflict Report**
