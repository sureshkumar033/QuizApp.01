import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Check, X, Sparkles, Flame, Target, RotateCcw, LogOut, Trophy } from "lucide-react";
import { QUESTIONS } from "./questions.js";
import { syncScore, logAttempt } from "./supabase.js";

const CATEGORIES = ["Mixed", "History", "Science", "Geography", "Sports", "Arts & Literature", "Technology", "Culture"];
const AUTO_NEXT_MS = 3500;

function shuffleOptions(q) {
  const correctAnswer = q.options[q.correctIndex];
  const shuffled = [...q.options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { ...q, options: shuffled, correctIndex: shuffled.indexOf(correctAnswer) };
}

function pickQuestion(category, difficulty, asked) {
  let pool = QUESTIONS.filter(
    (q) => (category === "Mixed" || q.category === category) && q.difficulty === difficulty,
  );
  if (pool.length === 0) pool = QUESTIONS.filter((q) => category === "Mixed" || q.category === category);
  if (pool.length === 0) pool = QUESTIONS;

  const fresh = pool.filter((q) => !asked.includes(q.question));
  let exhausted = false;
  let finalPool = fresh;
  if (fresh.length === 0) { exhausted = true; finalPool = pool; }
  const picked = finalPool[Math.floor(Math.random() * finalPool.length)];
  return { q: shuffleOptions(picked), exhausted };
}

export default function Quiz() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [category, setCategory] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("medium");
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const askedRef = useRef([]);
  const autoNextRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem("brainwave:user");
    if (!u) { navigate("/"); return; }
    setUser(u);
    setScore(Number(localStorage.getItem(`bw:${u}:score`) ?? 0));
    setTotal(Number(localStorage.getItem(`bw:${u}:total`) ?? 0));
    setBestStreak(Number(localStorage.getItem(`bw:${u}:best`) ?? 0));
  }, [navigate]);

  const loadQuestion = useCallback(() => {
    setSelected(null);
    setProgress(0);
    const { q, exhausted } = pickQuestion(category, difficulty, askedRef.current);
    askedRef.current = exhausted ? [q.question] : [...askedRef.current, q.question];
    setQuestion(q);
  }, [category, difficulty]);

  useEffect(() => { if (user && !question) loadQuestion(); }, [user, question, loadQuestion]);
  useEffect(() => { askedRef.current = []; }, [category, difficulty]);
  useEffect(() => () => {
    if (autoNextRef.current) clearTimeout(autoNextRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  }, []);

  const choose = (i) => {
    if (selected !== null || !question) return;
    setSelected(i);
    const correct = i === question.correctIndex;
    const newTotal = total + 1;
    setTotal(newTotal);
    localStorage.setItem(`bw:${user}:total`, String(newTotal));
    let nScore = score;
    let nStreak = 0;
    let nBest = bestStreak;
    if (correct) {
      nScore = score + 1;
      setScore(nScore);
      localStorage.setItem(`bw:${user}:score`, String(nScore));
      nStreak = streak + 1;
      setStreak(nStreak);
      nBest = Math.max(bestStreak, nStreak);
      if (nStreak > bestStreak) {
        setBestStreak(nBest);
        localStorage.setItem(`bw:${user}:best`, String(nBest));
      }
    } else {
      setStreak(0);
    }
    syncScore({ username: user, score: nScore, total: newTotal, streak: nStreak, bestStreak: nBest });
    logAttempt({
      username: user,
      category: question.category,
      difficulty: question.difficulty,
      question: question.question,
      isCorrect: correct,
      streakAfter: nStreak,
      scoreAfter: nScore,
      totalAfter: newTotal,
    });

    const start = Date.now();
    progressRef.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / AUTO_NEXT_MS) * 100);
      setProgress(pct);
      if (pct >= 100 && progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    }, 30);

    autoNextRef.current = setTimeout(() => {
      if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
      loadQuestion();
    }, AUTO_NEXT_MS);
  };

  const reset = () => {
    if (!confirm("Reset your stats?")) return;
    setScore(0); setTotal(0); setStreak(0); setBestStreak(0);
    localStorage.removeItem(`bw:${user}:score`);
    localStorage.removeItem(`bw:${user}:total`);
    localStorage.removeItem(`bw:${user}:best`);
    syncScore({ username: user, score: 0, total: 0, streak: 0, bestStreak: 0 });
  };

  const logout = () => {
    localStorage.removeItem("brainwave:user");
    navigate("/");
  };

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const poolSize = useMemo(
    () => QUESTIONS.filter((q) => category === "Mixed" || q.category === category).length,
    [category],
  );
  const rank =
    bestStreak >= 25 ? "Polymath" :
    bestStreak >= 15 ? "Scholar" :
    bestStreak >= 8 ? "Curious" :
    bestStreak >= 3 ? "Apprentice" : "Novice";

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
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
              <Trophy className="h-3 w-3 text-accent" />
              <span className="text-foreground font-medium">{user}</span>
              <span className="text-muted-foreground/60">·</span>
              <span className="text-accent">{rank}</span>
            </span>
            <Link to="/leaderboard" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Trophy className="h-3.5 w-3.5" /> Leaderboard
            </Link>
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-3 gap-3">
          <StatCard icon={<Target className="h-4 w-4" />} label="Accuracy" value={`${accuracy}%`} />
          <StatCard icon={<Flame className="h-4 w-4" />} label="Streak" value={String(streak)} hint={`best ${bestStreak}`} />
          <StatCard icon={<Sparkles className="h-4 w-4" />} label="Answered" value={`${score}/${total}`} />
        </section>

        <section className="mt-6 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Category <span className="text-muted-foreground/60">· {poolSize} questions</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:border-ring focus:outline-none"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</label>
            <div className="mt-1 flex gap-1.5">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition ${
                    difficulty === d
                      ? "border-primary bg-primary/15 text-primary-glow"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mt-6">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-primary opacity-20 blur-2xl" />
          <div key={question?.question} className="min-h-[420px] rounded-3xl border border-border bg-gradient-card p-7 shadow-card backdrop-blur-xl animate-fade-in">
            {question && (
              <>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span className="rounded-md bg-primary/20 px-2 py-0.5 text-primary-glow">{question.category}</span>
                    <span className="capitalize">{question.difficulty}</span>
                  </span>
                  <span>Question {total + (selected === null ? 1 : 0)}</span>
                </div>

                <div className="mt-3 h-1 overflow-hidden rounded-full bg-background/40">
                  <div
                    className="h-full rounded-full bg-gradient-primary transition-[width] duration-75 ease-linear"
                    style={{ width: `${selected === null ? 0 : progress}%` }}
                  />
                </div>

                <h2 className="mt-5 font-display text-2xl font-semibold leading-snug sm:text-[26px]">
                  {question.question}
                </h2>

                <div className="mt-6 space-y-2.5">
                  {question.options.map((opt, i) => {
                    const isCorrect = i === question.correctIndex;
                    const isPicked = selected === i;
                    const showState = selected !== null;
                    let cls = "border-border bg-background/30 hover:border-primary/60 hover:bg-primary/10 hover:translate-x-0.5";
                    if (showState && isCorrect) cls = "border-success/70 bg-success/15 text-success animate-pop-correct";
                    else if (showState && isPicked && !isCorrect) cls = "border-destructive/70 bg-destructive/15 text-destructive animate-shake-wrong";
                    else if (showState) cls = "border-border bg-background/20 opacity-60";
                    return (
                      <button
                        key={i}
                        onClick={() => choose(i)}
                        disabled={selected !== null}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${cls}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`grid h-6 w-6 place-items-center rounded-md border text-xs ${
                            showState && isCorrect ? "border-success/60 bg-success/20 text-success" :
                            showState && isPicked && !isCorrect ? "border-destructive/60 bg-destructive/20 text-destructive" :
                            "border-border bg-background/40 text-muted-foreground"
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </span>
                        {showState && isCorrect && <Check className="h-4 w-4" />}
                        {showState && isPicked && !isCorrect && <X className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>

                {selected !== null && (
                  <div className="mt-6 rounded-xl border border-border bg-background/40 p-4 text-sm animate-slide-up-in">
                    <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {selected === question.correctIndex ? "✓ Correct" : "✗ Not quite"}
                    </div>
                    <p className="mt-1.5 text-muted-foreground">{question.explanation}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {QUESTIONS.length} curated questions across {CATEGORIES.length - 1} categories.
        </p>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur transition hover:border-primary/40">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="text-accent">{icon}</span>{label}
      </div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
