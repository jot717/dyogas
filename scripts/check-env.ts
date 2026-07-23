/**
 * Validate personal-brain env for MVP external setup.
 * Never prints secret values — only variable names.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_LOCAL = resolve(ROOT, ".env.local");

const REQUIRED = [
  "NODE_ENV",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_KEY",
  "GEMINI_API_KEY",
  "JINA_API_KEY",
] as const;

const OPTIONAL = ["YOUTUBE_API_KEY"] as const;

function parseEnvFile(path: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(path)) return map;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    map.set(key, value);
  }
  return map;
}

function main(): void {
  const fileVars = parseEnvFile(ENV_LOCAL);
  const missing: string[] = [];
  const present: string[] = [];
  const optionalEmpty: string[] = [];

  for (const key of REQUIRED) {
    const fromFile = fileVars.get(key);
    const fromProcess = process.env[key];
    const value = (fromFile !== undefined ? fromFile : fromProcess) ?? "";
    if (!value.trim()) missing.push(key);
    else present.push(key);
  }

  for (const key of OPTIONAL) {
    const fromFile = fileVars.get(key);
    const fromProcess = process.env[key];
    const value = (fromFile !== undefined ? fromFile : fromProcess) ?? "";
    if (!value.trim()) optionalEmpty.push(key);
  }

  console.log("personal-brain env check");
  console.log(`env file: ${existsSync(ENV_LOCAL) ? ".env.local (found)" : ".env.local (missing)"}`);
  console.log(`required present: ${present.length}/${REQUIRED.length}`);
  if (present.length) {
    console.log(`  ok: ${present.join(", ")}`);
  }
  if (missing.length) {
    console.log(`required missing/empty: ${missing.join(", ")}`);
  }
  if (optionalEmpty.length) {
    console.log(`optional unset: ${optionalEmpty.join(", ")}`);
  }

  if (missing.length > 0) {
    console.log("status: FAIL (fill personal-brain/.env.local — values are never printed)");
    process.exit(1);
  }

  console.log("status: PASS");
  process.exit(0);
}

main();
