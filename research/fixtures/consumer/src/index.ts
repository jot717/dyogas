import {
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import { runResearchMvp } from "@dyogas/research-engine";

export async function smoke(): Promise<string> {
  propagate(createTenancyContext(createTenantId("fx")));
  const r = await runResearchMvp({
    brief: {
      question: "fixture",
      allowedSourceClasses: ["mock"],
      maxItems: 1,
    },
  });
  return `${r.task.status}:${r.evidence.length}:${r.approvalHandoff.decision}`;
}
