
import React, { useEffect, useState } from 'react';
import { Icons } from '../components/Icons';
import { Card } from '../components/Card';
import { UserStats, ViewState } from '../types';

interface HydraAIProps {
  stats: UserStats;
  hydrationAdvice: string | null;
  onUpdateWater: (amount: number) => void;
  onSetTarget: (target: number) => void;
  onNavigate: (view: ViewState) => void;
  onRefreshAdvice: () => void;
}

export const HydraAI: React.FC<HydraAIProps> = ({ stats, hydrationAdvice, onUpdateWater, onSetTarget, onNavigate, onRefreshAdvice }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const percentage = Math.min(100, Math.round((stats.waterCurrent / stats.waterTarget) * 100));

  useEffect(() => {
    // Only fetch if we haven't cached the advice yet, saving API calls on navigation
    if (!hydrationAdvice) {
        onRefreshAdvice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount);
    if (val > 0) {
        onUpdateWater(val);
        setCustomAmount("");
        setShowCustom(false);
    }
  };

  return (
    <div className="h-full flex flex-col pb-24 relative overflow-hidden">
        <div className="px-2 mb-4 z-10 flex justify-between items-start">
            <div>
                <h2 className="text-blue-500 dark:text-blue-400 text-sm font-medium uppercase tracking-wide">HydraAI</h2>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hydration</h1>
            </div>
            <button 
                onClick={() => onNavigate(ViewState.HYDRATION_HISTORY)}
                className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-600 dark:text-zinc-400 hover:text-blue-500 transition-colors"
            >
                <Icons.Calendar className="w-5 h-5" />
            </button>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            <div className="relative w-48 h-80">
                 {/* Bottle Silhouette SVG */}
                 <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl">
                    <defs>
                        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#4C9FFF" />
                            <stop offset="100%" stopColor="#3BA5FF" />
                        </linearGradient>
                        <mask id="waterMask">
                           <path d="M20,0 L80,0 C85.5,0 90,4.5 90,10 L90,25 C90,28 92,30 95,33 L95,180 C95,191 86,200 75,200 L25,200 C14,200 5,191 5,180 L5,33 C8,30 10,28 10,25 L10,10 C10,4.5 14.5,0 20,0 Z" fill="white" />
                        </mask>
                    </defs>
                    
                    {/* Bottle Background */}
                    <path d="M20,0 L80,0 C85.5,0 90,4.5 90,10 L90,25 C90,28 92,30 95,33 L95,180 C95,191 86,200 75,200 L25,200 C14,200 5,191 5,180 L5,33 C8,30 10,28 10,25 L10,10 C10,4.5 14.5,0 20,0 Z" fill="rgba(200,200,200,0.1)" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-zinc-700" />
                    
                    {/* Liquid Level */}
                    <rect 
                        x="0" 
                        y={200 - (percentage * 2)} 
                        width="100" 
                        height={percentage * 2} 
                        fill="url(#waterGradient)" 
                        mask="url(#waterMask)"
                        className="transition-all duration-1000 ease-in-out"
                    />
                 </svg>

                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="block text-4xl font-bold text-slate-900 dark:text-white drop-shadow-md">{percentage}%</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">{stats.waterCurrent} / {stats.waterTarget}ml</span>
                 </div>
            </div>
            
            <p className="mt-8 text-center text-sm text-slate-500 max-w-xs px-4">
                {hydrationAdvice || "Analyzing weather & activity..."}
            </p>
        </div>

        {/* Controls */}
        <div className="z-10 grid grid-cols-4 gap-2 px-2 mt-auto">
            <Card onClick={() => onUpdateWater(100)} className="p-3 flex flex-col items-center justify-center active:bg-blue-50 dark:active:bg-blue-900/20">
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400">100ml</span>
            </Card>
             <Card onClick={() => onUpdateWater(150)} className="p-3 flex flex-col items-center justify-center active:bg-blue-50 dark:active:bg-blue-900/20">
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400">150ml</span>
            </Card>
             <Card onClick={() => onUpdateWater(250)} className="p-3 flex flex-col items-center justify-center active:bg-blue-50 dark:active:bg-blue-900/20">
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400">250ml</span>
            </Card>
             <Card onClick={() => setShowCustom(true)} className="p-3 flex flex-col items-center justify-center bg-blue-500 !border-blue-500">
                <span className="font-bold text-xs text-white">Custom</span>
            </Card>
        </div>

        {/* Custom Modal */}
        {showCustom && (
            <div className="absolute inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur flex items-center justify-center p-6 animate-fade-in">
                <div className="w-full max-w-xs">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold dark:text-white">Add Water</h3>
                        <button onClick={() => setShowCustom(false)} className="p-2"><Icons.Close className="w-6 h-6 dark:text-white" /></button>
                    </div>
                    <form onSubmit={handleCustomSubmit}>
                        <div className="flex items-center border-b-2 border-brand-green mb-8">
                            <input 
                                type="number" 
                                autoFocus
                                className="w-full text-4xl font-bold bg-transparent outline-none py-2 text-center dark:text-white" 
                                placeholder="0"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                            />
                            <span className="text-xl font-medium text-slate-400">ml</span>
                        </div>
                        <button type="submit" className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold shadow-lg">Confirm</button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
