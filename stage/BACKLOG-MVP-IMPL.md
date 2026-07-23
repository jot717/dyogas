# Backlog — PERSONAL-BRAIN MVP IMPLEMENTATION

**Backlog ID:** BACKLOG-PB-MVP-001  
**Module:** MOD-PERSONAL-BRAIN  
**Parent Spec (core):** SPEC-PROD-001  
**Enrichment Spec (to author in sprint):** SPEC-PROD-002  
**Gap source:** [`GAP_ANALYSIS.md`](./GAP_ANALYSIS.md)  
**DoR rule:** Pain clear · Spec link · AC testable · No Kernel/Runtime edits · No new `MOD-*`

---

## Epic map

| Epic | Theme | Priority |
|------|--------|----------|
| EPIC-PB-P | Persistence Layer | P0 |
| EPIC-PB-I | Real Input Layer | P1 |
| EPIC-PB-A | AI Processing + Approval | P0 |
| EPIC-PB-U | Product UI | P0 |
| EPIC-PB-D | Deployment readiness | P1 |
| EPIC-PB-G | Governance (Spec/ADR) | P0 |

---

## Backlog items

### Governance

| ID | Title | Epic | AC (summary) | Depends |
|----|-------|------|--------------|---------|
| BACKLOG-PB-100 | Author SPEC-PROD-002 enrichment (persistence, pipeline, UI, deploy) | EPIC-PB-G | Spec accepted; Arch Review recorded; Founder APPROVE if required | GAP |
| BACKLOG-PB-101 | Update MODULE_STATUS + Decision Log pointer for MVP Implementation sprint | EPIC-PB-G | Status reflects sprint; DL entry on accept | BACKLOG-PB-100 |

### Persistence (EPIC-PB-P)

| ID | Title | Epic | AC (summary) | Depends |
|----|-------|------|--------------|---------|
| BACKLOG-PB-110 | File-backed workspace + owner registry | EPIC-PB-P | Create/load workspace survives restart; tenancy+owner enforced | BACKLOG-PB-100 |
| BACKLOG-PB-111 | Persist knowledge artifacts + personal index | EPIC-PB-P | After capture+approve, restart reloads items; Ask still works | BACKLOG-PB-110 |
| BACKLOG-PB-112 | Persist pending capture queue | EPIC-PB-P | Pending drafts survive restart | BACKLOG-PB-110 |

### Input (EPIC-PB-I)

| ID | Title | Epic | AC (summary) | Depends |
|----|-------|------|--------------|---------|
| BACKLOG-PB-120 | Document capture abstraction (`kind: document`) | EPIC-PB-I | Accept text/markdown document payload + filename/mime metadata; no cloud OCR | BACKLOG-PB-100 |
| BACKLOG-PB-121 | Harden text + URL capture validation | EPIC-PB-I | Empty/invalid inputs fail closed; URL remains no-live-fetch by default | — |

### AI pipeline + approval (EPIC-PB-A)

| ID | Title | Epic | AC (summary) | Depends |
|----|-------|------|--------------|---------|
| BACKLOG-PB-130 | Local extraction step | EPIC-PB-A | Produces structured extract (title candidates, key sentences, source fields) | BACKLOG-PB-120 |
| BACKLOG-PB-131 | Local extractive summarization | EPIC-PB-A | Summary string without cloud LLM | BACKLOG-PB-130 |
| BACKLOG-PB-132 | Pending → Approve/Reject → Knowledge create | EPIC-PB-A | Reject does not SoR-write; Approve uses Knowledge Engine only | BACKLOG-PB-111, BACKLOG-PB-131 |
| BACKLOG-PB-133 | Post-approve Graph + Embedding + index update | EPIC-PB-A | Same path as core; persisted | BACKLOG-PB-132 |

### Product UI (EPIC-PB-U)

| ID | Title | Epic | AC (summary) | Depends |
|----|-------|------|--------------|---------|
| BACKLOG-PB-140 | Local login / session (demo identity → tenancy) | EPIC-PB-U | Login required for mutating routes | BACKLOG-PB-110 |
| BACKLOG-PB-141 | Brain dashboard | EPIC-PB-U | Shows counts + recent + pending | BACKLOG-PB-140 |
| BACKLOG-PB-142 | Capture screen (text / URL / document) | EPIC-PB-U | Submits to pipeline pending queue | BACKLOG-PB-132, BACKLOG-PB-140 |
| BACKLOG-PB-143 | Knowledge view (list + detail) | EPIC-PB-U | Reads persisted artifacts | BACKLOG-PB-111, BACKLOG-PB-140 |
| BACKLOG-PB-144 | Ask My Brain UI | EPIC-PB-U | Query → cited answer | BACKLOG-PB-111, BACKLOG-PB-140 |
| BACKLOG-PB-145 | Approval UI for pending captures | EPIC-PB-U | Approve/Reject from dashboard or dedicated view | BACKLOG-PB-132, BACKLOG-PB-140 |

### Deployment (EPIC-PB-D)

| ID | Title | Epic | AC (summary) | Depends |
|----|-------|------|--------------|---------|
| BACKLOG-PB-150 | HTTP product server entrypoint + `/health` | EPIC-PB-D | `npm start` serves UI + API | BACKLOG-PB-140 |
| BACKLOG-PB-151 | Data dir config + DEPLOY.md runbook | EPIC-PB-D | Documented env vars; local run steps | BACKLOG-PB-150 |
| BACKLOG-PB-152 | Regression tests for persistence + pipeline + HTTP smoke | EPIC-PB-D | Automated suite green | BACKLOG-PB-111…145 |

---

## Explicitly deferred (not in this backlog)

| ID | Item | Why |
|----|------|-----|
| DEFER-PB-01 | Live URL network fetch | Trust allow-egress Founder/ADR |
| DEFER-PB-02 | Cloud LLM summarization | Trust / OOS-T-002 |
| DEFER-PB-03 | Enterprise IAM / OIDC | OOS-T-004 |
| DEFER-PB-04 | Modify MOD-WEB-UI or new UI module | Extend Personal Brain only |
| DEFER-PB-05 | Kernel / Runtime changes | Hard rule |

---

## Ordering (dependency-respecting)

```text
PB-100 → PB-101
PB-100 → PB-110 → PB-111 / PB-112
PB-100 → PB-120 → PB-130 → PB-131 → PB-132 → PB-133
PB-121 (parallel early)
PB-110 → PB-140 → PB-141…145
PB-132 + PB-140 → PB-142 / PB-145
PB-140…145 → PB-150 → PB-151 → PB-152
```

**End of BACKLOG-PB-MVP-001**
