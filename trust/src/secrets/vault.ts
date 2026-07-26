const SECRET_KEY = /secret|password|token|api[_-]?key|credential/i;

export class SecretsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecretsError";
  }
}

export interface SecretsVault {
  get(name: string): string | undefined;
  require(name: string): string;
  /** Never returns raw secret values for secret-shaped keys. */
  redactDump(): Record<string, string>;
}

class EnvSecrets implements SecretsVault {
  constructor(private readonly env: NodeJS.ProcessEnv) {}

  get(name: string): string | undefined {
    const v = this.env[name];
    return v === undefined || v === "" ? undefined : v;
  }

  require(name: string): string {
    const v = this.get(name);
    if (v === undefined) throw new SecretsError(`missing secret: ${name}`);
    return v;
  }

  redactDump(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.env)) {
      if (v === undefined) continue;
      out[k] = SECRET_KEY.test(k) ? "[REDACTED]" : v;
    }
    return out;
  }
}

export function createSecretsVault(env: NodeJS.ProcessEnv = process.env): SecretsVault {
  return new EnvSecrets(env);
}

export function isSecretKey(name: string): boolean {
  return SECRET_KEY.test(name);
}
