import { bindContract, emitCandidate } from "@dyogas/agent-sdk";

export function smoke(): string {
  const b = bindContract({
    agentId: "research-agent",
    contractVersion: "1.0.0",
    allowedSkills: ["web-research"],
    satisfiedPreconditions: ["tenancy_present"],
  });
  const c = emitCandidate(b, {
    artifactType: "research-report",
    tenantId: "t",
    payload: {},
  });
  return `${b.agentId}:${c.sealed}`;
}
