import { requireTenant } from "@dyogas/kernel";
import { createMemoryAuditSink, requireTrustIdentity, type AuditSink } from "@dyogas/trust";
import { admitRun, startRun, succeed, type RuntimeRun } from "@dyogas/runtime";
import {
  bindContract,
  emitCandidate,
  invokeSkill,
  type CandidateArtifact,
} from "@dyogas/agent-sdk";
import type { GraphRetrievalContract, KnowledgeItem } from "@dyogas/knowledge-engine";
import { proposeGraphUpdate, type KnowledgeGraphInput } from "./propose.js";
import {
  buildLocalEmbeddingJob,
  LOCAL_HASH_PROFILE_ID,
  type EmbeddingPathResult,
} from "./embedding.js";
import { createMemoryGraphStore, type InMemoryGraphStore } from "./store.js";
import { GraphError } from "./ontology.js";
import type { GraphUpdate } from "./types.js";

export interface GraphEngineResult {
  readonly run: RuntimeRun;
  readonly graphUpdate: GraphUpdate;
  readonly graphCandidate: CandidateArtifact;
  readonly embedding: EmbeddingPathResult;
  readonly embeddingCandidate: CandidateArtifact;
  readonly store: InMemoryGraphStore;
  readonly audit: AuditSink;
}

export interface RunGraphEngineOptions {
  /** Applied Knowledge SoR item (preferred). */
  readonly knowledge?: KnowledgeItem;
  /**
   * Alternate input: retrieval contract + sealed content fields
   * (when caller already has GraphRetrievalContract from knowledge-engine).
   */
  readonly retrieval?: GraphRetrievalContract;
  readonly title?: string;
  readonly body?: string;
  readonly approvalState?: string;
  readonly ontologyProfileId?: string;
  readonly mode?: "propose" | "apply";
  readonly mutationAuthorized?: boolean;
  readonly embeddingProfileId?: string;
  readonly store?: InMemoryGraphStore;
  readonly audit?: AuditSink;
}

function toInput(opts: RunGraphEngineOptions): KnowledgeGraphInput {
  if (opts.knowledge) {
    const k = opts.knowledge;
    return {
      knowledgeId: k.knowledgeId,
      version: k.version,
      title: k.title,
      body: k.body,
      tenantId: k.tenantId,
      approvalState: k.approvalState,
    };
  }
  if (opts.retrieval && opts.title && opts.body) {
    if (opts.retrieval.graphMaterialized !== false) {
      throw new GraphError("retrieval contract must declare graphMaterialized: false");
    }
    return {
      knowledgeId: opts.retrieval.knowledgeId,
      version: opts.retrieval.version,
      title: opts.title,
      body: opts.body,
      tenantId: opts.retrieval.tenantId,
      approvalState: opts.approvalState ?? "applied",
    };
  }
  throw new GraphError("knowledge item or retrieval+title+body required");
}

/**
 * Graph Engine MVP: Knowledge Graph Agent bind → GraphUpdate candidate;
 * Embedding Agent bind → local hash EmbeddingJob candidate.
 * No durable graph DB; no SoR mutation; no UI; no cloud vendor SDKs.
 */
export async function runGraphEngine(
  opts: RunGraphEngineOptions,
): Promise<GraphEngineResult> {
  requireTenant();
  requireTrustIdentity();
  const audit = opts.audit ?? createMemoryAuditSink();
  const store = opts.store ?? createMemoryGraphStore();
  const input = toInput(opts);

  const tenancy = requireTenant();
  if (input.tenantId !== tenancy.tenantId) {
    throw new GraphError("tenancy mismatch on knowledge input");
  }

  const graphBinding = bindContract({
    agentId: "knowledge-graph-agent",
    contractVersion: "1.0.0",
    allowedSkills: ["conflict-detection"],
    satisfiedPreconditions: ["tenancy_present"],
  });

  let run = admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: `${graphBinding.agentId}@${graphBinding.contractVersion}`,
    audit,
  });
  run = startRun(run);

  await invokeSkill(graphBinding, "conflict-detection", { knowledge_id: input.knowledgeId }, {
    "conflict-detection": async () => ({ ok: true }),
  });

  const graphUpdate = proposeGraphUpdate({
    knowledge: input,
    ontologyProfileId: opts.ontologyProfileId,
    mode: opts.mode,
    mutationAuthorized: opts.mutationAuthorized,
  });

  if (graphUpdate.mode === "apply") {
    store.apply(graphUpdate);
  }

  const graphCandidate = emitCandidate(graphBinding, {
    artifactType: "graph-update",
    tenantId: input.tenantId,
    payload: { ...graphUpdate },
  });

  const embeddingBinding = bindContract({
    agentId: "embedding-agent",
    contractVersion: "1.0.0",
    allowedSkills: ["local-hash-embed"],
    satisfiedPreconditions: ["tenancy_present"],
  });

  await invokeSkill(
    embeddingBinding,
    "local-hash-embed",
    { profile_id: opts.embeddingProfileId ?? LOCAL_HASH_PROFILE_ID },
    {
      "local-hash-embed": async () => ({ path: "local-hash" }),
    },
  );

  const embedding = buildLocalEmbeddingJob({
    profileId: opts.embeddingProfileId,
    sources: [
      {
        artifactId: input.knowledgeId,
        artifactVersion: String(input.version),
        artifactType: "Knowledge",
        title: input.title,
        body: input.body,
      },
      {
        artifactId: graphCandidate.artifactId,
        artifactVersion: graphCandidate.version,
        artifactType: "GraphUpdate",
        title: input.title,
        body: JSON.stringify({
          nodes: graphUpdate.nodes.length,
          edges: graphUpdate.edges.length,
        }),
      },
    ],
  });

  const embeddingCandidate = emitCandidate(embeddingBinding, {
    artifactType: "embedding-job",
    tenantId: input.tenantId,
    payload: { ...embedding.job },
  });

  run = succeed(run);

  audit.append({
    type: "graph.engine.completed",
    knowledge_id: input.knowledgeId,
    graph_mode: graphUpdate.mode,
    nodes: String(graphUpdate.nodes.length),
    edges: String(graphUpdate.edges.length),
    embedding_status: embedding.job.status,
    vectors: String(embedding.vectors.length),
  });

  return {
    run,
    graphUpdate,
    graphCandidate,
    embedding,
    embeddingCandidate,
    store,
    audit,
  };
}
