/**
 * Persist approved Decision Asset into Knowledge SoR + Decision Graph (DA-06).
 */

import {
  createMemoryGraphStore,
  persistApprovedKnowledgeToDecisionGraph,
  type InMemoryGraphStore,
  type PersistDecisionGraphResult,
  type ProductGraphLineage,
} from "@dyogas/graph-engine";
import type { KnowledgeApplyResult } from "@dyogas/knowledge-engine";
import type { HumanGateFlowResult } from "@dyogas/human-gate";
import { DecisionAssetError, type DecisionAsset } from "./types.js";

export interface PersistDecisionAssetInput {
  readonly asset: DecisionAsset;
  readonly gate: HumanGateFlowResult;
  readonly store?: InMemoryGraphStore;
  readonly mutationAuthorized?: boolean;
  readonly graphLineage?: ProductGraphLineage;
}

export interface PersistDecisionAssetResult {
  readonly asset: DecisionAsset;
  readonly knowledge: KnowledgeApplyResult;
  readonly graph: PersistDecisionGraphResult;
  readonly store: InMemoryGraphStore;
}

/**
 * Require gate.apply (human-approved SoR item), then persist Decision Graph nodes.
 */
export function persistApprovedDecisionAsset(
  opts: PersistDecisionAssetInput,
): PersistDecisionAssetResult {
  if (!opts.gate.apply) {
    throw new DecisionAssetError(
      "cannot persist: human approval apply result missing",
    );
  }
  if (opts.gate.apply.item.approvalState !== "applied") {
    throw new DecisionAssetError("knowledge must be applied before persist");
  }
  if (opts.asset.status !== "approved" && opts.asset.status !== "applied") {
    throw new DecisionAssetError("decision asset not approved");
  }

  const store = opts.store ?? createMemoryGraphStore();
  const graph = persistApprovedKnowledgeToDecisionGraph({
    knowledge: opts.gate.apply.item,
    store,
    mutationAuthorized: opts.mutationAuthorized ?? true,
    mode: "apply",
    ...(opts.graphLineage ? { lineage: opts.graphLineage } : {}),
  });

  if (!graph.persisted) {
    throw new DecisionAssetError("decision graph persist failed");
  }

  return {
    asset: { ...opts.asset, status: "applied" },
    knowledge: opts.gate.apply,
    graph,
    store,
  };
}
