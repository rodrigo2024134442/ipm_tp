import { useNavigate } from 'react-router';
import { FileText, Settings as SettingsIcon, Heart, AlertTriangle, Zap, CheckCircle2, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function TherapistDashboard() {
  const navigate = useNavigate();

  const heartRateSession = [
    { time: '0s', bpm: 75 },
    { time: '10s', bpm: 78 },
    { time: '20s', bpm: 85 },
    { time: '30s', bpm: 95 },
    { time: '40s', bpm: 112 },
    { time: '50s', bpm: 118 },
    { time: '60s', bpm: 105 },
    { time: '70s', bpm: 85 },
    { time: '80s', bpm: 78 },
  ];

  const emotionalProgress = [
    { week: 'Sem 1', stress: 8, regulation: 3 },
    { week: 'Sem 2', stress: 7, regulation: 4 },
    { week: 'Sem 3', stress: 5, regulation: 6 },
    { week: 'Sem 4', stress: 4, regulation: 7 },
  ];

  const recentSessions = [
    { date: '29 Abr 2026', game: 'Dado Teimoso', maxBPM: 118, stressEvents: 1, duration: '5 min' },
    { date: '28 Abr 2026', game: 'Obstáculos', maxBPM: 105, stressEvents: 0, duration: '8 min' },
    { date: '27 Abr 2026', game: 'Puzzle', maxBPM: 125, stressEvents: 2, duration: '6 min' },
  ];

  return (
    <div className="size-full flex flex-col bg-gradient-to-b from-blue-50 to-purple-50 p-6 overflow-y-auto">
      <button
        onClick={() => navigate('/menu')}
        className="mb-6 px-6 py-3 bg-white rounded-full shadow-lg text-purple-900 font-semibold w-fit"
      >
        ← Voltar
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-purple-900">Dashboard Adulto</h1>
        <button className="p-4 bg-white rounded-full shadow-lg">
          <SettingsIcon className="w-6 h-6 text-purple-900" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl shadow-lg text-white">
          <Calendar className="w-10 h-10 mb-3" />
          <p className="text-3xl font-bold mb-1">20</p>
          <p className="text-sm opacity-90">Sessões totais</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg text-white">
          <Heart className="w-10 h-10 mb-3" />
          <p className="text-3xl font-bold mb-1">580</p>
          <p className="text-sm opacity-90">Melhor pontuação</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-lg text-white">
          <AlertTriangle className="w-10 h-10 mb-3" />
          <p className="text-3xl font-bold mb-1">4</p>
          <p className="text-sm opacity-90">Eventos de stress</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl shadow-lg text-white">
          <CheckCircle2 className="w-10 h-10 mb-3" />
          <p className="text-3xl font-bold mb-1">2</p>
          <p className="text-sm opacity-90">Auto-regulação</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          Última Sessão - Frequência Cardíaca
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={heartRateSession}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[60, 130]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="bpm"
              stroke="#ef4444"
              fill="#fca5a5"
              strokeWidth={2}
            />
            <Line y={110} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-sm text-purple-900 mt-2">
          Linha amarela indica o limite de stress (110 BPM)
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          Progresso Emocional
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={emotionalProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="stress"
              stroke="#ef4444"
              strokeWidth={3}
              name="Eventos de stress"
            />
            <Line
              type="monotone"
              dataKey="regulation"
              stroke="#10b981"
              strokeWidth={3}
              name="Autorregulação"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Histórico de Sessões</h2>
        <div className="space-y-3">
          {recentSessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-purple-50 rounded-xl"
            >
              <div>
                <p className="font-semibold text-purple-700">{session.game}</p>
                <p className="text-sm text-purple-600">{session.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-700">
                  <span className="font-semibold">{session.maxBPM} BPM</span> máx
                </p>
                <p className="text-sm text-purple-600">
                  {session.stressEvents} eventos • {session.duration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white mt-6">
        <h3 className="text-xl font-bold mb-3">Configurações de Monitorização</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Limite de BPM para stress</span>
            <input
              type="number"
              defaultValue={110}
              className="px-4 py-2 rounded-lg text-purple-700 font-semibold w-24 text-center"
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Intervalo de medição</span>
            <select className="px-4 py-2 rounded-lg text-purple-700 font-semibold">
              <option>2 segundos</option>
              <option>5 segundos</option>
              <option>10 segundos</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
