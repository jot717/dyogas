import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  clear,
  createTenantId,
  createTenancyContext,
  propagate,
} from "@dyogas/kernel";
import {
  createPersonalBrain,
  normalizeCapture,
  PersonalBrainError,
} from "../src/index.js";

beforeEach(() => clear());

test("workspace boundary rejects non-owner", async () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const brain = createPersonalBrain({
    ownerUserId: "alice",
    displayName: "Alice Brain",
  });
  await assert.rejects(
    () =>
      brain.capture(
        { kind: "text", text: "hello personal knowledge" },
        "bob",
      ),
    PersonalBrainError,
  );
});

test("text + url capture → ask grounded answer", async () => {
  propagate(createTenancyContext(createTenantId("t1")));
  const brain = createPersonalBrain({
    ownerUserId: "alice",
    displayName: "Alice Brain",
  });

  const note = await brain.capture(
    {
      kind: "text",
      title: "Local-first notes",
      text: "DYOGAS keeps personal knowledge local with human approval gates.",
    },
    "alice",
  );
  assert.equal(note.source.kind, "text");
  assert.ok(note.knowledgeId);

  const urlCap = await brain.capture(
    {
      kind: "url",
      url: "https://example.com/second-brain",
      text: "Article about second brain workflows",
    },
    "alice",
  );
  assert.equal(urlCap.source.kind, "url");
  assert.equal(urlCap.source.url, "https://example.com/second-brain");

  const listed = brain.list("alice");
  assert.equal(listed.length, 2);

  const answer = brain.ask("personal knowledge local approval", "alice");
  assert.ok(answer.hits.length >= 1);
  assert.ok(answer.citations.some((c) => c.knowledgeId === note.knowledgeId));
  assert.match(answer.answer, /personal knowledge/i);
});

test("url capture does not fetch — metadata only", () => {
  const c = normalizeCapture({
    kind: "url",
    url: "https://example.com/x",
  });
  assert.match(c.body, /No fetch performed/);
});

test("empty text capture fails", () => {
  assert.throws(() => normalizeCapture({ kind: "text", text: "  " }));
});
