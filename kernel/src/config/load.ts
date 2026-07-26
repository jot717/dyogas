/**
 * Config load from env (ADR-approved source for Kernel MVP).
 * Unknown keys: ignored (documented policy).
 * Tenancy-aware overlay: deferred (docs/tenancy-config-nongoal.md).
 */

const SECRET_KEY = /secret|password|token|api[_-]?key|credential/i;

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export interface KernelConfig {
  getString(key: string): string | undefined;
  requireString(key: string): string;
  /** Redacted dump for debug — never includes raw secret values. */
  dumpRedacted(): Record<string, string>;
}

class EnvConfig implements KernelConfig {
  constructor(private readonly env: NodeJS.ProcessEnv) {}

  getString(key: string): string | undefined {
    const v = this.env[key];
    return v === undefined || v === "" ? undefined : v;
  }

  requireString(key: string): string {
    const v = this.getString(key);
    if (v === undefined) {
      throw new ConfigError(`missing required config key: ${key}`);
    }
    return v;
  }

  dumpRedacted(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.env)) {
      if (v === undefined) continue;
      out[k] = SECRET_KEY.test(k) ? "[REDACTED]" : v;
    }
    return out;
  }
}

/** Load config from process env (or injected env map for tests). */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): KernelConfig {
  return new EnvConfig(env);
}
