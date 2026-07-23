import { test, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clear } from "@dyogas/kernel";
import { PersonalBrainProduct, buildMarkdownArtifact } from "../src/index.js";

let dataRoot = "";

beforeEach(() => {
  clear();
  dataRoot = mkdtempSync(join(tmpdir(), "pb-"));
  process.env.PERSONAL_BRAIN_DATA_DIR = dataRoot;
  process.env.GEMINI_API_KEY = "";
  process.env.JINA_API_KEY = "";
});

after(() => {
  if (dataRoot) rmSync(dataRoot, { recursive: true, force: true });
});

test("markdown artifact has frontmatter meta", () => {
  const { markdown, meta } = buildMarkdownArtifact({
    title: "Note",
    bodyMarkdown: "Body about local knowledge",
    source: "text",
    tags: ["brain", "mvp"],
    links: ["https://example.com"],
  });
  assert.match(markdown, /^---/);
  assert.equal(meta.title, "Note");
  assert.deepEqual(meta.tags, ["brain", "mvp"]);
});

test("product: capture text → approve → ask", async () => {
  const brain = PersonalBrainProduct.openOrCreate({
    userId: "tester",
    displayName: "Test Brain",
  });
  const p1 = await brain.capture({
    kind: "text",
    title: "Local-first thesis",
    text: "DYOGAS keeps personal knowledge local with human approval before storage.",
  });
  assert.equal(p1.status, "pending");
  const stored = await brain.approve(p1.id);
  assert.match(stored.markdown, /Local-first|personal knowledge/i);
  assert.ok(stored.tags.length >= 1);

  const p2 = await brain.capture({
    kind: "text",
    text: "Second note about citation grounded answers in personal brain.",
  });
  await brain.approve(p2.id);

  const asked = await brain.ask("personal knowledge approval");
  assert.equal(asked.status, "proposed");
  assert.ok(asked.id);
  assert.ok(asked.evidence.length >= 1);
  assert.ok(asked.proposedAnswer.length > 0);

  const approved = await brain.approveAsk(asked.id, {
    editedAnswer: `${asked.proposedAnswer}\n\n(Edited by owner)`,
    learn: true,
  });
  assert.equal(approved.status, "edited");
  assert.equal(approved.learnApplied, true);
  assert.ok(approved.learnedKnowledgeId);
  assert.ok(brain.listKnowledge().some((k) => k.knowledgeId === approved.learnedKnowledgeId));
});

test("product: ask reject does not learn", async () => {
  const brain = PersonalBrainProduct.openOrCreate({
    userId: "ask-reject",
    displayName: "Ask Reject",
  });
  const p = await brain.capture({
    kind: "text",
    title: "Note",
    text: "Knowledge about personal brain reject path.",
  });
  await brain.approve(p.id);
  const before = brain.listKnowledge().length;
  const asked = await brain.ask("personal brain reject");
  assert.equal(asked.status, "proposed");
  const rejected = brain.rejectAsk(asked.id);
  assert.equal(rejected.status, "rejected");
  assert.equal(brain.listKnowledge().length, before);
});

test("product: search filters knowledge", async () => {
  const brain = PersonalBrainProduct.openOrCreate({
    userId: "searcher",
    displayName: "Search Brain",
  });
  const p = await brain.capture({
    kind: "text",
    title: "Alpha topic",
    text: "UniqueTokenZebra appears only here for search.",
  });
  await brain.approve(p.id);
  const p2 = await brain.capture({
    kind: "text",
    title: "Other",
    text: "Unrelated content about weather.",
  });
  await brain.approve(p2.id);
  const hits = brain.searchKnowledge("UniqueTokenZebra");
  assert.equal(hits.length, 1);
  assert.match(hits[0]!.title, /Alpha/);
});

test("product: reject does not add knowledge", async () => {
  const brain = PersonalBrainProduct.openOrCreate({
    userId: "tester2",
    displayName: "T2",
  });
  const p = await brain.capture({ kind: "text", text: "reject me please content" });
  brain.reject(p.id);
  assert.equal(brain.listKnowledge().length, 0);
});
