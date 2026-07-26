import type { Citation, MarkdownHandoffInput } from "./input.js";

/**
 * Build review-ready Markdown: title, body, then a Citations section.
 * Does not invent facts — citations are caller-supplied only.
 */
export function buildReviewReadyMarkdown(
  handoff: MarkdownHandoffInput,
  citations: readonly Citation[] = [],
): string {
  const lines: string[] = [
    `# ${handoff.title}`,
    "",
    handoff.body.trim(),
    "",
    "## Citations",
    "",
  ];

  if (citations.length === 0) {
    lines.push("_No citations provided._", "");
  } else {
    for (const c of citations) {
      const excerpt = c.excerpt?.trim() ? ` — ${c.excerpt.trim()}` : "";
      lines.push(`- [${c.key}] ${c.source}${excerpt}`);
    }
    lines.push("");
  }

  lines.push(
    `<!-- knowledgeId: ${handoff.knowledgeId} version: ${handoff.version} tenant: ${handoff.tenantId} -->`,
    "",
  );

  return lines.join("\n");
}
