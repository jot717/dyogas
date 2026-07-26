import {
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { buildKnowledgeHandoff } from "@dyogas/research-engine";
import { applyApprovedKnowledge } from "@dyogas/knowledge-engine";

export function smoke(): string {
  propagate(createTenancyContext(createTenantId("fx")));
  const h = buildKnowledgeHandoff({
    taskId: "t",
    tenantId: "fx",
    researchArtifactId: "a",
    evidenceIds: ["e"],
  });
  const r = applyApprovedKnowledge({
    handoff: h,
    content: { title: "T", body: "B" },
    approval: { decision: "approved", researchArtifactId: "a" },
  });
  return `${r.item.version}:${r.graphRetrieval.graphMaterialized}`;
}
