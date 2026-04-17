import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface VinylDropZoneProps {
  /** Unique ID for dnd-kit backend */
  id: string;
  /** Whether the drop zone is large (active drag) or small (idle) */
  isActive?: boolean;
}

/**
 * A reusable drop target for Vinyl cards.
 * Displays a glowing line and an expandable hit area during drag operations.
 */
export const VinylDropZone: React.FC<VinylDropZoneProps> = ({ id }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-full transition-all duration-300 flex items-center justify-center ${
        isOver ? 'h-32' : 'h-10'
      }`}
    >
      {/* The visible line */}
      <div
        className={`h-[1px] w-48 transition-all duration-300 ${
          isOver 
            ? 'bg-rose-400 w-64 shadow-[0_0_20px_rgba(244,63,94,0.8)] scale-110' 
            : 'bg-white/10'
        }`}
      />
      
      {/* Success Indicator (The Bounce +) */}
      {isOver && (
        <div className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 shadow-lg animate-bounce">
          <span className="text-white font-bold text-xl">+</span>
        </div>
      )}
    </div>
  );
};
