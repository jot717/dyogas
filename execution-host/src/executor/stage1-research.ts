/**
 * H-01/H-03/H-04 — Stage-1 Research: Engine → schema validate → SDK emit → Runtime seal.
 */

import type { ArtifactRef } from "@dyogas/runtime";
import type { AgentContractBinding } from "@dyogas/agent-sdk";
import { HostError } from "../errors.js";
import type { RuntimeAdapter } from "../adapters/runtime.js";
import type { SdkAdapter } from "../adapters/sdk.js";
import type { ResearchEngineAdapter } from "../adapters/research-engine.js";
import { mapBootstrapToResearchBrief } from "../adapters/research-engine.js";
import { validateResearchReportCandidate } from "../validation/research-report.js";
import type {
  SealedArtifactRecord,
  SealedArtifactStore,
} from "../artifacts/sealed-store.js";
import type { LineageContext } from "../lineage/context.js";

export type Stage1ResearchResult = {
  readonly sealed: ArtifactRef;
  readonly record: SealedArtifactRecord;
  readonly candidateId: string;
};

export type Stage1ResearchDeps = {
  readonly runtime: RuntimeAdapter;
  readonly sdk: SdkAdapter;
  readonly research: ResearchEngineAdapter;
  readonly artifacts: SealedArtifactStore;
  readonly binding: AgentContractBinding;
  readonly bootstrap: Record<string, unknown>;
  readonly tenant_id: string;
  readonly run_id: string;
  readonly correlation_id: string;
  readonly lineage: LineageContext;
};

/**
 * Execute Stage 1 via ResearchEngine.execute(); validate; emit; seal; persist.
 * Fail closed on engine / schema / SDK / Runtime errors.
 */
export async function executeStage1Research(
  deps: Stage1ResearchDeps,
): Promise<Stage1ResearchResult> {
  const { brief, brief_id } = mapBootstrapToResearchBrief(deps.bootstrap);
  // Align brief id with lineage bootstrap when Host already stamped lineage.
  const lineageBrief =
    deps.lineage.records.find((r) => r.kind === "ResearchBrief")?.artifact_id ??
    brief_id;
  const effectiveBriefId =
    typeof deps.bootstrap.id === "string" && deps.bootstrap.id.trim()
      ? deps.bootstrap.id.trim()
      : lineageBrief;

  const engineOut = await deps.research.execute({
    brief,
    brief_id: effectiveBriefId,
  });

  const payload = engineOut.candidate as unknown as Record<string, unknown>;
  const schema = validateResearchReportCandidate(payload);
  if (!schema.ok) {
    throw new HostError(
      "RESEARCH_REPORT_SCHEMA_INVALID",
      schema.errors.join("; "),
    );
  }

  let candidate;
  try {
    candidate = deps.sdk.emitCandidate(deps.binding, {
      artifactType: "ResearchReport",
      tenantId: deps.tenant_id,
      payload,
    });
  } catch (err) {
    if (err instanceof HostError) throw err;
    throw new HostError(
      "SDK_CANDIDATE_ERROR",
      err instanceof Error ? err.message : String(err),
    );
  }

  let sealed: ArtifactRef;
  try {
    sealed = deps.runtime.sealArtifact(
      candidate.artifactId,
      "1.0.0",
      deps.tenant_id,
      true,
    );
    sealed = deps.runtime.acceptHandoff(sealed, deps.tenant_id);
  } catch (err) {
    throw new HostError(
      "RUNTIME_SEAL_FAILED",
      err instanceof Error ? err.message : String(err),
    );
  }

  // Never allow synthetic stage id for Stage-1 ResearchReport.
  if (sealed.artifactId === "knowledge-ingestion-stage-1") {
    throw new HostError(
      "SYNTHETIC_STAGE1_FORBIDDEN",
      "Stage 1 must seal engine-produced candidate id",
    );
  }

  const record: SealedArtifactRecord = {
    artifact_id: sealed.artifactId,
    version: sealed.version,
    tenant_id: deps.tenant_id,
    kind: "ResearchReport",
    payload,
    produced_by: candidate.producedBy,
    contract_version: candidate.contractVersion,
    run_id: deps.run_id,
    brief_ref: effectiveBriefId,
    sealed: true,
    schema_ok: true,
  };
  deps.artifacts.put(record);

  return {
    sealed,
    record,
    candidateId: candidate.artifactId,
  };
}
