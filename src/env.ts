import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i <= 0) continue;
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}

let loaded = false;

/** Load `.env.local` into process.env (does not override existing). */
export function loadEnv(): void {
  if (loaded) return;
  loaded = true;
  const file = parseEnvFile(resolve(ROOT, ".env.local"));
  for (const [k, v] of Object.entries(file)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

export function env(key: string, fallback = ""): string {
  loadEnv();
  return (process.env[key] ?? fallback).trim();
}

export function dataDir(): string {
  return env("PERSONAL_BRAIN_DATA_DIR", resolve(ROOT, ".data"));
}

export function geminiModel(): string {
  return env("GEMINI_MODEL", "gemini-3.5-flash");
}

export function supabaseUrl(): string {
  return env("SUPABASE_URL").replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");
}

export function externalsConfigured(): boolean {
  return Boolean(
    env("GEMINI_API_KEY") && env("JINA_API_KEY") && supabaseUrl() && env("SUPABASE_ANON_KEY"),
  );
}
