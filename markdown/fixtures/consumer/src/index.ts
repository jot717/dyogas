import {
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { renderMarkdownCandidate } from "@dyogas/markdown-engine";

export function smoke(): string {
  propagate(createTenancyContext(createTenantId("fx")));
  const r = renderMarkdownCandidate({
    handoff: {
      title: "Fixture",
      body: "Body",
      knowledgeId: "k-fx",
      tenantId: "fx",
      version: 1,
    },
    citations: [{ key: "c1", source: "https://example.com" }],
  });
  return `${r.candidate.sealed}:${r.candidate.artifactType}`;
}
