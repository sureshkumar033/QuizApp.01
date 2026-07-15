import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Sparkles, Trophy, Zap, ArrowRight, BookOpen, Globe2, Flame } from "lucide-react";
import { QUESTIONS } from "./questions.js";

export default function Landing() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("brainwave:user");
    if (u) setExisting(u);
  }, []);

  const start = (e) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;
    localStorage.setItem("brainwave:user", name);
    navigate("/quiz");
  };

  const resume = () => navigate("/quiz");

  const categories = Array.from(new Set(QUESTIONS.map((q) => q.category)));

  return (
    <main className="relative min-h-screen overflow-hidden bg-hero">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-glow/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow animate-pulse-glow">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight leading-none">Brainwave</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">General Knowledge</div>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1.5"><Globe2 className="h-4 w-4 text-accent" /> {categories.length} topics</span>
            <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-accent" /> {QUESTIONS.length}+ questions</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-accent" /> No sign-up</span>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-2 lg:py-16">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              {QUESTIONS.length}+ curated questions · shuffled every round
            </div>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Train the mind that <span className="text-gradient">knows the world.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              A daily dose of general knowledge — history, science, geography, sport, culture.
              Shuffled answers, no repeats, instant feedback.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border bg-card/40 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur transition hover:border-primary/60 hover:text-foreground"
                >
                  {c}
                </span>
              ))}
            </div>

            <form onSubmit={start} className="mt-8 max-w-md rounded-2xl border border-border bg-gradient-card p-5 shadow-card backdrop-blur">
              <label htmlFor="user" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Enter a username to begin
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. curious_mind"
                  className="h-12 flex-1 rounded-lg border border-input bg-background/40 px-4 text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
                  maxLength={24}
                />
                <button
                  type="submit"
                  disabled={!username.trim()}
                  className="inline-flex h-12 items-center gap-1.5 rounded-lg bg-gradient-primary px-5 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  Start <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              {existing && (
                <button
                  type="button"
                  onClick={resume}
                  className="mt-3 text-xs text-accent hover:underline"
                >
                  Continue as <span className="font-semibold">{existing}</span> →
                </button>
              )}
              <div className="mt-3 text-[11px] text-muted-foreground">
                <Link to="/leaderboard" className="hover:text-accent">View leaderboard →</Link>
              </div>
            </form>
          </div>

          <div className="relative animate-fade-in" style={{ animationDelay: "120ms" }}>
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-primary opacity-30 blur-2xl" />
            <div className="rounded-3xl border border-border bg-gradient-card p-6 shadow-card backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 text-primary-glow">Geography</span>
                  Medium
                </span>
                <span className="inline-flex items-center gap-1 text-accent"><Flame className="h-3 w-3" /> streak 7</span>
              </div>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-background/40">
                <div className="h-full w-2/3 rounded-full bg-gradient-primary" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold leading-snug">
                Which river flows through the city of Vienna?
              </h3>
              <div className="mt-5 space-y-2">
                {[
                  { t: "Rhine", s: "" },
                  { t: "Danube", s: "correct" },
                  { t: "Elbe", s: "" },
                  { t: "Vistula", s: "" },
                ].map((o, i) => (
                  <div
                    key={o.t}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                      o.s === "correct"
                        ? "border-success/60 bg-success/10 text-success"
                        : "border-border bg-background/30 text-foreground/80"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-6 w-6 place-items-center rounded-md border border-border bg-background/40 text-xs text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {o.t}
                    </span>
                    {o.s === "correct" && <Trophy className="h-4 w-4" />}
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-xl bg-background/40 p-3 text-xs text-muted-foreground">
                <span className="text-accent">Insight ·</span> The Danube is Europe's second-longest river and passes through 10 countries.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-10 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "Shuffled answers", desc: "Correct option position is randomized." },
            { icon: Trophy, title: "Track streaks", desc: "Score, accuracy, best run — saved locally." },
            { icon: Brain, title: "Built to teach", desc: "Every answer comes with an explanation." },
          ].map((f, i) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card/40 p-5 backdrop-blur transition hover:border-primary/50 hover:bg-card/60 animate-fade-in"
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-accent transition group-hover:bg-primary/25">
                <f.icon className="h-4 w-4" />
              </div>
              <div className="mt-3 font-display font-semibold">{f.title}</div>
              <div className="text-sm text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
