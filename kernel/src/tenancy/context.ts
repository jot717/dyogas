/**
 * Tenancy context — deny-by-default for tenant-scoped ops.
 * Child/workspace scope: deferred (see docs/child-scope-nongoal.md).
 */

export type TenantId = string & { readonly __brand: "TenantId" };

export interface TenancyContext {
  readonly tenantId: TenantId;
}

let current: TenancyContext | undefined;

export class TenancyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenancyError";
  }
}

export function createTenantId(raw: string): TenantId {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new TenancyError("tenant id must be non-empty");
  }
  return trimmed as TenantId;
}

export function createTenancyContext(tenantId: TenantId): TenancyContext {
  return { tenantId };
}

export function propagate(context: TenancyContext): void {
  current = context;
}

export function clear(): void {
  current = undefined;
}

export function getContext(): TenancyContext | undefined {
  return current;
}

/** Tenant-scoped operation: absent context denies by default. */
export function requireTenant(): TenancyContext {
  if (!current) {
    throw new TenancyError("tenancy context required (deny-by-default)");
  }
  return current;
}

/**
 * Assert a resource belongs to the active tenant.
 * Cross-tenant access always fails.
 */
export function assertSameTenant(resourceTenantId: TenantId): void {
  const ctx = requireTenant();
  if (ctx.tenantId !== resourceTenantId) {
    throw new TenancyError("cross-tenant access denied");
  }
}
