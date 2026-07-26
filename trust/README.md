# @dyogas/trust

**Module:** MOD-TRUST · **SPEC:** SPEC-RT-004 · **ADR-0002:** Accepted

Trust & Control adapters: identity (Kernel tenancy), secrets, deny-by-default egress, append-only audit.

## Non-goals

- No Cloud AI vendor / allow-cloud (superseding ADR required)
- No Harness orchestration / pipelines / agent-bind
- No Knowledge SoR mutation
- Do not modify `@dyogas/kernel`

## Develop

```bash
npm ci
npm test
npm run build
```

Node.js 22+.
