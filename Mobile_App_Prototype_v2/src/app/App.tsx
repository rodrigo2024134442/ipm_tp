import { RouterProvider } from 'react-router';
import { AnimatePresence } from 'motion/react';
import { router } from './routes';
import { AppProvider, useApp } from './context/AppContext';
import CrisisSimulationModal from './components/CrisisSimulationModal';

function AppContent() {
  const { isSimulating } = useApp();

  return (
    <div className="size-full" style={{ background: 'white' }}>
      <AnimatePresence>
        {isSimulating && <CrisisSimulationModal />}
      </AnimatePresence>
      <RouterProvider router={router} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}