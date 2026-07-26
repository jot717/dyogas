/**
 * H-02 — Host adapter: bootstrap → ResearchEngine.execute() → candidate.
 * Does not call runResearchMvp (avoids second Runtime run).
 */

import {
  execute,
  type ExecuteResearchOptions,
  type ResearchBrief,
  type ResearchExecuteResult,
  type SourceClass,
  type SourceCollector,
} from "@dyogas/research-engine";
import { HostError } from "../errors.js";

export type ResearchEngineAdapter = {
  readonly execute: (
    opts: ExecuteResearchOptions,
  ) => Promise<ResearchExecuteResult>;
};

export type ResearchEngineAdapterOptions = {
  readonly collector?: SourceCollector;
  /** Test/fail-injection override. Defaults to ResearchEngine.execute. */
  readonly executeFn?: (
    opts: ExecuteResearchOptions,
  ) => Promise<ResearchExecuteResult>;
};

const ENGINE_SOURCE_CLASSES = new Set<SourceClass>([
  "youtube",
  "github",
  "reddit",
  "web",
  "mock",
]);

export function mapBootstrapToResearchBrief(
  bootstrap: Record<string, unknown>,
): { brief: ResearchBrief; brief_id: string } {
  const question =
    typeof bootstrap.question === "string" ? bootstrap.question.trim() : "";
  if (!question) {
    throw new HostError("RESEARCH_BRIEF_INVALID", "bootstrap.question required");
  }

  const scope =
    typeof bootstrap.scope === "string" ? bootstrap.scope : undefined;

  const rawClasses =
    (bootstrap.allowed_source_classes as unknown) ??
    bootstrap.allowedSourceClasses;
  let allowedSourceClasses: SourceClass[];
  if (Array.isArray(rawClasses) && rawClasses.length > 0) {
    allowedSourceClasses = [];
    for (const c of rawClasses) {
      if (typeof c !== "string" || !ENGINE_SOURCE_CLASSES.has(c as SourceClass)) {
        throw new HostError(
          "RESEARCH_BRIEF_INVALID",
          `unsupported allowed_source_class: ${String(c)}`,
        );
      }
      allowedSourceClasses.push(c as SourceClass);
    }
  } else {
    allowedSourceClasses = ["web"];
  }

  const budget = bootstrap.budget;
  let maxItems = 10;
  if (
    budget &&
    typeof budget === "object" &&
    typeof (budget as { max_items?: unknown }).max_items === "number"
  ) {
    maxItems = (budget as { max_items: number }).max_items;
  } else if (typeof bootstrap.maxItems === "number") {
    maxItems = bootstrap.maxItems;
  }
  if (!Number.isInteger(maxItems) || maxItems < 1) {
    throw new HostError("RESEARCH_BRIEF_INVALID", "budget.max_items must be ≥ 1");
  }

  const brief_id =
    typeof bootstrap.id === "string" && bootstrap.id.trim()
      ? bootstrap.id.trim()
      : typeof bootstrap.brief_id === "string" && bootstrap.brief_id.trim()
        ? bootstrap.brief_id.trim()
        : `brief-unspecified`;

  return {
    brief_id,
    brief: {
      question,
      scope,
      allowedSourceClasses,
      maxItems,
    },
  };
}

export function createResearchEngineAdapter(
  opts: ResearchEngineAdapterOptions = {},
): ResearchEngineAdapter {
  const executeFn = opts.executeFn ?? execute;
  return {
    async execute(input) {
      try {
        return await executeFn({
          ...input,
          collector: input.collector ?? opts.collector,
        });
      } catch (err) {
        if (err instanceof HostError) throw err;
        throw new HostError(
          "RESEARCH_ENGINE_FAILED",
          err instanceof Error ? err.message : String(err),
        );
      }
    },
  };
}
