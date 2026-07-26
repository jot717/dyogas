import {
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { createMemoryAuditSink } from "@dyogas/trust";
import { admitRun, startRun, succeed } from "@dyogas/runtime";

export function smoke(): string {
  propagate(createTenancyContext(createTenantId("fx")));
  const audit = createMemoryAuditSink();
  let run = admitRun({
    pipelineId: "knowledge-ingestion",
    contractPin: "research-agent@1.0.0",
    audit,
  });
  run = succeed(startRun(run));
  return `${run.state}:${audit.list().length}`;
}
