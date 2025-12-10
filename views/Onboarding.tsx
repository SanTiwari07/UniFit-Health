
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { NumberRoller } from '../components/NumberRoller';
import { UserProfile, AIProfileAnalysis } from '../types';
import { analyzeUserProfile } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (profile: UserProfile, aiAnalysis: AIProfileAnalysis) => void;
}

// Visual Options Data
const GOAL_OPTIONS = [
  { value: 'Lose Weight', label: 'Lose Weight', icon: Icons.TrendingDown, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { value: 'Maintain', label: 'Maintain Weight', icon: Icons.Scale, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'Gain Muscle', label: 'Gain Muscle', icon: Icons.Gym, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { value: 'Gain Weight', label: 'Gain Weight', icon: Icons.TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
];

const DIET_OPTIONS = [
  { value: 'Non-Veg', label: 'Meat & Everything', icon: Icons.Beef, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  { value: 'Vegetarian', label: 'Vegetarian', icon: Icons.Leaf, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  { value: 'Vegan', label: 'Vegan', icon: Icons.Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'Eggetarian', label: 'Eggetarian', icon: Icons.Egg, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
];

const ACTIVITY_OPTIONS = [
  { value: 'Mostly sitting', label: 'Sedentary', desc: 'Mostly sitting', icon: Icons.Armchair, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-zinc-800' },
  { value: 'Mixed movement', label: 'Lightly Active', desc: 'Some walking', icon: Icons.Footprints, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'Walk a lot', label: 'Active', desc: 'Daily movement', icon: Icons.Bike, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  { value: 'Very active', label: 'Athlete', desc: 'Hard exercise', icon: Icons.Trophy, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    weight: '70', height: '170', goal: 'Lose Weight', targetWeight: '65',
    dietType: 'Non-Veg', restrictions: [], activityLevel: 'Mixed movement',
    workoutFreq: '3', workoutTime: 'Evening', recurringPain: [],
    proteinSupplements: false, eatingOutFreq: '1-2 times/week',
    sleepHours: '7', stressLevel: 'Medium'
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => Math.max(0, prev - 1));

  const update = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value.toString() }));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const analysis = await analyzeUserProfile(profile);
      onComplete(profile, analysis);
    } catch (e) {
      console.error(e);
      alert("Error generating plan. Please try again.");
      setLoading(false);
    }
  };

  // Reusable Components for the wizard
  const Header = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="text-center mb-8 animate-slide-up">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
      {subtitle && <p className="text-slate-500 dark:text-zinc-400">{subtitle}</p>}
    </div>
  );

  const SelectionGrid = ({ options, selected, onSelect }: any) => (
    <div className="grid grid-cols-1 gap-3 w-full animate-slide-up">
      {options.map((opt: any) => {
        const Icon = opt.icon;
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 text-left active:scale-95 group ${
              isSelected 
                ? 'border-brand-green bg-green-50 dark:bg-green-900/20' 
                : 'border-transparent bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${opt.bg} ${opt.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                {opt.label}
              </h3>
              {opt.desc && <p className="text-xs text-slate-500">{opt.desc}</p>}
            </div>
            {isSelected && <Icons.CheckCircle2 className="w-6 h-6 text-brand-green" />}
          </button>
        );
      })}
    </div>
  );

  // Render Logic based on Step
  const renderStep = () => {
    switch(step) {
      case 0: // Intro
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in max-w-sm mx-auto">
             <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center mb-4">
                <Icons.Sparkles className="w-12 h-12 text-brand-green" />
             </div>
             <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Let's get to know you</h1>
                <p className="text-slate-500">We need a few details to build your personalized student wellness plan.</p>
             </div>
             <button onClick={nextStep} className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold shadow-lg shadow-green-500/20">
                Start Profile
             </button>
          </div>
        );

      case 1: // Weight
        return (
          <div className="flex flex-col h-full justify-between pt-6 max-w-md mx-auto w-full">
            <Header title="What's your weight?" subtitle="This helps calculate your calorie needs." />
            <div className="flex-1 flex items-center justify-center animate-scale-in w-full">
               <NumberRoller 
                  min={30} 
                  max={150} 
                  value={parseInt(profile.weight) || 70} 
                  onChange={(v) => update('weight', v)}
                  unit="kg"
               />
            </div>
            <button 
              onClick={nextStep} 
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold"
            >
              Next
            </button>
          </div>
        );

      case 2: // Height
        return (
          <div className="flex flex-col h-full justify-between pt-6 max-w-md mx-auto w-full">
            <Header title="How tall are you?" subtitle="We use this for BMI and metabolic rate." />
            <div className="flex-1 flex items-center justify-center animate-scale-in w-full">
               <NumberRoller 
                  min={120} 
                  max={230} 
                  value={parseInt(profile.height) || 170} 
                  onChange={(v) => update('height', v)}
                  unit="cm"
               />
            </div>
            <button 
              onClick={nextStep} 
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold"
            >
              Next
            </button>
          </div>
        );

      case 3: // Goal
        return (
          <div className="flex flex-col h-full pt-6 max-w-md mx-auto w-full">
            <Header title="What's your main goal?" />
            <div className="flex-1">
              <SelectionGrid 
                options={GOAL_OPTIONS} 
                selected={profile.goal} 
                onSelect={(val: any) => { update('goal', val); nextStep(); }}
              />
            </div>
          </div>
        );

      case 4: // Target Weight (Conditional)
        if (profile.goal === 'Maintain') { setStep(5); return null; }
        return (
          <div className="flex flex-col h-full justify-between pt-6 max-w-md mx-auto w-full">
            <Header title="Target Weight?" subtitle="Let's set a realistic target." />
            <div className="flex-1 flex items-center justify-center animate-scale-in w-full">
                <NumberRoller 
                  min={30} 
                  max={150} 
                  value={parseInt(profile.targetWeight) || parseInt(profile.weight)} 
                  onChange={(v) => update('targetWeight', v)}
                  unit="kg"
               />
            </div>
            <button 
              onClick={nextStep} 
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold"
            >
              Next
            </button>
          </div>
        );

      case 5: // Diet
        return (
          <div className="flex flex-col h-full pt-6 max-w-md mx-auto w-full">
            <Header title="Your Diet Type?" />
            <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
              <SelectionGrid 
                options={DIET_OPTIONS} 
                selected={profile.dietType} 
                onSelect={(val: any) => { update('dietType', val); nextStep(); }}
              />
            </div>
          </div>
        );

      case 6: // Activity
        return (
          <div className="flex flex-col h-full pt-6 max-w-md mx-auto w-full">
            <Header title="Daily Activity?" subtitle="Excluding your gym workouts." />
            <div className="flex-1">
              <SelectionGrid 
                options={ACTIVITY_OPTIONS} 
                selected={profile.activityLevel} 
                onSelect={(val: any) => { update('activityLevel', val); nextStep(); }}
              />
            </div>
          </div>
        );

      case 7: // Final Review (Simple for now to trigger finish)
        return (
          <div className="flex flex-col h-full justify-center text-center space-y-6 pt-10 max-w-md mx-auto w-full">
            <div className="w-24 h-24 mx-auto bg-brand-green rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/30 animate-pulse">
               <Icons.CheckCircle2 className="w-12 h-12" />
            </div>
            <Header title="All Set!" subtitle="Gemini 3 Pro is ready to build your plan." />
            
            <div className="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl text-left space-y-2 text-sm text-slate-600 dark:text-zinc-400">
               <p>• <strong>Goal:</strong> {profile.goal}</p>
               <p>• <strong>Diet:</strong> {profile.dietType}</p>
               <p>• <strong>Activity:</strong> {profile.activityLevel}</p>
            </div>

            <button 
              onClick={handleFinish} 
              className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
            >
              Create My Plan
            </button>
          </div>
        );
      
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Profile...</h2>
        <p className="text-slate-500">Gemini 3 Pro is calculating your optimal macros and hydration.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white flex flex-col p-6">
      {/* Progress Bar */}
      {step > 0 && (
        <div className="w-full h-1 bg-slate-100 dark:bg-zinc-800 rounded-full mb-6 overflow-hidden max-w-md mx-auto">
           <div 
             className="h-full bg-brand-green transition-all duration-500 ease-out"
             style={{ width: `${(step / 7) * 100}%` }}
           ></div>
        </div>
      )}

      {/* Nav Back */}
      {step > 1 && (
        <button onClick={prevStep} className="absolute top-6 left-4 lg:left-[calc(50%-14rem)] p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white z-10">
           <Icons.ArrowLeft className="w-6 h-6" />
        </button>
      )}

      <div className="flex-1 relative flex flex-col">
         {renderStep()}
      </div>
    </div>
  );
};
