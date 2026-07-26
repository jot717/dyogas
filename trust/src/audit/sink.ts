export interface AuditEvent {
  readonly type: string;
  readonly [key: string]: string | undefined;
}

export class AuditError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditError";
  }
}

export interface AuditSink {
  append(event: AuditEvent): void;
  /** Snapshot of events (read-only copy). */
  list(): readonly AuditEvent[];
}

/** In-memory append-only audit sink. */
export function createMemoryAuditSink(): AuditSink {
  const events: AuditEvent[] = [];
  return {
    append(event: AuditEvent): void {
      if (!event.type?.trim()) {
        throw new AuditError("audit event type required");
      }
      events.push(Object.freeze({ ...event }));
    },
    list(): readonly AuditEvent[] {
      return events.slice();
    },
  };
}

/**
 * Rejects any attempt to replace the event log (overwrite semantics).
 * Callers must use append only.
 */
export function rejectOverwrite(_sink: AuditSink, _index: number, _event: AuditEvent): never {
  throw new AuditError("audit sink is append-only; overwrite rejected");
}
