
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/Card';
import { Icons } from '../components/Icons';
import { analyzePain, fileToGenerativePart } from '../services/geminiService';
import { PainAnalysis } from '../types';

export const PainScan: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [result, setResult] = useState<PainAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optimization: Cleanup object URLs
  useEffect(() => {
    return () => {
        if (image && image.startsWith('blob:')) {
            URL.revokeObjectURL(image);
        }
    };
  }, [image]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        // Revoke old blob if needed
        if (image && image.startsWith('blob:')) URL.revokeObjectURL(image);

        const base64 = await fileToGenerativePart(file);
        setImageBase64(base64);
        setImage(URL.createObjectURL(file));
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim() && !image) {
      alert("Please describe your pain or upload an image.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzePain(symptoms, imageBase64 || undefined);
      setResult(analysis);
    } catch (e) {
      alert("Could not analyze symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col pb-24">
       <div className="px-2 mb-6">
        <h2 className="text-red-500 dark:text-red-400 text-sm font-medium uppercase tracking-wide">Recovery</h2>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">PainScan</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-1 no-scrollbar">
        {!result ? (
            <div className="space-y-6 animate-slide-up">
                 {/* Premium Silhouette Graphic */}
                 {!image ? (
                    <div className="flex justify-center py-6">
                        <div className="relative h-64 w-32">
                            {/* Abstract Body Outline */}
                            <svg viewBox="0 0 100 220" className="w-full h-full drop-shadow-xl text-slate-200 dark:text-zinc-800 fill-current">
                                <path d="M50,20 C58,20 65,26 65,34 C65,42 58,48 50,48 C42,48 35,42 35,34 C35,26 42,20 50,20 Z" />
                                <path d="M50,52 C70,52 85,60 85,75 L85,110 C85,115 80,118 75,115 L70,100 L70,130 L75,190 C76,200 70,205 65,205 C60,205 58,198 58,190 L55,140 L45,140 L42,190 C42,198 40,205 35,205 C30,205 24,200 25,190 L30,130 L30,100 L25,115 C20,118 15,115 15,110 L15,75 C15,60 30,52 50,52 Z" />
                            </svg>
                            
                            {/* Scan Line Animation */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_3s_ease-in-out_infinite]"></div>
                        </div>
                    </div>
                 ) : (
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-zinc-700">
                        <img src={image} alt="Pain Area" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => { setImage(null); setImageBase64(null); }}
                          className="absolute top-3 right-3 bg-black/50 backdrop-blur text-white p-2 rounded-full hover:bg-black/70"
                        >
                          <Icons.Close className="w-5 h-5" />
                        </button>
                    </div>
                 )}

                 <Card className="p-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Describe the pain</label>
                    <textarea 
                        className="w-full bg-slate-100 dark:bg-zinc-800 border-none rounded-xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none h-32 mb-4"
                        placeholder="E.g. Sharp pain in lower back after deadlifts..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                    />
                    
                    {/* Image Upload Trigger */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg">
                            <Icons.Camera className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Add Photo (Optional)</p>
                            <p className="text-xs text-slate-500">Upload a picture of the swollen/hurt area.</p>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs font-medium hover:bg-slate-200 dark:hover:bg-zinc-700 transition dark:text-zinc-300" onClick={() => setSymptoms("Sore knees after running")}>Knee pain</button>
                        <button className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs font-medium hover:bg-slate-200 dark:hover:bg-zinc-700 transition dark:text-zinc-300" onClick={() => setSymptoms("Stiff neck from studying")}>Neck stiffness</button>
                    </div>
                 </Card>

                 <button 
                    disabled={loading || (!symptoms && !image)}
                    onClick={handleAnalyze}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                 >
                    {loading ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           <span>Analyzing Anatomy...</span>
                        </>
                    ) : 'Scan Symptoms'}
                 </button>
            </div>
        ) : (
            <div className="space-y-4 animate-slide-up pb-10">
                 <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${
                     result.severity === 'High' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-200' :
                     result.severity === 'Medium' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/30 text-orange-800 dark:text-orange-200' :
                     'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-200'
                 }`}>
                    <span className="font-bold">Severity Estimate</span>
                    <span className="font-bold uppercase tracking-wider text-sm">{result.severity}</span>
                 </div>

                 <Card className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{result.muscle_involved}</h3>
                    <p className="text-slate-600 dark:text-zinc-400 text-sm font-medium uppercase tracking-wide mb-4">Probable Cause: {result.cause}</p>

                    <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl mb-4">
                        <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Detailed Analysis</h4>
                        <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed">
                            {result.detailed_explanation || "The AI has detected a potential strain based on your description. This often occurs due to repetitive stress or improper form."}
                        </p>
                    </div>

                    <h4 className="font-semibold text-xs uppercase text-slate-500 mb-2 tracking-wide">Correction & Tips</h4>
                    <p className="text-sm mb-4 text-slate-700 dark:text-zinc-300">{result.correction}</p>

                    <h4 className="font-semibold text-xs uppercase text-slate-500 mb-2 tracking-wide">Recommended Stretches</h4>
                    <div className="space-y-2">
                        {result.stretches.map((stretch, i) => (
                            <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-zinc-800 p-3 rounded-lg">
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {i+1}
                                </div>
                                <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">{stretch}</p>
                            </div>
                        ))}
                    </div>
                 </Card>

                 {result.avoid_gym && (
                     <div className="p-4 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white flex items-center gap-3 shadow-lg">
                         <Icons.Zap className="w-5 h-5 text-yellow-400" />
                         <span className="font-bold text-sm">Advice: Avoid heavy lifting today.</span>
                     </div>
                 )}

                 <Card className="p-5">
                     <div className="flex items-center gap-2 mb-2">
                        <Icons.Health className="w-4 h-4 text-brand-green" />
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recovery Timeline</h3>
                     </div>
                     <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.recovery_timeline}</p>
                     <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">{result.recommendation}</p>
                 </Card>

                 <button 
                    onClick={() => { setResult(null); setImage(null); setImageBase64(null); }}
                    className="w-full py-4 text-slate-500 dark:text-zinc-500 font-medium text-sm hover:text-slate-800 dark:hover:text-white transition-colors"
                 >
                    Scan Another Issue
                 </button>
            </div>
        )}
      </div>
    </div>
  );
};
