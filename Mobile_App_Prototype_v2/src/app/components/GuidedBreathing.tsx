import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Smartphone, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function GuidedBreathing() {
  const navigate = useNavigate();
  const { resetStress, stopHeartRateMonitoring, lastGamePath, setLastGamePath, accessibility } = useApp();
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycles, setCycles] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [done, setDone] = useState(false);

  const TOTAL_CYCLES = 3;

  const timings = { inhale: 4000, hold: 2000, exhale: 6000 };

  useEffect(() => {
    if (!isActive || done) return;
    const timer = setTimeout(() => {
      if (phase === 'inhale') setPhase('hold');
      else if (phase === 'hold') setPhase('exhale');
      else {
        const next = cycles + 1;
        setCycles(next);
        if (next >= TOTAL_CYCLES) {
          setDone(true);
          setIsActive(false);
          resetStress();
          stopHeartRateMonitoring();
        } else {
          setPhase('inhale');
        }
      }
    }, timings[phase]);
    return () => clearTimeout(timer);
  }, [phase, isActive, done, cycles]);

  const config = {
    inhale:  { text: 'Inspira',  emoji: '😤', scale: 1.5, color: 'from-blue-400 to-cyan-500',    duration: 4 },
    hold:    { text: 'Segura',   emoji: '🫁', scale: 1.5, color: 'from-purple-400 to-blue-500',   duration: 2 },
    exhale:  { text: 'Expira',   emoji: '😌', scale: 0.8, color: 'from-green-400 to-emerald-500', duration: 6 },
  }[phase];

  const continueLabel = lastGamePath ? 'Voltar ao Jogo' : 'Ver Recompensa';

  return (
    <div className="size-full flex flex-col items-center justify-center p-8 gap-10" style={{ background: 'linear-gradient(to bottom, rgb(125, 211, 252), rgb(196, 181, 253))' }}>
      <h1 className="text-4xl font-bold text-purple-900 text-center">Exercício de Respiração</h1>

      {done ? (
        <motion.div
          initial={accessibility.reduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="text-8xl">🌟</div>
          <h2 className="text-3xl font-bold text-purple-900">Muito bem!</h2>
          <p className="text-xl text-purple-800 max-w-sm">
            Fizeste {TOTAL_CYCLES} ciclos de respiração. O teu coração está mais calmo agora.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => { setLastGamePath(null); navigate('/reward'); }}
              className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              🏆 Ver Recompensa
            </button>
            {lastGamePath && (
              <button
                onClick={() => { setLastGamePath(null); navigate(lastGamePath); }}
                className="px-10 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" /> Voltar ao Jogo
              </button>
            )}
          </div>
        </motion.div>
      ) : !isActive ? (
        <motion.div
          initial={accessibility.reduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-8"
        >
          <p className="text-2xl text-purple-800 text-center max-w-md">
            Vamos fazer {TOTAL_CYCLES} ciclos de respiração profunda para te acalmares 🌬️
          </p>
          <button
            onClick={() => { setIsActive(true); setPhase('inhale'); setCycles(0); }}
            className="px-12 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
          >
            Começar
          </button>
        </motion.div>
      ) : (
        <>
          <motion.div
            animate={accessibility.reduceMotion ? {} : { scale: config.scale }}
            transition={{ duration: config.duration, ease: 'easeInOut' }}
            className={`w-56 h-56 rounded-full bg-gradient-to-br ${config.color} shadow-2xl flex items-center justify-center text-8xl`}
          >
            {config.emoji}
          </motion.div>

          <motion.h2
            key={phase}
            initial={accessibility.reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-purple-900"
          >
            {config.text}
          </motion.h2>

          {/* Cycle dots */}
          <div className="flex gap-3">
            {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-full transition-all duration-500 ${i < cycles ? 'bg-green-500 scale-110' : 'bg-gray-300'}`} />
            ))}
          </div>

          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg">
            <Smartphone className="w-6 h-6 text-purple-600" />
            <span className="text-lg text-purple-900">O relógio está a vibrar suavemente</span>
          </div>
        </>
      )}
    </div>
  );
}
