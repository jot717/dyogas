import { generateId, getClock, requireTenant, TenancyError } from "@dyogas/kernel";

export class PersonalBrainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersonalBrainError";
  }
}

export interface UserWorkspace {
  readonly workspaceId: string;
  readonly ownerUserId: string;
  readonly tenantId: string;
  readonly displayName: string;
  readonly createdAt: string;
}

function tenancy() {
  try {
    return requireTenant();
  } catch (err) {
    if (err instanceof TenancyError) throw new PersonalBrainError(err.message);
    throw err;
  }
}

/** Create a personal workspace bound to current Kernel tenancy. */
export function createWorkspace(opts: {
  readonly ownerUserId: string;
  readonly displayName: string;
}): UserWorkspace {
  const t = tenancy();
  if (!opts.ownerUserId.trim()) {
    throw new PersonalBrainError("ownerUserId required");
  }
  if (!opts.displayName.trim()) {
    throw new PersonalBrainError("displayName required");
  }
  return {
    workspaceId: generateId(),
    ownerUserId: opts.ownerUserId.trim(),
    tenantId: t.tenantId,
    displayName: opts.displayName.trim(),
    createdAt: getClock().nowIso(),
  };
}

export function assertWorkspaceBoundary(
  workspace: UserWorkspace,
  actorUserId: string,
): void {
  const t = tenancy();
  if (workspace.tenantId !== t.tenantId) {
    throw new PersonalBrainError("workspace tenancy mismatch");
  }
  if (workspace.ownerUserId !== actorUserId) {
    throw new PersonalBrainError("actor is not workspace owner");
  }
}
