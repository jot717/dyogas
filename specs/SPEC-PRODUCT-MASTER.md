# DYOGAS Personal Brain Product Master

**Spec ID:** SPEC-PRODUCT-MASTER  
**Module:** MOD-PERSONAL-BRAIN  
**Package:** `@dyogas/personal-brain`  
**Status:** Canonical — Product Single Source of Truth (SSOT)  
**Effective:** 2026-07-23  
**Supersedes:** SPEC-PROD-001, SPEC-PROD-002, SPEC-PROD-003 (archived)  
**Related:** ADR-0009 · Constitution · Execution Harness · Engineering Process (Development Harness)

---

## 1. Product Mission

DYOGAS Personal Brain is a **personal second brain product layer** on the DYOGAS platform.

Its purpose is to help a person turn the external world into **owned, verified personal knowledge**, then connect that knowledge so it can support **future decisions** — without surrendering judgment to automation.

Personal Brain is **not** a note-taking app, a chatbot wrapper, a UI-first product, or a dumb storage bucket. It is the product surface where DYOGAS’s governed AI platform becomes a **trusted personal knowledge and decision foundation**.

---

## 2. Product Philosophy

**AI assists understanding. Human creates ownership and trust.**

- AI may discover, extract, summarize, propose, retrieve, and organize.
- Only an attributable **human confirmation** promotes a candidate into **personal verified knowledge**.
- Trust is visible: provenance, evidence, and approval are part of the product meaning — not optional metadata.
- The human remains the authority over what becomes “mine” and what may later inform decisions.

---

## 3. Core Product Loop

```text
External World
        ↓
AI Understanding
        ↓
Human Confirmation
        ↓
Verified Personal Knowledge
        ↓
Knowledge Graph
        ↓
Decision Model
```

| Stage | Meaning |
|-------|---------|
| External World | Sources, URLs, documents, research briefs, lived context |
| AI Understanding | Agents/skills interpret and propose structured candidates |
| Human Confirmation | Owner approve / edit / reject — non-delegable for trusted knowledge |
| Verified Personal Knowledge | Owner-owned SoR knowledge with provenance |
| Knowledge Graph | Connections among verified personal knowledge |
| Decision Model | Future: durable support for personal decisions (not automatic judgment) |

---

## 4. Core User Capabilities

### A. Capture Knowledge

Bring personal material into the product (text, URL/content intake, documents as capability matures) as **candidates**, not instant trusted knowledge.

### B. Research Knowledge

Request professional or thematic exploration (e.g. “I want to understand the AI Agent market”). DYOGAS agents research and collect under platform governance; outputs remain proposals until confirmed.

### C. Verify Knowledge

Human review of AI-produced candidates: approve, edit-then-approve, or reject. No silent acceptance into personal trusted knowledge.

### D. Store Personal Knowledge

Persist verified knowledge in the personal knowledge boundary (workspace / tenancy), with source and approval provenance.

### E. Retrieve and Connect Knowledge

Ask over *personal* verified knowledge with citations/evidence; connect items through the knowledge graph for later retrieval and reasoning.

### F. Future Decision Intelligence

Use verified personal knowledge and graph structure to support decisions. Decision intelligence **assists**; it does not replace human judgment and is not automatic knowledge acceptance.

---

## 5. Agent Relationship

Future product relationship to platform agents (roles, not implementation):

```text
Research Agent
        ↓
Knowledge Agent
        ↓
Graph Agent
        ↓
Decision Agent (future)
```

- **Research Agent** — discover and collect candidate evidence for a brief.  
- **Knowledge Agent** — shape proposals toward durable personal knowledge (platform may split Review/Markdown/apply roles).  
- **Graph Agent** — connect verified knowledge in the graph.  
- **Decision Agent (future)** — propose decision support from verified knowledge; never auto-apply judgment as truth.

Multi-agent research → knowledge work is expected to run under the **Execution Harness** (Runtime + contracts + gates). This document does not specify code, APIs, or UI.

---

## 6. Human Approval Principle

**Human approval is required before knowledge becomes personal trusted knowledge.**

- AI outputs are **proposals** until the owner confirms.
- Rejection discards or leaves candidates unverified — it does not write trusted SoR under the owner’s name.
- Ask / answer flows that could become lasting personal knowledge follow the same principle (propose → evidence → human decision → optional learn).
- Agent identities must not substitute for human approval on personal trusted knowledge.

---

## 7. Product Boundaries

Personal Brain is **not**:

| Boundary | Statement |
|----------|-----------|
| Chatbot | Not a free-form chat product whose replies become truth by fluency |
| Search engine | Not generic web search as the product; retrieval is over **personal verified knowledge** (plus governed research into candidates) |
| Automatic knowledge acceptance | AI never silently seals personal trusted knowledge |
| Replacement of human judgment | Decision support never overrides owner authority |

Also not: UI-first delivery, note-app feature parity, or a Harness/Runtime/SDK rewrite.

---

## 8. Relationship With DYOGAS Platform

Personal Brain is a **product layer**. It does not redefine platform law.

It **consumes**:

| Platform capability | Role for Personal Brain |
|---------------------|-------------------------|
| **Execution Harness** | How agents run: pipelines, state, artifacts, handoffs, review gates, human approval, audit |
| **Runtime** | Admits and enforces Execution Harness semantics |
| **SDK** | Contract bind, skill allowlists, candidate emission |
| **Agents** | Research → knowledge shaping → graph (Decision Agent future) |
| **Knowledge infrastructure** | Knowledge Engine, Graph Engine, embeddings/retrieval building blocks |
| **Kernel / Trust** | Tenancy, identity, audit sinks, egress policy |

**Development Harness** (= Engineering Process under `/engineering`) governs how Personal Brain itself is specified, built, and accepted — distinct from Execution Harness.

Personal Brain must not bypass Execution Harness for multi-agent production knowledge mutation.

---

## 9. Future Evolution

| Horizon | Intent |
|---------|--------|
| **Knowledge Intelligence** | Stronger capture/research → verify → store loops; richer provenance; personal SoR quality |
| **Graph Intelligence** | Deeper personal graph connectivity for retrieval and explanation |
| **Decision Intelligence** | Decision Model + Decision Artifact + Decision Agent (future) for support — never automatic replacement of judgment |

Evolution updates **this file first**. Implementation SPECs, MODULE_STATUS, and ADRs must trace to SPEC-PRODUCT-MASTER.

---

## Amendment Rules

1. Product direction changes edit **this file** in the same change set as related ADRs/Decision Log entries when material.  
2. Archived SPEC-PROD-001..003 are historical only — not competing SSOTs.  
3. UI, HTTP demos, and temporary engineering SPECs must not reintroduce a second product truth.

**End of SPEC-PRODUCT-MASTER**
