import { useNavigate } from 'react-router';
import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="size-full flex flex-col items-center justify-center p-8" style={{ background: 'linear-gradient(to bottom, rgb(125, 211, 252), rgb(196, 181, 253))' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-32 h-32 text-pink-400 fill-pink-300" />
          </motion.div>
          <Sparkles className="absolute -top-2 -right-2 w-12 h-12 text-yellow-400 fill-yellow-300" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-center text-purple-700"
        >
          Saber Perder
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-center text-purple-600 max-w-md"
        >
          Aprende a lidar com a frustração de forma divertida!
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/menu')}
          className="mt-8 px-12 py-6 bg-gradient-to-r from-green-400 to-blue-400 text-white text-2xl font-bold rounded-full shadow-lg"
        >
          Começar
        </motion.button>
      </motion.div>
    </div>
  );
}
