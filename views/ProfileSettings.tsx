
import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { UserProfile } from '../types';
import { NumberRoller } from '../components/NumberRoller';

interface ProfileSettingsProps {
  onBack: () => void;
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onBack, profile, onUpdateProfile }) => {
  const [editing, setEditing] = useState<keyof UserProfile | null>(null);
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    onUpdateProfile(localProfile);
    setEditing(null);
  };

  const EditModal = ({ title, children }: React.PropsWithChildren<{ title: string }>) => (
    <div className="absolute inset-0 z-50 bg-white dark:bg-black flex flex-col animate-slide-up">
       <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
          <button onClick={() => setEditing(null)} className="p-2 text-slate-500">Cancel</button>
          <span className="font-bold dark:text-white">{title}</span>
          <button onClick={handleSave} className="p-2 text-brand-green font-bold">Save</button>
       </div>
       <div className="flex-1 flex flex-col items-center justify-center p-6">
          {children}
       </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col pb-24 relative">
      <div className="px-2 mb-6 flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
           <Icons.ChevronLeft className="w-6 h-6 text-slate-900 dark:text-white" />
        </button>
        <div>
           <h2 className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide">Settings</h2>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 px-1">
         {/* Avatar Section */}
         <div className="flex flex-col items-center py-6">
            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden mb-3">
                 <img src="https://picsum.photos/200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <button className="text-brand-green text-sm font-medium">Change Photo</button>
         </div>

         {/* Settings Cards */}
         <Card className="divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
             <div onClick={() => setEditing('goal')} className="p-4 flex justify-between items-center active:bg-slate-50 dark:active:bg-zinc-800 cursor-pointer">
                 <span className="font-medium text-slate-900 dark:text-white">Goal</span>
                 <div className="flex items-center gap-2">
                    <span className="text-slate-500">{localProfile.goal}</span>
                    <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
                 </div>
             </div>
             <div onClick={() => setEditing('weight')} className="p-4 flex justify-between items-center active:bg-slate-50 dark:active:bg-zinc-800 cursor-pointer">
                 <span className="font-medium text-slate-900 dark:text-white">Current Weight</span>
                 <div className="flex items-center gap-2">
                    <span className="text-slate-500">{localProfile.weight} kg</span>
                    <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
                 </div>
             </div>
             <div onClick={() => setEditing('dietType')} className="p-4 flex justify-between items-center active:bg-slate-50 dark:active:bg-zinc-800 cursor-pointer">
                 <span className="font-medium text-slate-900 dark:text-white">Diet Type</span>
                 <div className="flex items-center gap-2">
                    <span className="text-slate-500">{localProfile.dietType}</span>
                    <Icons.ChevronRight className="w-4 h-4 text-slate-300" />
                 </div>
             </div>
         </Card>
      </div>

      {/* Edit Goal Modal */}
      {editing === 'goal' && (
         <EditModal title="Update Goal">
            <div className="w-full space-y-3">
               {['Lose Weight', 'Maintain', 'Gain Muscle', 'Gain Weight'].map(opt => (
                   <button 
                     key={opt}
                     onClick={() => setLocalProfile(p => ({...p, goal: opt as any}))}
                     className={`w-full p-4 rounded-xl text-left font-bold border-2 transition-all ${localProfile.goal === opt ? 'border-brand-green bg-green-50 dark:bg-green-900/20 text-slate-900 dark:text-white' : 'border-transparent bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}
                   >
                     {opt}
                   </button>
               ))}
            </div>
         </EditModal>
      )}

      {/* Edit Weight Modal */}
      {editing === 'weight' && (
         <EditModal title="Update Weight">
            <NumberRoller 
               min={30} 
               max={150} 
               value={parseInt(localProfile.weight)} 
               onChange={(v) => setLocalProfile(p => ({...p, weight: v.toString()}))} 
               unit="kg" 
            />
         </EditModal>
      )}

       {/* Edit Diet Modal */}
       {editing === 'dietType' && (
         <EditModal title="Update Diet">
            <div className="w-full space-y-3">
               {['Non-Veg', 'Vegetarian', 'Vegan', 'Eggetarian'].map(opt => (
                   <button 
                     key={opt}
                     onClick={() => setLocalProfile(p => ({...p, dietType: opt as any}))}
                     className={`w-full p-4 rounded-xl text-left font-bold border-2 transition-all ${localProfile.dietType === opt ? 'border-brand-green bg-green-50 dark:bg-green-900/20 text-slate-900 dark:text-white' : 'border-transparent bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}
                   >
                     {opt}
                   </button>
               ))}
            </div>
         </EditModal>
      )}

    </div>
  );
};
