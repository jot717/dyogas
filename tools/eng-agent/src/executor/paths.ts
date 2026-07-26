/**
 * Path safety for executor writes/reads.
 */

import { isAbsolute, normalize, resolve, relative } from "node:path";

/** Relative prefixes the executor may write under (workspace-relative). */
export const EXECUTOR_WRITE_PREFIXES = [
  "tools/eng-agent/fixtures/",
  "docs/eng-agent/",
  "tasks/",
  "sprints/",
] as const;

export const EXECUTOR_FORBIDDEN_PREFIXES = [
  "runtime/",
  "sdk/",
  "execution-host/",
  "personal-brain/",
  "research/",
  "knowledge/",
  "graph/",
  "kernel/",
  "trust/",
  "web-ui/",
  "harness/",
] as const;

export function toPosix(p: string): string {
  return p.replace(/\\/g, "/");
}

export function resolveUnderRoot(workspaceRoot: string, path: string): string {
  const abs = isAbsolute(path) ? normalize(path) : resolve(workspaceRoot, path);
  return abs;
}

export function relativeToRoot(workspaceRoot: string, absPath: string): string {
  return toPosix(relative(workspaceRoot, absPath));
}

export function isExecutorWriteAllowed(
  workspaceRoot: string,
  path: string,
): boolean {
  const abs = resolveUnderRoot(workspaceRoot, path);
  const rel = relativeToRoot(workspaceRoot, abs);
  if (rel.startsWith("..") || isAbsolute(rel)) return false;
  const n = toPosix(rel);
  if (
    EXECUTOR_FORBIDDEN_PREFIXES.some(
      (p) => n === p.slice(0, -1) || n.startsWith(p),
    )
  ) {
    return false;
  }
  return EXECUTOR_WRITE_PREFIXES.some(
    (p) => n === p.slice(0, -1) || n.startsWith(p),
  );
}
