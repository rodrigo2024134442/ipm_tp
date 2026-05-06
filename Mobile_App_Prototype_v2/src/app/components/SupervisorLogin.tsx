import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Simple PIN-based gate — in production you'd hash this and store it properly
const SUPERVISOR_PIN = '1234';

interface Props {
  destination: string; // where to go after auth
}

export default function SupervisorLogin({ destination }: Props) {
  const navigate = useNavigate();
  const { setUserRole } = useApp();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError('');
    if (next.length === 4) {
      setTimeout(() => attempt(next), 80); // small delay feels more real
    }
  };

  const attempt = (value: string) => {
    if (value === SUPERVISOR_PIN) {
      setUserRole('supervisor');
      navigate(destination);
    } else {
      setShake(true);
      setError('PIN incorreto. Tenta novamente.');
      setPin('');
      setTimeout(() => setShake(false), 500);
    }
  };

  const dots = Array.from({ length: 4 }, (_, i) => i < pin.length);

  return (
    <div className="size-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <button
        onClick={() => navigate('/menu')}
        className="absolute top-6 left-6 px-6 py-3 bg-white rounded-full shadow-lg text-purple-600 font-semibold"
      >
        ← Voltar
      </button>

      <div
        className={`flex flex-col items-center gap-6 max-w-xs w-full ${shake ? 'animate-bounce' : ''}`}
        style={shake ? { animation: 'shake 0.4s' } : {}}
      >
        <div className="p-5 bg-purple-100 rounded-full">
          <Shield className="w-16 h-16 text-purple-600" />
        </div>

        <h1 className="text-3xl font-bold text-purple-700 text-center">Área do Supervisor</h1>
        <p className="text-purple-500 text-center">Introduz o PIN para continuar</p>

        {/* PIN dots */}
        <div className="flex gap-4">
          {dots.map((filled, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 border-purple-400 transition-all duration-150 ${
                filled ? 'bg-purple-500 scale-110' : 'bg-white'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {['1','2','3','4','5','6','7','8','9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="py-5 text-2xl font-bold text-purple-700 bg-white rounded-2xl shadow-md hover:bg-purple-50 active:scale-95 transition-transform"
            >
              {d}
            </button>
          ))}
          <button className="py-5" /> {/* empty */}
          <button
            onClick={() => handleDigit('0')}
            className="py-5 text-2xl font-bold text-purple-700 bg-white rounded-2xl shadow-md hover:bg-purple-50 active:scale-95 transition-transform"
          >
            0
          </button>
          <button
            onClick={() => setPin((p) => p.slice(0, -1))}
            className="py-5 text-xl font-bold text-purple-400 bg-white rounded-2xl shadow-md hover:bg-purple-50 active:scale-95 transition-transform"
          >
            ⌫
          </button>
        </div>

        <p className="text-xs text-purple-400 opacity-60">PIN padrão: 1234</p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-8px); }
          40%,80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
