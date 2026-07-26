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

const REGISTRY = new Map<string, OntologyProfile>([
  [DEFAULT_ONTOLOGY.ontologyProfileId, DEFAULT_ONTOLOGY],
]);

export function resolveOntology(ontologyProfileId: string): OntologyProfile {
  const profile = REGISTRY.get(ontologyProfileId);
  if (!profile) {
    throw new GraphError(`unknown ontology profile: ${ontologyProfileId}`);
  }
  return profile;
}
