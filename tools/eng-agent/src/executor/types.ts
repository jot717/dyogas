/**
 * Executor types — real command/file execution with observed results.
 */

export type ExecutionStep =
  | {
      type: "writeFile";
      path: string;
      contents: string;
    }
  | {
      type: "runCommand";
      command: string;
      args: readonly string[];
      cwd?: string;
    }
  | {
      type: "runTest";
      /** Invoked as: node --test <targets...> */
      targets: readonly string[];
      cwd?: string;
    };

export interface ExecutionPlan {
  taskId: string;
  steps: readonly ExecutionStep[];
  /** Path where evidence JSON will be written (observed by verifier). */
  evidencePath: string;
}

export interface CommandObservation {
  command: string;
  args: readonly string[];
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface WriteObservation {
  path: string;
  bytesWritten: number;
  existedAfter: boolean;
}

export interface StepObservation {
  index: number;
  step: ExecutionStep;
  ok: boolean;
  write?: WriteObservation;
  command?: CommandObservation;
  error?: string;
}

export interface ExecutorObservation {
  taskId: string;
  mode: "dry-run" | "apply";
  steps: readonly StepObservation[];
  /** All command/test exit codes observed (empty in dry-run). */
  commandExitCodes: readonly number[];
  /** Paths written (apply) or would-write (dry-run). */
  writtenPaths: readonly string[];
  /** Wall evidence path intended for this cycle. */
  evidencePath: string;
  /** Whether evidencePath exists on disk after cycle (set by harness after evidence write). */
  evidenceExistsOnDisk: boolean;
  allStepsOk: boolean;
}

export interface ExecutorContext {
  mode: "dry-run" | "apply";
  /** Repo / workspace root for resolving relative paths. */
  workspaceRoot: string;
  /** Optional injectables for tests. */
  runCommand?: CommandRunner;
  writeFile?: (absPath: string, contents: string) => void;
  fileExists?: (absPath: string) => boolean;
}

export type CommandRunner = (input: {
  command: string;
  args: readonly string[];
  cwd: string;
}) => Promise<CommandObservation> | CommandObservation;

export type ExecutePlanResult =
  | { ok: true; observation: ExecutorObservation }
  | { ok: false; error: string; observation?: ExecutorObservation };
