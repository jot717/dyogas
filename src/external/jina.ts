import { env } from "../env.js";
import { PersonalBrainError } from "../workspace.js";

/** Fetch clean text/markdown for a URL via Jina Reader. */
export async function jinaReadUrl(url: string): Promise<string> {
  const key = env("JINA_API_KEY");
  if (!key) throw new PersonalBrainError("JINA_API_KEY not configured");
  const target = url.trim();
  if (!/^https?:\/\//i.test(target)) {
    throw new PersonalBrainError("url must be http(s)");
  }
  const res = await fetch(`https://r.jina.ai/${target}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: "text/plain",
    },
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) throw new PersonalBrainError(`Jina HTTP ${res.status}`);
  const text = (await res.text()).trim();
  if (!text) throw new PersonalBrainError("Jina empty response");
  return text;
}
