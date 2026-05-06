import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Bell, Shield, Volume2, Moon, Eye, Type, Zap, UserRound, Lock } from 'lucide-react';
import { useApp, AccessibilitySettings } from '../context/AppContext';

export default function ParentSettings() {
  const navigate = useNavigate();
  const { setUserRole, accessibility, setAccessibility } = useApp();

  const handleFullReset = () => {
    const confirmed = window.confirm('Isto vai apagar todo o progresso, conquistas, streak e definições. Queres continuar?');
    if (!confirmed) return;

    ['saberperder_sessions', 'saberperder_settings', 'saberperder_achievements', 'saberperder_streak'].forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });

    window.location.reload();
  };

  const [settings, setSettings] = useState({
    notifications: true,
    freePlayMode: false,
    stressAlerts: true,
    soundEnabled: true,
    nightMode: false,
  });

  const toggleSetting = (key: keyof typeof settings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const updateA11y = (patch: Partial<AccessibilitySettings>) =>
    setAccessibility({ ...accessibility, ...patch });

  const toggleItems = [
    { key: 'notifications' as const, icon: Bell, label: 'Notificações', desc: 'Receber alertas de progresso' },
    { key: 'freePlayMode' as const, icon: Shield, label: 'Modo Jogo Livre', desc: 'Desativar monitorização de stress' },
    { key: 'stressAlerts' as const, icon: Bell, label: 'Alertas de Stress', desc: 'Notificar quando BPM está elevado' },
    { key: 'soundEnabled' as const, icon: Volume2, label: 'Sons', desc: 'Ativar efeitos sonoros' },
    { key: 'nightMode' as const, icon: Moon, label: 'Modo Noturno', desc: 'Cores mais escuras e suaves' },
  ];

  return (
    <div className="size-full flex flex-col bg-gradient-to-b from-blue-50 to-purple-50 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/menu')}
          className="px-6 py-3 bg-white rounded-full shadow-lg text-purple-900 font-semibold">
          ← Voltar
        </button>
        <button
          onClick={() => { setUserRole('child'); navigate('/menu'); }}
          className="flex items-center gap-2 px-5 py-3 bg-purple-100 text-purple-900 rounded-full shadow font-semibold text-sm hover:bg-purple-200"
        >
          <UserRound className="w-4 h-4" /> Sair do modo supervisor
        </button>
      </div>

      <h1 className="text-4xl font-bold text-purple-900 mb-8">Configurações</h1>

      {/* Profile */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-purple-100 rounded-full">
            <User className="w-12 h-12 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900">Perfil da Criança</h2>
            <p className="text-purple-900">João, 7 anos</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform">
          Editar Perfil
        </button>
      </div>

      {/* Accessibility */}
      <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
        <div className="p-6 pb-3 border-b border-purple-100">
          <h2 className="text-2xl font-bold text-purple-900">Acessibilidade</h2>
          <p className="text-sm text-purple-900 mt-1">Estas definições ajudam a criança a usar melhor a app</p>
        </div>

        {/* Reduce motion */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100">
          <div className="flex items-center gap-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-900">Reduzir Animações</p>
              <p className="text-sm text-purple-900">Menos movimento no ecrã</p>
            </div>
          </div>
          <button
            onClick={() => updateA11y({ reduceMotion: !accessibility.reduceMotion })}
            className={`relative w-16 h-8 rounded-full transition-colors ${accessibility.reduceMotion ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${accessibility.reduceMotion ? 'translate-x-9' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* High contrast */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100">
          <div className="flex items-center gap-4">
            <Eye className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-900">Alto Contraste</p>
              <p className="text-sm text-purple-900">Cores com maior contraste</p>
            </div>
          </div>
          <button
            onClick={() => updateA11y({ highContrast: !accessibility.highContrast })}
            className={`relative w-16 h-8 rounded-full transition-colors ${accessibility.highContrast ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${accessibility.highContrast ? 'translate-x-9' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Font size */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Type className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-900">Tamanho do Texto</p>
              <p className="text-sm text-purple-900">Ajusta o tamanho das letras</p>
            </div>
          </div>
          <div className="flex gap-3">
            {(['normal', 'large', 'xlarge'] as const).map((size) => (
              <button
                key={size}
                onClick={() => updateA11y({ fontSize: size })}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  accessibility.fontSize === size
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                }`}
              >
                {size === 'normal' ? 'Normal' : size === 'large' ? 'Grande' : 'Muito Grande'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* General settings */}
      <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
        <h2 className="text-2xl font-bold text-purple-900 p-6 pb-4">Preferências</h2>
        {toggleItems.map((item, index) => (
          <div key={item.key}
            className={`flex items-center justify-between p-6 ${index !== toggleItems.length - 1 ? 'border-b border-purple-100' : ''}`}>
            <div className="flex items-center gap-4">
              <item.icon className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-semibold text-purple-900">{item.label}</p>
                <p className="text-sm text-purple-900">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => toggleSetting(item.key)}
              className={`relative w-16 h-8 rounded-full transition-colors ${settings[item.key] ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${settings[item.key] ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
          </div>
        ))}
      </div>

      {/* PIN change */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-purple-900">PIN do Supervisor</h2>
        </div>
        <p className="text-purple-900 text-sm mb-4">
          O PIN atual é <strong>1234</strong>. Muda-o para proteger o acesso.
        </p>
        <button className="px-6 py-3 bg-purple-100 text-purple-700 font-semibold rounded-full hover:bg-purple-200 transition-colors">
          Alterar PIN
        </button>
      </div>

      {/* About */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-purple-900 mb-4">Sobre a App</h2>
        <div className="space-y-2 text-purple-900 text-sm mb-6">
          <p><span className="font-semibold">Versão:</span> 1.1.0</p>
          <p><span className="font-semibold">Desenvolvido para:</span> Crianças com PEA</p>
          <p className="leading-relaxed">
            Saber Perder ajuda crianças a lidarem com a frustração através de jogos interativos
            e monitorização biométrica em tempo real.
          </p>
        </div>
        <div className="space-y-3">
          {['Política de Privacidade', 'Termos de Uso', 'Contactar Suporte'].map((label) => (
            <button key={label} className="w-full px-6 py-3 bg-purple-100 text-purple-900 font-semibold rounded-full hover:bg-purple-200 transition-colors">
              {label}
            </button>
          ))}
          <button
            onClick={handleFullReset}
            className="w-full px-6 py-3 bg-red-100 text-red-700 font-semibold rounded-full hover:bg-red-200 transition-colors"
          >
            Reset total de dados
          </button>
        </div>
      </div>
    </div>
  );
}
