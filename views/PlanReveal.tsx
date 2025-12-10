
import React, { useEffect, useState } from 'react';
import { AIProfileAnalysis } from '../types';
import { Icons } from '../components/Icons';

interface PlanRevealProps {
  analysis: AIProfileAnalysis;
  onContinue: () => void;
  userName?: string;
}

export const PlanReveal: React.FC<PlanRevealProps> = ({ analysis, onContinue }) => {
  const [stage, setStage] = useState(0);

  // Stagger animations
  useEffect(() => {
    const timers = [
        setTimeout(() => setStage(1), 500),  // Title
        setTimeout(() => setStage(2), 1500), // Cards
        setTimeout(() => setStage(3), 3000), // Timeline
        setTimeout(() => setStage(4), 4500)  // Button
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white flex flex-col p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-brand-green/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className={`flex-1 flex flex-col justify-center transition-all duration-1000 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
         <div className="mb-10 text-center">
             <div className="inline-block p-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black mb-4 shadow-xl">
                 <Icons.Sparkles className="w-8 h-8" />
             </div>
             <h1 className="text-3xl font-bold mb-2">Your AI Plan is Ready</h1>
             <p className="text-slate-500 dark:text-zinc-400">Gemini 3 Pro has calibrated your daily targets.</p>
         </div>

         <div className={`grid grid-cols-2 gap-4 mb-8 transition-all duration-1000 delay-200 ${stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                 <div className="flex items-center gap-2 mb-2 text-brand-green">
                     <Icons.Fire className="w-5 h-5" />
                     <span className="font-bold text-xs uppercase">Calories</span>
                 </div>
                 <span className="text-3xl font-black block mb-1">{analysis.daily_calories}</span>
                 <span className="text-xs text-slate-400">Daily Target</span>
             </div>

             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                 <div className="flex items-center gap-2 mb-2 text-blue-500">
                     <Icons.Water className="w-5 h-5" />
                     <span className="font-bold text-xs uppercase">Water</span>
                 </div>
                 <span className="text-3xl font-black block mb-1">{(analysis.daily_water_ml / 1000).toFixed(1)}L</span>
                 <span className="text-xs text-slate-400">Hydration Goal</span>
             </div>

             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                 <div className="flex items-center gap-2 mb-2 text-purple-500">
                     <Icons.Gym className="w-5 h-5" />
                     <span className="font-bold text-xs uppercase">Protein</span>
                 </div>
                 <span className="text-3xl font-black block mb-1">{analysis.daily_protein_g}g</span>
                 <span className="text-xs text-slate-400">Muscle Repair</span>
             </div>

             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                 <div className="flex items-center gap-2 mb-2 text-orange-500">
                     <Icons.Steps className="w-5 h-5" />
                     <span className="font-bold text-xs uppercase">Movement</span>
                 </div>
                 <span className="text-3xl font-black block mb-1">{(analysis.daily_steps / 1000).toFixed(1)}k</span>
                 <span className="text-xs text-slate-400">Steps Target</span>
             </div>
         </div>

         <div className={`bg-gradient-to-r from-slate-900 to-slate-800 dark:from-zinc-800 dark:to-zinc-900 text-white p-6 rounded-3xl shadow-xl transition-all duration-1000 ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
             <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                 <Icons.Target className="w-5 h-5 text-brand-green" />
                 Strategy
             </h3>
             <p className="text-slate-300 text-sm leading-relaxed mb-4">
                 {analysis.timeline_prediction}
             </p>
             <div className="flex items-center gap-2 text-xs font-bold text-brand-green uppercase tracking-wide">
                 <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div>
                 {analysis.workout_intensity} Intensity Plan
             </div>
         </div>
      </div>

      <div className={`mt-6 transition-all duration-1000 ${stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button 
             onClick={onContinue}
             className="w-full py-5 bg-brand-green text-white rounded-2xl font-bold text-lg shadow-xl shadow-green-500/30 active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
             <span>Open Dashboard</span>
             <Icons.ArrowRight className="w-6 h-6" />
          </button>
      </div>
    </div>
  );
};
