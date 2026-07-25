/**
 * C-05 — durable product-local index of Host ResearchReport references.
 *
 * Stores references and lineage metadata only. This is not an artifact body
 * store and not a Knowledge SoR.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { dataDir } from "../env.js";
import { PersonalBrainError } from "../workspace.js";
import type { HostResearchReportRef } from "../bridge/execute-research.js";

export type StoredResearchReportReference = HostResearchReportRef & {
  readonly tenant_id: string;
  readonly workspace_id: string;
  readonly owner_id: string;
};

export type PersistResearchReportDisposition = "inserted" | "duplicate";

export type PersistResearchReportResult = {
  readonly disposition: PersistResearchReportDisposition;
  readonly record: StoredResearchReportReference;
};

export interface ResearchReportReferenceStore {
  save(record: StoredResearchReportReference): PersistResearchReportResult;
  get(
    tenantId: string,
    workspaceId: string,
    researchReportRef: string,
  ): StoredResearchReportReference | undefined;
  list(
    tenantId: string,
    workspaceId: string,
  ): readonly StoredResearchReportReference[];
}

function storePath(tenantId: string, workspaceId: string): string {
  const key = `${encodeURIComponent(tenantId)}--${encodeURIComponent(workspaceId)}.json`;
  return join(dataDir(), "bridge", "research-report-refs", key);
}

function readRecords(
  tenantId: string,
  workspaceId: string,
): StoredResearchReportReference[] {
  const path = storePath(tenantId, workspaceId);
  if (!existsSync(path)) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown;
    if (!Array.isArray(parsed)) {
      throw new PersonalBrainError(
        "ResearchReport reference store must contain an array",
      );
    }
    return parsed as StoredResearchReportReference[];
  } catch (err) {
    if (err instanceof PersonalBrainError) throw err;
    throw new PersonalBrainError(
      `Failed to read ResearchReport reference store: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}

function writeRecords(
  tenantId: string,
  workspaceId: string,
  records: readonly StoredResearchReportReference[],
): void {
  const path = storePath(tenantId, workspaceId);
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp`;
  try {
    writeFileSync(temporary, JSON.stringify(records, null, 2), "utf8");
    renameSync(temporary, path);
  } catch (err) {
    throw new PersonalBrainError(
      `Failed to persist ResearchReport reference: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}

function sameRecord(
  left: StoredResearchReportReference,
  right: StoredResearchReportReference,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * Durable, idempotent reference store.
 *
 * Re-saving the identical Host reference is a duplicate no-op. Reusing the
 * same ref with different lineage/ownership fails closed.
 */
export function createFileResearchReportReferenceStore(): ResearchReportReferenceStore {
  return {
    save(record) {
      const records = readRecords(record.tenant_id, record.workspace_id);
      const existing = records.find(
        (item) => item.research_report_ref === record.research_report_ref,
      );
      if (existing) {
        if (!sameRecord(existing, record)) {
          throw new PersonalBrainError(
            `ResearchReport reference conflict: ${record.research_report_ref}`,
          );
        }
        return { disposition: "duplicate", record: existing };
      }
      records.push(record);
      writeRecords(record.tenant_id, record.workspace_id, records);
      return { disposition: "inserted", record };
    },

    get(tenantId, workspaceId, researchReportRef) {
      return readRecords(tenantId, workspaceId).find(
        (item) => item.research_report_ref === researchReportRef,
      );
    },

    list(tenantId, workspaceId) {
      return readRecords(tenantId, workspaceId);
    },
  };
}
