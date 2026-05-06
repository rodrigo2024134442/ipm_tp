import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Heart, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import StressDetectionModal from './StressDetectionModal';
import { useAudio } from '../hooks/useAudio';
import { useAchievements } from '../hooks/useAchievements';
import { useStreak } from '../hooks/useStreak';
import AchievementNotification from './AchievementNotification';
import { buildAchievementStats } from '../hooks/achievementStats';

interface Obstacle { x: number; id: number; height: number; width: number; emoji: string; y: number; air: boolean; }

interface GameState {
  obstacles: Obstacle[];
  playerY: number;
  velocityY: number;
  isJumping: boolean;
  score: number;
  gameOver: boolean;
  isPlaying: boolean;
  lastObstacleTime: number;
  obstacleIdCounter: number;
  stressEvents: number;
  maxHR: number;
}

// ---- Difficulty curve ----
// score 0–200:   slow & sparse
// score 200–500: medium
// score 500+:    fast, tight gaps, double obstacles possible

const JUMP_VELOCITY = 15;
const GRAVITY = 0.75;
const PLAYER_LEFT = 100;
const PLAYER_SIZE = 60;
const CANVAS_H = 400;
const CANVAS_W = 400;
const GROUND_HEIGHT = 80;
const AIR_OBSTACLE_Y_OFFSET = 110;

function getDifficulty(score: number) {
  const t = Math.min(score / 2200, 1); // curva ainda mais longa para crianças
  return {
    speed: 1.8 + t * 2.4,                    // 1.8 → 4.2
    minGapMs: 2800 - t * 900,                // 2800ms → 1900ms
    spawnChance: 0.01 + t * 0.018,           // 1% → 2.8% por frame
    airChance: t > 0.35 ? (t - 0.35) * 0.12 : 0, // obstáculo aéreo entra mais tarde
    doubleChance: t > 0.75 ? (t - 0.75) * 0.16 : 0, // muito mais tarde
    tripleChance: t > 0.92 ? (t - 0.92) * 0.08 : 0, // quase no fim
    patternChance: t > 0.25 ? 0.12 + t * 0.18 : 0.06, // mais padrões à medida que o jogo avança
  };
}

const OBSTACLE_TYPES = [
  { emoji: '🌵', height: 44, width: 32 },
  { emoji: '🪨', height: 32, width: 36 },
  { emoji: '🌊', height: 28, width: 40 },
  { emoji: '🍄', height: 36, width: 30 },
  { emoji: '🔥', height: 40, width: 34 },
  { emoji: '💣', height: 38, width: 32 },
  { emoji: '⚡', height: 42, width: 28 },
  { emoji: '🪵', height: 32, width: 42 },
];

const AIR_OBSTACLE_TYPES = [
  { emoji: '🐦', height: 34, width: 34 },
  { emoji: '🕊️', height: 32, width: 32 },
  { emoji: '🦅', height: 38, width: 38 },
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function makeGroundObstacle(x: number, id: number, type = pickRandom(OBSTACLE_TYPES)): Obstacle {
  return {
    x,
    id,
    height: type.height,
    width: type.width,
    emoji: type.emoji,
    y: CANVAS_H - GROUND_HEIGHT - type.height,
    air: false,
  };
}

function makeAirObstacle(x: number, id: number, type = pickRandom(AIR_OBSTACLE_TYPES)): Obstacle {
  return {
    x,
    id,
    height: type.height,
    width: type.width,
    emoji: type.emoji,
    y: CANVAS_H - GROUND_HEIGHT - PLAYER_SIZE - AIR_OBSTACLE_Y_OFFSET,
    air: true,
  };
}

const initialState = (): GameState => ({
  obstacles: [],
  playerY: 0,
  velocityY: 0,
  isJumping: false,
  score: 0,
  gameOver: false,
  isPlaying: false,
  lastObstacleTime: 0,
  obstacleIdCounter: 0,
  stressEvents: 0,
  maxHR: 75,
});

function getScoreTier(score: number): { label: string; color: string } {
  if (score < 800) return { label: 'Início', color: '#22c55e' };
  if (score < 1500) return { label: 'A aquecer!', color: '#f59e0b' };
  if (score < 2500) return { label: 'Rápido!', color: '#f97316' };
  return { label: 'IMPARÁVEL!', color: '#ef4444' };
}

export default function ObstacleGame() {
  const navigate = useNavigate();
  const { heartRate, isWatchConnected, stressDetected, startHeartRateMonitoring,
          stopHeartRateMonitoring, setMonitoringContext, addSessionData, lastGamePath, setLastGamePath, accessibility, simulateCrisis, sessionData } = useApp();
  const { playSound } = useAudio();
  const { checkAchievements } = useAchievements();
  const { updateStreak } = useStreak(sessionData.length);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<GameState>(initialState());
  const rafRef = useRef<number>(0);
  const hrRef = useRef(heartRate);

  const [uiScore, setUiScore] = useState(0);
  const [uiGameOver, setUiGameOver] = useState(false);
  const [uiPlaying, setUiPlaying] = useState(false);
  const [uiTier, setUiTier] = useState(getScoreTier(0));
  const [achieve, setAchieve] = useState<any>(null);

  // keep hrRef in sync so gameLoop can read it without stale closure
  useEffect(() => { hrRef.current = heartRate; }, [heartRate]);

  useEffect(() => {
    setLastGamePath('/game/obstacle');
    if (isWatchConnected) startHeartRateMonitoring('idle');
    return () => stopHeartRateMonitoring();
  }, [isWatchConnected]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gs = gsRef.current;
    const diff = getDifficulty(gs.score);

    // Sky — darkens with difficulty
    const t = Math.min(gs.score / 600, 1);
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    sky.addColorStop(0, t > 0.5 ? '#7c3aed' : '#bae6fd');
    sky.addColorStop(1, t > 0.5 ? '#1e1b4b' : '#bbf7d0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars at night (high difficulty)
    if (t > 0.5) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      [[50,20],[150,10],[300,30],[450,8],[530,25],[100,40],[380,15]].forEach(([sx,sy]) => {
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI*2);
        ctx.fill();
      });
    }

    // Ground - bigger square block
    ctx.fillStyle = t > 0.5 ? '#1f2937' : '#15803d';
    ctx.fillRect(0, CANVAS_H - GROUND_HEIGHT, CANVAS_W, GROUND_HEIGHT);
    ctx.fillStyle = t > 0.5 ? '#374151' : '#16a34a';
    ctx.fillRect(0, CANVAS_H - GROUND_HEIGHT + 15, CANVAS_W, GROUND_HEIGHT - 20);

    // Clouds / stars
    if (t < 0.5) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      [[80,30,40,20],[250,45,55,18],[430,25,45,16]].forEach(([x,y,w,h]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, 0, 0, Math.PI*2);
        ctx.fill();
      });
    }

    // Difficulty label
    const tier = getScoreTier(gs.score);
    ctx.fillStyle = tier.color;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(tier.label, 12, 12);

    // Speed bar
    const speedPct = Math.max(0, Math.min(1, (diff.speed - 1.8) / (4.2 - 1.8)));
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    (ctx as any).roundRect(12, 30, 100, 6, 3);
    ctx.fill();
    ctx.fillStyle = tier.color;
    ctx.beginPath();
    (ctx as any).roundRect(12, 30, 100 * speedPct, 6, 3);
    ctx.fill();

    // Player
    const groundTop = CANVAS_H - GROUND_HEIGHT;
    const playerDrawY = groundTop - PLAYER_SIZE - gs.playerY;
    ctx.font = `${PLAYER_SIZE}px serif`;
    
    // Mirror the player to face right
    ctx.save();
    ctx.translate(PLAYER_LEFT + PLAYER_SIZE / 2, playerDrawY + PLAYER_SIZE / 2);
    ctx.scale(-1, 1);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('🏃', 0, 0);
    ctx.restore();

    // Obstacles
    gs.obstacles.forEach((obs) => {
      ctx.font = `${obs.height}px serif`;
      ctx.fillText(obs.emoji, obs.x, obs.y);
    });

    // Score badge
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    (ctx as any).roundRect(CANVAS_W - 115, 10, 105, 40, 20);
    ctx.fill();
    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(String(gs.score), CANVAS_W - 16, 20);
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    const gs = gsRef.current;
    if (!gs.isPlaying) return;
    const diff = getDifficulty(gs.score);

    // Physics
    if (gs.isJumping || gs.playerY > 0) {
      gs.velocityY -= GRAVITY;
      gs.playerY = Math.max(0, gs.playerY + gs.velocityY);
      if (gs.playerY <= 0) { gs.playerY = 0; gs.velocityY = 0; gs.isJumping = false; }
    }

    // Spawn
    if (timestamp - gs.lastObstacleTime > diff.minGapMs && Math.random() < diff.spawnChance) {
      const patternRoll = Math.random();
      const useLongPattern = Math.random() < diff.patternChance;
      const baseX = CANVAS_W + 10;
      const gap = 95;

      const sequence: Array<'g' | 'a'> = (() => {
        if (gs.score < 250 || !useLongPattern) {
          return patternRoll < 0.6 ? ['g'] : ['g', 'g'];
        }
        if (gs.score < 900) {
          if (patternRoll < 0.25) return ['g', 'a', 'g'];
          if (patternRoll < 0.5) return ['g', 'g', 'a'];
          if (patternRoll < 0.75) return ['a', 'g', 'g'];
          return ['g', 'a', 'g', 'g'];
        }

        if (patternRoll < 0.18) return ['g', 'a', 'g'];
        if (patternRoll < 0.36) return ['g', 'g', 'a', 'g'];
        if (patternRoll < 0.54) return ['a', 'g', 'a', 'g'];
        if (patternRoll < 0.72) return ['g', 'a', 'a', 'g'];
        if (patternRoll < 0.88) return ['g', 'g', 'a', 'g', 'g'];
        return ['a', 'g', 'a', 'g', 'a'];
      })();

      sequence.forEach((kind, index) => {
        const x = baseX + index * gap;
        gs.obstacles.push(kind === 'a' ? makeAirObstacle(x, gs.obstacleIdCounter++) : makeGroundObstacle(x, gs.obstacleIdCounter++));
      });

      if (gs.score >= 1500 && Math.random() < diff.doubleChance) {
        const extraX = baseX + sequence.length * gap;
        gs.obstacles.push(Math.random() < 0.55 ? makeAirObstacle(extraX, gs.obstacleIdCounter++) : makeGroundObstacle(extraX, gs.obstacleIdCounter++));
      }
      gs.lastObstacleTime = timestamp;
    }

    // Move
    gs.obstacles = gs.obstacles
      .map((o) => ({ ...o, x: o.x - diff.speed }))
      .filter((o) => o.x > -60);

    // Collision
    const groundTop = CANVAS_H - GROUND_HEIGHT;
    const pL = PLAYER_LEFT + 12, pR = PLAYER_LEFT + PLAYER_SIZE - 12;
    const pTop = groundTop - PLAYER_SIZE - gs.playerY;
    const pBottom = groundTop - gs.playerY;
    for (const obs of gs.obstacles) {
      const obsL = obs.x + 8, obsR = obs.x + obs.width - 8;
      const obsTop = obs.y;
      const obsBottom = obs.y + obs.height;
      const hitX = pR > obsL && pL < obsR;
      const hitY = pBottom > obsTop && pTop < obsBottom;
      if (hitX && hitY) {
        gs.isPlaying = false;
        gs.gameOver = true;
        setMonitoringContext('gameover');
        draw();
        setUiScore(gs.score);
        setUiTier(getScoreTier(gs.score));
        setUiGameOver(true);
        setUiPlaying(false);
        
        playSound('lose');
        
        addSessionData({
          game: 'Corrida de Obstáculos',
          maxHeartRate: gs.maxHR,
          stressEvents: gs.stressEvents,
          autoRegulationEvents: 0,
          completed: false,
          score: gs.score,
        });
        
        updateStreak();
        const pendingSession = {
          game: 'Corrida de Obstáculos',
          maxHeartRate: gs.maxHR,
          stressEvents: gs.stressEvents,
          autoRegulationEvents: 0,
          completed: false,
          score: gs.score,
          timestamp: new Date().toISOString(),
        };
        const newAch = checkAchievements(buildAchievementStats([...sessionData, pendingSession]));
        if (newAch.length > 0) {
          playSound('level-up');
          setAchieve(newAch[0]);
        }
        
        return;
      }
    }

    // Track max HR
    const currentHR = hrRef.current;
    if (currentHR > gs.maxHR) gs.maxHR = currentHR;

    gs.score += 1;
    if (gs.score % 150 === 0) setUiTier(getScoreTier(gs.score));

    draw();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [draw, setMonitoringContext, addSessionData]);

  const startGame = () => {
    cancelAnimationFrame(rafRef.current);
    const groundType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const airType = AIR_OBSTACLE_TYPES[Math.floor(Math.random() * AIR_OBSTACLE_TYPES.length)];
    const now = performance.now();
    gsRef.current = {
      ...initialState(),
      obstacles: [
        {
          x: CANVAS_W + 40,
          id: 0,
          height: groundType.height,
          width: groundType.width,
          emoji: groundType.emoji,
          y: CANVAS_H - GROUND_HEIGHT - groundType.height,
          air: false,
        },
        {
          x: CANVAS_W + 170,
          id: 1,
          height: airType.height,
          width: airType.width,
          emoji: airType.emoji,
          y: CANVAS_H - GROUND_HEIGHT - PLAYER_SIZE - AIR_OBSTACLE_Y_OFFSET,
          air: true,
        },
      ],
      obstacleIdCounter: 2,
      lastObstacleTime: now,
      isPlaying: true,
    };
    setUiScore(0);
    setUiGameOver(false);
    setUiPlaying(true);
    setUiTier(getScoreTier(0));
    setMonitoringContext('playing');
    rafRef.current = requestAnimationFrame(gameLoop);
  };

  const jump = useCallback(() => {
    const gs = gsRef.current;
    if (!gs.isPlaying || gs.isJumping || gs.playerY > 2) return;
    gs.isJumping = true;
    gs.velocityY = JUMP_VELOCITY;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); }
    };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); cancelAnimationFrame(rafRef.current); };
  }, [jump]);

  if (stressDetected) return <StressDetectionModal />;

  return (
    <div className="size-full flex flex-col items-center justify-between p-6" style={{ background: 'linear-gradient(to bottom, rgb(125, 211, 252), rgb(34, 211, 238))' }}>
      <AnimatePresence>
        {achieve && <AchievementNotification achievement={achieve} onClose={() => setAchieve(null)} />}
      </AnimatePresence>
      
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-3">
          <button onClick={() => { cancelAnimationFrame(rafRef.current); navigate('/games'); }}
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
        {isWatchConnected && (
          <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <span className="text-xl font-bold text-purple-900">{heartRate} BPM</span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 flex-1 justify-center w-full">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-blue-700">Corrida de Obstáculos</h1>
        </div>

        {!uiPlaying && !uiGameOver && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl shadow-lg text-center max-w-md border-2 border-blue-300"
          >
            <p className="text-2xl font-bold text-blue-700 mb-4">⚡ Como Jogar</p>
            <p className="text-lg text-blue-600">Salta para evitar os obstáculos!</p>
            <p className="text-sm text-blue-500 mt-2">Toca no ecrã ou pressiona Espaço</p>
          </motion.div>
        )}

        {(uiPlaying || uiGameOver) && (
          <div className="w-full max-w-2xl aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
            <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H}
              style={{ width: '100%', height: '100%', display: 'block' }} onClick={jump} />
          </div>
        )}

        {uiGameOver && (
          <motion.div initial={accessibility.reduceMotion ? {} : { scale: 0 }}
            animate={{ scale: 1 }}
            className="p-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl shadow-xl text-white text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4">😊 Boa tentativa!</h2>
            <p className="text-xl mb-1">Pontuação: <strong>{uiScore}</strong></p>
            {uiScore >= 500 && <p className="text-lg">🔥 Que corrida incrível!</p>}
            {uiScore >= 200 && uiScore < 500 && <p className="text-lg">⚡ Estás a melhorar!</p>}
            {uiScore < 200 && <p className="text-lg">Não desistas! Tenta novamente!</p>}
          </motion.div>
        )}
      </div>

      <div className="flex gap-4 mt-4">
        {!uiPlaying && (
          <button onClick={startGame}
            className="px-12 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform">
            {uiGameOver ? 'Jogar Novamente' : 'Começar'}
          </button>
        )}
        {uiPlaying && (
          <button onClick={jump}
            className="px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform active:scale-95">
            Saltar! 🦘
          </button>
        )}
      </div>
      {uiPlaying && <p className="text-sm text-blue-500 mt-2 opacity-70">Toca no ecrã ou pressiona Espaço para saltar</p>}
    </div>
  );
}
