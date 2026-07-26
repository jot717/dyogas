/**
 * SPRINT-EXECUTION-HOST-001 — Group H apply token (T-H3).
 * Single-use, version-bound, artifact-bound. Host overlay only.
 */

import { randomUUID } from "node:crypto";
import { HostError } from "../errors.js";

export type ApplyToken = {
  readonly token_id: string;
  readonly run_id: string;
  readonly proposal_artifact_id: string;
  readonly proposal_version: string;
  readonly minted_at: string;
  consumed: boolean;
  consumed_for?: "knowledge";
};

export function mintApplyToken(args: {
  run_id: string;
  proposal_artifact_id: string;
  proposal_version: string;
  minted_at?: string;
}): ApplyToken {
  return {
    token_id: randomUUID(),
    run_id: args.run_id,
    proposal_artifact_id: args.proposal_artifact_id,
    proposal_version: args.proposal_version,
    minted_at: args.minted_at ?? new Date().toISOString(),
    consumed: false,
  };
}

/** Consume token for Knowledge apply — single use. */
export function consumeApplyTokenForKnowledge(
  token: ApplyToken,
  bound: { artifact_id: string; version: string; run_id: string },
): void {
  if (token.consumed) {
    throw new HostError("APPLY_TOKEN_REUSED", "apply token already consumed");
  }
  if (token.run_id !== bound.run_id) {
    throw new HostError("APPLY_TOKEN_MISMATCH", "token run_id mismatch");
  }
  if (
    token.proposal_artifact_id !== bound.artifact_id ||
    token.proposal_version !== bound.version
  ) {
    throw new HostError(
      "APPLY_TOKEN_MISMATCH",
      "token not bound to this proposal artifact@version",
    );
  }
  token.consumed = true;
  token.consumed_for = "knowledge";
}

export function assertTokenUnused(token: ApplyToken | undefined): void {
  if (!token) {
    throw new HostError("APPLY_TOKEN_REQUIRED", "apply token required");
  }
  if (token.consumed) {
    throw new HostError("APPLY_TOKEN_REUSED", "apply token already consumed");
  }
}
