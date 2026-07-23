import { env, supabaseUrl } from "../env.js";

export interface SupabaseConfig {
  readonly url: string;
  readonly anonKey: string;
  readonly serviceKey: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = supabaseUrl();
  const anonKey = env("SUPABASE_ANON_KEY");
  const serviceKey = env("SUPABASE_SERVICE_KEY");
  if (!url || !anonKey || !serviceKey) return null;
  return { url, anonKey, serviceKey };
}

/** Best-effort upsert; never throws to callers (file store is SoR of truth for MVP). */
export async function supabaseUpsert(
  table: string,
  row: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const cfg = getSupabaseConfig();
  if (!cfg) return { ok: false, error: "supabase not configured" };
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: cfg.serviceKey,
        Authorization: `Bearer ${cfg.serviceKey}`,
        "content-type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(row),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}
