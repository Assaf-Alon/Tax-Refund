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
import { Play, RotateCcw, Users, Music, AlertCircle, Pause, Square, Plus, Trash2, UserPlus, Shuffle, Zap } from 'lucide-react';

import { useVinylGame } from './hooks/useVinylGame';
import { useAudioStream } from '../../shared/hooks/useAudioStream';
import { VinylCard } from './components/VinylCard';
import { DraggableVinylCard } from './components/DraggableVinylCard';
import { Timeline } from './components/Timeline';

export const VinylTimelinePage: React.FC = () => {
  const params = useParams();
  const { state, setupGame, checkPlacement, proceedToNextPlayer, resetGame, skipCurrentMystery, prepareInitialSongs, consumeListen, endGame } = useVinylGame();
  
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
  const [isSoloContinuing, setIsSoloContinuing] = useState(false);
  const [gameMode, setGameMode] = useState<'survivor' | 'points'>('survivor');
  const [oneListenOnly, setOneListenOnly] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [hardMode, setHardMode] = useState(false);

  // 0. Preload pool and initial candidate on mount OR when modes change in setup
  useEffect(() => {
    if (state.status === 'setup') {
      prepareInitialSongs(shuffleMode, hardMode);
    }
  }, [prepareInitialSongs, state.status, shuffleMode, hardMode]);

  // 1. Auto-prepare stream & reset state
  useEffect(() => {
    if (state.status === 'playing' && state.mysteryCard?.youtubeId) {
      prepare(state.mysteryCard.youtubeId);
      setLocalIsPlaying(false);
      setShowResultModal(false);
      if (state.players.filter(p => p.lives > 0).length > 1) {
        setIsSoloContinuing(false); // Reset solo mode if we are back to actual multiplayer
      }
    } else if (state.status === 'setup' && state.candidateMystery?.youtubeId) {
      // PRELOAD the first song while in setup screen
      prepare(state.candidateMystery.youtubeId);
    }
  }, [state.status, state?.mysteryCard?.id, state?.candidateMystery?.youtubeId, state.playbackStart, state.playbackEnd, prepare]);


  // 2. Global status observer (Cleanup)
  useEffect(() => {
    if (state.status === 'gameOver') {
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
      // Consume listen when pausing or when it ends
      if (state.oneListenOnly) consumeListen();
    } else {
      if (state.oneListenOnly && state.listenedCurrentRound) return;

      setLocalIsPlaying(true);
      playExcerpt(
        state.mysteryCard.youtubeId, 
        state.playbackStart ?? state.mysteryCard.startTime, 
        state.playbackEnd ?? state.mysteryCard.endTime,
        () => {
          setLocalIsPlaying(false);
          if (state.oneListenOnly) consumeListen();
        }
      );
    }
  }, [state?.mysteryCard, state.playbackStart, state.playbackEnd, isReady, isPlaying, playExcerpt, togglePlayback, state.oneListenOnly, state.listenedCurrentRound, consumeListen]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (event.over) {
      checkPlacement(parseInt(event.over.id as string));
    }
  };

  const getNextLivingPlayer = useCallback(() => {
    if (!state.players.length) return null;
    let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
    // Walk through players until we find one with lives or reach start
    while (state.players[nextIdx].lives <= 0 && nextIdx !== state.currentPlayerIndex) {
      nextIdx = (nextIdx + 1) % state.players.length;
    }
    return state.players[nextIdx];
  }, [state.players, state.currentPlayerIndex]);

  const livingPlayersCount = state.players.filter(p => p.lives > 0).length;
  const isMatchEnding = !isSoloContinuing && state.players.length > 1 && livingPlayersCount <= 1;

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
          <div key={i} className="flex gap-2 group">
            <div className="relative flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const next = [...playerNames];
                  next[i] = e.target.value;
                  setPlayerNames(next);
                }}
                placeholder={`Player ${i + 1}`}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-5 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 font-medium transition-colors"
              />
            </div>
            {playerNames.length > 1 && (
              <button 
                onClick={() => setPlayerNames(playerNames.filter((_, idx) => idx !== i))}
                className="w-12 h-12 flex items-center justify-center bg-slate-800/50 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
        
        {playerNames.length < 5 && (
          <button 
            onClick={() => setPlayerNames([...playerNames, ''])}
            className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
          >
            <Plus size={16} />
            <span>Add Player</span>
          </button>
        )}
      </div>

      {/* Settings Section */}
      <div className="space-y-4 mb-8 pt-4 border-t border-white/5">
         <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Game Mode</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/50 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setGameMode('survivor')}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${gameMode === 'survivor' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Survivor
                </button>
                <button 
                  onClick={() => setGameMode('points')}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${gameMode === 'points' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Points
                </button>
            </div>
         </div>

         <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
              onClick={() => setOneListenOnly(!oneListenOnly)}>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-white uppercase flex items-center gap-2">
                 One Listen Only
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
               </span>
               <span className="text-[8px] font-medium text-slate-500 uppercase tracking-tighter">Snippet plays once per turn</span>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${oneListenOnly ? 'bg-rose-600' : 'bg-slate-800'}`}>
               <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${oneListenOnly ? 'left-6' : 'left-1'}`} />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className={`flex flex-col gap-2 p-4 bg-slate-950/50 rounded-2xl border transition-all cursor-pointer group ${shuffleMode ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5'}`}
                 onClick={() => setShuffleMode(!shuffleMode)}>
              <div className="flex items-center justify-between">
                <Shuffle size={14} className={shuffleMode ? 'text-rose-500' : 'text-slate-500'} />
                <div className={`w-10 h-5 rounded-full relative transition-colors ${shuffleMode ? 'bg-rose-600' : 'bg-slate-800'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${shuffleMode ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase">Shuffle</span>
                <span className="text-[8px] font-medium text-slate-500 uppercase tracking-tighter">Random 20s Clip</span>
              </div>
            </div>

            <div className={`flex flex-col gap-2 p-4 bg-slate-950/50 rounded-2xl border transition-all cursor-pointer group ${hardMode ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5'}`}
                 onClick={() => setHardMode(!hardMode)}>
              <div className="flex items-center justify-between">
                <Zap size={14} className={hardMode ? 'text-rose-500' : 'text-slate-500'} />
                <div className={`w-10 h-5 rounded-full relative transition-colors ${hardMode ? 'bg-rose-600' : 'bg-slate-800'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hardMode ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase">Hard Mode</span>
                <span className="text-[8px] font-medium text-slate-500 uppercase tracking-tighter">10s Snippet Only</span>
              </div>
            </div>
         </div>
      </div>

      <button
        onClick={() => {
          setupGame(playerNames, gameMode, oneListenOnly, shuffleMode, hardMode, params.id ? parseInt(params.id) : undefined);
        }}
        className="w-full py-4 bg-rose-600 text-white rounded-xl font-black shadow-xl shadow-rose-900/20 uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
      >
        <UserPlus size={20} />
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
              {state.mode === 'survivor' ? (
                [...Array(3)].map((_, i) => (
                   <div key={i} className={`w-2 h-2 rounded-full ${i < activePlayer.lives ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-slate-800'}`} />
                ))
              ) : (
                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                   <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Unlimited Lives</span>
                </div>
              )}
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
                   disabled={!isReady || (state.oneListenOnly && state.listenedCurrentRound && !isPlaying)}
                   className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${
                    isPlaying 
                      ? 'bg-rose-500 text-white shadow-2xl scale-110' 
                      : !isReady || (state.oneListenOnly && state.listenedCurrentRound) ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-950 shadow-xl'
                  }`}
                >
                  {!isReady && playerStatus !== 'error' ? (
                     <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                  ) : isPlaying ? (
                    state.oneListenOnly ? <Square className="fill-current w-7 h-7" /> : <Pause className="fill-current w-7 h-7" />
                  ) : playerStatus === 'error' ? (
                    <RotateCcw className="w-7 h-7" onClick={(e) => { e.stopPropagation(); prepare(state.mysteryCard!.youtubeId, true); }} />
                  ) : (
                    <Play className={`fill-current w-7 h-7 ml-1 ${(state.oneListenOnly && state.listenedCurrentRound) ? 'opacity-20' : ''}`} />
                  )}
                </button>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  {playerStatus === 'loading' ? 'Loading' : playerStatus === 'error' ? 'Tap to Retry' : isPlaying ? (state.oneListenOnly ? 'Stop' : 'Pause') : (state.oneListenOnly && state.listenedCurrentRound) ? 'Listen Used' : 'Play Snippet'}
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
        {playerStatus === 'error' && state.mysteryCard && (
           <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-full max-w-sm p-8 bg-slate-900 border border-rose-500/30 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl">
                 <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
                    <AlertCircle className="text-rose-500 w-8 h-8" />
                 </div>
                 
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Connection Blocked</h3>
                 
                 <div className="p-4 bg-black/40 rounded-2xl border border-white/5 w-full mb-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Failing Song:</p>
                    <p className="text-sm font-bold text-white mb-2">{state.mysteryCard.name}</p>
                    <p className="text-[8px] font-medium text-slate-500 break-all opacity-50">
                       https://youtube.com/watch?v={state.mysteryCard.youtubeId}
                    </p>
                 </div>

                 <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mb-8">
                    YouTube is blocking this specific stream. You can retry or skip this song to keep the game going.
                 </p>

                 <div className="flex flex-col gap-3 w-full">
                    <button 
                      onClick={() => prepare(state.mysteryCard!.youtubeId, true)}
                      className="w-full py-4 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                       Try Reconnecting
                    </button>
                    <button 
                      onClick={skipCurrentMystery}
                      className="w-full py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                    >
                       Skip This Card
                    </button>
                 </div>
              </div>
           </div>
        )}

        {state.status === 'revealing' && state.lastResult && showResultModal && (
           <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 ${
             state.lastResult.success ? 'bg-emerald-950/95' : 'bg-rose-950/95'
           } backdrop-blur-xl`}>
              
              {/* STATUS ICON */}
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl animate-bounce border ${
                state.lastResult.success ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400'
              }`}>
                 {state.lastResult.success ? <Music className="text-white w-10 h-10" /> : <Music className="text-white w-10 h-10 opacity-50" />}
              </div>

              <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2 text-center">
                 {state.lastResult.success ? 'Brilliant!' : 'Nope!'}
              </h2>
              
              <div className="flex flex-col items-center gap-1 mb-10">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Correct Year</span>
                 <span className="text-6xl font-black text-white tabular-nums tracking-tighter leading-none">{state.lastResult.correctYear}</span>
              </div>

              {/* SONG METADATA */}
              <div className="flex flex-col items-center gap-4 mb-10 text-center px-6 max-w-md">
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Artist & Title</span>
                    <h3 className="text-2xl font-black text-white leading-tight italic">
                       {state.mysteryCard.name}
                    </h3>
                 </div>
                 <div className="w-10 h-px bg-white/10" />
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Source / Placement</span>
                    <p className="text-sm font-bold text-rose-500 uppercase tracking-widest">
                       {state.mysteryCard.info}
                    </p>
                 </div>
              </div>

              {/* HANDOVER / NEXT INFO */}
              <div className="w-full max-w-sm p-8 bg-black/20 border border-white/5 rounded-[2.5rem] flex flex-col items-center gap-4 mb-10 shadow-inner">
                 {state.players.length > 1 ? (
                   <>
                     <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Pass the device to</span>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{getNextLivingPlayer()?.name}</h3>
                     </div>
                     <div className="w-full h-px bg-white/5 my-2" />
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                        {isMatchEnding ? 'Match Point!' : 'Next Turn'}
                     </p>
                   </>
                 ) : (
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phase Result</span>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                         {state.lastResult.success ? '+100 Points' : 'Life Lost'}
                      </h3>
                   </div>
                 )}
              </div>

              {/* ACTIONS */}
              <div className="w-full max-w-xs flex flex-col gap-3">
                 {isMatchEnding ? (
                    <>
                      <button 
                        onClick={() => setIsSoloContinuing(true)}
                        className="w-full py-4 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600/30 transition-all"
                      >
                         Keep Playing Solo
                      </button>
                      <button 
                         onClick={endGame} 
                         className="w-full py-5 bg-white text-slate-950 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                      >
                         End Match
                      </button>
                    </>
                 ) : (
                    <button 
                      onClick={proceedToNextPlayer}
                      className="w-full py-6 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                       {state.players.length > 1 ? `I'm ${getNextLivingPlayer()?.name}!` : 'Next Card'}
                    </button>
                 )}
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
