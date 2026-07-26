/**
 * One-shot product validation — USER-REQUEST-001
 * Existing modules only. No auto-approve.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  execute,
  createFixtureSourceCollector,
} from "@dyogas/research-engine";
import {
  createTaskPlan,
  generateExecutionPackageFromPlan,
} from "@dyogas/task-agent";
import {
  decisionAssetFromResearchEvidence,
  decisionAssetToKnowledgeContent,
  approveDecisionAsset,
} from "@dyogas/decision-asset-agent";

const outDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../artifacts/validation/USER-REQUEST-001",
);
mkdirSync(outDir, { recursive: true });

const originalRequest = {
  requestId: "USER-REQUEST-001",
  userIntent:
    "I want to decide whether to build an AI startup in Tokyo in 2026",
  decisionQuestion:
    "Which AI startup opportunity has the highest probability of success for a solo founder in Tokyo?",
  constraints: {
    location: "Tokyo Japan",
    founderType: "solo technical founder",
    timeframe: "2026",
    budget: "limited",
    goal: "find billion-dollar potential opportunity",
  },
  requiredEvidence: [
    "market trends",
    "existing competitors",
    "customer pain points",
    "technology feasibility",
  ],
};

clear();
propagate(createTenancyContext(createTenantId("validation-tokyo-2026")));

// --- 1. Task Agent ---
const taskPlan = createTaskPlan({
  request: originalRequest.decisionQuestion,
  scope: [
    originalRequest.userIntent,
    `location=${originalRequest.constraints.location}`,
    `founderType=${originalRequest.constraints.founderType}`,
    `timeframe=${originalRequest.constraints.timeframe}`,
    `budget=${originalRequest.constraints.budget}`,
    `goal=${originalRequest.constraints.goal}`,
    `requiredEvidence=${originalRequest.requiredEvidence.join("|")}`,
  ].join("; "),
  tenant_id: "validation-tokyo-2026",
  run_id: originalRequest.requestId,
  sprint_id: "VALIDATION-USER-REQUEST-001",
  constraints: originalRequest.constraints,
  allowed_source_classes: ["web", "github", "reddit"],
  budget: { max_items: 6, max_seconds: 30 },
});

const pkgResult = generateExecutionPackageFromPlan(taskPlan);
if (!pkgResult.ok) {
  throw new Error(`Execution Package failed: ${pkgResult.error}`);
}
const executionPackage = pkgResult.package;

// --- 2. Research Agent ---
const researchInput = {
  brief_id: `brief-${originalRequest.requestId}`,
  brief: {
    question: originalRequest.decisionQuestion,
    scope: taskPlan.research_brief?.scope ?? taskPlan.package_fields.allowedScope,
    allowedSourceClasses: ["web", "github", "reddit"] as const,
    maxItems: 6,
    maxSeconds: 30,
  },
};

const researchResult = await execute({
  brief: { ...researchInput.brief, allowedSourceClasses: [...researchInput.brief.allowedSourceClasses] },
  brief_id: researchInput.brief_id,
  collector: createFixtureSourceCollector({ itemsPerClass: 2 }),
});

const researchEvidence = {
  requestId: originalRequest.requestId,
  researchArtifactId: researchResult.candidate.brief_ref.brief_id,
  taskId: researchResult.task.taskId,
  tenantId: researchResult.task.tenantId,
  candidate: researchResult.candidate,
  evidence: researchResult.evidence,
  runEvidence: researchResult.runEvidence,
};

// --- 3. Decision Asset Agent ---
const decisionAsset = decisionAssetFromResearchEvidence({
  question: originalRequest.decisionQuestion,
  tenant_id: "validation-tokyo-2026",
  task_id: taskPlan.task_id,
  research_artifact_id: researchEvidence.researchArtifactId,
  evidence: researchResult.evidence,
  execution_package_task_id: executionPackage.taskId,
});

const decisionOptions = decisionAsset.claims.map((c, i) => ({
  optionId: `option-${String(i + 1).padStart(2, "0")}`,
  claimId: c.claim_id,
  statement: c.text,
  evidenceRef: c.evidence_id,
  evidencePointer:
    researchResult.evidence.find((e) => e.evidenceId === c.evidence_id)
      ?.metadata.pointer ?? null,
}));

const decisionAssetOutput = {
  ...decisionAsset,
  decisionOptions,
  knowledgeContentPreview: decisionAssetToKnowledgeContent(decisionAsset),
};

// --- 4. Human Gate (NO auto-approve) ---
const approval = approveDecisionAsset({
  asset: decisionAsset,
  evidence: researchResult.evidence,
  painStatement: originalRequest.userIntent,
  audience: ["founder"],
  // intentionally omit decision + actorId → pending
});

const humanApprovalPayload = {
  requestId: originalRequest.requestId,
  status: approval.gate.gate.decision,
  autoApproved: false,
  approved: approval.approved,
  gate: approval.gate.gate,
  receipts: approval.gate.receipts,
  applyPresent: Boolean(approval.gate.apply),
  awaiting: {
    required: ["decision", "actorId"],
    note: "Human must approve or reject — engines never self-approve",
  },
  reviewPackage: {
    decisionQuestion: originalRequest.decisionQuestion,
    decisionAssetId: decisionAsset.asset_id,
    evidenceIds: [...decisionAsset.evidence_ids],
    decisionOptions,
    executionPackageTaskId: executionPackage.taskId,
  },
};

const missingIntegrationPoints = [
  "No single product façade API composing Task→Research→DecisionAsset→Gate (composed in this validation runner)",
  "DecisionAsset schema has claims, not first-class decisionOptions (options derived at validation boundary from claims)",
  "Research used fixture collector (Band A offline) — live Stage-1 egress not invoked in this run",
  "Execution Host createRun / seal / lineage not invoked (Host redesign / Host call out of this validation scope)",
  "Knowledge SoR + Decision Graph persist skipped because human gate is pending (by design)",
  "personal-brain Product UI not wired to this pipeline",
];

const files = {
  "A-original-request.json": originalRequest,
  "B-task-plan.json": { taskPlan, executionPackage },
  "C-research-input.json": researchInput,
  "D-research-evidence.json": researchEvidence,
  "E-decision-asset.json": decisionAssetOutput,
  "F-human-approval-payload.json": humanApprovalPayload,
  "H-missing-integration-points.json": { missingIntegrationPoints },
};

const created: string[] = [];
for (const [name, payload] of Object.entries(files)) {
  const path = join(outDir, name);
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  created.push(path);
}

const bundle = {
  A: originalRequest,
  B: { taskPlan, executionPackage },
  C: researchInput,
  D: researchEvidence,
  E: decisionAssetOutput,
  F: humanApprovalPayload,
  G: { outDir, filesCreated: created },
  H: missingIntegrationPoints,
};

writeFileSync(
  join(outDir, "FULL-BUNDLE.json"),
  `${JSON.stringify(bundle, null, 2)}\n`,
  "utf8",
);
created.push(join(outDir, "FULL-BUNDLE.json"));

process.stdout.write(JSON.stringify(bundle, null, 2) + "\n");
