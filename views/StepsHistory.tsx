
import React from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface StepsHistoryProps {
  onBack: () => void;
  dailySteps: number;
  target: number;
}

// Mock Data for previous days
const data = [
  { day: 'Mon', steps: 6500 },
  { day: 'Tue', steps: 8200 },
  { day: 'Wed', steps: 4500 },
  { day: 'Thu', steps: 9100 },
  { day: 'Fri', steps: 7800 },
  { day: 'Sat', steps: 10200 },
  { day: 'Sun', steps: 5000 }, // Placeholder for Today
];

export const StepsHistory: React.FC<StepsHistoryProps> = ({ onBack, dailySteps, target }) => {
  // Update "Today" (Sun) with actual data for visualization
  const chartData = [...data];
  chartData[6] = { ...chartData[6], steps: dailySteps };
  
  const weeklyAvg = Math.round(chartData.reduce((acc, curr) => acc + curr.steps, 0) / chartData.length);

  return (
    <div className="h-full flex flex-col pb-24">
      <div className="px-2 mb-6 flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
           <Icons.ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <div>
           <h2 className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide">Activity</h2>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Steps History</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-1 no-scrollbar">
         <Card className="p-6 text-center">
             <h3 className="text-sm font-medium text-slate-500 uppercase">Today's Steps</h3>
             <div className="flex items-center justify-center gap-2 my-2">
                 <Icons.Footprints className="w-8 h-8 text-yellow-500" />
                 <span className="text-5xl font-bold text-slate-900 dark:text-white">{dailySteps.toLocaleString()}</span>
             </div>
             <div className="flex justify-center items-center gap-2 text-sm text-slate-400">
               <span>Target: {target.toLocaleString()}</span>
               <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
               <span className={`${dailySteps >= target ? 'text-yellow-500' : 'text-slate-500'}`}>
                 {Math.round((dailySteps / target) * 100)}%
               </span>
             </div>
         </Card>

         <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/10 dark:to-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 flex items-start gap-3">
             <Icons.Sparkles className="w-5 h-5 text-yellow-500 mt-1 shrink-0" />
             <div>
                 <h4 className="font-bold text-slate-900 dark:text-white text-sm">AI Recommendation</h4>
                 <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                     As per AI analysis of your activity profile, you should aim for <span className="font-bold text-yellow-600 dark:text-yellow-400">{target.toLocaleString()} steps</span> daily to maintain optimal metabolism.
                 </p>
             </div>
         </div>

         <Card className="p-6 h-64">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-slate-500">Last 7 Days</h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <div className="w-3 h-[1px] bg-slate-400/50 border border-dashed border-slate-400"></div>
                <span>Goal ({target/1000}k)</span>
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
                  <ReferenceLine y={target} stroke="#9CA3AF" strokeDasharray="3 3" />
                  <Bar dataKey="steps" radius={[4, 4, 4, 4]}>
                    {chartData.map((entry, index) => {
                      const isToday = index === chartData.length - 1;
                      let fill = '#E5E7EB'; 
                      if (isToday) fill = '#FACC15'; // Lighter Gold/Yellow for Today
                      else if (entry.steps >= target) fill = '#EAB308'; // Premium Gold if hit target
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </Card>

         <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
                <span className="text-xs text-slate-500 uppercase block mb-1">Weekly Avg</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{weeklyAvg.toLocaleString()}</span>
            </Card>
            <Card className="p-4">
                <span className="text-xs text-slate-500 uppercase block mb-1">Calories Burned</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">~{(dailySteps * 0.04).toFixed(0)}</span>
            </Card>
         </div>
      </div>
    </div>
  );
};
