/**
 * USER-REQUEST-LIVE-001 — browser MVP evidence freeze via live Research path.
 * Uses personal-brain live golden runner; does not enable mock harness.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runGoldenPathUserRequestLive001 } from "../../personal-brain/scripts/golden-path-user-request-live-001.ts";

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../..");
}

async function main(): Promise<void> {
  delete process.env.DYOGAS_RESEARCH_COLLECTOR;
  const result = await runGoldenPathUserRequestLive001({ writeEvidence: true });
  const outDir = join(repoRoot(), "artifacts/golden-path/USER-REQUEST-LIVE-001");
  mkdirSync(outDir, { recursive: true });
  const browserReport = {
    scenario: "USER-REQUEST-LIVE-001",
    expected_browser_state: [
      "Researching...",
      "Evidence collected (url, source class, timestamp, provenance)",
      "Waiting Human Approval",
    ],
    result,
  };
  writeFileSync(
    join(outDir, "browser-flow.json"),
    `${JSON.stringify(browserReport, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(browserReport, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
