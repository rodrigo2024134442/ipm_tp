import { motion } from 'motion/react';
import { useAchievements, Achievement } from '../hooks/useAchievements';
import { Lock } from 'lucide-react';

export default function AchievementsGrid() {
  const { achievements, unlockedAchievements } = useAchievements();

  const isUnlocked = (achievement: Achievement) => {
    return unlockedAchievements.some((a) => a.id === achievement.id);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-purple-900 mb-4">🏆 Achievements</h2>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
        {achievements.map((achievement, index) => {
          const unlocked = isUnlocked(achievement);
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl ${
                unlocked
                  ? 'bg-gradient-to-br from-yellow-300 to-orange-300 shadow-lg'
                  : 'bg-gray-200 opacity-50'
              }`}
              title={unlocked ? `${achievement.title}: ${achievement.description}` : 'Bloqueado'}
            >
              <div className="text-3xl">{achievement.icon}</div>
              <p className="text-xs font-bold text-center text-purple-900 leading-tight">
                {achievement.title.split(' ').slice(0, 2).join(' ')}
              </p>
              {!unlocked && <Lock className="absolute top-1 right-1 w-3 h-3 text-gray-400" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
