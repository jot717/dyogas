/**
 * Write allowlist helpers (P2-09).
 */

/** Paths the writer may mutate on disk (prefix allowlist). */
export const WRITE_ALLOWLIST_PREFIXES = [
  "tasks/",
  "docs/dev-orch/",
  "docs/eng-agent/",
  "tools/eng-agent/fixtures/",
  "sprints/",
] as const;

/** Forbidden write roots (platform / product). */
export const WRITE_FORBIDDEN_PREFIXES = [
  "runtime/src/",
  "sdk/src/",
  "execution-host/src/",
  "products/",
  "personal-brain/src/",
  "research/src/",
  "knowledge/src/",
  "graph/src/",
  "web-ui/src/",
  "kernel/src/",
  "trust/src/",
] as const;

export function normalizeWritePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

/** Stage evidence paths (…/stage/…). */
export function isStageEvidencePath(path: string): boolean {
  const n = normalizeWritePath(path);
  return /(^|\/)stage\//.test(n);
}

export function isForbiddenWritePath(path: string): boolean {
  const n = normalizeWritePath(path);
  return WRITE_FORBIDDEN_PREFIXES.some(
    (p) => n === p.slice(0, -1) || n.startsWith(p),
  );
}

/**
 * True if path is under the write allowlist (and not a GAP registry close).
 */
export function isWriteAllowed(targetPath: string): boolean {
  const rel = normalizeWritePath(targetPath);
  if (isForbiddenWritePath(rel)) return false;
  if (/GAP-REGISTRY/i.test(rel)) return false;

  if (isStageEvidencePath(rel)) return true;

  const stripped = rel.replace(
    /^.*\/(tasks\/|docs\/dev-orch\/|docs\/eng-agent\/|tools\/eng-agent\/fixtures\/|sprints\/)/,
    "$1",
  );
  for (const c of [rel, stripped]) {
    if (
      WRITE_ALLOWLIST_PREFIXES.some(
        (p) => c === p.slice(0, -1) || c.startsWith(p),
      )
    ) {
      return true;
    }
  }
  return false;
}
