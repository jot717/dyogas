import { generateId, getClock } from "@dyogas/kernel";

export type CaptureKind = "text" | "url";

export interface SourceMetadata {
  readonly kind: CaptureKind;
  readonly capturedAt: string;
  readonly url?: string;
  readonly titleHint?: string;
}

export interface CaptureInput {
  readonly kind: CaptureKind;
  /** Required for text; optional note for url. */
  readonly text?: string;
  /** Required for url — stored as metadata only; no network fetch. */
  readonly url?: string;
  readonly title?: string;
}

export interface NormalizedCapture {
  readonly captureId: string;
  readonly title: string;
  readonly body: string;
  readonly source: SourceMetadata;
  readonly evidenceId: string;
}

export function normalizeCapture(input: CaptureInput): NormalizedCapture {
  const capturedAt = getClock().nowIso();
  const captureId = generateId();
  const evidenceId = `cap-${captureId}`;

  if (input.kind === "text") {
    const body = (input.text ?? "").trim();
    if (!body) throw new Error("text capture requires non-empty text");
    const title = (input.title ?? body.slice(0, 48)).trim() || "Untitled note";
    return {
      captureId,
      title,
      body,
      evidenceId,
      source: { kind: "text", capturedAt, titleHint: title },
    };
  }

  if (input.kind === "url") {
    const url = (input.url ?? "").trim();
    if (!url) throw new Error("url capture requires url");
    if (!/^https?:\/\//i.test(url) && !/^urn:/i.test(url)) {
      throw new Error("url must be http(s) or urn");
    }
    const note = (input.text ?? "").trim();
    const title = (input.title ?? url).trim();
    const body = note
      ? `Source URL: ${url}\n\n${note}`
      : `Source URL: ${url}\n\n(No fetch performed — URL metadata capture only.)`;
    return {
      captureId,
      title,
      body,
      evidenceId,
      source: { kind: "url", capturedAt, url, titleHint: title },
    };
  }

  throw new Error(`unknown capture kind`);
}
