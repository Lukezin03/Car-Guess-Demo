import { supabase } from "./supabase";

export const SCORE_BY_ATTEMPTS = Object.freeze({
  1: 80,
  2: 70,
  3: 60,
  4: 50,
  5: 40,
  6: 32,
  7: 25,
  8: 18,
  9: 12,
  10: 8,
});

export function getPointsForResult(attempts, result) {
  if (result !== "win") return 0;
  return SCORE_BY_ATTEMPTS[attempts] ?? 0;
}

export async function createGame({ user_id, answer_car_id, attempts, result }) {
  const { data, error } = await supabase
    .from("games")
    .insert([
      {
        user_id,
        answer_car_id,
        attempts,
        result,
      },
    ])
    .select()
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getWeeklyLeaderboard() {
  const weekStartDate = getCurrentWeekStart();
  const nextWeekStartDate = new Date(weekStartDate);
  nextWeekStartDate.setDate(nextWeekStartDate.getDate() + 7);

  const weekStartKey = formatDateKey(weekStartDate);

  const [{ data: weeklyRows, error: weeklyError }, { data: gameRows, error: gamesError }] =
    await Promise.all([
      supabase
        .from("weekly_leaderboard")
        .select(
          "week_start, user_id, display_name, wins, games_played, best_attempts, avg_attempts, last_game_at",
        )
        .eq("week_start", weekStartKey),
      supabase
        .from("games")
        .select("user_id, attempts, result, created_at")
        .gte("created_at", weekStartDate.toISOString())
        .lt("created_at", nextWeekStartDate.toISOString()),
    ]);

  const weekLabel = formatWeekLabel(weekStartDate);

  if (weeklyError) {
    return { data: [], weekLabel, error: weeklyError };
  }

  if (gamesError) {
    return { data: [], weekLabel, error: gamesError };
  }

  const pointsByUser = (gameRows ?? []).reduce((map, game) => {
    const currentPoints = map.get(game.user_id) ?? 0;
    map.set(
      game.user_id,
      currentPoints + getPointsForResult(game.attempts, game.result),
    );
    return map;
  }, new Map());

  const data = (weeklyRows ?? [])
    .map((row) => ({
      userId: row.user_id,
      displayName: row.display_name,
      wins: row.wins ?? 0,
      gamesPlayed: row.games_played ?? 0,
      bestAttempts: row.best_attempts ?? null,
      avgAttempts: row.avg_attempts ?? null,
      lastGameAt: row.last_game_at ?? null,
      totalPoints: pointsByUser.get(row.user_id) ?? 0,
    }))
    .sort((left, right) => {
      if (left.totalPoints !== right.totalPoints) {
        return right.totalPoints - left.totalPoints;
      }

      if (left.wins !== right.wins) {
        return right.wins - left.wins;
      }

      if (left.bestAttempts !== right.bestAttempts) {
        if (left.bestAttempts === null) return 1;
        if (right.bestAttempts === null) return -1;
        return left.bestAttempts - right.bestAttempts;
      }

      return new Date(right.lastGameAt ?? 0) - new Date(left.lastGameAt ?? 0);
    });

  return { data, weekLabel, error: null };
}

function getCurrentWeekStart() {
  const now = new Date();
  const weekStart = new Date(now);
  const currentDay = weekStart.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() + diffToMonday);

  return weekStart;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekLabel(weekStartDate) {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return `${weekStartDate.toLocaleDateString("pt-BR")} a ${weekEndDate.toLocaleDateString("pt-BR")}`;
}
