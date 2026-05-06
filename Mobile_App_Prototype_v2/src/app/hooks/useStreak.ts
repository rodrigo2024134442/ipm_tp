import { useEffect, useState } from 'react';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayDate: string | null;
  playedToday: boolean;
}

export const useStreak = (sessionCount: number) => {
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: null,
    playedToday: false,
  });

  const STORAGE_KEY = 'saberperder_streak';

  const loadStreak = (): StreakData => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { currentStreak: 0, longestStreak: 0, lastPlayDate: null, playedToday: false };
    } catch {
      return { currentStreak: 0, longestStreak: 0, lastPlayDate: null, playedToday: false };
    }
  };

  const saveStreak = (data: StreakData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  const updateStreak = () => {
    const current = loadStreak();
    const today = new Date().toISOString().split('T')[0];
    
    if (current.playedToday) {
      return; // Já jogou hoje
    }

    const lastPlay = current.lastPlayDate ? new Date(current.lastPlayDate).toISOString().split('T')[0] : null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = current.currentStreak;

    if (lastPlay === yesterday) {
      // Continuou a série
      newStreak = current.currentStreak + 1;
    } else if (lastPlay !== today) {
      // Quebrou a série ou é a primeira vez
      newStreak = 1;
    }

    const updated: StreakData = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, current.longestStreak),
      lastPlayDate: new Date().toISOString(),
      playedToday: true,
    };

    saveStreak(updated);
    setStreak(updated);
  };

  useEffect(() => {
    const current = loadStreak();
    
    // Reset playedToday se for novo dia
    const today = new Date().toISOString().split('T')[0];
    const lastPlay = current.lastPlayDate ? new Date(current.lastPlayDate).toISOString().split('T')[0] : null;
    
    if (lastPlay !== today) {
      current.playedToday = false;
      saveStreak(current);
    }
    
    setStreak(current);
  }, []);

  return { streak, updateStreak };
};
