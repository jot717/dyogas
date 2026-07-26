/**
 * @dyogas/decision-asset-agent — Decision Asset Agent foundation
 */

export {
  DecisionAssetError,
  type DecisionAssetStatus,
  type DecisionAssetClaim,
  type DecisionAsset,
  type ExtractDecisionAssetInput,
} from "./types.js";

export {
  extractDecisionAsset,
  decisionAssetToKnowledgeContent,
} from "./extract.js";

export {
  decisionAssetFromResearchEvidence,
  type FromResearchInput,
} from "./from-research.js";

export {
  approveDecisionAsset,
  type ApproveDecisionAssetInput,
  type ApproveDecisionAssetResult,
} from "./approve.js";

export {
  persistApprovedDecisionAsset,
  type PersistDecisionAssetInput,
  type PersistDecisionAssetResult,
} from "./persist.js";

export {
  buildDecisionAssetEvidence,
  writeDecisionAssetEvidence,
  type DecisionAssetEvidence,
} from "./evidence.js";

export {
  runDecisionAssetAgentFoundation,
  type RunDecisionAssetAgentOptions,
  type RunDecisionAssetAgentResult,
} from "./run.js";
