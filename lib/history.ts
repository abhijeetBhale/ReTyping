import type { SupabaseClient } from "@supabase/supabase-js";
import type { GameMode } from "@/lib/config";

export interface TestResult {
  wpm: number;
  accuracy: number;
  correctWords: number;
  typedWords: number;
  durationMs: number;
  level: number;
  mode: GameMode;
}

export interface HistoryRow extends TestResult {
  id: string;
  createdAt: string;
}

interface DbRow {
  id: string;
  created_at: string;
  wpm: number;
  accuracy: number;
  correct_words: number;
  typed_words: number;
  duration_ms: number;
  level: number;
  mode: string;
}

function toHistoryRow(row: DbRow): HistoryRow {
  return {
    id: row.id,
    createdAt: row.created_at,
    wpm: Number(row.wpm),
    accuracy: Number(row.accuracy),
    correctWords: row.correct_words,
    typedWords: row.typed_words,
    durationMs: row.duration_ms,
    level: row.level,
    mode: (row.mode === "punctuation" || row.mode === "numbers" ? row.mode : "home") as GameMode,
  };
}

export async function saveTestResult(
  supabase: SupabaseClient,
  result: TestResult,
): Promise<{ ok: boolean; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { ok: false, error: "Not signed in — result not saved." };

  const { error } = await supabase.from("test_results").insert({
    user_id: user.id,
    wpm: Math.round(result.wpm * 10) / 10,
    accuracy: Math.round(result.accuracy * 10) / 10,
    correct_words: result.correctWords,
    typed_words: result.typedWords,
    duration_ms: result.durationMs,
    level: result.level,
    mode: result.mode,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getHistory(
  supabase: SupabaseClient,
  limit = 100,
): Promise<HistoryRow[]> {
  const { data, error } = await supabase
    .from("test_results")
    .select("id, created_at, wpm, accuracy, correct_words, typed_words, duration_ms, level, mode")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as DbRow[]).map(toHistoryRow);
}

export interface HistoryStats {
  tests: number;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
}

export function summarizeHistory(rows: HistoryRow[]): HistoryStats {
  if (rows.length === 0) return { tests: 0, bestWpm: 0, avgWpm: 0, avgAccuracy: 0 };
  const bestWpm = Math.max(...rows.map((r) => r.wpm));
  const avgWpm = rows.reduce((s, r) => s + r.wpm, 0) / rows.length;
  const avgAccuracy = rows.reduce((s, r) => s + r.accuracy, 0) / rows.length;
  return { tests: rows.length, bestWpm, avgWpm, avgAccuracy };
}
