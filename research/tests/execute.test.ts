/**
 * ResearchEngine.execute — Host capability path (no Runtime admit).
 */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { execute } from "../src/execute.js";

beforeEach(() => clear());

test("execute: collects evidence and emits schema-shaped ResearchReport candidate", async () => {
  propagate(createTenancyContext(createTenantId("t-exec")));
  const out = await execute({
    brief_id: "brief-exec-1",
    brief: {
      question: "What is local-first knowledge?",
      allowedSourceClasses: ["web"],
      maxItems: 2,
    },
  });
  assert.equal(out.candidate.brief_ref.brief_id, "brief-exec-1");
  assert.equal(out.candidate.brief_ref.question, "What is local-first knowledge?");
  assert.ok(Array.isArray(out.candidate.evidence_items));
  assert.ok(out.candidate.evidence_items.length > 0);
  assert.ok(Array.isArray(out.candidate.coverage_gaps));
  assert.ok(Array.isArray(out.candidate.open_questions));
  for (const item of out.candidate.evidence_items) {
    assert.ok(item.evidence_id);
    assert.ok(item.provenance.pointer);
    assert.notEqual(item.source_class, "mock");
  }
});

test("execute: does not require Runtime run identity on result", async () => {
  propagate(createTenancyContext(createTenantId("t-exec-2")));
  const out = await execute({
    brief_id: "brief-exec-2",
    brief: {
      question: "q",
      allowedSourceClasses: ["web"],
      maxItems: 1,
    },
  });
  assert.equal("run" in out, false);
  assert.ok(out.task.taskId);
});
