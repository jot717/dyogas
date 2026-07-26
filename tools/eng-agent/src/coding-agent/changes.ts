/**
 * Change detection — prefer git diff; fall back to content snapshot.
 * No caller-supplied changed-file lists.
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

function toPosix(p: string): string {
  return p.replace(/\\/g, "/");
}

export type FileSnapshot = Map<string, string>;

export function hashFile(absPath: string): string {
  const buf = readFileSync(absPath);
  return createHash("sha256").update(buf).digest("hex");
}

export function snapshotPaths(
  workspaceRoot: string,
  paths: readonly string[],
): FileSnapshot {
  const map: FileSnapshot = new Map();
  for (const rel of paths) {
    const abs = join(workspaceRoot, rel);
    if (existsSync(abs) && statSync(abs).isFile()) {
      map.set(toPosix(rel), hashFile(abs));
    } else {
      map.set(toPosix(rel), "");
    }
  }
  return map;
}

export function diffSnapshots(
  before: FileSnapshot,
  after: FileSnapshot,
): string[] {
  const changed: string[] = [];
  const keys = new Set([...before.keys(), ...after.keys()]);
  for (const k of keys) {
    if ((before.get(k) ?? "") !== (after.get(k) ?? "")) {
      changed.push(k);
    }
  }
  return changed.sort();
}

export function hasGitRepo(workspaceRoot: string): boolean {
  return existsSync(join(workspaceRoot, ".git"));
}

/**
 * Return changed paths under allowPrefixes using git diff.
 * Empty if git unavailable or fails.
 */
export function gitDiffChangedFiles(
  workspaceRoot: string,
  allowPrefixes: readonly string[],
): string[] {
  if (!hasGitRepo(workspaceRoot)) return [];
  const result = spawnSync(
    "git",
    ["diff", "--name-only", "--", ...allowPrefixes],
    {
      cwd: workspaceRoot,
      encoding: "utf8",
      shell: false,
    },
  );
  if (result.status !== 0) return [];
  const unstaged = (result.stdout ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const staged = spawnSync(
    "git",
    ["diff", "--name-only", "--cached", "--", ...allowPrefixes],
    {
      cwd: workspaceRoot,
      encoding: "utf8",
      shell: false,
    },
  );
  const stagedFiles =
    staged.status === 0
      ? (staged.stdout ?? "")
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

  // Also include untracked under allow prefixes
  const untracked = spawnSync(
    "git",
    ["ls-files", "--others", "--exclude-standard", "--", ...allowPrefixes],
    {
      cwd: workspaceRoot,
      encoding: "utf8",
      shell: false,
    },
  );
  const untrackedFiles =
    untracked.status === 0
      ? (untracked.stdout ?? "")
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean)
      : [];

  return [...new Set([...unstaged, ...stagedFiles, ...untrackedFiles])]
    .map(toPosix)
    .sort();
}

export function collectChangedFiles(input: {
  workspaceRoot: string;
  allowPrefixes: readonly string[];
  watchedPaths: readonly string[];
  before: FileSnapshot;
}): { changedFiles: string[]; method: "git-diff" | "content-snapshot" } {
  const gitChanged = gitDiffChangedFiles(
    input.workspaceRoot,
    input.allowPrefixes,
  );
  if (hasGitRepo(input.workspaceRoot) && gitChanged.length > 0) {
    return { changedFiles: gitChanged, method: "git-diff" };
  }
  const after = snapshotPaths(input.workspaceRoot, input.watchedPaths);
  return {
    changedFiles: diffSnapshots(input.before, after),
    method: "content-snapshot",
  };
}

/** Walk a directory for relative file paths (tests helper). */
export function listFilesRecursive(
  workspaceRoot: string,
  relDir: string,
): string[] {
  const abs = join(workspaceRoot, relDir);
  if (!existsSync(abs)) return [];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(toPosix(relative(workspaceRoot, p)));
    }
  };
  walk(abs);
  return out;
}
