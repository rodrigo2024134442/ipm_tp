import { useNavigate } from 'react-router';
import { TrendingUp, Calendar, Award, CheckCircle2, Zap, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useApp } from '../context/AppContext';

// Seed data shown when no real sessions exist yet
const SEED_DATA = [
  { date: '28 Abr', sessions: 2, avgScore: 180, avgHeartRate: 88 },
  { date: '29 Abr', sessions: 3, avgScore: 240, avgHeartRate: 92 },
  { date: '30 Abr', sessions: 4, avgScore: 310, avgHeartRate: 85 },
  { date: '1 Mai',  sessions: 3, avgScore: 420, avgHeartRate: 82 },
  { date: '2 Mai',  sessions: 5, avgScore: 510, avgHeartRate: 79 },
  { date: '3 Mai',  sessions: 4, avgScore: 580, avgHeartRate: 76 },
];

function groupByDay(sessions: ReturnType<typeof useApp>['sessionData']) {
  const map = new Map<string, { sessions: number; totalScore: number; totalHR: number; }>();
  sessions.forEach((s) => {
    const d = new Date(s.timestamp);
    const key = `${d.getDate()} ${d.toLocaleString('pt', { month: 'short' })}`;
    const existing = map.get(key) ?? { sessions: 0, totalScore: 0, totalHR: 0 };
    map.set(key, {
      sessions: existing.sessions + 1,
      totalScore: existing.totalScore + s.score,
      totalHR: existing.totalHR + s.maxHeartRate,
    });
  });
  return Array.from(map.entries()).map(([date, v]) => ({
    date,
    sessions: v.sessions,
    avgScore: Math.round(v.totalScore / v.sessions),
    avgHeartRate: Math.round(v.totalHR / v.sessions),
  }));
}

export default function ProgressDashboard() {
  const navigate = useNavigate();
  const { sessionData, addSessionData } = useApp();

  const isReal = sessionData.length > 0;
  const chartData = isReal ? groupByDay(sessionData) : SEED_DATA;

  const totalSessions = isReal ? sessionData.length : 21;
  const bestScore = isReal ? Math.max(...sessionData.map((s) => s.score)) : 580;
  const stressEvents = isReal ? sessionData.reduce((s, d) => s + d.stressEvents, 0) : 3;
  const autoRegulationEvents = isReal ? sessionData.reduce((s, d) => s + (d.autoRegulationEvents || 0), 0) : 2;

  const gameCounts = isReal
    ? Object.entries(
        sessionData.reduce((acc, s) => {
          acc[s.game] = (acc[s.game] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([game, plays]) => ({
        game,
        plays,
        successRate: Math.round(
          (sessionData.filter((s) => s.game === game && s.completed).length / plays) * 100
        ),
      }))
    : [
        { game: 'O Dado Teimoso', plays: 15, successRate: 60 },
        { game: 'Corrida de Obstáculos', plays: 12, successRate: 75 },
        { game: 'Desafio do Puzzle', plays: 8, successRate: 50 },
      ];

  return (
    <div className="size-full flex flex-col p-6 overflow-y-auto" style={{ background: 'linear-gradient(to bottom, rgb(196, 181, 253), rgb(192, 132, 250))' }}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/menu')}
          className="px-6 py-3 bg-white rounded-full shadow-lg text-purple-900 font-semibold">
          ← Voltar
        </button>
        {!isReal && (
          <span className="text-xs text-purple-900 italic">Dados de demonstração</span>
        )}
      </div>

      <h1 className="text-4xl font-bold text-purple-900 mb-8">Progresso</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
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

      {/* Score chart */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">Pontuação Média por Dia</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgScore" fill="#8b5cf6" radius={[8,8,0,0]} name="Pontuação média" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* HR chart */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">BPM Médio por Dia</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[60, 120]} />
            <Tooltip />
            <Line type="monotone" dataKey="avgHeartRate" stroke="#ef4444" strokeWidth={3} name="BPM médio" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per-game breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">Por Jogo</h2>
        <div className="space-y-4">
          {gameCounts.map((game) => (
            <div key={game.game} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div>
                <p className="font-semibold text-purple-900">{game.game}</p>
                <p className="text-sm text-purple-900">{game.plays} jogadas</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-900">{game.successRate}%</p>
                <p className="text-sm text-purple-900">Taxa de sucesso</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      {isReal && (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-purple-900 mb-4">Sessões Recentes</h2>
          <div className="space-y-3">
            {[...sessionData].reverse().slice(0, 10).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl text-sm">
                <div>
                  <p className="font-semibold text-purple-700">{s.game}</p>
                  <p className="text-purple-500">{new Date(s.timestamp).toLocaleString('pt')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-700">🏆 {s.score} pts</p>
                  <p className="text-purple-500">❤️ {s.maxHeartRate} BPM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
