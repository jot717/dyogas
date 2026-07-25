/**
 * C-02 — Personal Brain → ExecutionHost.createRun() integration.
 * SPRINT-PB-BRIDGE-CODING-001 / SPEC-PROD-004 / ADR-0010
 *
 * Product calls Host only. Does not import Runtime. Does not orchestrate stages.
 * Ambient Kernel tenancy (+ Trust when required by Runtime) must be set by caller
 * before real Host createRun (GAP-BR-012 workaround — B3/B4).
 */

import {
  createExecutionHost,
  HostError,
  type CreateRunRequest,
  type ExecutionHost,
  type HostRun,
} from "@dyogas/execution-host";
import { PersonalBrainError } from "../workspace.js";
import { selectApprovedPipelineForCreateRun } from "./pipeline-pin.js";
import {
  buildResearchBriefBootstrap,
  stampBootstrapRunId,
  type BuiltResearchBrief,
  type ResearchBriefBootstrap,
  type ResearchRequest,
} from "./research-request.js";

/** Minimal Host surface for Bridge createRun (injectable for tests). */
export type BridgeExecutionHost = Pick<ExecutionHost, "createRun">;

export type CreateBridgeRunOptions = {
  /** Inject Host (tests). Default: `createExecutionHost()`. */
  readonly host?: BridgeExecutionHost;
  readonly audit_sink?: unknown;
  readonly pipelinesDir?: string;
};

export type BridgeCreateRunResult = {
  readonly hostRun: HostRun;
  readonly built: BuiltResearchBrief;
  /** Bootstrap with Host-assigned run_id stamped (GAP-BR-005). */
  readonly bootstrap: ResearchBriefBootstrap;
  readonly createRunRequest: CreateRunRequest;
};

function bootstrapAsRecord(
  bootstrap: ResearchBriefBootstrap,
): Record<string, unknown> {
  const record: Record<string, unknown> = {
    question: bootstrap.question,
    scope: bootstrap.scope,
    allowed_source_classes: [...bootstrap.allowed_source_classes],
    budget: { ...bootstrap.budget },
    tenancy: { ...bootstrap.tenancy },
  };
  if (bootstrap.constraints) {
    record.constraints = { ...bootstrap.constraints };
  }
  if (bootstrap.run_id) {
    record.run_id = bootstrap.run_id;
  }
  return record;
}

function assertTenancyConsistent(built: BuiltResearchBrief): void {
  if (built.identity.tenant_id !== built.bootstrap.tenancy.tenant_id) {
    throw new PersonalBrainError(
      "createRun tenant_id must match bootstrap.tenancy.tenant_id",
    );
  }
}

function wrapHostFailure(err: unknown): never {
  if (err instanceof PersonalBrainError) throw err;
  if (err instanceof HostError) {
    throw new PersonalBrainError(
      `ExecutionHost.createRun refused (${err.code}): ${err.message}`,
    );
  }
  if (err instanceof Error) {
    throw new PersonalBrainError(
      `ExecutionHost.createRun failed: ${err.message}`,
    );
  }
  throw new PersonalBrainError("ExecutionHost.createRun failed: unknown error");
}

/**
 * Build ResearchBrief bootstrap from Request and call ExecutionHost.createRun.
 * Fail closed on builder errors or Host rejection.
 */
export async function createBridgeRun(
  request: ResearchRequest,
  opts: CreateBridgeRunOptions = {},
): Promise<BridgeCreateRunResult> {
  const built = buildResearchBriefBootstrap(request);
  assertTenancyConsistent(built);

  const pin = selectApprovedPipelineForCreateRun();
  const createRunRequest: CreateRunRequest = {
    pipeline_id: pin.pipeline_id,
    pipeline_version: pin.pipeline_version,
    bootstrap: bootstrapAsRecord(built.bootstrap),
    tenant_id: built.identity.tenant_id,
    caller_id: built.identity.caller_id,
    correlation_id: built.identity.correlation_id,
    ...(opts.audit_sink !== undefined
      ? { audit_sink: opts.audit_sink }
      : {}),
  };

  const host =
    opts.host ??
    createExecutionHost(
      opts.pipelinesDir !== undefined
        ? { pipelinesDir: opts.pipelinesDir }
        : {},
    );

  let hostRun: HostRun;
  try {
    hostRun = await host.createRun(createRunRequest);
  } catch (err) {
    wrapHostFailure(err);
  }

  if (!hostRun?.run_id?.trim()) {
    throw new PersonalBrainError(
      "ExecutionHost.createRun returned empty run_id",
    );
  }

  const bootstrap = stampBootstrapRunId(built.bootstrap, hostRun.run_id);

  return {
    hostRun,
    built,
    bootstrap,
    createRunRequest,
  };
}
