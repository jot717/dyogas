/**
 * C-05 — persist the ResearchReport reference returned by Execution Host.
 *
 * Persists Host public metadata only. Does not fabricate a ResearchReport
 * payload, bypass Host, call Runtime, SDK, or Research Engine.
 */

import { PersonalBrainError } from "../workspace.js";
import {
  createFileResearchReportReferenceStore,
  type PersistResearchReportResult,
  type ResearchReportReferenceStore,
  type StoredResearchReportReference,
} from "../persist/research-report-ref-store.js";
import {
  assertHostResearchReport,
  executeResearchViaHost,
  type ExecuteResearchViaHostResult,
} from "./execute-research.js";
import type { CreateBridgeRunOptions } from "./create-run.js";
import type { ResearchRequest } from "./research-request.js";

export type ExecuteAndPersistResearchOptions = CreateBridgeRunOptions & {
  readonly store?: ResearchReportReferenceStore;
};

function requireEqual(
  label: string,
  actual: string | undefined,
  expected: string | undefined,
): void {
  if (!actual?.trim() || !expected?.trim() || actual !== expected) {
    throw new PersonalBrainError(
      `${label} mismatch while persisting ResearchReport reference`,
    );
  }
}

/**
 * Validate and persist an already completed Host result.
 *
 * Duplicate behavior is delegated to the store: identical records are
 * idempotent; conflicting metadata for the same Host ref fails closed.
 */
export function persistResearchReportReference(
  result: ExecuteResearchViaHostResult,
  store: ResearchReportReferenceStore =
    createFileResearchReportReferenceStore(),
): PersistResearchReportResult {
  const hostReport = assertHostResearchReport(result.bridge.hostRun);
  const identity = result.bridge.built.identity;
  const tenancy = result.bridge.bootstrap.tenancy;
  const request = result.bridge.createRunRequest;

  requireEqual(
    "research_report_ref",
    result.researchReport.research_report_ref,
    hostReport.research_report_ref,
  );
  requireEqual(
    "research_brief_ref",
    result.researchReport.research_brief_ref,
    hostReport.research_brief_ref,
  );
  requireEqual("run_id", result.researchReport.run_id, result.bridge.hostRun.run_id);
  requireEqual("run_id", result.researchReport.run_id, result.bridge.bootstrap.run_id);
  requireEqual(
    "correlation_id",
    result.researchReport.correlation_id,
    request.correlation_id,
  );
  requireEqual("tenant_id", tenancy.tenant_id, identity.tenant_id);
  requireEqual("tenant_id", tenancy.tenant_id, request.tenant_id);
  requireEqual("owner/caller", identity.caller_id, request.caller_id);

  const record: StoredResearchReportReference = {
    ...result.researchReport,
    tenant_id: tenancy.tenant_id,
    workspace_id: tenancy.workspace_id,
    owner_id: identity.caller_id,
  };

  return store.save(record);
}

/**
 * Execute through Host, then persist exactly the returned ResearchReport ref.
 * Host failures propagate through executeResearchViaHost; no fallback exists.
 */
export async function executeAndPersistResearchViaHost(
  request: ResearchRequest,
  opts: ExecuteAndPersistResearchOptions = {},
): Promise<{
  readonly execution: ExecuteResearchViaHostResult;
  readonly persistence: PersistResearchReportResult;
}> {
  const { store, ...hostOptions } = opts;
  const execution = await executeResearchViaHost(request, hostOptions);
  const persistence = persistResearchReportReference(
    execution,
    store ?? createFileResearchReportReferenceStore(),
  );
  return { execution, persistence };
}
