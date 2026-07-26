import type { GraphEdge, GraphNode, GraphUpdate } from "./types.js";

/**
 * Process-lifetime in-memory graph — NOT a durable graph DB (still deferred).
 */
export interface InMemoryGraphStore {
  readonly apply: (update: GraphUpdate) => void;
  readonly listNodes: () => readonly GraphNode[];
  readonly listEdges: () => readonly GraphEdge[];
}

export function createMemoryGraphStore(): InMemoryGraphStore {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  return {
    apply(update) {
      if (update.mode !== "apply") return;
      for (const n of update.nodes) nodes.set(n.node_id, n);
      for (const e of update.edges) edges.set(e.edge_id, e);
    },
    listNodes: () => Object.freeze([...nodes.values()]),
    listEdges: () => Object.freeze([...edges.values()]),
  };
}
