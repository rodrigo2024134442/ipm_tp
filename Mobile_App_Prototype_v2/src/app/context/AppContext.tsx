import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

export type UserRole = 'child' | 'supervisor';

export interface SessionData {
  id: string;
  timestamp: string; // ISO string for JSON serialization
  game: string;
  maxHeartRate: number;
  stressEvents: number;
  autoRegulationEvents: number; // stress events that were self-resolved (BP decreased after guided breathing)
  completed: boolean;
  score: number;
}

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
}

interface AppContextType {
  heartRate: number;
  isWatchConnected: boolean;
  stressDetected: boolean;
  sessionData: SessionData[];
  userRole: UserRole;
  accessibility: AccessibilitySettings;
  lastGamePath: string | null; // for returning after breathing
  isSimulating: boolean;
  simulationChoice: boolean | null; // true = will lower, false = won't lower
  setUserRole: (role: UserRole) => void;
  setAccessibility: (s: AccessibilitySettings) => void;
  setLastGamePath: (path: string | null) => void;
  connectWatch: () => void;
  disconnectWatch: () => void;
  startHeartRateMonitoring: (context?: 'idle' | 'playing' | 'gameover') => void;
  stopHeartRateMonitoring: () => void;
  setMonitoringContext: (context: 'idle' | 'playing' | 'gameover') => void;
  addSessionData: (data: Omit<SessionData, 'id' | 'timestamp'>) => void;
  resetStress: () => void;
  simulateCrisis: () => void;
  setHeartRate: (rate: number) => void;
  setSimulationChoice: (choice: boolean | null) => void;
  setStressDetected: (detected: boolean) => void;
  triggerSimulatedStress: (willLowerHR: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const STORAGE_KEY = 'saberperder_sessions';
const SETTINGS_KEY = 'saberperder_settings';

function loadSessions(): SessionData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(data: SessionData[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data.slice(-100))); } catch {}
}

function loadAccessibility(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { reduceMotion: false, highContrast: false, fontSize: 'normal' };
  } catch { return { reduceMotion: false, highContrast: false, fontSize: 'normal' }; }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [heartRate, setHeartRate] = useState(75);
  const [isWatchConnected, setIsWatchConnected] = useState(false);
  const [stressDetected, setStressDetected] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData[]>(loadSessions);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('child');
  const [accessibility, setAccessibilityState] = useState<AccessibilitySettings>(loadAccessibility);
  const [lastGamePath, setLastGamePath] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationChoice, setSimulationChoice] = useState<boolean | null>(null);
  const monitoringContext = useRef<'idle' | 'playing' | 'gameover'>('idle');
  const hrRef = useRef(75);

  const STRESS_THRESHOLD = 110;

  // Realistic heart rate simulation:
  // idle: stays 70-85, slow drift
  // playing: ramps toward 95-105 gradually, spikes possible
  // gameover: quick spike then slow recovery
  useEffect(() => {
    if (!isMonitoring || !isWatchConnected) return;

    const interval = setInterval(() => {
      const ctx = monitoringContext.current;
      const current = hrRef.current;

      let target: number;
      let maxStep: number;

      if (ctx === 'idle') {
        target = 78 + Math.random() * 8;   // 78–86
        maxStep = 2;
      } else if (ctx === 'playing') {
        target = 90 + Math.random() * 20;  // 90–110, realistic play arousal
        maxStep = 4;
      } else { // gameover — spike then drop
        target = current > 100 ? 75 : current + 15;
        maxStep = 8;
      }

      const diff = target - current;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), maxStep);
      const noise = (Math.random() - 0.5) * 3;
      const next = Math.round(Math.max(55, Math.min(160, current + step + noise)));

      hrRef.current = next;
      setHeartRate(next);

      if (next > STRESS_THRESHOLD && !stressDetected) {
        setStressDetected(true);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isMonitoring, isWatchConnected, stressDetected]);

  const setAccessibility = (s: AccessibilitySettings) => {
    setAccessibilityState(s);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  };

  const addSessionData = (data: Omit<SessionData, 'id' | 'timestamp'>) => {
    const full: SessionData = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
    };
    setSessionData((prev) => {
      const next = [...prev, full];
      saveSessions(next);
      return next;
    });
  };

  // Apply font-size and high-contrast to root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-base', 'text-lg', 'text-xl');
    if (accessibility.fontSize === 'large') root.classList.add('text-lg');
    else if (accessibility.fontSize === 'xlarge') root.classList.add('text-xl');
    root.classList.toggle('high-contrast', accessibility.highContrast);
  }, [accessibility]);

  return (
    <AppContext.Provider value={{
      heartRate,
      isWatchConnected,
      stressDetected,
      sessionData,
      userRole,
      accessibility,
      lastGamePath,
      isSimulating,
      simulationChoice,
      setUserRole,
      setAccessibility,
      setLastGamePath,
      connectWatch: () => { setIsWatchConnected(true); hrRef.current = 75; setHeartRate(75); },
      disconnectWatch: () => { setIsWatchConnected(false); setIsMonitoring(false); },
      startHeartRateMonitoring: (ctx = 'idle') => {
        monitoringContext.current = ctx;
        setIsMonitoring(true);
        hrRef.current = 75;
        setHeartRate(75);
        setStressDetected(false);
      },
      stopHeartRateMonitoring: () => setIsMonitoring(false),
      setMonitoringContext: (ctx) => { monitoringContext.current = ctx; },
      addSessionData,
      resetStress: () => { setStressDetected(false); hrRef.current = 75; setHeartRate(75); setIsSimulating(false); setSimulationChoice(null); },
      simulateCrisis: () => {
        setIsSimulating(true);
      },
      triggerSimulatedStress: (willLowerHR: boolean) => {
        setSimulationChoice(willLowerHR);
        hrRef.current = 125;
        setHeartRate(125);
        setStressDetected(true);
        setIsSimulating(false);
      },
      setHeartRate,
      setSimulationChoice,
      setStressDetected,
    }}>
      {children}
    </AppContext.Provider>
  );
};
