
import React from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface HydrationHistoryProps {
  onBack: () => void;
  dailyWater: number;
  target: number;
}

// Mock Data for previous days
const data = [
  { day: 'Mon', ml: 2100 },
  { day: 'Tue', ml: 1950 },
  { day: 'Wed', ml: 2300 },
  { day: 'Thu', ml: 1800 },
  { day: 'Fri', ml: 2450 },
  { day: 'Sat', ml: 2100 },
  { day: 'Sun', ml: 1450 }, // Placeholder for Today
];

export const HydrationHistory: React.FC<HydrationHistoryProps> = ({ onBack, dailyWater, target }) => {
  // Update "Today" (Sun) with actual data for visualization
  const chartData = [...data];
  chartData[6] = { ...chartData[6], ml: dailyWater };
  
  const weeklyAvg = Math.round(chartData.reduce((acc, curr) => acc + curr.ml, 0) / chartData.length);

  return (
    <div className="h-full flex flex-col pb-24">
      <div className="px-2 mb-6 flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
           <Icons.ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <div>
           <h2 className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide">Trends</h2>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hydration History</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-1 no-scrollbar">
         <Card className="p-6 text-center bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
             <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase">Today's Intake</h3>
             <div className="flex items-center justify-center gap-2 my-2">
                 <Icons.Water className="w-8 h-8 text-blue-500" />
                 <span className="text-5xl font-bold text-slate-900 dark:text-white">{dailyWater}</span>
                 <span className="text-xl font-medium text-slate-400 self-end mb-2">ml</span>
             </div>
             <div className="flex justify-center items-center gap-2 text-sm text-slate-400">
               <span>Target: {target} ml</span>
               <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
               <span className={`${dailyWater >= target ? 'text-green-500' : 'text-slate-500'}`}>
                 {Math.round((dailyWater / target) * 100)}%
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
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: 'none', background: '#333', color: '#fff'}}
                  />
                  <ReferenceLine y={target} stroke="#6B7280" strokeDasharray="3 3" />
                  <Bar dataKey="ml" radius={[4, 4, 4, 4]}>
                    {chartData.map((entry, index) => {
                      const isToday = index === chartData.length - 1;
                      let fill = '#E5E7EB'; 
                      if (isToday) fill = '#3BA5FF';
                      else if (entry.ml >= target) fill = '#4C9FFF'; // Blue if hit target
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </Card>

         <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
                <span className="text-xs text-slate-500 uppercase block mb-1">Weekly Avg</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{weeklyAvg} ml</span>
            </Card>
            <Card className="p-4">
                <span className="text-xs text-slate-500 uppercase block mb-1">Completion</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">71%</span>
            </Card>
         </div>
      </div>
    </div>
  );
};
