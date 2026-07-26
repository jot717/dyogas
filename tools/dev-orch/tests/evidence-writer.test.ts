/**
 * P2-07 — Evidence collector + Registry writer tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { ExecutionPackage } from "../src/package/types.ts";
import type { VerifierResult } from "../src/verifier/types.ts";
import {
  collectEvidence,
  evidenceRecordToJson,
} from "../src/evidence/collector.ts";
import type { EvidenceRecord } from "../src/evidence/types.ts";
import {
  applyRegistryUpdate,
  isWriteAllowed,
} from "../src/writer/update.ts";
import { parseTaskRegistryMarkdown } from "../src/parse/registry.ts";

function pkg(): ExecutionPackage {
  return {
    taskId: "T-1",
    title: "Sample",
    objective: "Do the thing",
    dependencies: [],
    acceptanceCriteria: "works",
    testRequirements: "tests pass",
    allowedScope: "tools/dev-orch/; docs/dev-orch/",
    forbiddenScope: "Runtime; SDK; Execution Host",
    expectedEvidence: "docs/dev-orch/T-1-evidence.md",
    executionMode: "Implementation Mode",
    sprintId: "SPRINT-DEV-ORCH-002",
    ssotReferences: "SPEC-DEV-ORCH-001",
    gapRegistry: "none",
    statusTransition:
      "READY_FOR_EXECUTION → IN_PROGRESS → DONE | BLOCKED",
  };
}

function passVerifier(): VerifierResult {
  return {
    ok: true,
    recommendation: "PASS",
    checks: [{ id: "V-1", pass: true, message: "ok" }],
  };
}

function blockedVerifier(): VerifierResult {
  return {
    ok: false,
    recommendation: "BLOCKED",
    checks: [{ id: "TESTS", pass: false, message: "fail" }],
    failedCheckIds: ["TESTS"],
  };
}

const sampleRegistry = `# TASK REGISTRY

**Registry ID:** TASK-REGISTRY-FIXTURE-WRITER  
**Current executable task:** **T-1**

---

### T-1 — Sample

| Field | Content |
|-------|---------|
| **Task ID** | T-1 |
| **Objective** | Do the thing |
| **Dependencies** | None |
| **Acceptance Criteria** | works |
| **Test Requirement** | tests pass |
| **Status** | **READY_FOR_EXECUTION** |

---

### T-2 — Next

| Field | Content |
|-------|---------|
| **Task ID** | T-2 |
| **Objective** | Next work |
| **Dependencies** | T-1 |
| **Acceptance Criteria** | ok |
| **Test Requirement** | ok |
| **Status** | **PENDING** |
`;

test("evidence: collect valid evidence", () => {
  const result = collectEvidence(pkg(), passVerifier(), {
    changed_files: [
      "tools/dev-orch/src/writer/update.ts",
      "docs/dev-orch/T-1-evidence.md",
    ],
    test_result: { ran: true, passed: true, summary: "ok" },
    evidence_path: "docs/dev-orch/T-1-evidence.md",
    evidence_exists: true,
    timestamp: "2026-07-25T12:00:00.000Z",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.record.task_id, "T-1");
  assert.equal(result.record.sprint_id, "SPRINT-DEV-ORCH-002");
  assert.equal(result.record.verifier_status, "PASS");
  assert.equal(result.record.evidence_path, "docs/dev-orch/T-1-evidence.md");
});

test("evidence: reject missing verifier result", () => {
  const result = collectEvidence(pkg(), null, {
    changed_files: ["docs/dev-orch/T-1-evidence.md"],
    test_result: { ran: true, passed: true, summary: "ok" },
    evidence_path: "docs/dev-orch/T-1-evidence.md",
    evidence_exists: true,
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /missing verifier/i);
});

test("evidence: reject fake evidence", () => {
  const result = collectEvidence(pkg(), passVerifier(), {
    changed_files: ["docs/dev-orch/T-1-evidence.md"],
    test_result: { ran: true, passed: true, summary: "ok" },
    evidence_path: "docs/dev-orch/invented.md",
    evidence_exists: true,
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /fake evidence/i);
});

test("evidence: reject non-existent artifact", () => {
  const result = collectEvidence(pkg(), passVerifier(), {
    changed_files: ["docs/dev-orch/T-1-evidence.md"],
    test_result: { ran: true, passed: true, summary: "ok" },
    evidence_path: "docs/dev-orch/T-1-evidence.md",
    evidence_exists: false,
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /does not exist/i);
});

function passEvidence(): EvidenceRecord {
  return {
    task_id: "T-1",
    sprint_id: "SPRINT-DEV-ORCH-002",
    timestamp: "2026-07-25T12:00:00.000Z",
    changed_files: ["docs/dev-orch/T-1-evidence.md"],
    test_result: { ran: true, passed: true, summary: "ok" },
    verifier_status: "PASS",
    evidence_path: "docs/dev-orch/T-1-evidence.md",
  };
}

test("writer: READY → IN_PROGRESS", () => {
  const result = applyRegistryUpdate({
    markdown: sampleRegistry,
    taskId: "T-1",
    to: "IN_PROGRESS",
    targetPath: "tasks/TASK-REGISTRY-FIXTURE-WRITER.md",
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.from, "READY_FOR_EXECUTION");
  assert.equal(result.to, "IN_PROGRESS");
  const parsed = parseTaskRegistryMarkdown(result.markdown);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.registry.tasks.find((t) => t.id === "T-1")!.status, "IN_PROGRESS");
});

test("writer: IN_PROGRESS → DONE with PASS", () => {
  const step1 = applyRegistryUpdate({
    markdown: sampleRegistry,
    taskId: "T-1",
    to: "IN_PROGRESS",
  });
  assert.equal(step1.ok, true);
  if (!step1.ok) return;
  const step2 = applyRegistryUpdate({
    markdown: step1.markdown,
    taskId: "T-1",
    to: "DONE",
    evidence: passEvidence(),
    nextExecutableTaskId: "T-2",
  });
  assert.equal(step2.ok, true);
  if (!step2.ok) return;
  const parsed = parseTaskRegistryMarkdown(step2.markdown);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const t1 = parsed.registry.tasks.find((t) => t.id === "T-1")!;
  assert.equal(t1.status, "DONE");
  assert.match(t1.evidence, /T-1-evidence/);
  assert.equal(parsed.registry.currentExecutableTask, "T-2");
});

test("writer: IN_PROGRESS → BLOCKED", () => {
  const step1 = applyRegistryUpdate({
    markdown: sampleRegistry,
    taskId: "T-1",
    to: "IN_PROGRESS",
  });
  assert.equal(step1.ok, true);
  if (!step1.ok) return;
  const step2 = applyRegistryUpdate({
    markdown: step1.markdown,
    taskId: "T-1",
    to: "BLOCKED",
    evidence: {
      ...passEvidence(),
      verifier_status: "BLOCKED",
    },
  });
  assert.equal(step2.ok, true);
  if (!step2.ok) return;
  const parsed = parseTaskRegistryMarkdown(step2.markdown);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.registry.tasks.find((t) => t.id === "T-1")!.status, "BLOCKED");
});

test("writer: reject DONE without PASS", () => {
  const step1 = applyRegistryUpdate({
    markdown: sampleRegistry,
    taskId: "T-1",
    to: "IN_PROGRESS",
  });
  assert.equal(step1.ok, true);
  if (!step1.ok) return;
  const noEvidence = applyRegistryUpdate({
    markdown: step1.markdown,
    taskId: "T-1",
    to: "DONE",
  });
  assert.equal(noEvidence.ok, false);
  const blocked = applyRegistryUpdate({
    markdown: step1.markdown,
    taskId: "T-1",
    to: "DONE",
    evidence: { ...passEvidence(), verifier_status: "BLOCKED" },
  });
  assert.equal(blocked.ok, false);
  if (blocked.ok) return;
  assert.match(blocked.error, /PASS/);
});

test("writer: reject illegal transition", () => {
  const result = applyRegistryUpdate({
    markdown: sampleRegistry,
    taskId: "T-1",
    to: "DONE",
    evidence: passEvidence(),
  });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /illegal transition/i);
});

test("writer: idempotent update", () => {
  const step1 = applyRegistryUpdate({
    markdown: sampleRegistry,
    taskId: "T-1",
    to: "IN_PROGRESS",
  });
  assert.equal(step1.ok, true);
  if (!step1.ok) return;
  const step2 = applyRegistryUpdate({
    markdown: step1.markdown,
    taskId: "T-1",
    to: "IN_PROGRESS",
  });
  assert.equal(step2.ok, true);
  if (!step2.ok) return;
  assert.equal(step2.idempotent, true);
  assert.equal(step2.markdown, step1.markdown);
});

test("writer: allowlist rejects GAP registry and platform paths", () => {
  assert.equal(isWriteAllowed("tasks/TASK-REGISTRY-X.md"), true);
  assert.equal(isWriteAllowed("docs/dev-orch/P2-07.md"), true);
  assert.equal(isWriteAllowed("sprints/SPRINT-X.md"), true);
  assert.equal(isWriteAllowed("mod/stage/evidence.md"), true);
  assert.equal(isWriteAllowed("docs/dev-orch/GAP-REGISTRY-X.md"), false);
  assert.equal(isWriteAllowed("runtime/src/index.ts"), false);
  assert.equal(isWriteAllowed("execution-host/src/host.ts"), false);
});

test("evidence: deterministic JSON", () => {
  const a = collectEvidence(pkg(), passVerifier(), {
    changed_files: ["docs/dev-orch/T-1-evidence.md"],
    test_result: { ran: true, passed: true, summary: "ok" },
    evidence_path: "docs/dev-orch/T-1-evidence.md",
    evidence_exists: true,
    timestamp: "2026-07-25T12:00:00.000Z",
  });
  const b = collectEvidence(pkg(), passVerifier(), {
    changed_files: ["docs/dev-orch/T-1-evidence.md"],
    test_result: { ran: true, passed: true, summary: "ok" },
    evidence_path: "docs/dev-orch/T-1-evidence.md",
    evidence_exists: true,
    timestamp: "2026-07-25T12:00:00.000Z",
  });
  assert.equal(a.ok && b.ok, true);
  if (!a.ok || !b.ok) return;
  assert.equal(evidenceRecordToJson(a.record), evidenceRecordToJson(b.record));
});
