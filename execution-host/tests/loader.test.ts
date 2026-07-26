/**
 * SPRINT-EXECUTION-HOST-001 — Group C loader tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HostError,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
  assertPinImmutable,
  freezePin,
  loadPipeline,
  DEFAULT_PIPELINES_DIR,
} from "../src/index.js";

test("loader: knowledge-ingestion yields 8 stages in order", () => {
  const { definition, pin } = loadPipeline({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    pipelinesDir: DEFAULT_PIPELINES_DIR,
  });
  assert.equal(definition.pipeline_id, "knowledge-ingestion");
  assert.equal(definition.pipeline_version, "2.0.0");
  assert.equal(definition.stages.length, 8);
  assert.deepEqual(
    definition.stages.map((s) => s.name),
    [
      "Research",
      "Validation",
      "Proposal",
      "Human Review",
      "Markdown",
      "Graph",
      "Embedding",
      "Memory",
    ],
  );
  assert.equal(definition.stages[0]?.producer, "Research Agent");
  assert.equal(definition.stages[3]?.humanGate, true);
  assert.equal(pin.pipeline_id, MVP_PIPELINE_ID);
  assertPinImmutable(pin);
});

test("loader: unknown pipeline rejected", () => {
  assert.throws(
    () =>
      loadPipeline({
        pipeline_id: "not-a-real-pipeline",
        pipeline_version: "1.0.0",
      }),
    (err: unknown) => {
      assert.ok(err instanceof HostError);
      assert.equal(err.code, "PIPELINE_UNKNOWN");
      return true;
    },
  );
});

test("loader: version mismatch fail closed", () => {
  assert.throws(
    () =>
      loadPipeline({
        pipeline_id: MVP_PIPELINE_ID,
        pipeline_version: "9.9.9",
      }),
    (err: unknown) => {
      assert.ok(err instanceof HostError);
      assert.equal(err.code, "PIPELINE_VERSION_MISMATCH");
      return true;
    },
  );
});

test("loader: missing version fail closed", () => {
  assert.throws(
    () =>
      loadPipeline({
        pipeline_id: MVP_PIPELINE_ID,
        pipeline_version: "",
      }),
    (err: unknown) => {
      assert.ok(err instanceof HostError);
      assert.equal(err.code, "PIPELINE_VERSION_REQUIRED");
      return true;
    },
  );
});

test("pin: frozen immutable", () => {
  const pin = freezePin({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
  });
  assertPinImmutable(pin);
  assert.throws(() => {
    // @ts-expect-error intentional mutation attempt
    pin.pipeline_id = "other";
  });
});
