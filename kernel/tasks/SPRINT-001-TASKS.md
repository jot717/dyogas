# Sprint-001 — Complete Task Breakdown

**Module:** MOD-KERNEL  
**Sprint:** Sprint-001  
**Stage:** Task Breakdown  
**Trace:** MASTER_ARCHITECTURE → MOD-KERNEL (B5) → SPEC-RT-001 → BACKLOG → Sprint-001  
**Parents:** BL-K-001, BL-K-002 only  
**Constraint (this stage):** ADR-0001 file was not modified during Task Breakdown. Implementation tasks below are authorized to edit it when this stage PASSes.

---

## TASK-K-S001-01

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-01 |
| **Parent Backlog Item** | BL-K-001 |
| **Task Name** | ADR-0001 acceptance gap inventory |
| **Purpose** | Make every missing Accept field explicit before drafting content. |
| **Estimate** | XS |
| **Owner** | Process Mode — Tech Lead Agent |
| **Dependencies** | None (first task) |
| **Files / Components Affected** | Read-only: `docs/adr/0001-platform-stack-and-schema-validation.md`; write: `kernel/stage/adr-0001-gap-checklist.md` (checklist only, not governance law) |

**Technical Description**  
Compare ADR-0001 body to BL-K-001 Acceptance Criteria. List blanks: primary language (+ version band), `kernel/` package layout, test runner, schema-validation CI approach, Kernel no-import boundary restatement. Record Founder prior REJECT of incomplete Accept as a process constraint.

**Implementation Steps**  
1. Open ADR-0001 (read-only for this task’s verification of gaps).  
2. Create gap checklist with one row per required Accept field.  
3. Mark each field Present / Missing.  
4. Attach checklist path to TASK_REGISTRY note.

**Acceptance Criteria**  
- Checklist exists under `kernel/stage/`.  
- Every BL-K-001 required field appears as a row.  
- All currently Missing fields are listed (expect Decision concretes Missing).

**Test Requirements**  
Manual: second reader confirms no required AC field omitted from checklist.

**Definition of Done**  
Gap checklist merged/recorded; TASK_REGISTRY marks this task DONE; no ADR content changed yet.

---

## TASK-K-S001-02

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-02 |
| **Parent Backlog Item** | BL-K-001 |
| **Task Name** | Fill ADR-0001 concrete Decision fields |
| **Purpose** | Complete the Proposed ADR so it can lawfully be Accepted. |
| **Estimate** | S |
| **Owner** | Process Mode — Tech Lead Agent |
| **Dependencies** | TASK-K-S001-01 |
| **Files / Components Affected** | `docs/adr/0001-platform-stack-and-schema-validation.md` (Decision / Consequences only as needed); must NOT expand Non-Goals into Cloud AI or Knowledge SoR |

**Technical Description**  
Edit ADR-0001 to record **one** primary implementation language (with version band), module layout for `kernel/` (and inheritance note for `runtime/` / platform packages), test runner name, and how `/schemas` JSON Schema validation runs in CI. Restate Kernel SHALL NOT import harness/pipelines/contracts agent-runtime packages. Do **not** invent new architecture beyond Build Order B4/B5 and Architecture Review `adr_required` scope. Do **not** implement Kernel code in this task.

**Implementation Steps**  
1. Using gap checklist, draft Decision bullets with concrete names.  
2. Update ADR Decision section; keep Options Considered history intact.  
3. Leave Status=`Proposed` until TASK-K-S001-05.  
4. Confirm Non-Goals unchanged (no Cloud AI vendor, no SoR engine, no Kernel code in ADR).

**Acceptance Criteria**  
- Language, layout, test runner, schema-CI approach are named (not “TBD”).  
- Kernel boundary clause present.  
- Status still `Proposed`.  
- No Kernel source files created.

**Test Requirements**  
Checklist re-run: all TASK-K-S001-01 rows = Present. Diff review: no Non-Goal scope creep.

**Definition of Done**  
ADR body complete for Accept review; gap checklist all Present; no Status flip yet.

---

## TASK-K-S001-03

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-03 |
| **Parent Backlog Item** | BL-K-001 |
| **Task Name** | Engineering Agent + Founder acceptance chain |
| **Purpose** | Obtain lawful approvals for ADR-0001 Accept. |
| **Estimate** | S |
| **Owner** | Process Mode — Engineering Manager Agent (facilitator) |
| **Dependencies** | TASK-K-S001-02 |
| **Files / Components Affected** | `kernel/stage/reviews/adr-0001-accept-*.md` (five agent artifacts) |

**Technical Description**  
Run Process Mode chain: Product Owner → Chief Architect → Tech Lead → Engineering Manager → Architecture Reviewer. Each emits approve/reject artifact on the **filled** ADR. After all Engineering Agents approve, request Founder business Approval. Any reject returns to TASK-K-S001-02 (no Status flip).

**Implementation Steps**  
1. Circulate filled ADR-0001.  
2. Collect five agent review files.  
3. If any reject, stop and reopen TASK-K-S001-02.  
4. Record Founder business Approve or Reject on acceptance package.

**Acceptance Criteria**  
- Five `approve` artifacts exist for acceptance revision.  
- Founder business Approval GRANTED recorded (date + pointer).  
- No Approves dated against pre-fill incomplete ADR.

**Test Requirements**  
EM verifies artifact set complete; no silent Approves.

**Definition of Done**  
Full approval chain green; ready for Decision Log + Status flip.

---

## TASK-K-S001-04

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-04 |
| **Parent Backlog Item** | BL-K-001 |
| **Task Name** | Decision Log entry for ADR-0001 Accepted |
| **Purpose** | Satisfy Constitution Art. VII / ADR process logging. |
| **Estimate** | XS |
| **Owner** | Process Mode — Chief Architect Agent |
| **Dependencies** | TASK-K-S001-03 |
| **Files / Components Affected** | `docs/adr/README.md` Decision Log section (entry only) |

**Technical Description**  
Add Decision Log row citing ADR-0001 acceptance: date, summary (stack + schema CI + Kernel boundary), link to ADR file, Founder business approval reference. Do not rewrite ADR history.

**Implementation Steps**  
1. Locate Decision Log in `docs/adr/README.md`.  
2. Append entry for ADR-0001 Accepted (or “acceptance pending Status flip” coordinated with TASK-K-S001-05 in same Implementation window).  
3. Ensure entry does not claim Kernel code shipped.

**Acceptance Criteria**  
- Log entry exists and cites ADR-0001.  
- Entry matches accepted Decision content.

**Test Requirements**  
Link resolves; entry readable standalone.

**Definition of Done**  
Decision Log updated; linked from Sprint board note.

---

## TASK-K-S001-05

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-05 |
| **Parent Backlog Item** | BL-K-001 |
| **Task Name** | Set ADR Status=Accepted + AC verification |
| **Purpose** | Close BL-K-001 Acceptance Criteria. |
| **Estimate** | XS |
| **Owner** | Process Mode — Tech Lead Agent |
| **Dependencies** | TASK-K-S001-03, TASK-K-S001-04 |
| **Files / Components Affected** | `docs/adr/0001-platform-stack-and-schema-validation.md` (Status + Deciders lines) |

**Technical Description**  
Set ADR **Status** to `Accepted`. Record Deciders (Engineering Agents + Founder business). Re-verify BL-K-001 AC checklist end-to-end. Do not start Kernel code.

**Implementation Steps**  
1. Confirm TASK-K-S001-03 and -04 complete.  
2. Flip Status Proposed → Accepted.  
3. Fill Deciders line.  
4. Run AC verification checklist; attach result under `kernel/stage/`.

**Acceptance Criteria**  
- ADR Status=`Accepted`.  
- All BL-K-001 ACs true.  
- No `kernel/` implementation package created in this task.

**Test Requirements**  
AC verification checklist 100% checked; Architecture Reviewer spot-check.

**Definition of Done**  
ADR Accepted; BL-K-001 ready for review prep; BLK-S001-01…03 cleared.

---

## TASK-K-S001-06

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-06 |
| **Parent Backlog Item** | BL-K-001 |
| **Task Name** | BL-K-001 review prep |
| **Purpose** | Package evidence for Code Review / stage closeout of docs item. |
| **Estimate** | XS |
| **Owner** | Process Mode — Tech Lead Agent |
| **Dependencies** | TASK-K-S001-05 |
| **Files / Components Affected** | `kernel/stage/bl-k-001-review-notes.md` |

**Technical Description**  
Write short review notes: what changed in ADR, approvals, Decision Log pointer, explicit non-delivery of Kernel code.

**Implementation Steps**  
1. Summarize diff scope.  
2. Link all approval artifacts.  
3. State residual risks (stack change cost post-code).

**Acceptance Criteria**  
- Review notes file exists with links to ADR, reviews, Decision Log.

**Test Requirements**  
Links resolve.

**Definition of Done**  
BL-K-001 task graph complete pending item-level DoD at Implementation close.

---

## TASK-K-S001-07

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-07 |
| **Parent Backlog Item** | BL-K-002 |
| **Task Name** | MODULE_STATUS ADR gate unlock |
| **Purpose** | Reflect Implementation unblocked for ADR gate (not for skipping stages). |
| **Estimate** | XS |
| **Owner** | Process Mode — Engineering Manager Agent |
| **Dependencies** | TASK-K-S001-05 |
| **Files / Components Affected** | `kernel/MODULE_STATUS.md` |

**Technical Description**  
Update MODULE_STATUS so ADR gate shows Accepted; clarify Kernel **code** Implementation may proceed only after future Sprint commit of BL-K-003+ and normal stages — not automatically started by this chore.

**Implementation Steps**  
1. Set Architecture/ADR line to Accepted.  
2. Adjust Implementation row: ADR gate cleared; next code work still requires Sprint/Task process.  
3. Link ADR-0001.

**Acceptance Criteria**  
- MODULE_STATUS no longer lists ADR-0001 as Proposed blocker.  
- Does not mark Module Complete or skip Task Breakdown for future sprints.

**Test Requirements**  
Read-back against BL-K-002 AC.

**Definition of Done**  
MODULE_STATUS matches Accepted ADR reality.

---

## TASK-K-S001-08

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-08 |
| **Parent Backlog Item** | BL-K-002 |
| **Task Name** | BACKLOG DoR flip for ADR-gated items |
| **Purpose** | Allow code items to become Sprint-eligible when other deps met. |
| **Estimate** | XS |
| **Owner** | Process Mode — Product Owner Agent |
| **Dependencies** | TASK-K-S001-05 |
| **Files / Components Affected** | `kernel/backlog/BACKLOG.md` (DoR / Blocked columns only) |

**Technical Description**  
For items whose only ADR blocker was ADR-0001, set DoR from `blocked_adr` toward `ready` **only when** remaining Dependencies are satisfied. Items still depending on BL-K-003 etc. stay blocked on those deps. Do not add/remove backlog items.

**Implementation Steps**  
1. Scan all BL-K-* DoR/Blocked columns.  
2. Clear ADR-0001 from Blocked where Accepted.  
3. Set DoR=`ready` only if no remaining blockers; else keep blocked on listed deps.  
4. Note Global Implementation Gate text updated.

**Acceptance Criteria**  
- No item falsely marked ready while deps remain.  
- ADR-0001 no longer listed as open blocker.

**Test Requirements**  
Spot-check BL-K-003 (ready only if BL-K-001 done — yes after this sprint) and BL-K-011 (still needs BL-K-010).

**Definition of Done**  
BACKLOG DoR columns consistent with Accepted ADR + dependency DAG.

---

## TASK-K-S001-09

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-09 |
| **Parent Backlog Item** | BL-K-002 |
| **Task Name** | Gate verification (no premature Kernel code) |
| **Purpose** | Prove Sprint-001 did not smuggle Kernel Implementation. |
| **Estimate** | XS |
| **Owner** | Process Mode — Architecture Reviewer Agent |
| **Dependencies** | TASK-K-S001-07, TASK-K-S001-08 |
| **Files / Components Affected** | `kernel/stage/bl-k-002-gate-verify.md` |

**Technical Description**  
Verify: no new Kernel language package/src tree beyond docs/stage/backlog/tasks; ADR Accepted; MODULE_STATUS and BACKLOG updated; Sprint goal metrics 1–3 true.

**Implementation Steps**  
1. Tree check under `kernel/` for unexpected code packages.  
2. Confirm ADR Status Accepted.  
3. Confirm MODULE_STATUS + BACKLOG updates.  
4. Write verification record.

**Acceptance Criteria**  
- Verification record PASS.  
- Sprint success metrics 1–3 evidenced.

**Test Requirements**  
Explicit PASS/FAIL with paths checked.

**Definition of Done**  
Gate verify PASS recorded.

---

## TASK-K-S001-10

| Field | Value |
|-------|-------|
| **Task ID** | TASK-K-S001-10 |
| **Parent Backlog Item** | BL-K-002 |
| **Task Name** | BL-K-002 review prep |
| **Purpose** | Close chore item packaging. |
| **Estimate** | XS |
| **Owner** | Process Mode — Engineering Manager Agent |
| **Dependencies** | TASK-K-S001-09 |
| **Files / Components Affected** | `kernel/stage/bl-k-002-review-notes.md` |

**Technical Description**  
Short notes linking MODULE_STATUS, BACKLOG DoR flip, gate verify PASS.

**Implementation Steps**  
1. Write notes with links.  
2. Mark Sprint-001 board ready for item DoD at Implementation end.

**Acceptance Criteria**  
- Notes file exists with three links (MODULE_STATUS, BACKLOG, gate verify).

**Test Requirements**  
Links resolve.

**Definition of Done**  
BL-K-002 task graph complete pending Implementation execution + item DoD.

---

## Dependency DAG (no cycles)

```
01 → 02 → 03 → 04 ─┐
              └────→ 05 → 06
                      ├→ 07 ─┐
                      └→ 08 ─┴→ 09 → 10
```
