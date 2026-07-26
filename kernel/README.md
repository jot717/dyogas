# @dyogas/kernel

**Module:** MOD-KERNEL · **SPEC:** SPEC-RT-001 · **ADR:** ADR-0001 (Accepted)

Platform primitives: tenancy context, id generation, clock, config load, structured log fields.

## Non-goals

- No Harness / pipeline / agent-bind orchestration
- No Cloud AI egress
- No Knowledge SoR
- Kernel must not import `harness/`, `pipelines/`, or `contracts/` agent-runtime packages

## Public API

Import only from `@dyogas/kernel` (see `src/index.ts` / [API.md](./API.md)). Do not import internal paths.

## Develop

```bash
npm ci
npm test
npm run build
```

Requires Node.js 22+.
