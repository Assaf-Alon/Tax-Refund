import React from 'react';
import { Disc, Music } from 'lucide-react';
import type { SongItem } from '../../../shared/types/music';

interface VinylCardProps {
  song: SongItem | null;
  isMystery?: boolean;
  isRevealed?: boolean;
  isPlaying?: boolean;
  className?: string;
}

export const VinylCard: React.FC<VinylCardProps> = ({ 
  song, 
  isMystery = false, 
  isRevealed = false, 
  isPlaying = false,
  className = "" 
}) => {
  const displayRevealed = !isMystery || isRevealed;

  return (
    <div className={`perspective-1000 w-64 h-80 ${className}`}>
      <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${displayRevealed ? 'rotate-y-180' : ''}`}>
        
        {/* Front Side (Mystery/Cover) */}
        <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center rounded-2xl glass-morphism shadow-2xl overflow-hidden border border-white/10 bg-slate-900">
          <div className="relative w-48 h-48 mb-4">
             {/* Vinyl Record */}
             <div className="absolute inset-0 rounded-full bg-black shadow-inner flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-slate-800 bg-slate-900 flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
                {/* Grooves */}
                <div className="absolute inset-2 rounded-full border border-white/5" />
                <div className="absolute inset-8 rounded-full border border-white/5" />
                <div className="absolute inset-14 rounded-full border border-white/5" />
             </div>
             
             {/* Spinning Disc UI */}
             <div className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <Disc size={64} className="text-indigo-500/50" />
             </div>
          </div>
          
          <div className="text-center space-y-2 px-4">
             <div className="h-4 w-32 bg-white/5 rounded mx-auto overflow-hidden relative">
                {isMystery && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />}
             </div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
               {isMystery ? "Place the year" : "Anchor Record"}
             </p>
          </div>

          {/* Flicker Overlay - Grain Noise */}
          <div className={`absolute inset-0 pointer-events-none noise-texture animate-vinyl-flicker mix-blend-overlay transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-60'}`} />
        </div>

        {/* Back Side (Revealed Song) */}
        {displayRevealed && (
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl glass-morphism shadow-2xl overflow-hidden flex flex-col bg-slate-950 border border-white/10">
            {/* Thumbnail Background (Blurred) */}
            {song?.youtubeId && (
              <div 
                className="absolute inset-0 opacity-20 blur-xl scale-110"
                style={{ 
                  backgroundImage: `url(https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}

            <div className="relative flex-1 p-6 flex flex-col items-center">
              {/* High-Res Center Cover */}
              {song?.youtubeId && (
                <div className="w-40 h-40 mb-4 rounded-lg overflow-hidden shadow-2xl border border-white/10 shrink-0">
                  <img 
                    src={`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`} 
                    alt={song.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
               <div className="space-y-1 text-center">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight">
                    {song?.info || "Unknown Source"}
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight line-clamp-2">
                    {song?.name || "Unknown Song"}
                  </h3>
               </div>
            </div>

            <div className="relative p-6 bg-slate-900/50 border-t border-white/5 flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Released</span>
                  <span className="text-2xl font-black text-white font-mono tracking-tighter">
                    {song?.year || "????"}
                  </span>
               </div>
               <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                  <Music size={18} className="text-indigo-400" />
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
