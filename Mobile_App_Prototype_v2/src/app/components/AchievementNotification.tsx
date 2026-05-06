import { motion } from 'motion/react';
import { Achievement } from '../hooks/useAchievements';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      onAnimationComplete={() => setTimeout(onClose, 3000)}
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-yellow-300 to-orange-300 rounded-2xl shadow-2xl p-6 flex items-center gap-4 min-w-80">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
          className="text-5xl"
        >
          {achievement.icon}
        </motion.div>
        <div>
          <p className="font-bold text-purple-900 text-lg">🏆 Achievement Desbloqueado!</p>
          <p className="text-purple-900 font-semibold text-lg">{achievement.title}</p>
          <p className="text-sm text-purple-900">{achievement.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
