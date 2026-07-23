/**
 * @dyogas/personal-brain — MOD-PERSONAL-BRAIN core + connection layer
 * (SPEC-PROD-001 / SPEC-PROD-002 / SPEC-PROD-003). Product UI layer removed.
 */

export {
  PersonalBrainError,
  type UserWorkspace,
  createWorkspace,
  assertWorkspaceBoundary,
} from "./workspace.js";

export {
  type CaptureKind,
  type SourceMetadata,
  type CaptureInput,
  type NormalizedCapture,
  normalizeCapture,
} from "./capture.js";

export {
  type IndexedBrainItem,
  type PersonalIndex,
  createPersonalIndex,
  cosineSimilarity,
  keywordScore,
} from "./index-store.js";

export { type RetrievedHit, type BrainAnswer, askMyBrain } from "./ask.js";

export {
  type CaptureResult,
  type PersonalBrain,
  createPersonalBrain,
} from "./brain.js";

/** Core product service (no HTTP/UI) — workspace, capture, approve, ask proposals, persistence. */
export { PersonalBrainProduct } from "./product/app.js";
export { buildMarkdownArtifact, parseFrontmatter } from "./knowledge/markdown-artifact.js";
export { loadEnv } from "./env.js";
