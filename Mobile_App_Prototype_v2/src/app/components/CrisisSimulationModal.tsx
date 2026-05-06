import { motion } from 'motion/react';
import { Heart, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CrisisSimulationModal() {
  const { accessibility, triggerSimulatedStress } = useApp();

  const handleSimulation = (willLowerHR: boolean) => {
    triggerSimulatedStress(willLowerHR);
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-b from-red-100 to-orange-100 p-8 fixed inset-0 z-50">
      <motion.div
        initial={accessibility.reduceMotion ? {} : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={accessibility.reduceMotion ? {} : { scale: 0, opacity: 0 }}
        className="flex flex-col items-center gap-8 max-w-lg bg-white p-12 rounded-3xl shadow-2xl"
      >
        <motion.div
          animate={accessibility.reduceMotion ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 1 }}
        >
          <Heart className="w-24 h-24 text-red-500 fill-red-400" />
        </motion.div>

        <div className="flex items-center gap-4 px-8 py-4 bg-orange-100 rounded-full">
          <AlertCircle className="w-8 h-8 text-orange-600" />
          <span className="text-xl font-bold text-orange-700">Simulação de Crise</span>
        </div>

        <h1 className="text-3xl font-bold text-purple-900 text-center">
          Vamos simular uma crise
        </h1>
        <p className="text-lg text-purple-900 text-center">
          Nesta simulação, a criança vai conseguir baixar o batimento cardíaco ou não?
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => handleSimulation(true)}
            className="px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
          >
            Sim, consegue baixar 💚
          </button>
          <button
            onClick={() => handleSimulation(false)}
            className="px-12 py-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xl font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
          >
            Não, fica stressado 😤
          </button>
        </div>
      </motion.div>
    </div>
  );
}
