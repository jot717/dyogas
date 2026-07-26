/**
 * @dyogas/graph-engine — MOD-GRAPH / SPEC-ENGIN-004
 */

export { GraphError, DEFAULT_ONTOLOGY, resolveOntology, type OntologyProfile } from "./ontology.js";

export type {
  ArtifactRef,
  GraphNode,
  GraphEdge,
  ConsistencyReport,
  GraphUpdate,
  SourceRef,
  ChunkMapEntry,
  Invalidation,
  EmbeddingJob,
  LocalEmbeddingVector,
} from "./types.js";

export {
  proposeGraphUpdate,
  type KnowledgeGraphInput,
  type ProposeGraphOptions,
} from "./propose.js";

export {
  createMemoryGraphStore,
  type InMemoryGraphStore,
} from "./store.js";

export {
  buildLocalEmbeddingJob,
  LOCAL_HASH_PROFILE_ID,
  LOCAL_HASH_DIMENSIONS,
  type EmbedSourceContent,
  type BuildEmbeddingJobOptions,
  type EmbeddingPathResult,
} from "./embedding.js";

export {
  runGraphEngine,
  type RunGraphEngineOptions,
  type GraphEngineResult,
} from "./run.js";
