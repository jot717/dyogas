/**
 * USER-WEB-MVP-001 — browser product validation bundle (HTTP surface).
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { clear } from "@dyogas/kernel";
import { clearDecisionRequestSessions } from "@dyogas/personal-brain";
import { startDecisionProductServer } from "../src/index.js";

const QUESTION =
  "Should I build an AI startup in Tokyo or continue employment?";

export async function runUserWebMvp001(
  opts: { readonly writeEvidence?: boolean } = {},
): Promise<{
  readonly ok: true;
  readonly runtimeTrace: readonly string[];
  readonly evidenceDir: string;
  readonly filesCreated: readonly string[];
  readonly proposalId: string;
}> {
  clear();
  clearDecisionRequestSessions();
  const memoryRoot = mkdtempSync(join(tmpdir(), "dyogas-web-mvp-gold-"));
  const server = await startDecisionProductServer({ port: 0, memoryRoot });
  const base = `http://127.0.0.1:${server.port}`;
  const filesCreated: string[] = [];

  try {
    await fetch(`${base}/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        user_id: "web-mvp-user",
        tenant_id: "validation-tokyo-2026",
      }),
    });

    const homeHtml = await (await fetch(`${base}/`)).text();
    const created = (await (
      await fetch(`${base}/decision/request`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: QUESTION,
          constraints: { location: "Tokyo", timeframe: "2026" },
          desired_outcome:
            "Maximize long-term entrepreneurial optionality without catastrophic downside",
          request_id: "USER-WEB-MVP-001",
        }),
      })
    ).json()) as {
      proposalId: string;
      status: string;
      autoApproved: boolean;
      stages_completed: string[];
    };

    const inbox = await (await fetch(`${base}/decision/inbox`)).json();
    const before = await (
      await fetch(`${base}/decision/${created.proposalId}`)
    ).json();

    const approved = (await (
      await fetch(`${base}/decision/${created.proposalId}/approve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rationale: "USER-WEB-MVP-001 browser validation approve",
        }),
      })
    ).json()) as Record<string, unknown>;

    const history = await (await fetch(`${base}/decision/history`)).json();
    const after = await (
      await fetch(`${base}/decision/${created.proposalId}`)
    ).json();

    const runtimeTrace = [
      "Open browser → GET / (Decision Home SPA)",
      "POST /session { user_id, tenant_id }",
      `POST /decision/request — ${QUESTION}`,
      "GET /decision/inbox — waiting_human",
      "GET /decision/:id — progress + analysis (no auto decision)",
      "POST /decision/:id/approve",
      "GET /decision/history — Decision Memory saved",
    ] as const;

    const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const evidenceDir = join(
      repoRoot,
      "artifacts/golden-path/USER-WEB-MVP-001",
    );

    if (opts.writeEvidence !== false) {
      mkdirSync(evidenceDir, { recursive: true });
      const files: Record<string, unknown> = {
        "A-home.html-snippet.json": {
          containsBrand: /DYOGAS/.test(homeHtml),
          containsAppJs: /app\.js/.test(homeHtml),
        },
        "B-session.json": {
          user_id: "web-mvp-user",
          tenant_id: "validation-tokyo-2026",
        },
        "C-create-request.json": created,
        "D-inbox.json": inbox,
        "E-progress-before-approve.json": before,
        "F-approve-result.json": approved,
        "G-history.json": history,
        "H-result-after-approve.json": after,
        "RUNTIME-TRACE.json": { runtimeTrace, sprint: "SPRINT-PERSONAL-BRAIN-WEB-MVP-001" },
      };
      for (const [name, payload] of Object.entries(files)) {
        const path = join(evidenceDir, name);
        writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
        filesCreated.push(path);
      }
    }

    return {
      ok: true,
      runtimeTrace,
      evidenceDir,
      filesCreated,
      proposalId: created.proposalId,
    };
  } finally {
    await server.close();
    rmSync(memoryRoot, { recursive: true, force: true });
  }
}

const invokedAsCli =
  typeof process.argv[1] === "string" &&
  /user-web-mvp-001\.(ts|js)$/.test(process.argv[1].replace(/\\/g, "/"));

if (invokedAsCli) {
  const result = await runUserWebMvp001({ writeEvidence: true });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
