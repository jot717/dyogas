import {
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { applyApprovedKnowledge } from "@dyogas/knowledge-engine";
import { runGraphEngine } from "@dyogas/graph-engine";

export async function smoke(): Promise<string> {
  propagate(createTenancyContext(createTenantId("fx")));
  const kn = applyApprovedKnowledge({
    handoff: {
      contractVersion: "1.0.0",
      taskId: "t",
      tenantId: "fx",
      researchArtifactId: "a",
      evidenceIds: ["e"],
      requiresHumanApproval: true,
      sorWriteAllowed: false,
    },
    content: { title: "Graph Smoke", body: "Local embedding path." },
    approval: { decision: "approved", researchArtifactId: "a" },
  });
  const g = await runGraphEngine({ knowledge: kn.item });
  return `${g.graphCandidate.sealed}:${g.embedding.job.status}:${g.embedding.vectors.length}`;
}
