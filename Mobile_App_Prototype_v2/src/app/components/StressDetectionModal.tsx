import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Heart, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useAchievements } from '../hooks/useAchievements';
import { buildAchievementStats } from '../hooks/achievementStats';

export default function StressDetectionModal() {
  const navigate = useNavigate();
  const { lastGamePath, accessibility, addSessionData, sessionData, setHeartRate, stressDetected, simulationChoice } = useApp();
  const { checkAchievements } = useAchievements();
  const [breathingDone, setBreathingDone] = useState(false);
  const [wantToLowerHR, setWantToLowerHR] = useState<boolean | null>(null);
  const [didCalm, setDidCalm] = useState<boolean | null>(null);

  // Auto-return if simulation failed
  useEffect(() => {
    if (breathingDone && simulationChoice === false) {
      const timer = setTimeout(() => {
        if (lastGamePath) {
          navigate(lastGamePath);
        } else {
          navigate('/menu');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [breathingDone, simulationChoice, lastGamePath, navigate]);

  const handleCalm = (calmed: boolean) => {
    setDidCalm(calmed);
    if (calmed) {
      // Registrar evento de auto-regulação
      const lastSession = sessionData[sessionData.length - 1];
      if (lastSession) {
        const updatedSession = {
          ...lastSession,
          autoRegulationEvents: (lastSession.autoRegulationEvents || 0) + 1,
        };
        // Atualizar a sessão com auto-regulação bem-sucedida
        addSessionData({
          game: updatedSession.game,
          maxHeartRate: updatedSession.maxHeartRate,
          stressEvents: updatedSession.stressEvents,
          autoRegulationEvents: updatedSession.autoRegulationEvents,
          completed: updatedSession.completed,
          score: updatedSession.score,
        });
        checkAchievements(buildAchievementStats([...sessionData, { ...updatedSession, timestamp: new Date().toISOString() }]));
      }
    }
    setTimeout(() => {
      if (lastGamePath) {
        navigate(lastGamePath);
      } else {
        navigate('/menu');
      }
    }, 1500);
  };

  const handleLowerHeartRate = (shouldLower: boolean) => {
    if (shouldLower) {
      setHeartRate(75); // Baixar para normal
    }
    setWantToLowerHR(shouldLower);
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-b from-red-100 to-orange-100 p-8">
      <motion.div
        initial={accessibility.reduceMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-8 max-w-lg bg-white p-12 rounded-3xl shadow-2xl"
      >
        {!breathingDone ? (
          <>
            <motion.div
              animate={accessibility.reduceMotion ? {} : { scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-32 h-32 text-red-500 fill-red-400" />
            </motion.div>

            <div className="flex items-center gap-4 px-8 py-4 bg-orange-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-700">Frequência cardíaca elevada</span>
            </div>

            <h1 className="text-4xl font-bold text-purple-700 text-center">
              Parece que estás frustrado
            </h1>
            <p className="text-xl text-purple-600 text-center">
              Vamos fazer um exercício de respiração para te acalmares?
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => { navigate('/breathing'); setBreathingDone(true); }}
                className="px-12 py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
              >
                Vamos lá! 🌬️
              </button>
            </div>
          </>
        ) : breathingDone && simulationChoice === false ? (
          <>
            <motion.div
              animate={accessibility.reduceMotion ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-5xl">😤</div>
            </motion.div>
            <h1 className="text-3xl font-bold text-orange-600 text-center">
              Ainda estás stressado...
            </h1>
            <p className="text-lg text-purple-600 text-center">
              Tenta novamente da próxima vez!
            </p>
          </>
        ) : breathingDone && wantToLowerHR === null && simulationChoice !== false ? (
          <>
            <motion.div
              animate={accessibility.reduceMotion ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Heart className="w-32 h-32 text-orange-500 fill-orange-400" />
            </motion.div>

            <h1 className="text-4xl font-bold text-purple-700 text-center">
              ✨ Exercício completo!
            </h1>
            <p className="text-xl text-purple-600 text-center">
              Queres baixar o teu batimento cardíaco?
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => handleLowerHeartRate(true)}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Sim! 📉
              </button>
              <button
                onClick={() => handleLowerHeartRate(false)}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Não 🤷
              </button>
            </div>
          </>
        ) : breathingDone && wantToLowerHR !== null && didCalm === null ? (
          <>
            <motion.div
              animate={accessibility.reduceMotion ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Heart className="w-32 h-32 text-green-500 fill-green-400" />
            </motion.div>

            <h1 className="text-4xl font-bold text-purple-700 text-center">
              ✨ Muito bem!
            </h1>
            <p className="text-xl text-purple-600 text-center">
              Conseguiste ficar calmo após a respiração?
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => handleCalm(true)}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Sim, estou calmo! 😊
              </button>
              <button
                onClick={() => handleCalm(false)}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Ainda não 🤔
              </button>
            </div>
          </>
        ) : didCalm ? (
          <>
            <motion.div
              animate={accessibility.reduceMotion ? {} : { scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-6xl">🌟</div>
            </motion.div>
            <h1 className="text-4xl font-bold text-green-600 text-center">
              Incrível! 🎉
            </h1>
            <p className="text-xl text-purple-600 text-center">
              Desbloqueaste Auto-Regulação!
            </p>
          </>
        ) : (
          <>
            <motion.div
              animate={accessibility.reduceMotion ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-5xl">💪</div>
            </motion.div>
            <h1 className="text-3xl font-bold text-purple-700 text-center">
              Sem problemas!
            </h1>
            <p className="text-lg text-purple-600 text-center">
              Tenta novamente da próxima vez
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
