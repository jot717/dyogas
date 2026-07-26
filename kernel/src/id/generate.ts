import { randomBytes } from "node:crypto";

export interface IdEntropy {
  bytes(size: number): Uint8Array;
}

const systemEntropy: IdEntropy = {
  bytes(size: number): Uint8Array {
    return randomBytes(size);
  },
};

let entropy: IdEntropy = systemEntropy;

/** Test seam: inject entropy (and restore via resetEntropy). */
export function setEntropy(next: IdEntropy): void {
  entropy = next;
}

export function resetEntropy(): void {
  entropy = systemEntropy;
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

/** Opaque unique id (hex). No PII / tenant embedding. */
export function generateId(byteLength = 16): string {
  if (byteLength < 8) {
    throw new Error("byteLength must be >= 8");
  }
  return toHex(entropy.bytes(byteLength));
}

/** Correlation / run id helper — opaque; Kernel does not emit audit events. */
export function generateCorrelationId(): string {
  return generateId(16);
}
