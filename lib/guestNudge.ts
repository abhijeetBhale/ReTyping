const COUNT_KEY = "ff_guest_tests";
const DISMISSED_KEY = "ff_nudge_dismissed";

/** Tests finished while signed out. Shown after this many, the sign-in nudge appears. */
export const GUEST_NUDGE_AFTER = 3;

function readNumber(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    const n = raw === null ? 0 : Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

/** Record one finished guest test; returns the new total. */
export function recordGuestTest(): number {
  try {
    const next = readNumber(COUNT_KEY) + 1;
    localStorage.setItem(COUNT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function isNudgeDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return true;
  }
}

export function dismissNudge(): void {
  try {
    localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Storage unavailable: stay quiet, never nag without persistence.
  }
}
