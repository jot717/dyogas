# @dyogas/agent-sdk

**MOD-AGENT-SDK** · SPEC-RT-003 · ADR-0004 · Build Order **B8**

## Role

Agent SDK binds agents and skills. It does **not** orchestrate pipelines.

| SDK IS | SDK is NOT |
|--------|------------|
| Contract bind (`bindContract`) | Pipeline orchestrator |
| Allowlisted skill invocation | Run admission (that is Runtime) |
| Contract / skill pinning | Stage topology / `/pipelines` loading |
| Tools / memory contracts | Execution Host / Harness law |
| Unsealed candidate emission | Human Approval authority |

**Execution Host** schedules stages and invokes the SDK inside Execute phases. Products must not use the SDK as a shadow orchestrator.

```text
Experience Product → Execution Host → Runtime → SDK → Agents
```

Depends on `@dyogas/kernel` + `@dyogas/trust` + `@dyogas/runtime` (public). Does **not** replace Runtime.

```bash
npm ci && npm test && npm run build
```
