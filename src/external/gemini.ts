import { env, geminiModel } from "../env.js";
import { PersonalBrainError } from "../workspace.js";

export async function geminiGenerate(prompt: string, maxTokens = 1024): Promise<string> {
  const key = env("GEMINI_API_KEY");
  if (!key) throw new PersonalBrainError("GEMINI_API_KEY not configured");
  const model = geminiModel();
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
      signal: AbortSignal.timeout(60_000),
    },
  );
  if (!res.ok) {
    throw new PersonalBrainError(`Gemini HTTP ${res.status}`);
  }
  const body = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new PersonalBrainError("Gemini empty response");
  return text.trim();
}

export async function geminiExtractAndSummarize(input: {
  titleHint: string;
  body: string;
  sourceUrl?: string;
}): Promise<{ title: string; summary: string; tags: string[]; markdownBody: string }> {
  const prompt = `You are a personal knowledge assistant. Extract a clean title, short summary, 3-6 tags, and a markdown body from the capture.
Return STRICT JSON only with keys: title, summary, tags (string array), markdownBody.
Source URL: ${input.sourceUrl ?? "(none)"}
Title hint: ${input.titleHint}
Content:
---
${input.body.slice(0, 12000)}
---`;
  const raw = await geminiGenerate(prompt, 2048);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      title: input.titleHint || "Untitled",
      summary: input.body.slice(0, 240),
      tags: ["uncategorized"],
      markdownBody: `# ${input.titleHint}\n\n${input.body}`,
    };
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      title?: string;
      summary?: string;
      tags?: string[];
      markdownBody?: string;
    };
    return {
      title: (parsed.title ?? input.titleHint).trim() || "Untitled",
      summary: (parsed.summary ?? "").trim() || input.body.slice(0, 240),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map(String).slice(0, 8)
        : ["uncategorized"],
      markdownBody:
        (parsed.markdownBody ?? "").trim() ||
        `# ${parsed.title ?? input.titleHint}\n\n${input.body}`,
    };
  } catch {
    return {
      title: input.titleHint || "Untitled",
      summary: input.body.slice(0, 240),
      tags: ["uncategorized"],
      markdownBody: `# ${input.titleHint}\n\n${input.body}`,
    };
  }
}

export async function geminiAskGrounded(input: {
  question: string;
  contexts: { id: string; title: string; excerpt: string }[];
}): Promise<string> {
  const ctx = input.contexts
    .map((c, i) => `[${i + 1}] id=${c.id} title=${c.title}\n${c.excerpt}`)
    .join("\n\n");
  const prompt = `Answer the user question using ONLY the provided personal knowledge contexts.
Cite knowledge ids in square brackets like [id].
If insufficient context, say you do not know from personal knowledge.

Question: ${input.question}

Contexts:
${ctx || "(none)"}`;
  return geminiGenerate(prompt, 1024);
}
