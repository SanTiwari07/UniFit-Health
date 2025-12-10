import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = React.memo(({ children, className = '', onClick, glass = false }) => {
  const baseStyles = "rounded-2xl transition-all duration-300 relative overflow-hidden";
  const themeStyles = glass 
    ? "bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg"
    : "bg-white dark:bg-[#141414] shadow-sm hover:shadow-md border border-slate-100 dark:border-white/5";
  
  return (
    <div 
      className={`${baseStyles} ${themeStyles} ${className} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';