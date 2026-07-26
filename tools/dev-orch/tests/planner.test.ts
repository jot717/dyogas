/**
 * P2-03 — Planner selector tests.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import type { RegistryTask, TaskRegistry } from "../src/types.ts";
import { selectNextTask } from "../src/planner/select.ts";

function task(
  partial: Partial<RegistryTask> & Pick<RegistryTask, "id" | "status">,
): RegistryTask {
  return {
    title: partial.title ?? partial.id,
    statusRaw: partial.statusRaw ?? partial.status,
    dependencies: partial.dependencies ?? [],
    acceptanceCriteria: partial.acceptanceCriteria ?? "ac",
    testRequirement: partial.testRequirement ?? "test",
    evidence: partial.evidence ?? "",
    ...partial,
  };
}

function registry(
  tasks: RegistryTask[],
  currentExecutableTask: string | null = null,
): TaskRegistry {
  return {
    registryId: "TASK-REGISTRY-FIXTURE-PLANNER",
    currentExecutableTask,
    tasks,
  };
}

test("planner: select single READY task", () => {
  const result = selectNextTask(
    registry([
      task({ id: "A-01", status: "DONE" }),
      task({ id: "A-02", status: "READY_FOR_EXECUTION", dependencies: ["A-01"] }),
      task({ id: "A-03", status: "PENDING", dependencies: ["A-02"] }),
    ]),
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.task.id, "A-02");
});

test("planner: skip DONE tasks", () => {
  const result = selectNextTask(
    registry([
      task({ id: "B-01", status: "DONE" }),
      task({ id: "B-02", status: "DONE" }),
      task({ id: "B-03", status: "READY_FOR_EXECUTION", dependencies: ["B-02"] }),
    ]),
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.task.id, "B-03");
  assert.notEqual(result.task.status, "DONE");
});

test("planner: skip blocked dependency (READY but dep not DONE)", () => {
  const result = selectNextTask(
    registry([
      task({ id: "C-01", status: "PENDING" }),
      task({
        id: "C-02",
        status: "READY_FOR_EXECUTION",
        dependencies: ["C-01"],
      }),
    ]),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.reason, "DEPENDENCY_VIOLATION");
  assert.match(result.message, /C-01/);
});

test("planner: fail when no executable task exists", () => {
  const result = selectNextTask(
    registry([
      task({ id: "D-01", status: "DONE" }),
      task({ id: "D-02", status: "BLOCKED" }),
      task({ id: "D-03", status: "PENDING" }),
      task({ id: "D-04", status: "IN_PROGRESS" }),
    ]),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.reason, "NO_READY_TASK");
});

test("planner: fail when multiple ambiguous READY tasks exist", () => {
  const result = selectNextTask(
    registry(
      [
        task({ id: "E-01", status: "DONE" }),
        task({
          id: "E-02",
          status: "READY_FOR_EXECUTION",
          dependencies: ["E-01"],
        }),
        task({
          id: "E-03",
          status: "READY_FOR_EXECUTION",
          dependencies: ["E-01"],
        }),
      ],
      null,
    ),
  );
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.reason, "AMBIGUOUS_READY_TASKS");
  assert.deepEqual(result.candidateIds?.sort(), ["E-02", "E-03"]);
});

test("planner: Process pointer disambiguates multiple READY", () => {
  const result = selectNextTask(
    registry(
      [
        task({ id: "F-01", status: "DONE" }),
        task({
          id: "F-02",
          status: "READY_FOR_EXECUTION",
          dependencies: ["F-01"],
        }),
        task({
          id: "F-03",
          status: "READY_FOR_EXECUTION",
          dependencies: ["F-01"],
        }),
      ],
      "F-03",
    ),
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.task.id, "F-03");
});

test("planner: ignores IN_PROGRESS and BLOCKED even if listed", () => {
  const result = selectNextTask(
    registry([
      task({ id: "G-01", status: "DONE" }),
      task({ id: "G-02", status: "IN_PROGRESS", dependencies: ["G-01"] }),
      task({ id: "G-03", status: "BLOCKED", dependencies: ["G-01"] }),
      task({
        id: "G-04",
        status: "READY_FOR_EXECUTION",
        dependencies: ["G-01"],
      }),
    ]),
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.task.id, "G-04");
});
