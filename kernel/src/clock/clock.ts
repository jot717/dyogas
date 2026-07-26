export interface Clock {
  /** UTC instant as ISO-8601 string. */
  nowIso(): string;
  /** UTC epoch milliseconds. */
  nowMs(): number;
}

export class SystemClock implements Clock {
  nowIso(): string {
    return new Date().toISOString();
  }
  nowMs(): number {
    return Date.now();
  }
}

export class FixedClock implements Clock {
  constructor(private readonly ms: number) {}
  nowIso(): string {
    return new Date(this.ms).toISOString();
  }
  nowMs(): number {
    return this.ms;
  }
}

let active: Clock = new SystemClock();

export function setClock(clock: Clock): void {
  active = clock;
}

export function resetClock(): void {
  active = new SystemClock();
}

export function getClock(): Clock {
  return active;
}
