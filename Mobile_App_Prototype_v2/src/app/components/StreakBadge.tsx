import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { StreakData } from '../hooks/useStreak';

interface StreakBadgeProps {
  streak: StreakData;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  if (streak.currentStreak === 0) return null;

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
      className={`flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full shadow-lg font-bold ${sizeClasses[size]}`}
    >
      <Flame className={iconSize[size]} />
      <span>{streak.currentStreak} dias</span>
    </motion.div>
  );
}
