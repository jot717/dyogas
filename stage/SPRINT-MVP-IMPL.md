# Sprint Plan — PERSONAL-BRAIN MVP IMPLEMENTATION

**Sprint ID:** SPRINT-PB-MVP-001  
**Module:** MOD-PERSONAL-BRAIN  
**Goal:** Ship a **runnable Personal Second Brain product** (persist + capture pipeline with approval + UI + deploy entrypoint) as `@dyogas/personal-brain@0.2.0` without new modules and without Kernel/Runtime edits.  
**Capacity posture:** Single Founder / Harness Execution Engine continuous delivery  
**Enrichment Spec:** SPEC-PROD-002 (author at sprint start)  
**Backlog SoR:** [`BACKLOG-MVP-IMPL.md`](./BACKLOG-MVP-IMPL.md)  
**Gap SoR:** [`GAP_ANALYSIS.md`](./GAP_ANALYSIS.md)

---

## 1. Sprint goal (one sentence)

A user can **log in locally**, **capture** text/URL/document, **review/approve** processed drafts, see knowledge **persist across restart**, **Ask My Brain** in the UI, and run the app via **`npm start`**.

---

## 2. Committed scope (DoR-ready)

| Priority | Backlog IDs | Outcome |
|----------|-------------|---------|
| Must | PB-100, PB-101 | SPEC-PROD-002 + status/DL |
| Must | PB-110, PB-111, PB-112 | Persistence |
| Must | PB-120, PB-121 | Document + hardened inputs |
| Must | PB-130, PB-131, PB-132, PB-133 | Local AI pipeline + approval → Knowledge/Graph |
| Must | PB-140–PB-145 | Product UI surfaces |
| Must | PB-150, PB-151, PB-152 | Deploy readiness + tests |
| Stretch | — | Docker Compose one-liner (optional if time) |
| Out | DEFER-PB-01…05 | Live fetch, cloud LLM, IAM, Kernel/Runtime, new MOD-* |

---

## 3. Task breakdown (implementation waves)

### Wave 0 — Governance
| Task | Backlog | DoD |
|------|---------|-----|
| TASK-PB-200 | Write SPEC-PROD-002 + Arch Review artifact | Spec accepted; verdict recorded |
| TASK-PB-201 | Decision Log + MODULE_STATUS → Implementation sprint | Docs updated |

### Wave 1 — Persistence
| Task | Backlog | DoD |
|------|---------|-----|
| TASK-PB-210 | `src/persist/` workspace + user store | Round-trip test |
| TASK-PB-211 | Knowledge + index snapshot/restore | Restart test |
| TASK-PB-212 | Pending queue snapshot/restore | Restart test |

### Wave 2 — Input + pipeline
| Task | Backlog | DoD |
|------|---------|-----|
| TASK-PB-220 | Document capture kind | Unit tests |
| TASK-PB-221 | `src/pipeline/` extract + summarize | Unit tests |
| TASK-PB-222 | Pending capture API + approve/reject → apply | Integration tests |

### Wave 3 — Product UI + server
| Task | Backlog | DoD |
|------|---------|-----|
| TASK-PB-230 | Session/login HTTP | Smoke test |
| TASK-PB-231 | Dashboard / Capture / Knowledge / Ask / Approve pages | Manual AC + HTTP tests |
| TASK-PB-232 | Wire UI to persistence + pipeline | E2E-ish test |

### Wave 4 — Release
| Task | Backlog | DoD |
|------|---------|-----|
| TASK-PB-240 | `npm start`, `/health`, env config | Runbook verified |
| TASK-PB-241 | Version bump 0.2.0, CI job update if needed | CI green |
| TASK-PB-242 | Retro note + Module status “Product MVP sprint complete” | Docs |

---

## 4. Definition of Done (sprint)

- [ ] SPEC-PROD-002 accepted; Arch Review not `rejected`
- [ ] No files changed under `kernel/`, `runtime/`, `trust/` (consume only), `research/` source
- [ ] No new `MOD-*` registered
- [ ] Persistence survives process restart (automated test)
- [ ] Pending → approve creates Knowledge via engine; reject does not
- [ ] UI covers login, dashboard, capture, knowledge, ask, approve
- [ ] `npm test` green; `npm start` + `/health` documented
- [ ] Package `@dyogas/personal-brain@0.2.0` released in-repo

---

## 5. Risks & stop conditions

| Risk | Mitigation |
|------|------------|
| Founder demands live URL/LLM mid-sprint | Hard stop; open Trust ADR; keep local pipeline green |
| Persistence tempts second SoR | Only serialize/rehydrate through Knowledge Engine APIs |
| UI scope creep | Stick to five screens + approve; no org admin |
| Conflict with MOD-WEB-UI | Personal Brain ships own `ui/`; do not edit `web-ui/` |

**Hard stops:** Founder APPROVE on Spec/ADR if Arch says `adr_required`; Architecture conflict; tests red that cannot be auto-fixed.

---

## 6. Next action after this plan

On Founder / Harness continue command: execute Wave 0 → Wave 4 until Sprint DoD PASS (Implementation → Testing → Release).

---

**Sprint status:** **PLANNED** — awaiting execution continue  

**End of SPRINT-PB-MVP-001**
