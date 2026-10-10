"use client";

import { useCallback, useState } from "react";
import type { HistoryRow } from "@/lib/history";
import { createClient } from "@/lib/supabase/client";
import { LEVEL_META } from "@/lib/words";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryTable({ initialRows }: { initialRows: HistoryRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const removeRow = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("test_results").delete().eq("id", id);
      if (!error) setRows((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }, []);

  const clearAll = useCallback(async () => {
    if (!window.confirm("Delete your entire test history? This cannot be undone.")) return;
    setClearing(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;
      const { error } = await supabase.from("test_results").delete().eq("user_id", userId);
      if (!error) setRows([]);
    } finally {
      setClearing(false);
    }
  }, []);

  if (rows.length === 0) {
    return (
      <div className="ff-history-empty">
        <p>No saved tests yet. Finish a typing test while signed in and it will show up here.</p>
      </div>
    );
  }

  return (
    <div className="ff-history-wrap">
      <div className="ff-history-actions">
        <button type="button" className="ff-history-clear" onClick={clearAll} disabled={clearing}>
          {clearing ? "Clearing…" : "Clear history"}
        </button>
      </div>
      <div className="ff-history-table-scroll">
        <table className="ff-history-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col" className="num">WPM</th>
              <th scope="col" className="num">Acc</th>
              <th scope="col" className="num">Words</th>
              <th scope="col">Time</th>
              <th scope="col">Level</th>
              <th scope="col">Mode</th>
              <th scope="col"><span className="ff-sr-only">Delete</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDate(row.createdAt)}</td>
                <td className="num ff-history-wpm">{row.wpm.toFixed(0)}</td>
                <td className="num">{row.accuracy.toFixed(0)}%</td>
                <td className="num">{row.correctWords}/{row.typedWords}</td>
                <td>{Math.round(row.durationMs / 1000)}s</td>
                <td>{LEVEL_META[row.level as keyof typeof LEVEL_META]?.label ?? row.level}</td>
                <td>{row.mode}</td>
                <td>
                  <button
                    type="button"
                    className="ff-history-delete"
                    onClick={() => removeRow(row.id)}
                    disabled={deletingId === row.id}
                    aria-label={`Delete test from ${formatDate(row.createdAt)}`}
                  >
                    {deletingId === row.id ? "…" : "✕"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
