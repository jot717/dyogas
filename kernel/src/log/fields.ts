import { getContext } from "../tenancy/context.js";

const SECRETISH = /secret|password|token|api[_-]?key|credential/i;

export interface StructuredLogFields {
  module: "kernel";
  tenant_id?: string;
  correlation_id?: string;
  [key: string]: string | undefined;
}

export class LogFieldError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LogFieldError";
  }
}

/** Build standard Kernel structured fields (no logging vendor). */
export function buildLogFields(opts?: {
  correlationId?: string;
  extra?: Record<string, string>;
}): StructuredLogFields {
  const fields: StructuredLogFields = { module: "kernel" };
  const ctx = getContext();
  if (ctx) {
    fields.tenant_id = ctx.tenantId;
  }
  if (opts?.correlationId) {
    fields.correlation_id = opts.correlationId;
  }
  if (opts?.extra) {
    for (const [k, v] of Object.entries(opts.extra)) {
      if (SECRETISH.test(k)) {
        throw new LogFieldError(`secret-shaped log field key rejected: ${k}`);
      }
      if (SECRETISH.test(v) || looksLikeSecretValue(v)) {
        throw new LogFieldError("secret-like value rejected in structured fields");
      }
      fields[k] = v;
    }
  }
  return fields;
}

function looksLikeSecretValue(v: string): boolean {
  return /^(sk-|ghp_|xox[baprs]-)/i.test(v) || (v.length >= 32 && /^[A-Za-z0-9_\-/=]+$/.test(v) && !v.includes(" "));
}

/** Attach fields onto a plain record (caller owns logging). */
export function attachLogFields(
  target: Record<string, unknown>,
  opts?: { correlationId?: string; extra?: Record<string, string> },
): Record<string, unknown> {
  const fields = buildLogFields(opts);
  return { ...target, ...fields };
}
