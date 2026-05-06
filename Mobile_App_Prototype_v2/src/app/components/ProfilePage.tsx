import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, Calendar, Award, CheckCircle2, Zap, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useAchievements, Achievement } from '../hooks/useAchievements';
import { useStreak } from '../hooks/useStreak';
import StreakBadge from './StreakBadge';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { sessionData } = useApp();
  const { achievements, unlockedAchievements } = useAchievements();
  const { streak } = useStreak(sessionData.length);
  const [activeTab, setActiveTab] = useState<'progresso' | 'conquistas'>('progresso');

  const isReal = sessionData.length > 0;
  const totalSessions = sessionData.length;
  const bestScore = isReal ? Math.max(...sessionData.map((s) => s.score)) : 0;
  const stressEvents = isReal ? sessionData.reduce((s, d) => s + d.stressEvents, 0) : 0;
  const autoRegulationEvents = isReal ? sessionData.reduce((s, d) => s + (d.autoRegulationEvents || 0), 0) : 0;

  const isUnlocked = (achievement: Achievement) => {
    return unlockedAchievements.some((a) => a.id === achievement.id);
  };

  const getAchievementExplanation = (id: string): string => {
    const explanations: Record<string, string> = {
      'first-steps': '🎮 Jogar uma sessão completa',
      'dedicated': '📅 7 dias consecutivos',
      'unstoppable': '🔥 14 dias consecutivos',
      'legend': '⭐ 30 dias consecutivos',
      'stress-master': '😌 Completar 5 sessões sem stress',
      'perfect-breath': '🌬️ Auto-regular 10 vezes',
      'high-score': '🏆 Atingir 500+ pontos num jogo',
      'champion': '👑 Atingir 1000+ pontos num jogo',
      'winning-streak': '🎯 Vencer 5 jogos seguidos',
      'multi-master': '🎮 Jogar os 3 jogos diferentes',
    };
    return explanations[id] || 'Completa o desafio para desbloquear';
  };

  return (
    <div className="size-full flex flex-col p-6 overflow-y-auto" style={{ background: 'linear-gradient(to bottom, rgb(196, 181, 253), rgb(192, 132, 250))' }}>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/menu')}
          className="px-6 py-3 bg-white rounded-full shadow-lg text-purple-900 font-semibold"
        >
          ← Voltar
        </button>
      </div>

      <h1 className="text-4xl font-bold text-purple-900 mb-6">Perfil</h1>

      {/* Streak Badge */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
        <StreakBadge streak={streak} size="lg" />
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        {(['progresso', 'conquistas'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                : 'bg-white text-purple-700 hover:bg-purple-50'
            }`}
          >
            {tab === 'progresso' ? '📊 Progresso' : '🏆 Conquistas'}
          </button>
        ))}
      </div>

      {/* Progresso Tab */}
      {activeTab === 'progresso' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { icon: Calendar, label: 'Total de sessões', value: String(totalSessions), color: 'from-blue-400 to-cyan-500' },
              { icon: TrendingUp, label: 'Melhor pontuação', value: String(bestScore), color: 'from-green-400 to-emerald-500' },
              { icon: Zap, label: 'Eventos de stress', value: String(stressEvents), color: 'from-purple-400 to-pink-500' },
              { icon: CheckCircle2, label: 'Auto-regulação', value: String(autoRegulationEvents), color: 'from-indigo-400 to-purple-500' },
            ].map((stat) => (
              <div key={stat.label} className={`p-6 bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg text-white`}>
                <stat.icon className="w-10 h-10 mb-3" />
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
            ))}
          </div>

          {isReal && (
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">Progressão</h2>
              <div className="space-y-3">
                {[...sessionData].reverse().slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-purple-700">{s.game}</p>
                      <p className="text-sm text-purple-500">{new Date(s.timestamp).toLocaleString('pt')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-700">🏆 {s.score} pts</p>
                      <p className="text-sm text-purple-500">
                        {s.autoRegulationEvents! > 0 ? `✨ Auto-regulação` : `❤️ ${s.maxHeartRate} BPM`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Conquistas Tab */}
      {activeTab === 'conquistas' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 flex-1">
          <div className="grid grid-cols-1 gap-3">
            {achievements.map((achievement, index) => {
              const unlocked = isUnlocked(achievement);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-2xl shadow-lg transition-all ${
                    unlocked
                      ? 'bg-gradient-to-r from-yellow-300 to-orange-300'
                      : 'bg-gray-300 opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-lg text-purple-700">{achievement.title}</p>
                        {!unlocked && <Lock className="w-4 h-4 text-gray-600" />}
                      </div>
                      <p className="text-sm text-purple-600 mb-2">{achievement.description}</p>
                      <p className="text-xs text-purple-600 italic">
                        {getAchievementExplanation(achievement.id)}
                      </p>
                      {unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-purple-700 font-semibold mt-1">
                          🎉 Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt')}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
