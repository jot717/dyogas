/**
 * Agent memory contract — local run memory ops, not Knowledge SoR.
 */

export interface MemoryRecord {
  readonly key: string;
  readonly value: string;
  readonly tenantId: string;
}

export class MemoryContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemoryContractError";
  }
}

export interface AgentMemory {
  put(record: MemoryRecord): void;
  get(tenantId: string, key: string): string | undefined;
}

export function createAgentMemory(): AgentMemory {
  const store = new Map<string, string>();
  return {
    put(record: MemoryRecord): void {
      if (!record.tenantId.trim() || !record.key.trim()) {
        throw new MemoryContractError("tenantId and key required");
      }
      store.set(`${record.tenantId}::${record.key}`, record.value);
    },
    get(tenantId: string, key: string): string | undefined {
      return store.get(`${tenantId}::${key}`);
    },
  };
}
