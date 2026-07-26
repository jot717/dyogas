import type { KnowledgeItem } from "./item.js";
import { KnowledgeError } from "./item.js";

/**
 * Local-first in-memory Knowledge SoR (not a graph DB — ADR-0006).
 */
export interface KnowledgeSoR {
  apply(item: KnowledgeItem): KnowledgeItem;
  get(tenantId: string, knowledgeId: string): KnowledgeItem | undefined;
  listVersions(tenantId: string, knowledgeId: string): readonly KnowledgeItem[];
  list(tenantId: string): readonly KnowledgeItem[];
}

export function createMemoryKnowledgeSoR(): KnowledgeSoR {
  /** key: tenantId::knowledgeId → versions ascending */
  const store = new Map<string, KnowledgeItem[]>();

  function key(tenantId: string, knowledgeId: string): string {
    return `${tenantId}::${knowledgeId}`;
  }

  return {
    apply(item: KnowledgeItem): KnowledgeItem {
      if (item.approvalState !== "approved") {
        throw new KnowledgeError(
          "SoR apply denied: Human Approval must be approved (no bypass)",
        );
      }
      const k = key(item.tenantId, item.knowledgeId);
      const prev = store.get(k) ?? [];
      const nextVersion = (prev[prev.length - 1]?.version ?? 0) + 1;
      const applied: KnowledgeItem = {
        ...item,
        version: nextVersion,
        approvalState: "applied",
        updatedAt: item.updatedAt,
      };
      store.set(k, [...prev, applied]);
      return applied;
    },
    get(tenantId, knowledgeId) {
      const versions = store.get(key(tenantId, knowledgeId));
      return versions?.[versions.length - 1];
    },
    listVersions(tenantId, knowledgeId) {
      return (store.get(key(tenantId, knowledgeId)) ?? []).slice();
    },
    list(tenantId) {
      const out: KnowledgeItem[] = [];
      for (const [k, versions] of store) {
        if (!k.startsWith(`${tenantId}::`)) continue;
        const latest = versions[versions.length - 1];
        if (latest) out.push(latest);
      }
      return out;
    },
  };
}
