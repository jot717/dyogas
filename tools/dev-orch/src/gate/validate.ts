/**
 * Development Orchestrator Gate Validator.
 *
 * Enforces Execution Package boundaries before/after implementation intent
 * (START_DEVELOPMENT §5.2–§5.5). Any violation → STOP (fail closed).
 */
import type { ExecutionPackage } from "../package/types.js";
import type {
  GateCheckId,
  GateContext,
  GateResult,
  GateViolation,
} from "./types.js";

const PLATFORM_FORBIDDEN_PREFIXES = [
  "runtime/",
  "sdk/",
  "execution-host/",
  "harness/",
] as const;

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

/**
 * Extract path-like tokens from a scope prose string.
 * Recognizes tokens containing `/` or ending with `/**` / `/*`.
 */
export function extractPathPatterns(scopeText: string): string[] {
  const out: string[] = [];
  const parts = scopeText.split(/[;\n|,]/);
  for (const part of parts) {
    const token = part.trim().replace(/^`+|`+$/g, "");
    if (!token) continue;
    if (!(token.includes("/") || token.includes("*"))) continue;

    const normalized = normalizePath(token);
    if (normalized.includes("*")) {
      // Prefix before first glob star (e.g. docs/dev-orch/P2-05-*.md → docs/dev-orch/P2-05-)
      const prefix = normalized.slice(0, normalized.indexOf("*"));
      if (prefix) out.push(prefix);
      // Also allow the parent directory
      const slash = prefix.lastIndexOf("/");
      if (slash > 0) out.push(prefix.slice(0, slash + 1).replace(/\/$/, "") || prefix);
    } else {
      out.push(normalized.replace(/\/$/, ""));
      out.push(normalized);
    }
  }
  return [...new Set(out.filter(Boolean))];
}

function pathMatchesPattern(path: string, pattern: string): boolean {
  const p = normalizePath(path);
  const pat = normalizePath(pattern).replace(/\/$/, "");
  if (!pat) return false;
  return (
    p === pat ||
    p.startsWith(pat) ||
    p.startsWith(`${pat}/`) ||
    p.includes(`/${pat}/`) ||
    p.endsWith(`/${pat}`)
  );
}

function isAllowedPath(path: string, allowedPatterns: string[]): boolean {
  if (allowedPatterns.length === 0) return false;
  return allowedPatterns.some((pat) => pathMatchesPattern(path, pat));
}

function isForbiddenPath(
  path: string,
  forbiddenPatterns: string[],
): boolean {
  const p = normalizePath(path).toLowerCase();
  for (const prefix of PLATFORM_FORBIDDEN_PREFIXES) {
    if (p === prefix.slice(0, -1) || p.startsWith(prefix)) return true;
  }
  return forbiddenPatterns.some((pat) => pathMatchesPattern(path, pat));
}

function completenessViolations(pkg: ExecutionPackage): GateViolation[] {
  const violations: GateViolation[] = [];
  if (isBlank(pkg.taskId)) {
    violations.push({
      check: "COMPLETENESS",
      message: "missing Task ID",
    });
  }
  if (isBlank(pkg.objective)) {
    violations.push({
      check: "COMPLETENESS",
      message: "missing Objective",
    });
  }
  if (isBlank(pkg.acceptanceCriteria)) {
    violations.push({
      check: "COMPLETENESS",
      message: "missing Acceptance Criteria",
    });
  }
  if (isBlank(pkg.testRequirements)) {
    violations.push({
      check: "COMPLETENESS",
      message: "missing Test Requirement",
    });
  }
  if (isBlank(pkg.expectedEvidence)) {
    violations.push({
      check: "COMPLETENESS",
      message: "missing Evidence requirement (expectedEvidence)",
    });
  }
  return violations;
}

function authorizationViolations(
  pkg: ExecutionPackage,
  ctx: GateContext,
): GateViolation[] {
  const violations: GateViolation[] = [];

  if (isBlank(pkg.taskId) || !ctx.knownTaskIds.includes(pkg.taskId)) {
    violations.push({
      check: "AUTHORIZATION",
      message: `invalid or unknown Task ID '${pkg.taskId || "(empty)"}'`,
    });
  }

  if (isBlank(pkg.sprintId)) {
    violations.push({
      check: "AUTHORIZATION",
      message: "missing Sprint ID",
    });
  }

  if (!ctx.sprintAuthorized) {
    violations.push({
      check: "AUTHORIZATION",
      message: "Sprint authorization missing or not granted",
    });
  }

  if (!ctx.decisionLogApproved) {
    violations.push({
      check: "AUTHORIZATION",
      message: "Decision Log approval missing or not granted",
    });
  }

  const mode = ctx.mode.trim().toLowerCase();
  const pkgMode = pkg.executionMode.trim().toLowerCase();
  if (mode !== "implementation mode") {
    violations.push({
      check: "AUTHORIZATION",
      message: `Implementation Mode not active (mode='${ctx.mode}')`,
    });
  }
  if (pkgMode && pkgMode !== "implementation mode") {
    violations.push({
      check: "AUTHORIZATION",
      message: `Execution Package mode is not Implementation Mode ('${pkg.executionMode}')`,
    });
  }

  return violations;
}

function modeViolations(ctx: GateContext): GateViolation[] {
  if (ctx.createsPlanningArtifacts && ctx.modifiesCode) {
    return [
      {
        check: "MODE",
        message:
          "STOP: Planning Mode artifacts and Implementation Mode code must not mix in one cycle (§5.4)",
      },
    ];
  }
  return [];
}

function scopeViolations(
  pkg: ExecutionPackage,
  ctx: GateContext,
): GateViolation[] {
  const violations: GateViolation[] = [];
  const allowed = extractPathPatterns(pkg.allowedScope);
  const forbidden = extractPathPatterns(pkg.forbiddenScope);

  // Prose-level forbidden keywords always reject matching path roots
  const forbiddenText = pkg.forbiddenScope.toLowerCase();
  for (const path of ctx.proposedPaths) {
    const n = normalizePath(path);
    if (isForbiddenPath(n, forbidden)) {
      violations.push({
        check: "SCOPE",
        message: `forbidden path '${n}'`,
      });
      continue;
    }
    // Keyword guard when path roots appear in forbidden prose
    if (
      (forbiddenText.includes("runtime") && n.startsWith("runtime/")) ||
      (forbiddenText.includes("sdk") && n.startsWith("sdk/")) ||
      (forbiddenText.includes("execution host") &&
        n.startsWith("execution-host/"))
    ) {
      violations.push({
        check: "SCOPE",
        message: `forbidden path '${n}' (forbidden scope prose)`,
      });
      continue;
    }
    if (!isAllowedPath(n, allowed)) {
      violations.push({
        check: "SCOPE",
        message: `undeclared modification '${n}' (not in allowed scope)`,
      });
    }
  }

  return violations;
}

/**
 * Validate an Execution Package against execution context.
 * Any violation → `{ ok: false, action: "STOP" }` — no override.
 */
export function validateExecutionGate(
  pkg: ExecutionPackage,
  ctx: GateContext,
): GateResult {
  const violations: GateViolation[] = [
    ...completenessViolations(pkg),
    ...authorizationViolations(pkg, ctx),
    ...modeViolations(ctx),
    ...scopeViolations(pkg, ctx),
  ];

  if (violations.length > 0) {
    return {
      ok: false,
      action: "STOP",
      violations,
    };
  }

  const checks: GateCheckId[] = [
    "COMPLETENESS",
    "AUTHORIZATION",
    "MODE",
    "SCOPE",
  ];
  return { ok: true, checks };
}
