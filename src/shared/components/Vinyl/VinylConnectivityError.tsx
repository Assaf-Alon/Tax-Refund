import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { SongItem } from '../../types/music';

interface VinylConnectivityErrorProps {
  isOpen: boolean;
  song: SongItem | null;
  lastError?: string | null;
  onRetry: () => void;
  onSkip: () => void;
}

export const VinylConnectivityError: React.FC<VinylConnectivityErrorProps> = ({
  isOpen,
  song,
  lastError,
  onRetry,
  onSkip
}) => {
  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-sm p-8 bg-slate-900 border border-rose-500/30 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl">
         <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
            <AlertCircle className="text-rose-500 w-8 h-8" />
         </div>
         
         <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Connection Blocked</h3>
         
         <div className="p-4 bg-black/40 rounded-2xl border border-white/5 w-full mb-6 text-left">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Failing Song:</p>
            <p className="text-sm font-bold text-white mb-1 line-clamp-1">{song.name}</p>
            <p className="text-[8px] font-medium text-slate-500 break-all opacity-40 mb-3">
               ID: {song.youtubeId}
            </p>
            
            {lastError && (
               <div className="mt-2 pt-2 border-t border-white/5">
                  <p className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest mb-1">Technical Detail:</p>
                  <p className="text-[10px] font-bold text-rose-200/60 leading-tight">
                     {lastError}
                  </p>
               </div>
            )}
         </div>

         <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mb-8">
            YouTube is blocking this specific stream. You can retry or skip this song to keep the game going.
         </p>

         <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={onRetry}
              className="w-full py-4 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
               Try Reconnecting
            </button>
            <button 
              onClick={onSkip}
              className="w-full py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-all"
            >
               Skip This Card
            </button>
         </div>
      </div>
    </div>
  );
};
