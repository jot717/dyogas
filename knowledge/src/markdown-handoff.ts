import type { KnowledgeItem } from "./item.js";

/**
 * Markdown Engine handoff — no UI / no Markdown Engine impl here.
 */
export interface MarkdownHandoffContract {
  readonly contractVersion: "1.0.0";
  readonly tenantId: string;
  readonly knowledgeId: string;
  readonly version: number;
  readonly title: string;
  readonly body: string;
  readonly rendered: false;
}

export function buildMarkdownHandoff(item: KnowledgeItem): MarkdownHandoffContract {
  return {
    contractVersion: "1.0.0",
    tenantId: item.tenantId,
    knowledgeId: item.knowledgeId,
    version: item.version,
    title: item.title,
    body: item.body,
    rendered: false,
  };
}
