import {
  decideApproval,
  enqueueApproval,
  type PendingApproval,
} from "@dyogas/human-gate";

/** In-memory approval console store for MVP operator UX. */
export class ApprovalConsole {
  private readonly items = new Map<string, PendingApproval>();

  list(): PendingApproval[] {
    return [...this.items.values()];
  }

  enqueue(input: {
    proposalId: string;
    researchArtifactId: string;
    painStatement: string;
  }): PendingApproval {
    const g = enqueueApproval(input);
    this.items.set(g.gateId, g);
    return g;
  }

  decide(
    gateId: string,
    decision: "approved" | "rejected",
    actorId: string,
  ): PendingApproval {
    const g = this.items.get(gateId);
    if (!g) throw new Error(`unknown gate ${gateId}`);
    const next = decideApproval(g, decision, actorId);
    this.items.set(gateId, next);
    return next;
  }
}
