
import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from './components/Icons';
import { Dashboard } from './views/Dashboard';
import { MealScan } from './views/MealScan';
import { HydraAI } from './views/HydraAI';
import { HydrationHistory } from './views/HydrationHistory';
import { PainScan } from './views/PainScan';
import { GymTrack } from './views/GymTrack';
import { Onboarding } from './views/Onboarding';
import { PlanReveal } from './views/PlanReveal';
import { CalorieHistory } from './views/CalorieHistory';
import { WorkoutHistory } from './views/WorkoutHistory';
import { StepsHistory } from './views/StepsHistory';
import { Welcome } from './views/Welcome'; 
import { ProfileSettings } from './views/ProfileSettings';
import { ViewState, UserStats, UserProfile, MealLogEntry, WorkoutLogEntry, AIProfileAnalysis, DailySummary } from './types';
import { calculateHydrationGoal, generateDailySummary } from './services/geminiService';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.WELCOME); 
  
  // Simulated State
  const [stats, setStats] = useState<UserStats>({
    steps: 8432,
    stepsTarget: 10000,
    waterCurrent: 1250,
    waterTarget: 2500, 
    caloriesIn: 1450,
    caloriesTarget: 2400, 
    gymMinutes: 45,
    mood: 'Happy'
  });

  const [profile, setProfile] = useState<UserProfile>({
    weight: '70', height: '170', goal: 'Lose Weight', targetWeight: '65',
    dietType: 'Non-Veg', restrictions: [], activityLevel: 'Mixed movement',
    workoutFreq: '3', workoutTime: 'Evening', recurringPain: [],
    proteinSupplements: false, eatingOutFreq: '1-2 times/week',
    sleepHours: '7', stressLevel: 'Medium'
  });

  // Cached API Data (Optimization)
  const [dashboardSummary, setDashboardSummary] = useState<DailySummary | null>(null);
  const [hydrationAdvice, setHydrationAdvice] = useState<string | null>(null);

  // Store the full AI analysis for the reveal screen
  const [aiPlan, setAiPlan] = useState<AIProfileAnalysis | null>(null);

  // Track logged meals
  const [meals, setMeals] = useState<MealLogEntry[]>([
     {
        id: '1',
        food_name: 'Grilled Chicken Salad',
        calories: 450,
        protein: 40,
        carbs: 12,
        fat: 15,
        health_rating: 9,
        fat_loss_suitability: true,
        portion_change_recommendation: '',
        alternative: '',
        advice: 'Great choice for protein!',
        timestamp: new Date(new Date().setHours(12, 30)),
        is_uncertain: false
     },
     {
        id: '2',
        food_name: 'Oatmeal with Berries',
        calories: 350,
        protein: 10,
        carbs: 55,
        fat: 6,
        health_rating: 10,
        fat_loss_suitability: true,
        portion_change_recommendation: '',
        alternative: '',
        advice: 'Perfect energy for morning lectures.',
        timestamp: new Date(new Date().setHours(8, 0)),
        is_uncertain: false
     }
  ]);

  // Track Workouts
  const [workouts, setWorkouts] = useState<WorkoutLogEntry[]>([
    { id: '1', type: 'Strength', duration: 2700, timestamp: new Date(new Date().setDate(new Date().getDate() - 1)), effort: 'Hard', notes: 'Leg day', aiInsight: 'Solid volume! Remember to stretch those quads.' },
    { id: '2', type: 'Cardio', duration: 1800, timestamp: new Date(new Date().setDate(new Date().getDate() - 3)), effort: 'Moderate', notes: 'Morning run', aiInsight: 'Consistent cardio boosts that recovery.', distance: 5.2, pace: '5:45 min/km' }
  ]);

  // Adjust caloriesIn based on mock meals initially
  useEffect(() => {
     const total = meals.reduce((acc, meal) => acc + meal.calories, 0);
     if (currentView === ViewState.WELCOME) {
         setStats(prev => ({...prev, caloriesIn: total}));
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- API State Management Callbacks (Optimization) ---

  const fetchDashboardSummary = useCallback(async () => {
    // Only fetch if data is stale or null (we assume daily summary is valid for the session)
    try {
        const data = await generateDailySummary(stats);
        setDashboardSummary(data);
    } catch (e) {
        console.error("Failed to fetch summary");
    }
  }, [stats]);

  const fetchHydrationAdvice = useCallback(async () => {
    if (hydrationAdvice) return;
    try {
        const result = await calculateHydrationGoal(stats, "Sunny 25°C");
        setStats(prev => ({...prev, waterTarget: result.target }));
        setHydrationAdvice(result.advice);
    } catch (e) {
        console.error("Failed to fetch hydration");
    }
  }, [stats, hydrationAdvice]);


  // --- Event Handlers ---

  const handleStart = () => {
     setCurrentView(ViewState.ONBOARDING);
  };

  const handleOnboardingComplete = (newProfile: UserProfile, aiAnalysis: AIProfileAnalysis) => {
    setProfile(newProfile);
    setAiPlan(aiAnalysis);
    
    // Update basic stats with new targets
    setStats(prev => ({
        ...prev,
        caloriesTarget: aiAnalysis.daily_calories,
        waterTarget: aiAnalysis.daily_water_ml,
        stepsTarget: aiAnalysis.daily_steps || 8000
    }));

    // Reset cached AI data as profile changed
    setDashboardSummary(null);
    setHydrationAdvice(null);

    setOnboardingComplete(true);
    setCurrentView(ViewState.PLAN_REVEAL);
  };

  const handlePlanAccepted = () => {
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    // Reset caches
    setDashboardSummary(null);
    setHydrationAdvice(null);
    alert("Profile updated successfully!");
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogMeal = (mealData: any) => {
     const newMeal: MealLogEntry = {
        ...mealData,
        id: Date.now().toString(),
        timestamp: new Date()
     };
     setMeals(prev => [newMeal, ...prev]);
     setStats(prev => ({...prev, caloriesIn: prev.caloriesIn + mealData.calories}));
  };

  const handleSaveWorkout = (workoutData: Omit<WorkoutLogEntry, 'id' | 'timestamp'>) => {
      const newWorkout: WorkoutLogEntry = {
          ...workoutData,
          id: Date.now().toString(),
          timestamp: new Date()
      };
      setWorkouts(prev => [newWorkout, ...prev]);
      setStats(prev => ({
          ...prev, 
          gymMinutes: prev.gymMinutes + Math.floor(workoutData.duration / 60)
      }));
      setCurrentView(ViewState.WORKOUT_HISTORY);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${
        currentView === view 
          ? 'text-slate-900 dark:text-white' 
          : 'text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400'
      }`}
    >
      <Icon className={`w-6 h-6 mb-1 ${currentView === view ? 'stroke-[2.5px]' : 'stroke-2'}`} />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );

  if (currentView === ViewState.WELCOME) {
      return <Welcome onStart={handleStart} />;
  }

  if (!onboardingComplete && currentView === ViewState.ONBOARDING) {
      return (
          <div className="font-sans">
              <Onboarding onComplete={handleOnboardingComplete} />
          </div>
      );
  }

  if (currentView === ViewState.PLAN_REVEAL && aiPlan) {
      return (
          <PlanReveal analysis={aiPlan} onContinue={handlePlanAccepted} />
      );
  }

  // Views that hide the top/bottom bars for a "full screen" feel
  const isDetailView = currentView === ViewState.CALORIE_HISTORY || currentView === ViewState.WORKOUT_HISTORY || currentView === ViewState.PROFILE || currentView === ViewState.HYDRATION_HISTORY || currentView === ViewState.STEPS_HISTORY;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 font-sans selection:bg-brand-green/30">
      
      {/* Top Bar */}
      {!isDetailView && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 h-14 flex items-center justify-center transition-all duration-300">
            <div className="max-w-7xl w-full px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-brand-green flex items-center justify-center text-white">
                        <Icons.Health className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">UniFit Health</span>
                </div>
                <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 transition-colors"
                >
                {darkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
                </button>
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${isDetailView ? 'pt-6' : 'pt-20'} px-4 min-h-screen w-full max-w-7xl mx-auto pb-24`}>
        {currentView === ViewState.DASHBOARD && (
          <Dashboard 
            stats={stats} 
            summary={dashboardSummary} 
            onNavigate={setCurrentView} 
            onRefreshSummary={fetchDashboardSummary} 
          />
        )}
        {currentView === ViewState.PROFILE && (
          <ProfileSettings 
            onBack={() => setCurrentView(ViewState.DASHBOARD)} 
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
        {currentView === ViewState.CALORIE_HISTORY && (
          <CalorieHistory 
             onBack={() => setCurrentView(ViewState.DASHBOARD)} 
             dailyCalories={stats.caloriesIn}
             target={stats.caloriesTarget}
             meals={meals}
          />
        )}
        {currentView === ViewState.WORKOUT_HISTORY && (
          <WorkoutHistory 
            onBack={() => setCurrentView(ViewState.DASHBOARD)} 
            workouts={workouts}
          />
        )}
        {currentView === ViewState.STEPS_HISTORY && (
          <StepsHistory 
             onBack={() => setCurrentView(ViewState.DASHBOARD)}
             dailySteps={stats.steps}
             target={stats.stepsTarget}
          />
        )}
        {currentView === ViewState.MEAL_SCAN && (
          <MealScan onLogMeal={handleLogMeal} userProfile={profile} />
        )}
        {currentView === ViewState.HYDRA_AI && (
          <HydraAI 
            stats={stats} 
            hydrationAdvice={hydrationAdvice}
            onUpdateWater={(amount) => setStats(prev => ({...prev, waterCurrent: prev.waterCurrent + amount}))}
            onSetTarget={(target) => setStats(prev => ({...prev, waterTarget: target}))}
            onNavigate={setCurrentView}
            onRefreshAdvice={fetchHydrationAdvice}
          />
        )}
        {currentView === ViewState.HYDRATION_HISTORY && (
          <HydrationHistory 
             onBack={() => setCurrentView(ViewState.HYDRA_AI)} 
             dailyWater={stats.waterCurrent}
             target={stats.waterTarget}
          />
        )}
        {currentView === ViewState.PAIN_SCAN && <PainScan />}
        {currentView === ViewState.GYM_TRACK && (
            <GymTrack onSaveWorkout={handleSaveWorkout} userProfile={profile} />
        )}
      </main>

      {/* Bottom Navigation */}
      {!isDetailView && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-lg border-t border-slate-100 dark:border-white/5 pb-safe pt-2 px-2 z-50">
            <div className="flex justify-around items-end max-w-2xl mx-auto">
            <NavItem view={ViewState.DASHBOARD} icon={Icons.Dashboard} label="Summary" />
            <NavItem view={ViewState.MEAL_SCAN} icon={Icons.Scan} label="Scan" />
            
            {/* Center Action Button */}
            <div className="relative -top-6">
                <button 
                onClick={() => setCurrentView(ViewState.GYM_TRACK)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    currentView === ViewState.GYM_TRACK 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black' 
                    : 'bg-brand-green text-white shadow-green-500/40'
                }`}
                >
                <Icons.Gym className="w-6 h-6" />
                </button>
            </div>

            <NavItem view={ViewState.HYDRA_AI} icon={Icons.Water} label="HydraAI" />
            <NavItem view={ViewState.PAIN_SCAN} icon={Icons.Pain} label="PainScan" />
            </div>
            {/* Safe area spacer for mobile */}
            <div className="h-4"></div> 
        </nav>
      )}
    </div>
  );
}

export default App;
