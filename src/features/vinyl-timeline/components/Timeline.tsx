import React from 'react';
import { VinylCard } from '../../../shared/components/Vinyl/VinylCard';
import { VinylDropZone } from '../../../shared/components/Vinyl/VinylDropZone';
import type { SongItem } from '../../../shared/types/music';

interface TimelineProps {
  songs: SongItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ 
  songs = []
}) => {
  return (
    <div className="flex flex-col items-center py-12 w-full max-w-2xl mx-auto space-y-2">
      <VinylDropZone id="0" />

      {songs.map((item, index) => (
        <React.Fragment key={`${item?.id || 'song'}-${index}`}>
          <div className="relative group scale-90 sm:scale-100 flex flex-col items-center">
            <VinylCard 
              song={item} 
              displayMode="revealed"
              className="transform shadow-2xl"
            />
            {/* Year Label */}
            <div className="absolute -left-16 sm:-left-24 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <span className="font-black text-xs sm:text-base text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {item?.year}
               </span>
               <div className="h-px w-4 sm:w-8 bg-white/20" />
            </div>
            
            {/* Visual connector */}
            <div className="h-4 w-px bg-gradient-to-b from-white/10 to-transparent mt-2" />
          </div>
          
          <VinylDropZone id={`${index + 1}`} />
        </React.Fragment>
      ))}

      {/* Removed Redundant Overlay */}
    </div>
  );
};
