import http from "node:http";
import { URL } from "node:url";
import { ApprovalConsole } from "./console.js";

export interface WebUiServer {
  readonly port: number;
  readonly console: ApprovalConsole;
  close(): Promise<void>;
}

/**
 * Minimal HTTP approval console — no framework, no silent SoR writes.
 */
export function startApprovalServer(
  consoleStore: ApprovalConsole,
  port = 0,
): Promise<WebUiServer> {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://127.0.0.1`);
    if (req.method === "GET" && url.pathname === "/") {
      const rows = consoleStore
        .list()
        .map(
          (g) =>
            `<tr><td>${g.gateId}</td><td>${g.painStatement}</td><td>${g.decision}</td></tr>`,
        )
        .join("");
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(`<!doctype html><html><head><title>DYOGAS Approvals</title>
<style>
  :root { --ink:#1a2421; --mist:#e8f0ec; --accent:#2f6f5e; }
  body { margin:0; font-family:"Segoe UI",sans-serif; background:
    radial-gradient(1200px 600px at 10% -10%, #cfe5dc, transparent),
    linear-gradient(165deg, #f7fbf9, #dce8e2); color:var(--ink); min-height:100vh; }
  main { max-width:920px; margin:0 auto; padding:3rem 1.25rem; }
  h1 { font-size:clamp(2.4rem,6vw,3.6rem); letter-spacing:-0.03em; margin:0 0 .5rem; }
  p { max-width:36rem; line-height:1.5; opacity:.85; }
  table { width:100%; border-collapse:collapse; margin-top:2rem; }
  th,td { text-align:left; padding:.75rem .5rem; border-bottom:1px solid #b7c9c0; }
</style></head><body><main>
<h1>DYOGAS</h1>
<p>Human Approval console — record decisions; never silent SoR writes.</p>
<table><thead><tr><th>Gate</th><th>Pain</th><th>Decision</th></tr></thead>
<tbody>${rows || "<tr><td colspan=3>No pending gates</td></tr>"}</tbody></table>
</main></body></html>`);
      return;
    }
    if (req.method === "GET" && url.pathname === "/api/gates") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(consoleStore.list()));
      return;
    }
    if (req.method === "POST" && url.pathname === "/api/gates") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body) as {
            proposalId: string;
            researchArtifactId: string;
            painStatement: string;
          };
          const g = consoleStore.enqueue(parsed);
          res.writeHead(201, { "content-type": "application/json" });
          res.end(JSON.stringify(g));
        } catch (err) {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
      return;
    }
    if (req.method === "POST" && url.pathname.startsWith("/api/gates/") && url.pathname.endsWith("/decide")) {
      const gateId = url.pathname.split("/")[3] ?? "";
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body) as {
            decision: "approved" | "rejected";
            actorId: string;
          };
          const g = consoleStore.decide(gateId, parsed.decision, parsed.actorId);
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify(g));
        } catch (err) {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
      return;
    }
    res.writeHead(404).end("not found");
  });

  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      const p = typeof addr === "object" && addr ? addr.port : port;
      resolve({
        port: p,
        console: consoleStore,
        close: () =>
          new Promise((r, j) => server.close((e) => (e ? j(e) : r()))),
      });
    });
  });
}
