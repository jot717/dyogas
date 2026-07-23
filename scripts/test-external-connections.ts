/**
 * Verify external service connectivity for Personal Brain MVP.
 * Never prints secret values — only service names and error summaries.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_LOCAL = resolve(ROOT, ".env.local");
const REPORT_PATH = resolve(ROOT, "docs/EXTERNAL_CONNECTION_REPORT.md");

type ServiceResult = {
  service: string;
  result: "PASS" | "FAIL";
  errorSummary: string;
};

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

function env(fileVars: Map<string, string>, key: string): string {
  const fromFile = fileVars.get(key);
  const fromProcess = process.env[key];
  return ((fromFile !== undefined ? fromFile : fromProcess) ?? "").trim();
}

/** Project root URL (strip /rest/v1 and trailing slash). */
function normalizeSupabaseUrl(raw: string): string {
  let u = raw.trim();
  u = u.replace(/\/rest\/v1\/?$/i, "");
  u = u.replace(/\/$/, "");
  return u;
}

async function testSupabase(fileVars: Map<string, string>): Promise<ServiceResult> {
  const service = "Supabase";
  const urlRaw = env(fileVars, "SUPABASE_URL");
  const anon = env(fileVars, "SUPABASE_ANON_KEY");
  if (!urlRaw || !anon) {
    return {
      service,
      result: "FAIL",
      errorSummary: "SUPABASE_URL or SUPABASE_ANON_KEY missing",
    };
  }
  const base = normalizeSupabaseUrl(urlRaw);
  try {
    const res = await fetch(`${base}/auth/v1/health`, {
      method: "GET",
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      return {
        service,
        result: "FAIL",
        errorSummary: `auth health HTTP ${res.status}`,
      };
    }
    return { service, result: "PASS", errorSummary: "" };
  } catch (err) {
    return {
      service,
      result: "FAIL",
      errorSummary: err instanceof Error ? err.message : "network error",
    };
  }
}

async function testGemini(fileVars: Map<string, string>): Promise<ServiceResult> {
  const service = "Gemini";
  const key = env(fileVars, "GEMINI_API_KEY");
  const model = env(fileVars, "GEMINI_MODEL") || "gemini-3.5-flash";
  if (!key) {
    return { service, result: "FAIL", errorSummary: "GEMINI_API_KEY missing" };
  }
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Reply with exactly: ok" }] }],
        generationConfig: { maxOutputTokens: 8 },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      let summary = `HTTP ${res.status}`;
      try {
        const body = (await res.json()) as { error?: { message?: string; status?: string } };
        if (body.error?.status) summary += ` ${body.error.status}`;
        else if (body.error?.message) {
          // redact any accidental key fragments
          summary += ` ${body.error.message.replace(/key=[^&\s]+/gi, "key=REDACTED").slice(0, 120)}`;
        }
      } catch {
        /* ignore */
      }
      return { service, result: "FAIL", errorSummary: summary };
    }
    return { service, result: "PASS", errorSummary: "" };
  } catch (err) {
    return {
      service,
      result: "FAIL",
      errorSummary: err instanceof Error ? err.message : "network error",
    };
  }
}

async function testJina(fileVars: Map<string, string>): Promise<ServiceResult> {
  const service = "Jina Reader";
  const key = env(fileVars, "JINA_API_KEY");
  if (!key) {
    return { service, result: "FAIL", errorSummary: "JINA_API_KEY missing" };
  }
  try {
    const res = await fetch("https://r.jina.ai/https://example.com", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "text/plain",
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      return {
        service,
        result: "FAIL",
        errorSummary: `HTTP ${res.status}`,
      };
    }
    const text = await res.text();
    if (!text.trim()) {
      return { service, result: "FAIL", errorSummary: "empty reader response" };
    }
    return { service, result: "PASS", errorSummary: "" };
  } catch (err) {
    return {
      service,
      result: "FAIL",
      errorSummary: err instanceof Error ? err.message : "network error",
    };
  }
}

function writeReport(results: ServiceResult[], overall: "PASS" | "FAIL"): void {
  const ts = new Date().toISOString();
  const rows = results
    .map(
      (r) =>
        `| ${r.service} | ${r.result} | ${ts} | ${r.errorSummary || "—"} |`,
    )
    .join("\n");
  const md = `# External Connection Report — MOD-PERSONAL-BRAIN

**Generated:** ${ts}  
**Overall:** **${overall}**  
**Script:** \`npm run test-external-connections\`  
**Note:** Secret values are never recorded in this report.

| Service | Test result | Timestamp | Error summary |
|---------|-------------|-----------|---------------|
${rows}

## Notes

- Supabase: \`GET {SUPABASE_URL}/auth/v1/health\` (URL normalized; strips trailing \`/rest/v1\`).
- Gemini: minimal \`generateContent\` with \`GEMINI_MODEL\` (default \`gemini-3.5-flash\`).
- Jina: Reader fetch of \`https://example.com\` with Bearer auth.
`;
  writeFileSync(REPORT_PATH, md, "utf8");
}

async function main(): Promise<void> {
  const fileVars = parseEnvFile(ENV_LOCAL);
  console.log("personal-brain external connection test");
  console.log(
    `env file: ${existsSync(ENV_LOCAL) ? ".env.local (found)" : ".env.local (missing)"}`,
  );

  const results: ServiceResult[] = [];
  for (const test of [testSupabase, testGemini, testJina]) {
    const r = await test(fileVars);
    results.push(r);
    const detail = r.errorSummary ? ` — ${r.errorSummary}` : "";
    console.log(`${r.service}: ${r.result}${detail}`);
  }

  const overall = results.every((r) => r.result === "PASS") ? "PASS" : "FAIL";
  writeReport(results, overall);
  console.log(`overall: ${overall}`);
  console.log(`report: docs/EXTERNAL_CONNECTION_REPORT.md`);
  process.exit(overall === "PASS" ? 0 : 1);
}

main().catch((err) => {
  console.error(
    "fatal:",
    err instanceof Error ? err.message : "unknown error",
  );
  process.exit(1);
});
