# Debug Log — Phase 3 (G / I / H)

**Sprint:** SPRINT-EXECUTION-HOST-001  
**Trace:** TRACE-EXEC-HOST-001

| Event | Resolution |
|-------|------------|
| `tsc`: `ArtifactRef.artifact_id` typo | Use Runtime public field `artifactId` |
| Human Gate vs Runtime states | Host overlay only (`paused`/`approved`/…); no Runtime state machine edits (GAP-EH-001) |
| Apply token single-use vs Graph | Knowledge consume token; Graph requires Knowledge in lineage; presenting consumed `token_id` → `APPLY_TOKEN_REUSED` |

No Runtime/SDK/Harness patches.

**End**
