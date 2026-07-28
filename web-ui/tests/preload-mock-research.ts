/**
 * Offline unit-test harness: mock research + isolated artifact root.
 */
import { mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.DYOGAS_RESEARCH_COLLECTOR = "mock";

const root = mkdtempSync(join(tmpdir(), "dyogas-web-artifacts-"));
process.env.DYOGAS_REPO_ROOT = root;
mkdirSync(join(root, "artifacts", "runtime-decisions"), { recursive: true });
