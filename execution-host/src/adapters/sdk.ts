/**
 * SPRINT-EXECUTION-HOST-001 — Group F SDK adapter (T-F1..F2).
 * Wraps @dyogas/agent-sdk public exports only. No admit via SDK. No new skills.
 */

import {
  bindContract,
  ContractBindError,
  emitCandidate,
  invokeSkill,
  SkillError,
  CandidateError,
  type AgentContractBinding,
  type BindRequest,
  type CandidateArtifact,
  type SkillHandler,
} from "@dyogas/agent-sdk";
import { HostError } from "../errors.js";
import type { PipelineStageDef } from "../pipeline/types.js";
import { resolveStageContract } from "../contracts/stage-map.js";

/** Exact SDK symbols consumed (T-F1 inventory). */
export const SDK_SYMBOLS_USED = [
  "bindContract",
  "invokeSkill",
  "emitCandidate",
  "ContractBindError",
  "SkillError",
  "CandidateError",
] as const;

function mapSdkError(err: unknown): never {
  if (err instanceof HostError) throw err;
  if (err instanceof ContractBindError) {
    throw new HostError("SDK_BIND_ERROR", err.message);
  }
  if (err instanceof SkillError) {
    throw new HostError("SDK_SKILL_ERROR", err.message);
  }
  if (err instanceof CandidateError) {
    throw new HostError("SDK_CANDIDATE_ERROR", err.message);
  }
  throw new HostError(
    "SDK_ERROR",
    err instanceof Error ? err.message : String(err),
  );
}

export type SdkAdapter = {
  readonly bindStage: (
    stage: PipelineStageDef,
    opts?: {
      satisfiedPreconditions?: readonly string[];
      allowedSkillsOverride?: readonly string[];
    },
  ) => AgentContractBinding;
  readonly invokeSkill: (
    binding: AgentContractBinding,
    skillId: string,
    input: Record<string, unknown>,
    handlers: Record<string, SkillHandler>,
  ) => Promise<Record<string, unknown>>;
  readonly emitCandidate: (
    binding: AgentContractBinding,
    opts: {
      artifactType: string;
      tenantId: string;
      payload: Record<string, unknown>;
    },
  ) => CandidateArtifact;
};

export function createSdkAdapter(): SdkAdapter {
  return {
    bindStage(stage, opts) {
      try {
        const pin = resolveStageContract(stage);
        const skills = opts?.allowedSkillsOverride ?? pin.allowedSkills;
        const req: BindRequest = {
          agentId: pin.agentId,
          contractVersion: pin.contractVersion,
          allowedSkills: [...skills],
          satisfiedPreconditions: opts?.satisfiedPreconditions ?? [
            "tenancy_present",
          ],
        };
        return bindContract(req);
      } catch (e) {
        mapSdkError(e);
      }
    },
    async invokeSkill(binding, skillId, input, handlers) {
      try {
        return await invokeSkill(binding, skillId, input, handlers);
      } catch (e) {
        mapSdkError(e);
      }
    },
    emitCandidate(binding, opts) {
      try {
        return emitCandidate(binding, opts);
      } catch (e) {
        mapSdkError(e);
      }
    },
  };
}
