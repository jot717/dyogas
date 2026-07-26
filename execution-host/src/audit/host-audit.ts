/**
 * SPRINT-EXECUTION-HOST-001 — Group I audit integration (T-I1..I2).
 * Appends to existing Trust AuditSink (same sink Runtime uses). No parallel store.
 */

import type { AuditSink } from "@dyogas/trust";

/** Host audit event types (string values fit AuditEvent). */
export const HostAuditType = {
  RUN_ADMITTED: "host.run.admitted",
  STAGE_STARTED: "host.stage.started",
  STAGE_COMPLETED: "host.stage.completed",
  HANDOFF: "host.handoff",
  REVIEW_GATE: "host.review_gate",
  HUMAN_GATE_OPENED: "host.human_gate.opened",
  HUMAN_DECISION: "host.human_gate.decision",
  RESUME: "host.human_gate.resume",
  KNOWLEDGE_APPLIED: "host.knowledge.applied",
  GRAPH_UPDATED: "host.graph.updated",
  RUN_COMPLETED: "host.run.completed",
} as const;

export type HostAuditFields = {
  readonly run_id: string;
  readonly tenant_id?: string;
  readonly pipeline_id?: string;
  readonly pipeline_version?: string;
  readonly stage_id?: string;
  readonly stage_name?: string;
  readonly outcome?: string;
  readonly actor_id?: string;
  readonly actor_kind?: string;
  readonly artifact_id?: string;
  readonly digest?: string;
  readonly note?: string;
};

function asEvent(
  type: string,
  fields: HostAuditFields,
): { type: string; [key: string]: string | undefined } {
  return {
    type,
    run_id: fields.run_id,
    tenant_id: fields.tenant_id,
    pipeline_id: fields.pipeline_id,
    pipeline_version: fields.pipeline_version,
    stage_id: fields.stage_id,
    stage_name: fields.stage_name,
    outcome: fields.outcome,
    actor_id: fields.actor_id,
    actor_kind: fields.actor_kind,
    artifact_id: fields.artifact_id,
    digest: fields.digest,
    note: fields.note,
  };
}

export type HostAudit = {
  readonly sink: AuditSink;
  emit(type: string, fields: HostAuditFields): void;
};

export function createHostAudit(sink: AuditSink): HostAudit {
  return {
    sink,
    emit(type, fields) {
      sink.append(asEvent(type, fields));
    },
  };
}

export function assertAuditOrder(
  types: readonly string[],
  requiredInOrder: readonly string[],
): void {
  let searchFrom = 0;
  for (const need of requiredInOrder) {
    const idx = types.indexOf(need, searchFrom);
    if (idx < 0) {
      throw new Error(`missing audit event in order: ${need}`);
    }
    searchFrom = idx + 1;
  }
}
