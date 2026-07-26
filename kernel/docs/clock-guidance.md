# Clock guidance for Runtime consumers

- **Wall clock (`SystemClock` / `nowIso`):** timestamps for audit fields, config freshness, human-readable logs. Subject to NTP skew.
- **Monotonic:** Kernel MVP does not export a monotonic clock. For durations/timeouts inside Runtime, prefer `process.hrtime.bigint()` or a future Kernel API via Spec — do not use wall clock diffs for scheduling correctness.
