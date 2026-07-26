/**
 * SPRINT-EXECUTION-HOST-001 — Execution Host facade (Phase 3 wired).
 * SPRINT-HOST-RESEARCH-INTEGRATION-001 — Stage 1 Research Engine path.
 */

import type { AuditSink } from "@dyogas/trust";
import { createMemoryAuditSink } from "@dyogas/trust";
import type { SourceCollector } from "@dyogas/research-engine";
import type {
  CreateRunRequest,
  HostRun,
  HostRunStatus,
  HumanDecision,
} from "./api.js";
import { HostError } from "./errors.js";
import { loadPipeline } from "./pipeline/loader.js";
import { createRuntimeAdapter } from "./adapters/runtime.js";
import { createSdkAdapter } from "./adapters/sdk.js";
import {
  createResearchEngineAdapter,
  type ResearchEngineAdapter,
} from "./adapters/research-engine.js";
import {
  createSealedArtifactStore,
  type SealedArtifactRecord,
  type SealedArtifactStore,
} from "./artifacts/sealed-store.js";
import { runStageExecutor } from "./executor/executor.js";
import { toLineageSnapshot } from "./lineage/context.js";
import { createHostAudit, HostAuditType } from "./audit/host-audit.js";
import {
  resumeHumanGate,
  authorizeKnowledgeApply,
  authorizeGraphApply,
  type HumanGateSession,
  type ActorKind,
} from "./gate/human.js";
import type { RuntimeRun } from "@dyogas/runtime";
import type { LineageContext } from "./lineage/context.js";
import type { ExecuteResearchOptions, ResearchExecuteResult } from "@dyogas/research-engine";

type StoredRun = {
  host: HostRun;
  runtime: RuntimeRun;
  lineage: LineageContext;
  auditSink: AuditSink;
  humanGate?: HumanGateSession;
  status: HostRunStatus;
};

export type ExecutionHost = {
  readonly createRun: (req: CreateRunRequest) => Promise<HostRun>;
  readonly getRun: (runId: string) => Promise<HostRun>;
  readonly resumeHuman: (
    runId: string,
    decision: HumanDecision,
    actor_kind?: ActorKind,
  ) => Promise<HostRun>;
  readonly applyKnowledgeAuthorized: (runId: string) => Promise<HostRun>;
  readonly applyGraphAuthorized: (
    runId: string,
    presentedTokenId?: string,
  ) => Promise<HostRun>;
  /** Resolve sealed ResearchReport payload persisted by Stage 1. */
  readonly getSealedArtifact: (
    artifactId: string,
    tenantId: string,
  ) => SealedArtifactRecord | undefined;
};

export type CreateExecutionHostOptions = {
  readonly auditSink?: AuditSink;
  readonly pipelinesDir?: string;
  readonly researchCollector?: SourceCollector;
  readonly researchExecuteFn?: (
    opts: ExecuteResearchOptions,
  ) => Promise<ResearchExecuteResult>;
  readonly research?: ResearchEngineAdapter;
  readonly artifacts?: SealedArtifactStore;
};

function toHostRun(stored: StoredRun): HostRun {
  return {
    run_id: stored.host.run_id,
    pin: stored.host.pin,
    status: stored.status,
    lineage: toLineageSnapshot(stored.lineage),
  };
}

export function createExecutionHost(
  opts: CreateExecutionHostOptions = {},
): ExecutionHost {
  const runs = new Map<string, StoredRun>();
  const defaultSink = opts.auditSink ?? createMemoryAuditSink();
  const runtime = createRuntimeAdapter();
  const sdk = createSdkAdapter();
  const artifacts = opts.artifacts ?? createSealedArtifactStore();
  const research =
    opts.research ??
    createResearchEngineAdapter({
      collector: opts.researchCollector,
      executeFn: opts.researchExecuteFn,
    });

  return {
    async createRun(req: CreateRunRequest): Promise<HostRun> {
      const sink = (req.audit_sink as AuditSink | undefined) ?? defaultSink;
      const { definition, pin } = loadPipeline({
        pipeline_id: req.pipeline_id,
        pipeline_version: req.pipeline_version,
        pipelinesDir: opts.pipelinesDir,
      });

      let rtRun = runtime.admitRun({
        pipelineId: pin.pipeline_id,
        contractPin: "research-agent@2.0.0",
        audit: sink,
      });
      rtRun = runtime.startRun(rtRun);

      const result = await runStageExecutor(rtRun, {
        runtime,
        sdk,
        definition,
        pin,
        correlation_id: req.correlation_id,
        tenant_id: req.tenant_id,
        auditSink: sink,
        bootstrap: req.bootstrap,
        bootstrapBriefId:
          typeof req.bootstrap["id"] === "string"
            ? req.bootstrap["id"]
            : undefined,
        research,
        artifacts,
      });

      let status: HostRunStatus = "running";
      if (result.status === "waiting_human") status = "waiting_human";
      else if (result.status === "failed") status = "failed";
      else status = "succeeded";

      const host: HostRun = {
        run_id: result.runtime.ctx.runId,
        pin: { pipeline_id: pin.pipeline_id, pipeline_version: pin.pipeline_version },
        status,
        lineage: toLineageSnapshot(result.lineage),
      };

      runs.set(host.run_id, {
        host,
        runtime: result.runtime,
        lineage: result.lineage,
        auditSink: sink,
        humanGate: result.status === "waiting_human" ? result.humanGate : undefined,
        status,
      });

      return toHostRun(runs.get(host.run_id)!);
    },

    async getRun(runId: string): Promise<HostRun> {
      const stored = runs.get(runId);
      if (!stored) throw new HostError("RUN_NOT_FOUND", runId);
      return toHostRun(stored);
    },

    getSealedArtifact(artifactId: string, tenantId: string) {
      return artifacts.get(artifactId, tenantId);
    },

    async resumeHuman(
      runId: string,
      decision: HumanDecision,
      actor_kind: ActorKind = "human",
    ): Promise<HostRun> {
      const stored = runs.get(runId);
      if (!stored) throw new HostError("RUN_NOT_FOUND", runId);
      if (!stored.humanGate || stored.status !== "waiting_human") {
        throw new HostError("HUMAN_GATE_NOT_PAUSED", "run not waiting on human");
      }
      const audit = createHostAudit(stored.auditSink);
      resumeHumanGate(stored.humanGate, decision, actor_kind, audit);

      if (decision.outcome === "approved") {
        stored.status = "applying";
      } else if (decision.outcome === "rejected" || decision.outcome === "expired") {
        stored.status = "failed";
        runtime.handleFailure(stored.runtime, "POLICY_DENY");
        audit.emit(HostAuditType.RUN_COMPLETED, {
          run_id: runId,
          tenant_id: stored.humanGate.tenant_id,
          pipeline_id: stored.humanGate.pipeline_id,
          outcome: "failed",
          note: decision.outcome,
        });
      } else {
        stored.status = "cancelled";
      }

      stored.host = {
        ...stored.host,
        status: stored.status,
        lineage: toLineageSnapshot(stored.lineage),
      };
      return toHostRun(stored);
    },

    async applyKnowledgeAuthorized(runId: string): Promise<HostRun> {
      const stored = runs.get(runId);
      if (!stored?.humanGate) {
        throw new HostError("APPLY_TOKEN_REQUIRED", "no human gate session");
      }
      const audit = createHostAudit(stored.auditSink);
      authorizeKnowledgeApply(stored.humanGate, audit);
      stored.status = "applying";
      stored.host = {
        ...stored.host,
        status: stored.status,
        lineage: toLineageSnapshot(stored.lineage),
      };
      return toHostRun(stored);
    },

    async applyGraphAuthorized(
      runId: string,
      presentedTokenId?: string,
    ): Promise<HostRun> {
      const stored = runs.get(runId);
      if (!stored?.humanGate) {
        throw new HostError("APPLY_TOKEN_REQUIRED", "no human gate session");
      }
      const audit = createHostAudit(stored.auditSink);
      authorizeGraphApply(stored.humanGate, audit, presentedTokenId);
      stored.status = "succeeded";
      runtime.succeed(stored.runtime);
      audit.emit(HostAuditType.RUN_COMPLETED, {
        run_id: runId,
        tenant_id: stored.humanGate.tenant_id,
        pipeline_id: stored.humanGate.pipeline_id,
        outcome: "succeeded",
      });
      stored.host = {
        ...stored.host,
        status: stored.status,
        lineage: toLineageSnapshot(stored.lineage),
      };
      return toHostRun(stored);
    },
  };
}
