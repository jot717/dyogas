# @dyogas/runtime

**MOD-RUNTIME** · SPEC-RT-002 · ADR-0003 · Build Order **B7**

## Role

Runtime provides **execution primitives** consumed by the Pipeline Execution Host.

| Runtime IS | Runtime is NOT |
|------------|----------------|
| Run admission (`admitRun`) | The Pipeline Engine |
| Legal state transitions | Full `/pipelines` stage walker |
| Seal / accept handoff | Agent contract bind / skill orchestration |
| Retry helpers | Product Experience layer |
| Audit sink attach (via Trust) | Redefinition of Harness law |

**Execution Host** (`@dyogas/execution-host`, ADR-0010) composes Runtime to drive pinned pipelines under `/harness` law.

```text
Experience Product → Execution Host → Runtime → SDK → Agents
```

Depends on `@dyogas/kernel` + `@dyogas/trust`. Does **not** embed Agent SDK.

```bash
npm ci && npm test && npm run build
```
