# Contract: Decision Asset Agent

**Contract Version:** 2.0.0  
**Status:** Binding — Supporting / Meta Agent (Foundation)  
**Effective:** 2026-07-26  
**Schema Bundle:** [/schemas/agents/decision-asset-agent.schema.json](../../schemas/agents/decision-asset-agent.schema.json)  
**Artifact Schema:** [/schemas/artifacts/decision-asset.schema.json](../../schemas/artifacts/decision-asset.schema.json)  
**Artifact Spec:** [/artifacts/decision-asset.md](../../artifacts/decision-asset.md)  
**Decision Log:** [/docs/decision-log/DL-DECISION-ASSET-AGENT-FOUNDATION-001.md](../../docs/decision-log/DL-DECISION-ASSET-AGENT-FOUNDATION-001.md)  
**Implementation:** `tools/decision-asset-agent/` (`@dyogas/decision-asset-agent`) — **not** a Platform Module  

> Wire `contract_version` remains `"1.0.0"`. See [/contracts/README.md §4](../README.md).

---

## 1. Purpose

Transform **Research evidence** into a **Decision Asset** — a bounded, provenance-complete
decision-ready package — then require **human approval** before Knowledge SoR / Decision Graph
persistence. Does not invent facts, self-approve, or redesign Host/Runtime/SDK.

## 2. Scope

### In scope
- Extract Decision Asset from `EvidenceItem[]` / Research Agent outputs.
- Optionally correlate a Task Agent Execution Package `taskId`.
- Route through Human Approval Gate.
- Persist approved content via Knowledge + Decision Graph foundation APIs.

### Out of scope
- New Platform MOD; Runtime/SDK/Host/Product; Decision Model UI; fabrication.

## 3. Role

Evidence → Decision Asset composer. Not a SoR writer until human approval.

## 4. Input

| Field | Required | Notes |
|-------|----------|-------|
| `evidence` | yes | Research `EvidenceItem[]` |
| `tenant_id` | yes | |
| `task_id` | yes | |
| `research_artifact_id` | yes | |
| `question` | yes | Decision question |
| `execution_package_task_id` | no | Task Agent package correlation |

## 5. Output

`DecisionAsset` — see artifact schema. `requires_human_approval: true` always.

## 6. Forbidden

Self-approve · fabricate evidence · write SoR without approval · Host redesign.

## 7. References

Research Agent · Task Agent · Decision Graph Foundation · human-gate · ADR-0005/0006

---

**End of Decision Asset Agent Contract v2.0.0**
