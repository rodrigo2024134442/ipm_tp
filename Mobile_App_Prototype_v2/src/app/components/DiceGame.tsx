import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Heart, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import StressDetectionModal from './StressDetectionModal';
import { useAudio } from '../hooks/useAudio';
import { useAchievements } from '../hooks/useAchievements';
import { useStreak } from '../hooks/useStreak';
import AchievementNotification from './AchievementNotification';
import StreakBadge from './StreakBadge';
import { buildAchievementStats } from '../hooks/achievementStats';

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function DiceGame() {
  const navigate = useNavigate();
  const { heartRate, isWatchConnected, stressDetected, sessionData,
          startHeartRateMonitoring, stopHeartRateMonitoring,
          setMonitoringContext, addSessionData, setLastGamePath,
          accessibility, simulateCrisis } = useApp();
  const { playSound } = useAudio();
  const { checkAchievements, newAchievements } = useAchievements();
  const { streak, updateStreak } = useStreak(sessionData.length);

  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [currentDice, setCurrentDice] = useState(0);
  const [rollCount, setRollCount] = useState(0);
  const [achieve, setAchieve] = useState<any>(null);
  const maxHRRef = useRef(75);
  const stressCountRef = useRef(0);

  useEffect(() => {
    setLastGamePath('/game/dice');
    if (isWatchConnected) startHeartRateMonitoring('idle');
    return () => stopHeartRateMonitoring();
  }, [isWatchConnected]);

  useEffect(() => {
    if (heartRate > maxHRRef.current) maxHRRef.current = heartRate;
  }, [heartRate]);

  const rollDice = () => {
    setRolling(true);
    setGameResult(null);
    setResult(null);
    setMonitoringContext('playing');
    playSound('click');

    let count = 0;
    const interval = setInterval(() => {
      setCurrentDice(Math.floor(Math.random() * 6));
      playSound('tick');
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setResult(finalResult);
        setRolling(false);
        const win = Math.random() > 0.7; // 70% lose — intentional for frustration tolerance
        const outcome = win ? 'win' : 'lose';
        
        // Play sound and update UI
        playSound(win ? 'win' : 'lose');
        setGameResult(outcome);
        setRollCount((r) => r + 1);
        if (!win) stressCountRef.current += 1;
        setMonitoringContext(win ? 'idle' : 'gameover');
        
        const newSession = {
          game: 'O Dado Teimoso',
          maxHeartRate: maxHRRef.current,
          stressEvents: stressCountRef.current,
          autoRegulationEvents: 0,
          completed: win,
          score: rollCount + 1,
        };
        addSessionData(newSession);
        
        // Update streak and check achievements
        updateStreak();
        const newAch = checkAchievements(
          buildAchievementStats([
            ...sessionData,
            {
              ...newSession,
              timestamp: new Date().toISOString(),
            },
          ])
        );
        if (newAch.length > 0) {
          playSound('level-up');
          setAchieve(newAch[0]);
        }
      }
    }, 100);
  };

  const DiceIcon = result ? diceIcons[result - 1] : diceIcons[currentDice];

  if (stressDetected) return <StressDetectionModal />;

  return (
    <div className="size-full flex flex-col items-center justify-between p-8" style={{ background: 'linear-gradient(to bottom, rgb(253, 230, 138), rgb(251, 191, 36))' }}>
      <AnimatePresence>
        {achieve && <AchievementNotification achievement={achieve} onClose={() => setAchieve(null)} />}
      </AnimatePresence>
      
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3">
          <button onClick={() => navigate('/games')}
            className="px-6 py-3 bg-white rounded-full shadow-lg text-purple-900 font-semibold">
            ← Voltar
          </button>
          <button
            onClick={simulateCrisis}
            title="Simular crise de criança (aumentar batimento cardíaco)"
            className="px-4 py-3 bg-red-100 rounded-full shadow-lg text-red-600 font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" /> Simular Crise
          </button>
        </div>
        <div className="flex items-center gap-4">
          <StreakBadge streak={streak} />
          {isWatchConnected && (
            <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <span className="text-xl font-bold text-purple-900">{heartRate} BPM</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-orange-700">O Dado Teimoso</h1>

        {rollCount === 0 && !gameResult && (
          <motion.div
            initial={accessibility.reduceMotion ? {} : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-3xl shadow-lg text-center max-w-md border-2 border-orange-300"
          >
            <p className="text-2xl font-bold text-orange-700 mb-4">🎲 Como Jogar</p>
            <p className="text-lg text-orange-600">Lança o dado e tenta a tua sorte!</p>
          </motion.div>
        )}

        {rollCount > 0 && (
          <p className="text-purple-900 font-semibold">Lançamentos: {rollCount}</p>
        )}

        <motion.div
          animate={accessibility.reduceMotion ? {} : (rolling ? { rotate: 360 } : {})}
          transition={{ duration: 0.1, repeat: rolling ? Infinity : 0 }}
          className="p-12 bg-white rounded-3xl shadow-2xl"
        >
          <DiceIcon className="w-40 h-40 text-orange-600" />
        </motion.div>

        {gameResult && (
          <motion.div
            initial={accessibility.reduceMotion ? {} : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`p-8 rounded-3xl shadow-xl text-center ${
              gameResult === 'win'
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : 'bg-gradient-to-r from-blue-400 to-purple-500'
            } text-white max-w-md`}
          >
            <h2 className="text-3xl font-bold mb-4">
              {gameResult === 'win' ? '🎉 Ganhaste!' : '😊 Perdeste'}
            </h2>
            <p className="text-xl">
              {gameResult === 'win' ? 'Muito bem! Continua assim!' : 'Tudo bem perder! Tenta outra vez.'}
            </p>
          </motion.div>
        )}
      </div>

      <button
        onClick={rollDice}
        disabled={rolling}
        className="px-12 py-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
      >
        {rolling ? 'A lançar...' : 'Lançar Dado'}
      </button>
    </div>
  );
}
