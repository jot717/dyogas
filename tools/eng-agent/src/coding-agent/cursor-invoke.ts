/**
 * Cursor SDK invoker — real Agent.prompt (local runtime).
 * API key resolution: explicit arg → CURSOR_API_KEY env → .env.local fallback.
 * Secrets are never written or committed by this module.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { CodingAgentInvoker } from "./types.js";

export const DEFAULT_MODEL_ID = "composer-2.5";

/**
 * Default invoker using @cursor/sdk Agent.prompt.
 */
export const cursorSdkInvoker: CodingAgentInvoker = async ({
  prompt,
  cwd,
  apiKey,
  modelId,
}) => {
  const { Agent } = await import("@cursor/sdk");
  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: modelId },
    local: { cwd },
  });
  return {
    status: String(result.status ?? "unknown"),
    resultText:
      typeof result.result === "string"
        ? result.result
        : result.result != null
          ? JSON.stringify(result.result)
          : undefined,
    agentId:
      "agentId" in result
        ? String((result as { agentId?: string }).agentId ?? "")
        : undefined,
    runId:
      "id" in result
        ? String((result as { id?: string }).id ?? "")
        : undefined,
  };
};

/** Parse KEY=VALUE lines from a dotenv-style file (no export, no quotes handling beyond trim). */
function readEnvFileKey(filePath: string, key: string): string | null {
  if (!existsSync(filePath)) return null;
  try {
    const text = readFileSync(filePath, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const k = line.slice(0, eq).trim();
      if (k !== key) continue;
      let v = line.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      return v.length > 0 ? v : null;
    }
  } catch {
    return null;
  }
  return null;
}

/** Candidate .env.local locations, nearest-first. */
export function envLocalCandidates(workspaceRoot?: string): string[] {
  const roots: string[] = [];
  if (workspaceRoot) {
    roots.push(
      join(workspaceRoot, "tools", "eng-agent", ".env.local"),
      join(workspaceRoot, ".env.local"),
    );
  }
  roots.push(join(process.cwd(), ".env.local"));
  return [...new Set(roots)];
}

/**
 * Resolve the Cursor API key.
 * Order: explicit → CURSOR_API_KEY env → .env.local (tools/eng-agent, workspace root, cwd).
 * Returns null when unavailable — callers must fail closed (no mock execution).
 */
export function resolveApiKey(
  explicit?: string,
  workspaceRoot?: string,
): string | null {
  const direct = (explicit ?? process.env.CURSOR_API_KEY ?? "").trim();
  if (direct.length > 0) return direct;

  for (const candidate of envLocalCandidates(workspaceRoot)) {
    const fromFile = readEnvFileKey(candidate, "CURSOR_API_KEY");
    if (fromFile) return fromFile;
  }
  return null;
}
