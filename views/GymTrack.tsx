
import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { WorkoutLogEntry, WorkoutPlan, UserProfile } from '../types';
import { generateWorkoutInsight, generateWorkoutPlan } from '../services/geminiService';

interface GymTrackProps {
    onSaveWorkout: (workout: Omit<WorkoutLogEntry, 'id' | 'timestamp'>) => void;
    userProfile: UserProfile;
}

type GymState = 'SELECT_ACTIVITY' | 'PREPARE' | 'ACTIVE' | 'SUMMARY';
type ActivityType = 'Running' | 'Cycling' | 'Gym' | 'Yoga' | 'Walking' | 'Swimming' | 'HIIT' | 'Sports' | 'Pilates';

export const GymTrack: React.FC<GymTrackProps> = ({ onSaveWorkout, userProfile }) => {
  const [state, setState] = useState<GymState>('SELECT_ACTIVITY');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('Running');
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  
  // AI Plan
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Cardio Metrics
  const [distance, setDistance] = useState(0); // km
  const [pace, setPace] = useState(0); // min/km

  // Summary Data
  const [effort, setEffort] = useState<'Easy' | 'Moderate' | 'Hard' | 'Extreme'>('Moderate');
  const [notes, setNotes] = useState('');
  const [injury, setInjury] = useState(false);

  // --- Timer Logic ---
  useEffect(() => {
    let interval: any;
    if (state === 'ACTIVE' && !isPaused) {
      interval = setInterval(() => {
        setTime((t) => {
            const newTime = t + 1;
            // Simulate Cardio Metrics update
            if (['Running', 'Cycling', 'Walking', 'Swimming', 'Sports'].includes(selectedActivity)) {
                // Assume avg speed for demo: Running 10km/h, Cycling 20km/h, Walking 5km/h, Swimming 3km/h, Sports 6km/h
                let speedKmh = 10;
                if (selectedActivity === 'Cycling') speedKmh = 20;
                if (selectedActivity === 'Walking') speedKmh = 5;
                if (selectedActivity === 'Swimming') speedKmh = 3;
                if (selectedActivity === 'Sports') speedKmh = 6;
                
                const hours = newTime / 3600;
                const newDist = speedKmh * hours;
                setDistance(parseFloat(newDist.toFixed(2)));
                
                // Pace = min / km
                if (newDist > 0) {
                    const totalMin = newTime / 60;
                    setPace(parseFloat((totalMin / newDist).toFixed(2)));
                }
            }
            return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, isPaused, selectedActivity]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
        const plan = await generateWorkoutPlan(userProfile, selectedActivity);
        setWorkoutPlan(plan);
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingPlan(false);
    }
  };

  const handleStart = () => {
      setState('ACTIVE');
      setTime(0);
      setDistance(0);
      setIsPaused(false);
  };

  const handleSave = async () => {
      // Generate Insight
      const insight = await generateWorkoutInsight({
          type: selectedActivity,
          duration: time,
          effort,
          notes: injury ? `Injury Reported. ${notes}` : notes,
          distance: distance > 0 ? distance : undefined
      });

      onSaveWorkout({
          type: selectedActivity,
          duration: time,
          effort,
          notes,
          aiInsight: insight,
          distance: distance > 0 ? distance : undefined,
          pace: distance > 0 ? `${pace} min/km` : undefined
      });

      // Reset
      setState('SELECT_ACTIVITY');
      setTime(0);
      setNotes('');
      setInjury(false);
      setWorkoutPlan(null);
  };

  // --- VIEW 1: SELECT ACTIVITY ---
  if (state === 'SELECT_ACTIVITY') {
      const activities: { type: ActivityType, icon: any, color: string }[] = [
          { type: 'Running', icon: Icons.Footprints, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20' },
          { type: 'Cycling', icon: Icons.Bike, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' },
          { type: 'Gym', icon: Icons.Gym, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20' },
          { type: 'Walking', icon: Icons.Footprints, color: 'bg-green-100 text-green-600 dark:bg-green-900/20' },
          { type: 'Yoga', icon: Icons.Leaf, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/20' },
          { type: 'Swimming', icon: Icons.Swim, color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/20' },
          { type: 'HIIT', icon: Icons.Timer, color: 'bg-red-100 text-red-600 dark:bg-red-900/20' },
          { type: 'Sports', icon: Icons.Trophy, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20' },
          { type: 'Pilates', icon: Icons.Steps, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/20' },
      ];

      return (
        <div className="h-full flex flex-col pb-24 animate-slide-up">
            <div className="px-2 mb-6">
                <h2 className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide">Let's Move</h2>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Choose Activity</h1>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-1">
                {activities.map((act) => (
                    <Card 
                        key={act.type} 
                        onClick={() => { setSelectedActivity(act.type); setState('PREPARE'); }}
                        className="p-6 flex flex-col items-center justify-center gap-4 aspect-square active:scale-95 cursor-pointer hover:border-slate-300 dark:hover:border-zinc-600"
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${act.color}`}>
                            <act.icon className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg text-slate-900 dark:text-white">{act.type}</span>
                    </Card>
                ))}
            </div>
        </div>
      );
  }

  // --- VIEW 2: PREPARE / AI PLAN ---
  if (state === 'PREPARE') {
      return (
        <div className="h-full flex flex-col pb-24 animate-slide-up">
            <div className="px-2 mb-6 flex items-center gap-2">
                <button onClick={() => setState('SELECT_ACTIVITY')}><Icons.ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" /></button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedActivity}</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-1 space-y-6">
                {/* AI Plan Section */}
                {!workoutPlan ? (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <Icons.Sparkles className="w-6 h-6 text-yellow-300" />
                            <h3 className="font-bold text-lg">AI Smart Plan</h3>
                        </div>
                        <p className="text-indigo-100 mb-6 text-sm">
                            Gemini 3 Pro creates a {selectedActivity} session tailored to your goal: <span className="font-bold text-white">{userProfile.goal}</span>.
                        </p>
                        <button 
                            onClick={handleGeneratePlan}
                            disabled={loadingPlan}
                            className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            {loadingPlan ? 'Generating...' : "Generate Today's Workout"}
                        </button>
                    </div>
                ) : (
                    <Card className="p-6 space-y-4 border-2 border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{workoutPlan.title}</h3>
                                <p className="text-indigo-500 font-medium text-xs uppercase tracking-wide mt-1">{workoutPlan.focus} • {workoutPlan.duration_min} min</p>
                             </div>
                             <button onClick={() => setWorkoutPlan(null)} className="text-slate-400"><Icons.Close className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-3 mt-4">
                             {workoutPlan.exercises.map((ex, i) => (
                                 <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                                     <span className="font-medium text-sm text-slate-900 dark:text-white">{ex.name}</span>
                                     <span className="text-xs font-bold text-slate-500 bg-white dark:bg-black px-2 py-1 rounded border border-slate-100 dark:border-zinc-700">{ex.sets} x {ex.reps}</span>
                                 </div>
                             ))}
                        </div>
                    </Card>
                )}

                <div className="mt-8">
                    <button 
                        onClick={handleStart}
                        className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xl shadow-xl active:scale-95 transition-transform"
                    >
                        Start Session
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // --- VIEW 3: ACTIVE TRACKING ---
  if (state === 'ACTIVE') {
      const isCardio = ['Running', 'Cycling', 'Walking', 'Swimming', 'Sports'].includes(selectedActivity);
      
      return (
        <div className="h-full flex flex-col pb-24 relative animate-fade-in">
             {/* Header Metrics */}
             <div className="absolute top-0 left-0 right-0 p-4 flex justify-between text-slate-500 dark:text-zinc-500 font-medium text-xs uppercase tracking-wider">
                 <span>{selectedActivity}</span>
                 <span>Goal: {workoutPlan?.focus || userProfile.goal}</span>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center">
                 {/* Main Timer */}
                 <div className="text-center mb-10">
                     <span className="text-7xl font-mono font-bold tracking-tighter text-slate-900 dark:text-white tabular-nums">
                         {formatTime(time)}
                     </span>
                     <span className="block text-slate-400 font-medium mt-2 uppercase tracking-widest text-sm">Duration</span>
                 </div>

                 {/* Cardio Dashboard */}
                 {isCardio && (
                     <div className="grid grid-cols-2 gap-8 w-full px-8 mb-10">
                         <div className="text-center">
                             <span className="text-3xl font-bold text-slate-900 dark:text-white block">{distance.toFixed(2)}</span>
                             <span className="text-xs text-slate-400 uppercase tracking-wider">km</span>
                         </div>
                         <div className="text-center">
                             <span className="text-3xl font-bold text-slate-900 dark:text-white block">{pace > 0 ? pace.toFixed(2) : '--'}</span>
                             <span className="text-xs text-slate-400 uppercase tracking-wider">min/km</span>
                         </div>
                     </div>
                 )}
                 
                 {/* Controls */}
                 <div className="flex items-center gap-6">
                     {!isPaused ? (
                        <button onClick={() => setIsPaused(true)} className="w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-900 dark:text-white shadow-lg active:scale-95">
                            <div className="w-8 h-8 flex gap-2 justify-center">
                                <div className="w-2 h-full bg-current rounded-full"></div>
                                <div className="w-2 h-full bg-current rounded-full"></div>
                            </div>
                        </button>
                     ) : (
                        <button onClick={() => setIsPaused(false)} className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/40 active:scale-95">
                            <Icons.ArrowRight className="w-8 h-8" />
                        </button>
                     )}

                     <button onClick={() => setShowStopConfirm(true)} className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40 active:scale-95">
                        <div className="w-8 h-8 bg-white rounded-md"></div>
                     </button>
                 </div>
             </div>

             {/* Stop Modal */}
             {showStopConfirm && (
                <div className="absolute inset-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-scale-in">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 text-center">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">End Workout?</h3>
                        <p className="text-slate-500 mb-6">Are you sure you want to stop tracking this session?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowStopConfirm(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">Cancel</button>
                            <button onClick={() => setState('SUMMARY')} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold">End Workout</button>
                        </div>
                    </div>
                </div>
             )}
        </div>
      );
  }

  // --- VIEW 4: SUMMARY ---
  if (state === 'SUMMARY') {
    return (
        <div className="h-full flex flex-col pb-24 animate-slide-up">
            <div className="px-2 mb-6">
                <h2 className="text-purple-500 dark:text-purple-400 text-sm font-medium uppercase tracking-wide">Summary</h2>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Workout Complete!</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-1 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-center">
                        <span className="block text-2xl font-bold text-slate-900 dark:text-white">{formatTime(time)}</span>
                        <span className="text-xs text-slate-400 uppercase">Duration</span>
                    </div>
                    {distance > 0 && (
                        <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl text-center">
                            <span className="block text-2xl font-bold text-slate-900 dark:text-white">{distance.toFixed(2)}</span>
                            <span className="text-xs text-slate-400 uppercase">km</span>
                        </div>
                    )}
                </div>

                <Card className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">How did it feel?</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['Easy', 'Moderate', 'Hard', 'Extreme'].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => setEffort(lvl as any)}
                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                        effort === lvl 
                                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' 
                                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                                    }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                        <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Any Pain or Injury?</span>
                        <button 
                            onClick={() => setInjury(!injury)}
                            className={`w-12 h-7 rounded-full transition-colors relative ${injury ? 'bg-red-500' : 'bg-slate-300 dark:bg-zinc-600'}`}
                        >
                            <div className={`absolute top-1 bottom-1 w-5 bg-white rounded-full shadow transition-transform ${injury ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Notes</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Details about the session..."
                            className="w-full bg-slate-100 dark:bg-zinc-800 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
                            rows={3}
                        />
                    </div>
                </Card>

                <button 
                    onClick={handleSave}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
                >
                    Save Activity
                </button>
            </div>
        </div>
      );
  }

  return null;
};