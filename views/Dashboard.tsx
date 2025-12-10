
import React, { useEffect } from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { UserStats, DailySummary, ViewState } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  stats: UserStats;
  summary: DailySummary | null;
  onNavigate: (view: ViewState) => void;
  onRefreshSummary: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, summary, onNavigate, onRefreshSummary }) => {
  
  // Optimization: Only request summary if we don't have one cached in App state
  useEffect(() => {
    if (!summary) {
        onRefreshSummary();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoize chart data to prevent recalc on every render
  const progressData = React.useMemo(() => [
    { name: 'Completed', value: stats.caloriesIn, color: '#34C759' },
    { name: 'Remaining', value: Math.max(0, stats.caloriesTarget - stats.caloriesIn), color: '#E5E7EB' },
  ], [stats.caloriesIn, stats.caloriesTarget]);

  return (
    <div className="space-y-6 pb-24 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide">Today</h2>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Summary</h1>
        </div>
        <div className="flex items-center gap-3">
           {stats.mood === 'Happy' && <Icons.MoodGood className="w-6 h-6 text-brand-green" />}
           {stats.mood === 'Neutral' && <Icons.MoodNeutral className="w-6 h-6 text-yellow-500" />}
           {stats.mood === 'Tired' && <Icons.MoodBad className="w-6 h-6 text-slate-400" />}
           <div 
             className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden border border-slate-200 dark:border-zinc-700 cursor-pointer hover:ring-2 hover:ring-brand-green transition-all"
             onClick={() => onNavigate(ViewState.PROFILE)}
           >
             <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
           </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <Card className="p-5" glass>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500">
             <Icons.Health className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 text-slate-900 dark:text-white">UniFit AI Insights</h3>
            {!summary ? (
              <div className="animate-pulse space-y-2 py-1">
                  <div className="h-2 bg-slate-200 dark:bg-zinc-700 rounded"></div>
                  <div className="h-2 bg-slate-200 dark:bg-zinc-700 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{summary.score}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                    On Track
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {summary.summary}
                </p>
                {summary.focus_area && (
                  <div className="mt-3 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    Focus: {summary.focus_area}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calories Ring */}
        <Card 
            className="p-4 relative active:scale-[0.98] overflow-hidden min-h-[12rem] flex flex-col justify-between"
            onClick={() => onNavigate(ViewState.CALORIE_HISTORY)}
        >
          {/* Top Label */}
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-slate-500 dark:text-zinc-500 font-medium text-xs uppercase">Calories</span>
            <Icons.Fire className="w-4 h-4 text-brand-green" />
          </div>

          {/* Chart Container - Centered */}
          <div className="flex-1 flex items-center justify-center relative">
             <div className="w-28 h-28 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={progressData}
                     innerRadius={35}
                     outerRadius={45}
                     startAngle={90}
                     endAngle={-270}
                     dataKey="value"
                     stroke="none"
                   >
                     {progressData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={index === 0 ? '#34C759' : 'currentColor'} className={index === 1 ? 'text-slate-100 dark:text-zinc-800' : ''} />
                     ))}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               
               {/* Centered Text inside Donut */}
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.caloriesIn}</span>
               </div>
             </div>
          </div>
          
          <div className="text-center mt-1">
             <span className="text-[10px] text-slate-400 uppercase tracking-wide">Goal: {stats.caloriesTarget}</span>
          </div>
        </Card>

         {/* Steps */}
         <Card 
           className="p-4 flex flex-col justify-between min-h-[12rem] active:scale-[0.98] cursor-pointer"
           onClick={() => onNavigate(ViewState.STEPS_HISTORY)}
         >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-zinc-500 font-medium text-xs uppercase">Steps</span>
            <Icons.Steps className="w-5 h-5 text-orange-500" />
          </div>
          <div className="my-2">
             <span className="text-3xl font-bold block text-slate-900 dark:text-white">{stats.steps.toLocaleString()}</span>
             <span className="text-xs text-slate-400">Target: {stats.stepsTarget.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full mt-auto overflow-hidden">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(100, (stats.steps / stats.stepsTarget) * 100)}%` }}
            ></div>
          </div>
        </Card>

        {/* Water */}
        <Card 
           className="p-4 flex flex-col justify-between min-h-[10rem] md:min-h-[12rem] active:scale-[0.98] cursor-pointer"
           onClick={() => onNavigate(ViewState.HYDRA_AI)}
        >
          <div className="flex justify-between items-start">
             <span className="text-blue-500 font-medium text-xs uppercase">Hydration</span>
             <Icons.Water className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.waterCurrent}</span>
            <span className="text-sm text-slate-500 ml-1">ml</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
             Target: {stats.waterTarget}ml
          </p>
        </Card>

         {/* Gym / Workout Link */}
         <Card 
            className="p-4 flex flex-col justify-between min-h-[10rem] md:min-h-[12rem] active:scale-[0.98] cursor-pointer"
            onClick={() => onNavigate(ViewState.WORKOUT_HISTORY)}
         >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 dark:text-zinc-500 font-medium text-xs uppercase">Activity</span>
            <Icons.Gym className="w-5 h-5 text-purple-500" />
          </div>
          <div>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{stats.gymMinutes}</span>
              <span className="text-sm font-normal text-slate-400 ml-1">min</span>
          </div>
          <div className="flex items-center gap-1.5 mt-auto">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">View History</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
