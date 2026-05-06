import { useEffect, useState } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: AchievementStats) => boolean;
  unlockedAt?: string; // ISO timestamp
}

export interface AchievementStats {
  totalSessions: number;
  bestScore: number;
  totalStressEvents: number;
  autoRegulationEvents: number;
  gamesWithoutStress: number;
  consecutiveDaysPlayed: number;
  totalGameTime: number; // seconds
  gameWins: Map<string, number>;
  gameStreak: Map<string, number>; // consecutive wins
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    title: 'Primeiros Passos',
    description: 'Completou a primeira sessão',
    icon: '👶',
    condition: (stats) => stats.totalSessions >= 1,
  },
  {
    id: 'dedicated',
    title: 'Dedicação',
    description: 'Jogou 7 dias seguidos',
    icon: '📅',
    condition: (stats) => stats.consecutiveDaysPlayed >= 7,
  },
  {
    id: 'unstoppable',
    title: 'Imparável',
    description: 'Jogou 14 dias seguidos',
    icon: '🔥',
    condition: (stats) => stats.consecutiveDaysPlayed >= 14,
  },
  {
    id: 'legend',
    title: 'Lenda',
    description: 'Jogou 30 dias seguidos',
    icon: '⭐',
    condition: (stats) => stats.consecutiveDaysPlayed >= 30,
  },
  {
    id: 'stress-master',
    title: 'Mestre do Controlo',
    description: 'Jogou 5 vezes sem stress',
    icon: '😌',
    condition: (stats) => stats.gamesWithoutStress >= 5,
  },
  {
    id: 'perfect-breath',
    title: 'Respiração Perfeita',
    description: 'Auto-regulação 10 vezes',
    icon: '🌬️',
    condition: (stats) => stats.autoRegulationEvents >= 10,
  },
  {
    id: 'high-score',
    title: 'Record Pessoal',
    description: 'Atingiu 500+ pontos',
    icon: '🏆',
    condition: (stats) => stats.bestScore >= 500,
  },
  {
    id: 'champion',
    title: 'Campeão',
    description: 'Atingiu 1000+ pontos',
    icon: '👑',
    condition: (stats) => stats.bestScore >= 1000,
  },
  {
    id: 'winning-streak',
    title: 'Onda de Sorte',
    description: 'Venceu 5 jogos seguidos',
    icon: '🎯',
    condition: (stats) => {
      const maxStreak = Math.max(...Array.from(stats.gameStreak.values()));
      return maxStreak >= 5;
    },
  },
  {
    id: 'multi-master',
    title: 'Especialista',
    description: 'Jogou todos os 3 jogos',
    icon: '🎮',
    condition: (stats) => stats.gameWins.size >= 3,
  },
];

export const useAchievements = () => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  const loadAchievements = () => {
    try {
      const raw = localStorage.getItem('saberperder_achievements');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveAchievements = (achievements: Achievement[]) => {
    try {
      localStorage.setItem('saberperder_achievements', JSON.stringify(achievements));
    } catch {}
  };

  const checkAchievements = (stats: AchievementStats): Achievement[] => {
    const unlocked = loadAchievements();
    const newlyUnlocked: Achievement[] = [];

    ACHIEVEMENTS.forEach((achievement) => {
      const isUnlocked = unlocked.some((a: Achievement) => a.id === achievement.id);
      if (!isUnlocked && achievement.condition(stats)) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date().toISOString(),
        });
      }
    });

    if (newlyUnlocked.length > 0) {
      const allUnlocked = [...unlocked, ...newlyUnlocked];
      saveAchievements(allUnlocked);
      setNewAchievements(newlyUnlocked);
      setUnlockedAchievements(allUnlocked);
    }

    return newlyUnlocked;
  };

  useEffect(() => {
    setUnlockedAchievements(loadAchievements());
  }, []);

  return {
    achievements: ACHIEVEMENTS,
    unlockedAchievements,
    newAchievements,
    checkAchievements,
  };
};
