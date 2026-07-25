/**
 * C-02 — createRun integration tests (Host public API only).
 */

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { clear, createTenantId, createTenancyContext, propagate } from "@dyogas/kernel";
import { HostError, type CreateRunRequest, type HostRun } from "@dyogas/execution-host";
import { createBridgeRun } from "../src/bridge/create-run.js";
import { PersonalBrainError } from "../src/workspace.js";
import type { ResearchRequest } from "../src/bridge/research-request.js";

const baseRequest: ResearchRequest = {
  intent: "Research AI Agent market",
  workspace_id: "ws-1",
  owner_id: "owner-1",
  tenant_id: "tenant-a",
  correlation_id: "corr-c02",
};

beforeEach(() => clear());

test("C-02-T1: assembles pin + bootstrap + identity for Host createRun", async () => {
  let captured: CreateRunRequest | undefined;
  const mockHost = {
    async createRun(req: CreateRunRequest): Promise<HostRun> {
      captured = req;
      return {
        run_id: "run-mock-1",
        pin: {
          pipeline_id: req.pipeline_id,
          pipeline_version: req.pipeline_version,
        },
        status: "running",
        lineage: { correlation_id: req.correlation_id },
      };
    },
  };

  const result = await createBridgeRun(baseRequest, { host: mockHost });

  assert.ok(captured);
  assert.equal(captured!.pipeline_id, "knowledge-ingestion");
  assert.equal(captured!.pipeline_version, "2.0.0");
  assert.equal(captured!.tenant_id, "tenant-a");
  assert.equal(captured!.caller_id, "owner-1");
  assert.equal(captured!.correlation_id, "corr-c02");
  assert.equal(captured!.bootstrap.question, "Research AI Agent market");
  assert.deepEqual(captured!.bootstrap.tenancy, {
    tenant_id: "tenant-a",
    workspace_id: "ws-1",
  });
  assert.equal(result.hostRun.run_id, "run-mock-1");
  assert.equal(result.bootstrap.run_id, "run-mock-1");
  assert.equal(result.hostRun.pin.pipeline_id, "knowledge-ingestion");
  assert.equal(result.hostRun.lineage.correlation_id, "corr-c02");
});

test("C-02-T2: fail closed on HostError", async () => {
  const mockHost = {
    async createRun(): Promise<HostRun> {
      throw new HostError("PIPELINE_UNKNOWN", "bad pipeline");
    },
  };

  await assert.rejects(
    () => createBridgeRun(baseRequest, { host: mockHost }),
    (err: unknown) =>
      err instanceof PersonalBrainError &&
      /ExecutionHost\.createRun refused \(PIPELINE_UNKNOWN\)/.test(err.message),
  );
});

test("C-02-T3: fail closed on missing request fields before Host call", async () => {
  let called = false;
  const mockHost = {
    async createRun(): Promise<HostRun> {
      called = true;
      return {
        run_id: "x",
        pin: { pipeline_id: "knowledge-ingestion", pipeline_version: "2.0.0" },
        status: "failed",
        lineage: { correlation_id: "c" },
      };
    },
  };

  await assert.rejects(
    () =>
      createBridgeRun(
        { ...baseRequest, intent: "" },
        { host: mockHost },
      ),
    (err: unknown) => err instanceof PersonalBrainError,
  );
  assert.equal(called, false);
});

test("C-02-T4: create-run module does not import Runtime", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const src = fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../src/bridge/create-run.ts",
    ),
    "utf8",
  );
  assert.equal(/@dyogas\/runtime/.test(src), false);
  assert.equal(/\badmitRun\b/.test(src), false);
  assert.equal(/from "@dyogas\/execution-host"/.test(src), true);
});

test("C-02-T5: real Host createRun with ambient Kernel tenancy (GAP-BR-012)", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const result = await createBridgeRun(baseRequest);
  assert.ok(result.hostRun.run_id);
  assert.equal(result.hostRun.pin.pipeline_id, "knowledge-ingestion");
  assert.equal(result.hostRun.pin.pipeline_version, "2.0.0");
  assert.equal(result.bootstrap.run_id, result.hostRun.run_id);
  assert.equal(result.hostRun.lineage.correlation_id, "corr-c02");
  // Stage progress is Host-owned; do not assert full pipeline — C-03+
  assert.ok(
    ["created", "running", "waiting_human", "succeeded", "failed"].includes(
      result.hostRun.status,
    ),
  );
});
