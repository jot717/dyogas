/**
 * @dyogas/trust — public export surface (SPEC-RT-004 / ADR-0002)
 */

export {
  TrustIdentityError,
  requireTrustIdentity,
} from "./identity/adapter.js";

export {
  type SecretsVault,
  SecretsError,
  createSecretsVault,
  isSecretKey,
} from "./secrets/vault.js";

export {
  type EgressRequest,
  type EgressResult,
  type EgressDecision,
  EgressDeniedError,
  RESEARCH_STAGE1_EGRESS_PURPOSE,
  evaluateEgress,
  assertEgressAllowed,
} from "./egress/gate.js";

export {
  type AuditEvent,
  type AuditSink,
  AuditError,
  createMemoryAuditSink,
  rejectOverwrite,
} from "./audit/sink.js";
