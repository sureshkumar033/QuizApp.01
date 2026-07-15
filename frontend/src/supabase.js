import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseEnabled = Boolean(url && key);

export const supabase = supabaseEnabled
  ? createClient(url, key, { auth: { persistSession: false } })
  : null;

// Upsert current player stats to the shared leaderboard.
export async function syncScore({ username, score, total, streak, bestStreak }) {
  if (!supabase || !username) return;
  try {
    await supabase.from("scores").upsert(
      {
        username,
        score,
        total,
        streak,
        best_streak: bestStreak,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "username" },
    );
  } catch (e) {
    // Non-fatal — keep the quiz playable even if network fails.
    console.warn("syncScore failed", e);
  }
}

export async function fetchLeaderboard(limit = 100) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .order("best_streak", { ascending: false })
    .order("score", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("fetchLeaderboard failed", error);
    return [];
  }
  return data ?? [];
}

// Log every quiz answer (history / analytics).
export async function logAttempt({ username, category, difficulty, question, isCorrect, streakAfter, scoreAfter, totalAfter }) {
  if (!supabase || !username) return;
  try {
    await supabase.from("attempts").insert({
      username,
      category,
      difficulty,
      question,
      is_correct: isCorrect,
      streak_after: streakAfter,
      score_after: scoreAfter,
      total_after: totalAfter,
    });
  } catch (e) {
    console.warn("logAttempt failed", e);
  }
}

export async function fetchRecentAttempts(limit = 50, username = null) {
  if (!supabase) return [];
  let q = supabase.from("attempts").select("*").order("created_at", { ascending: false }).limit(limit);
  if (username) q = q.eq("username", username);
  const { data, error } = await q;
  if (error) { console.warn("fetchRecentAttempts failed", error); return []; }
  return data ?? [];
}
