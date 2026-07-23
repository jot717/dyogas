import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { dataDir } from "../env.js";

export type PendingStatus = "pending" | "approved" | "rejected";

export interface PendingCapture {
  readonly id: string;
  readonly workspaceId: string;
  readonly ownerUserId: string;
  readonly kind: "text" | "url" | "document";
  readonly sourceUrl?: string;
  readonly rawTitle: string;
  readonly rawBody: string;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly markdownBody: string;
  readonly status: PendingStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface StoredKnowledge {
  readonly knowledgeId: string;
  readonly workspaceId: string;
  readonly title: string;
  readonly markdown: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly source: string;
  readonly createdAt: string;
  readonly links: readonly string[];
  readonly version: number;
}

export type AskProposalStatus =
  | "proposed"
  | "approved"
  | "edited"
  | "rejected";

export interface AskEvidence {
  readonly knowledgeId: string;
  readonly title: string;
  readonly excerpt: string;
}

export interface AskProposal {
  readonly id: string;
  readonly workspaceId: string;
  readonly ownerUserId: string;
  readonly question: string;
  readonly proposedAnswer: string;
  readonly finalAnswer?: string;
  readonly evidence: readonly AskEvidence[];
  readonly status: AskProposalStatus;
  readonly learnApplied?: boolean;
  readonly learnedKnowledgeId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BrainSnapshot {
  readonly workspaceId: string;
  readonly ownerUserId: string;
  readonly displayName: string;
  readonly tenantId: string;
  readonly pending: PendingCapture[];
  readonly knowledge: StoredKnowledge[];
  readonly askProposals: AskProposal[];
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function snapshotPath(workspaceId: string): string {
  return join(dataDir(), "workspaces", `${workspaceId}.json`);
}

export function loadSnapshot(workspaceId: string): BrainSnapshot | null {
  const p = snapshotPath(workspaceId);
  if (!existsSync(p)) return null;
  const raw = JSON.parse(readFileSync(p, "utf8")) as BrainSnapshot & {
    askProposals?: AskProposal[];
  };
  return {
    ...raw,
    askProposals: raw.askProposals ?? [],
  };
}

export function saveSnapshot(snap: BrainSnapshot): void {
  ensureDir(join(dataDir(), "workspaces"));
  writeFileSync(snapshotPath(snap.workspaceId), JSON.stringify(snap, null, 2), "utf8");
}

export function listWorkspaceIds(): string[] {
  const dir = join(dataDir(), "workspaces");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}
