import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { VinylCard, type VinylCardDisplayMode } from '../../../shared/components/Vinyl/VinylCard';
import type { SongItem } from '../../../shared/types/music';

interface DraggableVinylCardProps {
  id: string | number;
  song: SongItem | null;
  isPlaying?: boolean;
  displayMode?: VinylCardDisplayMode;
}

export const DraggableVinylCard: React.FC<DraggableVinylCardProps> = ({ 
  id, 
  song, 
  isPlaying,
  displayMode = 'mystery'
}) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    isDragging 
  } = useDraggable({
    id: String(id), // Force string ID for dnd-kit
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
    touchAction: 'none' // Crucial for mobile dragging
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`${isDragging ? 'z-50 shadow-2xl scale-110' : 'z-30'}`}
    >
      <VinylCard 
        song={song} 
        displayMode={displayMode}
        isPlaying={isPlaying}
        className="cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
