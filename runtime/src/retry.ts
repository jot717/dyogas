export type FailureClass = "retryable" | "non_retryable";

export interface RetryPolicy {
  readonly maxAttempts: number;
}

export const DEFAULT_RETRY: RetryPolicy = { maxAttempts: 3 };

export class RetryExhaustedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryExhaustedError";
  }
}

export function classifyError(code: string): FailureClass {
  const nonRetryable = new Set([
    "SCHEMA_INVALID",
    "TENANCY_VIOLATION",
    "POLICY_DENY",
    "CONTRACT_PIN_MISSING",
    "UNSEALED_ARTIFACT",
  ]);
  return nonRetryable.has(code) ? "non_retryable" : "retryable";
}

/** Returns whether another attempt is allowed. */
export function shouldRetry(
  failureClass: FailureClass,
  attempt: number,
  policy: RetryPolicy = DEFAULT_RETRY,
): boolean {
  if (failureClass === "non_retryable") return false;
  return attempt < policy.maxAttempts;
}
