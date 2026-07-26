/**
 * SPRINT-EXECUTION-HOST-001 — Human Gate pause hook (compat with Phase 2).
 * Prefer openHumanGate from gate/human.ts for Phase 3.
 */

import type { PipelineStageDef } from "../pipeline/types.js";
import type { LineageContext } from "../lineage/context.js";

export type HumanGatePauseReason = "human_approval_required";

export type HumanGatePauseState = {
  readonly paused: true;
  readonly reason: HumanGatePauseReason;
  readonly stageIndex: number;
  readonly stageName: string;
  readonly lineage: LineageContext;
};

export type HumanGatePauseHook = (args: {
  stage: PipelineStageDef;
  lineage: LineageContext;
}) => HumanGatePauseState;

export const defaultHumanGatePause: HumanGatePauseHook = ({ stage, lineage }) => ({
  paused: true,
  reason: "human_approval_required",
  stageIndex: stage.index,
  stageName: stage.name,
  lineage,
});
