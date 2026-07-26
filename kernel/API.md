# Kernel API Overview

**SPEC-RT-001** goals:

1. Minimal primitives: tenancy, id, clock, config, structured log fields  
2. No product/Harness orchestration in Kernel  
3. Enable Trust/Runtime to depend on Kernel without cycles  

**Non-goals:** pipeline engine, agent bind, egress, SoR, UI, Hosted Engineering Agents.

**Success metrics:**

| Metric | How Kernel proves it |
|--------|----------------------|
| Tenancy isolation 100% | `tests/tenancy.test.ts` |
| No Harness/orchestration imports | `tests/boundary.test.ts` |
| Runtime can link Kernel APIs | `fixtures/consumer` build |

## Exports

- **Tenancy:** `createTenantId`, `createTenancyContext`, `propagate`, `clear`, `requireTenant`, `assertSameTenant`, `TenancyError`
- **Id:** `generateId`, `generateCorrelationId`, `setEntropy` / `resetEntropy`
- **Clock:** `SystemClock`, `FixedClock`, `getClock`, `setClock`, `resetClock`
- **Config:** `loadConfig`, `ConfigError` (env source; unknown keys ignored; secrets redacted in dump)
- **Log fields:** `buildLogFields`, `attachLogFields`, `LogFieldError`

See also: `docs/child-scope-nongoal.md`, `docs/tenancy-config-nongoal.md`, `docs/clock-guidance.md`.
