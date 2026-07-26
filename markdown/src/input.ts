export class MarkdownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarkdownError";
  }
}

/** Equivalent to Knowledge `MarkdownHandoffContract` fields used for render. */
export interface MarkdownHandoffInput {
  readonly title: string;
  readonly body: string;
  readonly knowledgeId: string;
  readonly tenantId: string;
  readonly version: number;
}

export interface Citation {
  readonly key: string;
  readonly source: string;
  readonly excerpt?: string;
}

export function normalizeHandoff(
  input: MarkdownHandoffInput,
): MarkdownHandoffInput {
  if (!input.tenantId.trim()) throw new MarkdownError("tenantId required");
  if (!input.knowledgeId.trim()) throw new MarkdownError("knowledgeId required");
  if (!input.title.trim()) throw new MarkdownError("title required");
  if (typeof input.version !== "number" || input.version < 1) {
    throw new MarkdownError("version must be >= 1");
  }
  return {
    title: input.title.trim(),
    body: input.body,
    knowledgeId: input.knowledgeId.trim(),
    tenantId: input.tenantId.trim(),
    version: input.version,
  };
}
