# Trust API Overview

**SPEC-RT-004** success metrics: deny-default egress; audit append integrity; secrets not logged raw; Kernel-only deps; Runtime linkability.

## Exports

- **Identity:** `requireTrustIdentity`, `TrustIdentityError`
- **Secrets:** `createSecretsVault`, `isSecretKey`, `SecretsError`
- **Egress:** `evaluateEgress`, `assertEgressAllowed`, `EgressDeniedError`
- **Audit:** `createMemoryAuditSink`, `rejectOverwrite`, `AuditError`
