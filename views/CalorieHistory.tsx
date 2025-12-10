
import React from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
import { MealLogEntry } from '../types';

interface CalorieHistoryProps {
  onBack: () => void;
  dailyCalories: number;
  target: number;
  meals: MealLogEntry[];
}

// Mock Data for previous days
const data = [
  { day: 'Mon', cal: 2100 },
  { day: 'Tue', cal: 1950 },
  { day: 'Wed', cal: 2300 },
  { day: 'Thu', cal: 1800 },
  { day: 'Fri', cal: 2450 },
  { day: 'Sat', cal: 2100 },
  { day: 'Sun', cal: 1450 }, // Placeholder for Today
];

export const CalorieHistory: React.FC<CalorieHistoryProps> = ({ onBack, dailyCalories, target, meals }) => {
  // Update "Today" (Sun) with actual data for visualization
  const chartData = [...data];
  chartData[6] = { ...chartData[6], cal: dailyCalories };
  
  const weeklyAvg = Math.round(chartData.reduce((acc, curr) => acc + curr.cal, 0) / chartData.length);

  return (
    <div className="h-full flex flex-col pb-24">
      <div className="px-2 mb-6 flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
           <Icons.ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <div>
           <h2 className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide">Trends</h2>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calorie History</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-1 no-scrollbar">
         
         {/* AI Recommendation Banner */}
         <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/20 border border-green-200 dark:border-green-900/30 flex items-start gap-3">
             <Icons.Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 shrink-0" />
             <div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-sm">AI Recommendation</h4>
                 <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                     Based on your goal, aim for <span className="font-bold">{target} kcal</span>. A balanced intake of protein and carbs will help sustain your energy levels.
                 </p>
             </div>
         </div>

         <Card className="p-6 text-center">
             <h3 className="text-sm font-medium text-slate-500 uppercase">Today's Intake</h3>
             <div className="flex items-center justify-center gap-2 my-2">
                 <Icons.Fire className="w-8 h-8 text-brand-green" />
                 <span className="text-5xl font-bold text-slate-900 dark:text-white">{dailyCalories}</span>
             </div>
             <div className="flex justify-center items-center gap-2 text-sm text-slate-400">
               <span>Target: {target} kcal</span>
               <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
               <span className={`${dailyCalories > target ? 'text-yellow-500' : 'text-green-500'}`}>
                 {dailyCalories > target ? 'Over' : 'Under'}
               </span>
             </div>
         </Card>

         <Card className="p-6 h-64">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-500">Last 7 Days</h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-3 h-[1px] bg-slate-400/50 border border-dashed border-slate-400"></div>
                <span>Target ({target})</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.1)'}}
                    contentStyle={{borderRadius: '12px', border: 'none', background: '#1F2937', padding: '8px 12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    itemStyle={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}
                    labelStyle={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}
                  />
                  <ReferenceLine y={target} stroke="#6B7280" strokeDasharray="3 3" />
                  <Bar dataKey="cal" radius={[4, 4, 4, 4]}>
                    {chartData.map((entry, index) => {
                      const isOver = entry.cal >= target;
                      const isToday = index === chartData.length - 1;
                      // Color logic: Today = Green, Past Over/Met = Gold, Past Under = Gray
                      let fill = '#E5E7EB'; 
                      if (isToday) fill = '#34C759';
                      else if (isOver) fill = '#EAB308'; // Premium Gold
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </Card>

         <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
                <span className="text-xs text-slate-500 uppercase block mb-1">Weekly Avg</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{weeklyAvg} kcal</span>
            </Card>
            <Card className="p-4">
                <span className="text-xs text-slate-500 uppercase block mb-1">Goal Adherence</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">85%</span>
            </Card>
         </div>

         {/* What I Ate Today Section */}
         <div className="pt-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">What I Ate Today</h3>
            {meals.length === 0 ? (
               <div className="text-center p-8 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                  <p className="text-slate-400 dark:text-zinc-500 text-sm">No meals logged yet today.</p>
                  <p className="text-slate-300 dark:text-zinc-600 text-xs mt-1">Use MealScan to add food.</p>
               </div>
            ) : (
               <div className="space-y-3">
                 {meals.map((meal) => (
                   <Card key={meal.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{meal.food_name}</h4>
                            <p className="text-xs text-slate-500">{meal.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                         <span className="font-bold text-brand-green">{meal.calories} kcal</span>
                      </div>
                      
                      <div className="flex gap-4 mt-2">
                         <div className="text-xs">
                            <span className="text-slate-400 block">Prot</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{meal.protein}g</span>
                         </div>
                         <div className="text-xs">
                            <span className="text-slate-400 block">Carbs</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{meal.carbs}g</span>
                         </div>
                         <div className="text-xs">
                            <span className="text-slate-400 block">Fat</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">{meal.fat}g</span>
                         </div>
                      </div>
                      
                      {meal.advice && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                           <p className="text-xs text-slate-500 italic">"{meal.advice}"</p>
                        </div>
                      )}
                   </Card>
                 ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
