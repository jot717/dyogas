export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

export interface ToolDefinition {
  readonly toolId: string;
  readonly description: string;
  readonly invoke: (args: Record<string, unknown>) => unknown;
}

/** Registry of reusable agent tools (not Runtime orchestration). */
export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    if (!tool.toolId.trim()) throw new ToolError("toolId required");
    this.tools.set(tool.toolId, tool);
  }

  get(toolId: string): ToolDefinition {
    const t = this.tools.get(toolId);
    if (!t) throw new ToolError(`unknown tool: ${toolId}`);
    return t;
  }

  list(): readonly string[] {
    return [...this.tools.keys()];
  }
}
