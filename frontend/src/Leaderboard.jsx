import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Trophy, Medal, Award, Flame, Target, ArrowLeft, RefreshCw } from "lucide-react";
import { fetchLeaderboard, supabaseEnabled } from "./supabase.js";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await fetchLeaderboard(100);
    setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    setMe(localStorage.getItem("brainwave:user") ?? "");
    load();
  }, []);

  const myRank = rows.findIndex((r) => r.username === me);

  return (
    <main className="relative min-h-screen bg-hero">
      <div className="pointer-events-none absolute -left-40 top-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-5 py-8">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">Brainwave</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to quiz
            </Link>
          </div>
        </header>

        <section className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-accent">
            <Trophy className="h-3.5 w-3.5" /> Global Leaderboard
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Top Minds</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ranked by best streak, then total score. All players welcome.
          </p>
          {me && myRank >= 0 && (
            <p className="mt-3 text-xs text-primary-glow">
              You are ranked #{myRank + 1} — keep going!
            </p>
          )}
          {!supabaseEnabled && (
            <p className="mt-3 text-xs text-destructive">
              Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
            </p>
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur">
          <div className="grid grid-cols-12 gap-2 border-b border-border bg-background/30 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-right">Best</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-2 text-right">Acc.</div>
          </div>

          {loading && rows.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
          )}

          {!loading && rows.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No scores yet. Be the first — head to the quiz!
            </div>
          )}

          <ul className="divide-y divide-border">
            {rows.map((r, i) => {
              const rank = i + 1;
              const accuracy = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
              const isMe = r.username === me;
              const rankIcon =
                rank === 1 ? <Trophy className="h-3.5 w-3.5 text-yellow-400" /> :
                rank === 2 ? <Medal className="h-3.5 w-3.5 text-slate-300" /> :
                rank === 3 ? <Award className="h-3.5 w-3.5 text-amber-600" /> : null;
              return (
                <li
                  key={r.id ?? r.username}
                  className={`grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm transition ${
                    isMe ? "bg-primary/10" : "hover:bg-background/30"
                  }`}
                >
                  <div className="col-span-1 flex items-center gap-1.5 text-muted-foreground">
                    {rankIcon ?? <span className="text-xs">{rank}</span>}
                  </div>
                  <div className="col-span-5 truncate font-medium">
                    {r.username}
                    {isMe && <span className="ml-2 text-[10px] uppercase tracking-wider text-primary-glow">you</span>}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1 font-display font-semibold">
                    <Flame className="h-3.5 w-3.5 text-accent" />{r.best_streak}
                  </div>
                  <div className="col-span-2 text-right font-display font-semibold">{r.score}</div>
                  <div className="col-span-2 flex items-center justify-end gap-1 text-muted-foreground">
                    <Target className="h-3 w-3" />{accuracy}%
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
