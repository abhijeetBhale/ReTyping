export const GAME_TIME_MS = 30 * 1000;
export const WORD_COUNT = 300;

/** Test durations offered in the nav (legacy 15s/30s/60s links were dead; now real state). */
export const DURATIONS_MS = [15_000, 30_000, 60_000] as const;
export type DurationMs = (typeof DURATIONS_MS)[number];

export type GameMode = "home" | "punctuation" | "numbers";
