/**
 * SPRINT-EXECUTION-HOST-001 — Group F stage → existing contract map (T-F3).
 * Maps producers declared in /pipelines/knowledge-ingestion to existing
 * /contracts/agents/* ids. Does not create contracts or skills.
 */

import { HostError } from "../errors.js";
import type { PipelineStageDef } from "../pipeline/types.js";

export type StageContractPin = {
  readonly agentId: string;
  readonly contractVersion: string;
  /** Skills already declared for the agent family — empty if not pinned here. */
  readonly allowedSkills: readonly string[];
  readonly contractDoc: string;
};

/**
 * Producer display name (from pipeline markdown) → existing contract file slug.
 * Contract Version pins use document Contract Version 2.0.0 (not new).
 */
const PRODUCER_TO_CONTRACT: Record<string, StageContractPin> = {
  "Research Agent": {
    agentId: "research-agent",
    contractVersion: "2.0.0",
    allowedSkills: [],
    contractDoc: "contracts/agents/research-agent.md",
  },
  "Source Validation Agent": {
    agentId: "source-validation-agent",
    contractVersion: "2.0.0",
    allowedSkills: [],
    contractDoc: "contracts/agents/source-validation-agent.md",
  },
  "Proposal Agent": {
    agentId: "proposal-agent",
    contractVersion: "2.0.0",
    allowedSkills: [],
    contractDoc: "contracts/agents/proposal-agent.md",
  },
  "Knowledge Review Agent": {
    agentId: "knowledge-review-agent",
    contractVersion: "2.0.0",
    allowedSkills: [],
    contractDoc: "contracts/agents/knowledge-review-agent.md",
  },
  "Markdown Agent": {
    agentId: "markdown-agent",
    contractVersion: "2.0.0",
    allowedSkills: [],
    contractDoc: "contracts/agents/markdown-agent.md",
  },
  "Knowledge Graph Agent": {
    agentId: "knowledge-graph-agent",
    contractVersion: "2.0.0",
    allowedSkills: [],
    contractDoc: "contracts/agents/knowledge-graph-agent.md",
  },
  "Embedding Agent": {
    agentId: "embedding-agent",
    contractVersion: "2.0.0",
    allowedSkills: [],
    contractDoc: "contracts/agents/embedding-agent.md",
  },
  "Memory Agent": {
    agentId: "memory-agent",
    contractVersion: "2.0.0",
    allowedSkills: [],
    contractDoc: "contracts/agents/memory-agent.md",
  },
};

export function resolveStageContract(stage: PipelineStageDef): StageContractPin {
  const exact = PRODUCER_TO_CONTRACT[stage.producer];
  if (exact) return exact;
  // Pipeline Stage 4 producer cell names KR + Human; match existing KR contract only.
  for (const [producerName, pin] of Object.entries(PRODUCER_TO_CONTRACT)) {
    if (stage.producer.includes(producerName)) return pin;
  }
  throw new HostError(
    "CONTRACT_MAPPING_MISSING",
    `No existing contract mapping for producer "${stage.producer}" (stage ${stage.index}). Escalate gap — do not invent contract.`,
  );
}

export function listStageContractMap(): Readonly<
  Record<string, StageContractPin>
> {
  return PRODUCER_TO_CONTRACT;
}
