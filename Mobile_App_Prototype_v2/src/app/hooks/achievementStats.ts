import type { SessionData } from '../context/AppContext';
import type { AchievementStats } from './useAchievements';

export type AchievementSessionLike = Pick<
  SessionData,
  'game' | 'maxHeartRate' | 'stressEvents' | 'autoRegulationEvents' | 'completed' | 'score'
> & {
  timestamp?: string;
};

function dayKey(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayDiff(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((db.getTime() - da.getTime()) / ms);
}

export function buildAchievementStats(sessions: AchievementSessionLike[]): AchievementStats {
  const ordered = [...sessions].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return ta - tb;
  });

  const totalSessions = ordered.length;
  const bestScore = ordered.reduce((max, s) => Math.max(max, s.score), 0);
  const totalStressEvents = ordered.reduce((sum, s) => sum + s.stressEvents, 0);
  const autoRegulationEvents = ordered.reduce((sum, s) => sum + (s.autoRegulationEvents || 0), 0);
  const gamesWithoutStress = ordered.filter((s) => s.completed && s.stressEvents === 0).length;

  const uniqueDays = Array.from(new Set(ordered.map((s) => dayKey(s.timestamp)).filter(Boolean))).sort();
  let consecutiveDaysPlayed = 0;
  if (uniqueDays.length > 0) {
    consecutiveDaysPlayed = 1;
    for (let i = uniqueDays.length - 1; i > 0; i--) {
      if (dayDiff(uniqueDays[i - 1], uniqueDays[i]) === 1) consecutiveDaysPlayed += 1;
      else break;
    }
  }

  const gameWins = new Map<string, number>();
  const gameStreak = new Map<string, number>();
  const perGameCurrentStreak = new Map<string, number>();

  ordered.forEach((session) => {
    if (session.completed) {
      gameWins.set(session.game, (gameWins.get(session.game) ?? 0) + 1);
      const nextStreak = (perGameCurrentStreak.get(session.game) ?? 0) + 1;
      perGameCurrentStreak.set(session.game, nextStreak);
      gameStreak.set(session.game, nextStreak);
    } else {
      perGameCurrentStreak.set(session.game, 0);
      if (!gameStreak.has(session.game)) gameStreak.set(session.game, 0);
    }
  });

  const totalGameTime = ordered.reduce((sum, s) => sum + Math.max(1, s.score) * 10, 0);

  return {
    totalSessions,
    bestScore,
    totalStressEvents,
    autoRegulationEvents,
    gamesWithoutStress,
    consecutiveDaysPlayed,
    totalGameTime,
    gameWins,
    gameStreak,
  };
}