/**
 * SPRINT-EXECUTION-HOST-001 — Group C pipeline loader (T-C1, T-C3).
 * Consumes /pipelines markdown definitions. No topology invention.
 */

import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { HostError, MVP_PIPELINE_ID, MVP_PIPELINE_VERSION } from "../errors.js";
import type { ImmutablePipelinePin, PipelineDefinition, PipelineStageDef } from "./types.js";

const PACKAGE_ROOT = fileURLToPath(new URL("../..", import.meta.url));
export const DEFAULT_PIPELINES_DIR = resolve(PACKAGE_ROOT, "../pipelines");

/** MVP-allowed pipeline ids only (T-A3 / T-C3). */
const MVP_ALLOWED = new Set<string>([MVP_PIPELINE_ID]);

function metaField(markdown: string, label: string): string | undefined {
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*\`?([^\\n\`*]+)\`?`, "i");
  const m = markdown.match(re);
  return m?.[1]?.trim();
}

/**
 * Parse stage tables from knowledge-ingestion-style pipeline markdown.
 * Relies on declared `## N. Stage K — Name` sections + Producer/Consumer rows.
 */
export function parsePipelineMarkdown(
  markdown: string,
  sourcePath: string,
): PipelineDefinition {
  const pipeline_id = metaField(markdown, "Pipeline id");
  const pipeline_version = metaField(markdown, "Version");
  if (!pipeline_id) {
    throw new HostError("PIPELINE_PARSE_ERROR", "Pipeline id missing in definition");
  }
  if (!pipeline_version) {
    throw new HostError("PIPELINE_PARSE_ERROR", "Version missing in definition");
  }

  const stageHeader =
    /^##\s+\d+\.\s+Stage\s+(\d+)\s+[—–-]\s+(.+)$/gm;
  const headers: { index: number; name: string; start: number }[] = [];
  for (const m of markdown.matchAll(stageHeader)) {
    headers.push({
      index: Number(m[1]),
      name: (m[2] ?? "").trim(),
      start: m.index ?? 0,
    });
  }
  if (headers.length === 0) {
    throw new HostError(
      "PIPELINE_PARSE_ERROR",
      `No stages found in ${sourcePath}`,
    );
  }

  const stages: PipelineStageDef[] = [];
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]!;
    const end = headers[i + 1]?.start ?? markdown.length;
    const body = markdown.slice(h.start, end);
    const field = (label: string): string => {
      const row = body.match(
        new RegExp(`\\|\\s*\\*\\*${label}\\*\\*\\s*\\|\\s*([^|]+)\\|`, "i"),
      );
      return (row?.[1] ?? "").trim();
    };
    const whoApproves = field("Who approves");
    const humanGate =
      /human/i.test(whoApproves) && !/automated review gate only/i.test(whoApproves);
    stages.push({
      index: h.index,
      name: h.name,
      producer: field("Producer") || "unknown",
      consumer: field("Consumer") || "unknown",
      inputArtifact: field("Input Artifact") || "unknown",
      outputArtifact: field("Output Artifact") || "unknown",
      exitCriteria: field("Exit Criteria") || "",
      humanGate,
      reviewGate: true,
    });
  }

  stages.sort((a, b) => a.index - b.index);
  return Object.freeze({
    pipeline_id,
    pipeline_version,
    sourcePath,
    stages: Object.freeze(stages),
  });
}

export type LoadPipelineOptions = {
  readonly pipelinesDir?: string;
  readonly pipeline_id: string;
  readonly pipeline_version: string;
};

/**
 * Load + pin a pipeline definition. Fail closed on unknown / unsupported / mismatch.
 */
export function loadPipeline(opts: LoadPipelineOptions): {
  definition: PipelineDefinition;
  pin: ImmutablePipelinePin;
} {
  const { pipeline_id, pipeline_version } = opts;
  if (!pipeline_id?.trim()) {
    throw new HostError("PIPELINE_VERSION_REQUIRED", "pipeline_id required");
  }
  if (!pipeline_version?.trim()) {
    throw new HostError(
      "PIPELINE_VERSION_REQUIRED",
      "pipeline_version required at CREATE",
    );
  }
  if (!MVP_ALLOWED.has(pipeline_id)) {
    throw new HostError(
      pipeline_id === MVP_PIPELINE_ID
        ? "PIPELINE_UNSUPPORTED"
        : "PIPELINE_UNKNOWN",
      `unsupported or unknown pipeline_id: ${pipeline_id}`,
    );
  }

  const dir = opts.pipelinesDir ?? DEFAULT_PIPELINES_DIR;
  const sourcePath = join(dir, `${pipeline_id}.md`);
  if (!existsSync(sourcePath)) {
    throw new HostError(
      "PIPELINE_UNKNOWN",
      `pipeline definition not found: ${sourcePath}`,
    );
  }

  const markdown = readFileSync(sourcePath, "utf8");
  const definition = parsePipelineMarkdown(markdown, sourcePath);

  if (definition.pipeline_id !== pipeline_id) {
    throw new HostError(
      "PIPELINE_PARSE_ERROR",
      `id mismatch file vs request: ${definition.pipeline_id} vs ${pipeline_id}`,
    );
  }
  if (definition.pipeline_version !== pipeline_version) {
    throw new HostError(
      "PIPELINE_VERSION_MISMATCH",
      `expected ${pipeline_version}, definition has ${definition.pipeline_version}`,
    );
  }
  if (
    pipeline_id === MVP_PIPELINE_ID &&
    pipeline_version !== MVP_PIPELINE_VERSION
  ) {
    throw new HostError(
      "PIPELINE_VERSION_MISMATCH",
      `MVP pin requires ${MVP_PIPELINE_VERSION}`,
    );
  }

  const pin = freezePin({ pipeline_id, pipeline_version });
  return { definition, pin };
}

export function freezePin(pin: ImmutablePipelinePin): ImmutablePipelinePin {
  return Object.freeze({ ...pin });
}

/** Reject attempts to mutate a frozen pin (T-C2). */
export function assertPinImmutable(pin: ImmutablePipelinePin): void {
  if (!Object.isFrozen(pin)) {
    throw new HostError("PIPELINE_PIN_IMMUTABLE", "pipeline pin must be frozen");
  }
}
