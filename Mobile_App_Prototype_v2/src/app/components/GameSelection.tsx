import { useNavigate } from 'react-router';
import { Dice6, Puzzle, Flag } from 'lucide-react';

export default function GameSelection() {
  const navigate = useNavigate();

  const games = [
    {
      id: 'dice',
      title: 'O Dado Teimoso',
      icon: Dice6,
      color: 'from-red-400 to-orange-500',
      description: 'Lança o dado e tenta a tua sorte!',
      path: '/game/dice',
      level: '⭐'
    },
    {
      id: 'obstacle',
      title: 'Corrida de Obstáculos',
      icon: Flag,
      color: 'from-blue-400 to-cyan-500',
      description: 'Salta os obstáculos!',
      path: '/game/obstacle',
      level: '⭐⭐',
    },
    {
      id: 'puzzle',
      title: 'Desafio do Puzzle',
      icon: Puzzle,
      color: 'from-purple-400 to-pink-500',
      description: 'Completa o puzzle a tempo!',
      path: '/game/puzzle',
      level: '⭐⭐⭐',
    },
  ];

  return (
    <div className="size-full flex flex-col p-6" style={{ background: 'linear-gradient(to bottom, rgb(235, 245, 255), rgb(220, 240, 255))' }}>
      <button
        onClick={() => navigate('/menu')}
        className="mb-6 px-6 py-3 bg-white rounded-full shadow-lg text-purple-900 font-semibold w-fit"
      >
        ← Voltar
      </button>

      <h1 className="text-4xl font-bold text-purple-900 text-center mb-8">
        Escolhe um Jogo
      </h1>

      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => navigate(game.path)}
            className={`flex items-center gap-6 p-8 bg-gradient-to-r ${game.color} rounded-3xl shadow-xl text-white hover:scale-105 transition-transform`}
          >
            <div className="flex flex-col items-center mr-4">
              <game.icon className="w-16 h-16 flex-shrink-0" />
              {game.level && <span className="mt-2 text-xs bg-white/20 px-2 py-1 rounded-full">{game.level}</span>}
            </div>
            <div className="text-left">
              <h2 className="text-3xl font-bold mb-2">{game.title}</h2>
              <p className="text-xl opacity-90">{game.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
