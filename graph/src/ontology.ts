export class GraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GraphError";
  }
}

export interface OntologyProfile {
  readonly ontologyProfileId: string;
  readonly nodeTypes: readonly string[];
  readonly relations: readonly string[];
}

/** Built-in MVP ontology — no external registry. */
export const DEFAULT_ONTOLOGY: OntologyProfile = Object.freeze({
  ontologyProfileId: "ontology-general-1.0.0",
  nodeTypes: Object.freeze(["Concept", "Guideline", "Pattern", "Entity", "Claim"]),
  relations: Object.freeze([
    "derived_from",
    "mentions",
    "related_to",
    "recommends",
    "implemented_by",
  ]),
});

/**
 * Decision Graph Foundation ontology — Evidence → Knowledge → Decision.
 * Additive profile; does not replace ontology-general-1.0.0.
 */
export const DECISION_GRAPH_ONTOLOGY: OntologyProfile = Object.freeze({
  ontologyProfileId: "ontology-decision-graph-1.0.0",
  nodeTypes: Object.freeze([
    "Evidence",
    "Knowledge",
    "Decision",
    "Question",
    "DecisionAsset",
    "HumanApproval",
    "Source",
    "Concept",
    "Claim",
    "Entity",
  ]),
  relations: Object.freeze([
    "supports",
    "approved_as",
    "decides",
    "created_from",
    "approved_by",
    "produced",
    "supported_by",
    "derived_from",
    "mentions",
    "related_to",
  ]),
});

const REGISTRY = new Map<string, OntologyProfile>([
  [DEFAULT_ONTOLOGY.ontologyProfileId, DEFAULT_ONTOLOGY],
  [DECISION_GRAPH_ONTOLOGY.ontologyProfileId, DECISION_GRAPH_ONTOLOGY],
]);

export function resolveOntology(ontologyProfileId: string): OntologyProfile {
  const profile = REGISTRY.get(ontologyProfileId);
  if (!profile) {
    throw new GraphError(`unknown ontology profile: ${ontologyProfileId}`);
  }
  return profile;
}
