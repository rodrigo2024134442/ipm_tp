import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Heart, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import StressDetectionModal from './StressDetectionModal';
import { useAudio } from '../hooks/useAudio';
import { useAchievements } from '../hooks/useAchievements';
import { useStreak } from '../hooks/useStreak';
import AchievementNotification from './AchievementNotification';
import { buildAchievementStats } from '../hooks/achievementStats';

const LEVELS = [
  { pieces: 9, time: 30, label: 'Nível 1' },
  { pieces: 12, time: 28, label: 'Nível 2' },
  { pieces: 16, time: 25, label: 'Nível 3' },
  { pieces: 20, time: 22, label: 'Nível 4' },
  { pieces: 25, time: 20, label: 'Nível 5' },
  { pieces: 30, time: 18, label: 'Nível 6' },
];

const COLORS = [
  'bg-red-400','bg-orange-400','bg-yellow-400','bg-green-400',
  'bg-blue-400','bg-indigo-400','bg-purple-400','bg-pink-400',
  'bg-rose-400','bg-teal-400','bg-cyan-400','bg-lime-400',
  'bg-amber-400','bg-violet-400','bg-fuchsia-400','bg-sky-400',
];

export default function PuzzleGame() {
  const navigate = useNavigate();
  const { heartRate, isWatchConnected, stressDetected,
          startHeartRateMonitoring, stopHeartRateMonitoring,
          setMonitoringContext, addSessionData, setLastGamePath,
          accessibility, simulateCrisis, sessionData } = useApp();
  const { playSound } = useAudio();
  const { checkAchievements } = useAchievements();
  const { updateStreak } = useStreak(sessionData.length);

  const [levelIdx, setLevelIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].time);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pieces, setPieces] = useState<number[]>([]);
  const [completed, setCompleted] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [achieve, setAchieve] = useState<any>(null);
  const [wrongClickIdx, setWrongClickIdx] = useState<number | null>(null);
  const maxHRRef = useRef(75);
  const hasCountedPlayedRef = useRef(false);

  const level = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];

  useEffect(() => {
    setLastGamePath('/game/puzzle');
    if (isWatchConnected) startHeartRateMonitoring('idle');
    return () => stopHeartRateMonitoring();
  }, [isWatchConnected]);

  useEffect(() => {
    if (heartRate > maxHRRef.current) maxHRRef.current = heartRate;
  }, [heartRate]);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { endGame(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const endGame = (success: boolean) => {
    setIsPlaying(false);
    setGameOver(true);
    setWon(success);
    setMonitoringContext(success ? 'idle' : 'gameover');
    
    playSound(success ? 'win' : 'lose');

    if (success && !hasCountedPlayedRef.current) {
      hasCountedPlayedRef.current = true;
      updateStreak();

      const pendingSession = {
        game: 'Desafio do Puzzle',
        maxHeartRate: maxHRRef.current,
        stressEvents: 0,
        autoRegulationEvents: 0,
        completed: true,
        score: completed,
        timestamp: new Date().toISOString(),
      };

      addSessionData({
        game: pendingSession.game,
        maxHeartRate: pendingSession.maxHeartRate,
        stressEvents: pendingSession.stressEvents,
        autoRegulationEvents: pendingSession.autoRegulationEvents,
        completed: pendingSession.completed,
        score: pendingSession.score,
      });

      const newAchievements = checkAchievements(buildAchievementStats([...sessionData, pendingSession]));
      if (newAchievements.length > 0) {
        playSound('level-up');
        setAchieve(newAchievements[0]);
      }
    }
    
    if (success) setLevelIdx((i) => Math.min(i + 1, LEVELS.length - 1));
  };

  const startGame = () => {
    const shuffled = Array.from({ length: level.pieces }, (_, i) => i).sort(() => Math.random() - 0.5);
    setPieces(shuffled);
    setCompleted(0);
    setTimeLeft(level.time);
    setIsPlaying(true);
    setGameOver(false);
    setWon(false);
    setMonitoringContext('playing');
    maxHRRef.current = 75;
  };

  const handlePieceClick = (index: number) => {
    if (!isPlaying) return;
    
    if (pieces[index] !== completed) {
      // Wrong piece clicked - show shake feedback
      playSound('error');
      setWrongClickIdx(index);
      setTimeout(() => setWrongClickIdx(null), 500);
      return;
    }
    
    // Correct piece clicked
    const next = completed + 1;
    setCompleted(next);
    if (next === level.pieces) endGame(true);
  };

  const cols = level.pieces === 9 ? 3 : level.pieces === 12 ? 4 : level.pieces <= 16 ? 4 : level.pieces <= 20 ? 5 : 5;
  const timerPct = timeLeft / level.time;
  const timerColor = timerPct > 0.5 ? '#22c55e' : timerPct > 0.25 ? '#f59e0b' : '#ef4444';

  if (stressDetected) return <StressDetectionModal />;

  return (
    <AnimatePresence>
      <div className="size-full flex flex-col items-center justify-between p-8" style={{ background: 'linear-gradient(to bottom, rgb(251, 113, 133), rgb(244, 114, 182))' }}>
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3">
          <button onClick={() => navigate('/games')}
            className="px-6 py-3 bg-white rounded-full shadow-lg text-purple-600 font-semibold">
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
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold text-sm">{level.label}</span>
          {isWatchConnected && (
            <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <span className="text-xl font-bold text-purple-700">{heartRate} BPM</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 flex-1 justify-center">
        <h1 className="text-4xl font-bold text-purple-700">Desafio do Puzzle</h1>

        {!isPlaying && !gameOver && (
          <motion.div
            initial={accessibility.reduceMotion ? {} : { scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl shadow-lg text-center max-w-md border-2 border-purple-300"
          >
            <p className="text-2xl font-bold text-purple-700 mb-4">📋 Como Jogar</p>
            <p className="text-lg text-purple-600 mb-3">Clica nas peças em ordem: 1, 2, 3, 4...</p>
            <p className="text-lg text-purple-600">Tens {level.time} segundos!</p>
          </motion.div>
        )}

        {(isPlaying || gameOver) && (
          <>
            {/* Timer bar */}
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-700" style={{ color: timerColor }}>{timeLeft}s</span>
                </div>
                <span className="text-purple-600 font-semibold">{completed}/{level.pieces} peças</span>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${timerPct * 100}%`, backgroundColor: timerColor }} />
              </div>
            </div>

            <div className={`grid gap-3 p-6 bg-white rounded-3xl shadow-2xl`}
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {pieces.map((pieceValue, index) => {
                const isWrongClick = wrongClickIdx === index;
                return (
                  <motion.button
                    key={index}
                    onClick={() => handlePieceClick(index)}
                    whileHover={accessibility.reduceMotion || pieceValue < completed ? {} : { scale: 1.05 }}
                    whileTap={accessibility.reduceMotion || pieceValue < completed ? {} : { scale: 0.95 }}
                    animate={isWrongClick ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                    transition={isWrongClick ? { duration: 0.4 } : {}}
                    className={`w-16 h-16 rounded-xl ${COLORS[pieceValue % COLORS.length]} ${
                      pieceValue < completed ? 'opacity-20 cursor-default' : 'cursor-pointer'
                    } flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-opacity`}
                  >
                    {pieceValue < completed ? '✓' : pieceValue + 1}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {gameOver && (
          <motion.div
            initial={accessibility.reduceMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            className={`p-8 rounded-3xl shadow-xl text-white text-center max-w-md ${
              won ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-blue-400 to-purple-500'
            }`}
          >
            <h2 className="text-3xl font-bold mb-3">
              {won ? '🎉 Completaste!' : '😊 Tempo esgotado'}
            </h2>
            <p className="text-xl">
              {won ? `Nível ${levelIdx} completo! Avançaste!` : `Fizeste ${completed} peças. Tenta outra vez!`}
            </p>
          </motion.div>
        )}
      </div>

      <button
        onClick={startGame}
        disabled={isPlaying}
        className="px-12 py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
      >
        {gameOver ? (won ? 'Próximo Nível! 🚀' : 'Tentar Novamente') : isPlaying ? 'A Jogar...' : 'Começar'}
      </button>
      {achieve && <AchievementNotification achievement={achieve} onClose={() => setAchieve(null)} />}
    </div>
    </AnimatePresence>
  );
}
