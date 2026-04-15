import React, { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  TouchSensor,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { useParams } from 'react-router-dom';
import { Play, RotateCcw, Users, Music, AlertCircle, Pause } from 'lucide-react';

import { useVinylGame } from './hooks/useVinylGame';
import { useAudioStream } from '../../shared/hooks/useAudioStream';
import { VinylCard } from './components/VinylCard';
import { DraggableVinylCard } from './components/DraggableVinylCard';
import { Timeline } from './components/Timeline';

export const VinylTimelinePage: React.FC = () => {
  const params = useParams();
  const { state, setupGame, checkPlacement, proceedToNextPlayer, resetGame } = useVinylGame();
  
  const { 
    status: playerStatus,
    isReady, 
    isPlaying: actualIsPlaying, 
    prepare,
    playExcerpt,
    togglePlayback,
    progress,
    prefetch,
    reset
  } = useAudioStream();

  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const isPlaying = localIsPlaying || actualIsPlaying;
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // 1. Auto-prepare stream & reset state
  useEffect(() => {
    if (state?.mysteryCard?.youtubeId) {
      prepare(state.mysteryCard.youtubeId);
      setLocalIsPlaying(false);
      setShowResultModal(false);
    }
  }, [state?.mysteryCard?.id, prepare]);

  // 2. Global status observer (Cleanup)
  useEffect(() => {
    if (state.status === 'setup' || state.status === 'gameOver') {
      reset();
    }
  }, [state.status, reset]);

  // 3. Preload next mystery & pool in background
  useEffect(() => {
    if (state.status === 'playing') {
      // High priority: The very next card
      if (state.nextMysteryCard?.youtubeId) {
        prefetch(state.nextMysteryCard.youtubeId);
      }

      // Low priority: General pool
      if (state?.pool?.length > 0) {
        const remaining = state.pool.filter(s => !state.usedIds.includes(s.id));
        remaining.slice(0, 3).forEach(s => prefetch(s.youtubeId));
      }
    }
  }, [state?.status, state.nextMysteryCard?.id, state?.pool, state?.usedIds, prefetch]);

  // 4. Result modal delay
  useEffect(() => {
    if (state.status === 'revealing' && state.lastResult) {
      const timer = setTimeout(() => setShowResultModal(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowResultModal(false);
    }
  }, [state.status, state.lastResult]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handlePlaySnippet = useCallback(() => {
    if (!state?.mysteryCard || !isReady) return;

    if (isPlaying) {
      togglePlayback();
      setLocalIsPlaying(false);
    } else {
      setLocalIsPlaying(true);
      playExcerpt(
        state.mysteryCard.youtubeId, 
        state.mysteryCard.startTime, 
        state.mysteryCard.endTime,
        () => setLocalIsPlaying(false)
      );
    }
  }, [state?.mysteryCard, isReady, isPlaying, playExcerpt, togglePlayback]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (event.over) {
      checkPlacement(parseInt(event.over.id as string));
    }
  };

  const renderSetup = () => (
    <div className="w-full max-w-lg mt-8 p-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
          <Users className="text-white w-5 h-5" />
        </div>
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Setup Game</h2>
      </div>

      <div className="space-y-3 mb-6">
        {playerNames.map((name, i) => (
          <input
            key={i}
            type="text"
            value={name}
            onChange={(e) => {
              const next = [...playerNames];
              next[i] = e.target.value;
              setPlayerNames(next);
            }}
            placeholder={`Player ${i + 1}`}
            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 font-medium"
          />
        ))}
      </div>

      <button
        onClick={() => setupGame(playerNames, params.id ? parseInt(params.id) : undefined)}
        className="w-full py-4 bg-rose-600 text-white rounded-xl font-black shadow-xl shadow-rose-900/20 uppercase tracking-widest"
      >
        START JOURNEY
      </button>
    </div>
  );

  const renderPlaying = () => {
    if (!state?.mysteryCard) return null;
    const activePlayer = state.players[state.currentPlayerIndex] || { name: 'Player', lives: 0, score: 0 };

    return (
      <div className="w-full flex flex-col items-center gap-6 mt-4 pb-20">
        
        {/* HUD */}
        <div className="flex items-center gap-4 bg-slate-900/40 px-6 py-3 rounded-full border border-white/5 shadow-xl scale-90 sm:scale-100">
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase">Turn</span>
              <span className="text-white font-bold text-sm uppercase">{activePlayer.name}</span>
           </div>
           <div className="w-px h-6 bg-white/10" />
           <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                 <div key={i} className={`w-2 h-2 rounded-full ${i < activePlayer.lives ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-slate-800'}`} />
              ))}
           </div>
           <div className="w-px h-6 bg-white/10" />
           <span className="text-emerald-400 font-black text-sm tabular-nums">{activePlayer.score.toLocaleString()}</span>
           <div className="w-px h-6 bg-white/10" />
           <button 
             onClick={resetGame}
             className="text-slate-500 hover:text-rose-500 transition-colors tooltip tooltip-bottom"
             data-tip="Reset Game"
           >
              <RotateCcw size={14} />
           </button>
        </div>

        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* COMPACT PLAYER AREA */}
          <div className="relative flex flex-col items-center gap-4 w-full px-4">
             {/* Draggable Area - Increased height for mobile to prevent overlap */}
             <div className="w-full flex justify-center h-64 sm:h-72 mb-4">
                  <div className="scale-75 sm:scale-100 origin-center">
                      <DraggableVinylCard 
                        id={state.mysteryCard.id}
                        song={state.mysteryCard}
                        isRevealed={state.status === 'revealing'}
                        isMystery={state.status === 'playing'}
                      />
                  </div>
             </div>

             {/* Mobile-Friendly Control */}
             <div className="flex flex-col items-center gap-1 z-10 w-full max-w-[200px]">
                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                   <div 
                     className="h-full bg-rose-500 transition-all duration-300 ease-linear" 
                     style={{ width: `${progress}%` }}
                   />
                </div>

                <button 
                   onClick={handlePlaySnippet}
                   disabled={!isReady}
                   className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
                    isPlaying 
                      ? 'bg-rose-500 text-white shadow-2xl scale-110' 
                      : !isReady ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-950 shadow-xl'
                  }`}
                >
                  {!isReady && playerStatus !== 'error' ? (
                     <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="fill-current w-7 h-7" />
                  ) : playerStatus === 'error' ? (
                    <RotateCcw className="w-7 h-7" onClick={(e) => { e.stopPropagation(); prepare(state.mysteryCard!.youtubeId); }} />
                  ) : (
                    <Play className="fill-current w-7 h-7 ml-1" />
                  )}
                </button>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  {playerStatus === 'loading' ? 'Loading' : playerStatus === 'error' ? 'Tap to Retry' : isPlaying ? 'Pause' : 'Play Snippet'}
                </span>
             </div>
          </div>

          {/* TIMELINE */}
          <div className="w-full max-w-6xl px-2 sm:px-8 mt-4 overflow-x-hidden">
             <Timeline 
               songs={state.timeline || []} 
             />
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="w-48 h-48 scale-50 opacity-80 pointer-events-none transform-gpu transition-transform duration-200">
                <VinylCard song={state.mysteryCard} isMystery />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* OVERLAYS */}
        {playerStatus === 'error' && (
           <div className="fixed bottom-32 flex items-center gap-2 bg-rose-500/20 border border-rose-500/50 px-4 py-2 rounded-lg backdrop-blur-md z-50 animate-in fade-in slide-in-from-bottom-4">
              <AlertCircle size={14} className="text-rose-500" />
              <span className="text-[10px] text-rose-500 font-bold uppercase">Stream connection lost. Tap the retry button above.</span>
           </div>
        )}

        {state.status === 'revealing' && state.lastResult && showResultModal && (
           <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 pointer-events-auto animate-in fade-in zoom-in-95 duration-300">
              <div className={`w-full max-w-xs p-10 rounded-[2.5rem] border flex flex-col items-center gap-4 text-center ${
                state.lastResult.success ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400' : 'bg-rose-950/80 border-rose-500/40 text-rose-400'
              }`}>
                 <h3 className="text-3xl font-black uppercase italic tracking-tighter">
                    {state.lastResult.success ? 'Brilliant!' : 'Nope!'}
                 </h3>
                 <p className="text-sm font-bold opacity-80 uppercase">Year recorded: {state.lastResult.correctYear}</p>
                 <button 
                  onClick={proceedToNextPlayer}
                  className="mt-4 px-10 py-4 bg-white text-slate-950 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                 >
                    Next Turn
                 </button>
              </div>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center overflow-x-hidden">
        {state?.status === 'setup' && renderSetup()}
        {(state?.status === 'playing' || state?.status === 'revealing') && renderPlaying()}
        {state?.status === 'gameOver' && (
           <div className="p-10 flex flex-col items-center text-center">
              <Music className="text-rose-500 w-12 h-12 mb-6" />
              <h1 className="text-4xl font-black uppercase italic text-white italic">Game Over!</h1>
              <button onClick={resetGame} className="mt-8 px-10 py-5 bg-white text-black rounded-xl font-black uppercase tracking-widest">Restart</button>
           </div>
        )}
    </div>
  );
};
