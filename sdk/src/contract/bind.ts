export class ContractBindError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractBindError";
  }
}

export interface AgentContractBinding {
  readonly agentId: string;
  readonly contractVersion: string;
  readonly allowedSkills: readonly string[];
  readonly preconditions: readonly string[];
}

export interface BindRequest {
  readonly agentId: string;
  readonly contractVersion: string;
  readonly allowedSkills: readonly string[];
  /** Declared preconditions that must already hold (e.g. tenancy_present). */
  readonly satisfiedPreconditions?: readonly string[];
  readonly requiredPreconditions?: readonly string[];
}

/**
 * Bind a published contract pin. Fails closed without version pin or unmet preconditions.
 * Does not admit Runtime runs — callers use @dyogas/runtime separately.
 */
export function bindContract(req: BindRequest): AgentContractBinding {
  if (!req.agentId.trim()) throw new ContractBindError("agentId required");
  if (!req.contractVersion.trim()) {
    throw new ContractBindError("contract version pin required");
  }
  const required = req.requiredPreconditions ?? ["tenancy_present"];
  const satisfied = new Set(req.satisfiedPreconditions ?? []);
  for (const p of required) {
    if (!satisfied.has(p)) {
      throw new ContractBindError(`precondition unmet: ${p}`);
    }
  }
  return {
    agentId: req.agentId,
    contractVersion: req.contractVersion,
    allowedSkills: Object.freeze([...req.allowedSkills]),
    preconditions: Object.freeze([...required]),
  };
}
