import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Watch, Bluetooth, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BluetoothPairing() {
  const navigate = useNavigate();
  const { isWatchConnected, connectWatch, disconnectWatch } = useApp();
  const [status, setStatus] = useState<'idle' | 'searching' | 'connected' | 'failed'>(
    isWatchConnected ? 'connected' : 'idle'
  );

  const handlePair = () => {
    setStatus('searching');
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      if (success) {
        setStatus('connected');
        connectWatch();
      } else {
        setStatus('failed');
      }
    }, 3000);
  };

  const handleDisconnect = () => {
    disconnectWatch();
    setStatus('idle');
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'searching':
        return {
          icon: Loader2,
          text: 'A procurar dispositivo...',
          color: 'bg-blue-500',
          animate: true,
        };
      case 'connected':
        return {
          icon: CheckCircle,
          text: 'Conectado!',
          color: 'bg-green-500',
          animate: false,
        };
      case 'failed':
        return {
          icon: XCircle,
          text: 'Falha na conexão',
          color: 'bg-red-500',
          animate: false,
        };
      default:
        return {
          icon: Bluetooth,
          text: 'Desconectado',
          color: 'bg-gray-400',
          animate: false,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="size-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-8">
      <button
        onClick={() => navigate('/menu')}
        className="absolute top-6 left-6 px-6 py-3 bg-white rounded-full shadow-lg text-purple-900 font-semibold"
      >
        ← Voltar
      </button>

      <div className="flex flex-col items-center gap-8 max-w-md">
        <Watch className="w-32 h-32 text-purple-600" />

        <h1 className="text-4xl font-bold text-purple-900 text-center">
          Conectar Relógio
        </h1>

        <div className={`flex items-center gap-4 px-8 py-6 ${statusConfig.color} text-white rounded-2xl shadow-lg`}>
          <StatusIcon className={`w-8 h-8 ${statusConfig.animate ? 'animate-spin' : ''}`} />
          <span className="text-xl font-semibold">{statusConfig.text}</span>
        </div>

        {status === 'idle' || status === 'failed' ? (
          <button
            onClick={handlePair}
            className="px-12 py-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
          >
            Conectar
          </button>
        ) : status === 'connected' ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={handleDisconnect}
              className="px-12 py-6 bg-gradient-to-r from-red-400 to-pink-400 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              Desconectar
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="px-12 py-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
            >
              Continuar
            </button>
          </div>
        ) : null}

        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg max-w-sm">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">Como conectar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-purple-900">
            <li className="text-purple-900">Liga o teu relógio</li>
            <li className="text-purple-900">Ativa o Bluetooth</li>
            <li className="text-purple-900">Carrega em "Conectar"</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
