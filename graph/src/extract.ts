import { createHash } from "node:crypto";
import type { OntologyProfile } from "./ontology.js";
import type { GraphEdge, GraphNode } from "./types.js";

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "untitled";
}

function stableId(prefix: string, seed: string): string {
  const h = createHash("sha256").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${h}`;
}

/**
 * Deterministic node/edge extraction from sealed Knowledge fields.
 * Derives Concept + Claim nodes only — never invents facts beyond title/body.
 */
export function extractGraphDelta(opts: {
  readonly knowledgeId: string;
  readonly version: number;
  readonly title: string;
  readonly body: string;
  readonly ontology: OntologyProfile;
}): { nodes: GraphNode[]; edges: GraphEdge[]; issues: string[] } {
  const issues: string[] = [];
  const artifactId = opts.knowledgeId;
  const version = String(opts.version);
  const titleProv = `${artifactId}#title`;
  const bodyProv = `${artifactId}#body`;

  const conceptId = stableId("node", `concept:${opts.title}`);
  const knowledgeEntityId = stableId("node", `entity:${artifactId}@${version}`);

  const nodes: GraphNode[] = [
    {
      node_id: conceptId,
      label: opts.title.trim(),
      types: ["Concept"],
      provenance: [titleProv],
    },
    {
      node_id: knowledgeEntityId,
      label: `Knowledge ${artifactId}`,
      types: ["Entity"],
      provenance: [titleProv, bodyProv],
    },
  ];

  const edges: GraphEdge[] = [
    {
      edge_id: stableId("edge", `${conceptId}->${knowledgeEntityId}:derived_from`),
      from: conceptId,
      to: knowledgeEntityId,
      relation: "derived_from",
      provenance: [titleProv],
    },
  ];

  // Claim nodes from non-empty body paragraphs (deterministic, capped).
  const paragraphs = opts.body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .slice(0, 8);

  for (const [i, para] of paragraphs.entries()) {
    const claimId = stableId("node", `claim:${artifactId}:${i}:${slug(para)}`);
    const claimProv = `${artifactId}#claim_${String(i).padStart(3, "0")}`;
    nodes.push({
      node_id: claimId,
      label: para.slice(0, 80),
      types: ["Claim"],
      provenance: [claimProv],
    });
    edges.push({
      edge_id: stableId("edge", `${knowledgeEntityId}->${claimId}:mentions`),
      from: knowledgeEntityId,
      to: claimId,
      relation: "mentions",
      provenance: [claimProv],
    });
  }

  // Ontology vocabulary check
  for (const n of nodes) {
    for (const t of n.types) {
      if (!opts.ontology.nodeTypes.includes(t)) {
        issues.push(`node type '${t}' not in ontology ${opts.ontology.ontologyProfileId}`);
      }
    }
  }
  for (const e of edges) {
    if (!opts.ontology.relations.includes(e.relation)) {
      issues.push(
        `relation '${e.relation}' not in ontology ${opts.ontology.ontologyProfileId}`,
      );
    }
  }

  return { nodes, edges, issues };
}
