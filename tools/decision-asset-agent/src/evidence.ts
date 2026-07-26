/**
 * Execution evidence (DA-07 / DA-06 companion).
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { DecisionAsset } from "./types.js";
import type { PersistDecisionAssetResult } from "./persist.js";

export interface DecisionAssetEvidence {
  readonly sprintId: string;
  readonly trace: string;
  readonly generatedAt: string;
  readonly asset: {
    readonly asset_id: string;
    readonly status: DecisionAsset["status"];
    readonly evidence_ids: readonly string[];
    readonly execution_package_task_id?: string;
  };
  readonly knowledgeId?: string;
  readonly graph: {
    readonly persisted: boolean;
    readonly nodeCount: number;
    readonly edgeCount: number;
  };
  readonly verdict: "PASS" | "BLOCKED";
}

export function buildDecisionAssetEvidence(input: {
  readonly asset: DecisionAsset;
  readonly persist?: PersistDecisionAssetResult;
  readonly approved: boolean;
}): DecisionAssetEvidence {
  const persisted = input.persist?.graph.persisted === true;
  return {
    sprintId: "SPRINT-DECISION-ASSET-AGENT-FOUNDATION-001",
    trace: "TRACE-DECISION-ASSET-AGENT-FOUNDATION-001",
    generatedAt: new Date().toISOString(),
    asset: {
      asset_id: input.asset.asset_id,
      status: input.persist?.asset.status ?? input.asset.status,
      evidence_ids: [...input.asset.evidence_ids],
      ...(input.asset.execution_package_task_id
        ? {
            execution_package_task_id: input.asset.execution_package_task_id,
          }
        : {}),
    },
    knowledgeId: input.persist?.knowledge.item.knowledgeId,
    graph: {
      persisted,
      nodeCount: input.persist?.graph.update.nodes.length ?? 0,
      edgeCount: input.persist?.graph.update.edges.length ?? 0,
    },
    verdict: input.approved && persisted ? "PASS" : "BLOCKED",
  };
}

export function writeDecisionAssetEvidence(
  evidence: DecisionAssetEvidence,
  path: string,
): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
}
