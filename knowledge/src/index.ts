/**
 * @dyogas/knowledge-engine — MOD-KNOWLEDGE / SPEC-ENGIN-002 / ADR-0006
 */

export {
  type KnowledgeApprovalState,
  type ProvenanceRecord,
  type KnowledgeItem,
  type HumanApprovalRecord,
  KnowledgeError,
  createKnowledgeDraft,
  applyApproval,
} from "./item.js";

export {
  type KnowledgeSoR,
  createMemoryKnowledgeSoR,
} from "./sor.js";

export {
  type GraphRetrievalContract,
  buildGraphRetrievalContract,
} from "./graph-retrieval.js";

export {
  type MarkdownHandoffContract,
  buildMarkdownHandoff,
} from "./markdown-handoff.js";

export {
  type KnowledgeApplyResult,
  type ApplyApprovedKnowledgeOptions,
  applyApprovedKnowledge,
} from "./apply.js";
