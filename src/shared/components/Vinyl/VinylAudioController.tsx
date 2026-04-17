import React from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

interface VinylAudioControllerProps {
  isPlaying: boolean;
  isReady: boolean;
  progress: number;
  onToggle: () => void;
  playerStatus: 'uninitialized' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error' | 'idle';
  lastError?: string | null;
  onRetry?: () => void;
  oneListenOnly?: boolean;
  listenedCurrentRound?: boolean;
  /** Label for the button */
  label?: string;
  /** Whether to hide the play button */
  hidePlayButton?: boolean;
}

export const VinylAudioController: React.FC<VinylAudioControllerProps> = ({
  isPlaying,
  isReady,
  progress,
  onToggle,
  playerStatus,
  lastError,
  onRetry,
  oneListenOnly = false,
  listenedCurrentRound = false,
  label,
  hidePlayButton = false
}) => {
  const isDisabled = !isReady || (oneListenOnly && listenedCurrentRound && !isPlaying);
  
  const getLabel = () => {
    if (label) return label;
    if (playerStatus === 'loading' || playerStatus === 'uninitialized') return 'Loading';
    if (playerStatus === 'error') return 'Tap to Retry';
    if (isPlaying) return oneListenOnly ? 'Stop' : 'Pause';
    if (oneListenOnly && listenedCurrentRound) return 'Listen Used';
    return 'Play Snippet';
  };

  return (
    <div className="flex flex-col items-center gap-1 z-10 w-full max-w-[200px]">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-rose-500 transition-all duration-300 ease-linear" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {!hidePlayButton && (
        <button 
          onClick={onToggle}
          disabled={isDisabled}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
          isPlaying 
            ? 'bg-rose-500 text-white shadow-2xl scale-110' 
            : isDisabled ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-950 shadow-xl'
          }`}
        >
          {!isReady && playerStatus !== 'error' ? (
            <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
          ) : isPlaying ? (
            oneListenOnly ? <Square className="fill-current w-7 h-7" /> : <Pause className="fill-current w-7 h-7" />
          ) : playerStatus === 'error' ? (
            <RotateCcw className="w-7 h-7" onClick={(e) => { e.stopPropagation(); onRetry?.(); }} />
          ) : (
            <Play className={`fill-current w-7 h-7 ml-1 ${(oneListenOnly && listenedCurrentRound) ? 'opacity-20' : ''}`} />
          )}
        </button>
      )}

      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
        {hidePlayButton && isPlaying ? "Looping Snippet" : getLabel()}
      </span>
      
      {playerStatus === 'error' && lastError && (
        <span className="text-[7px] font-bold text-rose-500/60 uppercase tracking-tight text-center max-w-[150px] mt-0.5 animate-pulse">
          {lastError}
        </span>
      )}
    </div>
  );
};
