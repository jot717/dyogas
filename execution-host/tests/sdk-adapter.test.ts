/**
 * SPRINT-EXECUTION-HOST-001 — Group F SDK adapter tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HostError,
  createSdkAdapter,
  SDK_SYMBOLS_USED,
  resolveStageContract,
  loadPipeline,
  MVP_PIPELINE_ID,
  MVP_PIPELINE_VERSION,
  DEFAULT_PIPELINES_DIR,
} from "../src/index.js";

test("sdk adapter: inventory has no admit symbols", () => {
  assert.ok(SDK_SYMBOLS_USED.includes("bindContract"));
  assert.ok(SDK_SYMBOLS_USED.includes("invokeSkill"));
  assert.equal(SDK_SYMBOLS_USED.includes("admitRun" as never), false);
});

test("sdk adapter: stage map resolves all knowledge-ingestion producers", () => {
  const { definition } = loadPipeline({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
    pipelinesDir: DEFAULT_PIPELINES_DIR,
  });
  for (const stage of definition.stages) {
    const pin = resolveStageContract(stage);
    assert.ok(pin.agentId.length > 0, stage.producer);
    assert.ok(pin.contractDoc.startsWith("contracts/agents/"));
  }
});

test("sdk adapter: bindStage uses existing contract ids", () => {
  const { definition } = loadPipeline({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
  });
  const sdk = createSdkAdapter();
  const research = definition.stages[0]!;
  const binding = sdk.bindStage(research);
  assert.equal(binding.agentId, "research-agent");
  assert.equal(binding.contractVersion, "2.0.0");
});

test("sdk adapter: unknown skill fail closed", async () => {
  const { definition } = loadPipeline({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
  });
  const sdk = createSdkAdapter();
  const binding = sdk.bindStage(definition.stages[0]!, {
    allowedSkillsOverride: ["allowed_only"],
  });
  await assert.rejects(
    () => sdk.invokeSkill(binding, "invented_skill", {}, {}),
    (err: unknown) => {
      assert.ok(err instanceof HostError);
      assert.equal(err.code, "SDK_SKILL_ERROR");
      return true;
    },
  );
});

test("sdk adapter: allowlisted skill ok", async () => {
  const { definition } = loadPipeline({
    pipeline_id: MVP_PIPELINE_ID,
    pipeline_version: MVP_PIPELINE_VERSION,
  });
  const sdk = createSdkAdapter();
  const binding = sdk.bindStage(definition.stages[0]!, {
    allowedSkillsOverride: ["noop"],
  });
  const out = await sdk.invokeSkill(binding, "noop", { x: 1 }, {
    noop: (input) => ({ ...input, ok: true }),
  });
  assert.equal(out.ok, true);
});
