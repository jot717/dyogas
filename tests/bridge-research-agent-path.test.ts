/**
 * C-03 — Host Research Agent path tests.
 */

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { clear, createTenantId, createTenancyContext, propagate } from "@dyogas/kernel";
import { HostError, type CreateRunRequest, type HostRun } from "@dyogas/execution-host";
import { createBridgeRun } from "../src/bridge/create-run.js";
import {
  STAGE1_RESEARCH_AGENT_ID,
  STAGE1_RESEARCH_CONTRACT_VERSION,
  STAGE1_RESEARCH_PRODUCER,
  assertHostSelectsResearchAgentContract,
  assertResearchAgentPathReached,
  observeResearchAgentPath,
} from "../src/bridge/research-agent-path.js";
import { PersonalBrainError } from "../src/workspace.js";
import type { ResearchRequest } from "../src/bridge/research-request.js";

const baseRequest: ResearchRequest = {
  intent: "Research AI Agent market",
  workspace_id: "ws-1",
  owner_id: "owner-1",
  tenant_id: "tenant-a",
  correlation_id: "corr-c03",
};

beforeEach(() => clear());

test("C-03-T1: Host receives createRun with Stage 1 Brief bootstrap (not a stage API)", async () => {
  let captured: CreateRunRequest | undefined;
  const mockHost = {
    async createRun(req: CreateRunRequest): Promise<HostRun> {
      captured = req;
      return {
        run_id: "run-c03",
        pin: {
          pipeline_id: req.pipeline_id,
          pipeline_version: req.pipeline_version,
        },
        status: "waiting_human",
        lineage: {
          correlation_id: req.correlation_id,
          research_brief_ref: "brief-ref",
          research_report_ref: "report-ref",
        },
      };
    },
  };

  await createBridgeRun(baseRequest, { host: mockHost });

  assert.ok(captured);
  assert.equal(captured!.pipeline_id, "knowledge-ingestion");
  assert.equal(captured!.pipeline_version, "2.0.0");
  assert.equal(typeof captured!.bootstrap.question, "string");
  assert.ok(captured!.bootstrap.tenancy);
  // Product does not send agent_id / stage_index — Host selects Stage 1
  assert.equal(
    Object.prototype.hasOwnProperty.call(captured!, "agent_id"),
    false,
  );
});

test("C-03-T2: Host stage map selects Research Agent contract (SPEC-AGT-001)", () => {
  const pin = assertHostSelectsResearchAgentContract();
  assert.equal(pin.agentId, STAGE1_RESEARCH_AGENT_ID);
  assert.equal(pin.contractVersion, STAGE1_RESEARCH_CONTRACT_VERSION);
  assert.equal(pin.contractDoc, "contracts/agents/research-agent.md");
  assert.equal(STAGE1_RESEARCH_PRODUCER, "Research Agent");
});

test("C-03-T3: real Host createRun evidences Stage 1 Research lineage refs", async () => {
  propagate(createTenancyContext(createTenantId("tenant-a")));
  const result = await createBridgeRun(baseRequest);
  const obs = assertResearchAgentPathReached(result.hostRun);
  assert.equal(obs.host_owns_agent_bind, true);
  assert.ok(obs.research_brief_ref || obs.research_report_ref);
  assert.equal(obs.pipeline_id, "knowledge-ingestion");
  assert.equal(obs.correlation_id, "corr-c03");
});

test("C-03-T4: observe fail closed when lineage lacks Research evidence", () => {
  const empty: HostRun = {
    run_id: "run-x",
    pin: { pipeline_id: "knowledge-ingestion", pipeline_version: "2.0.0" },
    status: "failed",
    lineage: { correlation_id: "c" },
  };
  assert.throws(
    () => assertResearchAgentPathReached(empty),
    (err: unknown) => err instanceof PersonalBrainError,
  );
  const obs = observeResearchAgentPath(empty);
  assert.equal(obs.research_report_ref, undefined);
});

test("C-03-T5: fail closed on Host rejection (no agent bind fallback)", async () => {
  const mockHost = {
    async createRun(): Promise<HostRun> {
      throw new HostError("PIPELINE_UNSUPPORTED", "refused");
    },
  };
  await assert.rejects(
    () => createBridgeRun(baseRequest, { host: mockHost }),
    (err: unknown) => err instanceof PersonalBrainError,
  );
});

test("C-03-T6: bridge modules never import Runtime or Agent SDK", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const dir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../src/bridge",
  );
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));
  assert.ok(files.length >= 3);
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    assert.equal(/@dyogas\/runtime/.test(src), false, f);
    assert.equal(/@dyogas\/agent-sdk/.test(src), false, f);
    assert.equal(/\bbindAgent\b/.test(src), false, f);
    assert.equal(/\badmitRun\b/.test(src), false, f);
  }
});
