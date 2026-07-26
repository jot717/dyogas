/**
 * Research Agent output → Decision Asset (DA-04).
 */

import type { EvidenceItem } from "@dyogas/research-engine";
import { extractDecisionAsset } from "./extract.js";
import type { DecisionAsset } from "./types.js";

export interface FromResearchInput {
  readonly question: string;
  readonly tenant_id: string;
  readonly task_id: string;
  readonly research_artifact_id: string;
  readonly evidence: readonly EvidenceItem[];
  /** Optional Task Agent Execution Package taskId for correlation. */
  readonly execution_package_task_id?: string;
}

/**
 * Build Decision Asset from Research EvidenceItem[] (contract-compatible).
 */
export function decisionAssetFromResearchEvidence(
  input: FromResearchInput,
): DecisionAsset {
  return extractDecisionAsset({
    question: input.question,
    tenant_id: input.tenant_id,
    task_id: input.task_id,
    research_artifact_id: input.research_artifact_id,
    execution_package_task_id: input.execution_package_task_id,
    evidence: input.evidence.map((e) => ({
      evidenceId: e.evidenceId,
      excerpt: e.excerpt,
      metadata: {
        title: e.metadata.title,
        pointer: e.metadata.pointer,
        sourceClass: e.metadata.sourceClass,
      },
    })),
  });
}
