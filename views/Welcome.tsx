import React, { useEffect, useState } from 'react';
import { Icons } from '../components/Icons';

interface WelcomeProps {
  onStart: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setShowText(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-green/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="p-8 pt-20 flex-1 flex flex-col relative z-10">
        
        {/* Logo Animation */}
        <div className={`transition-all duration-1000 transform ${showText ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="w-16 h-16 rounded-2xl bg-brand-green flex items-center justify-center text-white mb-6 shadow-xl shadow-green-500/30">
            <Icons.Health className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            UniFit <span className="text-brand-green">Health</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-zinc-400 font-medium">Student Wellness OS</p>
        </div>

        {/* Staggered Text Blocks */}
        <div className="mt-12 space-y-6">
          <div className={`transition-all duration-1000 delay-300 transform ${showText ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-xl font-semibold leading-relaxed">
              Welcome to UniFit Health — your all-in-one health and wellness tracker designed specifically for college students.
            </p>
          </div>

          <div className={`transition-all duration-1000 delay-500 transform ${showText ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              UniFit Health brings every essential part of student fitness into one smart, simple, and powerful app. Whether you’re trying to lose weight, stay fit, build healthy habits, or recover from long study hours and gym sessions, we keep you on the right track.
            </p>
          </div>

          <div className={`transition-all duration-1000 delay-700 transform ${showText ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              With advanced AI powered by Gemini 3 Pro, UniFit Health analyzes your food, posture, water intake, steps, and daily activity to give you personalized suggestions that actually make sense for your lifestyle.
            </p>
          </div>
          
           <div className={`transition-all duration-1000 delay-900 transform ${showText ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-sm font-medium text-brand-green">
              Stay consistent. Stay healthy. Stay strong.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className={`p-6 pb-10 bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black z-20 transition-all duration-1000 delay-1000 transform ${showText ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <button 
          onClick={onStart}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          <span>Get Started</span>
          <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-center text-xs text-slate-400 mt-4">Powered by Google Gemini 3 Pro</p>
      </div>
    </div>
  );
};