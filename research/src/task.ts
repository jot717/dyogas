import { generateId, requireTenant, TenancyError } from "@dyogas/kernel";

export type SourceClass = "youtube" | "github" | "reddit" | "web" | "mock";

export interface ResearchBrief {
  readonly question: string;
  readonly scope?: string;
  readonly allowedSourceClasses: readonly SourceClass[];
  readonly maxItems: number;
}

export interface ResearchTask {
  readonly taskId: string;
  readonly tenantId: string;
  readonly brief: ResearchBrief;
  readonly createdAt: string;
  readonly status: "created" | "collecting" | "ready_for_review";
}

export class ResearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResearchError";
  }
}

export function createResearchTask(
  brief: ResearchBrief,
  createdAt: string,
): ResearchTask {
  let tenancy;
  try {
    tenancy = requireTenant();
  } catch (err) {
    if (err instanceof TenancyError) {
      throw new ResearchError(err.message);
    }
    throw err;
  }
  if (!brief.question.trim()) throw new ResearchError("question required");
  if (brief.maxItems < 1) throw new ResearchError("maxItems must be >= 1");
  if (brief.allowedSourceClasses.length === 0) {
    throw new ResearchError("allowedSourceClasses required");
  }
  return {
    taskId: generateId(),
    tenantId: tenancy.tenantId,
    brief,
    createdAt,
    status: "created",
  };
}
