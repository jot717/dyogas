import { extractGraphDelta } from "./extract.js";
import { resolveOntology, DEFAULT_ONTOLOGY } from "./ontology.js";
import { GraphError } from "./ontology.js";
import type { GraphUpdate } from "./types.js";

export interface KnowledgeGraphInput {
  readonly knowledgeId: string;
  readonly version: number;
  readonly title: string;
  readonly body: string;
  readonly tenantId: string;
  /** Must be applied/sealed SoR item — drafts refused. */
  readonly approvalState: string;
}

export interface ProposeGraphOptions {
  readonly knowledge: KnowledgeGraphInput;
  readonly ontologyProfileId?: string;
  readonly mode?: "propose" | "apply";
  /** Required for effective apply; absent → fail closed to propose. */
  readonly mutationAuthorized?: boolean;
}

/**
 * Build a GraphUpdate delta from applied Knowledge fields (propose-first).
 */
export function proposeGraphUpdate(opts: ProposeGraphOptions): GraphUpdate {
  const k = opts.knowledge;
  if (k.approvalState !== "applied") {
    throw new GraphError("knowledge must be applied/sealed before graph derivation");
  }
  if (!k.title.trim() || !k.body.trim()) {
    throw new GraphError("knowledge title and body required");
  }

  const ontology = resolveOntology(
    opts.ontologyProfileId ?? DEFAULT_ONTOLOGY.ontologyProfileId,
  );
  const requested = opts.mode ?? "propose";
  const issues: string[] = [];

  let effective: "propose" | "apply" = requested;
  if (requested === "apply" && !opts.mutationAuthorized) {
    effective = "propose";
    issues.push(
      "apply mode requested but no mutation-authorization grant present; executed as propose",
    );
  }

  const extracted = extractGraphDelta({
    knowledgeId: k.knowledgeId,
    version: k.version,
    title: k.title,
    body: k.body,
    ontology,
  });
  issues.push(...extracted.issues);

  // Dangling / duplicate checks
  const nodeIds = new Set(extracted.nodes.map((n) => n.node_id));
  if (nodeIds.size !== extracted.nodes.length) {
    issues.push("duplicate node_id in extracted nodes");
  }
  for (const e of extracted.edges) {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) {
      issues.push(`dangling edge ${e.edge_id}`);
    }
    if (e.provenance.length < 1) {
      issues.push(`edge ${e.edge_id} missing provenance`);
    }
  }

  const ok = issues.length === 0;
  return {
    knowledge_ref: {
      artifact_id: k.knowledgeId,
      artifact_version: String(k.version),
    },
    ontology_profile_id: ontology.ontologyProfileId,
    nodes: extracted.nodes,
    edges: extracted.edges,
    consistency_report: { ok, issues },
    mode: effective,
  };
}
