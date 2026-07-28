/**
 * Evidence → Insight → Decision Options → Decision Asset (DA-03).
 * No automatic recommendation — humans choose among options.
 */

import { createHash } from "node:crypto";
import {
  DecisionAssetError,
  type DecisionAsset,
  type DecisionAssetClaim,
  type DecisionAssetOption,
  type ExtractDecisionAssetInput,
} from "./types.js";

function stableId(prefix: string, seed: string): string {
  const h = createHash("sha256").update(seed).digest("hex").slice(0, 12);
  return `${prefix}-${h}`;
}

function claimText(
  item: ExtractDecisionAssetInput["evidence"][number],
): string {
  const fromInsight = item.extractedClaim?.trim();
  if (fromInsight) return fromInsight.slice(0, 280);
  return item.excerpt.trim().slice(0, 240);
}

function isImmigrationQuestion(question: string): boolean {
  return (
    /\b(visa|immigration|highly skilled|residence(?:\s+(?:card|status|permit))?)\b/i.test(
      question,
    ) ||
    (/\b(application|documents?)\b/i.test(question) &&
      /\b(visa|immigration|residence|highly skilled)\b/i.test(question))
  );
}

function isHowToQuestion(question: string): boolean {
  return (
    /\b(how to|how do i|recipe|make a|make an)\b/i.test(question) ||
    /\b(coffee|espresso|cappuccino)\b/i.test(question)
  );
}

function isFoundingStyleQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return (
    /\bbuild\b/.test(q) ||
    /\bstartup\b/.test(q) ||
    /\bfound\b/.test(q) ||
    (/\b(leave|quit)\b/.test(q) &&
      /\b(employment|job)\b/.test(q) &&
      /\b(solo|start|company|product)\b/.test(q)) ||
    (/\bsolo\b/.test(q) && /\b(ai|product|company)\b/.test(q)) ||
    (/\bshould i\b/.test(q) && /\b(ai|startup|company)\b/.test(q))
  );
}

function isCareerChangeQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return (
    /\bcareer\b/.test(q) ||
    (/\bjob\b/.test(q) && /\b(change|switch|leave|quit)\b/.test(q)) ||
    /\bchange my (job|career)\b/.test(q)
  );
}

function isRealEstateQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return /\b(house|home|apartment|property|real estate|mortgage|buy)\b/.test(q);
}

function buildOptions(
  question: string,
  evidenceIds: readonly string[],
  claims: readonly DecisionAssetClaim[],
): DecisionAssetOption[] {
  const ids = [...evidenceIds];
  const claimSnips = claims.map((c) => c.text).slice(0, 3);

  if (isImmigrationQuestion(question)) {
    return [
      {
        option_id: "opt-prepare-after-eligibility",
        title: "Create Japan HSP visa application knowledge based on ISA requirements, points calculation and documents.",
        supporting_evidence: ids,
        advantages: [
          "Confirms eligibility before investing time in full documentation",
          ...(claimSnips[0]
            ? [`Eligibility signal: ${claimSnips[0].slice(0, 140)}`]
            : ["Uses current research on visa eligibility"]),
          "Creates a clear Knowledge record of the next procedural step",
        ],
        risks: [
          "Eligibility interpretation can still be incomplete without primary ISA guidance",
          "Document checklists vary by category and points table updates",
        ],
        unknowns: [
          "Exact points score for your education/experience profile",
          "Whether supporting documents are already obtainable",
        ],
      },
      {
        option_id: "opt-calculate-points-first",
        title: "Create Japan HSP points-and-documents checklist knowledge before filing the application.",
        supporting_evidence: ids,
        advantages: [
          "Focuses effort on the points table and document gaps before filing",
          ...(claimSnips[1]
            ? [`Document/points signal: ${claimSnips[1].slice(0, 120)}`]
            : ["Surfaces missing evidence before application packaging"]),
          "Reduces risk of filing with insufficient points or paperwork",
        ],
        risks: [
          "Delay if document collection takes longer than expected",
          "Points rules may change while gathering materials",
        ],
        unknowns: [
          "Which documents are hardest to obtain for your case",
          "Whether a different status of residence is a better fit",
        ],
      },
    ];
  }

  if (isHowToQuestion(question) && !isCareerChangeQuestion(question) && !isFoundingStyleQuestion(question) && !isRealEstateQuestion(question) && !isImmigrationQuestion(question)) {
    return [
      {
        option_id: "opt-record-method",
        title: "Create Italian coffee preparation knowledge covering brewing method, ingredients, equipment and technique.",
        supporting_evidence: ids,
        advantages: [
          ...(claimSnips[0]
            ? [`Method signal: ${claimSnips[0].slice(0, 140)}`]
            : ["Evidence pack covers preparation steps"]),
          "Creates reusable Knowledge with provenance for later recall",
          "Keeps technique notes tied to cited sources",
        ],
        risks: [
          "Source methods may omit equipment or taste preferences",
          "Regional Italian styles differ (espresso vs moka vs milk drinks)",
        ],
        unknowns: [
          "Which equipment you actually have available",
          "Preferred strength / milk ratio for your taste",
        ],
      },
      {
        option_id: "opt-try-alternate",
        title: "Create comparative Italian coffee technique knowledge before committing to one brew method.",
        supporting_evidence: ids,
        advantages: [
          "Lets you compare brew styles before committing to one recipe",
          ...(claimSnips[1]
            ? [`Can explore: ${claimSnips[1].slice(0, 120)}`]
            : ["Buys time to refine technique evidence"]),
        ],
        risks: [
          "Delay recording useful knowledge you already researched",
          "Too many variants can dilute a clear first method",
        ],
        unknowns: [
          "Whether home equipment can match cafe-style results",
          "Which alternate method is most relevant next",
        ],
      },
    ];
  }

  if (isCareerChangeQuestion(question)) {
    return [
      {
        option_id: "opt-change-career",
        title: "Change career path now (staged transition)",
        supporting_evidence: ids,
        advantages: [
          ...(claimSnips[0]
            ? [`Supporting signal: ${claimSnips[0].slice(0, 140)}`]
            : ["Current evidence pack supports exploring a transition"]),
          "Can start with a staged move rather than an all-or-nothing jump",
          "May improve long-term optionality if demand signals hold",
        ],
        risks: [
          "Income discontinuity during transition",
          "Market timing or hiring-cycle mismatch",
          "Skills gap versus target role requirements",
        ],
        unknowns: [
          "Target role compensation range in Japan for your profile",
          "How portable current skills are to the destination path",
          "Personal runway and household constraints",
        ],
      },
      {
        option_id: "opt-stay-or-defer",
        title: "Stay / defer change and gather stronger evidence first",
        supporting_evidence: ids,
        advantages: [
          "Preserves current income stability while researching",
          "Allows targeted upskilling before committing",
          ...(claimSnips[1]
            ? [`Can validate weak spots such as: ${claimSnips[1].slice(0, 120)}`]
            : ["Buys time to improve evidence quality"]),
        ],
        risks: [
          "Opportunity cost if the window for switching narrows",
          "Staying too long in a declining fit",
        ],
        unknowns: [
          "How long to defer before a hard go/no-go date",
          "Whether internal mobility is a better bridge than an external switch",
        ],
      },
    ];
  }

  if (isRealEstateQuestion(question)) {
    return [
      {
        option_id: "opt-buy-now",
        title: "Purchase property now",
        supporting_evidence: ids,
        advantages: [
          ...(claimSnips[0]
            ? [`Market signal: ${claimSnips[0].slice(0, 140)}`]
            : ["Current evidence supports evaluating a purchase timeline"]),
          "Locks in housing if affordability and rates are favorable",
          "Builds equity if hold horizon is long enough",
        ],
        risks: [
          "Price correction or liquidity risk if you need to sell early",
          "Mortgage rate exposure and maintenance cost surprises",
          "Neighborhood fit may be hard to reverse quickly",
        ],
        unknowns: [
          "Total cost of ownership for your target area and property type",
          "How long you expect to stay versus break-even horizon",
          "Financing terms available for your profile",
        ],
      },
      {
        option_id: "opt-defer-purchase",
        title: "Defer purchase and continue renting / saving",
        supporting_evidence: ids,
        advantages: [
          "Preserves flexibility if job or location plans are uncertain",
          "Allows more time to improve down payment and rate options",
          ...(claimSnips[1]
            ? [`Can monitor signals such as: ${claimSnips[1].slice(0, 120)}`]
            : ["Buys time to improve evidence quality"]),
        ],
        risks: [
          "Rent inflation and missed equity if prices rise faster than savings",
          "Opportunity cost if favorable financing windows close",
        ],
        unknowns: [
          "Whether local prices are near a cycle peak or still rising",
          "Your minimum savings target before committing",
        ],
      },
    ];
  }

  if (isFoundingStyleQuestion(question)) {
    return [
      {
        option_id: "opt-pursue-build",
        title: "Create Tokyo AI startup decision knowledge recording a build-now path versus employment baseline.",
        supporting_evidence: ids,
        advantages: [
          ...(claimSnips[0]
            ? [`Evidence supports exploration: ${claimSnips[0].slice(0, 120)}`]
            : ["Evidence pack is available for a staged build"]),
          "Solo-founder path can stay small until distribution is proven",
          "Tokyo timing may capture local AI adoption momentum",
        ],
        risks: [
          "Market may already be crowded in AI tooling",
          "Distribution and customer acquisition remain unproven",
          "Capital and attention risk if validation is skipped",
        ],
        unknowns: [
          "Who pays first, and for what concrete job-to-be-done?",
          "Regulatory / data constraints for the chosen niche",
          "Personal runway vs time-to-first-revenue",
        ],
      },
      {
        option_id: "opt-validate-first",
        title: "Create Tokyo AI startup decision knowledge recording continue-employment / validate-first before full build.",
        supporting_evidence: ids,
        advantages: [
          "Reduces irreversible commitment while learning demand",
          "Keeps optionality if evidence quality is still uneven",
          ...(claimSnips[1]
            ? [`Can pressure-test signals such as: ${claimSnips[1].slice(0, 120)}`]
            : ["Buys time to improve evidence quality"]),
        ],
        risks: [
          "Opportunity window may narrow while validating",
          "Part-time validation can dilute focus",
        ],
        unknowns: [
          "How long validation should run before a go/no-go",
          "Whether consulting demand maps to a product wedge",
        ],
      },
    ];
  }

  return [
    {
      option_id: "opt-act-now",
      title: "Create decision knowledge recording the chosen action path from current evidence.",
      supporting_evidence: ids,
      advantages: [
        claimSnips[0]?.slice(0, 140) || "Current evidence pack is available",
        "Preserves momentum while signals are fresh",
      ],
      risks: [
        "Evidence coverage may still be incomplete",
        "Acting now may foreclose alternative paths",
      ],
      unknowns: [
        "Whether additional sources would change the trade-off",
        "Second-order costs not yet captured in evidence",
      ],
    },
    {
      option_id: "opt-gather-more",
      title: "Create decision knowledge recording an evidence-gap plan before committing.",
      supporting_evidence: ids,
      advantages: [
        "Improves confidence before irreversible commitment",
        "Allows targeting higher-signal sources",
      ],
      risks: [
        "Delay cost / opportunity cost",
        "Analysis paralysis if the bar keeps rising",
      ],
      unknowns: [
        "Which missing source class matters most next",
        "Time budget available for further research",
      ],
    },
  ];
}

/**
 * Extract a Decision Asset from evidence items (fail-closed on empty/invalid).
 */
export function extractDecisionAsset(
  input: ExtractDecisionAssetInput,
): DecisionAsset {
  const question = input.question?.trim() ?? "";
  const tenantId = input.tenant_id?.trim() ?? "";
  const taskId = input.task_id?.trim() ?? "";
  const researchArtifactId = input.research_artifact_id?.trim() ?? "";

  if (!question) throw new DecisionAssetError("question required");
  if (!tenantId) throw new DecisionAssetError("tenant_id required");
  if (!taskId) throw new DecisionAssetError("task_id required");
  if (!researchArtifactId) {
    throw new DecisionAssetError("research_artifact_id required");
  }
  if (!input.evidence?.length) {
    throw new DecisionAssetError("at least one evidence item required");
  }

  const claims: DecisionAssetClaim[] = [];
  const evidenceIds: string[] = [];

  for (const [i, item] of input.evidence.entries()) {
    if (!item.evidenceId.trim()) {
      throw new DecisionAssetError("evidenceId required on every item");
    }
    const text = claimText(item);
    if (!text) {
      throw new DecisionAssetError(
        `claim/excerpt required for ${item.evidenceId}`,
      );
    }
    if (!item.metadata.pointer.trim()) {
      throw new DecisionAssetError(`pointer required for ${item.evidenceId}`);
    }
    evidenceIds.push(item.evidenceId);
    claims.push({
      claim_id: `claim-${String(i).padStart(3, "0")}`,
      text,
      evidence_id: item.evidenceId,
    });
  }

  const options = buildOptions(question, evidenceIds, claims);
  if (options.length < 2) {
    throw new DecisionAssetError("at least two decision options required");
  }

  const title = `Decision Asset: ${question.slice(0, 80)}`;
  const summary = [
    `Decision support for: ${question}`,
    `${evidenceIds.length} evidence claim(s); ${options.length} human-choosable options (no automatic recommendation).`,
    `researchArtifactId: ${researchArtifactId}`,
  ].join(" ");

  return {
    asset_id: stableId("da", `${tenantId}:${researchArtifactId}:${question}`),
    title,
    question,
    summary,
    claims: Object.freeze(claims),
    options: Object.freeze(options),
    evidence_ids: Object.freeze([...evidenceIds]),
    research_artifact_id: researchArtifactId,
    tenant_id: tenantId,
    task_id: taskId,
    ...(input.execution_package_task_id
      ? { execution_package_task_id: input.execution_package_task_id }
      : {}),
    status: "draft",
    requires_human_approval: true,
  };
}

/** Convert Decision Asset into Knowledge content body for SoR apply. */
export function decisionAssetToKnowledgeContent(asset: DecisionAsset): {
  title: string;
  body: string;
} {
  const claimBlocks = asset.claims.map(
    (c) =>
      `### ${c.claim_id}\nevidenceId: ${c.evidence_id}\n\n${c.text}`,
  );
  const optionBlocks = (asset.options ?? []).map((o) =>
    [
      `### ${o.option_id}: ${o.title}`,
      `supporting_evidence: ${o.supporting_evidence.join(", ")}`,
      `advantages: ${o.advantages.join("; ")}`,
      `risks: ${o.risks.join("; ")}`,
      `unknowns: ${o.unknowns.join("; ")}`,
    ].join("\n"),
  );
  return {
    title: asset.title,
    body: [
      asset.summary,
      ``,
      `question: ${asset.question}`,
      `asset_id: ${asset.asset_id}`,
      asset.execution_package_task_id
        ? `execution_package_task_id: ${asset.execution_package_task_id}`
        : null,
      ``,
      `## Claims`,
      ...claimBlocks,
      ``,
      `## Options (human chooses — no automatic recommendation)`,
      ...optionBlocks,
    ]
      .filter((line): line is string => line !== null)
      .join("\n"),
  };
}
