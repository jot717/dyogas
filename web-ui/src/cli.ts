/**
 * CLI entry — start Decision Intelligence browser MVP.
 */

import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startDecisionProductServer, defaultMemoryRoot } from "./index.js";

function ensureRepoRootEnv(): void {
  if (process.env.DYOGAS_REPO_ROOT?.trim()) return;
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(join(dir, "personal-brain", "package.json")) &&
      existsSync(join(dir, "web-ui", "package.json"))
    ) {
      process.env.DYOGAS_REPO_ROOT = dir;
      return;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

/**
 * Absolute filesystem path to web-ui/public.
 * Works when started from repo root via: npm start --prefix web-ui
 */
function resolveWebUiPublicRoot(): string {
  // cli.ts lives at web-ui/src/cli.ts → ../public
  const fromCli = resolve(dirname(fileURLToPath(import.meta.url)), "../public");
  if (
    existsSync(join(fromCli, "assets", "app.js")) &&
    existsSync(join(fromCli, "assets", "app.css"))
  ) {
    return fromCli;
  }

  // Fallback: walk up to web-ui/package.json then use public/
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, "public"))) {
      const candidate = resolve(dir, "public");
      if (
        existsSync(join(candidate, "assets", "app.js")) &&
        existsSync(join(candidate, "assets", "app.css"))
      ) {
        return candidate;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error(
    `web-ui public assets not found (expected assets/app.js + assets/app.css under ${fromCli})`,
  );
}

ensureRepoRootEnv();
delete process.env.DYOGAS_RESEARCH_COLLECTOR;

const publicRoot = resolveWebUiPublicRoot();
const port = Number(process.env.PORT || 8787);
const server = await startDecisionProductServer({
  port,
  memoryRoot: defaultMemoryRoot(),
  publicRoot,
});
process.stdout.write(
  `DYOGAS Decision MVP http://127.0.0.1:${server.port}/\n`,
);
process.stdout.write(`Static public root: ${publicRoot}\n`);
process.stdout.write(
  `Runtime decisions: ${process.env.DYOGAS_REPO_ROOT || "(auto)"}/artifacts/runtime-decisions/\n`,
);
