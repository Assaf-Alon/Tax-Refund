import React from 'react';
import { Music } from 'lucide-react';
import { VinylCard } from './VinylCard';
import type { SongItem } from '../../types/music';

interface VinylResultModalProps {
  isOpen: boolean;
  isSuccess: boolean;
  correctYear: string | number;
  song: SongItem | null;
  onContinue: () => void;
  title?: string;
  buttonLabel?: string;
}

export const VinylResultModal: React.FC<VinylResultModalProps> = ({
  isOpen,
  isSuccess,
  correctYear,
  song,
  onContinue,
  title,
  buttonLabel = "Continue"
}) => {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 ${
      isSuccess ? 'bg-emerald-950/95' : 'bg-rose-950/95'
    } backdrop-blur-xl`}>
      <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl animate-bounce border ${
        isSuccess ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400'
      }`}>
         <Music className="text-white w-10 h-10" />
      </div>
      
      <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2 text-center">
         {title || (isSuccess ? 'Brilliant!' : 'Nope!')}
      </h2>
      
      <div className="flex flex-col items-center gap-1 mb-10">
         <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Correct Year</span>
         <span className="text-6xl font-black text-white tabular-nums tracking-tighter leading-none">{correctYear}</span>
      </div>
      
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
         <VinylCard 
           song={song} 
           displayMode="revealed"
         />
         <button 
           onClick={onContinue}
           className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black italic tracking-tighter uppercase shadow-2xl hover:scale-105 transition-all"
         >
           {buttonLabel}
         </button>
      </div>
    </div>
  );
};
