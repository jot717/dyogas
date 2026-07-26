/**
 * Decision Graph extraction — Evidence / Knowledge / Decision nodes with provenance.
 */

import { createHash } from "node:crypto";
import type { KnowledgeItem } from "@dyogas/knowledge-engine";
import type { OntologyProfile } from "./ontology.js";
import type { GraphEdge, GraphNode } from "./types.js";

function stableId(prefix: string, seed: string): string {
  const h = createHash("sha256").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${h}`;
}

export function extractDecisionGraphDelta(opts: {
  readonly knowledge: KnowledgeItem;
  readonly ontology: OntologyProfile;
}): { nodes: GraphNode[]; edges: GraphEdge[]; issues: string[] } {
  const issues: string[] = [];
  const k = opts.knowledge;
  const artifactId = k.knowledgeId;
  const version = String(k.version);
  const titleProv = `${artifactId}#title`;
  const bodyProv = `${artifactId}#body`;

  const knowledgeNodeId = stableId("node", `knowledge:${artifactId}@${version}`);
  const decisionNodeId = stableId("node", `decision:${artifactId}@${version}`);

  const nodes: GraphNode[] = [
    {
      node_id: knowledgeNodeId,
      label: k.title.trim(),
      types: ["Knowledge"],
      provenance: [titleProv, bodyProv],
    },
    {
      node_id: decisionNodeId,
      label: `Decision from ${k.title.trim()}`.slice(0, 80),
      types: ["Decision"],
      provenance: [titleProv],
    },
  ];

  const edges: GraphEdge[] = [
    {
      edge_id: stableId("edge", `${knowledgeNodeId}->${decisionNodeId}:decides`),
      from: knowledgeNodeId,
      to: decisionNodeId,
      relation: "decides",
      provenance: [titleProv],
    },
  ];

  for (const evidenceId of k.provenance.evidenceIds) {
    const evidenceNodeId = stableId("node", `evidence:${evidenceId}`);
    const evidProv = `evidence:${evidenceId}`;
    nodes.push({
      node_id: evidenceNodeId,
      label: evidenceId,
      types: ["Evidence"],
      provenance: [evidProv, `${k.provenance.researchArtifactId}#${evidenceId}`],
    });
    edges.push({
      edge_id: stableId("edge", `${evidenceNodeId}->${knowledgeNodeId}:supports`),
      from: evidenceNodeId,
      to: knowledgeNodeId,
      relation: "supports",
      provenance: [evidProv],
    });
    edges.push({
      edge_id: stableId(
        "edge",
        `${evidenceNodeId}->${knowledgeNodeId}:approved_as`,
      ),
      from: evidenceNodeId,
      to: knowledgeNodeId,
      relation: "approved_as",
      provenance: [evidProv, titleProv],
    });
  }

  const nodeIds = new Set(nodes.map((n) => n.node_id));
  if (nodeIds.size !== nodes.length) {
    issues.push("duplicate node_id in decision-graph extraction");
  }
  for (const e of edges) {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) {
      issues.push(`dangling edge ${e.edge_id}`);
    }
    if (e.provenance.length < 1) {
      issues.push(`edge ${e.edge_id} missing provenance`);
    }
  }

  for (const n of nodes) {
    for (const t of n.types) {
      if (!opts.ontology.nodeTypes.includes(t)) {
        issues.push(
          `node type '${t}' not in ontology ${opts.ontology.ontologyProfileId}`,
        );
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
