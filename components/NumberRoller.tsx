
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface NumberRollerProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  unit: string;
}

export const NumberRoller: React.FC<NumberRollerProps> = ({ min, max, value, onChange, unit }) => {
  // Local state to handle typing (allows empty string while typing)
  const [inputValue, setInputValue] = useState(value.toString());

  // Sync local state when prop changes externally, but only if they genuinely differ 
  // (to avoid resetting cursor when typing creates valid matching numbers)
  useEffect(() => {
    if (parseInt(inputValue) !== value) {
        setInputValue(value.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setInputValue(valStr);

    const val = parseInt(valStr);
    if (!isNaN(val)) {
        // Only update parent if it's within logical bounds, allow user to type freely otherwise
        if (val >= 0) { 
            onChange(val);
        }
    }
  };

  const handleBlur = () => {
    // On focus lost, ensure we snap back to a valid number within range
    let val = parseInt(inputValue);
    if (isNaN(val)) {
        val = value; // Revert to current prop value
    } else if (val > max) {
        val = max;
    } else if (val < min) {
        val = min;
    }
    setInputValue(val.toString());
    onChange(val);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-sm mx-auto select-none py-10">
      <div className="flex items-center justify-center gap-6 w-full">
        {/* Decrement */}
        <button 
          onClick={handleDecrement}
          className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-sm"
        >
          <Icons.Minus className="w-8 h-8 stroke-[3]" />
        </button>

        {/* Display */}
        <div className="flex flex-col items-center justify-center w-40 relative">
           <input 
             type="number" 
             value={inputValue} 
             onChange={handleInputChange}
             onBlur={handleBlur}
             className="w-full text-center bg-transparent text-7xl font-black text-slate-900 dark:text-white outline-none tracking-tighter tabular-nums p-0 m-0 leading-none z-10"
             style={{ fontWeight: 900 }}
           />
           <span className="text-xl font-bold text-brand-green mt-2">{unit}</span>
           {/* Invisible click overlay to focus input if user taps near it */}
           <div className="absolute inset-0 z-0" onClick={(e) => {
               const input = e.currentTarget.parentElement?.querySelector('input');
               input?.focus();
           }}></div>
        </div>

        {/* Increment */}
        <button 
          onClick={handleIncrement}
          className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center text-white hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/30"
        >
          <Icons.Plus className="w-8 h-8 stroke-[3]" />
        </button>
      </div>
      <p className="text-sm text-slate-400 dark:text-zinc-500 font-medium">
        Tap or type to edit
      </p>
    </div>
  );
};
