import { generateId, getClock } from "@dyogas/kernel";

export type NotificationSeverity = "info" | "warning" | "critical";
export type ReceiptStatus = "delivered" | "suppressed" | "failed";

export interface NotificationEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly severity: NotificationSeverity;
  readonly audience: readonly string[];
  readonly runId: string;
  readonly artifactRefs: readonly string[];
  readonly channelHints: readonly string[];
  readonly source: "harness";
  readonly createdAt: string;
}

export interface NotificationReceipt {
  readonly receiptId: string;
  readonly eventId: string;
  readonly channel: string;
  readonly status: ReceiptStatus;
  readonly detail?: string;
  readonly deliveredAt: string;
}

/** In-memory notification delivery (no email/chat webhooks). */
export function createApprovalNotification(input: {
  readonly runId: string;
  readonly gateId: string;
  readonly proposalId: string;
  readonly audience: readonly string[];
}): { event: NotificationEvent; receipts: NotificationReceipt[] } {
  const event: NotificationEvent = {
    eventId: generateId(),
    eventType: "human_approval_gate.pending",
    severity: "critical",
    audience: input.audience,
    runId: input.runId,
    artifactRefs: [input.gateId, input.proposalId],
    channelHints: ["in-app"],
    source: "harness",
    createdAt: getClock().nowIso(),
  };

  const receipts: NotificationReceipt[] = event.channelHints.map((channel) => ({
    receiptId: generateId(),
    eventId: event.eventId,
    channel,
    status: "delivered" as const,
    detail: "mock in-app delivery",
    deliveredAt: getClock().nowIso(),
  }));

  return { event, receipts };
}
