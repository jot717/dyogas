# @dyogas/eng-agent

**Layer:** Development Harness (build side)  
**Owner:** MOD-ENGINEERING  
**Auth:** [`DL-ENG-AGENT-IMPLEMENTATION-001`](../../docs/decision-log/DL-ENG-AGENT-IMPLEMENTATION-001.md) **APPROVED**  
**Sprint:** [`SPRINT-ENG-AGENT-IMPLEMENTATION-001`](../../sprints/SPRINT-ENG-AGENT-IMPLEMENTATION-001.md)

Development Harness Engineering Agent: execute **authorized** engineering tasks under the
`tools/dev-orch` loop (task adapter → verifier feed → evidence).

```text
Development Harness builds DYOGAS.
Execution Harness runs DYOGAS.
```

## Not this package

- Hosted `MOD-ENG-AGENTS` / B17
- New Platform Module
- Agent marketplace
- Runtime / Agent SDK / Execution Host replacement
- Autonomous product agents

## Scripts

```bash
npm ci
npm test
npm run build
```

## Forbidden dependencies

`@dyogas/runtime` · `@dyogas/agent-sdk` · `@dyogas/execution-host` · product packages
