import React from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WorkoutLogEntry } from '../types';

interface WorkoutHistoryProps {
  onBack: () => void;
  workouts: WorkoutLogEntry[];
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ onBack, workouts }) => {
  // Aggregate daily minutes for the chart
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = days.map(day => ({ day, min: 0 }));
  
  // Very basic aggregation logic for demo (assumes all workouts are within this week)
  workouts.forEach(w => {
      const dayIndex = new Date(w.timestamp).getDay();
      chartData[dayIndex].min += Math.floor(w.duration / 60);
  });

  const weeklyTotal = chartData.reduce((acc, curr) => acc + curr.min, 0);

  return (
    <div className="h-full flex flex-col pb-24">
      <div className="px-2 mb-6 flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
           <Icons.ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <div>
           <h2 className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide">Fitness</h2>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workout History</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 px-1 no-scrollbar">
         <Card className="p-6 h-64">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Activity (Minutes)</h3>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '8px', border: 'none', background: '#333', color: '#fff'}}
                  />
                  <Bar dataKey="min" radius={[4, 4, 4, 4]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.min > 0 ? '#A855F7' : '#E5E7EB'} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </Card>

         <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30">
                <span className="text-xs text-purple-600 dark:text-purple-400 uppercase block mb-1">Weekly Volume</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{weeklyTotal} min</span>
            </Card>
            <Card className="p-4">
                <span className="text-xs text-slate-500 uppercase block mb-1">Total Workouts</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{workouts.length}</span>
            </Card>
         </div>

         <div className="pt-4">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 px-1">Recent Sessions</h3>
             {workouts.length === 0 ? (
                 <div className="text-center py-10 opacity-50">
                     <p>No workouts logged yet.</p>
                 </div>
             ) : (
                 <div className="space-y-3">
                     {workouts.map((item) => (
                         <div key={item.id} className="space-y-2">
                            {/* Insight Bubble if available */}
                            {item.aiInsight && (
                                <div className="ml-10 bg-slate-100 dark:bg-zinc-800 p-3 rounded-xl rounded-tl-none text-xs text-slate-600 dark:text-zinc-400 italic mb-1 border-l-2 border-brand-green">
                                    " {item.aiInsight} "
                                </div>
                            )}
                            
                            <Card className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'Strength' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20'}`}>
                                        <Icons.Gym className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white">{item.type}</h4>
                                        <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-900 dark:text-white">{Math.floor(item.duration / 60)}m</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">{item.effort}</span>
                                </div>
                            </Card>
                         </div>
                     ))}
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};