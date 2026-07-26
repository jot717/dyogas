/**
 * Evidence → Decision Asset extraction (DA-03). No fabrication beyond evidence text.
 */

import { createHash } from "node:crypto";
import {
  DecisionAssetError,
  type DecisionAsset,
  type DecisionAssetClaim,
  type ExtractDecisionAssetInput,
} from "./types.js";

function stableId(prefix: string, seed: string): string {
  const h = createHash("sha256").update(seed).digest("hex").slice(0, 12);
  return `${prefix}-${h}`;
}

/**
 * Extract a Decision Asset from evidence items (fail-closed on empty/invalid).
 */
export function extractDecisionAsset(
  input: ExtractDecisionAssetInput,
): DecisionAsset {
  const question = input.question?.trim() ?? "";
  const tenantId = input.tenant_id?.trim() ?? "";
  const taskId = input.task_id?.trim() ?? "";
  const researchArtifactId = input.research_artifact_id?.trim() ?? "";

  if (!question) throw new DecisionAssetError("question required");
  if (!tenantId) throw new DecisionAssetError("tenant_id required");
  if (!taskId) throw new DecisionAssetError("task_id required");
  if (!researchArtifactId) {
    throw new DecisionAssetError("research_artifact_id required");
  }
  if (!input.evidence?.length) {
    throw new DecisionAssetError("at least one evidence item required");
  }

  const claims: DecisionAssetClaim[] = [];
  const evidenceIds: string[] = [];

  for (const [i, item] of input.evidence.entries()) {
    if (!item.evidenceId.trim()) {
      throw new DecisionAssetError("evidenceId required on every item");
    }
    if (!item.excerpt.trim()) {
      throw new DecisionAssetError(`excerpt required for ${item.evidenceId}`);
    }
    if (!item.metadata.pointer.trim()) {
      throw new DecisionAssetError(`pointer required for ${item.evidenceId}`);
    }
    evidenceIds.push(item.evidenceId);
    claims.push({
      claim_id: `claim-${String(i).padStart(3, "0")}`,
      text: item.excerpt.trim().slice(0, 240),
      evidence_id: item.evidenceId,
    });
  }

  const title = `Decision Asset: ${question.slice(0, 80)}`;
  const summary = [
    `Decision-ready synthesis for: ${question}`,
    `Derived from ${evidenceIds.length} evidence item(s); provenance retained.`,
    `researchArtifactId: ${researchArtifactId}`,
  ].join(" ");

  return {
    asset_id: stableId("da", `${tenantId}:${researchArtifactId}:${question}`),
    title,
    question,
    summary,
    claims: Object.freeze(claims),
    evidence_ids: Object.freeze([...evidenceIds]),
    research_artifact_id: researchArtifactId,
    tenant_id: tenantId,
    task_id: taskId,
    ...(input.execution_package_task_id
      ? { execution_package_task_id: input.execution_package_task_id }
      : {}),
    status: "draft",
    requires_human_approval: true,
  };
}

/** Convert Decision Asset into Knowledge content body for SoR apply. */
export function decisionAssetToKnowledgeContent(asset: DecisionAsset): {
  title: string;
  body: string;
} {
  const claimBlocks = asset.claims.map(
    (c) =>
      `### ${c.claim_id}\nevidenceId: ${c.evidence_id}\n\n${c.text}`,
  );
  return {
    title: asset.title,
    body: [
      asset.summary,
      ``,
      `question: ${asset.question}`,
      `asset_id: ${asset.asset_id}`,
      asset.execution_package_task_id
        ? `execution_package_task_id: ${asset.execution_package_task_id}`
        : null,
      ``,
      `## Claims`,
      ...claimBlocks,
    ]
      .filter((line): line is string => line !== null)
      .join("\n"),
  };
}
