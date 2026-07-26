import type { AgentContractBinding } from "../contract/bind.js";

export class SkillError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkillError";
  }
}

export type SkillHandler = (input: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;

/**
 * Invoke a skill only if present on the contract allowlist.
 * MVP: handler registry is in-process stubs (engines supply real skills later).
 */
export async function invokeSkill(
  binding: AgentContractBinding,
  skillId: string,
  input: Record<string, unknown>,
  handlers: Record<string, SkillHandler>,
): Promise<Record<string, unknown>> {
  if (!binding.allowedSkills.includes(skillId)) {
    throw new SkillError(`skill not on allowlist: ${skillId}`);
  }
  const handler = handlers[skillId];
  if (!handler) throw new SkillError(`skill handler missing: ${skillId}`);
  return handler(input);
}
