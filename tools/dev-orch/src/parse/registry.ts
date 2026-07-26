/**
 * Task Registry markdown parser (Runbook §3.1).
 * Fail-closed on invalid format or missing required task fields.
 */
import { readFileSync } from "node:fs";
import type {
  ParseResult,
  RegistryTask,
  TaskRegistry,
  TaskStatusToken,
} from "../types.js";

const REQUIRED_TASK_FIELDS = [
  "Task ID",
  "Status",
  "Dependencies",
  "Acceptance Criteria",
  "Test Requirement",
] as const;

const STATUS_TOKENS: TaskStatusToken[] = [
  "READY_FOR_EXECUTION",
  "IN_PROGRESS",
  "DONE",
  "BLOCKED",
  "PENDING",
];

/**
 * Parse Task Registry markdown from a string.
 */
export function parseTaskRegistryMarkdown(
  markdown: string,
  sourcePath?: string,
): ParseResult {
  const text = markdown.replace(/^\uFEFF/, "").trim();
  if (!text) {
    return { ok: false, error: "empty registry document" };
  }

  if (!/^#\s*TASK\s+REGISTRY\b/im.test(text)) {
    return {
      ok: false,
      error: "invalid registry format: missing '# TASK REGISTRY' heading",
    };
  }

  const registryId = matchBoldField(text, "Registry ID");
  if (!registryId) {
    return {
      ok: false,
      error: "invalid registry format: missing Registry ID",
    };
  }

  const currentExecutableTask = parseCurrentExecutable(text);

  const taskBlocks = splitTaskBlocks(text);
  if (taskBlocks.length === 0) {
    return {
      ok: false,
      error: "invalid registry format: no task sections (### <ID> — <title>)",
    };
  }

  const tasks: RegistryTask[] = [];
  for (const block of taskBlocks) {
    const parsed = parseTaskBlock(block);
    if (!parsed.ok) return parsed;
    tasks.push(parsed.task);
  }

  const registry: TaskRegistry = {
    registryId,
    sourcePath,
    currentExecutableTask,
    tasks,
  };

  return { ok: true, registry };
}

/**
 * Parse Task Registry markdown from a filesystem path.
 */
export function parseTaskRegistryFile(filePath: string): ParseResult {
  let markdown: string;
  try {
    markdown = readFileSync(filePath, "utf8");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `failed to read registry file: ${msg}` };
  }
  return parseTaskRegistryMarkdown(markdown, filePath);
}

function matchBoldField(text: string, label: string): string | null {
  const re = new RegExp(
    `\\*\\*${escapeRegExp(label)}:\\*\\*\\s*(.+?)\\s*$`,
    "im",
  );
  const m = text.match(re);
  if (!m?.[1]) return null;
  return stripMarkdownDecor(m[1]);
}

function parseCurrentExecutable(text: string): string | null {
  const re =
    /\*\*Current executable task:\*\*\s*(.+?)(?:\r?\n|$)/i;
  const m = text.match(re);
  if (!m?.[1]) return null;
  const raw = stripMarkdownDecor(m[1]);
  if (/^none\b/i.test(raw)) return null;
  const idMatch = raw.match(/\b([A-Z][A-Z0-9]*-[A-Z0-9]+)\b/);
  return idMatch?.[1] ?? raw;
}

/** Task IDs: P2-01, T-O1, H-01, T-C1, … */
const TASK_ID = "[A-Z][A-Z0-9]*-[A-Z0-9]+";

function splitTaskBlocks(text: string): string[] {
  const parts = text.split(/^###\s+/m);
  const blocks: string[] = [];
  const headingRe = new RegExp(`^${TASK_ID}\\s+[—–-]\\s+`, "u");
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i]!;
    // Task headings look like: P2-01 — title  OR  T-O1 — title
    if (headingRe.test(block)) {
      blocks.push(block);
    }
  }
  return blocks;
}

function parseTaskBlock(
  block: string,
): { ok: true; task: RegistryTask } | { ok: false; error: string } {
  const firstLine = block.split(/\r?\n/, 1)[0] ?? "";
  const heading = firstLine.match(
    new RegExp(`^(${TASK_ID})\\s+[—–-]\\s+(.+?)\\s*$`, "u"),
  );
  if (!heading) {
    return {
      ok: false,
      error: `invalid task heading: ${firstLine.slice(0, 80)}`,
    };
  }
  const headingId = heading[1]!;
  const title = heading[2]!.trim();

  const fields = parseFieldTable(block);
  for (const req of REQUIRED_TASK_FIELDS) {
    if (!(req in fields) || !fields[req]!.trim()) {
      return {
        ok: false,
        error: `task ${headingId}: missing required field '${req}'`,
      };
    }
  }

  const taskId = stripMarkdownDecor(fields["Task ID"]!);
  if (taskId !== headingId) {
    return {
      ok: false,
      error: `task ${headingId}: Task ID field '${taskId}' does not match heading`,
    };
  }

  const statusRaw = stripMarkdownDecor(fields["Status"]!);
  const status = normalizeStatus(statusRaw);
  if (status === "UNKNOWN") {
    return {
      ok: false,
      error: `task ${headingId}: unrecognized Status '${statusRaw}'`,
    };
  }

  const dependencies = parseDependencies(
    stripMarkdownDecor(fields["Dependencies"]!),
  );

  const task: RegistryTask = {
    id: taskId,
    title,
    statusRaw,
    status,
    dependencies,
    acceptanceCriteria: stripMarkdownDecor(fields["Acceptance Criteria"]!),
    testRequirement: stripMarkdownDecor(fields["Test Requirement"]!),
    // Evidence row optional until Commit; model always exposes the field.
    evidence: stripMarkdownDecor(fields["Evidence"] ?? ""),
  };

  if (fields["Objective"]) {
    task.objective = stripMarkdownDecor(fields["Objective"]);
  }
  if (fields["Expected output"]) {
    task.expectedOutput = stripMarkdownDecor(fields["Expected output"]);
  }

  return { ok: true, task };
}

function parseFieldTable(block: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const lines = block.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(
      /^\|\s*\*\*(.+?)\*\*\s*\|\s*(.*?)\s*\|\s*$/,
    );
    if (!m) continue;
    const key = m[1]!.trim();
    const value = m[2]!.trim();
    if (/^-+$/.test(key) || key.toLowerCase() === "field") continue;
    fields[key] = value;
  }
  return fields;
}

function parseDependencies(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed || /^none\b/i.test(trimmed)) return [];
  const ids = trimmed.match(/\b([A-Z][A-Z0-9]*-[A-Z0-9]+)\b/g);
  return ids ? [...new Set(ids)] : [];
}

function normalizeStatus(raw: string): TaskStatusToken {
  const upper = raw.toUpperCase();
  for (const token of STATUS_TOKENS) {
    if (upper.includes(token)) return token;
  }
  return "UNKNOWN";
}

function stripMarkdownDecor(value: string): string {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
