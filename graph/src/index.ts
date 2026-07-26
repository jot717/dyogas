export { GraphError, DEFAULT_ONTOLOGY, DECISION_GRAPH_ONTOLOGY, resolveOntology, type OntologyProfile } from "./ontology.js";

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

export {
  DECISION_GRAPH_CONTRACT_ID,
  DECISION_GRAPH_CONTRACT_VERSION,
  DECISION_GRAPH_CONTRACT,
  type DecisionGraphStage,
  type DecisionGraphContractMeta,
  type EvidenceStageRef,
  type KnowledgeStageRef,
  type DecisionStageRef,
  type DecisionGraphFoundationRecord,
} from "./decision-graph-contract.js";

export {
  extractDecisionGraphDelta,
} from "./decision-graph-extract.js";

export {
  persistApprovedKnowledgeToDecisionGraph,
  type PersistDecisionGraphOptions,
  type PersistDecisionGraphResult,
} from "./decision-graph-persist.js";
