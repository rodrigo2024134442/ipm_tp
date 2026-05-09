import { useNavigate } from 'react-router';
import { Gamepad2, TrendingUp, Settings, Activity, Watch, ShieldCheck, UserRound, Lock, CheckCircle, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

// ============================================
// COMPONENTE: MODAL DE ACESSO PROTEGIDO
// ============================================
// Exibido quando criança tenta acessar Configurações ou Adulto
interface ProtectedAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

function ProtectedAccessModal({ isOpen, onClose, title }: ProtectedAccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-sm"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
              {/* Ícone de cadeado */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-orange-100 rounded-full">
                  <Lock className="w-10 h-10 text-orange-600" />
                </div>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-purple-900 mb-3">Acesso Protegido 🔒</h2>

              {/* Mensagem */}
              <p className="text-lg text-purple-800 mb-6">
                "{title}" é apenas para os pais/cuidadores.
              </p>

              {/* Instrução */}
              <p className="text-sm text-purple-700 mb-8">
                Peça ajuda a um adulto se precisar.
              </p>

              {/* Botão de fechar */}
              <button
                onClick={onClose}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Entendi ✓
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: MENU PRINCIPAL
// ============================================
export default function MainMenu() {
  const navigate = useNavigate();
  const { isWatchConnected, userRole, setUserRole } = useApp();
  const [protectedAccessModal, setProtectedAccessModal] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinShake, setPinShake] = useState(false);

  // Simulação de estado da batida cardíaca apenas para feedback visual
  const mockHeartRate = 72;

  const isSupervisor = userRole === 'supervisor';

  // ============================================
  // DEFINIÇÃO DOS ITENS DE MENU
  // com hierarquia e contextos diferenciados
  // ============================================
  const menuItems = [
    {
      id: 'play',
      icon: Gamepad2,
      label: 'Jogar',
      color: 'from-emerald-200 to-cyan-200',
      path: '/games',
      supervisorOnly: false,
      description: 'Escolhe um jogo',
    },
    {
      id: 'profile',
      icon: UserRound, // Ícone MAIS AMIGÁVEL para criança (Avatar em vez de TrendingUp)
      label: 'Meu Perfil',
      color: 'from-blue-400 to-cyan-500',
      path: '/profile',
      supervisorOnly: false,
      description: 'Vê o teu progresso',
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Configurações',
      color: 'from-orange-400 to-amber-500',
      path: '/settings',
      supervisorOnly: true, // PROTEGIDO para cuidadores
      description: 'Definições da app',
      protected: true, // Bandeira para ativar proteção
    },
    {
      id: 'therapist',
      icon: Activity,
      label: 'Adulto',
      color: 'from-purple-400 to-pink-500',

      path: '/therapist',
      supervisorOnly: true, // PROTEGIDO para cuidadores
      description: 'Dashboard do adulto',
      protected: true, // Bandeira para ativar proteção
    },
  ];

  // ============================================
  // HANDLER: Acesso a funcionalidades protegidas
  // Implementa Prevenção de Erros de Nielsen
  // ============================================
  const handleProtectedButtonClick = (item: typeof menuItems[0]) => {
    // Se é protegido E utilizador é criança → Abre modal
    if (item.protected && !isSupervisor) {
      setProtectedAccessModal(item.label);
    } else {
      // Todos os outros casos (criança em botões públicos, ou supervisor em qualquer) → Navigate
      navigate(item.path);
    }
  };

  // ============================================
  // HANDLER: Alternar modo supervisor
  // ============================================
  const SUPERVISOR_PIN = '1234';

  const openPinModal = () => {
    setPin('');
    setPinError('');
    setShowPinModal(true);
  };

  const attemptPin = (value: string) => {
    if (value === SUPERVISOR_PIN) {
      setUserRole('supervisor');
      setShowPinModal(false);
      setPin('');
      setPinError('');
    } else {
      setPin('');
      setPinError('PIN incorreto. Tenta novamente.');
      setPinShake(true);
      setTimeout(() => setPinShake(false), 500);
    }
  };

  const handleToggleSupervisor = () => {
    if (isSupervisor) {
      setUserRole('child');
    } else {
      openPinModal();
    }
  };

  return (
    <div
      className="size-full flex flex-col p-6 overflow-y-auto"
      style={{
        background: 'linear-gradient(to bottom, rgb(249, 168, 212), rgb(192, 132, 250))',
      }}
    >
      {/* ============================================
          HEADER MÓVEL: Modo Parental/Adulto + Estado (Ligado/Desligado) + BPM
          - Mostra: rótulo de modo (Parental/Adulto), indicador ON/OFF
          - Mostra: ícone de relógio com dot de estado e BPM à direita
      ============================================ */}
      <div className="w-full mb-6">
        <div className="mx-0 px-2">
          <div className="bg-gradient-to-r from-purple-200/60 to-purple-300/40 shadow-sm rounded-2xl h-14 flex items-center justify-between px-3">
            {/* Left: Modo Parental/Adulto (clicável para ativar/desativar) */}
            <motion.button
              onClick={handleToggleSupervisor}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 focus:outline-none"
              title={isSupervisor ? 'Clica para sair do modo supervisor' : 'Clica para modo supervisor'}
              aria-pressed={isSupervisor}
            >
              <div className="bg-white/10 p-2 rounded-md">
                <Lock className="w-5 h-5 text-white" />
              </div>

              <div className="flex flex-col leading-none">
                <span className="text-white text-sm font-semibold">Modo Parental</span>
                <span className={`text-xs ${isSupervisor ? 'text-green-100' : 'text-white/80'}`}>
                  {isSupervisor ? 'Ligado' : 'Desligado'}
                </span>
              </div>
            </motion.button>

            {/* Right: watch icon + BPM indicator */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/bluetooth')}
                className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg"
                aria-label="Estado do relógio"
              >
                <div className="relative">
                  <Smartphone className={`w-5 h-5 ${isWatchConnected ? 'text-green-400' : 'text-white'}`} />
                  {isWatchConnected && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full ring-1 ring-white" />
                  )}
                </div>
                {/* BPM visível mesmo sem texto grande: pequeno badge */}
                {isWatchConnected ? (
                  <span className="text-white text-xs font-semibold">{mockHeartRate} BPM</span>
                ) : (
                  <span className="text-white text-xs opacity-80">Desligado</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          TÍTULO: MENU PRINCIPAL
      ============================================ */}
      <h1 className="text-4xl font-bold text-purple-900 mb-10 text-center">Saber Perder!</h1>

      {/* Note: role toggle and watch connection controls moved to header */}

      {/* ============================================
          SECÇÃO 2: GRID DE BOTÕES PRINCIPAIS
          Hierarquia Visual + Lei de Fitts (espaçamento robusto)
      ============================================ */}
      <div className="flex flex-col gap-6 flex-1 max-w-3xl mx-auto w-full">
        {/* JOGAR - Botão dominante */}
        {menuItems.slice(0, 1).map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleProtectedButtonClick(item)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center justify-between gap-6 p-8 bg-gradient-to-br ${item.color} rounded-3xl shadow-xl text-white transition-all duration-200 min-h-[180px] hover:shadow-2xl`}
            >
          
              {/* Ícone + Texto */}
              <div className="flex items-center gap-8 flex-1">
                <div className="p-5 bg-white/30 rounded-2xl">
                  <Icon className="w-16 h-16 flex-shrink-0" />
                </div>

                <div className="text-left">
                  <h3 className="text-4xl font-bold mb-2">{item.label}</h3>
                  <p className="text-lg opacity-90">{item.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* PERFIL - Tamanho normal */}
        {menuItems.slice(1, 2).map((item) => {
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => handleProtectedButtonClick(item)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center justify-between gap-6 p-8 bg-gradient-to-br ${item.color} rounded-3xl shadow-xl text-white transition-all duration-200 min-h-[120px] hover:shadow-2xl`}
            >
              {/* Ícone + Texto */}
              <div className="flex items-center gap-6 flex-1">
                <div className="p-4 bg-white/30 rounded-2xl">
                  <Icon className="w-12 h-12 flex-shrink-0" />
                </div>

                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-1">{item.label}</h3>
                  <p className="text-sm opacity-90">{item.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* CONFIGURAÇÕES + ADULTO - Botões menores em grid 2 colunas */}
        <div className="grid grid-cols-2 gap-6">
          {menuItems.slice(2, 4).map((item) => {
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleProtectedButtonClick(item)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                  className={`relative flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br ${item.color} rounded-3xl shadow-xl text-white transition-all duration-200 min-h-[110px] hover:shadow-2xl`}
              >
                {/* Ícone */}
                <div className="p-3 bg-white/30 rounded-xl">
                  <Icon className="w-8 h-8" />
                </div>

                {/* Texto */}
                <div className="text-center">
                  <h3 className="text-lg font-bold">{item.label}</h3>
                  <p className="text-xs opacity-90">{item.description}</p>
                </div>

                {/* Ícone de Cadeado para funções protegidas */}
                {item.protected && (
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: -10 }}
                    className="absolute top-2 right-2 p-1.5 bg-white/20 rounded-full"
                  >
                    <Lock className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ============================================
          MODAL: ACESSO PROTEGIDO
          Exibido quando criança tenta acessar
          Configurações ou Adulto
      ============================================ */}
      <ProtectedAccessModal
        isOpen={protectedAccessModal !== null}
        onClose={() => setProtectedAccessModal(null)}
        title={protectedAccessModal || ''}
      />

      {/* ============================================
          MODAL: PIN DO SUPERVISOR (ativação inline)
      ============================================ */}
      <AnimatePresence>
        {showPinModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinModal(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-sm"
            >
              <div className={`bg-white rounded-3xl shadow-2xl p-6 text-center ${pinShake ? 'animate-bounce' : ''}`}>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-50 rounded-full">
                    <Lock className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-purple-900 mb-2">PIN do Supervisor</h3>
                <p className="text-sm text-purple-600 mb-3">Introduz o PIN para ativar o modo supervisor.</p>

                {/* PIN dots */}
                <div className="flex justify-center gap-3 mb-3">
                  {Array.from({ length: 4 }, (_, i) => i < pin.length).map((filled, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 border-purple-300 ${filled ? 'bg-purple-600' : 'bg-white'}`}
                    />
                  ))}
                </div>

                {pinError && <p className="text-red-500 text-sm mb-3">{pinError}</p>}

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['1','2','3','4','5','6','7','8','9'].map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        if (pin.length >= 3) {
                          const next = pin + d;
                          setPin(next);
                          setTimeout(() => attemptPin(next), 80);
                        } else {
                          setPin((p) => p + d);
                        }
                      }}
                      className="py-4 text-2xl font-bold text-purple-700 bg-white rounded-2xl shadow-sm hover:bg-purple-50 active:scale-95 transition-transform"
                    >
                      {d}
                    </button>
                  ))}

                  <div />
                  <button
                    onClick={() => {
                      if (pin.length >= 3) {
                        const next = pin + '0';
                        setPin(next);
                        setTimeout(() => attemptPin(next), 80);
                      } else {
                        setPin((p) => p + '0');
                      }
                    }}
                    className="py-4 text-2xl font-bold text-purple-700 bg-white rounded-2xl shadow-sm hover:bg-purple-50 active:scale-95 transition-transform"
                  >
                    0
                  </button>

                  <button
                    onClick={() => setPin((p) => p.slice(0, -1))}
                    className="py-4 text-xl font-bold text-purple-400 bg-white rounded-2xl shadow-sm hover:bg-purple-50 active:scale-95 transition-transform"
                  >
                    ⌫
                  </button>
                </div>

                <button
                  onClick={() => setShowPinModal(false)}
                  className="px-6 py-3 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Espaço de segurança na base (Lei de Fitts) */}
      <div className="h-6" />
    </div>
  );
}
