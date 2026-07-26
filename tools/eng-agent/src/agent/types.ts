/**
 * Engineering execution agent types.
 */

import type { AdaptedTask } from "../adapter/types.js";
import type { GateView } from "../adapter/types.js";

/** Operator / implementation facts supplied to the agent — never invented. */
export interface ExecutionFacts {
  /** Files created or modified during the authorized cycle. */
  changedFiles: readonly string[];
  /** Test run outcome (must be supplied; agent does not invent). */
  testResult: {
    ran: boolean;
    passed: boolean;
    summary: string;
  };
  /** Evidence path claimed by the implementation cycle. */
  evidenceReference: string;
  /** Whether the evidence artifact exists. */
  evidenceExists: boolean;
  /** Per-AC evidence from the implementer. */
  acceptanceCriteriaEvidence: readonly {
    criterion: string;
    status: "PASS" | "FAIL";
  }[];
  /** SSOT citations present in evidence. */
  ssotCitationsPresent: boolean;
  /** Gaps registered OPEN when discovered. */
  gapsRegisteredOpen: boolean;
}

export interface ExecutionAgentInput {
  adapted: AdaptedTask;
  gate: GateView;
  /** Current registry status before commit. */
  currentStatus: "READY_FOR_EXECUTION" | "IN_PROGRESS" | "DONE" | "BLOCKED" | "PENDING";
  facts: ExecutionFacts;
}

export interface AuthorizedExecution {
  taskId: string;
  sprintId: string;
  allowedScope: string;
  forbiddenScope: string;
}

export type ExecutionRefuse = {
  ok: false;
  refused: true;
  reason: string;
};

export type ExecutionResult =
  | {
      ok: true;
      authorized: AuthorizedExecution;
      facts: ExecutionFacts;
      /** Agent never claims verifier PASS — recommendation deferred. */
      verifierPassInvented: false;
    }
  | ExecutionRefuse;

export type AuthorizeResult =
  | { ok: true; authorized: AuthorizedExecution }
  | { ok: false; reason: string };
