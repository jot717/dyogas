import {
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  createMemoryAuditSink,
  createSecretsVault,
  evaluateEgress,
  requireTrustIdentity,
} from "@dyogas/trust";

export function smoke(): string {
  propagate(createTenancyContext(createTenantId("fixture")));
  const id = requireTrustIdentity().tenantId;
  const secrets = createSecretsVault({ X: "1" });
  const audit = createMemoryAuditSink();
  const eg = evaluateEgress({ destination: "https://example.com", purpose: "test" }, audit);
  return `${id}:${secrets.get("X")}:${eg.decision}:${audit.list().length}`;
}
