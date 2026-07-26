import type { KnowledgeItem } from "./item.js";

/**
 * Retrieval contract for future Graph Engine — no graph DB (ADR-0006).
 */
export interface GraphRetrievalContract {
  readonly contractVersion: "1.0.0";
  readonly tenantId: string;
  readonly knowledgeId: string;
  readonly version: number;
  readonly evidenceIds: readonly string[];
  readonly researchArtifactId: string;
  readonly graphMaterialized: false;
}

export function buildGraphRetrievalContract(
  item: KnowledgeItem,
): GraphRetrievalContract {
  return {
    contractVersion: "1.0.0",
    tenantId: item.tenantId,
    knowledgeId: item.knowledgeId,
    version: item.version,
    evidenceIds: [...item.provenance.evidenceIds],
    researchArtifactId: item.provenance.researchArtifactId,
    graphMaterialized: false,
  };
}
