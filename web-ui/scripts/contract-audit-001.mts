/**
 * SPRINT-DECISION-PRODUCT-CONTRACT-AUDIT-001
 * Live browser-path contract audit for CASE-001/002/003.
 * Proves Golden Path with real product server (not unit-test-only).
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { clear } from "@dyogas/kernel";
import {
  clearDecisionRequestSessions,
  assertRuntimeDecisionArtifactsExist,
  runtimeDecisionDir,
  resolveRepoRoot,
} from "@dyogas/personal-brain";
import { startDecisionProductServer } from "../src/index.js";

type CaseDef = {
  id: string;
  question: string;
  requestId: string;
  expectedDomain: string;
  forbiddenOptionPatterns: RegExp[];
  requiredOptionPatterns: RegExp[];
};

const CASES: CaseDef[] = [
  {
    id: "CASE-001",
    question: "how to apply japan highly skilled visa",
    requestId: "CONTRACT-AUDIT-CASE-001",
    expectedDomain: "japan_immigration",
    forbiddenOptionPatterns: [
      /^Record the researched method/i,
      /^Gather more evidence/i,
    ],
    requiredOptionPatterns: [
      /Japan HSP visa application knowledge/i,
      /points-and-documents checklist knowledge/i,
    ],
  },
  {
    id: "CASE-002",
    question:
      "Should I build an AI startup in Tokyo or continue employment?",
    requestId: "CONTRACT-AUDIT-CASE-002",
    expectedDomain: "startup_decision",
    forbiddenOptionPatterns: [
      /^Record the researched method/i,
      /^Gather more evidence before committing$/i,
    ],
    requiredOptionPatterns: [
      /Tokyo AI startup decision knowledge/i,
    ],
  },
  {
    id: "CASE-003",
    question: "how to make italian coffee",
    requestId: "CONTRACT-AUDIT-CASE-003",
    expectedDomain: "coffee_preparation",
    forbiddenOptionPatterns: [
      /^Record the researched method as Knowledge$/i,
      /^Gather more evidence/i,
    ],
    requiredOptionPatterns: [
      /Italian coffee preparation knowledge/i,
    ],
  },
];

type LayerResult = {
  layer: string;
  status: "PASS" | "FAIL";
  expected: string;
  actual: string;
  gap: string;
  fix: string;
};

function layer(
  name: string,
  ok: boolean,
  expected: string,
  actual: string,
  gap: string,
  fix: string,
): LayerResult {
  return {
    layer: name,
    status: ok ? "PASS" : "FAIL",
    expected,
    actual,
    gap: ok ? "none" : gap,
    fix: ok ? "none" : fix,
  };
}

async function runCase(
  base: string,
  c: CaseDef,
): Promise<{ layers: LayerResult[]; notes: string[] }> {
  const layers: LayerResult[] = [];
  const notes: string[] = [];

  await fetch(`${base}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user_id: `audit-${c.id.toLowerCase()}`,
      tenant_id: "validation-tokyo-2026",
    }),
  });

  const createdRes = await fetch(`${base}/decision/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      question: c.question,
      desired_outcome: `Contract audit ${c.id}`,
      request_id: c.requestId,
    }),
  });
  const createdText = await createdRes.text();
  if (createdRes.status !== 201) {
    return {
      layers: [
        layer(
          "Browser → Decision Request",
          false,
          "HTTP 201 create",
          `HTTP ${createdRes.status}: ${createdText.slice(0, 300)}`,
          "Create failed before path could be audited",
          "Investigate live research / quality gate for this question",
        ),
      ],
      notes: [createdText.slice(0, 500)],
    };
  }

  const created = JSON.parse(createdText) as {
    proposalId: string;
    status: string;
    host_status: string;
    autoApproved: boolean;
    stages_completed: string[];
    evidence_count: number;
    decision_brief?: {
      domain?: string;
      decision_domain?: string;
      user_goal?: string;
      research_factors?: string[];
      decision_factors?: string[];
      approval_question?: string;
      knowledge_preview?: string;
      proposed_knowledge_artifact?: string;
      key_findings?: string[];
      evidence_summary?: unknown[];
      decision_options?: Array<{ title: string; option_id: string }>;
      unknowns?: string[];
      confidence_level?: string;
      evidence_sources?: unknown[];
      missing_information?: string[];
      context?: string;
    };
    decision_asset?: {
      options?: Array<{ title: string }>;
    };
  };

  assertRuntimeDecisionArtifactsExist(c.requestId);
  const dir = runtimeDecisionDir(c.requestId);
  const A = JSON.parse(readFileSync(join(dir, "A-request.json"), "utf8"));
  const C = JSON.parse(readFileSync(join(dir, "C-research-input.json"), "utf8"));
  const D = JSON.parse(readFileSync(join(dir, "D-research-evidence.json"), "utf8"));
  const E = JSON.parse(readFileSync(join(dir, "E-decision-asset.json"), "utf8"));
  const F = JSON.parse(readFileSync(join(dir, "F-human-approval.json"), "utf8"));
  const R = JSON.parse(readFileSync(join(dir, "R-runtime-trace.json"), "utf8"));

  const domain =
    created.decision_brief?.domain ??
    created.decision_brief?.decision_domain ??
    C.research_plan?.domain;

  layers.push(
    layer(
      "1. Research Request artifact",
      domain === c.expectedDomain &&
        Array.isArray(C.research_plan?.research_factors) &&
        C.research_plan.research_factors.length >= 2 &&
        C.host_receives_research_plan === true,
      `domain=${c.expectedDomain}; factors; source requirements; constraints present`,
      `domain=${domain}; factors=${JSON.stringify(C.research_plan?.research_factors)}; goal=${C.research_plan?.goal}; constraints=${JSON.stringify(C.research_plan?.constraints)}; host_receives_research_plan=${C.host_receives_research_plan}`,
      "Research plan incomplete or wrong domain",
      "Fix domain router / C-research-input research_plan payload",
    ),
  );

  const sealedQ =
    typeof C.sealed_payload === "object"
      ? ""
      : String(
          (D.sealed_payload as { question?: string } | undefined)?.question ??
            "",
        );
  // Host question lives in bridge: plan annotation on intent. Check R path + plan flag.
  layers.push(
    layer(
      "2. Execution Host input",
      C.host_receives_research_plan === true &&
        Array.isArray(C.research_plan?.research_factors) &&
        C.research_plan.research_factors.length > 0,
      "Host receives Research Plan (domain/factors/queries), not only raw NL question",
      `host_receives_research_plan=${C.host_receives_research_plan}; plan_domain=${C.research_plan?.domain}; note=${C.research_plan?.source_requirements_note}`,
      "Host may only see raw question",
      "Ensure [decision-plan] annotation + C-research-input research_plan",
    ),
  );

  const pathOk =
    Array.isArray(R.path) &&
    R.path.join("→").includes("ResearchAgent") &&
    R.path.join("→").includes("DecisionAsset") &&
    R.path.join("→").includes("HumanApproval") &&
    R.waiting_human === true &&
    R.auto_approved === false;

  layers.push(
    layer(
      "3. Runtime trace",
      pathOk &&
        created.stages_completed?.includes("research") &&
        created.stages_completed?.includes("decision_asset") &&
        created.stages_completed?.includes("human_approval"),
      "Request → Research Agent → Evidence → Decision Asset → Human Gate",
      `path=${JSON.stringify(R.path)}; stages=${JSON.stringify(created.stages_completed)}; waiting_human=${R.waiting_human}`,
      "Runtime trace incomplete or auto-approved",
      "Repair R-runtime-trace / stages_completed emission",
    ),
  );

  const options =
    created.decision_brief?.decision_options ??
    created.decision_asset?.options ??
    E.options ??
    [];
  const titles = options.map((o: { title: string }) => o.title);
  const hasBad = titles.some((t: string) =>
    c.forbiddenOptionPatterns.some((re) => re.test(t)),
  );
  const hasGood = c.requiredOptionPatterns.every((re) =>
    titles.some((t: string) => re.test(t)),
  );
  const briefOk =
    (created.decision_brief?.key_findings?.length ?? 0) >= 1 &&
    (created.decision_brief?.evidence_summary?.length ?? 0) >= 1 &&
    (created.decision_brief?.unknowns?.length ?? 0) >= 1 &&
    Boolean(created.decision_brief?.proposed_knowledge_artifact) &&
    Boolean(created.decision_brief?.context);

  layers.push(
    layer(
      "4. Decision Asset / Brief output",
      !hasBad && hasGood && briefOk && options.length >= 2,
      "Answers 'what is human approving?' with context, findings, evidence, tradeoffs, unknowns, proposed knowledge; domain-specific options",
      `options=${JSON.stringify(titles)}; proposed=${created.decision_brief?.proposed_knowledge_artifact}; findings=${created.decision_brief?.key_findings?.length}; evidence_summary=${created.decision_brief?.evidence_summary?.length}; unknowns=${created.decision_brief?.unknowns?.length}`,
      hasBad
        ? "Generic options still present"
        : !hasGood
          ? "Domain-specific knowledge options missing"
          : "Brief missing required human-approval fields",
      "Update extract.ts / decision-brief domain options + proposed_knowledge_artifact",
    ),
  );

  const aq = created.decision_brief?.approval_question ?? "";
  const approvalOk =
    /You are approving creation of:.*Knowledge/i.test(aq) &&
    !/Approve research/i.test(aq);

  layers.push(
    layer(
      "5. Human Approval UI contract",
      approvalOk &&
        Boolean(created.decision_brief?.proposed_knowledge_artifact) &&
        created.autoApproved === false &&
        created.status === "waiting_human" &&
        F.decision === "pending",
      `Approval screen: "You are approving creation of: XXXXX Knowledge" (not "Approve research")`,
      `approval_question=${aq}; proposed=${created.decision_brief?.proposed_knowledge_artifact}; status=${created.status}; autoApproved=${created.autoApproved}; F.decision=${F.decision}`,
      "Approval copy unclear or gate not pending",
      "Fix approval_question / UI banner / gate pending enforcement",
    ),
  );

  const chosen =
    (options[0] as { option_id?: string } | undefined)?.option_id ??
    created.decision_asset?.options?.[0]?.title;
  const approveRes = await fetch(
    `${base}/decision/${encodeURIComponent(created.proposalId)}/approve`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chosen_option_id: chosen,
        rationale: `${c.id} human approve contract audit`,
      }),
    },
  );
  const approveText = await approveRes.text();
  const postOk =
    approveRes.status === 200 &&
    existsSync(join(dir, "G-knowledge.json")) &&
    existsSync(join(dir, "H-decision-graph.json")) &&
    existsSync(join(dir, "J-decision-model.json"));

  let knowledgeSnippet = "";
  if (existsSync(join(dir, "G-knowledge.json"))) {
    knowledgeSnippet = readFileSync(join(dir, "G-knowledge.json"), "utf8").slice(
      0,
      180,
    );
  }

  layers.push(
    layer(
      "6. After approval → Knowledge / Graph / Decision Model",
      postOk,
      "Human Approval → Knowledge artifact → Graph node → Decision Model update",
      `approve_status=${approveRes.status}; G=${existsSync(join(dir, "G-knowledge.json"))}; H=${existsSync(join(dir, "H-decision-graph.json"))}; J=${existsSync(join(dir, "J-decision-model.json"))}; knowledge_snip=${knowledgeSnippet}`,
      approveRes.status !== 200
        ? `Approve failed: ${approveText.slice(0, 240)}`
        : "Missing post-approval artifacts",
      "Repair approveDecision path / runtime artifact persistence",
    ),
  );

  notes.push(`artifact_dir=${dir}`);
  notes.push(`A.question=${A.question}`);
  notes.push(`evidence_count=${created.evidence_count}`);
  return { layers, notes };
}

function renderReport(
  results: Array<{ caseId: string; layers: LayerResult[]; notes: string[] }>,
): string {
  const lines: string[] = [];
  lines.push("# SPRINT-DECISION-PRODUCT-CONTRACT-AUDIT-001");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(
    "Evidence basis: live browser-path product server (`/decision/request` → approve), runtime artifacts under `artifacts/runtime-decisions/`. Not unit-test-only.",
  );
  lines.push("");
  lines.push("Golden Path under audit:");
  lines.push("");
  lines.push(
    "External World → Research Request → Execution Host → Runtime → SDK → Research Agent → Decision Asset Agent → Human Approval → Knowledge → Graph → Decision Model",
  );
  lines.push("");

  for (const r of results) {
    lines.push(`## ${r.caseId}`);
    lines.push("");
    for (const n of r.notes) lines.push(`- ${n}`);
    lines.push("");
    for (const L of r.layers) {
      lines.push(`### ${L.layer}: **${L.status}**`);
      lines.push("");
      lines.push(`- Expected contract: ${L.expected}`);
      lines.push(`- Actual runtime: ${L.actual}`);
      lines.push(`- Gap: ${L.gap}`);
      lines.push(`- Fix required: ${L.fix}`);
      lines.push("");
    }
  }

  const fails = results.flatMap((r) =>
    r.layers.filter((l) => l.status === "FAIL").map((l) => `${r.caseId} / ${l.layer}`),
  );
  lines.push("## Summary");
  lines.push("");
  if (fails.length === 0) {
    lines.push("All audited layers PASS across CASE-001/002/003.");
  } else {
    lines.push("FAIL layers:");
    for (const f of fails) lines.push(`- ${f}`);
  }
  lines.push("");
  return lines.join("\n");
}

clear();
clearDecisionRequestSessions();
process.env.DYOGAS_REPO_ROOT = resolveRepoRoot();
const memoryRoot = mkdtempSync(join(tmpdir(), "dyogas-contract-audit-"));
const server = await startDecisionProductServer({ port: 0, memoryRoot });
const base = `http://127.0.0.1:${server.port}`;

const results = [];
try {
  for (const c of CASES) {
    const out = await runCase(base, c);
    results.push({ caseId: c.id, ...out });
  }
} finally {
  await server.close();
  try {
    rmSync(memoryRoot, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

const report = renderReport(results);
const outDir = join(resolveRepoRoot(), "artifacts", "audits");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "SPRINT-DECISION-PRODUCT-CONTRACT-AUDIT-001.md");
writeFileSync(outPath, report, "utf8");
console.log(report);
console.log(`\nWrote ${outPath}`);
const failed = results.some((r) => r.layers.some((l) => l.status === "FAIL"));
process.exit(failed ? 1 : 0);
