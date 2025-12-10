
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { analyzeMeal, analyzeMenu, fileToGenerativePart } from '../services/geminiService';
import { MealData, UserProfile, MenuAnalysis } from '../types';

interface MealScanProps {
  onLogMeal: (data: MealData) => void;
  userProfile: UserProfile;
}

type ScanMode = 'MEAL' | 'MENU';

export const MealScan: React.FC<MealScanProps> = ({ onLogMeal, userProfile }) => {
  const [mode, setMode] = useState<ScanMode>('MEAL');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Meal Scan State
  const [mealData, setMealData] = useState<MealData | null>(null);
  
  // Menu Scan State
  const [menuData, setMenuData] = useState<MenuAnalysis | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optimization: Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
        if (image && image.startsWith('blob:')) {
            URL.revokeObjectURL(image);
        }
    };
  }, [image]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMealData(null);
    setMenuData(null);

    // Revoke previous blob if exists
    if (image && image.startsWith('blob:')) URL.revokeObjectURL(image);

    try {
      // Create preview using standard URL.createObjectURL for memory efficiency over FileReader
      const objectUrl = URL.createObjectURL(file);
      setImage(objectUrl);

      // Analyze
      const base64Data = await fileToGenerativePart(file);
      
      if (mode === 'MEAL') {
          const result = await analyzeMeal(base64Data, file.type);
          setMealData(result);
      } else {
          const result = await analyzeMenu(base64Data, file.type, userProfile);
          setMenuData(result);
      }

    } catch (error) {
      alert("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogMeal = () => {
    if (mealData) {
      onLogMeal(mealData);
      setImage(null);
      setMealData(null);
    }
  };

  return (
    <div className="h-full flex flex-col pb-24">
      <div className="px-2 mb-6">
        <h2 className="text-slate-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide">Nutrition AI</h2>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">MealScan</h1>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl mb-6 mx-1">
          <button 
             onClick={() => { setMode('MEAL'); setImage(null); setMealData(null); setMenuData(null); }}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                 mode === 'MEAL' 
                 ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' 
                 : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'
             }`}
          >
             <Icons.Food className="w-4 h-4" />
             Log Meal
          </button>
          <button 
             onClick={() => { setMode('MENU'); setImage(null); setMealData(null); setMenuData(null); }}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                 mode === 'MENU' 
                 ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' 
                 : 'text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300'
             }`}
          >
             <Icons.Menu className="w-4 h-4" />
             Scan Menu/Fridge
          </button>
      </div>

      {!image ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Card 
            className="w-full max-w-sm aspect-square border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 flex flex-col items-center justify-center gap-4 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${mode === 'MEAL' ? 'bg-brand-green' : 'bg-blue-500'}`}>
              {mode === 'MEAL' ? <Icons.Camera className="w-8 h-8" /> : <Icons.ChefHat className="w-8 h-8" />}
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-900 dark:text-white">
                  {mode === 'MEAL' ? 'Take photo of meal' : 'Take photo of Menu/Fridge'}
              </p>
              <p className="text-sm text-slate-500">or upload from gallery</p>
            </div>
          </Card>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-1 space-y-4">
          <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
            <img src={image} alt="Scan" className="w-full h-full object-cover" />
            <button 
              onClick={() => { setImage(null); setMealData(null); setMenuData(null); }}
              className="absolute top-4 right-4 bg-black/50 backdrop-blur text-white p-2 rounded-full hover:bg-black/70"
            >
              <Icons.Close className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
             <div className="space-y-3 p-4">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2 animate-pulse"></div>
                <div className="h-20 bg-slate-200 dark:bg-zinc-800 rounded w-full animate-pulse"></div>
                <p className="text-center text-sm text-slate-500 animate-pulse mt-4">
                    {mode === 'MEAL' ? 'Analysing nutrition...' : 'Finding best options...'}
                </p>
             </div>
          ) : (
            <>
                {/* --- MEAL SCAN RESULT --- */}
                {mode === 'MEAL' && mealData && (
                    <div className="space-y-4 animate-slide-up">
                        {mealData.is_uncertain ? (
                            <Card className="p-5 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200">
                                <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Uncertain Analysis</h3>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">The AI couldn't confidently identify this food. Values are estimates.</p>
                            </Card>
                        ) : null}

                        <Card className="p-5">
                            <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{mealData.food_name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${mealData.health_rating >= 7 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    Score: {mealData.health_rating}/10
                                </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-3xl font-bold text-brand-green">{mealData.calories}</span>
                                <span className="text-xs text-slate-500 uppercase">kcal</span>
                            </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl text-center">
                                <span className="block text-xs text-slate-500 mb-1">Protein</span>
                                <span className="font-bold text-slate-900 dark:text-white">{mealData.protein}g</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl text-center">
                                <span className="block text-xs text-slate-500 mb-1">Carbs</span>
                                <span className="font-bold text-slate-900 dark:text-white">{mealData.carbs}g</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl text-center">
                                <span className="block text-xs text-slate-500 mb-1">Fat</span>
                                <span className="font-bold text-slate-900 dark:text-white">{mealData.fat}g</span>
                            </div>
                            </div>

                            <div className="space-y-3">
                            {mealData.fat_loss_suitability ? (
                                <div className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                                    <Icons.TrendUp className="w-4 h-4 mt-0.5" />
                                    <span>Good for fat loss.</span>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 text-sm text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                                    <Icons.TrendUp className="w-4 h-4 mt-0.5" />
                                    <span>Use moderation for fat loss.</span>
                                </div>
                            )}
                            
                            {mealData.portion_change_recommendation && (
                                <div className="text-sm">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Suggestion:</span> {mealData.portion_change_recommendation}
                                </div>
                            )}

                            {mealData.alternative && (
                                <div className="text-sm">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">Alternative:</span> {mealData.alternative}
                                </div>
                            )}
                            </div>
                        </Card>

                        <button 
                            onClick={handleLogMeal}
                            className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
                        >
                            Log Meal
                        </button>
                    </div>
                )}

                {/* --- MENU SCAN RESULT --- */}
                {mode === 'MENU' && menuData && (
                    <div className="space-y-4 animate-slide-up">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 rounded-2xl text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-2 opacity-80">
                                <Icons.Sparkles className="w-5 h-5 text-yellow-300" />
                                <span className="text-xs font-bold uppercase tracking-wider">Top Recommendation</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{menuData.bestOption}</h3>
                            <p className="text-sm text-blue-100 leading-relaxed">{menuData.advice}</p>
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white px-1">Alternative Options</h3>
                        
                        {menuData.recommendations.map((rec, i) => (
                            <Card key={i} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{rec.itemName}</h4>
                                    <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded text-slate-500">
                                        ~{rec.caloriesEstimate} kcal
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-zinc-400 mb-2">{rec.reason}</p>
                                <div className="flex items-center gap-2 text-xs font-semibold text-brand-green">
                                    <Icons.Gym className="w-3 h-3" />
                                    <span>{rec.proteinEstimate}g Protein</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
