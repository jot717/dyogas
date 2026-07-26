/**
 * SPRINT-EXECUTION-HOST-001 — Stage Executor (Phase 2+3).
 * SPRINT-HOST-RESEARCH-INTEGRATION-001 — Stage 1 via Research Engine.
 * Ordered stages; lineage + audit; Human Gate pause via Group H overlay.
 */

import type { ArtifactRef, RuntimeRun } from "@dyogas/runtime";
import type { AgentContractBinding } from "@dyogas/agent-sdk";
import type { AuditSink } from "@dyogas/trust";
import { HostError } from "../errors.js";
import type { RuntimeAdapter } from "../adapters/runtime.js";
import type { SdkAdapter } from "../adapters/sdk.js";
import type { ResearchEngineAdapter } from "../adapters/research-engine.js";
import type { SealedArtifactStore } from "../artifacts/sealed-store.js";
import type { PipelineDefinition, PipelineStageDef } from "../pipeline/types.js";
import type { ImmutablePipelinePin } from "../pipeline/types.js";
import {
  appendLineage,
  createLineageContext,
  stageOutputKind,
  type LineageContext,
} from "../lineage/context.js";
import { createHostAudit, HostAuditType, type HostAudit } from "../audit/host-audit.js";
import {
  openHumanGate,
  type HumanGateSession,
} from "../gate/human.js";
import { executeStage1Research } from "./stage1-research.js";

export type ReviewGateResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly code: string };

export type StageExecuteHooks = {
  readonly executeStage?: (args: {
    stage: PipelineStageDef;
    binding: AgentContractBinding;
    lineage: LineageContext;
  }) => Promise<{ candidateId?: string; schemaOk?: boolean } | void>;
  readonly reviewGate?: (args: {
    stage: PipelineStageDef;
  }) => ReviewGateResult;
};

export type ExecutorResult =
  | {
      readonly status: "completed_stages";
      readonly stagesCompleted: number;
      readonly lineage: LineageContext;
      readonly runtime: RuntimeRun;
      readonly humanGate?: undefined;
    }
  | {
      readonly status: "waiting_human";
      readonly stagesCompleted: number;
      readonly lineage: LineageContext;
      readonly runtime: RuntimeRun;
      readonly humanGate: HumanGateSession;
    }
  | {
      readonly status: "failed";
      readonly code: string;
      readonly stagesCompleted: number;
      readonly lineage: LineageContext;
      readonly runtime: RuntimeRun;
      readonly humanGate?: undefined;
    };

export type StageExecutorDeps = {
  readonly runtime: RuntimeAdapter;
  readonly sdk: SdkAdapter;
  readonly definition: PipelineDefinition;
  readonly pin: ImmutablePipelinePin;
  readonly correlation_id: string;
  readonly tenant_id: string;
  readonly auditSink: AuditSink;
  readonly bootstrapBriefId?: string;
  /** ResearchBrief-shaped bootstrap for Stage-1 Research Engine. */
  readonly bootstrap?: Record<string, unknown>;
  readonly hooks?: StageExecuteHooks;
  /** Required for Stage-1 Research Engine path (H-01). */
  readonly research?: ResearchEngineAdapter;
  readonly artifacts?: SealedArtifactStore;
};

/**
 * Drive stages in loader order with lineage + audit.
 * Stage 1 uses ResearchEngine.execute → schema validate → seal (real candidate).
 * Later stages keep synthetic seal until future sprints.
 * Pauses at Human Gate (Host overlay) before Knowledge/Graph stages.
 */
export async function runStageExecutor(
  runtimeRun: RuntimeRun,
  deps: StageExecutorDeps,
): Promise<ExecutorResult> {
  if (
    deps.definition.pipeline_id !== deps.pin.pipeline_id ||
    deps.definition.pipeline_version !== deps.pin.pipeline_version
  ) {
    throw new HostError(
      "PIPELINE_PIN_IMMUTABLE",
      "definition/pin mismatch — refuse execution",
    );
  }

  let run = runtimeRun;
  const audit: HostAudit = createHostAudit(deps.auditSink);
  const lineage = createLineageContext({
    correlation_id: deps.correlation_id,
    tenant_id: deps.tenant_id,
    run_id: run.ctx.runId,
    pipeline_id: deps.pin.pipeline_id,
  });

  const bootstrapBriefId =
    deps.bootstrapBriefId ??
    (typeof deps.bootstrap?.["id"] === "string"
      ? deps.bootstrap["id"]
      : undefined) ??
    `brief-${deps.correlation_id}`;

  appendLineage(lineage, {
    kind: "ResearchBrief",
    artifact_id: bootstrapBriefId,
    version: "1.0.0",
    pipeline_id: deps.pin.pipeline_id,
    run_id: run.ctx.runId,
    stage_id: "0",
    tenant_id: deps.tenant_id,
    correlation_id: deps.correlation_id,
  });

  audit.emit(HostAuditType.RUN_ADMITTED, {
    run_id: run.ctx.runId,
    tenant_id: deps.tenant_id,
    pipeline_id: deps.pin.pipeline_id,
    pipeline_version: deps.pin.pipeline_version,
    note: "host_executor",
  });

  const reviewGate =
    deps.hooks?.reviewGate ??
    ((_args: { stage: PipelineStageDef }): ReviewGateResult => ({ ok: true }));
  let completed = 0;
  let lastSealed: ArtifactRef | undefined;

  for (const stage of deps.definition.stages) {
    audit.emit(HostAuditType.STAGE_STARTED, {
      run_id: run.ctx.runId,
      tenant_id: deps.tenant_id,
      pipeline_id: deps.pin.pipeline_id,
      stage_id: String(stage.index),
      stage_name: stage.name,
    });

    const binding = deps.sdk.bindStage(stage);

    if (deps.hooks?.executeStage) {
      await deps.hooks.executeStage({ stage, binding, lineage });
    }

    const gate = reviewGate({ stage });
    audit.emit(HostAuditType.REVIEW_GATE, {
      run_id: run.ctx.runId,
      tenant_id: deps.tenant_id,
      pipeline_id: deps.pin.pipeline_id,
      stage_id: String(stage.index),
      stage_name: stage.name,
      outcome: gate.ok ? "pass" : "fail",
      note: gate.ok ? undefined : gate.code,
    });

    if (!gate.ok) {
      run = deps.runtime.handleFailure(run, "POLICY_DENY");
      audit.emit(HostAuditType.RUN_COMPLETED, {
        run_id: run.ctx.runId,
        tenant_id: deps.tenant_id,
        pipeline_id: deps.pin.pipeline_id,
        outcome: "failed",
        note: gate.code,
      });
      return {
        status: "failed",
        code: gate.code,
        stagesCompleted: completed,
        lineage,
        runtime: run,
      };
    }

    if (stage.humanGate) {
      const humanGate = openHumanGate({
        run_id: run.ctx.runId,
        tenant_id: deps.tenant_id,
        pipeline_id: deps.pin.pipeline_id,
        pipeline_version: deps.pin.pipeline_version,
        stage,
        lineage,
        audit,
      });
      return {
        status: "waiting_human",
        stagesCompleted: completed,
        lineage,
        runtime: run,
        humanGate,
      };
    }

    const kind = stageOutputKind(stage.index);
    if (!kind) {
      throw new HostError(
        "LINEAGE_ORDER_VIOLATION",
        `no trusted-path kind for stage ${stage.index} before human gate`,
      );
    }

    let accepted: ArtifactRef;

    if (stage.index === 1 && kind === "ResearchReport") {
      if (!deps.research || !deps.artifacts) {
        throw new HostError(
          "RESEARCH_ENGINE_REQUIRED",
          "Stage 1 requires Research Engine adapter and sealed artifact store",
        );
      }
      try {
        const stage1 = await executeStage1Research({
          runtime: deps.runtime,
          sdk: deps.sdk,
          research: deps.research,
          artifacts: deps.artifacts,
          binding,
          bootstrap: {
            question: "unspecified",
            ...deps.bootstrap,
            id: bootstrapBriefId,
          },
          tenant_id: deps.tenant_id,
          run_id: run.ctx.runId,
          correlation_id: deps.correlation_id,
          lineage,
        });
        accepted = stage1.sealed;
      } catch (err) {
        const code =
          err instanceof HostError ? err.code : "RESEARCH_ENGINE_FAILED";
        const note = err instanceof Error ? err.message : String(err);
        run = deps.runtime.handleFailure(run, "POLICY_DENY");
        audit.emit(HostAuditType.RUN_COMPLETED, {
          run_id: run.ctx.runId,
          tenant_id: deps.tenant_id,
          pipeline_id: deps.pin.pipeline_id,
          outcome: "failed",
          note: `${code}: ${note}`,
        });
        return {
          status: "failed",
          code,
          stagesCompleted: completed,
          lineage,
          runtime: run,
        };
      }
    } else {
      // Stages 2+ remain synthetic until future platform sprints.
      const candidateId = `${deps.pin.pipeline_id}-stage-${stage.index}`;
      const sealed = deps.runtime.sealArtifact(
        candidateId,
        "1.0.0",
        deps.tenant_id,
        true,
      );
      accepted = deps.runtime.acceptHandoff(sealed, deps.tenant_id);
    }

    lastSealed = accepted;

    const record = appendLineage(lineage, {
      kind,
      artifact_id: accepted.artifactId,
      version: accepted.version,
      pipeline_id: deps.pin.pipeline_id,
      run_id: run.ctx.runId,
      stage_id: String(stage.index),
      tenant_id: deps.tenant_id,
      correlation_id: deps.correlation_id,
    });

    audit.emit(HostAuditType.HANDOFF, {
      run_id: run.ctx.runId,
      tenant_id: deps.tenant_id,
      pipeline_id: deps.pin.pipeline_id,
      stage_id: String(stage.index),
      stage_name: stage.name,
      artifact_id: record.artifact_id,
      digest: record.digest,
    });

    audit.emit(HostAuditType.STAGE_COMPLETED, {
      run_id: run.ctx.runId,
      tenant_id: deps.tenant_id,
      pipeline_id: deps.pin.pipeline_id,
      stage_id: String(stage.index),
      stage_name: stage.name,
      outcome: "completed",
    });

    completed += 1;
  }

  void lastSealed;
  audit.emit(HostAuditType.RUN_COMPLETED, {
    run_id: run.ctx.runId,
    tenant_id: deps.tenant_id,
    pipeline_id: deps.pin.pipeline_id,
    outcome: "succeeded",
  });
  return {
    status: "completed_stages",
    stagesCompleted: completed,
    lineage,
    runtime: run,
  };
}

export function assertSealedHandoff(
  runtime: RuntimeAdapter,
  artifact: ArtifactRef,
  tenantId: string,
): ArtifactRef {
  return runtime.acceptHandoff(artifact, tenantId);
}
