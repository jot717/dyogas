/**
 * T-B2 — product-side pipeline pin mapping tests.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  APPROVED_PIPELINE_ID,
  APPROVED_PIPELINE_VERSION,
  KNOWLEDGE_INGESTION_EXECUTION_INTENT,
  approvedPipelinePinForCreateRun,
  selectApprovedPipelineForCreateRun,
} from "../src/bridge/pipeline-pin.js";
import { PersonalBrainError } from "../src/workspace.js";

test("T-B2-T1: approved pin is knowledge-ingestion@2.0.0", () => {
  const pin = approvedPipelinePinForCreateRun();
  assert.equal(pin.pipeline_id, "knowledge-ingestion");
  assert.equal(pin.pipeline_version, "2.0.0");
  assert.equal(APPROVED_PIPELINE_ID, "knowledge-ingestion");
  assert.equal(APPROVED_PIPELINE_VERSION, "2.0.0");
  assert.equal(KNOWLEDGE_INGESTION_EXECUTION_INTENT, "knowledge-ingestion");
  assert.ok(Object.isFrozen(pin));
});

test("T-B2-T2: selectApprovedPipelineForCreateRun rejects alternate pin", () => {
  assert.deepEqual(selectApprovedPipelineForCreateRun(), {
    pipeline_id: "knowledge-ingestion",
    pipeline_version: "2.0.0",
  });

  assert.throws(
    () => selectApprovedPipelineForCreateRun({ pipeline_id: "other-pipeline" }),
    (err: unknown) => err instanceof PersonalBrainError,
  );
  assert.throws(
    () =>
      selectApprovedPipelineForCreateRun({
        pipeline_id: "knowledge-ingestion",
        pipeline_version: "1.0.0",
      }),
    (err: unknown) => err instanceof PersonalBrainError,
  );
});

test("T-B2-T3: pin module does not import Runtime", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const src = fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../src/bridge/pipeline-pin.ts",
    ),
    "utf8",
  );
  assert.equal(/@dyogas\/runtime/.test(src), false);
  assert.equal(/\badmitRun\b/.test(src), false);
});
