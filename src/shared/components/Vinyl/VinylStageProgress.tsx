import React from 'react';

interface VinylStageProgressProps {
  totalStages: number;
  currentStage: number; // 0-indexed Or 1-indexed? Let's go 1-indexed for display
  className?: string;
  type?: 'dots' | 'bars';
  color?: string; // Tailwind color class like 'bg-rose-500'
}

/**
 * A highly visual progress indicator for multi-stage games or riddles.
 */
export const VinylStageProgress: React.FC<VinylStageProgressProps> = ({
  totalStages,
  currentStage,
  className = "",
  type = 'dots',
  color = 'bg-rose-500'
}) => {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {[...Array(totalStages)].map((_, i) => {
        const stageNum = i + 1;
        const isActive = stageNum <= currentStage;
        const isCurrentlyOn = stageNum === currentStage;

        if (type === 'dots') {
          return (
            <div 
              key={i} 
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                isActive 
                  ? `${color} ${isCurrentlyOn ? 'shadow-[0_0_10px_rgba(244,63,94,0.5)] scale-110' : 'opacity-80'}` 
                  : 'bg-slate-800'
              }`} 
            />
          );
        }

        return (
          <div 
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
              isActive ? color : 'bg-slate-800'
            }`}
          />
        );
      })}
    </div>
  );
};
