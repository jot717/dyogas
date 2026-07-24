# MOD-PERSONAL-BRAIN — Module Status

**Module:** MOD-PERSONAL-BRAIN (Personal Second Brain)  
**Product SSOT:** [`specs/SPEC-PRODUCT-MASTER.md`](./specs/SPEC-PRODUCT-MASTER.md)  
**Bridge contract:** [`specs/SPEC-PROD-004-HARNESS-BRIDGE.md`](./specs/SPEC-PROD-004-HARNESS-BRIDGE.md) — **`accepted`**  
**Package:** `@dyogas/personal-brain@0.2.0`  
**ADR-0009:** Accepted · **ADR-0010:** Accepted (consume Execution Host)  
**Auth:** [`docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md`](../docs/decision-log/DL-PB-HARNESS-BRIDGE-001.md)

| Layer | Status |
|-------|--------|
| DYOGAS Core deps (kernel/trust/…) | Unmodified consumers only |
| Execution Host | **Consume** via `ExecutionHost.createRun()` (not Runtime-as-orchestrator) |
| Personal Brain Core | Present |
| External Connection Layer | Present |
| Product UI Layer | **REMOVED** |
| Harness Bridge | Spec `accepted`; sprint planned — implementation not started |

**Next:** Execute `SPRINT-PB-HARNESS-BRIDGE-001` — Personal Brain requests **Execution Host** (`createRun` → Host → `Runtime.admitRun()` primitives → SDK → Agents → Human Approval → Knowledge → Graph). UI is not the next SSOT milestone. Decision Intelligence remains future.

**Archived product specs:** `specs/archive/ARCHIVED-SPEC-PROD-001.md` … `003` (superseded by SPEC-PRODUCT-MASTER).

**Evidence:** `stage/PRODUCT_LAYER_REMOVAL.md` · `specs/SPEC-PRODUCT-MASTER.md` · `specs/SPEC-PROD-004-HARNESS-BRIDGE.md` · `sprints/SPRINT-PB-HARNESS-BRIDGE-001.md`
