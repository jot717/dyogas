/**
 * C-03 — Host-owned Stage 1 Research Agent path (observe only).
 * SPRINT-PB-BRIDGE-CODING-001 / SPEC-AGT-001 / C2 stage map
 *
 * Personal Brain does NOT bind agents, import Runtime, or drive stages.
 * Host binds research-agent@2.0.0 via SDK after createRun (Host-internal).
 * This module only observes HostRun lineage / documents expected Host pin.
 */

import {
  listStageContractMap,
  type HostRun,
  type StageContractPin,
} from "@dyogas/execution-host";
import { PersonalBrainError } from "../workspace.js";

/** Pipeline producer name — Host stage-map key (C2 / Host stage-map). */
export const STAGE1_RESEARCH_PRODUCER = "Research Agent" as const;

/** Existing agent id — contracts/agents/research-agent.md · SPEC-AGT-001 */
export const STAGE1_RESEARCH_AGENT_ID = "research-agent" as const;

/** Contract Version pinned by Host (not invented here). */
export const STAGE1_RESEARCH_CONTRACT_VERSION = "2.0.0" as const;

export type ResearchAgentPathObservation = {
  readonly run_id: string;
  readonly pipeline_id: string;
  readonly pipeline_version: string;
  readonly status: HostRun["status"];
  readonly correlation_id: string;
  readonly research_brief_ref?: string;
  readonly research_report_ref?: string;
  /** Always true — PB never binds; Host owns bind. */
  readonly host_owns_agent_bind: true;
};

/**
 * Read Host's published Stage 1 Research Agent contract pin (consume-only).
 * Does not bind agents. Does not call Runtime.
 */
export function hostResearchAgentContractPin(): StageContractPin {
  const map = listStageContractMap();
  const pin = map[STAGE1_RESEARCH_PRODUCER];
  if (!pin) {
    throw new PersonalBrainError(
      `Host stage map missing "${STAGE1_RESEARCH_PRODUCER}" — do not invent contract`,
    );
  }
  return pin;
}

/**
 * Assert Host stage map selects existing Research Agent contract (SPEC-AGT-001).
 */
export function assertHostSelectsResearchAgentContract(): StageContractPin {
  const pin = hostResearchAgentContractPin();
  if (pin.agentId !== STAGE1_RESEARCH_AGENT_ID) {
    throw new PersonalBrainError(
      `Host Research Agent pin mismatch: expected ${STAGE1_RESEARCH_AGENT_ID}, got ${pin.agentId}`,
    );
  }
  if (pin.contractVersion !== STAGE1_RESEARCH_CONTRACT_VERSION) {
    throw new PersonalBrainError(
      `Host Research Agent contract version mismatch: expected ${STAGE1_RESEARCH_CONTRACT_VERSION}, got ${pin.contractVersion}`,
    );
  }
  return pin;
}

/**
 * Observe Stage 1 evidence from HostRun lineage after createRun.
 * Does not start agents — Host already executed (or failed) internally.
 */
export function observeResearchAgentPath(
  hostRun: HostRun,
): ResearchAgentPathObservation {
  if (!hostRun.run_id?.trim()) {
    throw new PersonalBrainError("HostRun.run_id required for Research path observe");
  }
  return {
    run_id: hostRun.run_id,
    pipeline_id: hostRun.pin.pipeline_id,
    pipeline_version: hostRun.pin.pipeline_version,
    status: hostRun.status,
    correlation_id: hostRun.lineage.correlation_id,
    research_brief_ref: hostRun.lineage.research_brief_ref,
    research_report_ref: hostRun.lineage.research_report_ref,
    host_owns_agent_bind: true,
  };
}

/**
 * Fail closed unless Host lineage shows Stage 1 Research path evidence.
 * Expect brief and/or report refs after Host createRun (Host-owned execution).
 */
export function assertResearchAgentPathReached(hostRun: HostRun): ResearchAgentPathObservation {
  const obs = observeResearchAgentPath(hostRun);
  if (obs.pipeline_id !== "knowledge-ingestion") {
    throw new PersonalBrainError(
      `expected knowledge-ingestion pin, got ${obs.pipeline_id}`,
    );
  }
  const hasBrief = Boolean(obs.research_brief_ref?.trim());
  const hasReport = Boolean(obs.research_report_ref?.trim());
  if (!hasBrief && !hasReport) {
    throw new PersonalBrainError(
      "Host Research Agent path not evidenced: missing research_brief_ref and research_report_ref on HostRun.lineage",
    );
  }
  return obs;
}
