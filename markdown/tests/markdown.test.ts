import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import type { MarkdownHandoffContract } from "@dyogas/knowledge-engine";
import * as md from "../src/index.js";
import {
  buildReviewReadyMarkdown,
  MarkdownError,
  renderMarkdownCandidate,
} from "../src/index.js";

beforeEach(() => clear());

function handoff(
  overrides: Partial<MarkdownHandoffContract> = {},
): MarkdownHandoffContract {
  return {
    contractVersion: "1.0.0",
    tenantId: "t1",
    knowledgeId: "k-1",
    version: 1,
    title: "Local-first knowledge",
    body: "Approved body from Knowledge SoR handoff.",
    rendered: false,
    ...overrides,
  };
}

test("tenancy required", () => {
  assert.throws(() => renderMarkdownCandidate({ handoff: handoff() }));
});

test("renders review-ready markdown with citations section", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = renderMarkdownCandidate({
    handoff: handoff(),
    citations: [
      { key: "c1", source: "https://example.com/a", excerpt: "excerpt A" },
    ],
  });
  assert.match(result.markdownBody, /^# Local-first knowledge/m);
  assert.match(result.markdownBody, /## Citations/);
  assert.match(result.markdownBody, /\[c1\].*example\.com/);
  assert.equal(result.candidate.sealed, false);
  assert.equal(result.candidate.artifactType, "knowledge/markdown");
  assert.equal(result.candidate.producedBy, "markdown-agent");
  assert.equal(result.binding.agentId, "markdown-agent");
  assert.equal(result.run.state, "SUCCEEDED");
});

test("tenant mismatch fails closed", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  assert.throws(
    () =>
      renderMarkdownCandidate({
        handoff: handoff({ tenantId: "other" }),
      }),
    MarkdownError,
  );
});

test("equivalent plain input accepted", () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const result = renderMarkdownCandidate({
    handoff: {
      title: "T",
      body: "B",
      knowledgeId: "k-2",
      tenantId: "t1",
      version: 2,
    },
  });
  assert.match(result.markdownBody, /## Citations/);
  assert.match(result.markdownBody, /No citations provided/);
  assert.equal(result.candidate.sealed, false);
});

test("buildReviewReadyMarkdown is pure", () => {
  const body = buildReviewReadyMarkdown(
    {
      title: "T",
      body: "Body",
      knowledgeId: "k",
      tenantId: "t",
      version: 1,
    },
    [{ key: "x", source: "src" }],
  );
  assert.match(body, /\[x\] src/);
});

test("no UI exports", () => {
  assert.equal(/listen|express|createServer/i.test(Object.keys(md).join(" ")), false);
});
