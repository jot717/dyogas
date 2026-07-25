# MOD-PERSONAL-BRAIN — Module Status

**Module:** MOD-PERSONAL-BRAIN (Personal Second Brain)  
**Product SSOT:** [`specs/SPEC-PRODUCT-MASTER.md`](./specs/SPEC-PRODUCT-MASTER.md)  
**Bridge contract:** [`specs/SPEC-PROD-004-HARNESS-BRIDGE.md`](./specs/SPEC-PROD-004-HARNESS-BRIDGE.md) — **`accepted`**  
**Package:** `@dyogas/personal-brain@0.2.0`  
**ADR-0009:** Accepted · **ADR-0010:** Accepted (consume Execution Host)  
**Auth:** [`docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md`](../docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md)  
**Active sprint:** [`sprints/SPRINT-PB-HARNESS-BRIDGE-001.md`](./sprints/SPRINT-PB-HARNESS-BRIDGE-001.md)  
**Task registry:** [`tasks/TASK-REGISTRY-PB-HARNESS-BRIDGE-001.md`](./tasks/TASK-REGISTRY-PB-HARNESS-BRIDGE-001.md)

| Layer | Status |
|-------|--------|
| DYOGAS Core deps (kernel/trust/…) | Unmodified consumers only |
| Execution Host | **Consume** via `ExecutionHost.createRun()` (not Runtime-as-orchestrator) — path **AVAILABLE** (`stage/bridge/B5-host-createRun-verdict.md`) |
| Personal Brain Core | Present |
| External Connection Layer | Present |
| Product UI Layer | **REMOVED** |
| Harness Bridge | Spec **`accepted`**; `SPRINT-PB-HARNESS-BRIDGE-001` **COMPLETE** — Exit **PASS**; Host createRun **AVAILABLE**; **READY FOR BRIDGE CODING** (follow-on sprint; no Runtime/SDK/Host rewrite) |

**Entry path (binding):** Personal Brain → **`ExecutionHost.createRun()`** → Host → Runtime primitives → SDK → Agents → Human Approval → Knowledge → Graph (ADR-0010). Product must not call Runtime as orchestrator.

**Next:** Authorize Bridge coding sprint (consume Host public APIs; F4 harness executable; address OPEN GAPs with evidence only). UI is not the next SSOT milestone. Decision Intelligence remains future.

**Archived product specs:** `specs/archive/ARCHIVED-SPEC-PROD-001.md` … `003` (superseded by SPEC-PRODUCT-MASTER).

**Evidence:** `stage/PRODUCT_LAYER_REMOVAL.md` · `specs/SPEC-PRODUCT-MASTER.md` · `specs/SPEC-PROD-004-HARNESS-BRIDGE.md` · `sprints/SPRINT-PB-HARNESS-BRIDGE-001.md` · `stage/bridge/G2-sprint-exit.md` · `stage/bridge/` (B5, E3, F4, GAP Registry)
