/**
 * Decision Intelligence browser product HTTP server (web-ui MVP).
 */

import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { URL } from "node:url";
import { ApprovalConsole } from "./console.js";
import {
  DecisionProductService,
  defaultMemoryRoot,
} from "./decision-service.js";

export type DecisionWebServer = {
  readonly port: number;
  readonly service: DecisionProductService;
  readonly console: ApprovalConsole;
  close(): Promise<void>;
};

export type WebUiServer = DecisionWebServer;

/** Default public root relative to this module (src/ or dist/). */
export function defaultPublicRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../public");
}

function isPathInsideRoot(root: string, candidate: string): boolean {
  const rootResolved = resolve(root) + sep;
  const candidateResolved = resolve(candidate);
  return (
    candidateResolved === resolve(root) ||
    candidateResolved.toLowerCase().startsWith(rootResolved.toLowerCase())
  );
}

function contentType(path: string): string {
  switch (extname(path)) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

function readJson(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  payload: unknown,
): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function serveStatic(
  res: http.ServerResponse,
  publicRoot: string,
  relPath: string,
  method: string,
): void {
  const root = resolve(publicRoot);
  const filePath = resolve(root, relPath);
  if (!isPathInsideRoot(root, filePath) || !existsSync(filePath)) {
    res.writeHead(404).end("not found");
    return;
  }
  const headers = { "content-type": contentType(filePath) };
  if (method === "HEAD") {
    const body = readFileSync(filePath);
    res.writeHead(200, {
      ...headers,
      "content-length": String(body.byteLength),
    });
    res.end();
    return;
  }
  res.writeHead(200, headers);
  res.end(readFileSync(filePath));
}

/**
 * Start Decision product + legacy approval console HTTP server.
 */
export async function startDecisionProductServer(
  opts: {
    readonly port?: number;
    readonly memoryRoot?: string;
    /** Absolute path to web-ui/public (required for reliable static assets). */
    readonly publicRoot?: string;
    readonly consoleStore?: ApprovalConsole;
    readonly service?: DecisionProductService;
  } = {},
): Promise<DecisionWebServer> {
  const consoleStore = opts.consoleStore ?? new ApprovalConsole();
  const service =
    opts.service ??
    new DecisionProductService({
      memoryRoot: opts.memoryRoot ?? defaultMemoryRoot(),
    });
  const publicRoot = resolve(opts.publicRoot ?? defaultPublicRoot());

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://127.0.0.1`);
    const method = req.method ?? "GET";

    try {
      // --- Static SPA (GET + HEAD for curl -I / browser preflight) ---
      if (
        (method === "GET" || method === "HEAD") &&
        url.pathname === "/favicon.ico"
      ) {
        res.writeHead(204);
        res.end();
        return;
      }
      if (
        (method === "GET" || method === "HEAD") &&
        (url.pathname === "/" || url.pathname === "/app")
      ) {
        serveStatic(res, publicRoot, "index.html", method);
        return;
      }
      if (
        (method === "GET" || method === "HEAD") &&
        url.pathname.startsWith("/assets/")
      ) {
        serveStatic(res, publicRoot, url.pathname.slice(1), method);
        return;
      }

      // --- Session ---
      if (method === "GET" && url.pathname === "/session") {
        sendJson(res, 200, service.getSession());
        return;
      }
      if (method === "POST" && url.pathname === "/session") {
        const body = (await readJson(req)) as {
          user_id?: string;
          tenant_id?: string;
        };
        sendJson(res, 200, service.setSession(body));
        return;
      }

      // --- Decision product API ---
      if (method === "GET" && url.pathname === "/decision/home") {
        sendJson(res, 200, service.home());
        return;
      }
      if (method === "POST" && url.pathname === "/decision/request") {
        const body = (await readJson(req)) as {
          question: string;
          constraints?: Record<string, unknown>;
          desired_outcome: string;
          request_id?: string;
        };
        const created = await service.createRequest(body);
        sendJson(res, 201, created);
        return;
      }
      if (method === "GET" && url.pathname === "/decision/inbox") {
        sendJson(res, 200, service.inbox());
        return;
      }
      if (method === "GET" && url.pathname === "/decision/history") {
        sendJson(res, 200, service.history());
        return;
      }
      const decisionMatch = url.pathname.match(/^\/decision\/([^/]+)(?:\/(approve|reject))?$/);
      if (decisionMatch) {
        const id = decodeURIComponent(decisionMatch[1] ?? "");
        const action = decisionMatch[2];
        if (id === "request" || id === "inbox" || id === "history" || id === "home") {
          // fall through — handled above for exact paths
        } else if (method === "GET" && !action) {
          sendJson(res, 200, service.getDecision(id));
          return;
        } else if (method === "POST" && action === "approve") {
          const body = (await readJson(req)) as {
            rationale?: string;
            chosen_option_id?: string;
            action?: "approve_option" | "request_more_evidence";
          };
          sendJson(res, 200, await service.approve(id, body));
          return;
        } else if (method === "POST" && action === "reject") {
          const body = (await readJson(req)) as { rationale?: string };
          sendJson(res, 200, await service.reject(id, body.rationale));
          return;
        }
      }

      // --- Legacy approval console API ---
      if (method === "GET" && url.pathname === "/approvals") {
        const rows = consoleStore
          .list()
          .map(
            (g) =>
              `<tr><td>${g.gateId}</td><td>${g.painStatement}</td><td>${g.decision}</td></tr>`,
          )
          .join("");
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(`<!doctype html><html><body><h1>Legacy Approvals</h1>
<table>${rows || "<tr><td>empty</td></tr>"}</table>
<p><a href="/">Decision Product</a></p></body></html>`);
        return;
      }
      if (method === "GET" && url.pathname === "/api/gates") {
        sendJson(res, 200, consoleStore.list());
        return;
      }
      if (method === "POST" && url.pathname === "/api/gates") {
        const parsed = (await readJson(req)) as {
          proposalId: string;
          researchArtifactId: string;
          painStatement: string;
        };
        sendJson(res, 201, consoleStore.enqueue(parsed));
        return;
      }
      if (
        method === "POST" &&
        url.pathname.startsWith("/api/gates/") &&
        url.pathname.endsWith("/decide")
      ) {
        const gateId = url.pathname.split("/")[3] ?? "";
        const parsed = (await readJson(req)) as {
          decision: "approved" | "rejected";
          actorId: string;
        };
        sendJson(
          res,
          200,
          consoleStore.decide(gateId, parsed.decision, parsed.actorId),
        );
        return;
      }

      sendJson(res, 404, { error: "not found" });
    } catch (err) {
      sendJson(res, 400, { error: err instanceof Error ? err.message : String(err) });
    }
  });

  const port = opts.port ?? 0;
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      const addr = server.address();
      const p = typeof addr === "object" && addr ? addr.port : port;
      resolve({
        port: p,
        service,
        console: consoleStore,
        close: () =>
          new Promise((r, j) => server.close((e) => (e ? j(e) : r()))),
      });
    });
  });
}

/** Keep legacy export working for existing tests — redirects to product server. */
export async function startApprovalServer(
  consoleStore: ApprovalConsole,
  port = 0,
): Promise<DecisionWebServer> {
  return startDecisionProductServer({ port, consoleStore });
}
