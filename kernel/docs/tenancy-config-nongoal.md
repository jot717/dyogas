# Tenancy-aware config overlay — deferred non-goal

**BL-K-043 decision:** defer tenancy-aware config overlay.

MVP config is process env via `loadConfig`. Per-tenant overlays belong with Runtime/Trust once multi-tenant deployment needs them.

Recorded in MODULE_STATUS.
