/**
 * @dyogas/markdown-engine — MOD-MARKDOWN / SPEC-ENGIN-003 / ADR-0007
 */

export {
  type MarkdownHandoffInput,
  type Citation,
  MarkdownError,
  normalizeHandoff,
} from "./input.js";

export { buildReviewReadyMarkdown } from "./render.js";

export {
  type MarkdownSource,
  type MarkdownRenderResult,
  type RenderMarkdownOptions,
  renderMarkdownCandidate,
} from "./run.js";
