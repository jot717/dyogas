/**
 * Validate ResearchReport candidate against existing schema rules
 * (schemas/artifacts/research-report.schema.json) — no schema edits.
 */

const SOURCE_CLASSES = new Set([
  "youtube",
  "github",
  "reddit",
  "web",
  "other",
]);
const SIGNAL_TIERS = new Set(["primary", "secondary", "community", "unknown"]);

export type SchemaValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly errors: readonly string[] };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Fail-closed structural validation matching research-report.schema.json
 * required fields + enums + additionalProperties: false.
 */
export function validateResearchReportCandidate(
  payload: unknown,
): SchemaValidationResult {
  const errors: string[] = [];
  if (!isPlainObject(payload)) {
    return { ok: false, errors: ["payload must be an object"] };
  }

  const allowedTop = new Set([
    "brief_ref",
    "evidence_items",
    "coverage_gaps",
    "open_questions",
  ]);
  for (const key of Object.keys(payload)) {
    if (!allowedTop.has(key)) errors.push(`additional property: ${key}`);
  }
  for (const req of allowedTop) {
    if (!(req in payload)) errors.push(`missing required: ${req}`);
  }

  const briefRef = payload.brief_ref;
  if (!isPlainObject(briefRef)) {
    errors.push("brief_ref must be an object");
  } else {
    for (const key of Object.keys(briefRef)) {
      if (key !== "brief_id" && key !== "question") {
        errors.push(`brief_ref additional property: ${key}`);
      }
    }
    if (typeof briefRef.brief_id !== "string" || !briefRef.brief_id.trim()) {
      errors.push("brief_ref.brief_id required string");
    }
    if (
      "question" in briefRef &&
      typeof briefRef.question !== "string"
    ) {
      errors.push("brief_ref.question must be string when present");
    }
  }

  if (!Array.isArray(payload.evidence_items)) {
    errors.push("evidence_items must be an array");
  } else {
    payload.evidence_items.forEach((item, i) => {
      if (!isPlainObject(item)) {
        errors.push(`evidence_items[${i}] must be object`);
        return;
      }
      const allowedItem = new Set([
        "evidence_id",
        "source_class",
        "title",
        "excerpt",
        "provenance",
        "signal_tier",
      ]);
      for (const key of Object.keys(item)) {
        if (!allowedItem.has(key)) {
          errors.push(`evidence_items[${i}] additional property: ${key}`);
        }
      }
      if (typeof item.evidence_id !== "string" || !item.evidence_id.trim()) {
        errors.push(`evidence_items[${i}].evidence_id required`);
      }
      if (
        typeof item.source_class !== "string" ||
        !SOURCE_CLASSES.has(item.source_class)
      ) {
        errors.push(`evidence_items[${i}].source_class invalid`);
      }
      if (!isPlainObject(item.provenance)) {
        errors.push(`evidence_items[${i}].provenance required object`);
      } else {
        for (const key of Object.keys(item.provenance)) {
          if (key !== "pointer" && key !== "retrieved_at") {
            errors.push(
              `evidence_items[${i}].provenance additional property: ${key}`,
            );
          }
        }
        if (
          typeof item.provenance.pointer !== "string" ||
          !item.provenance.pointer.trim()
        ) {
          errors.push(`evidence_items[${i}].provenance.pointer required`);
        }
      }
      if (
        "signal_tier" in item &&
        (typeof item.signal_tier !== "string" ||
          !SIGNAL_TIERS.has(item.signal_tier))
      ) {
        errors.push(`evidence_items[${i}].signal_tier invalid`);
      }
    });
  }

  if (!Array.isArray(payload.coverage_gaps)) {
    errors.push("coverage_gaps must be an array");
  } else if (!payload.coverage_gaps.every((g) => typeof g === "string")) {
    errors.push("coverage_gaps items must be strings");
  }

  if (!Array.isArray(payload.open_questions)) {
    errors.push("open_questions must be an array");
  } else if (!payload.open_questions.every((g) => typeof g === "string")) {
    errors.push("open_questions items must be strings");
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
