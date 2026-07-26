/**
 * @dyogas/kernel — public export surface (ADR-0001 / SPEC-RT-001)
 */

export {
  type TenantId,
  type TenancyContext,
  TenancyError,
  createTenantId,
  createTenancyContext,
  propagate,
  clear,
  getContext,
  requireTenant,
  assertSameTenant,
} from "./tenancy/context.js";

export {
  type IdEntropy,
  generateId,
  generateCorrelationId,
  setEntropy,
  resetEntropy,
} from "./id/generate.js";

export {
  type Clock,
  SystemClock,
  FixedClock,
  setClock,
  resetClock,
  getClock,
} from "./clock/clock.js";

export {
  type KernelConfig,
  ConfigError,
  loadConfig,
} from "./config/load.js";

export {
  type StructuredLogFields,
  LogFieldError,
  buildLogFields,
  attachLogFields,
} from "./log/fields.js";
