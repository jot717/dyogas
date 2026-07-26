import { generateId, getClock, requireTenant, TenancyError } from "@dyogas/kernel";

export class HumanGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HumanGateError";
  }
}

export type GateDecision = "pending" | "approved" | "rejected";

export interface PendingApproval {
  readonly gateId: string;
  readonly tenantId: string;
  readonly proposalId: string;
  readonly researchArtifactId: string;
  readonly painStatement: string;
  readonly decision: GateDecision;
  readonly createdAt: string;
  readonly decidedAt?: string;
  readonly actorId?: string;
  readonly note?: string;
}

function tenancy() {
  try {
    return requireTenant();
  } catch (err) {
    if (err instanceof TenancyError) throw new HumanGateError(err.message);
    throw err;
  }
}

export function enqueueApproval(input: {
  readonly proposalId: string;
  readonly researchArtifactId: string;
  readonly painStatement: string;
}): PendingApproval {
  const t = tenancy();
  return {
    gateId: generateId(),
    tenantId: t.tenantId,
    proposalId: input.proposalId,
    researchArtifactId: input.researchArtifactId,
    painStatement: input.painStatement,
    decision: "pending",
    createdAt: getClock().nowIso(),
  };
}

export function decideApproval(
  gate: PendingApproval,
  decision: "approved" | "rejected",
  actorId: string,
  note?: string,
): PendingApproval {
  if (gate.decision !== "pending") {
    throw new HumanGateError("gate already decided");
  }
  if (!actorId.trim()) {
    throw new HumanGateError("actorId required");
  }
  const t = tenancy();
  if (t.tenantId !== gate.tenantId) {
    throw new HumanGateError("tenancy mismatch");
  }
  return {
    ...gate,
    decision,
    actorId,
    note,
    decidedAt: getClock().nowIso(),
  };
}
