/**
 * Persist approved Knowledge into the Decision Graph (in-memory store).
 * Fail-closed unless knowledge is applied and mutation is authorized.
 */

import type { KnowledgeItem } from "@dyogas/knowledge-engine";
import {
  DECISION_GRAPH_CONTRACT,
  type DecisionGraphFoundationRecord,
} from "./decision-graph-contract.js";
import { extractDecisionGraphDelta } from "./decision-graph-extract.js";
import { resolveOntology, GraphError } from "./ontology.js";
import { proposeGraphUpdate } from "./propose.js";
import type { InMemoryGraphStore } from "./store.js";
import type { GraphUpdate } from "./types.js";

export interface PersistDecisionGraphOptions {
  readonly knowledge: KnowledgeItem;
  readonly store: InMemoryGraphStore;
  /** Required for apply; absent → propose only (no store mutation). */
  readonly mutationAuthorized?: boolean;
  readonly mode?: "propose" | "apply";
}

export interface PersistDecisionGraphResult {
  readonly update: GraphUpdate;
  readonly foundation: DecisionGraphFoundationRecord;
  readonly persisted: boolean;
}

/**
 * Derive Decision Graph delta from applied Knowledge and optionally persist.
 */
export function persistApprovedKnowledgeToDecisionGraph(
  opts: PersistDecisionGraphOptions,
): PersistDecisionGraphResult {
  const k = opts.knowledge;
  if (k.approvalState !== "applied") {
    throw new GraphError("knowledge must be applied before decision-graph persist");
  }
  if (k.provenance.evidenceIds.length < 1) {
    throw new GraphError("applied knowledge must retain evidence provenance");
  }

  const ontology = resolveOntology(DECISION_GRAPH_CONTRACT.ontologyProfileId);
  const extracted = extractDecisionGraphDelta({
    knowledge: k,
    ontology,
  });

  const requested = opts.mode ?? "apply";
  let effective: "propose" | "apply" = requested;
  const issues = [...extracted.issues];
  if (requested === "apply" && !opts.mutationAuthorized) {
    effective = "propose";
    issues.push(
      "apply mode requested but no mutation-authorization grant present; executed as propose",
    );
  }

  // Prefer decision extraction; fall back consistency via propose path fields.
  const update: GraphUpdate = {
    knowledge_ref: {
      artifact_id: k.knowledgeId,
      artifact_version: String(k.version),
    },
    ontology_profile_id: ontology.ontologyProfileId,
    nodes: extracted.nodes,
    edges: extracted.edges,
    consistency_report: { ok: issues.length === 0, issues },
    mode: effective,
  };

  // Cross-check general propose still accepts applied knowledge (guardrail).
  proposeGraphUpdate({
    knowledge: {
      knowledgeId: k.knowledgeId,
      version: k.version,
      title: k.title,
      body: k.body,
      tenantId: k.tenantId,
      approvalState: k.approvalState,
    },
    ontologyProfileId: "ontology-general-1.0.0",
    mode: "propose",
  });

  let persisted = false;
  if (update.mode === "apply" && update.consistency_report.ok) {
    opts.store.apply(update);
    persisted = true;
  }

  const foundation: DecisionGraphFoundationRecord = {
    meta: DECISION_GRAPH_CONTRACT,
    evidence: {
      stage: "evidence",
      researchArtifactId: k.provenance.researchArtifactId,
      evidenceIds: [...k.provenance.evidenceIds],
      taskId: k.provenance.taskId,
      tenantId: k.tenantId,
    },
    knowledge: {
      stage: "knowledge",
      knowledgeId: k.knowledgeId,
      version: k.version,
      approvalState: "applied",
    },
    decision: {
      stage: "decision",
      graphUpdateMode: update.mode,
      nodeCount: update.nodes.length,
      edgeCount: update.edges.length,
      consistencyOk: update.consistency_report.ok,
    },
  };

  return { update, foundation, persisted };
}
