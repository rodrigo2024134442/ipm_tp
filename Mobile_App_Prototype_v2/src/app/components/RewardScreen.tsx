import { useNavigate } from 'react-router';
import { Trophy, Star, Medal, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';

export default function RewardScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('canvas-confetti');
        const conf = (mod && (mod.default ?? mod));
        if (!mounted || typeof conf !== 'function') return;
        conf({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // fail silently if confetti cannot load
        console.warn('canvas-confetti failed to load', e);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const rewards = [
    { icon: Trophy, label: 'Autocontrolo', color: 'text-yellow-500' },
    { icon: Star, label: 'Esforço', color: 'text-blue-500' },
    { icon: Medal, label: 'Coragem', color: 'text-purple-500' },
  ];

  return (
    <div className="size-full flex flex-col items-center justify-center p-8 gap-8" style={{ background: 'linear-gradient(to bottom, rgb(253, 224, 71), rgb(253, 191, 111))' }}>
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        <Sparkles className="w-32 h-32 text-yellow-500 fill-yellow-400" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-bold text-purple-700 text-center"
      >
        Conseguiste acalmar-te!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-2xl text-purple-600 text-center max-w-md"
      >
        Parabéns! Controlaste as tuas emoções muito bem!
      </motion.p>

      <div className="flex gap-8 my-8">
        {rewards.map((reward, index) => (
          <motion.div
            key={reward.label}
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.2, type: 'spring' }}
            className="flex flex-col items-center gap-3"
          >
            <div className="p-6 bg-white rounded-full shadow-xl">
              <reward.icon className={`w-20 h-20 ${reward.color}`} />
            </div>
            <span className="text-lg font-semibold text-purple-700">{reward.label}</span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="p-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl shadow-xl text-white text-center max-w-md"
      >
        <p className="text-2xl font-bold">+ 100 Pontos</p>
        <p className="text-lg mt-2">Ganhaste uma nova conquista!</p>
      </motion.div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={() => navigate('/games')}
          className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          Jogar Mais
        </button>
        <button
          onClick={() => navigate('/menu')}
          className="px-10 py-5 bg-white text-purple-700 text-xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
