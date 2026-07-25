/**
 * C-04 — Execute Research Agent Stage 1 via Execution Host only.
 * SPRINT-PB-BRIDGE-CODING-001
 *
 * Product starts Host createRun; Host binds Research Agent and seals Stage 1.
 * PB does not import Runtime, Agent SDK, or research-engine runners.
 * PB does not fabricate ResearchReport payloads.
 *
 * Host MVP note (GAP-BR-019): current Host executor seals a lineage
 * ResearchReport artifact id after SDK bindStage — it does not yet return a
 * schema ResearchReport body via public Host API. PB observes lineage only.
 */

import type { HostRun } from "@dyogas/execution-host";
import { PersonalBrainError } from "../workspace.js";
import {
  createBridgeRun,
  type BridgeCreateRunResult,
  type CreateBridgeRunOptions,
} from "./create-run.js";
import {
  assertResearchAgentPathReached,
  type ResearchAgentPathObservation,
} from "./research-agent-path.js";
import type { ResearchRequest } from "./research-request.js";

/** Trusted-path artifact kind for Stage 1 (Host lineage / C3 emit map). */
export const RESEARCH_REPORT_ARTIFACT_TYPE = "ResearchReport" as const;

/**
 * How the Host currently materializes Stage 1 output for Bridge consume.
 * - host_mvp_lineage_seal: sealed artifact id + ResearchReport lineage slot
 *   after Host bindStage (not a PB-fabricated payload; not research-engine body).
 */
export type ResearchReportProductionMode = "host_mvp_lineage_seal";

export type HostResearchReportRef = {
  readonly artifact_type: typeof RESEARCH_REPORT_ARTIFACT_TYPE;
  readonly research_report_ref: string;
  readonly research_brief_ref: string;
  readonly run_id: string;
  readonly correlation_id: string;
  readonly pipeline_id: string;
  readonly pipeline_version: string;
  readonly production_mode: ResearchReportProductionMode;
};

export type ExecuteResearchViaHostResult = {
  readonly bridge: BridgeCreateRunResult;
  readonly path: ResearchAgentPathObservation;
  readonly researchReport: HostResearchReportRef;
};

/**
 * Assert HostRun carries a Host-produced ResearchReport lineage ref
 * linked to Brief + run. Fail closed if missing — never invent payload.
 */
export function assertHostResearchReport(
  hostRun: HostRun,
): HostResearchReportRef {
  const path = assertResearchAgentPathReached(hostRun);
  const reportRef = path.research_report_ref?.trim();
  const briefRef = path.research_brief_ref?.trim();
  if (!reportRef) {
    throw new PersonalBrainError(
      "Host ResearchReport missing: research_report_ref empty after createRun",
    );
  }
  if (!briefRef) {
    throw new PersonalBrainError(
      "Host ResearchReport lineage incomplete: research_brief_ref missing",
    );
  }
  if (path.run_id !== hostRun.run_id) {
    throw new PersonalBrainError("Research path run_id mismatch vs HostRun");
  }
  return {
    artifact_type: RESEARCH_REPORT_ARTIFACT_TYPE,
    research_report_ref: reportRef,
    research_brief_ref: briefRef,
    run_id: hostRun.run_id,
    correlation_id: path.correlation_id,
    pipeline_id: path.pipeline_id,
    pipeline_version: path.pipeline_version,
    production_mode: "host_mvp_lineage_seal",
  };
}

/**
 * Execute Stage 1 Research via Host createRun and return ResearchReport ref.
 * Fail closed on Host rejection or missing lineage. No Runtime/SDK/agent calls.
 */
export async function executeResearchViaHost(
  request: ResearchRequest,
  opts: CreateBridgeRunOptions = {},
): Promise<ExecuteResearchViaHostResult> {
  const bridge = await createBridgeRun(request, opts);
  const researchReport = assertHostResearchReport(bridge.hostRun);
  if (researchReport.correlation_id !== request.correlation_id) {
    throw new PersonalBrainError(
      "ResearchReport correlation_id does not match Research Request",
    );
  }
  if (researchReport.run_id !== bridge.bootstrap.run_id) {
    throw new PersonalBrainError(
      "ResearchReport run_id does not match stamped bootstrap run_id",
    );
  }
  const path = assertResearchAgentPathReached(bridge.hostRun);
  return { bridge, path, researchReport };
}
