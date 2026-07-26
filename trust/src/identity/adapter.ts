import {
  requireTenant,
  type TenancyContext,
  TenancyError,
} from "@dyogas/kernel";

export class TrustIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrustIdentityError";
  }
}

/** Trust ops require active Kernel tenancy context (deny-by-default). */
export function requireTrustIdentity(): TenancyContext {
  try {
    return requireTenant();
  } catch (err) {
    if (err instanceof TenancyError) {
      throw new TrustIdentityError(err.message);
    }
    throw err;
  }
}
