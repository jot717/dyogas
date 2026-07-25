/**
 * C-01 — Research Request Builder unit tests.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ALLOWED_SOURCE_CLASSES,
  DEFAULT_BUDGET_MAX_ITEMS,
  buildResearchBriefBootstrap,
  stampBootstrapRunId,
} from "../src/bridge/research-request.js";
import { PersonalBrainError } from "../src/workspace.js";

const base = {
  intent: "Research AI Agent market",
  workspace_id: "ws-1",
  owner_id: "owner-1",
  tenant_id: "tenant-1",
  correlation_id: "corr-1",
} as const;

test("C-01-T1: maps intent → question and tenancy/identity", () => {
  const built = buildResearchBriefBootstrap({ ...base });
  assert.equal(built.bootstrap.question, "Research AI Agent market");
  assert.equal(built.bootstrap.tenancy.tenant_id, "tenant-1");
  assert.equal(built.bootstrap.tenancy.workspace_id, "ws-1");
  assert.equal(built.identity.caller_id, "owner-1");
  assert.equal(built.identity.correlation_id, "corr-1");
  assert.equal(built.identity.tenant_id, "tenant-1");
  assert.equal(built.bootstrap.run_id, undefined);
});

test("C-01-T2: default scope / sources / budget when optional omitted", () => {
  const built = buildResearchBriefBootstrap({ ...base });
  assert.equal(built.bootstrap.scope, "personal-brain workspace:ws-1");
  assert.deepEqual(
    built.bootstrap.allowed_source_classes,
    [...DEFAULT_ALLOWED_SOURCE_CLASSES],
  );
  assert.deepEqual(built.bootstrap.budget, {
    max_items: DEFAULT_BUDGET_MAX_ITEMS,
  });
});

test("C-01-T3: fail-closed on missing required fields", () => {
  for (const key of [
    "intent",
    "workspace_id",
    "owner_id",
    "tenant_id",
    "correlation_id",
  ] as const) {
    assert.throws(
      () =>
        buildResearchBriefBootstrap({
          ...base,
          [key]: "  ",
        }),
      (err: unknown) => err instanceof PersonalBrainError,
    );
  }
});

test("C-01-T4: notes not mapped; constraints string wrapped", () => {
  const built = buildResearchBriefBootstrap({
    ...base,
    notes: "secret side channel",
    constraints: "public sources only",
    scope_hints: "AI agents 2026",
    allowed_source_classes: ["web", "github"],
    budget_placeholder: { max_items: 5, max_seconds: 60 },
  });
  assert.equal(built.bootstrap.scope, "AI agents 2026");
  assert.deepEqual(built.bootstrap.allowed_source_classes, ["web", "github"]);
  assert.deepEqual(built.bootstrap.budget, {
    max_items: 5,
    max_seconds: 60,
  });
  assert.deepEqual(built.bootstrap.constraints, { text: "public sources only" });
  assert.equal(
    Object.prototype.hasOwnProperty.call(built.bootstrap, "notes"),
    false,
  );
});

test("C-01-T5: reject invalid source class and budget", () => {
  assert.throws(
    () =>
      buildResearchBriefBootstrap({
        ...base,
        allowed_source_classes: ["ftp"],
      }),
    (err: unknown) => err instanceof PersonalBrainError,
  );
  assert.throws(
    () =>
      buildResearchBriefBootstrap({
        ...base,
        budget_placeholder: 0,
      }),
    (err: unknown) => err instanceof PersonalBrainError,
  );
});

test("C-01-T6: stampBootstrapRunId after Host assign", () => {
  const built = buildResearchBriefBootstrap({ ...base });
  const stamped = stampBootstrapRunId(built.bootstrap, "run-abc");
  assert.equal(stamped.run_id, "run-abc");
  assert.equal(built.bootstrap.run_id, undefined);
});

test("C-01-T7: builder module does not import Runtime or Host", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const src = fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../src/bridge/research-request.ts",
    ),
    "utf8",
  );
  assert.equal(/@dyogas\/runtime/.test(src), false);
  assert.equal(/@dyogas\/execution-host/.test(src), false);
  assert.equal(/\badmitRun\b/.test(src), false);
});
