import type { Metadata } from "next";
import { HistorySignIn } from "@/components/HistorySignIn";
import { HistoryTable } from "@/components/HistoryTable";
import { getHistory, summarizeHistory } from "@/lib/history";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `History — ${SITE_NAME}`,
  description:
    "Your saved typing test history: WPM, accuracy, words, time, level and mode for every test you finished while signed in.",
  alternates: { canonical: "/history" },
  openGraph: {
  title: "History",
    description: "Your saved typing test history: WPM, accuracy and full test details.",
    url: `${SITE_URL}/history`,
  },
  robots: { index: false, follow: false },
};

function SetupNotice() {
  return (
    <div className="container-fluid">
      <main className="ff-history">
        <h1>History</h1>
        <div className="ff-history-empty">
          <p>Sign-in isn&apos;t configured yet.</p>
          <p className="ff-history-hint">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> (and the Render
            env vars), enable the Google provider in Supabase Auth, then redeploy.
          </p>
        </div>
      </main>
    </div>
  );
}

export default async function HistoryPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return (
      <div className="container-fluid">
        <main className="ff-history">
          <h1>History</h1>
          <p className="ff-history-sub">Sign in to see your saved typing tests.</p>
          <div className="ff-history-empty">
            <p>Your WPM scores, accuracy and full test details are saved here — but only when you&apos;re signed in.</p>
            <HistorySignIn />
          </div>
        </main>
      </div>
    );
  }

  const rows = await getHistory(supabase);
  const stats = summarizeHistory(rows);

  return (
    <div className="container-fluid">
      <main className="ff-history">
        <h1>History</h1>
        <p className="ff-history-sub" title={user.email ?? undefined}>
          {rows.length === 0
            ? "No saved tests yet — finish a typing test and it will appear here."
            : `Saved tests for ${user.email ?? "your account"}.`}
        </p>
        {rows.length > 0 && (
          <div className="ff-history-stats" role="status">
            <div className="ff-history-stat">
              <span className="ff-history-stat-value">{stats.tests}</span>
              <span className="ff-history-stat-label">Tests</span>
            </div>
            <div className="ff-history-stat">
              <span className="ff-history-stat-value">{stats.bestWpm.toFixed(0)}</span>
              <span className="ff-history-stat-label">Best WPM</span>
            </div>
            <div className="ff-history-stat">
              <span className="ff-history-stat-value">{stats.avgWpm.toFixed(0)}</span>
              <span className="ff-history-stat-label">Avg WPM</span>
            </div>
            <div className="ff-history-stat">
              <span className="ff-history-stat-value">{stats.avgAccuracy.toFixed(0)}%</span>
              <span className="ff-history-stat-label">Avg Acc</span>
            </div>
          </div>
        )}
        <HistoryTable initialRows={rows} />
      </main>
    </div>
  );
}
